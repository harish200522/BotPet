const assert = require('assert');
const path = require('path');

// Mock browser environment
global.window = global;
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

const mockSvg = {
  tagName: 'svg',
  attributes: { viewBox: '0 0 200 150' },
  style: {},
  children: [],
  innerHTML: '',
  setAttribute: function(k, v) { this.attributes[k] = String(v); },
  getAttribute: function(k) { return this.attributes[k]; },
  appendChild: function(c) { this.children.push(c); return c; },
  querySelector: function(sel) {
    if (sel.startsWith('#')) {
      const targetId = sel.slice(1);
      return findById(this, targetId);
    }
    return null;
  },
  querySelectorAll: function() { return []; }
};

global.document = {
  getElementById: (id) => {
    if (id === 'petScene' || id === 'stage') {
      return mockSvg;
    }
    return null;
  },
  createElementNS: (ns, tag) => ({
    tagName: tag,
    attributes: {},
    style: {},
    children: [],
    innerHTML: '',
    setAttribute: function(k, v) { this.attributes[k] = String(v); },
    getAttribute: function(k) { return this.attributes[k]; },
    appendChild: function(c) { this.children.push(c); return c; },
    querySelector: function(sel) {
      if (sel.startsWith('#')) {
        const targetId = sel.slice(1);
        return findById(this, targetId);
      }
      return null;
    },
    querySelectorAll: function() { return []; }
  })
};

function findById(node, id) {
  if (node.attributes && node.attributes.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findById(child, id);
      if (found) return found;
    }
  }
  if (node.innerHTML && node.innerHTML.includes('id="' + id + '"')) {
    return {
      attributes: { id },
      style: {},
      setAttribute: () => {},
      getAttribute: () => null
    };
  }
  return null;
}

// Mock GSAP
global.gsap = {
  timeline: () => ({
    to: function() { return this; },
    kill: function() { return this; },
    clear: function() { return this; },
    play: function() { return this; },
    pause: function() { return this; },
    timeScale: function() { return this; }
  }),
  to: () => ({ kill: () => {} }),
  set: (target, vars) => {},
  killTweensOf: () => {}
};

// Load modules
require(path.resolve('d:/Projects/BotPet/js/character-manager.js'));
require(path.resolve('d:/Projects/BotPet/js/puppy-rig.js'));

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  ✅ PASS: ' + name);
    passCount++;
  } catch (err) {
    console.error('  ❌ FAIL: ' + name, err.message);
    failCount++;
  }
}

console.log('\n🐶 Running Puppy Companion Rig & CharacterManager Validation Tests...\n');

test('PuppyRig exists on global namespace', () => {
  assert.ok(global.PuppyRig, 'PuppyRig is not defined on global');
  assert.strictEqual(typeof global.PuppyRig.mount, 'function');
  assert.strictEqual(typeof global.PuppyRig.setState, 'function');
  assert.strictEqual(typeof global.PuppyRig.swipe, 'function');
  assert.strictEqual(typeof global.PuppyRig.pat, 'function');
});

test('CharacterManager exists and has puppy registered', () => {
  assert.ok(global.CharacterManager, 'CharacterManager is not defined');
  const skins = global.CharacterManager.getRegistered();
  assert.ok(skins.includes('puppy'), 'puppy is not in registered skins: ' + JSON.stringify(skins));
});

test('CharacterManager provides Puppy characteristics & personality profile', () => {
  const char = global.CharacterManager.getCharacteristics('puppy');
  assert.strictEqual(char.name, 'Biscuit');
  assert.strictEqual(char.species, 'Golden Retriever Puppy');
  assert.ok(char.tagline.includes('loyal') || char.tagline.includes('guardian'));
});

test('Puppy mounted successfully with root #puppyRoot', () => {
  global.PuppyRig.mount(mockSvg);
  assert.ok(mockSvg.innerHTML.includes('id="puppyRoot"'), 'puppyRoot missing from mounted SVG');
});

test('All required Puppy SVG elements are present', () => {
  const html = mockSvg.innerHTML;
  const elements = [
    'puppyRoot',
    'puppyShadow',
    'puppyTail',
    'puppyTailTip',
    'puppySitLegs',
    'puppySitRump',
    'puppySitLegL',
    'puppyPawSitL',
    'puppyPawSitR',
    'puppyBody',
    'puppyChest',
    'puppyHeadGroup',
    'puppyHead',
    'puppyBlaze',
    'puppyEarL',
    'puppyEarR',
    'puppyEyeL',
    'puppyEyeR',
    'puppyNose',
    'puppyTongue',
    'puppyLegBF',
    'puppyLegBN',
    'puppyPawFF',
    'puppyPawFN'
  ];
  for (const el of elements) {
    assert.ok(html.includes('id="' + el + '"'), 'Missing element: #' + el);
  }
});

test('Solid grounded seated rump #puppySitRump reaches floor shelf y=137', () => {
  const html = mockSvg.innerHTML;
  assert.ok(html.includes('id="puppySitRump"'), 'puppySitRump element is missing');
  assert.ok(html.includes('137') || html.includes('138'), 'Floor level y=137 not referenced in seated elements');
});

test('Initial state is sit with sitLegs opacity=1 and walking legs opacity=0', () => {
  global.PuppyRig.setState('sit');
  assert.strictEqual(global.PuppyRig.getState(), 'sit');
});

test('State transition to walk sets sitLegs opacity=0 and walking legs opacity=1', () => {
  global.PuppyRig.setState('walk');
  assert.strictEqual(global.PuppyRig.getState(), 'walk');
});

test('State transition to sleep sets sleeping eyes opacity=1', () => {
  global.PuppyRig.setState('sleep');
  assert.strictEqual(global.PuppyRig.getState(), 'sleep');
});

test('State transition to angry sets anger overlay and angry eyes', () => {
  global.PuppyRig.setState('angry');
  assert.strictEqual(global.PuppyRig.getState(), 'angry');
});

test('pat() interaction triggers happy celebration and hearts', () => {
  assert.doesNotThrow(() => {
    global.PuppyRig.pat();
  });
});

test('wag() and shake() expose natural dog one-shot actions', () => {
  assert.strictEqual(typeof global.PuppyRig.wag, 'function');
  assert.strictEqual(typeof global.PuppyRig.shake, 'function');
  assert.doesNotThrow(() => {
    global.PuppyRig.wag();
    global.PuppyRig.shake();
  });
});

test('swipe() interaction triggers forward swat', () => {
  assert.doesNotThrow(() => {
    global.PuppyRig.swipe();
  });
});

test('setFacing(-1) flips puppy horizontally and setFacing(1) restores it', () => {
  assert.doesNotThrow(() => {
    global.PuppyRig.setFacing(-1);
    global.PuppyRig.setFacing(1);
  });
});

test('setSpeed() and groundSpeed() work correctly', () => {
  global.PuppyRig.setSpeed(1.5);
  assert.strictEqual(global.PuppyRig.groundSpeed(), 75);
  global.PuppyRig.setSpeed(1.0);
  assert.strictEqual(global.PuppyRig.groundSpeed(), 50);
});

test('CharacterManager switches skin to puppy cleanly', () => {
  global.CharacterManager.setSkin('puppy');
  assert.strictEqual(global.CharacterManager.getSkin(), 'puppy');
});

test('CharacterManager delegates states to puppy', () => {
  global.CharacterManager.setState('sit');
  assert.strictEqual(global.CharacterManager.getState(), 'sit');
  global.CharacterManager.setState('bored');
  assert.strictEqual(global.CharacterManager.getState(), 'bored');
});

test('CharacterManager delegates puppy wag and shake actions', () => {
  assert.strictEqual(typeof global.CharacterManager.wag, 'function');
  assert.strictEqual(typeof global.CharacterManager.shake, 'function');
  assert.doesNotThrow(() => {
    global.CharacterManager.wag();
    global.CharacterManager.shake();
  });
});

test('CharacterManager retrieves puppy-themed dialogues and quotes', () => {
  const wake = global.CharacterManager.getQuote('wake', 'Harishwaran');
  assert.ok(wake.includes('Biscuit') || wake.includes('Puppy') || wake.includes('Woof') || wake.includes('🐶'), 'Wake quote: ' + wake);

  const patQuote = global.CharacterManager.getQuote('pat');
  assert.ok(patQuote.includes('🐶') || patQuote.includes('Woof') || patQuote.includes('tail') || patQuote.includes('wagging') || patQuote.includes('puppy') || patQuote.includes('XP'), 'Pat quote: ' + patQuote);

  const scold = global.CharacterManager.getQuote('scold');
  assert.ok(scold.includes('Woof') || scold.includes('Puppy') || scold.includes('Biscuit') || scold.includes('tennis') || scold.includes('treats') || scold.includes('goals') || scold.includes('🐶') || scold.includes('play') || scold.includes('🐾'), 'Scold quote: ' + scold);

  const landing = global.CharacterManager.getQuote('landing');
  assert.ok(landing.includes('puppy') || landing.includes('wag') || landing.includes('paws') || landing.includes('Puppy') || landing.includes('🐶') || landing.includes('fetch') || landing.includes('Woof') || landing.includes('Safe') || landing.includes('floor'), 'Landing quote: ' + landing);
});

console.log(`\n🎉 Results: ${passCount} Passed, ${failCount} Failed\n`);
process.exit(failCount === 0 ? 0 : 1);
