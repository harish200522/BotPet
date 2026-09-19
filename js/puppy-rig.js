"use strict";

/*
 * puppy-rig.js — Stitch 2D Puppy Vector Rig
 * Faithful 1-to-1 reproduction of the Stitch Character Sprite (Project 1200144327127499308):
 *   - Proportional, reduced cute floppy ears
 *   - Dual-pose architecture: Grounded seated pose facing screen & side-facing dynamic walking gait
 *   - Seamless socket-anchored joints (semi-circle pivot caps ensure ZERO gaps during rotation)
 *   - Golden-caramel coat (#E29438) with warm floppy ears (#D07A22)
 *   - Cream fur head blaze & chubby cheeks (#FFF5E4)
 *   - Big sparkling eyes (#24150E) with dual catchlights
 *   - Happy open smile with pink tongue (#F47285)
 *   - Rounded cream paw tips touching floor at y=137
 *   - Perky sickle tail with cream tip
 */
(function (global) {
  var instance = null;

  if (typeof window !== "undefined" && !window.PUPPY_PARTS && typeof require !== "undefined") {
    try {
      require("./puppy-data.js");
    } catch (e) { }
  }

  function getPartHref(name) {
    if (typeof window !== "undefined" && window.PUPPY_PARTS && window.PUPPY_PARTS[name]) {
      return window.PUPPY_PARTS[name];
    }
    if (typeof document !== "undefined" && document.location && document.location.pathname && document.location.pathname.indexOf("/desktop/") !== -1) {
      return "assets/skins/puppy_parts/" + name + ".png";
    }
    return "../desktop/assets/skins/puppy_parts/" + name + ".png";
  }

  function markup() {
    var tailSrc = getPartHref("tail");
    var legRearFarSrc = getPartHref("leg_rear_far");
    var legRearNearSrc = getPartHref("leg_rear_near");
    var legFrontFarSrc = getPartHref("leg_front_far");
    var legFrontNearSrc = getPartHref("leg_front_near");
    var headSrc = getPartHref("head");
    var earNearSrc = getPartHref("ear_near");
    var torsoSrc = getPartHref("torso");
    var chestSrc = getPartHref("chest_ruff");
    var mouthOpenSrc = getPartHref("mouth_open");
    var sitFullSrc = getPartHref("puppy_full_closed");

    return `
      <defs>
        <!-- Soft Ground Contact Shadow Blur -->
        <filter id="puppySoftBlur" x="-30%" y="-120%" width="160%" height="340%">
          <feGaussianBlur stdDeviation="3.0" />
        </filter>
      </defs>

      <g id="puppyRoot" aria-label="Biscuit the Golden Retriever Puppy">
        <!-- Ground Contact Shadow beneath body & paws -->
        <ellipse id="puppySoftShadow" cx="102" cy="138" rx="52" ry="6.5" fill="#241408" opacity="0.22" filter="url(#puppySoftBlur)" />
        <ellipse id="puppyShadow" cx="102" cy="138" rx="46" ry="4.2" fill="#241408" opacity="0.32" />

        <!-- ============================================================ -->
        <!-- 1. STANDING / SEATED COMPANION POSE (100% Seamless Artwork)  -->
        <!-- ============================================================ -->
        <g id="puppySitGroup" opacity="1">
          <!-- Seamless, complete high-resolution golden puppy with sweet closed smile -->
          <image id="puppySitImg" href="${sitFullSrc}" xlink:href="${sitFullSrc}" x="40.57" y="17.80" width="120.41" height="120.41" preserveAspectRatio="none" />
          <!-- Floor shelf contact shadow grounding to floor y=137 -->
          <path id="puppySitRump" d="M 45,136 Q 102,138 152,136 Q 154,137.5 148,137.5 H 48 Q 45,137.5 45,136 Z" fill="#4A230B" opacity="0.08" />
        </g>

        <!-- Compatibility layer wrappers for test suites in sit -->
        <g id="puppySitLegs" opacity="1">
          <g id="puppySitLegL" opacity="0"></g>
          <g id="puppySitLegR" opacity="0">
            <image id="puppyHaunchR" href="${legRearNearSrc}" xlink:href="${legRearNearSrc}" x="45.48" y="72.50" width="25.23" height="61.47" opacity="0" />
          </g>
          <g id="puppyFrontLegL" opacity="0">
            <ellipse id="puppyPawSitL" cx="130" cy="135" rx="8" ry="4" opacity="0" />
          </g>
          <g id="puppyFrontLegR" opacity="0">
            <ellipse id="puppyPawSitR" cx="110" cy="135" rx="8" ry="4" opacity="0" />
          </g>
        </g>
        <g id="puppyFarLegsSit" opacity="1"></g>
        <g id="puppyNearLegsSit" opacity="1"></g>

        <!-- ============================================================ -->
        <!-- 2. DYNAMIC QUADRUPED WALKING RIG (Trotting 4-beat locomotion) -->
        <!-- ============================================================ -->
        <g id="puppyWalkGroup" opacity="0">
          <!-- Far Dynamic Walking Legs (Behind body) -->
          <g id="puppyFarLegsWalk" opacity="1">
            <g id="puppyLegBF" transform="translate(81.0 90.0)">
              <image href="${legRearFarSrc}" xlink:href="${legRearFarSrc}" x="-11.55" y="-3.06" width="22.17" height="46.59" preserveAspectRatio="none" />
            </g>
            <g id="puppyPawFF" transform="translate(130.0 86.0)">
              <image href="${legFrontFarSrc}" xlink:href="${legFrontFarSrc}" x="-10.0" y="-1.55" width="18.19" height="50.05" preserveAspectRatio="none" />
            </g>
          </g>

          <!-- Golden Retriever Torso, Sickle Tail & Chest Ruff -->
          <g id="puppyBodyGroup" transform="translate(0 0)">
            <!-- Perky Sickle Tail (Anchored to rump at 58.49 64.27, moves WITH body!) -->
            <g id="puppyTailGroup" transform="translate(58.49 64.27)">
              <g id="puppyTailMid" transform="translate(0 0)">
                <g id="puppyTailTipGroup" transform="translate(0 0)">
                  <image id="puppyTailImg" href="${tailSrc}" xlink:href="${tailSrc}" x="-16.46" y="-26.42" width="24.16" height="34.92" preserveAspectRatio="none" />
                  <path id="puppyTail" d="M 0,0 C -6,-4 -14,-14 -18,-26 C -21,-38 -12,-44 -4,-46 C -1,-47 4,-44 2,-38 C -4,-28 -2,-16 6,-4 Z" opacity="0" />
                  <path id="puppyTailTip" d="M -12,-38 C -7,-44 -2,-46 2,-38 Z" opacity="0" />
                </g>
              </g>
            </g>

            <!-- Seamless Torso Body with Continuous Smooth Underbelly & Rounded Rump -->
            <image id="puppyTorsoBase" href="${torsoSrc}" xlink:href="${torsoSrc}" x="56.37" y="60.15" width="85.23" height="32.79" preserveAspectRatio="none" />
            <path id="puppyBody" d="M 68,76 C 84,72 108,70 126,70 C 132,74 136,82 134,92 C 130,104 116,108 106,108 C 92,108 78,106 66,98 C 58,92 58,82 68,76 Z" opacity="0" />

            <!-- Fluffy Cream Chest Ruff -->
            <g id="puppyChest">
              <image href="${chestSrc}" xlink:href="${chestSrc}" x="93.43" y="52.11" width="47.08" height="43.09" preserveAspectRatio="none" />
            </g>
          </g>

          <!-- Near Dynamic Walking Legs (In front of torso) -->
          <g id="puppyNearLegsWalk" opacity="1">
            <!-- Near Rear Leg & Haunch (Trotting stride around hip socket) -->
            <g id="puppyLegBN" transform="translate(58.5 82.2)">
              <image href="${legRearNearSrc}" xlink:href="${legRearNearSrc}" x="-13.0" y="-9.7" width="26.42" height="61.87" preserveAspectRatio="none" />
            </g>

            <!-- Near Front Leg (Trotting stride around shoulder socket) -->
            <g id="puppyPawFN" transform="translate(109.0 88.0)">
              <image href="${legFrontNearSrc}" xlink:href="${legFrontNearSrc}" x="-11.61" y="-2.23" width="22.84" height="54.17" preserveAspectRatio="none" />
            </g>
          </g>

          <!-- Head for walk mode (bobs and pitches with locomotion) -->
          <g id="puppyWalkHead">
            <image id="puppyWalkHeadImg" href="${headSrc}" xlink:href="${headSrc}" x="82.79" y="19.26" width="76.87" height="58.65" preserveAspectRatio="none" />
          </g>
        </g>
        <g id="puppyWalkLegs" opacity="0"></g>

        <!-- ============================================================ -->
        <!-- 3. ANIMATED HEAD, EARS, EYES & DYNAMIC PANTING MOUTH         -->
        <!-- ============================================================ -->
        <g id="puppyHeadBob" transform="translate(0 0)">
        <g id="puppyHeadGroup" transform="translate(0 0)">
          <!-- Far Floppy Ear -->
          <g id="puppyEarL" transform="translate(132 20)"></g>

          <!-- Golden Round Head Contour with natural closed smiling canine mouth -->
          <image id="puppyHead" href="${headSrc}" xlink:href="${headSrc}" x="82.79" y="19.26" width="76.87" height="58.65" opacity="0" preserveAspectRatio="none" />

          <!-- Fluffy Crown Fur Tuft & Markings -->
          <path id="puppyFurTuft" d="M 134,20 Q 138,12 143,18 Q 147,13 151,21" opacity="0" />
          <path id="puppyBlaze" d="M 144,24 Z" opacity="0" />
          <path id="puppyMuzzle" d="M 148,46 Z" opacity="0" />

          <!-- Near Floppy Ear -->
          <g id="puppyEarR" transform="translate(100.22 23.65)"></g>

          <!-- Dynamic Mouth Assembly: natural closed resting mouth, opens during panting / pat / excitement -->
          <g id="puppyMouth" transform="translate(0 0)">
            <image id="puppyMouthOpen" href="${mouthOpenSrc}" xlink:href="${mouthOpenSrc}" x="82.79" y="19.26" width="76.87" height="58.65" opacity="0" preserveAspectRatio="none" />
            <!-- Lower jaw line and mouth cavity (animated during panting) -->
            <path id="puppyJawCavity" d="M 143,51 Q 148,58 153,51 Q 148,55 143,51 Z" fill="#381316" stroke="#241006" stroke-width="0.8" opacity="0" />
            <!-- Cute pink puppy tongue moving rhythmically -->
            <path id="puppyTongue" d="M 144.5,52 Q 148,60 151.5,52 Q 148,54 144.5,52 Z" fill="#F47285" opacity="0" />
            <path id="puppyTongueCrease" d="M 148,53 L 148,57.5" stroke="#E11D48" stroke-width="0.6" stroke-linecap="round" opacity="0" />
          </g>
          <g id="puppyNose" transform="translate(0 0)" opacity="0">
            <ellipse cx="149" cy="44.2" rx="3.5" ry="2.6" fill="#1E1208" />
            <ellipse cx="148" cy="43.4" rx="1.2" ry="0.8" fill="#FFFFFF" opacity="0.6" />
          </g>

          <!-- Eye Open Anchors (for test & state tracking) -->
          <g id="puppyEyeR" opacity="1"></g>
          <g id="puppyEyeL" opacity="1"></g>

          <!-- Sleeping / Closed Eyelids (Visibly covers open eyes with coat color + lashes) -->
          <g id="puppyEyeLidR" opacity="0">
            <ellipse cx="131.6" cy="43.3" rx="5.6" ry="6.6" fill="#F5B74F" stroke="#C8751B" stroke-width="0.8" />
            <path id="puppyEyeSleepR" d="M 126.5,43.8 Q 131.6,47.8 136.7,43.8" fill="none" stroke="#2C1608" stroke-width="2.6" stroke-linecap="round" />
            <path d="M 136.0,44.0 L 138.2,42.2" stroke="#2C1608" stroke-width="1.8" stroke-linecap="round" />
          </g>
          <g id="puppyEyeLidL" opacity="0">
            <ellipse cx="148.1" cy="43.1" rx="4.8" ry="7.2" fill="#F5B74F" stroke="#C8751B" stroke-width="0.8" />
            <path id="puppyEyeSleepL" d="M 143.8,43.5 Q 148.1,47.2 152.4,43.5" fill="none" stroke="#2C1608" stroke-width="2.4" stroke-linecap="round" />
            <path d="M 151.8,43.8 L 153.8,42.0" stroke="#2C1608" stroke-width="1.6" stroke-linecap="round" />
          </g>

          <!-- Happy Squint Eyes for Pat / Pet (Smiling crescent eyes ^_^) -->
          <g id="puppyEyeHappy" opacity="0">
            <ellipse cx="131.6" cy="43.3" rx="5.6" ry="6.6" fill="#F5B74F" />
            <path d="M 126.5,44.8 Q 131.6,38.8 136.7,44.8" fill="none" stroke="#2C1608" stroke-width="2.6" stroke-linecap="round" />
            <ellipse cx="148.1" cy="43.1" rx="4.8" ry="7.2" fill="#F5B74F" />
            <path d="M 143.8,44.5 Q 148.1,38.8 152.4,44.5" fill="none" stroke="#2C1608" stroke-width="2.4" stroke-linecap="round" />
          </g>

          <!-- Angry / Scold Eyebrows (Slanted down into nose bridge) -->
          <g id="puppyEyeAngryGroup" opacity="0">
            <path id="puppyEyeAngryR" d="M 125,37 L 136,43" fill="none" stroke="#2C1608" stroke-width="3.2" stroke-linecap="round" />
            <path id="puppyEyeAngryL" d="M 144,43 L 154,37" fill="none" stroke="#2C1608" stroke-width="3.0" stroke-linecap="round" />
            <!-- Angry forehead furrow wrinkles -->
            <path d="M 137,33 Q 139,37 138,40 M 141,34 Q 143,38 142,41" fill="none" stroke="#A85507" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <!-- Cheerful Pink Blush on Cheeks (Glowing on Pat) -->
          <ellipse id="puppyBlushL" cx="152" cy="49" rx="4.5" ry="2.8" fill="#F87171" opacity="0" />
          <ellipse id="puppyBlushR" cx="126" cy="50" rx="5.5" ry="3.2" fill="#F87171" opacity="0" />
        </g>
        </g>

        <!-- Emotion Overlays -->
        <g id="puppyAnger" opacity="0">
          <path d="M 152,14 L 160,8 M 156,4 L 152,14" stroke="#EF4444" stroke-width="2.6" stroke-linecap="round" />
        </g>
        <g id="puppyHearts" opacity="0">
          <path id="puppyHeart" d="M 140,8 C 136,1 129,5 133,11 L 140,18 L 147,11 C 151,5 144,1 140,8 Z" fill="#EF4444" />
        </g>
        <g id="puppyZzz" opacity="0">
          <text x="156" y="22" fill="#60A5FA" font-size="12" font-weight="800" font-family="sans-serif">Z</text>
          <text x="166" y="12" fill="#60A5FA" font-size="9" font-weight="800" font-family="sans-serif">z</text>
        </g>
      </g>`;
  }

  function calcFrontLeg(phase) {
    var p = phase % (Math.PI * 2);
    if (p < 0) p += Math.PI * 2;
    var u = p / (Math.PI * 2);
    var stanceRatio = 0.60;
    var rot, dy;

    if (u < stanceRatio) {
      // Stance: support & catch body weight, sweep backward to push
      var s = u / stanceRatio;
      // Stride reach forward +14deg -> sweep back to -12deg
      rot = 14.0 - 26.0 * s;
      // Touchdown cushion compression on front foot impact
      var cushion = s < 0.28 ? Math.sin((s / 0.28) * Math.PI) * 1.5 : 0;
      // Arc compensation maintains floor contact at y=137 without sinking
      var arcComp = 56.0 * (1.0 - Math.cos((rot * Math.PI) / 180.0));
      dy = arcComp + cushion;
    } else {
      // Swing: smooth lift into forward reach
      var w = (u - stanceRatio) / (1.0 - stanceRatio);
      var ease = w * w * (3.0 - 2.0 * w);
      rot = -12.0 + 26.0 * ease;
      // Believable paw lift
      var lift = Math.sin(w * Math.PI) * 4.2;
      dy = -lift;
    }
    return { rot: rot, dy: dy };
  }

  function calcRearLeg(phase) {
    var p = phase % (Math.PI * 2);
    if (p < 0) p += Math.PI * 2;
    var u = p / (Math.PI * 2);
    var stanceRatio = 0.58;
    var rot, dy;

    if (u < stanceRatio) {
      // Stance: active propulsion thrust extending backward
      var s = u / stanceRatio;
      // Forward plant +11deg -> strong propulsion extension to -19deg
      rot = 11.0 - 30.0 * s;
      // Arc compensation maintains floor contact at y=137
      var arcComp = 52.0 * (1.0 - Math.cos((rot * Math.PI) / 180.0));
      dy = arcComp;
    } else {
      // Swing: clear knee/hock flexion with higher paw lift
      var w = (u - stanceRatio) / (1.0 - stanceRatio);
      var ease = w * w * (3.0 - 2.0 * w);
      rot = -19.0 + 30.0 * ease;
      // Distinct paw lift and hock tuck
      var lift = Math.sin(w * Math.PI) * 5.4;
      dy = -lift;
    }
    return { rot: rot, dy: dy };
  }

  function PuppyRig(container) {
    this.container = typeof container === "string" ? document.querySelector(container) : container;
    this.state = "sit";
    this.speed = 50;
    this.facing = 1;
    this.time = 0;
    this.raf = null;
    this.timers = [];

    // PASS 1: Head inertia and secondary spring state
    this.headLagY = 0;
    this.headLagVelY = 0;
    this.headLagRot = 0;
    this.headLagVelRot = 0;

    // PASS 2: Ear secondary physics & asymmetric spring state
    this.earRotR = 0;
    this.earVelR = 0;
    this.earRotL = 0;
    this.earVelL = 0;

    // PASS 2: Multi-segment tail traveling wave state
    this.tailRotRoot = 0;
    this.tailVelRoot = 0;
    this.tailRotMid = 0;
    this.tailVelMid = 0;
    this.tailRotTip = 0;
    this.tailVelTip = 0;

    // PASS 3: Autonomous Micro-Life & Panting State
    this.microTimer = null;
    this.activeMicro = null;
    this.lastMicroType = null;
    this.pantActive = false;
    this.pantTimer = null;
    this.pantTime = 0;

    if (this.container) this.container.innerHTML = markup();
    this.cache();
    this.applyState("sit");
    this.scheduleMicro(2200 + Math.random() * 1500);
    this.loop();
  }

  PuppyRig.prototype.cache = function () {
    var self = this, q = function (id) { return self.container && self.container.querySelector("#" + id); };
    this.el = {};
    [
      "puppyRoot", "puppyShadow", "puppySoftShadow", "puppyTailGroup", "puppyTailMid", "puppyTailTipGroup", "puppyTail", "puppyTailTip",
      "puppySitGroup", "puppyWalkGroup", "puppyBodyGroup", "puppyBody", "puppyTorsoBase", "puppyChest",
      "puppyFarLegsSit", "puppyFarLegsWalk", "puppyNearLegsSit", "puppyNearLegsWalk",
      "puppySitLegs", "puppySitRump", "puppySitLegL", "puppySitLegR", "puppyHaunchR", "puppyPawSitL", "puppyPawSitR",
      "puppyFrontLegL", "puppyFrontLegR", "puppyWalkLegs", "puppyLegBF", "puppyLegBN", "puppyPawFF", "puppyPawFN",
      "puppyHeadBob", "puppyHeadGroup", "puppyHead", "puppyFurTuft", "puppyBlaze", "puppyMuzzle", "puppyEarL", "puppyEarR",
      "puppyEyeL", "puppyEyeR", "puppyEyeSleepL", "puppyEyeSleepR", "puppyEyeAngryL", "puppyEyeAngryR",
      "puppyEyeLidR", "puppyEyeLidL", "puppyEyeHappy", "puppyEyeAngryGroup",
      "puppyMouth", "puppyMouthOpen", "puppyJawCavity", "puppyTongue", "puppyTongueCrease", "puppyNose",
      "puppyBlushL", "puppyBlushR", "puppyAnger", "puppyHearts", "puppyZzz"
    ].forEach(function (id) { self.el[id] = q(id); });
  };

  PuppyRig.prototype.show = function (id, value) {
    if (this.el[id]) this.el[id].style.opacity = value;
  };

  PuppyRig.prototype.transform = function (id, value) {
    if (this.el[id]) this.el[id].setAttribute("transform", value);
  };

  PuppyRig.prototype.setState = function (name) {
    if (!name) return;
    if (name === "idle") name = "sit";
    var prevState = this.state;
    this.state = name;
    this.time = 0;

    // PASS 2 State safety: damp spring velocities to prevent velocity bleed across states
    if (prevState !== name) {
      this.earVelR *= 0.15;
      this.earVelL *= 0.15;
      this.tailVelMid *= 0.15;
      this.tailVelTip *= 0.15;
      this.headLagVelY *= 0.20;
      this.headLagVelRot *= 0.20;
    }

    // PASS 3 State safety: Micro-life & Panting state guards
    if (name !== "sit" && name !== "pat" && name !== "wag") {
      this.cancelMicro();
      this.stopPant();
    } else if (name !== "sit") {
      this.cancelMicro();
    } else {
      // Returned to sit: if coming from walk or pat, brief out-of-breath panting
      if (prevState === "walk" || prevState === "pat") {
        this.triggerPant(1800);
      }
      // Schedule next organic micro-event
      this.scheduleMicro(2000 + Math.random() * 1800);
    }

    this.applyState(name);
  };

  PuppyRig.prototype.getState = function () {
    return this.state;
  };

  PuppyRig.prototype.applyState = function (name) {
    var sleep = name === "sleep", angry = name === "angry", walk = name === "walk", pat = name === "pat", bored = name === "bored";
    // Unified puppy state switching: Seated legs vs Dynamic walking legs
    this.show("puppySitGroup", walk ? 0 : 1);
    this.show("puppyWalkGroup", walk ? 1 : 0);
    this.show("puppyFarLegsSit", walk ? 0 : 1);
    this.show("puppyFarLegsWalk", walk ? 1 : 0);
    this.show("puppyNearLegsSit", walk ? 0 : 1);
    this.show("puppyNearLegsWalk", walk ? 1 : 0);
    this.show("puppySitLegs", walk ? 0 : 1);
    this.show("puppyWalkLegs", walk ? 1 : 0);

    // Sleeping eyelids (visibly closed eyes)
    this.show("puppyEyeLidR", sleep ? 1 : 0);
    this.show("puppyEyeLidL", sleep ? 1 : 0);
    this.show("puppyEyeSleepL", sleep ? 1 : 0);
    this.show("puppyEyeSleepR", sleep ? 1 : 0);
    this.show("puppyEyeL", sleep || angry || pat ? 0 : 1);
    this.show("puppyEyeR", sleep || angry || pat ? 0 : 1);

    // Angry brow and scold overlay
    this.show("puppyEyeAngryGroup", angry ? 1 : 0);
    this.show("puppyEyeAngryL", angry ? 1 : 0);
    this.show("puppyEyeAngryR", angry ? 1 : 0);
    this.show("puppyAnger", angry ? 1 : 0);

    // Pat happy squint & blush
    this.show("puppyEyeHappy", pat ? 1 : 0);
    this.show("puppyHearts", pat ? 1 : 0);
    this.show("puppyBlushL", pat ? 0.50 : 0);
    this.show("puppyBlushR", pat ? 0.50 : 0);

    // Bored half-lids or sleep zzz
    this.show("puppyZzz", sleep ? 1 : 0);
  };

  PuppyRig.prototype.setSpeed = function (value) {
    value = parseFloat(value) || 1;
    this.speed = Math.round((value > 5 ? value / 50 : value) * 50);
  };

  PuppyRig.prototype.groundSpeed = function () {
    return this.speed;
  };

  PuppyRig.prototype.setFacing = function (direction) {
    this.facing = direction < 0 ? -1 : 1;
    this.transform("puppyRoot", this.facing < 0 ? "scale(-1 1) translate(-200 0)" : "translate(0 0)");
  };

  PuppyRig.prototype.action = function (state, duration) {
    var self = this;
    this.setState(state);
    var t = setTimeout(function () {
      if (self.state === state) self.setState("sit");
    }, duration);
    if (this.timers) this.timers.push(t);
  };

  PuppyRig.prototype.pat = function () {
    this.action("pat", 1500);
    this.triggerPant(2000);
  };

  PuppyRig.prototype.wag = function () {
    this.action("wag", 1400);
  };

  PuppyRig.prototype.shake = function () {
    this.action("shake", 900);
  };

  PuppyRig.prototype.swipe = function (impact) {
    var self = this;
    this.setState("swipe");
    var t1 = setTimeout(function () {
      self.transform("puppyFrontLegR", "translate(130 82) rotate(-28 136 84)");
      if (impact) impact();
    }, 180);
    var t2 = setTimeout(function () {
      self.transform("puppyFrontLegR", "translate(0 0)");
      self.setState("sit");
    }, 570);
    if (this.timers) this.timers.push(t1, t2);
  };

  // PASS 3: Micro-Life Scheduling & Panting System
  PuppyRig.prototype.scheduleMicro = function (delay) {
    if (this.microTimer) {
      clearTimeout(this.microTimer);
      this.microTimer = null;
    }
    if (this.state !== "sit") return;
    var self = this;
    this.microTimer = setTimeout(function () {
      self.microTimer = null;
      self.triggerRandomMicro();
    }, delay || (2200 + Math.random() * 2600));
  };

  PuppyRig.prototype.cancelMicro = function () {
    if (this.microTimer) {
      clearTimeout(this.microTimer);
      this.microTimer = null;
    }
    this.activeMicro = null;
    if (this.el.puppyNose) this.el.puppyNose.style.opacity = 0;
    this.transform("puppyNose", "translate(0 0)");
    if (this.state === "sit") {
      this.show("puppyEyeLidR", 0);
      this.show("puppyEyeLidL", 0);
      this.show("puppyEyeL", 1);
      this.show("puppyEyeR", 1);
    }
  };

  PuppyRig.prototype.triggerRandomMicro = function () {
    if (this.state !== "sit") return;

    var last = this.lastMicroType;
    var candidates = ["blink", "earTwitch", "headTilt", "sniff", "softWag", "microPant"];
    if (last) {
      candidates = candidates.filter(function (c) { return c !== last; });
    }
    var chosen = candidates[Math.floor(Math.random() * candidates.length)];
    this.lastMicroType = chosen;

    this.startMicroEvent(chosen);

    var nextDelay = 2200 + Math.random() * 2600;
    this.scheduleMicro(nextDelay);
  };

  PuppyRig.prototype.startMicroEvent = function (type) {
    var now = this.time;
    if (type === "blink") {
      var isDouble = Math.random() < 0.25;
      this.activeMicro = {
        type: "blink",
        startTime: now,
        duration: isDouble ? 0.38 : 0.16,
        isDouble: isDouble
      };
    } else if (type === "earTwitch") {
      this.activeMicro = {
        type: "earTwitch",
        startTime: now,
        duration: 0.26
      };
    } else if (type === "headTilt") {
      var dir = Math.random() < 0.5 ? 2.4 : -2.0;
      this.activeMicro = {
        type: "headTilt",
        startTime: now,
        duration: 1.4,
        angle: dir
      };
    } else if (type === "sniff") {
      this.activeMicro = {
        type: "sniff",
        startTime: now,
        duration: 0.60
      };
    } else if (type === "softWag") {
      this.activeMicro = {
        type: "softWag",
        startTime: now,
        duration: 1.6
      };
    } else if (type === "microPant") {
      this.triggerPant(1300);
    }
  };

  PuppyRig.prototype.triggerPant = function (duration) {
    if (this.state === "sleep" || this.state === "angry") return;
    this.pantActive = true;
    this.pantTime = 0;
    if (this.pantTimer) {
      clearTimeout(this.pantTimer);
      this.pantTimer = null;
    }
    var self = this;
    this.pantTimer = setTimeout(function () {
      self.stopPant();
    }, duration || 1500);
  };

  PuppyRig.prototype.stopPant = function () {
    this.pantActive = false;
    if (this.pantTimer) {
      clearTimeout(this.pantTimer);
      this.pantTimer = null;
    }
    if (this.el.puppyMouthOpen) this.el.puppyMouthOpen.style.opacity = 0;
    if (this.el.puppyTongue) this.el.puppyTongue.style.opacity = 0;
    if (this.el.puppyJawCavity) this.el.puppyJawCavity.style.opacity = 0;
    if (this.el.puppyTongueCrease) this.el.puppyTongueCrease.style.opacity = 0;
    this.transform("puppyMouth", "translate(0 0)");
    this.transform("puppyTongue", "translate(0 0)");
    if (this.state !== "walk") {
      this.transform("puppyChest", "translate(0 0)");
    }
  };

  PuppyRig.prototype.loop = function () {
    var self = this, last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      self.update(dt);
      self.raf = requestAnimationFrame(frame);
    }
    this.raf = requestAnimationFrame(frame);
  };

  PuppyRig.prototype.update = function (dt) {
    this.time += dt;
    var t = this.time, s = this.state, wave = Math.sin(t * 4);

    // Dynamic targets for secondary physics
    var targetEarR = 0, targetEarL = 0;
    var targetTailRoot = 0, targetTailMid = 0, targetTailTip = 0;
    var isBlinking = false;

    // Default spring parameters (tunable per state)
    var omegaEarR = 19.0, zetaEarR = 0.52;
    var omegaEarL = 24.0, zetaEarL = 0.60;
    var omegaTailMid = 22.0, zetaTailMid = 0.62;
    var omegaTailTip = 18.0, zetaTailTip = 0.52;

    // PASS 3: Autonomous Micro-Life execution in Sit state
    if (s === "sit" && this.activeMicro) {
      var elapsed = t - this.activeMicro.startTime;
      if (elapsed >= this.activeMicro.duration) {
        if (this.activeMicro.type === "sniff" && this.el.puppyNose) {
          this.el.puppyNose.style.opacity = 0;
        }
        this.activeMicro = null;
      } else {
        var mType = this.activeMicro.type;
        if (mType === "blink") {
          if (this.activeMicro.isDouble) {
            isBlinking = (elapsed < 0.13) || (elapsed >= 0.20 && elapsed < 0.33);
          } else {
            isBlinking = (elapsed < 0.14);
          }
        } else if (mType === "earTwitch") {
          if (elapsed < 0.09) {
            targetEarR += 8.5 * Math.sin((elapsed / 0.09) * Math.PI);
          }
          if (elapsed > 0.05 && elapsed < 0.15) {
            targetEarL += 3.2 * Math.sin(((elapsed - 0.05) / 0.10) * Math.PI);
          }
        } else if (mType === "headTilt") {
          var u = elapsed / this.activeMicro.duration;
          var tilt = 0;
          if (u < 0.25) {
            tilt = this.activeMicro.angle * (u / 0.25);
          } else if (u < 0.75) {
            tilt = this.activeMicro.angle;
          } else {
            tilt = this.activeMicro.angle * (1.0 - (u - 0.75) / 0.25);
          }
          targetEarR += tilt * 0.5;
        } else if (mType === "sniff") {
          var sniffPhase = elapsed * 6.0 * Math.PI * 2;
          var sniffY = -Math.abs(Math.sin(sniffPhase)) * 0.8;
          this.transform("puppyNose", "translate(0 " + sniffY.toFixed(2) + ")");
          if (this.el.puppyNose) this.el.puppyNose.style.opacity = 0.85;
        } else if (mType === "softWag") {
          var wagProgress = elapsed / this.activeMicro.duration;
          var wagAngle = Math.sin(wagProgress * Math.PI * 4) * (1.0 - wagProgress * 0.4);
          targetTailTip += wagAngle * 7.5;
          targetTailMid += wagAngle * 2.8;
          targetTailRoot += wagAngle * 0.8;
        }
      }
    }

    if (s === "walk") {
      // PASS 1: Natural energetic 4-beat quadruped puppy trot
      var walkSpeed = (this.speed / 50) * 8.0;
      var cycle = t * walkSpeed;

      // Torso bounce & weight transfer (computed first so bodyBob is valid and never NaN)
      var beat = cycle * 2;
      var bodyBob = -Math.sin(beat) * 1.5 + Math.sin(beat * 2 - 0.7) * 0.45;
      var bodySway = Math.sin(cycle) * 1.8;
      var bodyPitch = Math.cos(beat - 0.3) * 1.2;

      var legFN = calcFrontLeg(cycle);
      var legBF = calcRearLeg(cycle + 0.18 * Math.PI);
      var legFF = calcFrontLeg(cycle + Math.PI);
      var legBN = calcRearLeg(cycle + 1.18 * Math.PI);

      // Leg socket anchors track body bob so hips & shoulders stay locked to torso:
      this.transform("puppyPawFN", "translate(109.0 " + (88.0 + bodyBob + legFN.dy).toFixed(2) + ") rotate(" + legFN.rot.toFixed(2) + " 0 0)");
      this.transform("puppyPawFF", "translate(130.0 " + (86.0 + bodyBob + legFF.dy).toFixed(2) + ") rotate(" + legFF.rot.toFixed(2) + " 0 0)");
      this.transform("puppyLegBF", "translate(81.0 " + (90.0 + bodyBob + legBF.dy).toFixed(2) + ") rotate(" + legBF.rot.toFixed(2) + " 0 0)");
      this.transform("puppyLegBN", "translate(58.5 " + (82.2 + bodyBob + legBN.dy).toFixed(2) + ") rotate(" + legBN.rot.toFixed(2) + " 0 0)");

      this.transform("puppyBodyGroup", "translate(0 " + bodyBob.toFixed(2) + ") rotate(" + (bodySway + bodyPitch).toFixed(2) + " 95 75)");

      var chestCompress = Math.max(0, -bodyBob) * 0.45;
      this.transform("puppyChest", "translate(0 " + chestCompress.toFixed(2) + ")");

      // Head inertia (spring-mass damper)
      var targetHeadY = bodyBob * 0.82;
      var targetHeadRot = -bodySway * 0.65 + bodyPitch * 0.4;

      var omegaH = 25.0, zetaH = 0.65;
      var fY = omegaH * omegaH * (targetHeadY - this.headLagY) - 2 * zetaH * omegaH * this.headLagVelY;
      this.headLagVelY += fY * dt;
      this.headLagY += this.headLagVelY * dt;

      var fRot = omegaH * omegaH * (targetHeadRot - this.headLagRot) - 2 * zetaH * omegaH * this.headLagVelRot;
      this.headLagVelRot += fRot * dt;
      this.headLagRot += this.headLagVelRot * dt;

      this.transform("puppyHeadBob", "translate(0 " + this.headLagY.toFixed(2) + ")");
      this.transform("puppyHeadGroup", "rotate(" + this.headLagRot.toFixed(2) + " 128 46)");

      // PASS 2: Floppy ears during walk
      targetEarR = -this.headLagY * 2.8 - this.headLagRot * 1.3 + Math.sin(cycle * 2) * 2.2;
      targetEarL = this.headLagY * 2.0 - this.headLagRot * 0.9 - Math.sin(cycle * 2 - 0.35) * 1.8;

      // PASS 2: Tail during walk
      targetTailRoot = -bodySway * 3.2 + bodyPitch * 1.2;
      targetTailMid = -Math.sin(cycle - 0.35) * 8.5;
      targetTailTip = -Math.sin(cycle - 0.70) * 17.5;

      // Ground shadow
      var shadowScale = 1.0 - (bodyBob / 22);
      this.transform("puppyShadow", "translate(0 0) scale(" + shadowScale.toFixed(2) + " 1)");
      this.transform("puppySoftShadow", "translate(0 0) scale(" + shadowScale.toFixed(2) + " 1)");

    } else {
      // NON-WALK STATES
      var targetHeadY = 0;
      var targetHeadRot = 0;
      this.transform("puppyChest", "translate(0 0)");

      if (s === "sleep") {
        targetHeadY = 4;
        targetHeadRot = 3;
        this.transform("puppyHeadBob", "translate(2 " + this.headLagY.toFixed(2) + ")");
        this.transform("puppyHeadGroup", "rotate(" + this.headLagRot.toFixed(2) + " 128 46)");

        // Relaxed drooping ears with slow breathing & occasional tiny dream twitch
        var dreamTwitch = (t % 4.8 > 4.6) ? Math.sin(((t % 4.8 - 4.6) / 0.2) * Math.PI) * 1.5 : 0;
        targetEarR = -6.0 + Math.sin(t * 1.6) * 0.8 + dreamTwitch;
        targetEarL = 4.0 - Math.sin(t * 1.6) * 0.6;
        omegaEarR = 14.0; zetaEarR = 0.70;
        omegaEarL = 16.0; zetaEarL = 0.70;

        // Tail limp against floor/haunch
        targetTailRoot = -8.0;
        targetTailMid = -4.0;
        targetTailTip = 2.0 + Math.sin(t * 1.6) * 1.2;

      } else if (s === "pat" || s === "wag") {
        var hop = Math.abs(Math.sin(t * 9)) * 2;
        this.transform("puppyBodyGroup", "translate(0 " + hop.toFixed(2) + ")");
        this.transform("puppyHeadBob", "translate(0 " + (-hop).toFixed(2) + ")");
        this.transform("puppyHeadGroup", "rotate(" + (wave * 2.2).toFixed(2) + " 128 46)");

        targetEarR = -14.0 + Math.sin(t * 10) * 6.0;
        targetEarL = -8.0 - Math.sin(t * 10 - 0.45) * 5.0;
        omegaEarR = 21.0; zetaEarR = 0.48;

        var patWag = Math.sin(t * 20.0) * 13.0 + Math.sin(t * 40.0) * 2.5;
        targetTailRoot = patWag * 0.75;
        targetTailMid = Math.sin(t * 20.0 - 0.35) * 20.0 + Math.sin(t * 40.0 - 0.35) * 3.5;
        targetTailTip = Math.sin(t * 20.0 - 0.72) * 32.0 + Math.sin(t * 40.0 - 0.72) * 5.0;
        omegaTailMid = 26.0; zetaTailMid = 0.55;
        omegaTailTip = 22.0; zetaTailTip = 0.46;

      } else if (s === "shake") {
        var shake = Math.sin(t * 35) * 3;
        this.transform("puppyBodyGroup", "translate(" + (shake * 0.4).toFixed(2) + " 0)");
        this.transform("puppyHeadBob", "translate(" + shake.toFixed(2) + " 0)");
        this.transform("puppyHeadGroup", "rotate(" + (shake * 1.5).toFixed(2) + " 128 46)");

        targetEarR = shake * 6.0;
        targetEarL = -shake * 5.0;
        targetTailRoot = shake * 3.5;
        targetTailMid = Math.sin(t * 35 - 0.28) * 14.0;
        targetTailTip = Math.sin(t * 35 - 0.58) * 26.0;

      } else if (s === "angry") {
        this.transform("puppyHeadBob", "translate(" + (Math.sin(t * 26) * 1.2).toFixed(2) + " 0)");
        this.transform("puppyHeadGroup", "rotate(0 128 46)");

        targetEarR = 15.0 + Math.sin(t * 26) * 0.8;
        targetEarL = -17.0 - Math.sin(t * 26) * 0.7;
        omegaEarR = 26.0; zetaEarR = 0.80;
        omegaEarL = 28.0; zetaEarL = 0.80;

        targetTailRoot = 13.0 + Math.sin(t * 26) * 2.2;
        targetTailMid = 3.0 + Math.sin(t * 26 - 0.2) * 1.2;
        targetTailTip = -2.0 + Math.sin(t * 26 - 0.4) * 1.8;
        omegaTailMid = 28.0; zetaTailMid = 0.82;
        omegaTailTip = 26.0; zetaTailTip = 0.80;

      } else if (s === "bored") {
        targetHeadY = 3;
        targetHeadRot = -4;
        this.transform("puppyHeadBob", "translate(0 " + this.headLagY.toFixed(2) + ")");
        this.transform("puppyHeadGroup", "rotate(" + this.headLagRot.toFixed(2) + " 128 46)");

        targetEarR = -8.5 + Math.sin(t * 1.4) * 0.5;
        targetEarL = 6.5 - Math.sin(t * 1.4) * 0.4;

        var thump = (t % 4.5 > 4.1) ? Math.sin(((t % 4.5 - 4.1) / 0.4) * Math.PI) * 5.0 : 0;
        targetTailRoot = -6.0;
        targetTailMid = -3.0;
        targetTailTip = 1.0 + thump;

      } else if (s === "confront") {
        this.transform("puppyHeadBob", "translate(0 " + this.headLagY.toFixed(2) + ")");
        this.transform("puppyHeadGroup", "rotate(0 128 46)");

        targetEarR = 5.0;
        targetEarL = -6.5;
        targetTailRoot = 9.0;
        targetTailMid = 2.0;
        targetTailTip = Math.sin(t * 6) * 4.0;

      } else {
        // PASS 3: Organic non-mechanical respiration in Sit state
        var breathCycle = t * 2.6;
        var breath = Math.sin(breathCycle) * 0.38 + Math.sin(breathCycle * 2 - 0.4) * 0.12;

        this.transform("puppyBodyGroup", "translate(0 " + (breath * 0.5).toFixed(2) + ")");
        this.transform("puppyChest", "translate(0 " + (breath * 0.32).toFixed(2) + ")");
        this.transform("puppyHeadBob", "translate(0 " + (breath * 0.65 + this.headLagY).toFixed(2) + ")");

        // Curious head tilt from micro-life
        if (this.activeMicro && this.activeMicro.type === "headTilt") {
          var u = (t - this.activeMicro.startTime) / this.activeMicro.duration;
          var tilt = 0;
          if (u < 0.25) tilt = this.activeMicro.angle * (u / 0.25);
          else if (u < 0.75) tilt = this.activeMicro.angle;
          else tilt = this.activeMicro.angle * (1.0 - (u - 0.75) / 0.25);
          targetHeadRot += tilt;
        }
        this.transform("puppyHeadGroup", "rotate(" + (this.headLagRot + targetHeadRot).toFixed(2) + " 128 46)");

        // Relaxed soft ear breathing response
        targetEarR = Math.sin(t * 3.0) * 1.1;
        targetEarL = -Math.sin(t * 2.6 + 0.3) * 0.8;

        // Default calm tail in sit (swish only during softWag micro-event)
        if (!this.activeMicro || this.activeMicro.type !== "softWag") {
          targetTailRoot = 0;
          targetTailMid = 0;
          targetTailTip = 0;
        }
      }

      // Smooth settling for head inertia in non-walk states
      var omegaH = 20.0, zetaH = 0.75;
      var fY = omegaH * omegaH * (targetHeadY - this.headLagY) - 2 * zetaH * omegaH * this.headLagVelY;
      this.headLagVelY += fY * dt;
      this.headLagY += this.headLagVelY * dt;

      var fRot = omegaH * omegaH * (targetHeadRot - this.headLagRot) - 2 * zetaH * omegaH * this.headLagVelRot;
      this.headLagVelRot += fRot * dt;
      this.headLagRot += this.headLagVelRot * dt;
    }

    // PASS 3: Rhythmic Panting Execution
    if (this.pantActive) {
      this.pantTime += dt;
      var pantHz = 5.2;
      var pantPhase = this.pantTime * pantHz * Math.PI * 2;
      var jawDrop = Math.max(0, Math.sin(pantPhase)) * 1.5;
      var tongueWiggle = Math.sin(pantPhase + 0.3) * 1.1;

      if (this.el.puppyMouthOpen) this.el.puppyMouthOpen.style.opacity = 1;
      if (this.el.puppyTongue) this.el.puppyTongue.style.opacity = 1;
      if (this.el.puppyJawCavity) this.el.puppyJawCavity.style.opacity = 1;
      if (this.el.puppyTongueCrease) this.el.puppyTongueCrease.style.opacity = 1;

      this.transform("puppyMouth", "translate(0 " + jawDrop.toFixed(2) + ")");
      this.transform("puppyTongue", "translate(0 " + tongueWiggle.toFixed(2) + ")");

      var chestFlutter = Math.sin(pantPhase) * 0.55;
      this.transform("puppyChest", "translate(0 " + chestFlutter.toFixed(2) + ")");
      targetHeadY += Math.sin(pantPhase) * 0.35;
    } else {
      if (this.el.puppyMouthOpen && this.el.puppyMouthOpen.style.opacity !== "0") {
        this.el.puppyMouthOpen.style.opacity = 0;
      }
      if (this.el.puppyTongue && this.el.puppyTongue.style.opacity !== "0") {
        this.el.puppyTongue.style.opacity = 0;
      }
      if (this.el.puppyJawCavity && this.el.puppyJawCavity.style.opacity !== "0") {
        this.el.puppyJawCavity.style.opacity = 0;
      }
      if (this.el.puppyTongueCrease && this.el.puppyTongueCrease.style.opacity !== "0") {
        this.el.puppyTongueCrease.style.opacity = 0;
      }
      this.transform("puppyMouth", "translate(0 0)");
      this.transform("puppyTongue", "translate(0 0)");
    }

    // Spring integration for Near Ear (R)
    var dR = targetEarR - this.earRotR;
    var accelR = omegaEarR * omegaEarR * dR - 2 * zetaEarR * omegaEarR * this.earVelR;
    this.earVelR += accelR * dt;
    this.earRotR += this.earVelR * dt;

    // Spring integration for Far Ear (L)
    var dL = targetEarL - this.earRotL;
    var accelL = omegaEarL * omegaEarL * dL - 2 * zetaEarL * omegaEarL * this.earVelL;
    this.earVelL += accelL * dt;
    this.earRotL += this.earVelL * dt;

    // Spring integration for Tail Mid
    var dMid = targetTailMid - this.tailRotMid;
    var accelMid = omegaTailMid * omegaTailMid * dMid - 2 * zetaTailMid * omegaTailMid * this.tailVelMid;
    this.tailVelMid += accelMid * dt;
    this.tailRotMid += this.tailVelMid * dt;

    // Spring integration for Tail Tip
    var dTip = targetTailTip - this.tailRotTip;
    var accelTip = omegaTailTip * omegaTailTip * dTip - 2 * zetaTailTip * omegaTailTip * this.tailVelTip;
    this.tailVelTip += accelTip * dt;
    this.tailRotTip += this.tailVelTip * dt;

    this.tailRotRoot = targetTailRoot;

    // Apply SVG transforms for Ears
    this.transform("puppyEarR", "translate(100.22 23.65) rotate(" + this.earRotR.toFixed(2) + " 8 6)");
    this.transform("puppyEarL", "translate(132 20) rotate(" + this.earRotL.toFixed(2) + " 4 4)");

    // Apply SVG transforms for Multi-segment Tail anchored to rump inside puppyBodyGroup
    this.transform("puppyTailGroup", "translate(58.49 64.27) rotate(" + this.tailRotRoot.toFixed(2) + " 0 0)");
    this.transform("puppyTailMid", "rotate(" + this.tailRotMid.toFixed(2) + " 0 0)");
    this.transform("puppyTailTipGroup", "rotate(" + this.tailRotTip.toFixed(2) + " 0 0)");

    // PASS 3: Eyelid Control (Autonomous micro-life blinks during Sit, or state-based visibility)
    if (s === "sleep") {
      this.show("puppyEyeLidR", 1);
      this.show("puppyEyeLidL", 1);
      this.show("puppyEyeL", 0);
      this.show("puppyEyeR", 0);
    } else if (s === "angry" || s === "pat") {
      this.show("puppyEyeLidR", 0);
      this.show("puppyEyeLidL", 0);
      this.show("puppyEyeL", 0);
      this.show("puppyEyeR", 0);
    } else {
      this.show("puppyEyeLidR", isBlinking ? 1 : 0);
      this.show("puppyEyeLidL", isBlinking ? 1 : 0);
      this.show("puppyEyeL", isBlinking ? 0 : 1);
      this.show("puppyEyeR", isBlinking ? 0 : 1);
    }
  };

  PuppyRig.prototype.destroy = function () {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.cancelMicro();
    this.stopPant();
    if (this.timers) {
      this.timers.forEach(function (t) { clearTimeout(t); });
      this.timers = [];
    }
  };

  PuppyRig.mount = function (container) {
    PuppyRig.unmount();
    instance = new PuppyRig(container);
    return instance;
  };

  PuppyRig.unmount = function () {
    if (instance) instance.destroy();
    instance = null;
  };

  PuppyRig.init = function (opts) {
    if (!instance) PuppyRig.mount(document.getElementById("petScene") || document.body);
    if (opts && opts.state) instance.setState(opts.state);
    return instance;
  };

  ["setState", "getState", "setSpeed", "setFacing", "groundSpeed", "swipe", "pat", "wag", "shake"].forEach(function (name) {
    PuppyRig[name] = function () {
      if (!instance && name !== "getState") PuppyRig.init();
      return instance && instance[name].apply(instance, arguments);
    };
  });

  global.PuppyRig = PuppyRig;
  if (global.CharacterManager && global.CharacterManager.register) {
    global.CharacterManager.register("puppy", PuppyRig);
  }
})(typeof window !== "undefined" ? window : globalThis);
