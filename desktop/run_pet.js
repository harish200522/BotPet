const { app, BrowserWindow, screen, Tray, Menu } = require('electron');
const path = require('path');
const { trayIcon } = require('./tray-icon');

let win = null;
let tray = null;

app.whenReady().then(() => {
  const area = screen.getPrimaryDisplay().workArea;

  win = new BrowserWindow({
    x: Math.round(area.x + area.width / 2 - 150),
    y: Math.round(area.y + area.height - 220),
    width: 300,
    height: 220,
    transparent: true,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, "pet.html"));
  win.setAlwaysOnTop(true, "floating");
  win.setVisibleOnAllWorkspaces(true);
  win.show();

  try {
    tray = new Tray(trayIcon(false));
    tray.setToolTip("BotPet Companion");
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: "BotPet Active", enabled: false },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() }
    ]));
  } catch (_) {}
});
