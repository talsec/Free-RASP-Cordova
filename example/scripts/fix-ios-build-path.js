const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join('platforms', 'ios', 'build');
const DEBUG_DIR = path.join(BUILD_DIR, 'Debug-iphonesimulator');
const EMULATOR_DIR = path.join(BUILD_DIR, 'emulator');

if (fs.existsSync(DEBUG_DIR) && !fs.existsSync(EMULATOR_DIR)) {
  console.log('Creating symlink from Debug-iphonesimulator to emulator for native-run compatibility...');
  try {
    // Create a symbolic link
    fs.symlinkSync('Debug-iphonesimulator', EMULATOR_DIR, 'dir');
    console.log('Symlink created successfully.');
  } catch (err) {
    console.error('Failed to create symlink:', err);
  }
}