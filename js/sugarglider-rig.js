/* ------------------------------------------------------------------
   sugarglider-rig.js — SVG markup + GSAP animation for the Sugar Glider
   API mirrors Cat: init(), setState(), setSpeed(), getState(),
   setFacing(), groundSpeed(), swipe()
   Design space: 0 0 200 150, floor at y=137
------------------------------------------------------------------ */
(function (global) {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  var MARKUP = [
    '<ellipse id="sgShadow" cx="100" cy="139" rx="30" ry="4" fill="rgba(0,0,0,0.18)" filter="url(#catSoftShadow)" />',

    /* body group */
    '<g id="sgBody">',
    '  <!-- gliding membrane wings (hidden when not gliding) -->',
    '  <path id="sgWingL" d="M78,110 Q50,85 62,70 Q70,80 82,95 Z" fill="rgba(100,90,120,0.55)" opacity="0" />',
    '  <path id="sgWingR" d="M122,110 Q150,85 138,70 Q130,80 118,95 Z" fill="rgba(100,90,120,0.55)" opacity="0" />',
    '  <!-- main body -->',
    '  <ellipse id="sgTorso" cx="100" cy="112" rx="22" ry="26" fill="#8a8fa0" />',
    '  <!-- white belly -->',
    '  <ellipse cx="100" cy="116" rx="14" ry="19" fill="#dde0e8" />',
    '  <!-- dark dorsal stripe -->',
    '  <rect x="96" y="88" width="8" height="40" rx="4" fill="#3a3d4a" />',
    '  <!-- front paws -->',
    '  <ellipse id="sgPawFL" cx="80" cy="120" rx="7" ry="5" fill="#7a7f90" />',
    '  <ellipse id="sgPawFR" cx="120" cy="120" rx="7" ry="5" fill="#7a7f90" />',
    '  <!-- hind feet -->',
    '  <ellipse id="sgFootL" cx="87" cy="133" rx="8" ry="5" fill="#7a7f90" />',
    '  <ellipse id="sgFootR" cx="113" cy="133" rx="8" ry="5" fill="#7a7f90" />',
    '  <!-- fluffy tail -->',
    '  <path id="sgTail" d="M100,134 Q78,142 70,130 Q64,118 76,114" stroke="#8a8fa0" stroke-width="11" fill="none" stroke-linecap="round" />',
    '</g>',

    /* head bob */
    '<g id="sgHeadBob">',
    '  <!-- large ears -->',
    '  <ellipse id="sgEarL" cx="80" cy="78" rx="12" ry="15" fill="#7a7f90" />',
    '  <ellipse cx="80" cy="80" rx="7" ry="9" fill="rgba(230,180,180,0.5)" />',
    '  <ellipse id="sgEarR" cx="120" cy="78" rx="12" ry="15" fill="#7a7f90" />',
    '  <ellipse cx="120" cy="80" rx="7" ry="9" fill="rgba(230,180,180,0.5)" />',
    '  <!-- head -->',
    '  <ellipse id="sgHead" cx="100" cy="86" rx="24" ry="22" fill="#8a8fa0" />',
    '  <!-- white face mask -->',
    '  <ellipse cx="100" cy="90" rx="16" ry="14" fill="#dde0e8" />',
    '  <!-- dark eye rings (sugar glider trademark) -->',
    '  <circle cx="90" cy="86" r="7.5" fill="#2a2d38" />',
    '  <circle cx="110" cy="86" r="7.5" fill="#2a2d38" />',
    '  <!-- eyes -->',
    '  <g id="sgEyeL"><circle cx="90" cy="86" r="5" fill="#0d1018" /><circle cx="91.5" cy="84.5" r="1.5" fill="#fff" /></g>',
    '  <g id="sgEyeR"><circle cx="110" cy="86" r="5" fill="#0d1018" /><circle cx="111.5" cy="84.5" r="1.5" fill="#fff" /></g>',
    '  <!-- blink lids -->',
    '  <rect id="sgLidL" x="85" y="84" width="10" height="0" rx="3" fill="#2a2d38" />',
    '  <rect id="sgLidR" x="105" y="84" width="10" height="0" rx="3" fill="#2a2d38" />',
    '  <!-- dark stripe on face -->',
    '  <rect x="97" y="72" width="6" height="28" rx="3" fill="#3a3d4a" opacity="0.5" />',
    '  <!-- nose -->',
    '  <ellipse cx="100" cy="95" rx="3" ry="2" fill="#c096b0" />',
    '  <!-- mouth -->',
    '  <path id="sgMouth" d="M96,99 Q100,103 104,99" stroke="#3a3d4a" stroke-width="1.6" fill="none" stroke-linecap="round" />',
    '  <!-- blush -->',
    '  <ellipse class="blush" cx="83" cy="93" rx="5" ry="3" fill="rgba(220,150,170,0.45)" />',
    '  <ellipse class="blush" cx="117" cy="93" rx="5" ry="3" fill="rgba(220,150,170,0.45)" />',
    '  <!-- anger mark -->',
    '  <g id="sgAnger" opacity="0">',
    '    <circle cx="82" cy="72" r="7" fill="#e74c3c" />',
    '    <text x="82" y="76" text-anchor="middle" font-size="9" fill="#fff" font-weight="bold">!</text>',
    '  </g>',
    '</g>',

    '<g id="sgZzz" opacity="0">',
    '  <text class="z" x="126" y="68" font-size="9" fill="#9aa6bd" opacity="0">z</text>',
    '  <text class="z" x="135" y="59" font-size="12" fill="#9aa6bd" opacity="0">z</text>',
    '  <text class="z" x="146" y="48" font-size="15" fill="#9aa6bd" opacity="0">z</text>',
    '</g>',

    '<g id="sgHearts">',
    '  <text class="heart" x="122" y="64" font-size="14" opacity="0">❤️</text>',
    '  <text class="heart" x="130" y="52" font-size="11" opacity="0">❤️</text>',
    '</g>'
  ].join("\n");

  function mount(parent) {
    var g = document.createElementNS(NS, "g");
    g.setAttribute("id", "sugargliderRoot");
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
      root:    $("sugargliderRoot"),
      shadow:  $("sgShadow"),
      body:    $("sgBody"),
      torso:   $("sgTorso"),
      headBob: $("sgHeadBob"),
      head:    $("sgHead"),
      earL:    $("sgEarL"),
      earR:    $("sgEarR"),
      eyeL:    $("sgEyeL"),
      eyeR:    $("sgEyeR"),
      lidL:    $("sgLidL"),
      lidR:    $("sgLidR"),
      mouth:   $("sgMouth"),
      pawFL:   $("sgPawFL"),
      pawFR:   $("sgPawFR"),
      footL:   $("sgFootL"),
      footR:   $("sgFootR"),
      tail:    $("sgTail"),
      wingL:   $("sgWingL"),
      wingR:   $("sgWingR"),
      anger:   $("sgAnger"),
      zzz:     $("sgZzz"),
      hearts:  $("sgHearts")
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
      el.earL, el.earR, el.eyeL, el.eyeR, el.lidL, el.lidR,
      el.mouth, el.pawFL, el.pawFR, el.footL, el.footR,
      el.tail, el.wingL, el.wingR, el.anger]);
    gsap.killTweensOf(heartEls);
    gsap.killTweensOf(zzzEls);
  }

  function setExpression(name) {
    var mouths = {
      happy:   "M96,99 Q100,103 104,99",
      curious: "M96,99 Q100,101 104,99",
      angry:   "M96,102 Q100,99 104,102",
      sleep:   "M97,99 Q100,101 103,99",
      neutral: "M97,100 Q100,101 103,100"
    };
    if (!el.mouth) { return; }
    gsap.to(el.mouth, { attr: { d: mouths[name] || mouths.happy }, duration: 0.28, ease: "power2.inOut" });
  }

  /* ---- LOOPS ---- */
  function sitLoop() {
    var tl = gsap.timeline({ repeat: -1 });
    tl.to(el.body, { scaleY: 1.022, y: -1, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, 0);
    tl.to(el.headBob, { y: -1.2, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    // ear twitches — sugar gliders have huge, active ears
    tl.to(el.earL, { rotation: -8, transformOrigin: "80% 100%", duration: 0.6, ease: "back.out(3)", yoyo: true, repeat: 1 }, 1.0);
    tl.to(el.earR, { rotation: 8, transformOrigin: "20% 100%", duration: 0.6, ease: "back.out(3)", yoyo: true, repeat: 1 }, 1.4);
    // tail sway
    tl.to(el.tail, { rotation: 12, transformOrigin: "100px 134px", duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
    return tl;
  }

  function walkLoop() {
    var step = 0.17;
    var tl = gsap.timeline({ repeat: -1 });
    tl.to(el.body, { y: -3, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
    tl.to(el.headBob, { y: -2, rotation: -2, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1 }, step * 0.5);
    // paw/foot alternation
    tl.to(el.pawFL, { y: -6, rotation: -20, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%" }, 0);
    tl.to(el.pawFR, { y: -6, rotation: 20, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%" }, step * 0.5);
    tl.to(el.footL, { y: -5, rotation: -15, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%" }, step * 0.5);
    tl.to(el.footR, { y: -5, rotation: 15, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%" }, 0);
    // ear stream-back while running
    tl.to(el.earL, { rotation: 15, y: 3, transformOrigin: "80% 100%", duration: step * 2, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
    tl.to(el.earR, { rotation: -15, y: 3, transformOrigin: "20% 100%", duration: step * 2, ease: "sine.inOut", yoyo: true, repeat: -1 }, step);
    // tail streams behind
    tl.to(el.tail, { rotation: 20, transformOrigin: "100px 134px", duration: step * 2, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
    return tl;
  }

  function sleepLoop() {
    gsap.set(el.zzz, { opacity: 1 });
    var tl = gsap.timeline({ repeat: -1 });
    tl.to(el.body, { scaleY: 1.04, y: -1.5, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, 0);
    tl.to(el.headBob, { y: 4, rotation: 10, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, 0);
    // ears droop
    tl.to(el.earL, { rotation: 12, y: 4, transformOrigin: "80% 100%", duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    tl.to(el.earR, { rotation: -12, y: 4, transformOrigin: "20% 100%", duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    // tail curls tight
    tl.to(el.tail, { rotation: -18, transformOrigin: "100px 134px", duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
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
      tl.to(el.headBob, { y: 3.5, scaleY: 0.93, duration: 0.13, ease: "power2.out", transformOrigin: "50% 100%" }, t);
      tl.to(el.headBob, { y: 0, scaleY: 1, duration: 0.55, ease: "elastic.out(1,0.45)" }, t + 0.15);
      tl.to(el.body, { scaleY: 0.96, duration: 0.13, ease: "power2.out", transformOrigin: "50% 100%" }, t);
      tl.to(el.body, { scaleY: 1, duration: 0.55, ease: "elastic.out(1,0.5)" }, t + 0.15);
      // ear perks up when happy
      tl.to(el.earL, { rotation: -10, transformOrigin: "80% 100%", duration: 0.2, ease: "back.out(3)", yoyo: true, repeat: 1 }, t);
      tl.to(el.earR, { rotation: 10, transformOrigin: "20% 100%", duration: 0.2, ease: "back.out(3)", yoyo: true, repeat: 1 }, t + 0.1);
      var h = heartEls[n % heartEls.length];
      tl.fromTo(h, { x: 0, y: 0, opacity: 0, scale: 0.3 },
        { x: n ? 14 : -12, y: -30, opacity: 0, scale: 1.1, duration: 1.1, ease: "sine.out",
          keyframes: { opacity: [0, 1, 1, 0] } }, t + 0.08);
    });
    tl.to(el.tail, { rotation: 22, transformOrigin: "100px 134px", duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 5 }, 0);
    return tl;
  }

  /* "bored" = dangling in air — sugar glider spreads its glide membrane */
  function boredLoop() {
    gsap.set([el.wingL, el.wingR], { opacity: 0.7 });
    var tl = gsap.timeline({ repeat: -1 });
    tl.to(el.body, { rotation: -5, y: -2, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, 0);
    tl.to(el.headBob, { rotation: -8, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, 0.2);
    tl.to(el.wingL, { scaleX: 1.08, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "100% 50%" }, 0);
    tl.to(el.wingR, { scaleX: 1.08, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "0% 50%" }, 0);
    tl.to(el.earL, { rotation: -15, y: -5, transformOrigin: "80% 100%", duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    tl.to(el.earR, { rotation: 15, y: -5, transformOrigin: "20% 100%", duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
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

    var step = 0.15;
    var tl = gsap.timeline({ repeat: -1 });
    tl.to(el.body, { y: -2.5, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
    tl.to(el.headBob, { rotation: -4, duration: step, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%" }, step * 0.5);
    tl.to(el.earL, { rotation: -18, transformOrigin: "80% 100%", duration: step, ease: "power2.inOut", yoyo: true, repeat: -1 }, 0);
    tl.to(el.earR, { rotation: 18, transformOrigin: "20% 100%", duration: step, ease: "power2.inOut", yoyo: true, repeat: -1 }, step * 0.5);
    return tl;
  }

  function blink() {
    if (!el.lidL) { return; }
    var tl = gsap.timeline();
    tl.to(el.lidL, { attr: { height: 10 }, y: -2, duration: 0.07, ease: "power2.in" }, 0);
    tl.to(el.lidR, { attr: { height: 10 }, y: -2, duration: 0.07, ease: "power2.in" }, 0);
    tl.to(el.lidL, { attr: { height: 0 }, y: 0, duration: 0.11, ease: "power2.out" }, 0.1);
    tl.to(el.lidR, { attr: { height: 0 }, y: 0, duration: 0.11, ease: "power2.out" }, 0.1);
    blinkCall = gsap.delayedCall(rand(2.2, 5.5), blink);
  }

  var SugarGlider = {
    init: function (opts) {
      collect();
      gsap.set(el.zzz, { opacity: 0 });
      gsap.set(el.anger, { opacity: 0 });
      gsap.set([el.wingL, el.wingR], { opacity: 0 });
      gsap.set(heartEls, { opacity: 0 });
      this.setState(opts && opts.state ? opts.state : "sit");
      blinkCall = gsap.delayedCall(rand(1.5, 4), blink);
    },

    setState: function (name) {
      if (name === current) { return; }
      clearLoops();
      gsap.set(el.zzz, { opacity: 0 });
      gsap.set(el.anger, { opacity: 0 });
      gsap.set([el.wingL, el.wingR], { opacity: 0 });
      gsap.set(heartEls, { opacity: 0 });
      current = name;
      var loops = { sit: sitLoop, walk: walkLoop, sleep: sleepLoop, pat: patLoop, angry: angryLoop, bored: boredLoop, confront: boredLoop };
      var exprs = { sit: "curious", walk: "happy", sleep: "sleep", pat: "happy", angry: "angry", bored: "curious", confront: "angry" };
      setExpression(exprs[name] || "happy");
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
    groundSpeed: function () { return 55 * speed; },

    swipe: function (onImpact) {
      return new Promise(function (resolve) {
        clearLoops();
        var tl = gsap.timeline({ onComplete: resolve });
        tl.to(el.pawFR, { rotation: -60, y: -20, duration: 0.16, ease: "power3.in", transformOrigin: "50% 100%" }, 0);
        tl.call(function () { if (onImpact) { onImpact(); } }, null, 0.16);
        tl.to(el.pawFR, { rotation: 0, y: 0, duration: 0.4, ease: "back.out(2)", transformOrigin: "50% 100%" }, 0.18);
        tl.call(function () { SugarGlider.setState("sit"); }, null, 0.58);
      });
    }
  };

  global.SugarGliderRig = { mount: mount };
  global.SugarGlider = SugarGlider;
})(window);
