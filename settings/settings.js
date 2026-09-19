"use strict";

/* ------------------------------------------------------------------
   settings.js — Auden FX High-Fidelity Controller & 3D WebGL Engine
   ------------------------------------------------------------------ */
(function () {
  const API_SERVER = (window.location.protocol || "http:") + "//" + (window.location.hostname || "127.0.0.1") + ":5179";

  const defaultCfg = {
    enabled: true,
    mode: "close",
    countdownSeconds: 3,
    snoozeMinutes: 5,
    pollMs: 1000,
    urlPollMs: 1500,
    userName: "",
    skin: "cat",
    never: ["zoom meeting", "microsoft teams", "google meet", "visual studio code"],
    cat: { scale: 1.25, speed: 1, wander: true, sleepy: true, darkFur: false, pinkEars: false },
    rules: [
      { id: "youtube-shorts", label: "YouTube Shorts", any: ["youtube.com/shorts"], all: [], grace: 6, action: "tab", enabled: true },
      { id: "instagram-reels", label: "Instagram Reels", any: ["instagram.com/reel"], all: [], grace: 6, action: "tab", enabled: true },
      { id: "tiktok", label: "TikTok Feed", any: ["tiktok.com"], all: [], grace: 6, action: "tab", enabled: true },
      { id: "streaming", label: "Video Streaming", any: ["netflix.com", "crunchyroll", "hotstar"], all: [], grace: 20, action: "tab", enabled: true },
      { id: "youtube-watch", label: "YouTube Video", any: ["youtube.com/watch", "- youtube"], all: [], grace: 240, action: "tab", enabled: true }
    ]
  };

  const bridge = (() => {
    let localCfg = null;
    return async (cmd, args) => {
      if (cmd === "get_config") {
        try {
          const r = await fetch(API_SERVER + "/get_config");
          localCfg = await r.json();
          return localCfg;
        } catch (_) {
          return defaultCfg;
        }
      }
      if (cmd === "save_config") {
        try {
          await fetch(API_SERVER + "/save_config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cfg: args.cfg })
          });
        } catch (_) {}
        return null;
      }
      if (cmd === "preview_state") {
        fetch(API_SERVER + "/" + args.name).catch(() => {});
        return null;
      }
      if (cmd === "preview_bust") {
        fetch(API_SERVER + "/preview_bust").catch(() => {});
        return null;
      }
      if (cmd === "set_cat_visible") {
        fetch(API_SERVER + "/set_cat_visible?visible=" + args.visible).catch(() => {});
        return null;
      }
      if (cmd === "reset_rules") {
        return defaultCfg.rules;
      }
      if (cmd === "get_progress") {
        return { level: 1, xp: 10, needed: 50, totalXp: 10, closes: 0, pats: 2 };
      }
      if (cmd === "status") {
        try {
          const r = await fetch(API_SERVER + "/status");
          const s = await r.json();
          return {
            enabled: s.enabled,
            mode: s.mode,
            snoozing: s.snoozed,
            snoozeSecondsLeft: 0,
            foreground: { title: "Active Desktop Screen", url: "desktop", proc: "explorer" },
            haystack: "monitoring active",
            matched: s.mode === "close" ? "Auto-Dismiss Active" : "Advisory Mode",
            remaining: 0,
            trail: []
          };
        } catch (_) {
          return { enabled: true, mode: "close", snoozing: false, snoozeSecondsLeft: 0, trail: [] };
        }
      }
      return null;
    };
  })();

  const invoke = bridge;

  const $ = (id) => document.getElementById(id);
  const el = {
    enabled: $("enabled"),
    modeClose: $("modeClose"),
    modeNag: $("modeNag"),
    countdown: $("countdown"),
    snoozeMinutes: $("snoozeMinutes"),
    pollMs: $("pollMs"),
    urlPollMs: $("urlPollMs"),
    never: $("neverList"),
    ruleRows: $("ruleRows"),
    catScale: $("catScale"),
    catSpeed: $("catSpeed"),
    catScaleOut: $("catScaleOut"),
    catSpeedOut: $("catSpeedOut"),
    catWander: $("catWander"),
    catSleepy: $("catSleepy"),
    catDarkFur: $("catDarkFur"),
    catPinkEars: $("catPinkEars"),
    userName: $("userName"),
    wakeGreetBtn: $("wakeGreetBtn"),
    savedPill: $("savedPill"),
    brandState: $("brandState"),
    sysStatusText: $("sysStatusText"),
    liveIsoClock: $("liveIsoClock")
  };

  let cfg = null;
  let loading = true;

  /* ---------------- Live ISO Clock (Auden FX Requirement) ---------------- */
  function updateIsoClock() {
    if (el.liveIsoClock) {
      el.liveIsoClock.textContent = new Date().toISOString();
    }
  }
  setInterval(updateIsoClock, 50);
  updateIsoClock();

  /* ---------------- Three.js 3D WebGL Scene (Auden FX Requirement) ---------------- */
  function initThreeHeroScene() {
    const canvas = document.getElementById("threeWebglCanvas");
    if (!canvas || typeof THREE === "undefined") return;

    const parent = canvas.parentElement;
    const width = parent.clientWidth || 600;
    const height = parent.clientHeight || 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 8.5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 1. Wireframe Icosahedron Mesh (Auden FX requirement: IcosahedronGeometry(3,2), wireframe color #8b3a2a)
    const geometry = new THREE.IcosahedronGeometry(3.2, 2);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b3a2a,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    scene.add(wireframeMesh);

    // 2. Inner dark core sphere
    const innerGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x24120e,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // 3. Ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    let clock = 0;
    function animate() {
      requestAnimationFrame(animate);
      clock += 0.015;

      // Sinusoidal floating & smooth rotation
      wireframeMesh.rotation.y += 0.005;
      wireframeMesh.rotation.x += 0.0025;
      wireframeMesh.position.y = Math.sin(clock) * 0.25;

      innerMesh.rotation.y -= 0.003;
      innerMesh.rotation.x -= 0.002;
      innerMesh.position.y = Math.sin(clock) * 0.25;

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
      const w = parent.clientWidth || 600;
      const h = parent.clientHeight || 220;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  /* ---------------- Navigation & Panel Transitions ---------------- */
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((b) => {
        b.classList.remove("is-active");
        b.removeAttribute("aria-current");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-current", "true");

      const targetPanel = btn.dataset.panel;
      document.querySelectorAll(".panel-section").forEach((p) => {
        const isMatch = p.dataset.panel === targetPanel;
        if (isMatch) {
          p.classList.add("is-on");
          if (typeof gsap !== "undefined") {
            gsap.fromTo(p, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
          }
        } else {
          p.classList.remove("is-on");
        }
      });
    });
  });

  /* ---------------- Avatar Mounts ---------------- */
  function mountAvatars() {
    try {
      if (window.CatRig && window.Cat) {
        CatRig.mount(document.getElementById("brandMount"));
        Cat.init({ state: "sit", roam: false });
      }
    } catch (_) {}

    try {
      if (window.CharacterManager) {
        CharacterManager.mount(document.getElementById("petPreviewMount"));
        CharacterManager.init({ state: "sit", roam: false });
      }
    } catch (_) {}
  }

  /* ---------------- Saving Feedback ---------------- */
  let saveTimer = null;
  function markSaved() {
    el.savedPill.hidden = false;
    clearTimeout(markSaved.t);
    markSaved.t = setTimeout(() => { el.savedPill.hidden = true; }, 1600);
  }

  function scheduleSave() {
    if (loading) { return; }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      collect();
      try {
        await invoke("save_config", { cfg });
        markSaved();
        paintBrand();
      } catch (err) {
        console.error("Save failed:", err);
      }
    }, 350);
  }

  /* ---------------- Form <-> Config Sync ---------------- */
  function paint() {
    loading = true;
    el.enabled.checked = cfg.enabled;
    el.modeClose.checked = cfg.mode === "close";
    el.modeNag.checked = cfg.mode !== "close";
    el.countdown.value = cfg.countdownSeconds;
    el.snoozeMinutes.value = cfg.snoozeMinutes;
    el.pollMs.value = cfg.pollMs;
    el.urlPollMs.value = cfg.urlPollMs;
    el.never.value = (cfg.never || []).join("\n");
    if (el.userName) { el.userName.value = cfg.userName || ""; }

    const cat = cfg.cat || {};
    el.catScale.value = cat.scale ?? 1.25;
    el.catSpeed.value = cat.speed ?? 1;
    el.catWander.checked = cat.wander !== false;
    el.catSleepy.checked = cat.sleepy !== false;
    el.catDarkFur.checked = cat.darkFur === true;
    el.catPinkEars.checked = cat.pinkEars === true;
    paintCatOut();

    renderRules();
    paintBrand();
    paintSkinCards();
    loading = false;
  }

  function paintCatOut() {
    el.catScaleOut.textContent = Number(el.catScale.value).toFixed(2);
    el.catSpeedOut.textContent = Number(el.catSpeed.value).toFixed(2);
  }

  function paintBrand() {
    if (!cfg.enabled) {
      el.brandState.textContent = "PAUSED";
      el.sysStatusText.textContent = "SYS.PAUSED // INACTIVE";
      return;
    }
    el.brandState.textContent = cfg.mode === "close" ? "GUARDING SCREEN" : "ADVISORY ALERT";
    el.sysStatusText.textContent = cfg.mode === "close" ? "SYS.ACTIVE // VIGILANCE" : "SYS.ACTIVE // ADVISORY";
  }

  function collect() {
    cfg.enabled = el.enabled.checked;
    cfg.mode = el.modeClose.checked ? "close" : "nag";
    cfg.countdownSeconds = clampNum(el.countdown.value, 0, 30, 3);
    cfg.snoozeMinutes = clampNum(el.snoozeMinutes.value, 1, 240, 5);
    cfg.pollMs = clampNum(el.pollMs.value, 250, 10000, 1000);
    cfg.urlPollMs = clampNum(el.urlPollMs.value, 500, 10000, 1500);
    cfg.never = el.never.value.split("\n").map((s) => s.trim()).filter(Boolean);
    if (el.userName) { cfg.userName = el.userName.value.trim(); }
    cfg.cat = {
      scale: Number(el.catScale.value),
      speed: Number(el.catSpeed.value),
      wander: el.catWander.checked,
      sleepy: el.catSleepy.checked,
      darkFur: el.catDarkFur.checked,
      pinkEars: el.catPinkEars.checked
    };
    cfg.rules = readRules();
  }

  function clampNum(v, lo, hi, fallback) {
    const n = Math.round(Number(v));
    if (!Number.isFinite(n)) { return fallback; }
    return Math.min(hi, Math.max(lo, n));
  }

  /* ---------------- Skin Selection ---------------- */
  function paintSkinCards() {
    const active = cfg.skin || "cat";
    document.querySelectorAll(".skin-card-btn").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.skin === active);
    });
    if (window.CharacterManager) {
      CharacterManager.setSkin(active);
    }
  }

  document.querySelectorAll(".skin-card-btn").forEach((card) => {
    card.addEventListener("click", () => {
      const name = card.dataset.skin;
      if (!name) { return; }
      cfg.skin = name;
      paintSkinCards();
      fetch(API_SERVER + "/skin?name=" + encodeURIComponent(name)).catch(() => {});
      collect();
      cfg.skin = name;
      invoke("save_config", { cfg }).catch(() => {});
      markSaved();
    });
  });

  /* ---------------- Rules Table ---------------- */
  function renderRules() {
    el.ruleRows.textContent = "";
    (cfg.rules || []).forEach((rule, i) => el.ruleRows.appendChild(ruleRow(rule, i)));
  }

  function ruleRow(rule, index) {
    const row = document.createElement("div");
    row.className = "rule-row-item" + (rule.enabled === false ? " is-disabled" : "");
    row.dataset.id = rule.id;

    const on = document.createElement("input");
    on.type = "checkbox";
    on.checked = rule.enabled !== false;
    on.title = "Toggle this rule";
    on.addEventListener("change", () => {
      row.classList.toggle("is-disabled", !on.checked);
      scheduleSave();
    });

    const label = input("text", rule.label || rule.id, "rule-input-text");
    const any = input("text", (rule.any || []).join(", "), "rule-input-text");
    any.placeholder = "youtube.com/shorts";
    const all = input("text", (rule.all || []).join(", "), "rule-input-text");
    all.placeholder = "(optional keywords)";

    const grace = input("number", rule.grace, "rule-input-text");
    grace.min = 0; grace.max = 3600;

    const action = document.createElement("select");
    action.className = "rule-select";
    [["tab", "Dismiss Tab"], ["close", "Close Window"]].forEach(([v, t]) => {
      const o = document.createElement("option");
      o.value = v; o.textContent = t;
      if ((rule.action || "tab") === v) { o.selected = true; }
      action.appendChild(o);
    });
    action.addEventListener("change", scheduleSave);

    const del = document.createElement("button");
    del.className = "rule-del-btn";
    del.title = "Delete filter";
    del.textContent = "✕";
    del.addEventListener("click", () => {
      row.remove();
      scheduleSave();
    });

    [label, any, all, grace].forEach((inp) => inp.addEventListener("input", scheduleSave));

    row.append(on, label, any, all, grace, action, del);
    return row;
  }

  function readRules() {
    const out = [];
    document.querySelectorAll("#ruleRows .rule-row-item").forEach((row) => {
      const inputs = row.querySelectorAll("input, select");
      const [on, label, any, all, grace, action] = inputs;
      out.push({
        id: row.dataset.id || slug(label.value) || "filter-" + Math.random().toString(36).slice(2, 6),
        label: label.value.trim(),
        any: any.value.split(",").map((s) => s.trim()).filter(Boolean),
        all: all.value.split(",").map((s) => s.trim()).filter(Boolean),
        grace: clampNum(grace.value, 0, 3600, 6),
        action: action.value,
        enabled: on.checked
      });
    });
    return out;
  }

  function input(type, value, className = "") {
    const el = document.createElement("input");
    el.type = type;
    el.value = value ?? "";
    el.className = className;
    el.spellcheck = false;
    return el;
  }

  function slug(str) {
    return (str || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  /* ---------------- Input Change Listeners ---------------- */
  [
    el.enabled, el.modeClose, el.modeNag,
    el.catWander, el.catSleepy, el.catDarkFur, el.catPinkEars
  ].forEach((input) => input.addEventListener("change", () => {
    scheduleSave();
  }));

  [
    el.countdown, el.snoozeMinutes, el.pollMs, el.urlPollMs,
    el.never, el.catScale, el.catSpeed, el.userName
  ].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      if (input === el.catScale || input === el.catSpeed) {
        paintCatOut();
      }
      scheduleSave();
    });
  });

  if (el.wakeGreetBtn) {
    el.wakeGreetBtn.addEventListener("click", () => {
      fetch(API_SERVER + "/wake").catch(() => {});
    });
  }

  $("addRule").addEventListener("click", () => {
    const newRule = {
      id: "filter-" + Date.now().toString(36),
      label: "Custom Target",
      any: ["distracting-site.com"],
      all: [],
      grace: 6,
      action: "tab",
      enabled: true
    };
    cfg.rules = cfg.rules || [];
    cfg.rules.push(newRule);
    el.ruleRows.appendChild(ruleRow(newRule, cfg.rules.length - 1));
    scheduleSave();
  });

  $("resetRules").addEventListener("click", async () => {
    if (!confirm("Reset all distraction filters back to default presets?")) { return; }
    cfg.rules = await invoke("reset_rules");
    renderRules();
    scheduleSave();
  });

  /* ---------------- Animation Preview Triggers ---------------- */
  document.querySelectorAll("#poseBtns button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pose = btn.dataset.pose;
      if (pose) {
        if (window.CharacterManager) {
          if (pose === "swipe") {
            CharacterManager.swipe();
          } else {
            CharacterManager.setState(pose);
          }
        }
        invoke("preview_state", { name: pose });
      }
    });
  });

  $("previewBust").addEventListener("click", () => {
    invoke("preview_bust");
  });

  let petHidden = false;
  $("toggleCat").addEventListener("click", () => {
    petHidden = !petHidden;
    $("toggleCat").textContent = petHidden ? "Show Companion" : "Toggle Companion Visibility";
    invoke("set_cat_visible", { visible: !petHidden });
  });

  /* ---------------- Real-Time Telemetry Polling ---------------- */
  async function pollStatus() {
    if (!document.querySelector('.panel-section[data-panel="live"].is-on')) { return; }
    try {
      const s = await invoke("status");
      if (!s) { return; }
      $("liveTitle").textContent = s.foreground ? s.foreground.title : "—";
      $("liveUrl").textContent = s.foreground ? s.foreground.url : "—";
      $("liveProc").textContent = s.foreground ? s.foreground.proc : "—";
      $("liveRule").textContent = s.matched || "—";
      $("liveRemaining").textContent = s.remaining ? s.remaining + "s" : "—";
      $("liveHay").textContent = s.haystack || "—";
    } catch (_) {}
  }
  setInterval(pollStatus, 1000);

  /* ---------------- Initialization ---------------- */
  (async function init() {
    mountAvatars();
    initThreeHeroScene();
    cfg = await invoke("get_config");
    paint();
  })();
})();
