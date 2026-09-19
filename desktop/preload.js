"use strict";

const { contextBridge, ipcRenderer } = require("electron");

const api = {
  /* main -> renderer */
  onBust: (cb) => ipcRenderer.on("bust", (_e, payload) => cb(payload)),
  onStatus: (cb) => ipcRenderer.on("status", (_e, payload) => cb(payload)),

  /* renderer -> main */
  act: (target, mode) => ipcRenderer.invoke("act", { target, mode }),
  snooze: () => ipcRenderer.invoke("snooze"),

  /* click-through toggle: the overlay is transparent to the mouse
     except while the pointer is actually over the pet or its bubble */
  setInteractive: (on) => ipcRenderer.send("set-interactive", !!on),
  onCursorPos: (cb) => ipcRenderer.on("cursor-pos", (_e, pos) => cb(pos)),
  onCliCommand: (cb) => ipcRenderer.on("cli-command", (_e, cmd) => cb(cmd)),
  getUserName: () => ipcRenderer.invoke("get-user-name"),
  getSkin: () => ipcRenderer.invoke("get-skin")
};

contextBridge.exposeInMainWorld("botpet", api);
contextBridge.exposeInMainWorld("morphcat", api);

