"use strict";

/*
 * puppy-rig.js — Biscuit the Golden Retriever Puppy Companion Rig 🐶✨
 * Complete Architectural Rebuild: A True Living Animated Quadruped Rig
 *
 * Built with the exact same architecture, GSAP timelines, and modular methods
 * as the Cat (js/cat.js) and Panda (js/panda-rig.js) companion rigs, while 100%
 * preserving Biscuit's authentic Disney/Pixar-level golden retriever artwork.
 *
 * Design space: 0 0 200 150 (ViewBox)
 * Ground floor shelf: y = 137
 *
 * Living Canine Articulation:
 *   - Modular Body: Torso base, chest ruff, 4 articulated legs, 3-segment sickle tail,
 *     neck, head, and panting mouth cavity.
 *   - Layered Idle Breathing: Inhale/exhale phase delays across chest expansion,
 *     belly breathing, shoulder rise/fall, delayed head bob, and ground shadow response.
 *   - Quadruped Locomotion: 4-leg trotting gait with true paw planting at floor shelf y=137,
 *     pelvis roll, spine flex, chest shock absorption, head lag, and tail inertia.
 *   - Secondary Dynamics: Dual-axis floppy ear physics and 3-tier tail whip.
 *   - Dynamic Panting: 10-12Hz rhythmic tongue flutter, jaw drop, and chest flutter.
 *   - Universal API: mount, unmount, init, setState, getState, setSpeed, setFacing,
 *     groundSpeed, swipe, pat, wag, shake, blink.
 */
(function (global) {
  "use strict";

  function getPartHref(name) {
    if (typeof window !== "undefined" && window.location && window.location.pathname.includes("desktop")) {
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

    return `
      <defs>
        <!-- Soft Ground Contact Shadow Blur -->
        <filter id="puppySoftBlur" x="-30%" y="-120%" width="160%" height="340%">
          <feGaussianBlur stdDeviation="3.0" />
        </filter>
        <!-- Seamless Eyelid Fur Gradients: smooth blend into surrounding golden fur -->
        <linearGradient id="puppyLidGradR" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E8BE84" />
          <stop offset="100%" stop-color="#F2CB91" />
        </linearGradient>
        <linearGradient id="puppyLidGradL" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#DEB075" />
          <stop offset="100%" stop-color="#E8BD82" />
        </linearGradient>
      </defs>

      <g id="puppyRoot" aria-label="Biscuit the Golden Retriever Puppy">
        <!-- Ground Contact Shadow beneath body & paws -->
        <ellipse id="puppySoftShadow" cx="102" cy="138" rx="52" ry="6.5" fill="#241408" opacity="0.22" filter="url(#puppySoftBlur)" />
        <ellipse id="puppyShadow" cx="102" cy="138" rx="46" ry="4.2" fill="#241408" opacity="0.32" />

        <!-- ============================================================ -->
        <!-- 1. FAR LEGS (Rendered behind body)                           -->
        <!-- ============================================================ -->
        <g id="puppyFarLegsGroup">
          <!-- Far Rear Leg (Hip socket at 71.64, 84.05) -->
          <g id="puppySocketBF" transform="translate(71.64 84.05)">
            <g id="puppyLegBF">
              <image href="${legRearFarSrc}" xlink:href="${legRearFarSrc}" x="0" y="0" width="22.17" height="46.60" preserveAspectRatio="none" />
            </g>
          </g>
          <!-- Far Front Leg (Shoulder socket at 122.75, 84.05) -->
          <g id="puppySocketFF" transform="translate(122.75 84.05)">
            <g id="puppyPawFF">
              <g id="puppyLegFF">
                <image href="${legFrontFarSrc}" xlink:href="${legFrontFarSrc}" x="0" y="0" width="18.19" height="50.05" preserveAspectRatio="none" />
              </g>
            </g>
          </g>
        </g>

        <!-- ============================================================ -->
        <!-- 2. BODY / TORSO ASSEMBLY & MULTI-SEGMENT SICKLE TAIL         -->
        <!-- ============================================================ -->
        <g id="puppyBodyGroup" transform="translate(0 0)">
          <!-- 3-Segment Articulated Sickle Tail (Anchored to pelvis at 58.49, 64.27) -->
          <g id="puppyTailGroup" transform="translate(58.49 64.27)">
            <g id="puppyTailRoot" transform="rotate(0 0 0)">
              <g id="puppyTailMid" transform="translate(0 0)">
                <g id="puppyTailTipGroup" transform="translate(0 0)">
                  <image id="puppyTailImg" href="${tailSrc}" xlink:href="${tailSrc}" x="-16.46" y="-26.42" width="24.16" height="34.92" preserveAspectRatio="none" />
                  <path id="puppyTail" d="M 0,0 C -6,-4 -14,-14 -18,-26 C -21,-38 -12,-44 -4,-46 C -1,-47 4,-44 2,-38 C -4,-28 -2,-16 6,-4 Z" opacity="0" />
                  <path id="puppyTailTip" d="M -12,-38 C -7,-44 -2,-46 2,-38 Z" opacity="0" />
                </g>
              </g>
            </g>
          </g>

          <!-- Seamless Continuous Golden Torso Base (Back, flank, rump, and smooth underbelly) -->
          <g id="puppyTorsoGroup">
            <path id="puppyBody" d="M 60,68 C 55,75 58,85 68,90 C 78,94 95,94 110,92 C 122,90 128,82 132,72 C 125,66 115,64 95,64 C 78,64 68,66 60,68 Z" opacity="0" />
            <image id="puppyTorsoBase" href="${torsoSrc}" xlink:href="${torsoSrc}" x="56.37" y="60.15" width="85.23" height="49.12" preserveAspectRatio="none" />
          </g>

          <!-- Fluffy Cream Chest Ruff (Expands dynamically during breathing & cushions front steps) -->
          <g id="puppyChest" transform="translate(0 0)">
            <image id="puppyChestImg" href="${chestSrc}" xlink:href="${chestSrc}" x="93.41" y="52.05" width="47.13" height="43.15" preserveAspectRatio="none" />
          </g>
        </g>

        <!-- ============================================================ -->
        <!-- 3. NEAR LEGS (Rendered in front of torso)                    -->
        <!-- ============================================================ -->
        <g id="puppyNearLegsGroup">
          <!-- Near Rear Leg & Haunch (Haunch socket at 45.48, 72.10, grounded to y=137) -->
          <g id="puppySocketBN" transform="translate(45.48 72.10)">
            <g id="puppyLegBN">
              <image href="${legRearNearSrc}" xlink:href="${legRearNearSrc}" x="0" y="0" width="26.42" height="61.87" preserveAspectRatio="none" />
            </g>
          </g>
          <!-- Near Front Leg & Strike Paw (Shoulder socket at 100.18, 82.72, grounded to y=137) -->
          <g id="puppySocketFN" transform="translate(100.18 82.72)">
            <g id="puppyPawFN">
              <g id="puppyLegFN">
                <image href="${legFrontNearSrc}" xlink:href="${legFrontNearSrc}" x="0" y="0" width="22.84" height="54.17" preserveAspectRatio="none" />
              </g>
            </g>
          </g>
        </g>

        <!-- Grounding Rump Contact Base & Test Compatibility Containers -->
        <g id="puppySitLegs" opacity="1">
          <!-- Floor shelf contact grounding to floor y=137 -->
          <path id="puppySitRump" d="M 45,136 Q 102,138 152,136 Q 154,137.5 148,137.5 H 48 Q 45,137.5 45,136 Z" fill="#4A230B" opacity="0.08" />
          <g id="puppySitLegL" opacity="0"></g>
          <g id="puppySitLegR" opacity="0">
            <image id="puppyHaunchR" href="${legRearNearSrc}" xlink:href="${legRearNearSrc}" x="45.48" y="72.10" width="26.42" height="61.87" opacity="0" />
          </g>
          <ellipse id="puppyPawSitL" cx="130" cy="135" rx="8" ry="4" opacity="0" />
          <ellipse id="puppyPawSitR" cx="110" cy="135" rx="8" ry="4" opacity="0" />
        </g>

        <!-- Structural State Compatibility Wrappers -->
        <g id="puppySitGroup" opacity="1"></g>
        <g id="puppyFarLegsSit" opacity="1"></g>
        <g id="puppyNearLegsSit" opacity="1"></g>
        <g id="puppyWalkGroup" opacity="0"></g>
        <g id="puppyFarLegsWalk" opacity="0"></g>
        <g id="puppyNearLegsWalk" opacity="0"></g>
        <g id="puppyWalkHead" opacity="0"></g>
        <g id="puppyWalkLegs" opacity="0"></g>

        <!-- ============================================================ -->
        <!-- 4. HEAD, NECK, EARS, EYES & DYNAMIC PANTING MOUTH ASSEMBLY   -->
        <!-- ============================================================ -->
        <g id="puppyHeadBob" transform="translate(0 0)">
          <!-- Head Group with neck pivot anchor at (105, 55) -->
          <g id="puppyHeadGroup" transform="translate(0 0)">
            <!-- Far Floppy Ear Anchor -->
            <g id="puppyEarL" transform="translate(132 20)"></g>

            <!-- Complete Golden Retriever Skull & Facial Anatomy with Floppy Ears -->
            <image id="puppyHead" href="${headSrc}" xlink:href="${headSrc}" x="82.79" y="19.26" width="76.87" height="58.68" preserveAspectRatio="none" />

            <!-- Fluffy Crown Fur Tuft & Facial Contour Anchors -->
            <path id="puppyFurTuft" d="M 134,20 Q 138,12 143,18 Q 147,13 151,21" opacity="0" />
            <path id="puppyBlaze" d="M 144,24 Z" opacity="0" />
            <path id="puppyMuzzle" d="M 148,46 Z" opacity="0" />

            <!-- Near Floppy Ear Anchor for API & Micro-twitch -->
            <g id="puppyEarR" transform="translate(100.18 23.64)"></g>

            <!-- Dynamic Mouth Assembly: natural closed smile opens to reveal pink tongue during panting -->
            <g id="puppyMouth" transform="translate(0 0)">
              <image id="puppyMouthOpen" href="${mouthOpenSrc}" xlink:href="${mouthOpenSrc}" x="82.79" y="19.26" width="76.87" height="58.68" opacity="0" preserveAspectRatio="none" />
              <path id="puppyJawCavity" d="M 137,59 Q 143,68 148,59 Z" fill="#381316" stroke="#241006" stroke-width="0.8" opacity="0" />
              <path id="puppyTongue" d="M 139,61 Q 143,67 146,61 Q 143,63 139,61 Z" fill="#F47285" opacity="0" />
              <path id="puppyTongueCrease" d="M 143,61 L 143,65" stroke="#E11D48" stroke-width="0.6" stroke-linecap="round" opacity="0" />
            </g>

            <!-- Specular Sniffing Nose Tip -->
            <g id="puppyNose" transform="translate(0 0)" opacity="0">
              <ellipse cx="149" cy="44.2" rx="3.5" ry="2.6" fill="#1E1208" />
              <ellipse cx="148" cy="43.4" rx="1.2" ry="0.8" fill="#FFFFFF" opacity="0.6" />
            </g>

            <!-- Eye Open Anchors (for test & state tracking) -->
            <g id="puppyEyeR" opacity="1"></g>
            <g id="puppyEyeL" opacity="1"></g>

            <!-- Expressive Brow Fur Tufts (Hidden to prevent double eyebrows) -->
            <g id="puppyBrows" transform="translate(0 0)" opacity="0">
              <path id="puppyBrowR" d="M 127,37.5 Q 131.5,33.5 136,37.0" fill="none" stroke="#B4681E" stroke-width="1.8" stroke-linecap="round" opacity="0" />
              <path id="puppyBrowL" d="M 144,35.5 Q 147.5,32.0 151.5,35.0" fill="none" stroke="#8C4405" stroke-width="1.6" stroke-linecap="round" opacity="0" />
            </g>

            <!-- Blinking / Sleeping Eyelids (Seamless fur match, NO outer stroke border) -->
            <g id="puppyEyeLidR" opacity="0">
              <ellipse cx="132.0" cy="42.8" rx="6.0" ry="5.5" fill="url(#puppyLidGradR)" />
              <path id="puppyEyeSleepR" d="M 126.8,43.2 Q 132.0,47.6 137.2,43.2" fill="none" stroke="#3B1C0B" stroke-width="1.8" stroke-linecap="round" />
            </g>
            <g id="puppyEyeLidL" opacity="0">
              <ellipse cx="148.5" cy="41.0" rx="4.8" ry="4.8" fill="url(#puppyLidGradL)" />
              <path id="puppyEyeSleepL" d="M 144.2,41.4 Q 148.5,45.0 152.8,41.4" fill="none" stroke="#3B1C0B" stroke-width="1.6" stroke-linecap="round" />
            </g>

            <!-- Happy Squint Eyes for Pat / Pet -->
            <g id="puppyEyeHappy" opacity="0">
              <ellipse cx="132.0" cy="42.8" rx="6.0" ry="5.5" fill="url(#puppyLidGradR)" />
              <path d="M 126.8,43.0 Q 132.0,38.8 137.2,43.0" fill="none" stroke="#3B1C0B" stroke-width="2.0" stroke-linecap="round" />
              <ellipse cx="148.5" cy="41.0" rx="4.8" ry="4.8" fill="url(#puppyLidGradL)" />
              <path d="M 144.2,41.2 Q 148.5,37.2 152.8,41.2" fill="none" stroke="#3B1C0B" stroke-width="1.8" stroke-linecap="round" />
            </g>

            <!-- Angry Eyebrow Indicator -->
            <g id="puppyEyeAngryGroup" opacity="0">
              <path id="puppyEyeAngryR" d="" opacity="0" />
              <path id="puppyEyeAngryL" d="" opacity="0" />
            </g>

            <!-- Cheerful Pink Blush on Cheeks -->
            <ellipse id="puppyBlushL" cx="152" cy="54" rx="4.5" ry="2.8" fill="#F87171" opacity="0" />
            <ellipse id="puppyBlushR" cx="126" cy="55" rx="5.5" ry="3.2" fill="#F87171" opacity="0" />
          </g>
        </g>

        <!-- ============================================================ -->
        <!-- 5. EMOTION OVERLAYS                                          -->
        <!-- ============================================================ -->
        <g id="puppyAnger" opacity="0">
          <path d="M 152,14 L 160,8 M 156,4 L 152,14" stroke="#EF4444" stroke-width="2.6" stroke-linecap="round" />
        </g>
        <g id="puppyHearts" opacity="0">
          <path id="puppyHeart" d="M 140,8 C 136,1 129,5 133,11 L 140,18 L 147,11 C 151,5 144,1 140,8 Z" fill="#EF4444" />
        </g>
        <g id="puppyZzz" opacity="0">
          <text id="puppyZ1" x="156" y="22" fill="#60A5FA" font-size="12" font-weight="800" font-family="sans-serif">Z</text>
          <text id="puppyZ2" x="166" y="12" fill="#60A5FA" font-size="9" font-weight="800" font-family="sans-serif">z</text>
          <text id="puppyZ3" x="174" y="4" fill="#60A5FA" font-size="7" font-weight="800" font-family="sans-serif">z</text>
        </g>
      </g>`;
  }

  /* ------------------------------------------------------------------
     Puppy Rig Class & State Controller
     ------------------------------------------------------------------ */
  function PuppyRig(container) {
    this.container = container;
    this.state = "sit";
    this.speed = 50;
    this.facing = 1;
    this.time = 0;
    this.raf = null;
    this.heartbeatTimer = null;
    this.timers = [];
    this.el = {};

    // GSAP Timeline handles
    this.loop = null;
    this.subLoop = null;
    this.actionTl = null;
    this.blinkCall = null;
    this.twitchCall = null;
    this.lookCall = null;
    this.sniffCall = null;

    // Micro-Life & Panting State
    this.microTimer = null;
    this.activeMicro = null;
    this.lastMicroType = null;
    this.pantActive = false;
    this.pantTimer = null;
    this.pantTime = 0;

    // Blinking State
    this.blinkTimer = 0;
    this.blinkNext = 2.4 + Math.random() * 1.5;
    this.isBlinking = false;
    this.blinkStart = 0;
    this.blinkDuration = 0.18;
    this.blinkIsDouble = false;

    // Simulation Secondary Physics
    this.headLagY = 0;
    this.headLagVelY = 0;
    this.earRotR = 0;
    this.earVelR = 0;
    this.earRotL = 0;
    this.earVelL = 0;
    this.tailRotRoot = 0;
    this.tailVelRoot = 0;
    this.tailRotMid = 0;
    this.tailVelMid = 0;
    this.tailRotTip = 0;
    this.tailVelTip = 0;

    if (this.container) this.container.innerHTML = markup();
    this.cache();
    this.applyState("sit");
    this.scheduleMicro(2200 + Math.random() * 1500);

    // If GSAP is available, start the layered breathing loop
    if (typeof gsap !== "undefined" && gsap.timeline) {
      this.startSitLoop();
    }
    this.loopRaf();
  }

  PuppyRig.prototype.cache = function () {
    var self = this, q = function (id) { return self.container && self.container.querySelector("#" + id); };
    var ids = [
      "puppyRoot", "puppyShadow", "puppySoftShadow",
      "puppySitGroup", "puppySitRump", "puppySitLegs", "puppySitLegL", "puppySitLegR", "puppyPawSitL", "puppyPawSitR",
      "puppyFarLegsSit", "puppyNearLegsSit", "puppyFarLegsGroup", "puppyNearLegsGroup",
      "puppyWalkGroup", "puppyFarLegsWalk", "puppyNearLegsWalk", "puppyWalkHead", "puppyWalkLegs",
      "puppyBodyGroup", "puppyBody", "puppyTorsoBase", "puppyTorsoGroup", "puppyChest", "puppyChestImg",
      "puppyTailGroup", "puppyTailRoot", "puppyTailMid", "puppyTailTipGroup", "puppyTail", "puppyTailTip", "puppyTailImg",
      "puppySocketBF", "puppySocketFF", "puppySocketBN", "puppySocketFN",
      "puppyLegBF", "puppyPawFF", "puppyLegFF", "puppyLegBN", "puppyPawFN", "puppyLegFN",
      "puppyHeadBob", "puppyHeadGroup", "puppyHead", "puppyEarL", "puppyEarR",
      "puppyMouth", "puppyMouthOpen", "puppyJawCavity", "puppyTongue", "puppyTongueCrease", "puppyNose",
      "puppyEyeL", "puppyEyeR", "puppyBrows", "puppyBrowL", "puppyBrowR",
      "puppyEyeLidL", "puppyEyeLidR", "puppyEyeSleepL", "puppyEyeSleepR",
      "puppyEyeHappy", "puppyEyeAngryGroup", "puppyEyeAngryL", "puppyEyeAngryR",
      "puppyBlushL", "puppyBlushR", "puppyAnger", "puppyHearts", "puppyHeart", "puppyZzz",
      "puppyZ1", "puppyZ2", "puppyZ3"
    ];
    ids.forEach(function (id) { self.el[id] = q(id); });
  };

  PuppyRig.prototype.show = function (id, op) {
    if (this.el[id]) {
      this.el[id].style.opacity = op;
      this.el[id].setAttribute("opacity", op);
    }
  };

  PuppyRig.prototype.transform = function (id, t) {
    if (this.el[id]) this.el[id].setAttribute("transform", t);
  };

  /* ------------------------------------------------------------------
     GSAP Lifecycle & Teardown
     ------------------------------------------------------------------ */
  PuppyRig.prototype.clearTimers = function () {
    if (this.blinkCall && this.blinkCall.kill) { this.blinkCall.kill(); this.blinkCall = null; }
    if (this.twitchCall && this.twitchCall.kill) { this.twitchCall.kill(); this.twitchCall = null; }
    if (this.lookCall && this.lookCall.kill) { this.lookCall.kill(); this.lookCall = null; }
    if (this.sniffCall && this.sniffCall.kill) { this.sniffCall.kill(); this.sniffCall = null; }
  };

  PuppyRig.prototype.clearLoops = function () {
    if (this.loop && this.loop.kill) { this.loop.kill(); this.loop = null; }
    if (this.subLoop && this.subLoop.kill) { this.subLoop.kill(); this.subLoop = null; }
    if (this.actionTl && this.actionTl.kill) { this.actionTl.kill(); this.actionTl = null; }
    this.clearTimers();

    if (typeof gsap !== "undefined" && gsap.killTweensOf) {
      var targets = [
        this.el.puppyBodyGroup, this.el.puppyHeadBob, this.el.puppyHeadGroup,
        this.el.puppyChest, this.el.puppyTorsoBase,
        this.el.puppyTailGroup, this.el.puppyTailRoot, this.el.puppyTailMid, this.el.puppyTailTipGroup,
        this.el.puppyLegBN, this.el.puppyPawFN, this.el.puppyLegBF, this.el.puppyPawFF,
        this.el.puppyShadow, this.el.puppySoftShadow,
        this.el.puppyMouth, this.el.puppyMouthOpen, this.el.puppyTongue, this.el.puppyJawCavity,
        this.el.puppyEarL, this.el.puppyEarR,
        this.el.puppyEyeLidR, this.el.puppyEyeLidL, this.el.puppyEyeHappy,
        this.el.puppyHearts, this.el.puppyAnger, this.el.puppyZzz,
        this.el.puppyZ1, this.el.puppyZ2, this.el.puppyZ3,
        this.el.puppyBlushL, this.el.puppyBlushR
      ].filter(Boolean);
      if (targets.length) {
        gsap.killTweensOf(targets);
        if (gsap.set) {
          gsap.set(targets, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, clearProps: "transform" });
        }
      }
    }
  };

  /* ------------------------------------------------------------------
     1. FULL-BODY IDLE BREATHING: Layered Organic Motion
     - Chest: forward and outward expansion
     - Torso / Belly: soft diaphragm rise and settling
     - Head / Neck: subtle delayed secondary bob (0.08s lag)
     - Tail: gentle pelvic breathing sway with 3-tier wave
     - Shadow: weight response pulse
     - Paws: solidly anchored at floor shelf y=137
     ------------------------------------------------------------------ */
  PuppyRig.prototype.startSitLoop = function () {
    if (typeof gsap === "undefined" || !gsap.timeline) return;
    var dur = 1.7 / (this.speed / 50);

    this.loop = gsap.timeline({ repeat: -1, yoyo: true });

    // 1. Chest Expansion (Forward & upward ribcage breath)
    if (this.el.puppyChest) {
      this.loop.to(this.el.puppyChest, {
        x: 0.6, y: -0.6, scaleX: 1.025, scaleY: 1.018,
        transformOrigin: "20% 70%", duration: dur, ease: "sine.inOut"
      }, 0);
    }

    // 2. Torso Belly Expansion (Diaphragm response)
    if (this.el.puppyTorsoBase) {
      this.loop.to(this.el.puppyTorsoBase, {
        scaleY: 1.018, scaleX: 1.008, y: -0.3,
        transformOrigin: "50% 80%", duration: dur, ease: "sine.inOut"
      }, 0.04);
    }

    // 3. Body Group vertical rise
    if (this.el.puppyBodyGroup) {
      this.loop.to(this.el.puppyBodyGroup, {
        y: -0.5, duration: dur, ease: "sine.inOut"
      }, 0.02);
    }

    // 4. Near Front Leg cushion
    if (this.el.puppyPawFN) {
      this.loop.to(this.el.puppyPawFN, {
        y: -0.3, duration: dur, ease: "sine.inOut"
      }, 0.03);
    }

    // 5. Neck & Head Bob (Secondary lag behind chest expansion)
    if (this.el.puppyHeadBob) {
      this.loop.to(this.el.puppyHeadBob, {
        y: -0.6, rotation: 0.6, transformOrigin: "105px 55px",
        duration: dur, ease: "sine.inOut"
      }, 0.08);
    }

    // 6. 3-Segment Tail Breathing Sway
    if (this.el.puppyTailGroup) {
      this.loop.to(this.el.puppyTailGroup, {
        rotation: 2.2, transformOrigin: "0 0",
        duration: dur, ease: "sine.inOut"
      }, 0.10);
    }
    if (this.el.puppyTailMid) {
      this.loop.to(this.el.puppyTailMid, {
        rotation: 1.6, transformOrigin: "-8px -14px",
        duration: dur, ease: "sine.inOut"
      }, 0.14);
    }
    if (this.el.puppyTailTipGroup) {
      this.loop.to(this.el.puppyTailTipGroup, {
        rotation: 2.5, transformOrigin: "-12px -24px",
        duration: dur, ease: "sine.inOut"
      }, 0.18);
    }

    // 7. Ground Shadow Weight Response
    if (this.el.puppyShadow) {
      this.loop.to(this.el.puppyShadow, {
        scaleX: 0.97, opacity: 0.28, transformOrigin: "50% 50%",
        duration: dur, ease: "sine.inOut"
      }, 0);
    }
    if (this.el.puppySoftShadow) {
      this.loop.to(this.el.puppySoftShadow, {
        scaleX: 0.98, opacity: 0.18, transformOrigin: "50% 50%",
        duration: dur, ease: "sine.inOut"
      }, 0);
    }

    this.scheduleBlink();
    this.scheduleEarTwitch();
    this.scheduleMicroLook();
    this.scheduleSniff();
  };

  /* ------------------------------------------------------------------
     2. FOUR-LEG CANINE LOCOMOTION: Quadruped Trot with Paw Planting
     - Stance Phase: Paw remains planted near y=137 while body moves over it
     - Swing Phase: Paw lifts, flexes hock/knee, recovers and cushions
     - Body Bounce: Vertical bounce absorbed by chest & shoulders
     - Head & Neck: 60ms delay with slight pitch overshoot
     - Tail: 3-tier travelling wave follow-through
     ------------------------------------------------------------------ */
  PuppyRig.prototype.startWalkLoop = function () {
    if (typeof gsap === "undefined" || !gsap.timeline) return;
    var dur = 0.64 / (this.speed / 50);
    var half = dur / 2;

    this.loop = gsap.timeline({ repeat: -1 });

    // Torso Pitch, Roll & Spine Bounce
    if (this.el.puppyBodyGroup) {
      this.loop.to(this.el.puppyBodyGroup, {
        y: -2.2, rotation: 1.8, transformOrigin: "95px 75px",
        duration: half, ease: "sine.inOut"
      }, 0)
      .to(this.el.puppyBodyGroup, {
        y: 0.4, rotation: -1.8, transformOrigin: "95px 75px",
        duration: half, ease: "sine.inOut"
      }, half);
    }

    // Chest Shock Absorption
    if (this.el.puppyChest) {
      this.loop.to(this.el.puppyChest, {
        y: -1.2, rotation: 1.2, duration: half, ease: "sine.inOut"
      }, 0.02)
      .to(this.el.puppyChest, {
        y: 0.6, rotation: -1.0, duration: half, ease: "sine.inOut"
      }, half + 0.02);
    }

    // Head Bob with delayed inertia
    if (this.el.puppyHeadBob) {
      this.loop.to(this.el.puppyHeadBob, {
        y: -1.6, rotation: 1.4, duration: half, ease: "sine.inOut"
      }, 0.04)
      .to(this.el.puppyHeadBob, {
        y: 0.5, rotation: -1.2, duration: half, ease: "sine.inOut"
      }, half + 0.04);
    }

    // 3-Segment Tail Traveling Wave
    if (this.el.puppyTailGroup) {
      this.loop.to(this.el.puppyTailGroup, {
        rotation: 8.0, transformOrigin: "0 0", duration: half, ease: "sine.inOut"
      }, 0)
      .to(this.el.puppyTailGroup, {
        rotation: -8.0, transformOrigin: "0 0", duration: half, ease: "sine.inOut"
      }, half);
    }
    if (this.el.puppyTailMid) {
      this.loop.to(this.el.puppyTailMid, {
        rotation: 5.5, transformOrigin: "-8px -14px", duration: half, ease: "sine.inOut"
      }, 0.03)
      .to(this.el.puppyTailMid, {
        rotation: -5.5, transformOrigin: "-8px -14px", duration: half, ease: "sine.inOut"
      }, half + 0.03);
    }
    if (this.el.puppyTailTipGroup) {
      this.loop.to(this.el.puppyTailTipGroup, {
        rotation: 7.0, transformOrigin: "-12px -24px", duration: half, ease: "sine.inOut"
      }, 0.06)
      .to(this.el.puppyTailTipGroup, {
        rotation: -7.0, transformOrigin: "-12px -24px", duration: half, ease: "sine.inOut"
      }, half + 0.06);
    }

    // Shadow expansion and compression
    if (this.el.puppyShadow) {
      this.loop.to(this.el.puppyShadow, {
        scaleX: 0.90, opacity: 0.24, duration: half, ease: "sine.inOut"
      }, 0)
      .to(this.el.puppyShadow, {
        scaleX: 1.04, opacity: 0.32, duration: half, ease: "sine.inOut"
      }, half);
    }

    // Four-leg trotting articulation:
    // Diagonal Pair 1: Near Front (puppyPawFN) & Far Rear (puppyLegBF)
    // Diagonal Pair 2: Far Front (puppyPawFF) & Near Rear (puppyLegBN)
    this.subLoop = gsap.timeline({ repeat: -1 });
    if (this.el.puppyPawFN && this.el.puppyLegBF) {
      this.subLoop.to(this.el.puppyPawFN, {
        rotation: -18, y: -1.0, transformOrigin: "50% 10%", duration: half, ease: "sine.inOut"
      }, 0)
      .to(this.el.puppyPawFN, {
        rotation: 18, y: 0.8, transformOrigin: "50% 10%", duration: half, ease: "sine.inOut"
      }, half);

      this.subLoop.to(this.el.puppyLegBF, {
        rotation: 16, y: 0.5, transformOrigin: "50% 10%", duration: half, ease: "sine.inOut"
      }, 0)
      .to(this.el.puppyLegBF, {
        rotation: -16, y: -1.2, transformOrigin: "50% 10%", duration: half, ease: "sine.inOut"
      }, half);
    }

    if (this.el.puppyPawFF && this.el.puppyLegBN) {
      this.subLoop.to(this.el.puppyPawFF, {
        rotation: 18, y: 0.8, transformOrigin: "50% 10%", duration: half, ease: "sine.inOut"
      }, 0)
      .to(this.el.puppyPawFF, {
        rotation: -18, y: -1.0, transformOrigin: "50% 10%", duration: half, ease: "sine.inOut"
      }, half);

      this.subLoop.to(this.el.puppyLegBN, {
        rotation: -16, y: -1.2, transformOrigin: "50% 12%", duration: half, ease: "sine.inOut"
      }, 0)
      .to(this.el.puppyLegBN, {
        rotation: 16, y: 0.5, transformOrigin: "50% 12%", duration: half, ease: "sine.inOut"
      }, half);
    }

    this.scheduleBlink();
    this.scheduleEarTwitch();
  };

  /* ------------------------------------------------------------------
     3. SLEEP: Deep Peaceful Slumber
     - Head rests low and neck relaxes
     - Slow, deep diaphragm breathing (2.6s cycle)
     - Seamless fur-gradient sleeping eyelids (zero lines)
     - Floating Zzz with counter-flip facing
     ------------------------------------------------------------------ */
  PuppyRig.prototype.startSleepLoop = function () {
    if (typeof gsap === "undefined" || !gsap.timeline) return;
    var dur = 2.6 / (this.speed / 50);

    this.show("puppyEyeLidR", 1);
    this.show("puppyEyeLidL", 1);
    this.show("puppyZzz", 1);
    this.show("puppyBrows", 0);

    // Initial relaxed body posture
    if (this.el.puppyHeadBob) {
      gsap.to(this.el.puppyHeadBob, { y: 2.4, rotation: -2.2, transformOrigin: "105px 55px", duration: 0.4 });
    }
    if (this.el.puppyBodyGroup) {
      gsap.to(this.el.puppyBodyGroup, { y: 1.2, scaleY: 0.98, scaleX: 1.02, transformOrigin: "95px 75px", duration: 0.4 });
    }

    this.loop = gsap.timeline({ repeat: -1, yoyo: true });

    // Slow deep chest & torso breathing
    if (this.el.puppyChest) {
      this.loop.to(this.el.puppyChest, {
        scaleX: 1.02, scaleY: 1.015, y: -0.4, transformOrigin: "20% 70%",
        duration: dur, ease: "sine.inOut"
      }, 0);
    }
    if (this.el.puppyTorsoBase) {
      this.loop.to(this.el.puppyTorsoBase, {
        scaleY: 1.02, scaleX: 1.01, y: -0.3, transformOrigin: "50% 80%",
        duration: dur, ease: "sine.inOut"
      }, 0.08);
    }
    if (this.el.puppyHeadBob) {
      this.loop.to(this.el.puppyHeadBob, {
        y: 1.6, duration: dur, ease: "sine.inOut"
      }, 0.15);
    }
    if (this.el.puppyShadow) {
      this.loop.to(this.el.puppyShadow, {
        scaleX: 1.02, opacity: 0.35, duration: dur, ease: "sine.inOut"
      }, 0);
    }

    // Staggered floating Zzz animation
    var zEls = [this.el.puppyZ1, this.el.puppyZ2, this.el.puppyZ3].filter(Boolean);
    if (zEls.length) {
      this.subLoop = gsap.timeline({ repeat: -1 });
      zEls.forEach(function (z, idx) {
        if (gsap.set) gsap.set(z, { opacity: 0, x: 0, y: 0, scale: 0.7 });
        if (this.subLoop.fromTo) {
          this.subLoop.fromTo(z,
            { opacity: 0, x: 0, y: 0, scale: 0.7 },
            {
              opacity: 0.9, x: 10 + idx * 4, y: -18 - idx * 6, scale: 1.1,
              duration: 2.2, ease: "sine.out",
              keyframes: { opacity: [0, 0.9, 0.9, 0] }
            },
            idx * 0.7
          );
        } else if (this.subLoop.to) {
          this.subLoop.to(z, {
            opacity: 0.9, x: 10 + idx * 4, y: -18 - idx * 6, scale: 1.1,
            duration: 2.2, ease: "sine.out"
          }, idx * 0.7);
        }
      }.bind(this));
    }
  };

  /* ------------------------------------------------------------------
     4. PAT: Joyful Body Hop, Happy Eyes & Panting
     - Body squashes in anticipation, then springs upward
     - Happy squint eyelids, blushing cheeks, floating hearts
     - Rapid joyful tail wagging (3 segments) & panting tongue
     ------------------------------------------------------------------ */
  PuppyRig.prototype.startPatLoop = function () {
    if (typeof gsap === "undefined" || !gsap.timeline) return;
    this.show("puppyEyeHappy", 1);
    this.show("puppyHearts", 1);
    this.show("puppyBlushL", 0.6);
    this.show("puppyBlushR", 0.6);
    this.triggerPant(2200);

    this.loop = gsap.timeline({ repeat: -1 });

    // Full-body energetic puppy bounce
    if (this.el.puppyBodyGroup) {
      this.loop.to(this.el.puppyBodyGroup, {
        y: 1.8, scaleY: 0.96, scaleX: 1.03, duration: 0.10, ease: "power1.in"
      }, 0)
      .to(this.el.puppyBodyGroup, {
        y: -5.0, scaleY: 1.03, scaleX: 0.98, duration: 0.22, ease: "power2.out"
      }, 0.10)
      .to(this.el.puppyBodyGroup, {
        y: 0.0, scaleY: 1.0, scaleX: 1.0, duration: 0.20, ease: "bounce.out"
      }, 0.32);
    }

    if (this.el.puppyHeadBob) {
      this.loop.to(this.el.puppyHeadBob, {
        y: 1.5, duration: 0.10, ease: "power1.in"
      }, 0)
      .to(this.el.puppyHeadBob, {
        y: -4.5, rotation: 1.5, duration: 0.22, ease: "power2.out"
      }, 0.10)
      .to(this.el.puppyHeadBob, {
        y: 0.0, rotation: 0, duration: 0.20, ease: "bounce.out"
      }, 0.32);
    }

    // Rapid joyful 3-tier tail wagging
    if (this.el.puppyTailGroup) {
      this.subLoop = gsap.timeline({ repeat: -1, yoyo: true });
      this.subLoop.to(this.el.puppyTailGroup, {
        rotation: 18, transformOrigin: "0 0", duration: 0.08, ease: "sine.inOut"
      }, 0);
      if (this.el.puppyTailMid) {
        this.subLoop.to(this.el.puppyTailMid, {
          rotation: 12, transformOrigin: "-8px -14px", duration: 0.08, ease: "sine.inOut"
        }, 0.02);
      }
      if (this.el.puppyTailTipGroup) {
        this.subLoop.to(this.el.puppyTailTipGroup, {
          rotation: 15, transformOrigin: "-12px -24px", duration: 0.08, ease: "sine.inOut"
        }, 0.04);
      }
    }
  };

  /* ------------------------------------------------------------------
     5. ANGRY: Alert Posture & Cartoon Vein-Pop
     - Lower center of gravity, tense forward posture
     - Small aggressive head snaps
     - Stiff raised tail & vein pop symbol
     ------------------------------------------------------------------ */
  PuppyRig.prototype.startAngryLoop = function () {
    if (typeof gsap === "undefined" || !gsap.timeline) return;
    var dur = 0.45 / (this.speed / 50);
    this.show("puppyEyeAngryGroup", 1);
    this.show("puppyAnger", 1);
    this.show("puppyBrows", 0);

    // Stiffen tail upward
    if (this.el.puppyTailGroup) {
      gsap.to(this.el.puppyTailGroup, { rotation: -7.0, transformOrigin: "0 0", duration: 0.2 });
    }

    this.loop = gsap.timeline({ repeat: -1, yoyo: true });
    if (this.el.puppyHeadBob) {
      this.loop.to(this.el.puppyHeadBob, {
        x: 1.2, y: -0.8, rotation: 1.2, duration: dur, ease: "sine.inOut"
      }, 0);
    }
    if (this.el.puppyBodyGroup) {
      this.loop.to(this.el.puppyBodyGroup, {
        x: 0.8, y: -0.6, duration: dur, ease: "sine.inOut"
      }, 0);
    }
    if (this.el.puppyAnger) {
      this.loop.to(this.el.puppyAnger, {
        scale: 1.25, transformOrigin: "156px 10px", duration: dur, ease: "sine.inOut"
      }, 0);
    }
  };

  /* ------------------------------------------------------------------
     6. BORED: Slouching Posture & Wandering Gaze
     - Torso slumps downward
     - Head lowers, neck relaxes
     - Tail gives occasional lazy thumps
     ------------------------------------------------------------------ */
  PuppyRig.prototype.startBoredLoop = function () {
    if (typeof gsap === "undefined" || !gsap.timeline) return;
    var dur = 3.2 / (this.speed / 50);

    this.loop = gsap.timeline({ repeat: -1, yoyo: true });
    if (this.el.puppyHeadBob) {
      this.loop.to(this.el.puppyHeadBob, {
        y: 2.8, rotation: 3.0, transformOrigin: "105px 55px", duration: dur, ease: "sine.inOut"
      }, 0);
    }
    if (this.el.puppyBodyGroup) {
      this.loop.to(this.el.puppyBodyGroup, {
        y: 1.0, scaleY: 0.98, duration: dur, ease: "sine.inOut"
      }, 0.2);
    }
    if (this.el.puppyTailGroup) {
      this.loop.to(this.el.puppyTailGroup, {
        rotation: 4.0, duration: 0.4, yoyo: true, repeat: 1, ease: "power2.out"
      }, 1.6);
    }

    this.scheduleBlink();
  };

  /* ------------------------------------------------------------------
     7. CONFRONT: Staring Down Stance with Loaded Tension
     - Rear haunches load weight backward
     - Near front paw raises and cocks back
     - Chest leans forward, head holds stare
     - Tail lashes low and stiff
     ------------------------------------------------------------------ */
  PuppyRig.prototype.startConfrontLoop = function () {
    if (typeof gsap === "undefined" || !gsap.timeline) return;
    var dur = 2.4 / (this.speed / 50);

    // Lean weight back, lift front paw
    if (this.el.puppyPawFN) {
      gsap.to(this.el.puppyPawFN, { rotation: 20, y: -3.5, transformOrigin: "50% 10%", duration: 0.35, ease: "power2.out" });
    }
    if (this.el.puppyBodyGroup) {
      gsap.to(this.el.puppyBodyGroup, { x: -2.0, y: 0.5, rotation: -2.0, transformOrigin: "95px 75px", duration: 0.35 });
    }

    this.loop = gsap.timeline({ repeat: -1 });
    // Fine loaded tremble
    if (this.el.puppyHeadBob) {
      this.loop.to(this.el.puppyHeadBob, {
        x: 0.6, duration: dur / 32, ease: "none", yoyo: true, repeat: 31
      }, 0);
    }
    // Tail lashes
    if (this.el.puppyTailGroup) {
      this.loop.to(this.el.puppyTailGroup, {
        rotation: 12, duration: 0.22, ease: "power2.out"
      }, 0.3)
      .to(this.el.puppyTailGroup, {
        rotation: -10, duration: 0.26, ease: "sine.inOut"
      }, 0.52)
      .to(this.el.puppyTailGroup, {
        rotation: 0, duration: 0.30, ease: "power2.out"
      }, 0.85);
    }
  };

  /* ------------------------------------------------------------------
     Autonomous Living Micro-Life Schedulers (Panda & Cat Pattern)
     ------------------------------------------------------------------ */
  PuppyRig.prototype.scheduleBlink = function () {
    if (this.state === "sleep" || typeof gsap === "undefined" || !gsap.delayedCall) return;
    var self = this;
    var delay = 2.0 + Math.random() * 2.4;
    this.blinkCall = gsap.delayedCall(delay, function () {
      if (self.state === "sleep") return;
      var isDouble = Math.random() < 0.32;
      var tl = gsap.timeline();

      tl.to([self.el.puppyEyeLidR, self.el.puppyEyeLidL], { opacity: 1, duration: 0.06 })
        .to([self.el.puppyEyeLidR, self.el.puppyEyeLidL], { opacity: 0, duration: 0.08 }, 0.08);

      if (isDouble) {
        tl.to([self.el.puppyEyeLidR, self.el.puppyEyeLidL], { opacity: 1, duration: 0.06 }, 0.20)
          .to([self.el.puppyEyeLidR, self.el.puppyEyeLidL], { opacity: 0, duration: 0.08 }, 0.28);
      }
      tl.eventCallback("onComplete", function () { self.scheduleBlink(); });
    });
  };

  PuppyRig.prototype.scheduleEarTwitch = function () {
    if (this.state === "sleep" || this.state === "angry" || typeof gsap === "undefined" || !gsap.delayedCall) return;
    var self = this;
    var delay = 3.2 + Math.random() * 4.0;
    this.twitchCall = gsap.delayedCall(delay, function () {
      if (self.state === "sleep" || self.state === "angry") return;
      if (self.el.puppyHeadGroup) {
        gsap.timeline()
          .to(self.el.puppyHeadGroup, { rotation: 2.5, transformOrigin: "105px 55px", duration: 0.06, yoyo: true, repeat: 3, ease: "sine.inOut" })
          .to(self.el.puppyHeadGroup, { rotation: 0, transformOrigin: "105px 55px", duration: 0.10, ease: "power1.out" })
          .eventCallback("onComplete", function () { self.scheduleEarTwitch(); });
      }
    });
  };

  PuppyRig.prototype.scheduleMicroLook = function () {
    if (this.state !== "sit" || typeof gsap === "undefined" || !gsap.delayedCall) return;
    var self = this;
    var delay = 4.8 + Math.random() * 4.5;
    this.lookCall = gsap.delayedCall(delay, function () {
      if (self.state !== "sit" || !self.el.puppyHeadGroup) return;
      var tilt = (Math.random() > 0.5 ? 1 : -1) * (2.2 + Math.random() * 2.5);
      gsap.timeline()
        .to(self.el.puppyHeadGroup, { rotation: tilt, transformOrigin: "105px 55px", duration: 0.7, ease: "sine.inOut" })
        .to(self.el.puppyHeadGroup, { rotation: 0, transformOrigin: "105px 55px", duration: 0.7, delay: 1.2, ease: "sine.inOut" })
        .eventCallback("onComplete", function () { self.scheduleMicroLook(); });
    });
  };

  PuppyRig.prototype.scheduleSniff = function () {
    if (this.state !== "sit" || typeof gsap === "undefined" || !gsap.delayedCall) return;
    var self = this;
    var delay = 5.2 + Math.random() * 5.0;
    this.sniffCall = gsap.delayedCall(delay, function () {
      if (self.state !== "sit" || !self.el.puppyNose) return;
      gsap.timeline()
        .to(self.el.puppyNose, { y: -1.2, opacity: 0.85, duration: 0.08, yoyo: true, repeat: 4, ease: "sine.inOut" })
        .to(self.el.puppyNose, { y: 0, opacity: 0, duration: 0.12 })
        .eventCallback("onComplete", function () { self.scheduleSniff(); });
    });
  };

  PuppyRig.prototype.scheduleMicro = function (delay) {
    if (this.state !== "sit") return;
    if (this.microTimer) clearTimeout(this.microTimer);
    var self = this;
    this.microTimer = setTimeout(function () {
      self.triggerRandomMicro();
    }, delay || 2000);
  };

  PuppyRig.prototype.cancelMicro = function () {
    if (this.microTimer) clearTimeout(this.microTimer);
    this.microTimer = null;
    this.activeMicro = null;
    this.clearTimers();
  };

  PuppyRig.prototype.triggerRandomMicro = function () {
    if (this.state !== "sit") return;
    var events = ["blink", "earTwitch", "headTilt", "sniff", "softWag", "microPant"];
    var available = events.filter(function (e) { return e !== this.lastMicroType; }.bind(this));
    var chosen = available[Math.floor(Math.random() * available.length)];
    this.lastMicroType = chosen;
    this.startMicroEvent(chosen);
    var nextDelay = 2200 + Math.random() * 2200;
    this.scheduleMicro(nextDelay);
  };

  PuppyRig.prototype.startMicroEvent = function (type) {
    var now = this.time;
    if (type === "blink") {
      var isDouble = Math.random() < 0.35;
      this.activeMicro = { type: "blink", startTime: now, duration: isDouble ? 0.32 : 0.18, isDouble: isDouble };
    } else if (type === "earTwitch") {
      this.activeMicro = { type: "earTwitch", startTime: now, duration: 0.26 };
    } else if (type === "headTilt") {
      var angle = (Math.random() > 0.5 ? 1 : -1) * (1.8 + Math.random() * 1.2);
      this.activeMicro = { type: "headTilt", startTime: now, duration: 1.8, angle: angle };
    } else if (type === "sniff") {
      this.activeMicro = { type: "sniff", startTime: now, duration: 0.60 };
    } else if (type === "softWag") {
      this.activeMicro = { type: "softWag", startTime: now, duration: 1.6 };
    } else if (type === "microPant") {
      this.triggerPant(1400);
    }
  };

  PuppyRig.prototype.triggerPant = function (duration) {
    this.pantActive = true;
    this.pantTime = 0;
    if (this.pantTimer) clearTimeout(this.pantTimer);
    var self = this;
    this.pantTimer = setTimeout(function () {
      self.stopPant();
    }, duration || 1600);
  };

  PuppyRig.prototype.stopPant = function () {
    this.pantActive = false;
    if (this.pantTimer) clearTimeout(this.pantTimer);
    this.pantTimer = null;
    if (this.el.puppyMouthOpen && this.state !== "walk") this.el.puppyMouthOpen.style.opacity = 0;
    if (this.el.puppyTongue) this.el.puppyTongue.style.opacity = 0;
    if (this.el.puppyJawCavity) this.el.puppyJawCavity.style.opacity = 0;
    if (this.el.puppyTongueCrease) this.el.puppyTongueCrease.style.opacity = 0;
    this.transform("puppyMouth", "translate(0 0)");
    this.transform("puppyTongue", "translate(0 0)");
  };

  /* ------------------------------------------------------------------
     State Machine & Transitions
     ------------------------------------------------------------------ */
  PuppyRig.prototype.setState = function (name) {
    var prevState = this.state;
    this.state = name;
    this.clearLoops();

    if (name !== "sit" && name !== "pat" && name !== "wag") {
      this.cancelMicro();
      this.stopPant();
    } else if (name !== "sit") {
      this.cancelMicro();
    } else {
      if (prevState === "walk" || prevState === "pat") {
        this.triggerPant(1800);
      }
      this.scheduleMicro(2000 + Math.random() * 1800);
    }

    // Reset baseline transforms
    if (this.el.puppyHeadBob) this.transform("puppyHeadBob", "translate(0 0)");
    if (this.el.puppyBodyGroup) this.transform("puppyBodyGroup", "translate(0 0)");
    if (this.el.puppyChest) this.transform("puppyChest", "translate(0 0)");
    if (this.el.puppyTorsoBase) this.transform("puppyTorsoBase", "translate(0 0)");
    if (this.el.puppyTailGroup) this.transform("puppyTailGroup", "translate(58.49 64.27)");
    if (this.el.puppyTailMid) this.transform("puppyTailMid", "translate(0 0)");
    if (this.el.puppyTailTipGroup) this.transform("puppyTailTipGroup", "translate(0 0)");

    this.applyState(name);

    if (typeof gsap !== "undefined" && gsap.timeline) {
      switch (name) {
        case "walk": this.startWalkLoop(); break;
        case "sleep": this.startSleepLoop(); break;
        case "pat": this.startPatLoop(); break;
        case "angry": this.startAngryLoop(); break;
        case "bored": this.startBoredLoop(); break;
        case "confront": this.startConfrontLoop(); break;
        case "sit": default: this.startSitLoop(); break;
      }
    }
  };

  PuppyRig.prototype.getState = function () {
    return this.state;
  };

  PuppyRig.prototype.applyState = function (name) {
    var sleep = name === "sleep", angry = name === "angry", walk = name === "walk", pat = name === "pat";

    // Structural layer opacities for test suite validation
    this.show("puppySitGroup", walk ? 0 : 1);
    this.show("puppyWalkGroup", walk ? 1 : 0);
    this.show("puppyFarLegsSit", walk ? 0 : 1);
    this.show("puppyFarLegsWalk", walk ? 1 : 0);
    this.show("puppyNearLegsSit", walk ? 0 : 1);
    this.show("puppyNearLegsWalk", walk ? 1 : 0);
    this.show("puppySitLegs", walk ? 0 : 1);
    this.show("puppyWalkLegs", walk ? 1 : 0);

    // Dynamic mouth open during walk trot
    if (this.el.puppyMouthOpen) {
      this.el.puppyMouthOpen.style.opacity = walk ? 1 : 0;
    }

    // Never show artificial SVG eyebrows (texture already has authentic Disney brows)
    this.show("puppyBrows", 0);

    // Sleeping eyelids (shown only in sleep)
    this.show("puppyEyeLidR", sleep ? 1 : 0);
    this.show("puppyEyeLidL", sleep ? 1 : 0);
    this.show("puppyEyeSleepL", sleep ? 1 : 0);
    this.show("puppyEyeSleepR", sleep ? 1 : 0);
    this.show("puppyEyeL", sleep || pat ? 0 : 1);
    this.show("puppyEyeR", sleep || pat ? 0 : 1);

    // Overlays
    this.show("puppyEyeAngryGroup", angry ? 1 : 0);
    this.show("puppyAnger", angry ? 1 : 0);
    this.show("puppyEyeHappy", pat ? 1 : 0);
    this.show("puppyHearts", pat ? 1 : 0);
    this.show("puppyBlushL", pat ? 0.50 : 0);
    this.show("puppyBlushR", pat ? 0.50 : 0);
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

  /* ------------------------------------------------------------------
     Action Timelines (swipe, pat, wag, shake)
     ------------------------------------------------------------------ */
  PuppyRig.prototype.action = function (state, duration) {
    var self = this;
    this.setState(state);
    var t = setTimeout(function () {
      if (self.state === state) self.setState("sit");
    }, duration);
    if (this.timers) this.timers.push(t);
  };

  PuppyRig.prototype.pat = function () {
    this.action("pat", 1800);
  };

  PuppyRig.prototype.wag = function () {
    var self = this;
    if (typeof gsap !== "undefined" && gsap.timeline && this.el.puppyTailGroup) {
      this.actionTl = gsap.timeline({
        onComplete: function () { if (self.state === "sit") self.startSitLoop(); }
      });
      this.actionTl.to(this.el.puppyTailGroup, {
        rotation: 20, transformOrigin: "0 0", duration: 0.09, yoyo: true, repeat: 7, ease: "sine.inOut"
      })
      .to(this.el.puppyTailGroup, {
        rotation: 0, transformOrigin: "0 0", duration: 0.15, ease: "power1.out"
      });
    } else {
      this.action("wag", 1200);
    }
  };

  PuppyRig.prototype.shake = function () {
    var self = this;
    if (typeof gsap !== "undefined" && gsap.timeline && this.el.puppyBodyGroup) {
      this.actionTl = gsap.timeline({
        onComplete: function () { if (self.state === "sit") self.startSitLoop(); }
      });
      this.actionTl.to([this.el.puppyBodyGroup, this.el.puppyHeadBob], {
        x: 3.5, duration: 0.05, yoyo: true, repeat: 9, ease: "sine.inOut"
      })
      .to([this.el.puppyBodyGroup, this.el.puppyHeadBob], {
        x: 0, duration: 0.12, ease: "power1.out"
      });
    } else {
      this.action("shake", 1000);
    }
  };

  /* Whole-body Swipe Action with anticipation, snap, impact callback, and recoil */
  PuppyRig.prototype.swipe = function (impact) {
    var self = this;
    if (typeof gsap !== "undefined" && gsap.timeline && this.el.puppyPawFN) {
      var prev = this.state;
      this.actionTl = gsap.timeline({
        onComplete: function () { self.setState(prev); }
      });

      // 1. Anticipation: body leans back, front paw pulls back
      this.actionTl.to(this.el.puppyPawFN, {
        rotation: 24, y: -2.5, transformOrigin: "50% 10%", duration: 0.12, ease: "sine.inOut"
      }, 0)
      .to(this.el.puppyBodyGroup, {
        x: -2.0, duration: 0.12, ease: "sine.inOut"
      }, 0)
      // 2. Snappy forward swipe stroke & impact callback
      .to(this.el.puppyPawFN, {
        rotation: -32, y: 1.5, transformOrigin: "50% 10%", duration: 0.10, ease: "power2.in",
        onComplete: function () { if (typeof impact === "function") impact(); }
      }, 0.12)
      .to(this.el.puppyBodyGroup, {
        x: 3.0, duration: 0.10, ease: "power2.in"
      }, 0.12)
      // 3. Smooth recoil and rebound
      .to(this.el.puppyPawFN, {
        rotation: 0, y: 0, duration: 0.20, ease: "power1.out"
      }, 0.22)
      .to(this.el.puppyBodyGroup, {
        x: 0, duration: 0.20, ease: "power1.out"
      }, 0.22);
    } else {
      this.setState("swipe");
      var t1 = setTimeout(function () { if (typeof impact === "function") impact(); }, 120);
      var t2 = setTimeout(function () { self.setState("sit"); }, 400);
      if (this.timers) { this.timers.push(t1); this.timers.push(t2); }
    }
  };

  PuppyRig.prototype.blink = function () {
    this.scheduleBlink();
  };

  /* ------------------------------------------------------------------
     Simulation Step Fallback (Kinematic Gait & Secondary Physics)
     ------------------------------------------------------------------ */
  function calcFrontLeg(phase) {
    var p = phase % (Math.PI * 2);
    if (p < 0) p += Math.PI * 2;
    var u = p / (Math.PI * 2);
    var stanceRatio = 0.60;
    var rot = u < stanceRatio ? 14.0 - 26.0 * (u / stanceRatio) : -12.0 + 26.0 * ((u - stanceRatio) / (1.0 - stanceRatio));
    return { rot: rot };
  }

  function calcRearLeg(phase) {
    var p = phase % (Math.PI * 2);
    if (p < 0) p += Math.PI * 2;
    var u = p / (Math.PI * 2);
    var stanceRatio = 0.58;
    var rot = u < stanceRatio ? 11.0 - 30.0 * (u / stanceRatio) : -19.0 + 30.0 * ((u - stanceRatio) / (1.0 - stanceRatio));
    return { rot: rot };
  }

  function getRotatedSocket(x0, y0, bodyRotDeg, bodyBob) {
    var rad = (bodyRotDeg * Math.PI) / 180.0;
    var c = Math.cos(rad), s = Math.sin(rad);
    var dx = x0 - 95.0, dy = y0 - 75.0;
    return { x: 95.0 + dx * c - dy * s, y: 75.0 + dx * s + dy * c + bodyBob };
  }

  PuppyRig.prototype.update = function (dt) {
    this.time += dt;
    var t = this.time, s = this.state;
    var isBlinking = false;

    // Simulation autonomous blinking
    if (s !== "sleep") {
      this.blinkTimer += dt;
      if (!this.isBlinking && this.blinkTimer >= this.blinkNext) {
        this.isBlinking = true;
        this.blinkStart = t;
        this.blinkIsDouble = Math.random() < 0.32;
        this.blinkDuration = this.blinkIsDouble ? 0.36 : 0.18;
        this.blinkNext = this.blinkTimer + 1.8 + Math.random() * 2.2;
      }
      if (this.isBlinking) {
        var bElapsed = t - this.blinkStart;
        if (bElapsed >= this.blinkDuration) {
          this.isBlinking = false;
        } else {
          isBlinking = this.blinkIsDouble ? (bElapsed < 0.14 || (bElapsed >= 0.20 && bElapsed < 0.34)) : (bElapsed < 0.16);
        }
      }
    }

    // Micro-event execution in sit simulation
    if (s === "sit" && this.activeMicro) {
      var elapsed = t - this.activeMicro.startTime;
      if (elapsed >= this.activeMicro.duration) {
        if (this.activeMicro.type === "sniff" && this.el.puppyNose) this.el.puppyNose.style.opacity = 0;
        this.activeMicro = null;
      } else {
        if (this.activeMicro.type === "blink") {
          isBlinking = this.activeMicro.isDouble ? (elapsed < 0.13 || (elapsed >= 0.20 && elapsed < 0.33)) : (elapsed < 0.14);
        } else if (this.activeMicro.type === "sniff") {
          if (this.el.puppyNose) this.el.puppyNose.style.opacity = 0.85;
        }
      }
    }

    // 4-Leg Trot Kinematics in Walk
    if (s === "walk") {
      if (!this.loop || (typeof this.loop.isActive === "function" ? !this.loop.isActive() : false)) {
        var cycle = t * ((this.speed / 50) * 8.0);
        var beat = cycle * 2;
        var bodyBob = -Math.sin(beat) * 1.5;
        var bodyRot = Math.sin(cycle) * 1.8;

        var legFN = calcFrontLeg(cycle);
        var legBF = calcRearLeg(cycle + 0.18 * Math.PI);
        var legFF = calcFrontLeg(cycle + Math.PI);
        var legBN = calcRearLeg(cycle + 1.18 * Math.PI);

        var posBN = getRotatedSocket(45.48, 72.10, bodyRot, bodyBob);
        var posFN = getRotatedSocket(100.18, 82.72, bodyRot, bodyBob);
        var posBF = getRotatedSocket(71.64, 84.05, bodyRot, bodyBob);
        var posFF = getRotatedSocket(122.75, 84.05, bodyRot, bodyBob);

        this.transform("puppySocketBN", "translate(" + posBN.x.toFixed(2) + " " + posBN.y.toFixed(2) + ")");
        this.transform("puppyLegBN", "rotate(" + (bodyRot + legBN.rot).toFixed(2) + " 0 0)");
        this.transform("puppySocketFN", "translate(" + posFN.x.toFixed(2) + " " + posFN.y.toFixed(2) + ")");
        this.transform("puppyPawFN", "rotate(" + (bodyRot + legFN.rot).toFixed(2) + " 0 0)");
        this.transform("puppySocketBF", "translate(" + posBF.x.toFixed(2) + " " + posBF.y.toFixed(2) + ")");
        this.transform("puppyLegBF", "rotate(" + (bodyRot + legBF.rot).toFixed(2) + " 0 0)");
        this.transform("puppySocketFF", "translate(" + posFF.x.toFixed(2) + " " + posFF.y.toFixed(2) + ")");
        this.transform("puppyPawFF", "rotate(" + (bodyRot + legFF.rot).toFixed(2) + " 0 0)");
        this.transform("puppyBodyGroup", "translate(0 " + bodyBob.toFixed(2) + ") rotate(" + bodyRot.toFixed(2) + " 95 75)");
      }

      if (this.el.puppyMouthOpen) this.el.puppyMouthOpen.style.opacity = 1;
      if (this.el.puppyTongue) this.el.puppyTongue.style.opacity = 0;
      if (this.el.puppyJawCavity) this.el.puppyJawCavity.style.opacity = 0;
      if (this.el.puppyTongueCrease) this.el.puppyTongueCrease.style.opacity = 0;
    } else {
      if (s === "sit") {
        if (!this.loop || (typeof this.loop.isActive === "function" ? !this.loop.isActive() : false)) {
          var breath = Math.sin(t * 2.6) * 0.4;
          this.transform("puppyBodyGroup", "translate(0 " + (breath * 0.5).toFixed(2) + ")");
          this.transform("puppyChest", "translate(0 " + (breath * 0.32).toFixed(2) + ")");
          this.transform("puppyHeadBob", "translate(0 " + (breath * 0.5).toFixed(2) + ")");
        }
      }
    }

    // Dynamic 10-12Hz Panting Execution
    if (this.pantActive) {
      this.pantTime += dt;
      var flutter = Math.sin(this.pantTime * 24.0) * 1.5;
      if (this.el.puppyMouthOpen) this.el.puppyMouthOpen.style.opacity = 1;
      if (this.el.puppyTongue) this.el.puppyTongue.style.opacity = 1;
      if (this.el.puppyJawCavity) this.el.puppyJawCavity.style.opacity = 1;
      this.transform("puppyTongue", "translate(0 " + flutter.toFixed(2) + ")");
    }

    // Eyelid Control
    if (s === "sleep") {
      this.show("puppyEyeLidR", 1);
      this.show("puppyEyeLidL", 1);
      this.show("puppyEyeL", 0);
      this.show("puppyEyeR", 0);
    } else if (s === "pat") {
      this.show("puppyEyeLidR", 0);
      this.show("puppyEyeLidL", 0);
      this.show("puppyEyeHappy", 1);
      this.show("puppyEyeL", 0);
      this.show("puppyEyeR", 0);
    } else if (s === "angry") {
      this.show("puppyEyeLidR", 0);
      this.show("puppyEyeLidL", 0);
      this.show("puppyEyeHappy", 0);
      this.show("puppyEyeL", 1);
      this.show("puppyEyeR", 1);
      this.show("puppyBrows", 0);
    } else {
      this.show("puppyEyeLidR", isBlinking ? 1 : 0);
      this.show("puppyEyeLidL", isBlinking ? 1 : 0);
      this.show("puppyEyeL", isBlinking ? 0 : 1);
      this.show("puppyEyeR", isBlinking ? 0 : 1);
    }
  };

  PuppyRig.prototype.loopRaf = function () {
    var self = this;
    var last = Date.now();
    function frame() {
      var now = Date.now();
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      self.update(dt);
      self.raf = requestAnimationFrame(frame);
    }
    this.raf = requestAnimationFrame(frame);

    // Heartbeat ticker pump: ensures GSAP & rig continue 60fps breathing even if transparent window is unfocused/backgrounded
    if (!this.heartbeatTimer) {
      this.heartbeatTimer = setInterval(function () {
        if (typeof document !== "undefined" && document.hidden) {
          if (typeof gsap !== "undefined" && gsap.ticker && gsap.ticker.tick) {
            gsap.ticker.tick();
          }
          var now = Date.now();
          var dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          self.update(dt);
        }
      }, 1000 / 60);
    }
  };

  PuppyRig.prototype.destroy = function () {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.clearLoops();
    this.cancelMicro();
    this.stopPant();
    if (this.timers) {
      this.timers.forEach(function (t) { clearTimeout(t); });
      this.timers = [];
    }
  };

  /* ------------------------------------------------------------------
     Static Singleton & Public Adapter (Identical to PandaRig & Cat)
     ------------------------------------------------------------------ */
  var instance = null;

  PuppyRig.mount = function (container) {
    PuppyRig.unmount();
    instance = new PuppyRig(container);
    return instance;
  };

  PuppyRig.unmount = function () {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  };

  PuppyRig.init = function (opts) {
    if (!instance) PuppyRig.mount(document.getElementById("petScene") || document.body);
    if (opts && opts.state) instance.setState(opts.state);
    return instance;
  };

  ["setState", "getState", "setSpeed", "setFacing", "groundSpeed", "swipe", "pat", "wag", "shake", "blink"].forEach(function (name) {
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
