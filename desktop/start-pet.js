const { spawn } = require('child_process');
const path = require('path');

const electronExe = path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe');
const targetScript = path.join(__dirname, 'launch_widget.js');

console.log('Launching BotPet Screen Companion...');

const child = spawn(electronExe, [targetScript], {
  cwd: __dirname,
  detached: true,
  stdio: 'ignore'
});

child.unref();

console.log('BotPet Screen Companion successfully launched in background! PID:', child.pid);
process.exit(0);
