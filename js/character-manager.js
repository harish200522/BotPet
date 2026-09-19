/* ------------------------------------------------------------------
   character-manager.js — Unified Character Management & Delegation
   ------------------------------------------------------------------
   Provides a common external interface for desktop companion rigs.
   Delegates lifecycle, state transitions, physics, and interaction
   calls to the currently active character rig (Cat, Panda, Puppy).
   Provides rich companion characteristics, personality profiles,
   and dynamic species-specific quotes / dialogues.
------------------------------------------------------------------ */
(function (global) {
  "use strict";

  // Character registry: skinName -> adapter definition
  var registry = {};
  var activeKey = "cat";
  var activeRigNode = null;
  var currentParent = null;
  var currentMountOpts = null;
  var lastInitOpts = { state: "sit", roam: false };

  var CHARACTERISTICS = {
    cat: {
      name: "Classic Cat",
      species: "Feline Guardian",
      tagline: "Agile, observant, and quick on the paw.",
      voice: "Meow! 🐾",
      soundEffects: {
        pat: "Purr... ❤️",
        alert: "Hisss! 💢",
        sleep: "Zzz... 😴",
        snack: "Crunch crunch! 🐟"
      },
      landingQuotes: [
        "Perfect touchdown! 🐾",
        "Flawless landing! ✨",
        "Balanced and steady! 🌟",
        "Always landing upright! 🐾",
        "Graceful drop completed! 💖"
      ],
      scolds: [
        "Back to work!",
        "Distraction detected!",
        "Time to refocus!",
        "Closing this distraction.",
        "Stay on track!"
      ],
      patQuotes: [
        "Purr... ❤️ (+5 XP)",
        "Purr... love it! (+5 XP)",
        "Aww, thanks! ❤️ (+5 XP)",
        "Happy whiskers! ✨ (+5 XP)",
        "Purring happily! 🐾 (+5 XP)"
      ],
      stateQuotes: {
        sit: "Resting in place! 👀",
        walk: "Strolling along screen! 🚶",
        sleep: "Zzz... 😴",
        angry: "Focus! Stay on task! 💢",
        bored: "Waiting for instructions... 🥱",
        pat: "Purr... love it! (+5 XP)",
        swipe: "Distraction detected! 🐾 Swipe!"
      },
      wakeQuote: function (name) {
        return "Greetings, " + (name || "Friend") + "! BotPet is active and on watch! 🐾";
      },
      nameQuote: function (name) {
        return "Nice to meet you, " + (name || "Friend") + "! 🐾";
      },
      focusQuote: function (mins) {
        return "Focus session: " + mins + "m! Stay locked in 🎯";
      },
      breakQuote: function (mins) {
        return "Break time (" + mins + "m)! Rest up ☕";
      },
      snoozeQuote: function () {
        return "Paused for 5 minutes. ☕";
      }
    },
    panda: {
      name: "Bao Bao",
      species: "Giant Panda Guardian",
      tagline: "Peaceful, grounded, bamboo-powered focus master.",
      voice: "Munch munch! 🎋",
      soundEffects: {
        pat: "Happy panda rolls! 🐼✨",
        alert: "Panda Growl! 🐼💢",
        sleep: "Bamboo dreamland... 🐼💤",
        snack: "Chomp chomp bamboo! 🎋"
      },
      landingQuotes: [
        "Thump! Soft panda bounce landing! 🐼🎋",
        "Bamboo roll complete! 🌟",
        "Chubby, grounded, and upright! 🐼✨",
        "Landed safely like a fluffy panda cloud! 💖",
        "Big panda hugs from the desktop floor! 🎋🐾"
      ],
      scolds: [
        "No snacking on distractions! 🎋",
        "Panda Guardian detected a distraction! 🐼💢",
        "Drop the scroll, grab the bamboo focus! 🎋🎯",
        "Heavy Panda Focus Strike incoming! 🐼💥",
        "Stay locked into your zen workflow! 🎋✨",
        "Bao Bao says: Back to your goals! 🐼🛑"
      ],
      patQuotes: [
        "Munch munch... love the bamboo pats! 🎋❤️ (+5 XP)",
        "Chubby cuddles! Bao Bao is happy! 🐼💖 (+5 XP)",
        "Happy panda rolls! 🐼✨ (+5 XP)",
        "Panda hug for you! 🎋💖 (+5 XP)",
        "Purr-fectly round and cozy! 🐼❤️ (+5 XP)"
      ],
      stateQuotes: {
        sit: "Sitting chubby, peaceful, and guarding screen! 🐼🎋",
        walk: "Panda waddling with determination! 🐼🐾",
        sleep: "Bamboo dreamland... Zzz... 🐼💤",
        angry: "Panda alert! Distraction intercepted! 🐼💢",
        bored: "Nibbling bamboo patiently... 🎋🥱",
        pat: "Happy panda wiggles! 🐼🎋💖",
        swipe: "Heavy Panda Paw Swat! 🐼🐾💥"
      },
      wakeQuote: function (name) {
        return "Ni Hao, " + (name || "Friend") + "! Panda Guardian is awake and guarding your screen! 🐼🎋";
      },
      nameQuote: function (name) {
        return "Nice to meet you, " + (name || "Friend") + "! Let's conquer focus together! 🐼🎋";
      },
      focusQuote: function (mins) {
        return "Panda Zen Focus session: " + mins + "m! Channel that panda calm 🎋🎯";
      },
      breakQuote: function (mins) {
        return "Bamboo break time (" + mins + "m)! Stretch & recharge 🎋☕";
      },
      snoozeQuote: function () {
        return "Panda nap paused for 5 minutes. 🎋☕";
      }
    },
    puppy: {
      name: "Biscuit",
      species: "Golden Retriever Puppy",
      tagline: "Energetic, loyal, treat-motivated focus guardian.",
      voice: "Woof woof! 🐶🐾",
      soundEffects: {
        pat: "Happy puppy panting! 🐶✨",
        alert: "Watchdog bark! 🐶💢",
        sleep: "Dreaming of tennis balls... 🐶💤",
        snack: "Munching puppy treats! 🦴"
      },
      landingQuotes: [
        "Four paws down with a happy wag! 🐶✨",
        "Puppy bounce landing completed! 🌟",
        "Safe and sound on the desktop floor! 🐾💖",
        "Ready to fetch your focus goals! 🎾🐶",
        "Landed like a fluffy golden puppy! 💖"
      ],
      scolds: [
        "Woof! Distraction spotted! Drop the tab, grab a tennis ball! 🎾",
        "Puppy Guardian alert! Stay focused for treats! 🐶🦴",
        "No scrolling allowed during work time! Woof! 🛑",
        "Biscuit says: Time to lock in and fetch those goals! 🐶⚡",
        "Focus up! Let's get this work done so we can play! 🐾✨"
      ],
      patQuotes: [
        "Woof woof! Tail wagging at maximum speed! 🐶💖 (+5 XP)",
        "Happy puppy panting! Love the head scratches! ✨ (+5 XP)",
        "Best human ever! *Happy puppy wiggles* 🐾❤️ (+5 XP)",
        "Puppy kisses for you! 🐶💖 (+5 XP)",
        "Paws up! You're doing amazing! 🐾✨ (+5 XP)"
      ],
      stateQuotes: {
        sit: "Sitting politely and guarding your screen! 🐶🦴",
        walk: "Trotting happily along the desktop! 🐾",
        sleep: "Dreaming of chasing tennis balls... Zzz... 🐶💤",
        angry: "Grrr... Distraction detected! Back to work! 🐶💢",
        bored: "Resting chin on paws patiently... 🐶🥱",
        pat: "Happy puppy tail wagging! 🐶💖",
        swipe: "Playful Puppy Paw Swat! 🐾💥"
      },
      wakeQuote: function (name) {
        return "Woof, " + (name || "Friend") + "! Biscuit the Puppy Guardian is awake and ready to guard! 🐶🐾";
      },
      nameQuote: function (name) {
        return "Nice to meet you, " + (name || "Friend") + "! *Wags tail happily* 🐶🎾";
      },
      focusQuote: function (mins) {
        return "Puppy Focus Session: " + mins + "m! Locked in like a good boy! 🐶🎯";
      },
      breakQuote: function (mins) {
        return "Treat & Play Break (" + mins + "m)! Stretch your paws! 🦴☕";
      },
      snoozeQuote: function () {
        return "Puppy snooze paused for 5 minutes. 🐶💤";
      }
    }
  };

  /**
   * Registers the default Cat character if CatRig and Cat are present in scope.
   */
  function registerCatAdapter() {
    if (global.CatRig && global.Cat) {
      registry["cat"] = {
        mount: function (parent, opts) {
          return global.CatRig.mount(parent, opts);
        },
        unmount: function () {
          var catRoot = document.getElementById("catRoot");
          if (catRoot) {
            if (typeof gsap !== "undefined") {
              gsap.killTweensOf("#catRoot");
              gsap.killTweensOf("#catRoot *");
            }
            if (catRoot.parentNode) {
              catRoot.parentNode.removeChild(catRoot);
            }
          }
        },
        init: function (opts) {
          return global.Cat.init(opts);
        },
        setState: function (name, dur, ease) {
          return global.Cat.setState(name, dur, ease);
        },
        getState: function () {
          return global.Cat.getState();
        },
        setSpeed: function (multiplier) {
          return global.Cat.setSpeed(multiplier);
        },
        setFacing: function (direction) {
          return global.Cat.setFacing(direction);
        },
        groundSpeed: function () {
          return global.Cat.groundSpeed();
        },
        swipe: function (onImpact) {
          return global.Cat.swipe(onImpact);
        },
        pat: function () {
          if (typeof global.Cat.pat === "function") {
            return global.Cat.pat();
          }
          return global.Cat.setState("pat");
        }
      };
    }
  }

  /**
   * Registers the Panda companion if PandaRig is present in scope.
   */
  function registerPandaAdapter() {
    if (global.PandaRig) {
      registry["panda"] = {
        mount: function (parent, opts) {
          return global.PandaRig.mount(parent, opts);
        },
        unmount: function () {
          return global.PandaRig.unmount();
        },
        init: function (opts) {
          return global.PandaRig.init(opts);
        },
        setState: function (name, dur, ease) {
          return global.PandaRig.setState(name);
        },
        getState: function () {
          return global.PandaRig.getState();
        },
        setSpeed: function (multiplier) {
          return global.PandaRig.setSpeed(multiplier);
        },
        setFacing: function (direction) {
          return global.PandaRig.setFacing(direction);
        },
        groundSpeed: function () {
          return global.PandaRig.groundSpeed();
        },
        swipe: function (onImpact) {
          return global.PandaRig.swipe(onImpact);
        },
        pat: function () {
          return global.PandaRig.pat();
        }
      };
    }
  }

  /**
   * Registers the Puppy companion if PuppyRig is present in scope.
   */
  function registerPuppyAdapter() {
    if (global.PuppyRig) {
      registry["puppy"] = {
        mount: function (parent, opts) {
          return global.PuppyRig.mount(parent, opts);
        },
        unmount: function () {
          return global.PuppyRig.unmount();
        },
        init: function (opts) {
          return global.PuppyRig.init(opts);
        },
        setState: function (name, dur, ease) {
          return global.PuppyRig.setState(name);
        },
        getState: function () {
          return global.PuppyRig.getState();
        },
        setSpeed: function (multiplier) {
          return global.PuppyRig.setSpeed(multiplier);
        },
        setFacing: function (direction) {
          return global.PuppyRig.setFacing(direction);
        },
        groundSpeed: function () {
          return global.PuppyRig.groundSpeed();
        },
        swipe: function (onImpact) {
          return global.PuppyRig.swipe(onImpact);
        },
        pat: function () {
          return global.PuppyRig.pat();
        },
        wag: function () {
          return global.PuppyRig.wag();
        },
        shake: function () {
          return global.PuppyRig.shake();
        }
      };
    }
  }

  function registerKnownAdapters() {
    registerCatAdapter();
    registerPandaAdapter();
    registerPuppyAdapter();
  }

  var CharacterManager = {
    /**
     * Register a character adapter under a unique skin key.
     * @param {string} name - e.g. "cat", "panda", "puppy"
     * @param {object} adapter - Implementation of character interface
     */
    register: function (name, adapter) {
      if (!name || typeof adapter !== "object") { return; }
      registry[name] = adapter;
    },

    /**
     * Get list of all registered character keys.
     * @returns {string[]}
     */
    getRegistered: function () {
      registerKnownAdapters();
      return Object.keys(registry);
    },

    /**
     * Get the active character adapter (falls back to "cat").
     */
    getActive: function () {
      registerKnownAdapters();
      return registry[activeKey] || registry["cat"] || null;
    },

    /**
     * Mount the active character's SVG rig into the given parent container.
     * @param {SVGElement|HTMLElement} parent - Container node (e.g. #petScene)
     * @param {object} [opts] - Mounting options (e.g. { offsetX, offsetY, before })
     * @returns {SVGElement|null}
     */
    mount: function (parent, opts) {
      currentParent = parent || currentParent;
      currentMountOpts = opts || currentMountOpts;

      var active = this.getActive();
      if (!active) {
        registerKnownAdapters();
        active = this.getActive();
      }

      if (active && typeof active.mount === "function") {
        this.unmount();
        activeRigNode = active.mount(currentParent, currentMountOpts);
        return activeRigNode;
      }
      return null;
    },

    /**
     * Safely unmount the current character rig and clean up elements.
     */
    unmount: function () {
      var active = this.getActive();
      if (active && typeof active.unmount === "function") {
        active.unmount();
      } else if (activeRigNode && activeRigNode.parentNode) {
        activeRigNode.parentNode.removeChild(activeRigNode);
      }
      activeRigNode = null;
    },

    /**
     * Initialize the active character controller.
     * @param {object} [options] - e.g. { state: "sit", roam: false }
     */
    init: function (options) {
      if (options) {
        lastInitOpts = options;
      }
      var active = this.getActive();
      if (!active) {
        registerKnownAdapters();
        active = this.getActive();
      }
      if (active && typeof active.init === "function") {
        return active.init(lastInitOpts);
      }
    },

    /**
     * Switch active skin. Unmounts current rig, mounts new rig, and re-inits.
     * Safely falls back to "cat" if an invalid or unregistered name is given.
     * @param {string} name - Character key (e.g. "cat", "panda", "puppy")
     */
    setSkin: function (name) {
      registerKnownAdapters();
      var target = (name && registry[name]) ? name : "cat";
      if (target === activeKey && activeRigNode) {
        return;
      }

      // 1. Safely unmount current rig
      this.unmount();

      // 2. Clear scene container
      if (currentParent) {
        currentParent.innerHTML = "";
      }

      // 3. Switch active skin key
      activeKey = target;

      // 4. Mount new rig into scene container
      if (currentParent) {
        this.mount(currentParent, currentMountOpts);
      }

      // 5. Re-initialize with preserved options
      this.init(lastInitOpts);
    },

    /**
     * Get the active skin key.
     * @returns {string}
     */
    getSkin: function () {
      return activeKey;
    },

    /**
     * Get full personality and characteristics profile for a skin.
     * @param {string} [skinName] - Defaults to active skin
     * @returns {object}
     */
    getCharacteristics: function (skinName) {
      var key = skinName || activeKey;
      return CHARACTERISTICS[key] || CHARACTERISTICS["cat"];
    },

    /**
     * Get a contextual quote or dialogue line for the active companion.
     * @param {string} type - 'landing', 'scold', 'pat', 'state', 'wake', 'name', 'focus', 'break', 'snooze', 'say'
     * @param {any} [arg1] - Optional context argument (e.g. state name, user name, minutes)
     * @returns {string}
     */
    getQuote: function (type, arg1) {
      var profile = this.getCharacteristics(activeKey);
      var pickRandom = function (arr) {
        return arr[Math.floor(Math.random() * arr.length)];
      };

      if (type === "landing") {
        return pickRandom(profile.landingQuotes);
      } else if (type === "scold") {
        return pickRandom(profile.scolds);
      } else if (type === "pat") {
        return pickRandom(profile.patQuotes);
      } else if (type === "state") {
        var stateName = arg1 || this.getState();
        return profile.stateQuotes[stateName] || (profile.voice);
      } else if (type === "wake") {
        return profile.wakeQuote(arg1);
      } else if (type === "name") {
        return profile.nameQuote(arg1);
      } else if (type === "focus") {
        return profile.focusQuote(arg1 || 25);
      } else if (type === "break") {
        return profile.breakQuote(arg1 || 5);
      } else if (type === "snooze") {
        return profile.snoozeQuote();
      } else if (type === "say") {
        return arg1 || profile.voice;
      }
      return profile.voice;
    },

    /**
     * Set animation state (e.g. 'sit', 'walk', 'sleep', 'pat', 'angry', 'bored', 'confront').
     */
    setState: function (stateName, duration, ease) {
      var active = this.getActive();
      if (active && typeof active.setState === "function") {
        return active.setState(stateName, duration, ease);
      }
    },

    /**
     * Get the current animation state name.
     * @returns {string}
     */
    getState: function () {
      var active = this.getActive();
      if (active && typeof active.getState === "function") {
        return active.getState();
      }
      return "sit";
    },

    /**
     * Set animation playback speed multiplier.
     * @param {number} multiplier
     */
    setSpeed: function (multiplier) {
      var active = this.getActive();
      if (active && typeof active.setSpeed === "function") {
        return active.setSpeed(multiplier);
      }
    },

    /**
     * Set horizontal facing direction (1 = facing right, -1 = facing left).
     * @param {number} direction
     */
    setFacing: function (direction) {
      var active = this.getActive();
      if (active && typeof active.setFacing === "function") {
        return active.setFacing(direction);
      }
    },

    /**
     * Design units per second covered by the current gait.
     * @returns {number}
     */
    groundSpeed: function () {
      var active = this.getActive();
      if (active && typeof active.groundSpeed === "function") {
        return active.groundSpeed();
      }
      return 50;
    },

    /**
     * Trigger one-shot paw strike.
     * @param {function} [onImpact] - Callback executed on impact frame
     * @returns {Promise|object}
     */
    swipe: function (onImpact) {
      var active = this.getActive();
      if (active && typeof active.swipe === "function") {
        return active.swipe(onImpact);
      }
      if (typeof onImpact === "function") { onImpact(); }
      return Promise.resolve();
    },

    /**
     * Trigger patting interaction / happy state.
     */
    pat: function () {
      var active = this.getActive();
      if (active && typeof active.pat === "function") {
        return active.pat();
      } else if (active && typeof active.setState === "function") {
        return active.setState("pat");
      }
    },

    wag: function () {
      var active = this.getActive();
      if (active && typeof active.wag === "function") {
        return active.wag();
      }
      return this.pat();
    },

    shake: function () {
      var active = this.getActive();
      if (active && typeof active.shake === "function") {
        return active.shake();
      }
      return this.setState("sit");
    }
  };

  // Attempt initial registration of all known companion adapters
  registerKnownAdapters();

  global.CharacterManager = CharacterManager;
})(typeof window !== "undefined" ? window : globalThis);
