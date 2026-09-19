/* ------------------------------------------------------------------
   penguin-rig.js — SVG markup + GSAP animation for the Scarf Penguin
   API mirrors Cat: init(), setState(), setSpeed(), getState(),
   setFacing(), groundSpeed(), swipe()
   Design space: 0 0 200 150, floor at y=137
------------------------------------------------------------------ */
(function (global) {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  var MARKUP = [
    '<ellipse id="pgShadow" cx="100" cy="139" rx="28" ry="4" fill="rgba(0,0,0,0.18)" filter="url(#catSoftShadow)" />',

    /* body group — penguin is upright, feet shuffle side to side */
    '<g id="pgBody">',
    '  <!-- feet -->',
    '  <ellipse id="pgFootL" cx="89" cy="134" rx="9" ry="5" fill="#e8890a" />',
    '  <ellipse id="pgFootR" cx="111" cy="134" rx="9" ry="5" fill="#e8890a" />',
    '  <!-- main body (black) -->',
    '  <ellipse id="pgTorso" cx="100" cy="110" rx="26" ry="30" fill="#1f2330" />',
    '  <!-- white belly -->',
    '  <ellipse cx="100" cy="114" rx="17" ry="22" fill="#f0f0f0" />',
    '  <!-- flippers -->',
    '  <ellipse id="pgFlipL" cx="74" cy="110" rx="8" ry="18" fill="#1f2330" transform="rotate(-12,74,110)" />',
    '  <ellipse id="pgFlipR" cx="126" cy="110" rx="8" ry="18" fill="#1f2330" transform="rotate(12,126,110)" />',
    '  <!-- scarf body wrap -->',
    '  <rect id="pgScarfBody" x="75" y="95" width="50" height="12" rx="6" fill="#3d8fd1" />',
    '  <rect x="75" y="98" width="50" height="3" fill="rgba(255,255,255,0.25)" />',
    '</g>',

    /* head bob */
    '<g id="pgHeadBob">',
    '  <!-- head (round black cap) -->',
    '  <circle id="pgHead" cx="100" cy="77" r="26" fill="#1f2330" />',
    '  <!-- white face -->',
    '  <ellipse cx="100" cy="82" rx="18" ry="17" fill="#f0f0f0" />',
    '  <!-- eyes -->',
    '  <g id="pgEyeL"><circle cx="91" cy="79" r="5.5" fill="#0d0d0d" /><circle cx="92.2" cy="77.8" r="1.6" fill="#fff" /></g>',
    '  <g id="pgEyeR"><circle cx="109" cy="79" r="5.5" fill="#0d0d0d" /><circle cx="110.2" cy="77.8" r="1.6" fill="#fff" /></g>',
    '  <!-- blink lids -->',
    '  <rect id="pgLidL" x="85.5" y="77" width="11" height="0" rx="3" fill="#1f2330" />',
    '  <rect id="pgLidR" x="103.5" y="77" width="11" height="0" rx="3" fill="#1f2330" />',
    '  <!-- beak -->',
    '  <path id="pgBeak" d="M96,87 L100,94 L104,87 Z" fill="#e8890a" />',
    '  <!-- blush -->',
    '  <ellipse class="blush" cx="83" cy="86" rx="5" ry="3" fill="rgba(255,160,140,0.5)" />',
    '  <ellipse class="blush" cx="117" cy="86" rx="5" ry="3" fill="rgba(255,160,140,0.5)" />',
    '  <!-- scarf (neck portion, on top of head base) -->',
    '  <rect id="pgScarfNeck" x="82" y="95" width="36" height="9" rx="4.5" fill="#4a9fdf" />',
    '  <!-- dangling scarf end -->',
    '  <g id="pgScarfDangle" transform="translate(120,97)">',
    '    <rect x="0" y="0" width="14" height="24" rx="4" fill="#3d8fd1" />',
    '    <rect x="2" y="2" width="10" height="4" fill="rgba(255,255,255,0.3)" />',
    '    <rect x="2" y="8" width="10" height="4" fill="rgba(255,255,255,0.3)" />',
    '  </g>',
    '  <!-- anger mark -->',
    '  <g id="pgAnger" opacity="0">',
    '    <circle cx="82" cy="66" r="7" fill="#e74c3c" />',
    '    <text x="82" y="70" text-anchor="middle" font-size="9" fill="#fff" font-weight="bold">!</text>',
    '  </g>',
    '</g>',

    '<g id="pgZzz" opacity="0">',
    '  <text class="z" x="128" y="65" font-size="9" fill="#9aa6bd" opacity="0">z</text>',
    '  <text class="z" x="137" y="56" font-size="12" fill="#9aa6bd" opacity="0">z</text>',
    '  <text class="z" x="148" y="45" font-size="15" fill="#9aa6bd" opacity="0">z</text>',
    '</g>',

    '<g id="pgHearts">',
    '  <text class="heart" x="124" y="63" font-size="14" opacity="0">❤️</text>',
    '  <text class="heart" x="132" y="51" font-size="11" opacity="0">❤️</text>',
    '</g>'
  ].join("\n");

  function mount(parent) {
    var g = document.createElementNS(NS, "g");
    g.setAttribute("id", "penguinRoot");
    g.innerHTML = MARKUP;
    parent.appendChild(g);
    return g;
  }

  var el = {};
  var current = null;
  var loop = null;
  var blinkCall = null;
  var speed = 1;
  var heartEls = [];
  var zzzEls = [];
  var angerTl = null;
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  function $ (id) { return document.getElementById(id); }

  function collect() {
    el = {
      root:        $("penguinRoot"),
      shadow:      $("pgShadow"),
      body:        $("pgBody"),
      torso:       $("pgTorso"),
      headBob:     $("pgHeadBob"),
      head:        $("pgHead"),
      eyeL:        $("pgEyeL"),
      eyeR:        $("pgEyeR"),
      lidL:        $("pgLidL"),
      lidR:        $("pgLidR"),
      beak:        $("pgBeak"),
      flipL:       $("pgFlipL"),
      flipR:       $("pgFlipR"),
      footL:       $("pgFootL"),
      footR:       $("pgFootR"),
      scarfDangle: $("pgScarfDangle"),
      anger:       $("pgAnger"),
      zzz:         $("pgZzz"),
      hearts:      $("pgHearts")
    };
    heartEls = Array.from(el.hearts.querySelectorAll(".heart"));
    zzzEls = Array.from(el.zzz.querySelectorAll(".z"));
  }

  function clearLoops() {
    if (loop) { loop.kill(); loop = null; }
    if (blinkCall) { blinkCall.kill(); blinkCall = null; }
    if (angerTl) { angerTl.kill(); angerTl = null; }
    if (!el.body) { return; }
    gsap.killTweensOf([el.body, el.headBob, el.torso, el.head,
      el.eyeL, el.eyeR, el.lidL, el.lidR, el.beak,
      el.flipL, el.flipR, el.footL, el.footR, el.scarfDangle, el.anger]);
    gsap.killTweensOf(heartEls);
    gsap.killTweensOf(zzzEls);
  }

  /* ---- LOOPS ---- */
  function sitLoop() {
    var tl = gsap.timeline({ repeat: -1 });
    // breathing
    tl.to(el.body, { scaleY: 1.025, y: -1, duration: 1.7, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, 0);
    tl.to(el.headBob, { y: -1.4, duration: 1.7, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    // scarf sway
    tl.to(el.scarfDangle, { rotation: 8, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "0% 0%" }, 0);
    // flipper tap
    tl.to(el.flipL, { rotation: -12, transformOrigin: "90% 20%", duration: 1.0, ease: "sine.inOut", yoyo: true, repeat: 3 }, 0.8);
    return tl;
  }

  function walkLoop() {
    /* Penguins waddle — body tilts left and right with each step */
    var step = 0.28;
    var tl = gsap.timeline({ repeat: -1 });
    // body sway side to side (the iconic penguin waddle)
    tl.to(el.body, { rotation: 8, y: -1.5, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%" }, 0);
    tl.to(el.headBob, { rotation: -5, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%" }, 0);
    // foot shuffle
    tl.to(el.footL, { x: -5, rotation: -10, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%" }, 0);
    tl.to(el.footR, { x: 5, rotation: 10, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%" }, step * 0.5);
    // flipper flap for balance
    tl.to(el.flipL, { rotation: -18, transformOrigin: "90% 20%", duration: step, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
    tl.to(el.flipR, { rotation: 18, transformOrigin: "10% 20%", duration: step, ease: "sine.inOut", yoyo: true, repeat: -1 }, step * 0.5);
    // scarf trails
    tl.to(el.scarfDangle, { rotation: 18, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "0% 0%" }, 0);
    return tl;
  }

  function sleepLoop() {
    gsap.set(el.zzz, { opacity: 1 });
    var tl = gsap.timeline({ repeat: -1 });
    tl.to(el.body, { scaleY: 1.045, y: -1.8, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, 0);
    tl.to(el.headBob, { y: 5, rotation: 14, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, 0);
    tl.to(el.scarfDangle, { rotation: -4, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "0% 0%" }, 0);
    zzzEls.forEach(function (z, i) {
      tl.fromTo(z, { x: 0, y: 0, opacity: 0, scale: 0.6 },
        { x: 10, y: -26, opacity: 0, scale: 1.2, duration: 2.2, ease: "sine.out",
          keyframes: { opacity: [0, 0.8, 0.8, 0] } }, i * 0.75);
    });
    return tl;
  }

  function patLoop() {
    var tl = gsap.timeline({ repeat: -1 });
    var beats = [0.3, 1.2];
    beats.forEach(function (t, n) {
      tl.to(el.headBob, { y: 4, scaleY: 0.91, duration: 0.14, ease: "power2.out", transformOrigin: "50% 100%" }, t);
      tl.to(el.headBob, { y: 0, scaleY: 1, duration: 0.55, ease: "elastic.out(1,0.45)" }, t + 0.16);
      tl.to(el.body, { scaleY: 0.95, duration: 0.14, ease: "power2.out", transformOrigin: "50% 100%" }, t);
      tl.to(el.body, { scaleY: 1, duration: 0.55, ease: "elastic.out(1,0.5)" }, t + 0.16);
      var h = heartEls[n % heartEls.length];
      tl.fromTo(h, { x: 0, y: 0, opacity: 0, scale: 0.3 },
        { x: n ? 14 : -12, y: -30, opacity: 0, scale: 1.1, duration: 1.1, ease: "sine.out",
          keyframes: { opacity: [0, 1, 1, 0] } }, t + 0.08);
    });
    // happy flipper flap
    tl.to(el.flipL, { rotation: -25, transformOrigin: "90% 20%", duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 7 }, 0);
    tl.to(el.flipR, { rotation: 25, transformOrigin: "10% 20%", duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 7 }, 0.11);
    tl.to(el.scarfDangle, { rotation: 22, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 7, transformOrigin: "0% 0%" }, 0);
    return tl;
  }

  function angryLoop() {
    gsap.set(el.anger, { opacity: 1 });
    angerTl = gsap.timeline({ repeat: -1 });
    angerTl.fromTo(el.anger, { scale: 0.3, opacity: 0 },
      { scale: 1.1, opacity: 1, duration: 0.2, ease: "back.out(3)" }, 0);
    angerTl.to(el.anger, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 5, ease: "sine.inOut" }, 0.35);
    angerTl.to(el.anger, { opacity: 0, duration: 0.12, ease: "power2.in" }, 1.7);
    angerTl.to({}, { duration: 0.2 }, 1.84);

    var step = 0.2;
    var tl = gsap.timeline({ repeat: -1 });
    tl.to(el.body, { rotation: 12, y: -2.5, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%" }, 0);
    tl.to(el.headBob, { rotation: -8, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%" }, 0);
    tl.to(el.flipL, { rotation: -30, transformOrigin: "90% 20%", duration: step, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
    tl.to(el.flipR, { rotation: 30, transformOrigin: "10% 20%", duration: step, ease: "sine.inOut", yoyo: true, repeat: -1 }, step * 0.5);
    return tl;
  }

  function boredLoop() {
    var tl = gsap.timeline({ repeat: -1 });
    tl.to(el.body, { rotation: 3, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, 0);
    tl.to(el.headBob, { y: 4, rotation: 12, duration: 2.5, ease: "sine.inOut", transformOrigin: "50% 100%" }, 0.6);
    tl.to(el.headBob, { y: 0, rotation: 0, duration: 0.38, ease: "back.out(2.5)" }, 3.2);
    tl.to(el.headBob, { y: 2.5, rotation: 7, duration: 1.6, ease: "sine.inOut" }, 3.9);
    tl.to(el.headBob, { y: 0, rotation: 0, duration: 0.32, ease: "back.out(2)" }, 5.6);
    tl.to(el.scarfDangle, { rotation: -10, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "0% 0%" }, 0);
    return tl;
  }

  function blink() {
    if (!el.lidL) { return; }
    var tl = gsap.timeline();
    tl.to(el.lidL, { attr: { height: 11 }, y: -2, duration: 0.07, ease: "power2.in" }, 0);
    tl.to(el.lidR, { attr: { height: 11 }, y: -2, duration: 0.07, ease: "power2.in" }, 0);
    tl.to(el.lidL, { attr: { height: 0 }, y: 0, duration: 0.11, ease: "power2.out" }, 0.11);
    tl.to(el.lidR, { attr: { height: 0 }, y: 0, duration: 0.11, ease: "power2.out" }, 0.11);
    blinkCall = gsap.delayedCall(rand(2.5, 6.5), blink);
  }

  var Penguin = {
    init: function (opts) {
      collect();
      gsap.set(el.zzz, { opacity: 0 });
      gsap.set(el.anger, { opacity: 0 });
      gsap.set(heartEls, { opacity: 0 });
      this.setState(opts && opts.state ? opts.state : "sit");
      blinkCall = gsap.delayedCall(rand(1.5, 4), blink);
    },

    setState: function (name) {
      if (name === current) { return; }
      clearLoops();
      gsap.set(el.zzz, { opacity: 0 });
      gsap.set(el.anger, { opacity: 0 });
      gsap.set(heartEls, { opacity: 0 });
      // reset transforms
      gsap.set([el.body, el.headBob, el.flipL, el.flipR, el.footL, el.footR], { clearProps: "rotation,x,y,scaleX,scaleY" });
      current = name;
      var loops = { sit: sitLoop, walk: walkLoop, sleep: sleepLoop, pat: patLoop, angry: angryLoop, bored: boredLoop, confront: boredLoop };
      loop = (loops[name] || sitLoop)();
      if (loop) { loop.timeScale(speed); }
      blinkCall = gsap.delayedCall(rand(1.5, 4), blink);
    },

    getState: function () { return current; },
    setSpeed: function (s) { speed = s; if (loop) { loop.timeScale(s); } },
    setFacing: function (dir) {
      if (!el.root) { return; }
      gsap.set(el.root, { scaleX: dir, transformOrigin: "50% 100%" });
    },
    groundSpeed: function () { return 42 * speed; },

    swipe: function (onImpact) {
      return new Promise(function (resolve) {
        clearLoops();
        var tl = gsap.timeline({ onComplete: resolve });
        tl.to(el.flipR, { rotation: -65, y: -15, duration: 0.16, ease: "power3.in", transformOrigin: "10% 20%" }, 0);
        tl.call(function () { if (onImpact) { onImpact(); } }, null, 0.16);
        tl.to(el.flipR, { rotation: 0, y: 0, duration: 0.4, ease: "back.out(2)", transformOrigin: "10% 20%" }, 0.18);
        tl.call(function () { Penguin.setState("sit"); }, null, 0.58);
      });
    }
  };

  global.PenguinRig = { mount: mount };
  global.Penguin = Penguin;
})(window);
