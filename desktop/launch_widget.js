const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const { trayIcon } = require('./tray-icon');

let win = null;

if (!app.requestSingleInstanceLock()) {
  console.log('[BotPet] Another instance is already running. Quitting.');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
      win.moveTop();
    }
  });

  app.whenReady().then(() => {
    const display = screen.getPrimaryDisplay();
    const area = display.workArea;

    const width = 340;
    const height = 320;
    // Position bottom right above the taskbar
    const x = Math.max(10, Math.round(area.x + area.width - width - 24));
    const y = Math.max(10, Math.round(area.y + area.height - height - 24));

    console.log(`[BotPet] Display work area: ${area.width}x${area.height}, placing pet at (${x}, ${y})`);

    let iconImg = null;
    try {
      iconImg = trayIcon(false);
    } catch (e) {
      console.log('[BotPet] Tray icon generation fallback:', e.message);
    }

    win = new BrowserWindow({
      width,
      height,
      x,
      y,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      alwaysOnTop: true,
      skipTaskbar: false,
      resizable: false,
      hasShadow: true,
      title: "BotPet Desktop Companion",
      icon: iconImg || undefined,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: false,
        backgroundThrottling: false
      }
    });

    win.loadFile(path.join(__dirname, "widget.html"));
    win.setAlwaysOnTop(true, "floating");
    win.show();
    win.focus();
    win.moveTop();

    console.log('[BotPet] Window created and shown on screen.');
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
}
