/* ------------------------------------------------------------------
   panda-rig.js — Seamless Seated & Upright Standing Panda Companion Rig 🐼
   ------------------------------------------------------------------
   Design space: 0 0 200 150 (ViewBox)
   Ground shelf: y = 137
   Paws on upper chest at y = 91; feet on ground shelf at y = 137
   Joint Anchoring: Shoulder sockets (76,70 & 124,70), Hip sockets (86,114 & 114,114)
   Sitting: Solid grounded seated posture with zero bottom gap & splayed pink paws
   Walking: Side-profile grounded waddle with 100% visible striding legs
   Namespace: window.PandaRig
------------------------------------------------------------------ */
(function (global) {
  "use strict";

  var MARKUP = [
    "    <defs>",
    "      <filter id=\"pandaSoftShadow\" x=\"-30%\" y=\"-120%\" width=\"160%\" height=\"340%\">",
    "        <feGaussianBlur stdDeviation=\"3.0\" />",
    "      </filter>",
    "    </defs>",
    "",
    "    <!-- Soft ground contact shadow directly beneath seated/standing body -->",
    "    <ellipse id=\"pandaShadow\" cx=\"100\" cy=\"138\" rx=\"42\" ry=\"6.5\" fill=\"#000\" opacity=\"0.32\" filter=\"url(#pandaSoftShadow)\" />",
    "",
    "    <!-- Fluffy tail behind body -->",
    "    <ellipse id=\"pandaTail\" cx=\"68\" cy=\"110\" rx=\"7\" ry=\"6\" fill=\"#141418\" stroke=\"#141418\" stroke-width=\"1.5\" />",
    "",
    "    <!-- Standing Hind Legs (Bipedal Walking & Marching - 100% Visible & Striding) -->",
    "    <g id=\"pandaLegBF\" opacity=\"0\">",
    "      <!-- Solid bipedal leg column -->",
    "      <path d=\"M 78,114 C 78,104 82,102 86,102 C 90,102 94,104 94,114 L 94,133 Q 86,137 78,133 Z\" fill=\"#141418\" stroke=\"#141418\" stroke-width=\"2\" stroke-linejoin=\"round\" />",
    "      <!-- Foot pad touching ground at y=137 -->",
    "      <ellipse cx=\"86\" cy=\"136\" rx=\"9\" ry=\"3.5\" fill=\"#141418\" />",
    "      <!-- Toe divider creases matching reference -->",
    "      <path d=\"M 82,133.5 L 82,137 M 86,134 L 86,137.5 M 90,133.5 L 90,137\" stroke=\"#2c2c36\" stroke-width=\"1.2\" stroke-linecap=\"round\" />",
    "    </g>",
    "",
    "    <g id=\"pandaLegBN\" opacity=\"0\">",
    "      <!-- Solid bipedal leg column -->",
    "      <path d=\"M 106,114 C 106,104 110,102 114,102 C 118,102 122,104 122,114 L 122,133 Q 114,137 106,133 Z\" fill=\"#141418\" stroke=\"#141418\" stroke-width=\"2\" stroke-linejoin=\"round\" />",
    "      <!-- Foot pad touching ground at y=137 -->",
    "      <ellipse cx=\"114\" cy=\"136\" rx=\"9.5\" ry=\"3.5\" fill=\"#141418\" />",
    "      <!-- Toe divider creases matching reference -->",
    "      <path d=\"M 110,133.5 L 110,137 M 114,134 L 114,137.5 M 118,133.5 L 118,137\" stroke=\"#2c2c36\" stroke-width=\"1.2\" stroke-linecap=\"round\" />",
    "    </g>",
    "",
    "    <!-- Original Cute Proportions: Compact Torso & Round White Belly -->",
    "    <g id=\"pandaBodyGroup\">",
    "      <g id=\"pandaBody\">",
    "        <!-- Seamless solid black torso base (Original Cute Proportions) -->",
    "        <path id=\"pandaTorsoBase\" d=\"M 76,74 C 64,88 66,112 82,122 C 90,127 110,127 118,122 C 134,112 136,88 124,74 C 118,66 82,66 76,74 Z\" fill=\"#141418\" stroke=\"#141418\" stroke-width=\"2.5\" stroke-linejoin=\"round\" />",
    "        <!-- Large round cuddly white belly patch inside torso -->",
    "        <ellipse id=\"pandaBelly\" cx=\"100\" cy=\"103\" rx=\"24\" ry=\"19\" fill=\"#ffffff\" stroke=\"#141418\" stroke-width=\"2\" />",
    "        <!-- Soft belly highlight -->",
    "        <ellipse id=\"pandaBellyInner\" cx=\"100\" cy=\"101\" rx=\"17\" ry=\"13\" fill=\"#fcfbfe\" />",
    "        <!-- Cute centered belly button / navel -->",
    "        <g id=\"pandaNavelGroup\">",
    "          <ellipse id=\"pandaNavel\" cx=\"100\" cy=\"116\" rx=\"2.2\" ry=\"1.4\" fill=\"#141418\" opacity=\"0.85\" />",
    "          <path d=\"M 98.2,115.4 Q 100,117.6 101.8,115.4\" fill=\"none\" stroke=\"#141418\" stroke-width=\"1.1\" stroke-linecap=\"round\" />",
    "        </g>",
    "",
    "        <!-- Far Arm / Hand (joint-locked to shoulder at 76,70) -->",
    "        <g id=\"pandaLegFF\" transform=\"rotate(-8 76 70)\">",
    "          <!-- Arm contour hanging down from shoulder along body flank to mitten paw -->",
    "          <path d=\"M 76,70 C 70,70 66,76 66,84 C 66,92 68,96 68,100 C 68,103 71,105 74,104 C 77,103 79,99 78,96 C 81,95 82,90 81,84 C 80,76 80,70 76,70 Z\" fill=\"#141418\" stroke=\"#141418\" stroke-width=\"2.2\" stroke-linejoin=\"round\" />",
    "          <!-- Wrist cuff crease matching reference -->",
    "          <path d=\"M 68,95 C 71,97 75,97 78,95\" fill=\"none\" stroke=\"#2c2e3e\" stroke-width=\"1.6\" stroke-linecap=\"round\" />",
    "          <!-- Inner thumb crease -->",
    "          <path d=\"M 75,98 Q 72,100 74,103\" fill=\"none\" stroke=\"#2c2e3e\" stroke-width=\"1.2\" stroke-linecap=\"round\" />",
    "        </g>",
    "        <!-- Near Arm / Strike Paw (joint-locked to shoulder at 124,70) -->",
    "        <g id=\"pandaLegFN\" transform=\"rotate(8 124 70)\">",
    "          <!-- Arm contour hanging down from shoulder along body flank to mitten paw -->",
    "          <path d=\"M 124,70 C 130,70 134,76 134,84 C 134,92 132,96 132,100 C 132,103 129,105 126,104 C 123,103 121,99 122,96 C 119,95 118,90 119,84 C 120,76 120,70 124,70 Z\" fill=\"#141418\" stroke=\"#141418\" stroke-width=\"2.2\" stroke-linejoin=\"round\" />",
    "          <!-- Wrist cuff crease matching reference -->",
    "          <path d=\"M 132,95 C 129,97 125,97 122,95\" fill=\"none\" stroke=\"#2c2e3e\" stroke-width=\"1.6\" stroke-linecap=\"round\" />",
    "          <!-- Inner thumb crease -->",
    "          <path d=\"M 125,98 Q 128,100 126,103\" fill=\"none\" stroke=\"#2c2e3e\" stroke-width=\"1.2\" stroke-linecap=\"round\" />",
    "        </g>",
    "      </g>",
    "    </g>",
    "",
    "    <!-- Sitting Grounded Base & Splayed Paws (Rendered ON TOP of lower body when sitting, zero gap) -->",
    "    <g id=\"pandaSitLegs\" opacity=\"1\">",
    "      <!-- Solid Seated Rump Base grounding the bottom to floor y=137 with zero gap -->",
    "      <path id=\"pandaSitRump\" d=\"M 74,116 C 66,122 64,132 72,137 L 128,137 C 136,132 134,122 126,116 Z\" fill=\"#141418\" stroke=\"#141418\" stroke-width=\"1.5\" stroke-linejoin=\"round\" />",
    "",
    "      <!-- Left Seated Foot -->",
    "      <g id=\"pandaSitLegL\">",
    "        <path d=\"M 76,114 C 64,116 56,122 56,128 C 56,134 62,137 72,137 C 80,137 82,132 82,124 Z\" fill=\"#141418\" stroke=\"#141418\" stroke-width=\"1.8\" stroke-linejoin=\"round\" />",
    "        <g id=\"pandaFootL\" transform=\"translate(68, 128) rotate(-18)\">",
    "          <ellipse id=\"pandaFootBaseL\" cx=\"0\" cy=\"0\" rx=\"7.2\" ry=\"9.0\" fill=\"#141418\" stroke=\"#141418\" stroke-width=\"1.2\" />",
    "          <!-- Main Large Pink Paw Pad -->",
    "          <ellipse id=\"pandaPadMainL\" cx=\"0\" cy=\"1.4\" rx=\"4.4\" ry=\"5.5\" fill=\"#fda4af\" />",
    "          <!-- 4 Pink Toe Beans across top arc -->",
    "          <ellipse id=\"pandaToeL1\" cx=\"-4.2\" cy=\"-6.0\" rx=\"1.4\" ry=\"1.6\" fill=\"#fda4af\" />",
    "          <ellipse id=\"pandaToeL2\" cx=\"-1.4\" cy=\"-7.3\" rx=\"1.5\" ry=\"1.7\" fill=\"#fda4af\" />",
    "          <ellipse id=\"pandaToeL3\" cx=\"1.4\" cy=\"-7.3\" rx=\"1.5\" ry=\"1.7\" fill=\"#fda4af\" />",
    "          <ellipse id=\"pandaToeL4\" cx=\"4.2\" cy=\"-6.0\" rx=\"1.4\" ry=\"1.6\" fill=\"#fda4af\" />",
    "        </g>",
    "      </g>",
    "",
    "      <!-- Right Seated Foot -->",
    "      <g id=\"pandaSitLegR\">",
    "        <path d=\"M 124,114 C 136,116 144,122 144,128 C 144,134 138,137 128,137 C 120,137 118,132 118,124 Z\" fill=\"#141418\" stroke=\"#141418\" stroke-width=\"1.8\" stroke-linejoin=\"round\" />",
    "        <g id=\"pandaFootR\" transform=\"translate(132, 128) rotate(18)\">",
    "          <ellipse id=\"pandaFootBaseR\" cx=\"0\" cy=\"0\" rx=\"7.2\" ry=\"9.0\" fill=\"#141418\" stroke=\"#141418\" stroke-width=\"1.2\" />",
    "          <!-- Main Large Pink Paw Pad -->",
    "          <ellipse id=\"pandaPadMainR\" cx=\"0\" cy=\"1.4\" rx=\"4.4\" ry=\"5.5\" fill=\"#fda4af\" />",
    "          <!-- 4 Pink Toe Beans across top arc -->",
    "          <ellipse id=\"pandaToeR1\" cx=\"-4.2\" cy=\"-6.0\" rx=\"1.4\" ry=\"1.6\" fill=\"#fda4af\" />",
    "          <ellipse id=\"pandaToeR2\" cx=\"-1.4\" cy=\"-7.3\" rx=\"1.5\" ry=\"1.7\" fill=\"#fda4af\" />",
    "          <ellipse id=\"pandaToeR3\" cx=\"1.4\" cy=\"-7.3\" rx=\"1.5\" ry=\"1.7\" fill=\"#fda4af\" />",
    "          <ellipse id=\"pandaToeR4\" cx=\"4.2\" cy=\"-6.0\" rx=\"1.4\" ry=\"1.6\" fill=\"#fda4af\" />",
    "        </g>",
    "      </g>",
    "    </g>",
    "",
    "    <!-- Head Assembly -->",
    "    <g id=\"pandaHeadBob\">",
    "      <g id=\"pandaHeadGroup\">",
    "        <!-- Plush Circular Ears rooted securely to skull base -->",
    "        <g id=\"pandaEarL\">",
    "          <circle cx=\"72\" cy=\"30\" r=\"12\" fill=\"#141418\" stroke=\"#2c2e3e\" stroke-width=\"1.8\" />",
    "          <ellipse cx=\"72\" cy=\"30\" rx=\"6.5\" ry=\"6.5\" fill=\"#1e202a\" />",
    "        </g>",
    "        <g id=\"pandaEarR\">",
    "          <circle cx=\"128\" cy=\"30\" r=\"12\" fill=\"#141418\" stroke=\"#2c2e3e\" stroke-width=\"1.8\" />",
    "          <ellipse cx=\"128\" cy=\"30\" rx=\"6.5\" ry=\"6.5\" fill=\"#1e202a\" />",
    "        </g>",
    "",
    "        <!-- Main Head & Facial Anatomy -->",
    "        <g id=\"pandaHead\">",
    "          <!-- Smooth Rounded Head Contour with Chubby Cheeks -->",
    "          <path d=\"M 100,26 C 124,26 137,38 138,53 C 139,69 124,78 100,78 C 76,78 61,69 62,53 C 63,38 76,26 100,26 Z\" fill=\"#ffffff\" stroke=\"#141418\" stroke-width=\"2.5\" />",
    "",
    "          <!-- Tilted Kidney Eye Patches like Reference -->",
    "          <g id=\"pandaPatchL\">",
    "            <ellipse cx=\"86\" cy=\"52\" rx=\"10\" ry=\"13\" transform=\"rotate(-16 86 52)\" fill=\"#141418\" />",
    "          </g>",
    "          <g id=\"pandaPatchR\">",
    "            <ellipse cx=\"114\" cy=\"52\" rx=\"10\" ry=\"13\" transform=\"rotate(16 114 52)\" fill=\"#141418\" />",
    "          </g>",
    "",
    "          <!-- Open Soulful Eyes with Dual Catchlights -->",
    "          <g id=\"pandaEyeL\">",
    "            <ellipse cx=\"86.5\" cy=\"52\" rx=\"5.2\" ry=\"5.2\" fill=\"#ffffff\" />",
    "            <ellipse id=\"pandaPupilL\" cx=\"86.5\" cy=\"52\" rx=\"4.0\" ry=\"4.0\" fill=\"#141418\" />",
    "            <!-- Major Catchlight (top-right) -->",
    "            <circle cx=\"88.0\" cy=\"50.2\" r=\"1.8\" fill=\"#ffffff\" />",
    "            <!-- Minor Catchlight (bottom-left) -->",
    "            <circle cx=\"85.0\" cy=\"53.8\" r=\"0.9\" fill=\"#ffffff\" />",
    "          </g>",
    "          <g id=\"pandaEyeR\">",
    "            <ellipse cx=\"113.5\" cy=\"52\" rx=\"5.2\" ry=\"5.2\" fill=\"#ffffff\" />",
    "            <ellipse id=\"pandaPupilR\" cx=\"113.5\" cy=\"52\" rx=\"4.0\" ry=\"4.0\" fill=\"#141418\" />",
    "            <!-- Major Catchlight (top-right) -->",
    "            <circle cx=\"115.0\" cy=\"50.2\" r=\"1.8\" fill=\"#ffffff\" />",
    "            <!-- Minor Catchlight (bottom-left) -->",
    "            <circle cx=\"112.0\" cy=\"53.8\" r=\"0.9\" fill=\"#ffffff\" />",
    "          </g>",
    "",
    "          <!-- Cute Closed Eye Arches (For clean anime blinking & sleeping) -->",
    "          <path id=\"pandaEyeClosedL\" d=\"M 81,52 Q 86.5,57 92,52\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"2.2\" stroke-linecap=\"round\" opacity=\"0\" />",
    "          <path id=\"pandaEyeClosedR\" d=\"M 108,52 Q 113.5,57 119,52\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"2.2\" stroke-linecap=\"round\" opacity=\"0\" />",
    "",
    "          <!-- Soft Sweet Cheek Blush — positioned comfortably on chubby cheeks -->",
    "          <ellipse id=\"pandaBlushL\" cx=\"72\" cy=\"65.5\" rx=\"5.0\" ry=\"3.2\" fill=\"#fb7185\" opacity=\"0.75\" />",
    "          <ellipse id=\"pandaBlushR\" cx=\"128\" cy=\"65.5\" rx=\"5.0\" ry=\"3.2\" fill=\"#fb7185\" opacity=\"0.75\" />",
    "",
    "          <!-- Rounded Nose -->",
    "          <path id=\"pandaNose\" d=\"M 96.5,57.5 C 96.5,56 98,55 100,55 C 102,55 103.5,56 103.5,57.5 C 103.5,60 101,61.5 100,61.5 C 99,61.5 96.5,60 96.5,57.5 Z\" fill=\"#141418\" />",
    "          <ellipse cx=\"99.5\" cy=\"56.5\" rx=\"1.3\" ry=\"0.6\" fill=\"#ffffff\" opacity=\"0.6\" />",
    "",
    "          <!-- Open Smiling Mouth with Pink Tongue -->",
    "          <g id=\"pandaMouth\">",
    "            <path d=\"M 100,61.5 L 100,63.5 M 96,63.5 Q 98,64.8 100,63.5 Q 102,64.8 104,63.5\" fill=\"none\" stroke=\"#141418\" stroke-width=\"1.4\" stroke-linecap=\"round\" />",
    "            <path d=\"M 96,63.5 Q 100,72 104,63.5 Z\" fill=\"#3a101d\" stroke=\"#141418\" stroke-width=\"1.2\" />",
    "            <path d=\"M 97.2,66 Q 100,64.5 102.8,66 Q 100,71.2 97.2,66 Z\" fill=\"#f472b6\" />",
    "          </g>",
    "        </g>",
    "      </g>",
    "    </g>",
    "",
    "    <!-- Overlays & Props -->",
    "    <g id=\"pandaAnger\" opacity=\"0\" aria-hidden=\"true\">",
    "      <path d=\"M 124,18 Q 130,16 134,20 M 134,16 Q 130,20 126,22\" stroke=\"#ef4444\" stroke-width=\"2.2\" stroke-linecap=\"round\" />",
    "    </g>",
    "    <g id=\"pandaHearts\" opacity=\"0\" aria-hidden=\"true\">",
    "      <path id=\"pandaHeart\" d=\"M 100,14 C 96,8 92,12 96,16 L 100,20 L 104,16 C 108,12 104,8 100,14 Z\" fill=\"#ec4899\" />",
    "    </g>",
    "    <g id=\"pandaZzz\" opacity=\"0\" aria-hidden=\"true\">",
    "      <text id=\"pandaZ1\" x=\"124\" y=\"26\" fill=\"#93c5fd\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"12\">Z</text>",
    "      <text id=\"pandaZ2\" x=\"132\" y=\"16\" fill=\"#93c5fd\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"10\">z</text>",
    "      <text id=\"pandaZ3\" x=\"138\" y=\"8\" fill=\"#93c5fd\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"8\">z</text>",
    "    </g>"
  ].join("\n");

  var el = {};
  var current = "sit";
  var loop = null;
  var subLoop = null;
  var actionTl = null;
  var blinkCall = null;
  var twitchCall = null;
  var lookCall = null;
  var pendingSwipeResolve = null;
  var speed = 1;
  var tempo = 1;
  var generation = 0;
  var facing = 1;

  var PANDA_BASE_SPEED = 46;

  function $(id) { return document.getElementById(id); }

  function collect() {
    el = {
      pandaRoot: $("pandaRoot"),
      panda: $("panda"),
      shadow: $("pandaShadow"),
      bodyGroup: $("pandaBodyGroup"),
      body: $("pandaBody"),
      torsoBase: $("pandaTorsoBase"),
      belly: $("pandaBelly"),
      bellyInner: $("pandaBellyInner"),
      navel: $("pandaNavel"),
      navelGroup: $("pandaNavelGroup"),
      tail: $("pandaTail"),
      legBF: $("pandaLegBF"),
      legFF: $("pandaLegFF"),
      legBN: $("pandaLegBN"),
      legFN: $("pandaLegFN"),
      sitLegs: $("pandaSitLegs"),
      sitRump: $("pandaSitRump"),
      sitLegL: $("pandaSitLegL"),
      sitLegR: $("pandaSitLegR"),
      footL: $("pandaFootL"),
      footR: $("pandaFootR"),
      padMainL: $("pandaPadMainL"),
      padMainR: $("pandaPadMainR"),
      toeL1: $("pandaToeL1"),
      toeL2: $("pandaToeL2"),
      toeL3: $("pandaToeL3"),
      toeL4: $("pandaToeL4"),
      toeR1: $("pandaToeR1"),
      toeR2: $("pandaToeR2"),
      toeR3: $("pandaToeR3"),
      toeR4: $("pandaToeR4"),
      headBob: $("pandaHeadBob"),
      headGroup: $("pandaHeadGroup"),
      head: $("pandaHead"),
      earL: $("pandaEarL"),
      earR: $("pandaEarR"),
      eyeL: $("pandaEyeL"),
      eyeR: $("pandaEyeR"),
      eyeClosedL: $("pandaEyeClosedL"),
      eyeClosedR: $("pandaEyeClosedR"),
      pupilL: $("pandaPupilL"),
      pupilR: $("pandaPupilR"),
      patchL: $("pandaPatchL"),
      patchR: $("pandaPatchR"),
      blushL: $("pandaBlushL"),
      blushR: $("pandaBlushR"),
      mouth: $("pandaMouth"),
      nose: $("pandaNose"),
      anger: $("pandaAnger"),
      hearts: $("pandaHearts"),
      heart: $("pandaHeart"),
      zzz: $("pandaZzz"),
      z1: $("pandaZ1"),
      z2: $("pandaZ2"),
      z3: $("pandaZ3")
    };
  }

  function clearTimers() {
    if (blinkCall) { blinkCall.kill(); blinkCall = null; }
    if (twitchCall) { twitchCall.kill(); twitchCall = null; }
    if (lookCall) { lookCall.kill(); lookCall = null; }
  }

  function clearLoops() {
    if (pendingSwipeResolve) {
      var fn = pendingSwipeResolve;
      pendingSwipeResolve = null;
      fn();
    }
    if (loop) { loop.kill(); loop = null; }
    if (subLoop) { subLoop.kill(); subLoop = null; }
    if (actionTl) { actionTl.kill(); actionTl = null; }
    clearTimers();

    var targets = [
      el.panda, el.body, el.bodyGroup, el.torsoBase, el.tail,
      el.belly, el.bellyInner, el.navel, el.navelGroup,
      el.headBob, el.headGroup, el.head,
      el.legBF, el.legFF, el.legBN, el.legFN,
      el.sitLegs, el.sitRump, el.sitBellyBase, el.sitLegL, el.sitLegR, el.footL, el.footR,
      el.padMainL, el.padMainR,
      el.earL, el.earR, el.eyeL, el.eyeR,
      el.eyeClosedL, el.eyeClosedR,
      el.pupilL, el.pupilR, el.nose, el.mouth,
      el.patchL, el.patchR, el.shadow,
      el.blushL, el.blushR, el.anger, el.hearts, el.heart,
      el.zzz, el.z1, el.z2, el.z3
    ].filter(Boolean);

    if (targets.length) {
      gsap.killTweensOf(targets);
    }
  }

  /* ---------------------------------------------------------------
     Life: Natural Anime Blinking, Ear Jiggles & Head Tilts
  --------------------------------------------------------------- */
  function scheduleBlink() {
    if (current === "sleep" || !el.eyeL || !el.eyeR) { return; }
    var delay = 2.5 + Math.random() * 3.5;
    blinkCall = gsap.delayedCall(delay, function () {
      if (current === "sleep" || !el.eyeL || !el.eyeR) { return; }
      if (el.eyeClosedL && el.eyeClosedR) {
        gsap.timeline()
          .to([el.eyeL, el.eyeR], { opacity: 0, duration: 0.06 })
          .to([el.eyeClosedL, el.eyeClosedR], { opacity: 1, duration: 0.06 }, 0)
          .to([el.eyeL, el.eyeR], { opacity: 1, duration: 0.09 }, 0.08)
          .to([el.eyeClosedL, el.eyeClosedR], { opacity: 0, duration: 0.09 }, 0.08)
          .eventCallback("onComplete", scheduleBlink);
      } else {
        gsap.timeline()
          .to([el.eyeL, el.eyeR], { scaleY: 0.2, transformOrigin: "50% 50%", duration: 0.06 })
          .to([el.eyeL, el.eyeR], { scaleY: 1.0, transformOrigin: "50% 50%", duration: 0.09 }, 0.08)
          .eventCallback("onComplete", scheduleBlink);
      }
    });
  }

  function scheduleEarTwitch() {
    if (current === "sleep" || current === "angry" || !el.earL || !el.earR) { return; }
    var delay = 3.2 + Math.random() * 4.5;
    twitchCall = gsap.delayedCall(delay, function () {
      if (current === "sleep" || current === "angry" || !el.earL || !el.earR) { return; }
      var isRight = Math.random() > 0.45;
      var ear = isRight ? el.earR : el.earL;
      var origin = isRight ? "33% 85%" : "67% 85%";
      var angle = isRight ? 10 : -10;
      gsap.timeline()
        .to(ear, { rotation: angle, transformOrigin: origin, duration: 0.07, yoyo: true, repeat: 3, ease: "sine.inOut" })
        .to(ear, { rotation: 0, transformOrigin: origin, duration: 0.12, ease: "power1.out" })
        .eventCallback("onComplete", scheduleEarTwitch);
    });
  }

  function scheduleMicroLook() {
    if (current !== "sit" || !el.headGroup) { return; }
    var delay = 5.0 + Math.random() * 5.0;
    lookCall = gsap.delayedCall(delay, function () {
      if (current !== "sit" || !el.headGroup) { return; }
      var tilt = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);
      var shiftX = tilt > 0 ? 1.5 : -1.5;
      gsap.timeline()
        .to(el.headGroup, { rotation: tilt, x: shiftX, transformOrigin: "50% 92%", duration: 0.8, ease: "sine.inOut" })
        .to(el.headGroup, { rotation: 0, x: 0, transformOrigin: "50% 92%", duration: 0.8, delay: 1.4, ease: "sine.inOut" })
        .eventCallback("onComplete", scheduleMicroLook);
    });
  }

  /* ---------------------------------------------------------------
     1. SIT / IDLE: Exact Seated Posture on Floor with Zero Bottom Gap
     - Original cute compact proportions
     - Solid grounded rump base & lower belly fill eliminating bottom gap
     - Splayed hind paws with pink pads & 4 pink toe beans
     - Hands resting naturally along the flanks
     - Diaphragm breathing, soulful blinking, ear twitches, micro-looks
  --------------------------------------------------------------- */
  function startSitLoop() {
    tempo = 1.0;
    var dur = 1.7 / (speed * tempo);

    loop = gsap.timeline({ repeat: -1, yoyo: true });

    if (el.body) {
      loop.to(el.body, { scaleY: 1.015, scaleX: 1.008, y: -0.4, transformOrigin: "50% 85%", duration: dur, ease: "sine.inOut" }, 0);
    }
    if (el.headBob) {
      loop.to(el.headBob, { y: -0.5, duration: dur, ease: "sine.inOut" }, 0.08);
    }
    if (el.shadow) {
      loop.to(el.shadow, { scaleX: 0.98, opacity: 0.30, transformOrigin: "50% 50%", duration: dur, ease: "sine.inOut" }, 0);
    }
    if (el.sitLegs) {
      loop.to(el.sitLegs, { scaleY: 1.01, scaleX: 1.005, transformOrigin: "50% 85%", duration: dur, ease: "sine.inOut" }, 0);
    }
    if (el.tail) {
      loop.to(el.tail, { rotation: 2, transformOrigin: "85% 50%", duration: dur, ease: "sine.inOut" }, 0.15);
    }

    scheduleBlink();
    scheduleEarTwitch();
    scheduleMicroLook();
  }

  /* ---------------------------------------------------------------
     2. WALK: Side-Facing Dynamic Profile Walk (100% Visible Walking Legs)
  --------------------------------------------------------------- */
  function startWalkLoop() {
    tempo = 1.0;
    var cycleDur = 0.68 / (speed * tempo);
    var half = cycleDur / 2;

    if (el.headGroup) {
      gsap.to(el.headGroup, { x: 6, rotation: 3.0, transformOrigin: "50% 92%", duration: 0.18, ease: "sine.out" });
    }
    if (el.patchL && el.eyeL) {
      gsap.to([el.patchL, el.eyeL], { x: 2.0, scaleX: 0.90, transformOrigin: "50% 50%", duration: 0.18, ease: "sine.out" });
    }
    if (el.patchR && el.eyeR) {
      gsap.to([el.patchR, el.eyeR], { x: 2.5, scaleX: 1.0, transformOrigin: "50% 50%", duration: 0.18, ease: "sine.out" });
    }
    if (el.nose) {
      gsap.to(el.nose, { x: 3.0, y: 0.5, duration: 0.18, ease: "sine.out" });
    }
    if (el.mouth) {
      gsap.to(el.mouth, { x: 3.0, y: 0.5, duration: 0.18, ease: "sine.out" });
    }
    if (el.blushL && el.blushR) {
      gsap.to(el.blushL, { x: 1.0, scaleX: 0.85, transformOrigin: "50% 50%", duration: 0.18, ease: "sine.out" });
      gsap.to(el.blushR, { x: -1.0, scaleX: 0.95, transformOrigin: "50% 50%", duration: 0.18, ease: "sine.out" });
    }
    if (el.belly && el.bellyInner) {
      gsap.to([el.belly, el.bellyInner], { x: 3.5, duration: 0.18, ease: "sine.out" });
    }
    if (el.navelGroup) {
      gsap.to(el.navelGroup, { x: 3.5, duration: 0.18, ease: "sine.out" });
    }
    if (el.tail) {
      gsap.to(el.tail, { x: -4, rotation: 8, transformOrigin: "85% 50%", duration: 0.18, ease: "sine.out" });
    }

    loop = gsap.timeline({ repeat: -1 });

    if (el.body) {
      loop.to(el.body, { y: -2.8, rotation: 2.0, duration: half, ease: "sine.inOut" }, 0)
          .to(el.body, { y: 0, rotation: -2.0, duration: half, ease: "sine.inOut" }, half);
    }
    if (el.headBob) {
      loop.to(el.headBob, { y: -1.8, rotation: 1.5, duration: half, ease: "sine.inOut" }, 0)
          .to(el.headBob, { y: 0.4, rotation: -1.5, duration: half, ease: "sine.inOut" }, half);
    }
    if (el.shadow) {
      loop.to(el.shadow, { scaleX: 0.88, opacity: 0.22, duration: half, ease: "sine.inOut" }, 0)
          .to(el.shadow, { scaleX: 1.04, opacity: 0.32, duration: half, ease: "sine.inOut" }, half);
    }

    subLoop = gsap.timeline({ repeat: -1 });
    if (el.legBN && el.legBF) {
      subLoop.to(el.legBN, { rotation: 24, y: -2, transformOrigin: "50% 15%", duration: half, ease: "sine.inOut" }, 0)
             .to(el.legBN, { rotation: -24, y: 0, transformOrigin: "50% 15%", duration: half, ease: "sine.inOut" }, half);

      subLoop.to(el.legBF, { rotation: -24, y: 0, transformOrigin: "50% 15%", duration: half, ease: "sine.inOut" }, 0)
             .to(el.legBF, { rotation: 24, y: -2, transformOrigin: "50% 15%", duration: half, ease: "sine.inOut" }, half);
    }

    if (el.legFN && el.legFF) {
      subLoop.to(el.legFN, { rotation: -20, transformOrigin: "50% 6%", duration: half, ease: "sine.inOut" }, 0)
             .to(el.legFN, { rotation: 20, transformOrigin: "50% 6%", duration: half, ease: "sine.inOut" }, half);

      subLoop.to(el.legFF, { rotation: 20, transformOrigin: "50% 6%", duration: half, ease: "sine.inOut" }, 0)
             .to(el.legFF, { rotation: -20, transformOrigin: "50% 6%", duration: half, ease: "sine.inOut" }, half);
    }

    scheduleBlink();
    scheduleEarTwitch();
  }

  /* ---------------------------------------------------------------
     3. SLEEP: Deep Peaceful Slumber
  --------------------------------------------------------------- */
  function startSleepLoop() {
    tempo = 0.65;
    var dur = 2.4 / (speed * tempo);

    if (el.eyeL && el.eyeR) { gsap.to([el.eyeL, el.eyeR], { opacity: 0, duration: 0.2 }); }
    if (el.eyeClosedL && el.eyeClosedR) { gsap.to([el.eyeClosedL, el.eyeClosedR], { opacity: 1, duration: 0.2 }); }
    if (el.headBob) { gsap.to(el.headBob, { y: 2.2, rotation: -2, transformOrigin: "50% 92%", duration: 0.4 }); }
    if (el.body) { gsap.to(el.body, { y: 1.5, scaleY: 0.97, scaleX: 1.03, transformOrigin: "50% 85%", duration: 0.4 }); }

    if (el.zzz) {
      gsap.to(el.zzz, { opacity: 1, duration: 0.3 });
    }

    loop = gsap.timeline({ repeat: -1, yoyo: true });
    if (el.body) {
      loop.to(el.body, { scaleY: 1.03, scaleX: 0.98, y: 0.6, duration: dur, ease: "sine.inOut" }, 0);
    }
    if (el.headBob) {
      loop.to(el.headBob, { y: 1.4, duration: dur, ease: "sine.inOut" }, 0.2);
    }

    if (el.z1 && el.z2 && el.z3) {
      subLoop = gsap.timeline({ repeat: -1 });
      subLoop.fromTo(el.z1, { opacity: 0, y: 4, scale: 0.7 }, { opacity: 1, y: -6, scale: 1.0, duration: dur * 0.45, ease: "power1.out" }, 0)
             .to(el.z1, { opacity: 0, y: -12, duration: dur * 0.3 }, dur * 0.45)
             .fromTo(el.z2, { opacity: 0, y: 4, scale: 0.7 }, { opacity: 1, y: -8, scale: 1.1, duration: dur * 0.45, ease: "power1.out" }, dur * 0.25)
             .to(el.z2, { opacity: 0, y: -14, duration: dur * 0.3 }, dur * 0.70)
             .fromTo(el.z3, { opacity: 0, y: 4, scale: 0.7 }, { opacity: 1, y: -10, scale: 1.2, duration: dur * 0.45, ease: "power1.out" }, dur * 0.50)
             .to(el.z3, { opacity: 0, y: -16, duration: dur * 0.3 }, dur * 0.95);
    }
  }

  /* ---------------------------------------------------------------
     4. PAT: Delighted Celebration
  --------------------------------------------------------------- */
  function startPatLoop() {
    tempo = 1.6;
    var dur = 0.36 / (speed * tempo);

    if (el.blushL && el.blushR) {
      gsap.to([el.blushL, el.blushR], { opacity: 1.0, scale: 1.3, transformOrigin: "50% 50%", duration: 0.2 });
    }
    if (el.hearts) {
      gsap.to(el.hearts, { opacity: 1, duration: 0.2 });
    }

    loop = gsap.timeline({ repeat: -1, yoyo: true });
    if (el.body) {
      loop.to(el.body, { y: -4.5, scaleY: 1.06, scaleX: 0.96, transformOrigin: "50% 85%", duration: dur, ease: "power2.out" }, 0);
    }
    if (el.headBob) {
      loop.to(el.headBob, { y: -5.0, rotation: 3.0, transformOrigin: "50% 92%", duration: dur, ease: "power2.out" }, 0.03);
    }
    if (el.shadow) {
      loop.to(el.shadow, { scaleX: 0.82, opacity: 0.20, transformOrigin: "50% 50%", duration: dur, ease: "power2.out" }, 0);
    }
    if (el.legFN && el.legFF) {
      loop.to(el.legFN, { rotation: -65, transformOrigin: "50% 6%", duration: dur, ease: "power2.out" }, 0)
          .to(el.legFF, { rotation: 65, transformOrigin: "50% 6%", duration: dur, ease: "power2.out" }, 0);
    }
    if (el.earL && el.earR) {
      loop.to(el.earL, { rotation: -16, transformOrigin: "67% 85%", duration: dur, ease: "sine.inOut" }, 0)
          .to(el.earR, { rotation: 16, transformOrigin: "33% 85%", duration: dur, ease: "sine.inOut" }, 0);
    }

    if (el.heart) {
      subLoop = gsap.timeline({ repeat: -1 });
      subLoop.fromTo(el.heart,
        { scale: 0.5, y: 0, opacity: 0.2, transformOrigin: "50% 50%" },
        { scale: 1.25, y: -12, opacity: 1, duration: 0.55, ease: "power1.out" }
      ).to(el.heart, { opacity: 0, y: -18, scale: 0.8, duration: 0.25, ease: "power1.in" });
    }

    scheduleBlink();
  }

  /* ---------------------------------------------------------------
     5. ANGRY: Stomping Tantrum
  --------------------------------------------------------------- */
  function startAngryLoop() {
    tempo = 1.3;
    var cycleDur = 0.44 / (speed * tempo);
    var half = cycleDur / 2;

    if (el.anger) {
      gsap.to(el.anger, { opacity: 1, duration: 0.2 });
    }
    if (el.patchL && el.patchR) {
      gsap.to(el.patchL, { rotation: -24, transformOrigin: "50% 50%", duration: 0.2 });
      gsap.to(el.patchR, { rotation: 24, transformOrigin: "50% 50%", duration: 0.2 });
    }
    if (el.mouth) {
      gsap.to(el.mouth, { y: 1.5, scaleY: 0.7, transformOrigin: "50% 50%", duration: 0.2 });
    }

    loop = gsap.timeline({ repeat: -1 });
    if (el.body) {
      loop.to(el.body, { y: -3.5, rotation: 3.5, transformOrigin: "50% 85%", duration: half, ease: "power2.in" }, 0)
          .to(el.body, { y: 0, rotation: -3.5, transformOrigin: "50% 85%", duration: half, ease: "power2.in" }, half);
    }
    if (el.headBob) {
      loop.to(el.headBob, { y: -3.0, rotation: -2.5, duration: half, ease: "power2.in" }, 0)
          .to(el.headBob, { y: 0.5, rotation: 2.5, duration: half, ease: "power2.in" }, half);
    }
    if (el.legFN && el.legFF) {
      loop.to(el.legFN, { rotation: -28, transformOrigin: "50% 6%", duration: half, yoyo: true, repeat: 1, ease: "power1.inOut" }, 0)
          .to(el.legFF, { rotation: 28, transformOrigin: "50% 6%", duration: half, yoyo: true, repeat: 1, ease: "power1.inOut" }, 0);
    }

    subLoop = gsap.timeline({ repeat: -1 });
    if (el.legBN && el.legBF) {
      subLoop.to(el.legBN, { rotation: 8, transformOrigin: "50% 15%", duration: half, ease: "power2.inOut" }, 0)
             .to(el.legBN, { rotation: -8, transformOrigin: "50% 15%", duration: half, ease: "power2.inOut" }, half);

      subLoop.to(el.legBF, { rotation: -8, transformOrigin: "50% 15%", duration: half, ease: "power2.inOut" }, 0)
             .to(el.legBF, { rotation: 8, transformOrigin: "50% 15%", duration: half, ease: "power2.inOut" }, half);
    }

    if (el.anger) {
      subLoop.to(el.anger, { scale: 1.3, duration: 0.20, yoyo: true, repeat: 1, transformOrigin: "50% 50%", ease: "power1.inOut" }, 0);
    }
  }

  /* ---------------------------------------------------------------
     6. CONFRONT: Coiled back onto haunches, outstretched paw poised to strike
  --------------------------------------------------------------- */
  function startConfrontLoop() {
    tempo = 1.0;

    if (el.body) { gsap.to(el.body, { y: 1.5, rotation: -2.5, transformOrigin: "50% 85%", duration: 0.3, ease: "power2.out" }); }
    if (el.headBob) { gsap.to(el.headBob, { y: 1.0, duration: 0.3, ease: "power2.out" }); }
    if (el.legFN) { gsap.to(el.legFN, { rotation: -48, y: -2, transformOrigin: "50% 6%", duration: 0.3, ease: "power2.out" }); }
    if (el.legFF) { gsap.to(el.legFF, { rotation: 32, transformOrigin: "50% 6%", duration: 0.3, ease: "power2.out" }); }
    if (el.eyeL && el.eyeR) { gsap.to([el.eyeL, el.eyeR], { scaleY: 0.7, transformOrigin: "50% 50%", duration: 0.3, ease: "power2.out" }); }

    loop = gsap.timeline({ repeat: -1, yoyo: true });
    if (el.body) { loop.to(el.body, { y: 1.2, duration: 0.7, ease: "sine.inOut" }, 0); }
  }

  /* ---------------------------------------------------------------
     7. BORED: Heavy relaxed slouch, half-lids, low energy
  --------------------------------------------------------------- */
  function startBoredLoop() {
    tempo = 0.8;
    var dur = 2.4 / (speed * tempo);

    if (el.eyeL && el.eyeR) {
      gsap.to([el.eyeL, el.eyeR], { scaleY: 0.5, transformOrigin: "50% 50%", duration: 0.4 });
    }
    if (el.headGroup) {
      gsap.to(el.headGroup, { y: 1.8, rotation: -2.2, transformOrigin: "50% 92%", duration: 0.4 });
    }

    loop = gsap.timeline({ repeat: -1, yoyo: true });
    if (el.body) {
      loop.to(el.body, { y: 1.0, scaleY: 0.98, transformOrigin: "50% 85%", duration: dur, ease: "sine.inOut" }, 0);
    }
    if (el.headBob) {
      loop.to(el.headBob, { y: 0.8, duration: dur, ease: "sine.inOut" }, 0.1);
    }

    scheduleBlink();
    scheduleEarTwitch();
  }

  var PandaRig = {
    /**
     * Mount Panda SVG markup into the target container.
     */
    mount: function (container) {
      var wrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
      wrapper.setAttribute("id", "pandaRoot");
      wrapper.innerHTML = '<g id="panda">' + MARKUP + '</g>';
      container.appendChild(wrapper);
      collect();
      return wrapper;
    },

    /**
     * Unmount Panda SVG markup from scene.
     */
    unmount: function () {
      clearLoops();
      var root = $("pandaRoot");
      if (root && root.parentNode) {
        root.parentNode.removeChild(root);
      }
      el = {};
    },

    /**
     * Initialize companion state.
     */
    init: function (opts) {
      collect();
      opts = opts || {};
      speed = opts.speed || 1;
      this.setState(opts.state || "sit");
    },

    /**
     * Transition companion to the target state seamlessly.
     */
    setState: function (name) {
      clearLoops();
      current = name;

      var blushTarget = (name === "pat") ? 1.0 : 0.75;
      if (el.blushL && el.blushR) {
        gsap.to([el.blushL, el.blushR], { opacity: blushTarget, x: 0, y: 0, duration: 0.15 });
      }
      var overlays = [el.anger, el.hearts, el.zzz].filter(Boolean);
      if (overlays.length) {
        gsap.to(overlays, { opacity: 0, duration: 0.15 });
      }
      if (name !== "sleep" && name !== "pat") {
        if (el.eyeL && el.eyeR) { gsap.to([el.eyeL, el.eyeR], { opacity: 1, scaleY: 1, scaleX: 1, x: 0, y: 0, duration: 0.15 }); }
        if (el.eyeClosedL && el.eyeClosedR) { gsap.to([el.eyeClosedL, el.eyeClosedR], { opacity: 0, duration: 0.15 }); }
      }
      if (el.patchL && el.patchR) {
        gsap.to(el.patchL, { rotation: 0, x: 0, y: 0, scaleX: 1, transformOrigin: "50% 50%", duration: 0.15 });
        gsap.to(el.patchR, { rotation: 0, x: 0, y: 0, scaleX: 1, transformOrigin: "50% 50%", duration: 0.15 });
      }
      if (el.earL && el.earR) {
        gsap.to(el.earL, { rotation: 0, x: 0, y: 0, transformOrigin: "67% 85%", duration: 0.15 });
        gsap.to(el.earR, { rotation: 0, x: 0, y: 0, transformOrigin: "33% 85%", duration: 0.15 });
      }
      if (el.headGroup) { gsap.to(el.headGroup, { rotation: 0, x: 0, y: 0, scaleX: 1, transformOrigin: "50% 92%", duration: 0.15 }); }
      if (el.headBob) { gsap.to(el.headBob, { rotation: 0, x: 0, y: 0, duration: 0.15 }); }
      if (el.nose) { gsap.to(el.nose, { x: 0, y: 0, duration: 0.15 }); }
      if (el.mouth) { gsap.to(el.mouth, { x: 0, y: 0, duration: 0.15 }); }
      if (el.belly && el.bellyInner) { gsap.to([el.belly, el.bellyInner], { x: 0, y: 0, duration: 0.15 }); }
      if (el.navelGroup) { gsap.to(el.navelGroup, { x: 0, y: 0, duration: 0.15 }); }
      if (el.tail) { gsap.to(el.tail, { rotation: 0, x: 0, y: 0, transformOrigin: "85% 50%", duration: 0.15 }); }
      if (el.panda) { gsap.to(el.panda, { rotation: 0, x: 0, y: 0, transformOrigin: "50% 95%", duration: 0.15 }); }
      if (el.body) { gsap.to(el.body, { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: "50% 85%", duration: 0.15 }); }
      if (el.bodyGroup) { gsap.to(el.bodyGroup, { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: "50% 85%", duration: 0.15 }); }

      // Seamless limb reset to fixed joints and normal resting posture at rest
      if (el.legFN) { gsap.to(el.legFN, { rotation: 0, x: 0, y: 0, transformOrigin: "50% 6%", duration: 0.15 }); }
      if (el.legFF) { gsap.to(el.legFF, { rotation: 0, x: 0, y: 0, transformOrigin: "50% 6%", duration: 0.15 }); }
      if (el.legBN) { gsap.to(el.legBN, { rotation: 0, x: 0, y: 0, transformOrigin: "50% 15%", duration: 0.15 }); }
      if (el.legBF) { gsap.to(el.legBF, { rotation: 0, x: 0, y: 0, transformOrigin: "50% 15%", duration: 0.15 }); }

      // Sitting pose vs Standing pose limb handling
      if (name === "sit") {
        if (el.sitLegs) { gsap.to(el.sitLegs, { opacity: 1, duration: 0.15 }); }
        if (el.legBF && el.legBN) { gsap.to([el.legBF, el.legBN], { opacity: 0, duration: 0.15 }); }
        if (el.shadow) { gsap.to(el.shadow, { rx: 42, ry: 6.5, opacity: 0.32, duration: 0.15 }); }
        // Relaxed resting arms resting comfortably along the side flanks framing the white belly
        if (el.legFN) { gsap.to(el.legFN, { rotation: 8, transformOrigin: "50% 6%", duration: 0.15 }); }
        if (el.legFF) { gsap.to(el.legFF, { rotation: -8, transformOrigin: "50% 6%", duration: 0.15 }); }
      } else {
        if (el.sitLegs) { gsap.to(el.sitLegs, { opacity: 0, duration: 0.15 }); }
        if (el.legBF && el.legBN) { gsap.to([el.legBF, el.legBN], { opacity: 1, duration: 0.15 }); }
        if (el.shadow) { gsap.to(el.shadow, { rx: 36, ry: 5.5, opacity: 0.30, duration: 0.15 }); }
      }

      switch (name) {
        case "walk":
          startWalkLoop();
          break;
        case "sleep":
          startSleepLoop();
          break;
        case "pat":
          startPatLoop();
          break;
        case "angry":
          startAngryLoop();
          break;
        case "confront":
          startConfrontLoop();
          break;
        case "bored":
          startBoredLoop();
          break;
        case "sit":
        default:
          startSitLoop();
          break;
      }
    },

    /**
     * Get current state name.
     */
    getState: function () {
      return current;
    },

    /**
     * Set animation playback speed.
     */
    setSpeed: function (multiplier) {
      speed = Math.max(0.2, multiplier || 1);
      if (loop) { loop.timeScale(speed * tempo); }
      if (subLoop) { subLoop.timeScale(speed * tempo); }
    },

    /**
     * Set facing direction (1 = right, -1 = left).
     */
    setFacing: function (direction) {
      facing = direction >= 0 ? 1 : -1;
      if (el.panda) {
        gsap.set(el.panda, { scaleX: facing, transformOrigin: "50% 50%" });
      }
    },

    /**
     * Ground speed in design units/second.
     */
    groundSpeed: function () {
      return PANDA_BASE_SPEED * speed * tempo;
    },

    /**
     * Trigger explicit pat reaction.
     */
    pat: function () {
      this.setState("pat");
    },

    /**
     * Perform high-priority one-shot swipe attack with onImpact callback.
     */
    swipe: function (onImpact) {
      var prev = current;
      clearLoops();
      var myGen = ++generation;

      if (el.anger) {
        gsap.to(el.anger, { opacity: 1, duration: 0.1 });
      }
      if (el.patchL && el.patchR) {
        gsap.to(el.patchL, { rotation: -20, transformOrigin: "50% 50%", duration: 0.12 });
        gsap.to(el.patchR, { rotation: 20, transformOrigin: "50% 50%", duration: 0.12 });
      }

      actionTl = gsap.timeline({
        onComplete: function () {
          actionTl = null;
          pendingSwipeResolve = null;
          if (generation === myGen) {
            PandaRig.setState(prev);
          }
        }
      });

      // Wind-up
      if (el.legFN) {
        actionTl.to(el.legFN, { rotation: -75, y: -4, transformOrigin: "50% 6%", duration: 0.16, ease: "power2.out" }, 0);
      }
      if (el.body) {
        actionTl.to(el.body, { rotation: -6, y: 1.2, transformOrigin: "50% 85%", duration: 0.16, ease: "power2.out" }, 0);
      }
      if (el.headBob) {
        actionTl.to(el.headBob, { rotation: -4, y: 0.8, duration: 0.16, ease: "power2.out" }, 0);
      }

      // Snappy forward swipe stroke
      if (el.legFN) {
        actionTl.to(el.legFN, {
          rotation: 40,
          y: 2,
          transformOrigin: "50% 6%",
          duration: 0.10,
          ease: "power4.in",
          onComplete: function () {
            if (typeof onImpact === "function") {
              onImpact();
            }
          }
        }, 0.16);
      }
      if (el.body) {
        actionTl.to(el.body, { rotation: 5, y: -1.0, transformOrigin: "50% 85%", duration: 0.10, ease: "power4.in" }, 0.16);
      }
      if (el.headBob) {
        actionTl.to(el.headBob, { rotation: 3, y: -0.8, duration: 0.10, ease: "power4.in" }, 0.16);
      }

      // Follow-through and settle back
      if (el.legFN) {
        actionTl.to(el.legFN, { rotation: 0, y: 0, transformOrigin: "50% 6%", duration: 0.22, ease: "power2.out" }, 0.26);
      }
      if (el.body) {
        actionTl.to(el.body, { rotation: 0, y: 0, transformOrigin: "50% 85%", duration: 0.22, ease: "power2.out" }, 0.26);
      }
      if (el.headBob) {
        actionTl.to(el.headBob, { rotation: 0, y: 0, duration: 0.22, ease: "power2.out" }, 0.26);
      }

      return new Promise(function (resolve) {
        pendingSwipeResolve = resolve;
        if (actionTl) {
          actionTl.eventCallback("onComplete", function () {
            actionTl = null;
            pendingSwipeResolve = null;
            if (generation === myGen) {
              PandaRig.setState(prev);
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    }
  };

  global.PandaRig = PandaRig;
  if (global.CharacterManager && typeof global.CharacterManager.register === "function") {
    global.CharacterManager.register("panda", PandaRig);
  }
})(typeof window !== "undefined" ? window : global);
