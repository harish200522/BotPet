/**
 * Automated test suite for Panda companion rig & characteristics
 */
const assert = require('assert');
const fs = require('fs');

// Full DOM Mock for GSAP and SVG DOM APIs
class MockSVGElement {
  constructor(tag, id = '') {
    this.tagName = tag;
    this.id = id;
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.attributes = {};
    this._transforms = [];
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }
  querySelector(sel) {
    if (sel.startsWith('#')) {
      const id = sel.slice(1);
      return this.findChild(id);
    }
    return null;
  }
  querySelectorAll(sel) {
    const results = [];
    this.collectAll(sel, results);
    return results;
  }
  findChild(id) {
    if (this.id === id) return this;
    for (const c of this.children) {
      const found = c.findChild ? c.findChild(id) : null;
      if (found) return found;
    }
    return null;
  }
  collectAll(sel, results) {
    if (sel.startsWith('#') && this.id === sel.slice(1)) results.push(this);
    for (const c of this.children) {
      if (c.collectAll) c.collectAll(sel, results);
    }
  }
}

class MockDocument {
  constructor() {
    this.body = new MockSVGElement('body');
    this.elementsById = {};
  }
  createElementNS(ns, tag) {
    return new MockSVGElement(tag);
  }
  getElementById(id) {
    return this.body.findChild(id) || this.elementsById[id] || null;
  }
  querySelector(sel) {
    return this.body.querySelector(sel);
  }
}

// GSAP Mock
const gsap = {
  timeline: (opts) => ({
    to: function() { return this; },
    fromTo: function() { return this; },
    set: function() { return this; },
    add: function() { return this; },
    kill: function() { return this; },
    seek: function() { return this; },
    timeScale: function() { return this; },
    duration: function() { return 1; },
    progress: function() { return 1; }
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
global.document = new MockDocument();
global.gsap = gsap;

// Container
const container = new MockSVGElement('div', 'petScene');
global.document.body.appendChild(container);
global.document.elementsById['petScene'] = container;

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
  try {
    fn();
    console.log('  ✅ PASS: ' + desc);
    passCount++;
  } catch (err) {
    console.error('  ❌ FAIL: ' + desc, err.message);
    failCount++;
  }
}

console.log('\n🐼 Running Panda Characteristics & Rig Validation Tests...\n');

// Load CharacterManager & PandaRig
const cmCode = fs.readFileSync('d:/Projects/BotPet/js/character-manager.js', 'utf8');
eval(cmCode);

const pandaCode = fs.readFileSync('d:/Projects/BotPet/js/panda-rig.js', 'utf8');
eval(pandaCode);

it('PandaRig exists on global namespace as object', () => {
  assert.strictEqual(typeof global.PandaRig, 'object');
  assert.strictEqual(typeof global.PandaRig.mount, 'function');
  assert.strictEqual(typeof global.PandaRig.init, 'function');
});

it('CharacterManager exists', () => {
  assert.strictEqual(typeof global.CharacterManager, 'object');
});

it('CharacterManager has Panda characteristics profile', () => {
  const char = global.CharacterManager.getCharacteristics('panda');
  assert.ok(char, 'Panda characteristics profile exists');
  assert.strictEqual(char.species, 'Giant Panda Guardian');
  assert.strictEqual(char.name, 'Bao Bao');
  assert.ok(char.voice.includes('🎋'));
});

it('CharacterManager skin switching to panda works', () => {
  global.CharacterManager.setSkin('panda');
  assert.strictEqual(global.CharacterManager.getSkin(), 'panda');
});

it('Panda dynamic quotes return panda-themed pop-up messages', () => {
  const wakeMsg = global.CharacterManager.getQuote('wake', 'Harishwaran');
  assert.ok(wakeMsg.includes('Panda Guardian') || wakeMsg.includes('Ni Hao'), 'Wake message is panda themed: ' + wakeMsg);

  const patMsg = global.CharacterManager.getQuote('pat');
  assert.ok(patMsg.includes('🐼') || patMsg.includes('🎋') || patMsg.includes('bamboo') || patMsg.includes('Bao Bao'), 'Pat message is panda themed: ' + patMsg);

  const scoldMsg = global.CharacterManager.getQuote('scold');
  assert.ok(scoldMsg.includes('Panda') || scoldMsg.includes('bamboo') || scoldMsg.includes('Bao Bao') || scoldMsg.includes('🎋'), 'Scold message is panda themed: ' + scoldMsg);

  const sitMsg = global.CharacterManager.getQuote('state', 'sit');
  assert.ok(sitMsg.includes('🐼') || sitMsg.includes('🎋'), 'Sit message is panda themed: ' + sitMsg);

  const walkMsg = global.CharacterManager.getQuote('state', 'walk');
  assert.ok(walkMsg.includes('Panda') || walkMsg.includes('waddling'), 'Walk message is panda themed: ' + walkMsg);

  const sleepMsg = global.CharacterManager.getQuote('state', 'sleep');
  assert.ok(sleepMsg.includes('bamboo') || sleepMsg.includes('🐼'), 'Sleep message is panda themed: ' + sleepMsg);

  const focusMsg = global.CharacterManager.getQuote('focus', 25);
  assert.ok(focusMsg.includes('Panda') || focusMsg.includes('🎋'), 'Focus message is panda themed: ' + focusMsg);

  const breakMsg = global.CharacterManager.getQuote('break', 5);
  assert.ok(breakMsg.includes('Bamboo') || breakMsg.includes('🎋'), 'Break message is panda themed: ' + breakMsg);
});

it('CharacterManager switches back to cat and gives cat-themed quotes', () => {
  global.CharacterManager.setSkin('cat');
  assert.strictEqual(global.CharacterManager.getSkin(), 'cat');
  const patCat = global.CharacterManager.getQuote('pat');
  assert.ok(patCat.includes('Purr') || patCat.includes('whiskers') || patCat.includes('Aww') || patCat.includes('+5 XP'), 'Cat pat quote: ' + patCat);
});

console.log(`\n🎉 Results: ${passCount} Passed, ${failCount} Failed\n`);
process.exit(failCount === 0 ? 0 : 1);
