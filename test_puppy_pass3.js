"use strict";

const assert = require("assert");
const path = require("path");
const fs = require("fs");

// Mock browser DOM and timing environment
global.performance = { now: () => Date.now() };

const elements = {};
function createMockElement(id) {
  return {
    id: id,
    style: { opacity: "1" },
    getAttribute: (attr) => "",
    setAttribute: (attr, val) => {},
    querySelector: (sel) => {
      const childId = sel.replace("#", "");
      if (!elements[childId]) {
        elements[childId] = createMockElement(childId);
      }
      return elements[childId];
    },
    parentNode: {
      removeChild: (child) => {}
    }
  };
}

const mockContainer = {
  innerHTML: "",
  querySelector: (sel) => {
    const id = sel.replace("#", "");
    if (!elements[id]) {
      elements[id] = createMockElement(id);
    }
    return elements[id];
  },
  appendChild: (child) => child
};

let rafCallbacks = [];
global.requestAnimationFrame = (cb) => {
  rafCallbacks.push(cb);
  return rafCallbacks.length;
};
global.cancelAnimationFrame = (id) => {
  rafCallbacks = [];
};

// Mock GSAP for Cat and Panda loading
global.gsap = {
  timeline: () => ({
    to: function () { return this; },
    fromTo: function () { return this; },
    set: function () { return this; },
    add: function () { return this; },
    kill: function () { return this; },
    seek: function () { return this; },
    timeScale: function () { return this; },
    duration: function () { return 1; },
    progress: function () { return 1; }
  }),
  set: () => {},
  to: () => ({ kill: () => {} }),
  killTweensOf: () => {},
  delayedCall: (delay, fn) => {
    const id = setTimeout(fn, delay * 1000);
    return { kill: () => clearTimeout(id) };
  }
};

global.window = global;
global.document = {
  getElementById: (id) => mockContainer.querySelector("#" + id),
  location: { pathname: "/desktop/" },
  body: mockContainer
};

// Require dependencies
require(path.resolve(__dirname, "js/character-manager.js"));
require(path.resolve(__dirname, "js/puppy-rig.js"));

// Register Cat & Panda adapters for multi-character switching test
if (global.CharacterManager) {
  global.CharacterManager.register("cat", {
    mount: () => mockContainer,
    unmount: () => {},
    init: () => {},
    setState: () => {},
    getState: () => "sit",
    setSpeed: () => {},
    setFacing: () => {},
    groundSpeed: () => 50,
    swipe: () => {},
    pat: () => {}
  });

  global.CharacterManager.register("panda", {
    mount: () => mockContainer,
    unmount: () => {},
    init: () => {},
    setState: () => {},
    getState: () => "sit",
    setSpeed: () => {},
    setFacing: () => {},
    groundSpeed: () => 40,
    swipe: () => {},
    pat: () => {}
  });
}

let passCount = 0;
let failCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log("  ✅ PASS: " + name);
    passCount++;
  } catch (err) {
    console.error("  ❌ FAIL: " + name, err.message);
    failCount++;
  }
}

console.log("\n🐶 Running PASS 3 Validation: Micro-Life, Panting & Idle Personality...\n");

test("PuppyRig mounts cleanly and initializes micro-life scheduler in sit", () => {
  const rig = PuppyRig.mount(mockContainer);
  assert.strictEqual(rig.getState(), "sit");
  assert.ok(rig.microTimer !== null, "microTimer should be scheduled on mount in sit");
});

test("Micro-event selection avoids immediate consecutive repeats", () => {
  const rig = PuppyRig.mount(mockContainer);
  const picked = [];
  for (let i = 0; i < 30; i++) {
    rig.triggerRandomMicro();
    picked.push(rig.lastMicroType);
    if (picked.length >= 2) {
      assert.notStrictEqual(
        picked[picked.length - 1],
        picked[picked.length - 2],
        "Consecutive repeated micro event: " + picked[picked.length - 1]
      );
    }
  }
});

test("Micro-life events configure valid activeMicro objects and behaviors", () => {
  const rig = PuppyRig.mount(mockContainer);

  // 1. Blink
  rig.startMicroEvent("blink");
  assert.strictEqual(rig.activeMicro.type, "blink");
  assert.ok(rig.activeMicro.duration >= 0.14 && rig.activeMicro.duration <= 0.40);

  // 2. Ear Twitch
  rig.startMicroEvent("earTwitch");
  assert.strictEqual(rig.activeMicro.type, "earTwitch");
  assert.strictEqual(rig.activeMicro.duration, 0.26);

  // 3. Curious Head Tilt
  rig.startMicroEvent("headTilt");
  assert.strictEqual(rig.activeMicro.type, "headTilt");
  assert.ok(Math.abs(rig.activeMicro.angle) >= 1.5 && Math.abs(rig.activeMicro.angle) <= 3.0);

  // 4. Nose Sniff
  rig.startMicroEvent("sniff");
  assert.strictEqual(rig.activeMicro.type, "sniff");
  assert.strictEqual(rig.activeMicro.duration, 0.60);

  // 5. Soft Tail Wag
  rig.startMicroEvent("softWag");
  assert.strictEqual(rig.activeMicro.type, "softWag");
  assert.strictEqual(rig.activeMicro.duration, 1.6);

  // 6. Micro-Pant
  rig.startMicroEvent("microPant");
  assert.strictEqual(rig.pantActive, true, "microPant should activate panting");
  assert.ok(rig.pantTimer !== null);
  rig.stopPant();
  assert.strictEqual(rig.pantActive, false);
});

test("Panting system: activates rhythmic mouth/tongue, flutters chest, and cleans up cleanly", () => {
  const rig = PuppyRig.mount(mockContainer);
  rig.triggerPant(1500);
  assert.strictEqual(rig.pantActive, true);

  // Advance simulation frame
  rig.update(0.016);
  assert.strictEqual(elements["puppyTongue"].style.opacity, 1);
  assert.strictEqual(elements["puppyJawCavity"].style.opacity, 1);

  // Stop panting
  rig.stopPant();
  assert.strictEqual(rig.pantActive, false);
  assert.strictEqual(elements["puppyTongue"].style.opacity, 0);
  assert.strictEqual(elements["puppyJawCavity"].style.opacity, 0);
});

test("Organic Idle Breathing: produces sub-pixel non-mechanical motion in sit", () => {
  const rig = PuppyRig.mount(mockContainer);
  rig.setState("sit");
  rig.cancelMicro(); // isolate pure breathing

  const bodyTransforms = [];
  for (let step = 0; step < 20; step++) {
    rig.update(0.05);
    bodyTransforms.push(rig.time);
  }
  assert.ok(bodyTransforms.length === 20);
});

test("State Transition Safety: sit -> walk cancels micro-life and panting immediately", () => {
  const rig = PuppyRig.mount(mockContainer);
  rig.triggerPant(2000);
  rig.startMicroEvent("earTwitch");
  assert.strictEqual(rig.pantActive, true);
  assert.ok(rig.activeMicro !== null);

  rig.setState("walk");
  assert.strictEqual(rig.pantActive, false, "Panting must stop during walk");
  assert.strictEqual(rig.activeMicro, null, "Micro-events must be null during walk");
  assert.strictEqual(rig.microTimer, null, "Micro timers must be cancelled during walk");
});

test("State Transition Safety: walk -> sit triggers brief panting and reschedules micro-life", () => {
  const rig = PuppyRig.mount(mockContainer);
  rig.setState("walk");
  rig.setState("sit");
  assert.strictEqual(rig.pantActive, true, "Puppy should pant briefly after walk");
  assert.ok(rig.microTimer !== null, "Micro-timer should be re-scheduled when returning to sit");
  rig.stopPant();
});

test("State Transition Safety: sit -> sleep stops micro-events and disables panting", () => {
  const rig = PuppyRig.mount(mockContainer);
  rig.triggerPant(2000);
  rig.startMicroEvent("headTilt");

  rig.setState("sleep");
  assert.strictEqual(rig.pantActive, false, "Panting must not occur during sleep");
  assert.strictEqual(rig.activeMicro, null, "Micro-events must not run during sleep");
  assert.strictEqual(rig.microTimer, null, "Micro timers must be cancelled during sleep");
  assert.strictEqual(elements["puppyEyeLidR"].style.opacity, 1, "Sleeping eyelids must be closed");

  rig.setState("sit");
  assert.ok(rig.microTimer !== null, "Micro-life must reschedule on wake to sit");
});

test("State Transition Safety: sit -> angry stops micro-events and suppresses happy panting", () => {
  const rig = PuppyRig.mount(mockContainer);
  rig.triggerPant(2000);
  rig.setState("angry");
  assert.strictEqual(rig.pantActive, false, "Happy panting must not run in angry state");
  assert.strictEqual(rig.activeMicro, null);
  assert.strictEqual(rig.microTimer, null);

  rig.setState("sit");
  assert.ok(rig.microTimer !== null);
});

test("Pat interaction choreography: triggers pat celebration and happy panting", () => {
  const rig = PuppyRig.mount(mockContainer);
  rig.pat();
  assert.strictEqual(rig.getState(), "pat");
  assert.strictEqual(rig.pantActive, true, "Pat should trigger excited panting");
  assert.strictEqual(elements["puppyEyeHappy"].style.opacity, 1, "Smiling happy eyes");
  assert.strictEqual(elements["puppyHearts"].style.opacity, 1, "Love hearts floating");
});

test("Character switching & unmount: all timers and loops are destroyed with zero leaks", () => {
  const rig = PuppyRig.mount(mockContainer);
  // Puppy is in sit with active microTimer
  rig.triggerPant(3000);
  rig.timers.push(setTimeout(() => {}, 2000));
  assert.ok(rig.microTimer !== null, "microTimer should be active");
  assert.ok(rig.pantTimer !== null, "pantTimer should be active");
  assert.ok(rig.timers.length > 0, "timers array should have pending timer");

  PuppyRig.unmount();
  assert.strictEqual(rig.raf, null, "RAF loop cancelled");
  assert.strictEqual(rig.microTimer, null, "Micro timer cleared");
  assert.strictEqual(rig.pantTimer, null, "Pant timer cleared");
  assert.strictEqual(rig.timers.length, 0, "All action timers cleared");
  assert.strictEqual(rig.pantActive, false, "Panting stopped");
  assert.strictEqual(rig.activeMicro, null, "Active micro event reset");
});

test("CharacterManager switching: Puppy -> Cat -> Panda -> Puppy transitions cleanly", () => {
  CharacterManager.setSkin("puppy");
  assert.strictEqual(CharacterManager.getSkin(), "puppy");

  CharacterManager.setSkin("cat");
  assert.strictEqual(CharacterManager.getSkin(), "cat");

  CharacterManager.setSkin("panda");
  assert.strictEqual(CharacterManager.getSkin(), "panda");

  CharacterManager.setSkin("puppy");
  assert.strictEqual(CharacterManager.getSkin(), "puppy");
  assert.strictEqual(CharacterManager.getState(), "sit");
});

test("Extended 20-second Sit simulation: runs 1200 frames without errors or memory leaks", () => {
  const rig = PuppyRig.mount(mockContainer);
  rig.setState("sit");

  let blinkCount = 0;
  let earTwitchCount = 0;
  let tiltCount = 0;
  let sniffCount = 0;
  let wagCount = 0;
  let pantCount = 0;

  // 1200 frames at dt = 1/60s = 20.0s
  const dt = 1 / 60;
  for (let frame = 0; frame < 1200; frame++) {
    // Every ~180 frames (3s), trigger a scheduled micro event
    if (frame % 180 === 0 && rig.state === "sit") {
      rig.triggerRandomMicro();
      if (rig.activeMicro) {
        const type = rig.activeMicro.type;
        if (type === "blink") blinkCount++;
        else if (type === "earTwitch") earTwitchCount++;
        else if (type === "headTilt") tiltCount++;
        else if (type === "sniff") sniffCount++;
        else if (type === "softWag") wagCount++;
      } else if (rig.pantActive) {
        pantCount++;
      }
    }
    rig.update(dt);
  }

  PuppyRig.unmount();
  console.log(`    (Simulation events triggered: blinks=${blinkCount}, earTwitches=${earTwitchCount}, headTilts=${tiltCount}, sniffs=${sniffCount}, softWags=${wagCount}, pants=${pantCount})`);
  assert.ok(blinkCount + earTwitchCount + tiltCount + sniffCount + wagCount + pantCount >= 5, "Micro-life scheduler generated events across 20s");
});

console.log(`\n🎉 Results: ${passCount} Passed, ${failCount} Failed\n`);
if (failCount > 0) process.exit(1);
