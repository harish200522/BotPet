/**
 * widget.js — Interactive Companion Studio & Mini Widget
 */
"use strict";

(function () {
  gsap.registerPlugin(MorphSVGPlugin);
  if (window.CharacterManager) {
    CharacterManager.mount(document.getElementById("petScene"));
    CharacterManager.init({ state: "sit", roam: false });
  } else if (window.CatRig) {
    CatRig.mount(document.getElementById("petScene"));
    Cat.init({ state: "sit", roam: false });
  }

  const bubble = document.getElementById("bubble");
  const stage = document.getElementById("catStage");
  const btnGroup = document.getElementById("btnGroup");
  const closeBtn = document.getElementById("closeBtn");
  const modeBtn = document.getElementById("modeBtn");
  const petCard = document.getElementById("petCard");

  let isFreePet = false;
  let bubbleTimer = null;

  function setPetState(state) {
    if (window.CharacterManager) {
      CharacterManager.setState(state);
    } else if (window.Cat) {
      Cat.setState(state);
    }
  }

  function petSwipe() {
    if (window.CharacterManager) {
      CharacterManager.swipe();
    } else if (window.Cat) {
      Cat.swipe();
    }
  }

  function say(text, durationMs = 3200) {
    bubble.textContent = text;
    bubble.classList.remove("hidden");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
      bubble.classList.add("hidden");
    }, durationMs);
  }

  function getQuote(type, arg) {
    if (window.CharacterManager && typeof window.CharacterManager.getQuote === 'function') {
      return window.CharacterManager.getQuote(type, arg);
    }
    if (type === 'pat') return 'Purr... ❤️ (+5 XP)';
    if (type === 'state' && arg === 'swipe') return 'Distraction detected! 🐾 Strike!';
    if (type === 'state' && arg === 'angry') return 'Stay focused! 💢';
    if (type === 'state' && arg === 'sleep') return 'Zzz... 😴';
    if (type === 'state' && arg === 'walk') return 'Strolling along screen... 🚶';
    if (type === 'state' && arg === 'bored') return 'Relaxed in place... 🥱';
    return 'Ready and watching! 👀';
  }

  // Click on the pet to pat it!
  stage.addEventListener("click", () => {
    if (window.CharacterManager) {
      CharacterManager.pat();
    } else {
      setPetState("pat");
    }
    say(getQuote("pat"));
    setTimeout(() => {
      setPetState("sit");
    }, 2800);
  });

  // State button clicks
  btnGroup.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.action === "swipe") {
      say(getQuote("state", "swipe"));
      petSwipe();
      return;
    }

    const state = btn.dataset.state;
    if (!state) return;

    document.querySelectorAll(".controls .btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    setPetState(state);
    say(getQuote("state", state));
  });

  // Toggle Free Pet mode (transparent background)
  modeBtn.addEventListener("click", () => {
    isFreePet = !isFreePet;
    if (isFreePet) {
      petCard.classList.add("free-pet-mode");
      modeBtn.textContent = "🪟 Card";
      say("Floating Companion mode! Drag anywhere! 🐾");
    } else {
      petCard.classList.remove("free-pet-mode");
      modeBtn.textContent = "🐾 Floating Pet";
      say("Docked mode active!");
    }
  });

  closeBtn.addEventListener("click", () => {
    window.close();
  });

  // Wake up announcement
  setTimeout(() => {
    say(getQuote("wake", "Friend"), 4000);
  }, 400);

  setTimeout(() => {
    say("Click to cheer or drag anywhere! ✨", 3500);
  }, 4800);
})();
