"use strict";

/* ------------------------------------------------------------------
   pet.js — the desktop brain
   ------------------------------------------------------------------
   cat.js knows how to *be* a cat. This file decides what the cat does:
   where it stands, when it wanders, and how it reacts when the main
   process reports that you are watching Reels again.

   Position is driven here rather than by cat.js's own roam, because on
   the desktop the cat has a whole screen to cross, not a 300-unit
   stage. Cat.groundSpeed() is what keeps the paws from skating.
------------------------------------------------------------------ */
(function () {
  /* Outside Electron (opening pet.html straight in a browser) there is
     no preload bridge. Stub it so the character and its behaviour can
     be developed and eyeballed without launching the whole app;
     window.__botpetTest.bust() fakes an interception. */
  const api = window.botpet || window.morphcat || {
    onBust: (cb) => { window.__bustCb = cb; },
    onStatus: (cb) => { window.__statusCb = cb; },
    act: async () => ({ acted: true, mode: "tab" }),
    snooze: async () => ({ until: Date.now() + 300000 }),
    setInteractive: () => {}
  };

  const PX_PER_UNIT = 1.25;          // must match #pet's size in pet.css
  const BOX_W = 200 * PX_PER_UNIT;   // the rig's design box is 200 units wide
  const EDGE = 24;                   // keep this far from the screen edges

  const pet = document.getElementById("pet");
  const bubble = document.getElementById("bubble");
  const bubbleText = document.getElementById("bubbleText");
  const bubbleCount = document.getElementById("bubbleCount");

  gsap.registerPlugin(MorphSVGPlugin);
  CharacterManager.mount(document.getElementById("petScene"));
  CharacterManager.init({ state: "sit", roam: false });      // we drive position ourselves

  // Landing quotes
  const LANDING_QUOTES = [
    "Perfect touchdown! 🐾",
    "Flawless landing! ✨",
    "Balanced and steady! 🌟",
    "Always landing upright! 🐾",
    "Graceful drop completed! 💖"
  ];

  function pickLandingQuote() {
    if (window.CharacterManager && typeof window.CharacterManager.getQuote === "function") {
      return window.CharacterManager.getQuote("landing");
    }
    return LANDING_QUOTES[Math.floor(Math.random() * LANDING_QUOTES.length)];
  }


  /* ---------------------------------------------------------------
     position
  --------------------------------------------------------------- */
  const getFloorY = () => Math.max(0, window.innerHeight - 172);
  let x = Math.round((window.innerWidth - BOX_W) / 2);
  let y = getFloorY();
  gsap.set(pet, { x, y });

  const maxX = () => Math.max(EDGE, window.innerWidth - BOX_W - EDGE);
  const clamp = (v) => Math.min(maxX(), Math.max(EDGE, v));

  function setX(v) { x = v; gsap.set(pet, { x }); }
  function setPos(newX, newY) { x = newX; y = newY; gsap.set(pet, { x, y }); }

  /* ---------------------------------------------------------------
     a tiny interruptible-sequence helper

     Every behaviour is a chain of awaits. `epoch` is bumped whenever
     something more important happens (a bust, a drag, a pat), which
     makes every in-flight step resolve early and unwind the old chain
     instead of fighting the new one.
  --------------------------------------------------------------- */
  let epoch = 0;
  const stale = (mine) => mine !== epoch;

  function interrupt() { epoch++; return epoch; }

  function wait(seconds, mine) {
    return new Promise((resolve) => {
      const t = gsap.delayedCall(seconds, resolve);
      const poll = setInterval(() => {
        if (stale(mine)) { clearInterval(poll); t.kill(); resolve(); }
      }, 120);
      t.eventCallback("onComplete", () => { clearInterval(poll); resolve(); });
    });
  }

  function walkTo(targetX, mine) {
    return new Promise((resolve) => {
      const dest = clamp(targetX);
      const distance = Math.abs(dest - x);
      if (distance < 8) { resolve(); return; }

      CharacterManager.setFacing(dest > x ? 1 : -1);
      if (CharacterManager.getState() !== "walk" && CharacterManager.getState() !== "angry") {
        CharacterManager.setState("walk");
      }

      // px/sec derived from the gait itself, so the feet stay planted
      y = getFloorY();
      gsap.set(pet, { y });
      const pps = Math.max(12, CharacterManager.groundSpeed() * PX_PER_UNIT);
      const tween = gsap.to(pet, {
        x: dest,
        duration: distance / pps,
        ease: "none",
        onUpdate() { x = gsap.getProperty(pet, "x"); },
        onComplete() { clearInterval(poll); x = dest; resolve(); }
      });
      const poll = setInterval(() => {
        if (stale(mine)) { clearInterval(poll); tween.kill(); x = gsap.getProperty(pet, "x"); resolve(); }
      }, 120);
    });
  }

  /* ---------------------------------------------------------------
     idle life
  --------------------------------------------------------------- */
  const RESTS = ["sit", "sit", "bored", "sleep", "bored"];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rand = (a, b) => a + Math.random() * (b - a);

  async function idleLoop() {
    const mine = interrupt();
    while (!stale(mine)) {
      CharacterManager.setSpeed(1);
      CharacterManager.setState(pick(RESTS));
      await wait(rand(7, 18), mine);
      if (stale(mine)) { return; }

      await walkTo(rand(EDGE, maxX()), mine);
      if (stale(mine)) { return; }
      CharacterManager.setState("sit");
      await wait(rand(1, 3), mine);
    }
  }

  /* ---------------------------------------------------------------
     bubble
  --------------------------------------------------------------- */
  let bubbleTween = null;

  function showBubble(text, count, kind) {
    bubbleText.textContent = text;
    bubbleCount.textContent = count || "";
    bubbleCount.style.display = count ? "" : "none";
    bubble.className = "bubble" + (kind ? " is-" + kind : "");
    bubble.hidden = false;
    if (bubbleTween) { bubbleTween.kill(); }
    bubbleTween = gsap.fromTo(bubble,
      { opacity: 0, y: 8, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "back.out(2)", transformOrigin: "50% 100%" });
  }

  function updateBubble(count, kind) {
    bubbleCount.textContent = count || "";
    if (kind) { bubble.className = "bubble is-" + kind; }
  }

  function hideBubble() {
    if (bubbleTween) { bubbleTween.kill(); }
    bubbleTween = gsap.to(bubble, {
      opacity: 0, y: 6, duration: 0.22, ease: "power2.in",
      onComplete() { bubble.hidden = true; }
    });
  }

  /* ---------------------------------------------------------------
     the intervention
  --------------------------------------------------------------- */
  let alerting = false;
  let countdownCall = null;

  const SCOLDS = [
    "Back to work!",
    "Distraction detected!",
    "Time to refocus!",
    "Closing this distraction.",
    "Stay on track!"
  ];

  async function onBust(payload) {
    if (alerting) { return; }
    alerting = true;
    const mine = interrupt();

    // storm toward the middle of the screen, ears back, 💢 up
    CharacterManager.setSpeed(1.5);
    CharacterManager.setState("angry");

    const label = payload.rule.label;
    const nagging = payload.mode !== "close";
    let left = nagging ? 0 : payload.countdown;

    const scoldText = (window.CharacterManager && typeof window.CharacterManager.getQuote === "function") ? window.CharacterManager.getQuote("scold") : pick(SCOLDS);
    showBubble(nagging ? label + "?" : scoldText,
      nagging ? "seen" : left + "s", nagging ? "hint" : null);

    const centre = (window.innerWidth - BOX_W) / 2 + rand(-160, 160);
    walkTo(centre, mine);                       // deliberately not awaited

    if (nagging) {
      await wait(2.6, mine);
      finish(mine, "nag");
      return;
    }

    await new Promise((resolve) => {
      countdownCall = setInterval(() => {
        left -= 1;
        if (left <= 0) { clearInterval(countdownCall); countdownCall = null; resolve(); }
        else { updateBubble(left + "s"); }
      }, 1000);
    });

    if (stale(mine)) { return; }                // the user snoozed mid-count

    // the paw swipe IS the close: api.act() fires on the strike frame
    let actCall = null;
    CharacterManager.setSpeed(1);
    await CharacterManager.swipe(() => {
      if (stale(mine)) { return; }
      updateBubble("", "done");
      actCall = api.act(payload.target, payload.mode);
    });
    if (stale(mine)) { return; }

    const result = await (actCall || api.act(payload.target, payload.mode));
    if (stale(mine)) { return; }

    if (result && result.acted) {
      updateBubble("closed", "done");
      CharacterManager.setSpeed(1);
      CharacterManager.setState("pat");                      // pleased with itself
    } else {
      updateBubble("let it go", "hint");
      CharacterManager.setSpeed(1);
      CharacterManager.setState("sit");
    }
    await wait(2.2, mine);
    finish(mine, "done");
  }

  function finish(mine, _why) {
    if (stale(mine)) { return; }
    alerting = false;
    hideBubble();
    CharacterManager.setSpeed(1);
    idleLoop();
  }

  async function cancelToSnooze() {
    if (!alerting) { return; }
    if (countdownCall) { clearInterval(countdownCall); countdownCall = null; }
    alerting = false;
    interrupt();
    await api.snooze();
    CharacterManager.setSpeed(1);
    CharacterManager.setState("pat");
    const snoozeText = (window.CharacterManager && typeof window.CharacterManager.getQuote === "function") ? window.CharacterManager.getQuote("snooze") : "Paused for 5 minutes. ☕";
    showBubble(snoozeText, "snoozed", "hint");
    setTimeout(() => { hideBubble(); idleLoop(); }, 2000);
  }

  /* ---------------------------------------------------------------
     pointer: click-through unless you are actually on the cat
  --------------------------------------------------------------- */
  let interactive = false;
  let dragging = false;
  let isDropping = false;
  let dragDx = 0;
  let dragDy = 0;
  let lastDragX = 0;
  let movedWhileDown = 0;

  function hot(clientX, clientY) {
    // the cat occupies roughly x 25..185, y 15..145 of its design box
    const u = PX_PER_UNIT;
    const catBox = {
      left: x + 25 * u,
      right: x + 185 * u,
      top: y + 15 * u,
      bottom: y + 150 * u
    };
    if (clientX >= catBox.left && clientX <= catBox.right &&
        clientY >= catBox.top && clientY <= catBox.bottom) { return true; }
    if (!bubble.hidden) {
      const b = bubble.getBoundingClientRect();
      if (clientX >= b.left && clientX <= b.right && clientY >= b.top && clientY <= b.bottom) { return true; }
    }
    return false;
  }

  function setInteractive(on) {
    if (on === interactive) { return; }
    interactive = on;
    api.setInteractive(on);
  }

  if (api.onCursorPos) {
    api.onCursorPos(({ x: cx, y: cy }) => {
      if (dragging || isDropping) { return; }
      setInteractive(hot(cx, cy));
    });
  }

  window.addEventListener("mousemove", (e) => {
    if (dragging) {
      movedWhileDown += 1;
      const targetX = clamp(e.clientX - dragDx);
      const targetY = Math.min(getFloorY(), Math.max(10, e.clientY - dragDy));

      // Dynamic cat wiggle / inertia sway while being carried in mid-air
      const vx = e.clientX - lastDragX;
      lastDragX = e.clientX;
      const sway = Math.max(-18, Math.min(18, vx * 1.2));

      x = targetX;
      y = targetY;
      gsap.to(pet, {
        x: targetX,
        y: targetY,
        rotation: sway,
        duration: 0.08,
        ease: "power1.out",
        overwrite: "auto"
      });
      return;
    }
    setInteractive(hot(e.clientX, e.clientY));
  });

  window.addEventListener("mousedown", (e) => {
    if (isDropping) { return; }
    if (!hot(e.clientX, e.clientY)) { return; }
    dragging = true;
    movedWhileDown = 0;
    dragDx = e.clientX - x;
    dragDy = e.clientY - y;
    lastDragX = e.clientX;
    interrupt();
    setInteractive(true);
    CharacterManager.setSpeed(1);
    CharacterManager.setState("bored");             // dangling in mid-air
    gsap.to(pet, { rotation: 4, duration: 0.15, ease: "power1.out" });
  });

  /* Realistic free-fall and shock-absorbing touchdown physics */
  function performCatLanding(floor, dropDistance) {
    isDropping = true;
    const mine = interrupt();

    // 1. Righting reflex: limbs outstretched, preparing for ground contact
    CharacterManager.setState("bored");
    gsap.to(pet, { rotation: 0, duration: 0.12, ease: "power1.out" });

    // 2. Gravitational acceleration: quadratic ease mimics free fall under g
    const fallDuration = Math.max(0.24, Math.min(0.58, Math.sqrt(dropDistance / 1000) * 0.55));

    gsap.to(pet, {
      y: floor,
      duration: fallDuration,
      ease: "power2.in",
      onComplete() {
        y = floor;

        // 3. Impact cushion: deep squat and body squash absorbing landing shock
        CharacterManager.setState("sit");

        const tl = gsap.timeline({
          onComplete() {
            isDropping = false;
            // 5. Post-landing satisfaction & dignity
            CharacterManager.setState("pat");
            showBubble(pickLandingQuote(), null, "done");
            wait(2.6, mine).then(() => {
              hideBubble();
              if (!stale(mine)) { idleLoop(); }
            });
          }
        });

        // Deep shock squash: paws/base stay anchored (transformOrigin: 50% 100%)
        tl.to(pet, {
          scaleY: 0.52,
          scaleX: 1.42,
          y: floor + 3,
          duration: 0.08,
          ease: "power2.out"
        })
        // 4. Elastic spring rebound
        .to(pet, {
          scaleY: 1.10,
          scaleX: 0.92,
          y: floor,
          duration: 0.12,
          ease: "power1.out"
        })
        // Settle smoothly into natural sitting posture
        .to(pet, {
          scaleY: 1.0,
          scaleX: 1.0,
          duration: 0.22,
          ease: "elastic.out(1.2, 0.4)"
        });
      }
    });
  }

  window.addEventListener("mouseup", () => {
    if (!dragging) { return; }
    dragging = false;

    if (movedWhileDown < 4) {
      // a click, not a drag
      gsap.to(pet, { rotation: 0, duration: 0.1 });
      if (alerting) { cancelToSnooze(); return; }
      const mine = interrupt();
      CharacterManager.setState("pat");
      const patText = (window.CharacterManager && typeof window.CharacterManager.getQuote === "function") ? window.CharacterManager.getQuote("pat") : "Purr... ❤️";
      showBubble(patText, null, "hint");
      wait(2.2, mine).then(() => {
        hideBubble();
        if (!stale(mine)) { idleLoop(); }
      });
      return;
    }

    const floor = getFloorY();
    const dropDistance = floor - y;

    if (dropDistance > 25) {
      // Dropped from mid-air / top of screen: execute realistic landing!
      performCatLanding(floor, dropDistance);
    } else {
      // Placed down near floor
      y = floor;
      gsap.to(pet, { y: floor, rotation: 0, scaleX: 1, scaleY: 1, duration: 0.15 });
      CharacterManager.setState("sit");
      if (!alerting) { idleLoop(); }
    }
  });

  /* ---------------------------------------------------------------
     wiring
  --------------------------------------------------------------- */
  api.onBust(onBust);

  api.onStatus((s) => {
    // The cat notices a few seconds before it acts: it stops what it is
    // doing and stares. That pause is the actual warning.
    if (alerting || dragging) { return; }
    if (s.watching && s.remaining <= 5) {
      if (CharacterManager.getState() !== "sit") {
        const mine = interrupt();
        CharacterManager.setState("sit");
        wait(6, mine).then(() => { if (!stale(mine)) { idleLoop(); } });
      }
    }
  });

  /* CLI command listener */
  if (api.onCliCommand) {
    api.onCliCommand(async (data) => {
      const { cmd, text, mins } = data;
      const mine = interrupt();

      if (cmd === "sit") {
        CharacterManager.setState("sit");
        showBubble(CharacterManager.getQuote("state", "sit"));
        await wait(2.5, mine);
        hideBubble();
      } else if (cmd === "walk") {
        showBubble(CharacterManager.getQuote("state", "walk"));
        await walkTo(rand(EDGE, maxX()), mine);
        CharacterManager.setState("sit");
        hideBubble();
        idleLoop();
      } else if (cmd === "sleep") {
        CharacterManager.setState("sleep");
        showBubble(CharacterManager.getQuote("state", "sleep"));
      } else if (cmd === "angry") {
        CharacterManager.setState("angry");
        showBubble(CharacterManager.getQuote("state", "angry"));
      } else if (cmd === "pat") {
        CharacterManager.setState("pat");
        showBubble(CharacterManager.getQuote("pat"));
        await wait(3, mine);
        CharacterManager.setState("sit");
        hideBubble();
        idleLoop();
      } else if (cmd === "bored") {
        CharacterManager.setState("bored");
        showBubble(CharacterManager.getQuote("state", "bored"));
      } else if (cmd === "swipe") {
        showBubble(CharacterManager.getQuote("state", "swipe"));
        await CharacterManager.swipe();
        await wait(1.5, mine);
        CharacterManager.setState("sit");
        hideBubble();
        idleLoop();
      } else if (cmd === "say") {
        showBubble(CharacterManager.getQuote("say", text), null, "hint");
        await wait(4, mine);
        hideBubble();
      } else if (cmd === "focus") {
        const m = mins || 25;
        CharacterManager.setState("sit");
        showBubble(CharacterManager.getQuote("focus", m), `${m}m`, "hint");
        await wait(3.5, mine);
        hideBubble();
        idleLoop();
      } else if (cmd === "break") {
        const m = mins || 5;
        CharacterManager.setState("sleep");
        showBubble(CharacterManager.getQuote("break", m), `${m}m`, "done");
      } else if (cmd === "resume") {
        CharacterManager.setState("sit");
        hideBubble();
        idleLoop();
      } else if (cmd === "theme") {
        if (text === "dark" || text === "black") {
          document.body.classList.add("theme-dark");
          showBubble("Midnight palette activated! ✨", null, "hint");
        } else {
          document.body.classList.remove("theme-dark");
          showBubble("Default coat restored! ✨", null, "hint");
        }
        await wait(2.5, mine);
        hideBubble();
      } else if (cmd === "ears") {
        if (text === "pink") {
          document.body.classList.add("theme-pink-ears");
          showBubble("Blush & accents enabled! 🌸", null, "hint");
        } else {
          document.body.classList.remove("theme-pink-ears");
          showBubble("Standard accents restored! ✨", null, "hint");
        }
        await wait(2.5, mine);
        hideBubble();
      } else if (cmd === "speed") {
        const s = parseFloat(text) || 1.0;
        CharacterManager.setSpeed(s);
        showBubble(`Speed set to ${s}x! ⚡`, null, "hint");
        await wait(2.5, mine);
        hideBubble();
      } else if (cmd === "wake") {
        if (text) { currentUserName = text; }
        CharacterManager.setSpeed(1);
        CharacterManager.setState("sit");
        showBubble(CharacterManager.getQuote("wake", currentUserName), null, "hint");
        await wait(3.2, mine);
        hideBubble();
        if (!alerting) { idleLoop(); }
      } else if (cmd === "name") {
        if (text) { currentUserName = text; }
        showBubble(CharacterManager.getQuote("name", currentUserName), null, "hint");
        await wait(2.5, mine);
        hideBubble();
        if (!alerting) { idleLoop(); }
      } else if (cmd === "drop") {
        const fromY = data.fromY || 40;
        y = fromY;
        gsap.set(pet, { y: fromY });
        const floor = getFloorY();
        performCatLanding(floor, floor - fromY);
      } else if (cmd === "skin") {
        const skinName = data.skin || "cat";
        CharacterManager.setSkin(skinName);
        showBubble(`Companion skin set to ${CharacterManager.getSkin()}!`, null, "hint");
        await wait(2.2, mine);
        hideBubble();
        if (!alerting) { idleLoop(); }
      }
    });
  }

  window.addEventListener("resize", () => {
    setX(clamp(x));
    if (!dragging && !isDropping) {
      y = getFloorY();
      gsap.set(pet, { y });
    }
  });

  /* dev harness, only reachable when running outside Electron */
  if (!window.botpet && !window.morphcat) {
    window.__botpetTest = {
      bust: (label, mode) => onBust({
        rule: { id: "test", label: label || "YouTube Shorts" },
        target: { hwnd: 1, title: "test", proc: "chrome" },
        mode: mode || "close",
        countdown: 3
      }),
      walkTo: (px) => walkTo(px, epoch),
      state: (name) => { interrupt(); CharacterManager.setState(name); },
      swipe: () => { interrupt(); return CharacterManager.swipe(); },
      idle: () => idleLoop()
    };
  }

  let currentUserName = "Friend";

  async function startup() {
    CharacterManager.setSpeed(1);
    CharacterManager.setState("sit");
    try {
      if (api.getUserName) {
        const fetched = await api.getUserName();
        if (fetched) { currentUserName = fetched; }
      }
    } catch (_) {}

    // Restore the last chosen companion skin
    try {
      if (api.getSkin) {
        const savedSkin = await api.getSkin();
        if (savedSkin && savedSkin !== "cat") { CharacterManager.setSkin(savedSkin); }
      }
    } catch (_) {}

    showBubble(CharacterManager.getQuote("wake", currentUserName));
    await wait(3.2, 0);
    hideBubble();
    // Initial walk across the screen
    await walkTo(rand(EDGE, maxX()), 0);
    CharacterManager.setState("sit");
    await wait(1.5, 0);
    idleLoop();
  }

  startup();
})();
