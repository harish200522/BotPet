#!/usr/bin/env node
"use strict";

const http = require("http");
const { spawn } = require("child_process");
const path = require("path");

const PORT = 5179;
const HOST = "127.0.0.1";

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : "help";

function showHelp() {
  console.log(`
🐾 BotPet Command-Line Controller 🐾
  botpet wake               - Wake up your companion with a personalized greeting
  botpet name "<name>"      - Set your user profile name and greet
  botpet drop [y]           - Drop avatar from height (tests touchdown physics)
  botpet sit                - Command your avatar to rest and monitor screen
  botpet walk               - Command your avatar to stroll across screen
  botpet sleep              - Put your avatar to sleep (nap pose)
  botpet angry              - Trigger alert warning stance
  botpet pat                - Cheer your companion (+5 Focus XP)
  botpet bored              - Set avatar to relaxed pose
  botpet swipe              - Trigger paw strike intervention
  botpet say "<message>"    - Display a custom speech bubble message
  botpet theme <dark|white> - Toggle color scheme (Midnight vs Classic)
  botpet skin <name>        - Switch companion avatar (cat / panda / puppy)
  botpet speed <0.5 to 2.0> - Adjust animation pacing and walking speed
  botpet settings           - Open the BotPet Preferences & Diagnostics window
  botpet focus [minutes]    - Start a focused sprint session (e.g. botpet focus 25)
  botpet break [minutes]    - Take a temporary rest break (e.g. botpet break 5)
  botpet snooze [minutes]   - Pause distraction enforcement for N minutes
  botpet mode <close|nag>   - Set intervention mode (auto-dismiss vs advisory alert)
  botpet resume             - Resume active screen monitoring
  botpet status             - Display current companion state and telemetry
  botpet rules              - List all active distraction filter rules
  botpet start              - Launch the desktop screen companion
`);
}

function sendRequest(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `http://${HOST}:${PORT}/${endpoint}${query ? "?" + query : ""}`;

  const req = http.get(url, (res) => {
    let data = "";
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", () => {
      try {
        const json = JSON.parse(data);
        if (json.ok) {
          handleSuccess(endpoint, json, params);
        } else {
          console.error(`❌ Error: ${json.error || "Failed"}`);
        }
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on("error", (_err) => {
    console.error(`
⚠️  BotPet is not currently running!
   To start the companion on your screen:
   • Run:  .\\botpet start
   • Or double-click: start-screen-pet.bat
`);
  });
}

function handleSuccess(endpoint, res, params) {
  switch (endpoint) {
    case "wake":
      console.log(`🐾 Companion woke up and greeted: "${res.userName}"!`);
      break;
    case "name":
      console.log(`👤 User profile name updated to: "${res.userName}"!`);
      break;
    case "drop":
      console.log(`🐾 Avatar dropped from y=${res.droppedFrom}px and cushioned the landing!`);
      break;
    case "sit":
      console.log("🐾 Avatar is now resting and monitoring your screen.");
      break;
    case "walk":
      console.log("🚶 Avatar started strolling across the screen.");
      break;
    case "sleep":
      console.log("😴 Avatar is now resting. Zzz...");
      break;
    case "angry":
      console.log("💢 Avatar is in alert warning stance! Stay on track!");
      break;
    case "pat":
      console.log("❤️  Cheered your companion! (+5 XP)");
      break;
    case "bored":
      console.log("🥱 Avatar is relaxed.");
      break;
    case "swipe":
      console.log("🐾 Avatar executed a paw strike!");
      break;
    case "say":
      console.log(`💬 Companion says: "${params.text}"`);
      break;
    case "focus":
      console.log(`🎯 Focus sprint session started for ${params.mins || 25} minutes!`);
      break;
    case "break":
      console.log(`☕ Rest break started for ${params.mins || 5} minutes!`);
      break;
    case "snooze":
      console.log(`💤 Distraction enforcement paused for ${res.snoozedMinutes} minutes.`);
      break;
    case "mode":
      console.log(`⚙️  Intervention mode set to: [${res.mode.toUpperCase()}]`);
      break;
    case "resume":
      console.log("🐾 Resumed active screen monitoring.");
      break;
    case "status":
      console.log(`
📊 BotPet Diagnostics:
  • Enforcement Mode: ${res.mode === "close" ? "Auto-Dismiss" : "Advisory Alert"}
  • Monitoring:       ${res.enabled ? "Active" : "Disabled"}
  • Paused / Snoozed: ${res.snoozed ? "Yes" : "No"}
  • Active Filters:   ${res.ruleCount} rules configured
`);
      break;
    case "rules":
      console.log("\n📋 Configured Distraction Filters:");
      res.rules.forEach((r, idx) => {
        console.log(`  ${idx + 1}. [${r.id}] ${r.label} (Grace: ${r.grace}s, Action: ${r.action || "tab"})`);
        if (r.any) console.log(`     Keywords: ${r.any.join(", ")}`);
      });
      console.log();
      break;
    case "skin":
      console.log(`🐾 Avatar skin switched to: "${res.skin}"!`);
      break;
    default:
      console.log("✅ Command applied:", endpoint);
  }
}

// Command dispatcher
if (command === "help" || command === "--help" || command === "-h") {
  showHelp();
} else if (command === "start" || command === "restart") {
  const batPath = path.join(__dirname, "..", "start-screen-pet.bat");
  console.log("🚀 Starting BotPet Screen Companion with CLI control enabled...");
  spawn("cmd.exe", ["/c", batPath], { detached: true, stdio: "ignore" }).unref();
  console.log("Pet started! Check the bottom of your screen.");
} else if (command === "quit" || command === "stop") {
  const { execSync } = require("child_process");
  try {
    execSync("taskkill /F /IM electron.exe", { stdio: "ignore" });
    console.log("🛑 Cat has been closed.");
  } catch (e) {
    console.log("No running cat found.");
  }
} else if (command === "wake") {
  const text = args.slice(1).join(" ");
  sendRequest("wake", text ? { text } : {});
} else if (command === "name") {
  const text = args.slice(1).join(" ");
  if (!text) {
    console.error("Usage: cat name <your-name>");
  } else {
    sendRequest("name", { text });
  }
} else if (command === "drop") {
  const y = parseInt(args[1], 10) || 40;
  sendRequest("drop", { y });
} else if (command === "say") {
  const text = args.slice(1).join(" ") || "Hello!";
  sendRequest("say", { text });
} else if (command === "focus") {
  const mins = parseInt(args[1], 10) || 25;
  sendRequest("focus", { mins });
} else if (command === "break") {
  const mins = parseInt(args[1], 10) || 5;
  sendRequest("break", { mins });
} else if (command === "snooze") {
  const mins = parseInt(args[1], 10) || 5;
  sendRequest("snooze", { mins });
} else if (command === "mode") {
  const val = args[1];
  if (val !== "close" && val !== "nag") {
    console.error("Usage: cat mode close | cat mode nag");
  } else {
    sendRequest("mode", { val });
  }
} else if (command === "theme") {
  const text = args[1] || "dark";
  sendRequest("theme", { text });
} else if (command === "ears") {
  const text = args[1] || "pink";
  sendRequest("ears", { text });
} else if (command === "speed") {
  const text = args[1] || "1.0";
  sendRequest("speed", { text });
} else if (command === "skin") {
  const name = (args[1] || "cat").toLowerCase();
  const valid = ["cat", "panda", "puppy", "penguin", "sugarglider"];
  if (!valid.includes(name)) {
    console.error(`❌ Unknown skin "${name}". Choose from: ${valid.join(", ")}`);
  } else {
    sendRequest("skin", { name });
  }
} else if (command === "settings" || command === "config") {
  sendRequest("settings");
  console.log("🖥️  Opening BotPet Settings & Rules window...");
} else if (["sit", "walk", "sleep", "angry", "pat", "bored", "swipe", "resume", "status", "rules"].includes(command)) {
  sendRequest(command);
} else {
  console.error(`Unknown command: "${command}"`);
  showHelp();
}
