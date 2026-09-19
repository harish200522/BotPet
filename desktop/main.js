"use strict";

/* ------------------------------------------------------------------
   main.js — the Electron main process
   ------------------------------------------------------------------
   Owns three things:
     1. the transparent overlay strip along the bottom of the screen
     2. the foreground-window monitor and the rule evaluation on top
     3. the tray menu

   The renderer never sees a window handle or gets to close anything on
   its own -- it asks, and main re-verifies before the paw lands.
------------------------------------------------------------------ */

const { app, BrowserWindow, Tray, Menu, screen, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const { Monitor } = require("./monitor");
const enforcer = require("./enforcer");
const rulesLib = require("./rules");

const OVERLAY_HEIGHT = 260;
const DIAGNOSE = process.argv.includes("--diagnose");
const COOLDOWN_MS = 12000;        // after acting, ignore the same window briefly

let win = null;
let tray = null;
let monitor = null;
let config = rulesLib.DEFAULT_CONFIG;
let configPath = null;

let lastMatchId = null;
let matchSince = 0;
let configError = null;
let snoozeUntil = 0;
let cooldownUntil = 0;
let pendingKey = null;            // the window we have already reacted to
const trail = [];                 // recent decisions, surfaced by --diagnose

function note(event, detail) {
  trail.push(Object.assign({ at: new Date().toISOString(), event }, detail || {}));
  if (trail.length > 20) { trail.shift(); }
  if (DIAGNOSE) { console.log("[botpet] " + event, JSON.stringify(detail || {})); }
}

/* ---------------------------------------------------------------
   config
--------------------------------------------------------------- */
function loadConfig() {
  configPath = path.join(app.getPath("userData"), "config.json");
  try {
    if (fs.existsSync(configPath)) {
      // Notepad, Set-Content and most Windows editors write UTF-8 with a
      // BOM, and JSON.parse throws on it. Since the whole point of this
      // file is that people hand-edit it, strip it.
      const text = fs.readFileSync(configPath, "utf8").replace(/^﻿/, "");
      config = rulesLib.withDefaults(JSON.parse(text));
      if (config.__dropped && config.__dropped.length) {
        console.error("[botpet] ignoring unusable rules: " + config.__dropped.join(", ") +
          " (each rule needs an id and a non-empty all/any list)");
      }
    } else {
      config = rulesLib.withDefaults({});
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    }
  } catch (err) {
    console.error("[botpet] config unreadable, using defaults:", err.message);
    config = rulesLib.withDefaults({});
    configError = err.message;
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
  } catch (err) {
    console.error("[botpet] could not save config:", err.message);
  }
}

/* ---------------------------------------------------------------
   overlay window
--------------------------------------------------------------- */
function createWindow() {
  const area = screen.getPrimaryDisplay().workArea;

  win = new BrowserWindow({
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,           // never steals focus from what you are doing
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  win.setAlwaysOnTop(true, "floating");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // click-through by default; the renderer opts in when you hover the cat
  win.setIgnoreMouseEvents(true, { forward: true });

  // Windows cursor tracking: poll cursor to send relative coordinates to renderer
  setInterval(() => {
    if (!win || win.isDestroyed()) { return; }
    const cursor = screen.getCursorScreenPoint();
    const bounds = win.getBounds();
    const relX = cursor.x - bounds.x;
    const relY = cursor.y - bounds.y;
    if (relX >= 0 && relX <= bounds.width && relY >= 0 && relY <= bounds.height) {
      win.webContents.send("cursor-pos", { x: relX, y: relY });
    } else {
      win.webContents.send("cursor-pos", { x: -999, y: -999 });
    }
  }, 60);

  win.loadFile(path.join(__dirname, "pet.html"));
  win.once("ready-to-show", () => win.showInactive());

  // the overlay has no devtools you can click into, so surface renderer
  // errors on the main process stdout where they are actually visible
  win.webContents.on("console-message", (_e, level, message, line, source) => {
    if (level >= 2) {
      console.error("[botpet overlay] " + message + " (" + source + ":" + line + ")");
    }
  });
  win.webContents.on("render-process-gone", (_e, details) =>
    console.error("[botpet overlay] renderer gone:", details.reason));

  // `--diagnose` writes a PNG of the overlay plus a state dump next to
  // the app. A transparent, always-on-top window is invisible to most
  // screen-capture APIs, so this is the only reliable way to see what
  // the cat is actually doing.
  if (DIAGNOSE) { win.once("ready-to-show", () => setInterval(diagnose, 2500)); }

  // keep the strip glued to the bottom if the display changes
  screen.on("display-metrics-changed", reposition);
  screen.on("display-added", reposition);
  screen.on("display-removed", reposition);
}

function reposition() {
  if (!win || win.isDestroyed()) { return; }
  const area = screen.getPrimaryDisplay().workArea;
  win.setBounds({
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height
  });
}

async function diagnose() {
  const dir = path.join(__dirname, "..");
  try {
    const image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(dir, ".shot-pet.png"), image.toPNG());

    const state = await win.webContents.executeJavaScript(`(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      catState: window.Cat && Cat.getState(),
      petTransform: getComputedStyle(document.getElementById("pet")).transform,
      bodyPath: (document.getElementById("body") || {}).getAttribute
        ? document.getElementById("body").getAttribute("d").slice(0, 24) : null,
      bubbleHidden: document.getElementById("bubble").hidden
    }))()`);

    state.trail = trail.slice(-8);
    state.mode = config.mode;
    state.configError = configError;
    state.ruleCount = config.rules.length;
    state.foreground = monitor && monitor.current
      ? {
          title: monitor.current.title,
          url: monitor.current.url,
          proc: monitor.current.proc,
          heldByRule: Math.round((Date.now() - matchSince) / 1000)
        }
      : null;
    fs.writeFileSync(path.join(dir, ".shot-pet.json"), JSON.stringify(state, null, 2));
    console.log("[botpet] diagnose written");
  } catch (err) {
    fs.writeFileSync(path.join(dir, ".shot-pet.json"),
      JSON.stringify({ error: err.message }, null, 2));
  }
}

function send(channel, payload) {
  if (win && !win.isDestroyed()) { win.webContents.send(channel, payload); }
}

/* ---------------------------------------------------------------
   the watch
--------------------------------------------------------------- */
function keyOf(snapshot) {
  return snapshot.hwnd + "|" + snapshot.title + "|" + (snapshot.url || "");
}

function startMonitor() {
  monitor = new Monitor({ pollMs: config.pollMs });

  monitor.on("error", (err) => console.error("[botpet monitor]", err.message));

  monitor.on("change", () => { pendingKey = null; });

  monitor.on("tick", (snapshot) => {
    const now = Date.now();
    if (now < snoozeUntil || now < cooldownUntil) { return; }

    const rule = rulesLib.match(config, snapshot);
    if (!rule) {
      lastMatchId = null;
      send("status", { watching: false });
      return;
    }

    // The clock runs per matched rule, not per window: switching from a
    // work tab to Reels inside an already-focused browser has to start
    // the grace at zero, and swiping to the next reel must not.
    const matchId = rule.id + "|" + snapshot.hwnd;
    if (lastMatchId !== matchId) {
      lastMatchId = matchId;
      matchSince = now;
      note("matched", { rule: rule.id, url: snapshot.url, title: snapshot.title, grace: rule.grace });
    }
    const held = (now - matchSince) / 1000;

    const key = keyOf(snapshot);
    const remaining = Math.max(0, rule.grace - held);

    if (remaining > 0) {
      // the cat notices before it acts: this is what drives the ears
      // going back a few seconds before anything closes
      send("status", { watching: true, label: rule.label, remaining });
      return;
    }
    if (pendingKey === key) { return; }
    pendingKey = key;
    note("bust", { rule: rule.id, url: snapshot.url, title: snapshot.title, mode: config.mode });

    send("bust", {
      rule: { id: rule.id, label: rule.label },
      target: snapshot,
      mode: config.mode,
      countdown: Math.max(0, config.countdownSeconds)
    });
  });

  monitor.start();
}

/* ---------------------------------------------------------------
   ipc
--------------------------------------------------------------- */
ipcMain.handle("act", async (_e, { target, mode }) => {
  if (config.mode !== "close") {
    return { acted: false, reason: "nag-mode" };
  }
  const rule = rulesLib.match(config, target) || {};
  const action = rulesLib.actionFor(rule, target);
  const result = await enforcer.closeTarget(target, action);
  note("act", { action, acted: result.acted, reason: result.reason || null, title: target.title });

  cooldownUntil = Date.now() + COOLDOWN_MS;
  pendingKey = null;
  return result;
});

ipcMain.handle("snooze", () => {
  snoozeUntil = Date.now() + config.snoozeMinutes * 60 * 1000;
  pendingKey = null;
  refreshTray();
  return { until: snoozeUntil };
});

ipcMain.on("set-interactive", (_e, on) => {
  if (!win || win.isDestroyed()) { return; }
  win.setIgnoreMouseEvents(!on, { forward: true });
});

ipcMain.handle("get-user-name", () => {
  return config.userName || process.env.USERNAME || "Friend";
});

ipcMain.handle("get-skin", () => {
  return config.skin || "cat";
});

/* ---------------------------------------------------------------
   tray
--------------------------------------------------------------- */
function refreshTray() {
  if (!tray) { return; }
  const { trayIcon } = require("./tray-icon");
  const snoozing = Date.now() < snoozeUntil;
  const paused = !config.enabled || snoozing;

  tray.setImage(trayIcon(paused));
  tray.setToolTip(paused ? "BotPet — Paused" : "BotPet — Active Vigilance");

  const minsLeft = snoozing ? Math.ceil((snoozeUntil - Date.now()) / 60000) : 0;

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: snoozing ? `Snoozed (${minsLeft} min left)` : (config.enabled ? "Active Monitoring" : "Paused"), enabled: false },
    { type: "separator" },
    {
      label: "Enable Guardian",
      type: "checkbox",
      checked: config.enabled,
      click: (item) => { config.enabled = item.checked; saveConfig(); refreshTray(); }
    },
    {
      label: "Auto-Dismiss Distractions",
      type: "radio",
      checked: config.mode === "close",
      click: () => { config.mode = "close"; saveConfig(); refreshTray(); }
    },
    {
      label: "Advisory Warning Only",
      type: "radio",
      checked: config.mode === "nag",
      click: () => { config.mode = "nag"; saveConfig(); refreshTray(); }
    },
    { type: "separator" },
    {
      label: snoozing ? "Cancel Pause" : `Pause Focus (${config.snoozeMinutes} min)`,
      click: () => {
        snoozeUntil = snoozing ? 0 : Date.now() + config.snoozeMinutes * 60 * 1000;
        refreshTray();
      }
    },
    {
      label: win && win.isVisible() ? "Hide Companion" : "Show Companion",
      click: () => {
        if (!win) { return; }
        if (win.isVisible()) { win.hide(); } else { win.show(); }
        refreshTray();
      }
    },
    { type: "separator" },
    { label: "BotPet Preferences…", click: openSettings },
    { label: "Open config.json…", click: () => shell.openPath(configPath) },
    { label: "Reload Filter Rules", click: () => { loadConfig(); refreshTray(); } },
    { type: "separator" },
    { label: "Quit BotPet", click: () => { app.quit(); } }
  ]));
}

function createTray() {
  const { trayIcon } = require("./tray-icon");
  tray = new Tray(trayIcon(false));
  refreshTray();
  setInterval(refreshTray, 30000);   // keeps the snooze countdown honest
}

/* ---------------------------------------------------------------
   Settings Window
--------------------------------------------------------------- */
let settingsWin = null;
function openSettings() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.show();
    settingsWin.focus();
    return;
  }
  const area = screen.getPrimaryDisplay().workArea;
  settingsWin = new BrowserWindow({
    width: 840,
    height: 700,
    x: Math.round(area.x + (area.width - 840) / 2),
    y: Math.round(area.y + (area.height - 700) / 2),
    title: "BotPet — Settings",
    backgroundColor: "#0b0e14",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false
    }
  });
  settingsWin.loadURL("http://127.0.0.1:5178/settings/settings.html");
}

/* ---------------------------------------------------------------
   CLI & local control server (http://127.0.0.1:5179)
--------------------------------------------------------------- */
const http = require("http");

function startControlServer() {
  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, *");

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    const url = new URL(req.url, "http://127.0.0.1:5179");
    const action = url.pathname.replace(/^\//, "");
    const q = Object.fromEntries(url.searchParams.entries());

    if (action === "status") {
      res.end(JSON.stringify({
        ok: true,
        mode: config.mode,
        enabled: config.enabled,
        snoozed: Date.now() < snoozeUntil,
        ruleCount: config.rules.length,
        rules: config.rules.map(r => ({ id: r.id, label: r.label, grace: r.grace }))
      }));
      return;
    }

    if (action === "settings") {
      openSettings();
      res.end(JSON.stringify({ ok: true, opened: "settings" }));
      return;
    }

    if (action === "capture_settings") {
      if (settingsWin && !settingsWin.isDestroyed()) {
        settingsWin.webContents.capturePage().then(img => {
          fs.writeFileSync(path.join(__dirname, "..", ".shot-settings.png"), img.toPNG());
          res.end(JSON.stringify({ ok: true, saved: ".shot-settings.png" }));
        }).catch(err => res.end(JSON.stringify({ ok: false, error: err.message })));
        return;
      }
      res.end(JSON.stringify({ ok: false, error: "settingsWin not open" }));
      return;
    }

    if (action === "eval_settings") {
      if (settingsWin && !settingsWin.isDestroyed()) {
        settingsWin.webContents.executeJavaScript(q.code || "")
          .then(result => res.end(JSON.stringify({ ok: true, result })))
          .catch(err => res.end(JSON.stringify({ ok: false, error: err.message })));
        return;
      }
      res.end(JSON.stringify({ ok: false, error: "settingsWin not open" }));
      return;
    }

    if (action === "diagnose_now") {
      diagnose().then(() => {
        res.end(JSON.stringify({ ok: true }));
      }).catch(err => res.end(JSON.stringify({ ok: false, error: err.message })));
      return;
    }

    if (action === "rules") {
      res.end(JSON.stringify({ ok: true, rules: config.rules }));
      return;
    }

    if (action === "mode" && q.val) {
      if (q.val === "close" || q.val === "nag") {
        config.mode = q.val;
        saveConfig();
        refreshTray();
        res.end(JSON.stringify({ ok: true, mode: config.mode }));
        return;
      }
    }

    if (action === "get_config") {
      res.end(JSON.stringify(config));
      return;
    }

    if (action === "save_config") {
      let body = "";
      req.on("data", chunk => { body += chunk; });
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body || "{}");
          if (parsed.cfg) {
            config = rulesLib.withDefaults(parsed.cfg);
            if (parsed.cfg.userName !== undefined) {
              config.userName = (parsed.cfg.userName || "").trim();
            }
            saveConfig();
            refreshTray();
            res.end(JSON.stringify({ ok: true }));
          } else {
            res.end(JSON.stringify({ ok: false, error: "missing cfg" }));
          }
        } catch (e) {
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }

    if (action === "preview_bust") {
      send("bust", {
        rule: { id: "test", label: "YouTube Shorts" },
        target: { title: "YouTube Shorts", url: "youtube.com/shorts", proc: "chrome" },
        mode: config.mode,
        countdown: 3
      });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (action === "set_cat_visible") {
      if (win) {
        if (q.visible === "false") { win.hide(); }
        else { win.showInactive(); }
      }
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (action === "snooze") {
      const mins = parseInt(q.mins, 10) || config.snoozeMinutes;
      snoozeUntil = Date.now() + mins * 60 * 1000;
      refreshTray();
      send("cli-command", { cmd: "say", text: `Snoozed for ${mins}m ☕` });
      res.end(JSON.stringify({ ok: true, snoozedMinutes: mins }));
      return;
    }

    if (action === "name") {
      const name = (q.text !== undefined ? q.text : "").trim();
      config.userName = name;
      saveConfig();
      const displayName = config.userName || process.env.USERNAME || "Friend";
      send("cli-command", { cmd: "name", text: displayName });
      res.end(JSON.stringify({ ok: true, userName: displayName }));
      return;
    }

    if (action === "wake") {
      if (q.text && q.text.trim()) {
        config.userName = q.text.trim();
        saveConfig();
      }
      const displayName = config.userName || (q.text && q.text.trim()) || process.env.USERNAME || "Friend";
      send("cli-command", { cmd: "wake", text: displayName });
      res.end(JSON.stringify({ ok: true, woken: true, userName: displayName }));
      return;
    }

    if (action === "drop") {
      const fromY = parseInt(q.y, 10) || 40;
      send("cli-command", { cmd: "drop", fromY });
      res.end(JSON.stringify({ ok: true, droppedFrom: fromY }));
      return;
    }

    if (action === "skin") {
      const valid = ["cat", "panda", "puppy", "penguin", "sugarglider"];
      const name = (q.name || "cat").toLowerCase().trim();
      if (!valid.includes(name)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: "Unknown skin: " + name + ". Valid: " + valid.join(", ") }));
        return;
      }
      config.skin = name;
      saveConfig();
      send("cli-command", { cmd: "skin", skin: name });
      res.end(JSON.stringify({ ok: true, skin: name }));
      return;
    }

    if (action === "eval") {
      const code = q.code || "";
      if (code) {
        win.webContents.executeJavaScript(code)
          .then(result => res.end(JSON.stringify({ ok: true, result })))
          .catch(e => res.end(JSON.stringify({ ok: false, error: e.message })));
        return;
      }
      let body = "";
      req.on("data", chunk => { body += chunk; });
      req.on("end", () => {
        win.webContents.executeJavaScript(body)
          .then(result => res.end(JSON.stringify({ ok: true, result })))
          .catch(e => res.end(JSON.stringify({ ok: false, error: e.message })));
      });
      return;
    }

    const validActions = ["sit", "walk", "sleep", "angry", "pat", "bored", "swipe", "say", "focus", "break", "resume", "theme", "ears", "speed", "wake", "name", "drop", "skin"];
    if (validActions.includes(action)) {
      send("cli-command", { cmd: action, text: q.text, mins: parseInt(q.mins, 10) });
      res.end(JSON.stringify({ ok: true, command: action, text: q.text || null }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "unknown command: " + action }));
  });

  server.on("error", (err) => {
    console.error("[botpet control server]", err.message);
  });

  server.listen(5179, "0.0.0.0", () => {
    console.log("[botpet] CLI control server listening on port 5179");
  });
}

/* ---------------------------------------------------------------
   lifecycle
--------------------------------------------------------------- */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(() => {
    loadConfig();
    createWindow();
    createTray();
    startMonitor();
    startControlServer();
  });
}

app.on("window-all-closed", (e) => { e.preventDefault(); });  // tray app: keep running

app.on("before-quit", () => {
  if (monitor) { monitor.stop(); }
});
