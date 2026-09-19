"use strict";

/* ------------------------------------------------------------------
   rules.js — Distraction Detection Engine & Target Filters
   ------------------------------------------------------------------ */

const DEFAULT_CONFIG = {
  enabled: true,
  /* "close" executes dismissal. "nag" displays advisory warnings only. */
  mode: "close",
  countdownSeconds: 3,
  snoozeMinutes: 5,
  pollMs: 1000,

  /* User name configured in Settings Panel. Blank defaults to system username. */
  userName: "",

  /* Active companion avatar: "cat" | "panda" | "puppy" */
  skin: "cat",
  never: ["zoom meeting", "microsoft teams", "google meet", "visual studio code"],

  rules: [
    {
      id: "youtube-shorts",
      label: "YouTube Shorts Feed",
      any: ["youtube.com/shorts"],
      grace: 6,
      action: "tab"
    },
    {
      id: "instagram-reels",
      label: "Instagram Reels",
      any: ["instagram.com/reel"],
      grace: 6,
      action: "tab"
    },
    {
      id: "tiktok",
      label: "TikTok Media",
      any: ["tiktok.com"],
      grace: 6,
      action: "tab"
    },
    {
      id: "facebook-reels",
      label: "Facebook Reels & Watch",
      any: ["facebook.com/reel", "facebook.com/watch", "fb.watch"],
      grace: 10,
      action: "tab"
    },
    {
      id: "snapchat",
      label: "Snapchat Web",
      any: ["snapchat.com"],
      grace: 15,
      action: "tab"
    },
    {
      id: "streaming",
      label: "Video Streaming Hubs",
      any: [
        "netflix.com", "netflix",
        "primevideo.com", "prime video",
        "hotstar.com", "hotstar",
        "disneyplus.com", "disney+",
        "crunchyroll",
        "hulu.com",
        "jiocinema", "sonyliv", "zee5", "aha.video", "mxplayer",
        "peacocktv.com", "tv.apple.com", "max.com/video"
      ],
      grace: 20,
      action: "tab"
    },
    {
      id: "instagram",
      label: "Instagram Feed",
      any: ["instagram.com"],
      grace: 45,
      action: "tab"
    },
    {
      id: "reddit",
      label: "Reddit Feed",
      any: ["reddit.com"],
      grace: 90,
      action: "tab"
    },
    {
      id: "youtube-watch",
      label: "YouTube Long-form",
      any: ["youtube.com/watch", "- youtube"],
      grace: 240,
      action: "tab"
    }
  ]
};

/* Web browser processes receive tab closure (Ctrl+W); other applications receive standard window termination. */
const BROWSERS = new Set([
  "chrome", "msedge", "firefox", "brave", "opera", "vivaldi",
  "arc", "chromium", "librewolf", "zen"
]);

function normalise(s) {
  return String(s || "").toLowerCase();
}

/* Returns the first matching rule, or null. */
function match(config, snapshot) {
  if (!config.enabled) { return null; }

  const title = normalise(snapshot.title);
  const proc = normalise(snapshot.proc);
  const url = normalise(snapshot.url);

  const hay = url + " | " + title + " | " + proc;

  if (!title && !url) { return null; }

  for (const pattern of config.never || []) {
    if (hay.includes(normalise(pattern))) { return null; }
  }

  for (const rule of config.rules || []) {
    const all = rule.all || [];
    const any = rule.any || [];

    const allHit = all.every((p) => hay.includes(normalise(p)));
    const anyHit = any.length === 0 || any.some((p) => hay.includes(normalise(p)));

    if (all.length + any.length > 0 && allHit && anyHit) {
      return rule;
    }
  }
  return null;
}

function actionFor(rule, snapshot) {
  const proc = normalise(snapshot.proc);
  if (rule.action === "close") { return "close"; }
  return BROWSERS.has(proc) ? "tab" : "close";
}

function validRule(rule) {
  if (!rule || typeof rule !== "object" || Array.isArray(rule)) { return false; }
  if (typeof rule.id !== "string" || !rule.id) { return false; }
  const all = Array.isArray(rule.all) ? rule.all : [];
  const any = Array.isArray(rule.any) ? rule.any : [];
  return all.length + any.length > 0;
}

function withDefaults(partial) {
  const cfg = Object.assign({}, DEFAULT_CONFIG, partial || {});
  const dropped = [];

  if (Array.isArray(cfg.rules)) {
    cfg.rules = cfg.rules.filter((r, i) => {
      if (validRule(r)) { return true; }
      dropped.push(r && r.id ? r.id : "rule #" + i);
      return false;
    });
  }
  if (!Array.isArray(cfg.rules) || !cfg.rules.length) {
    cfg.rules = DEFAULT_CONFIG.rules;
  }
  if (!Array.isArray(cfg.never)) { cfg.never = DEFAULT_CONFIG.never; }

  cfg.rules.forEach((r) => {
    if (typeof r.grace !== "number" || r.grace < 0) { r.grace = 10; }
  });

  Object.defineProperty(cfg, "__dropped", { value: dropped, enumerable: false });
  return cfg;
}

module.exports = { DEFAULT_CONFIG, match, actionFor, withDefaults, validRule, BROWSERS };
