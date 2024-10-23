#!/usr/bin/env node

// Cool script that adds props to android/build.gradle, because cordova cannot do so...

const fs = require('fs');
const path = require('path');

module.exports = function (context) {
  const gradleFilePath = path.join(
    context.opts.projectRoot,
    'platforms/android/build.gradle',
  );

  if (!fs.existsSync(gradleFilePath)) {
    console.error('build.gradle file not found');
    return;
  }

  let gradleFile = fs.readFileSync(gradleFilePath, 'utf8');

  // Check if the plugins block already exists
  if (gradleFile.includes('plugins {')) {
    console.log('Custom plugins block already exists in build.gradle');
    return;
  }

  // Find the start of the 'buildscript' block
  const buildscriptStart = gradleFile.indexOf('buildscript');
  if (buildscriptStart === -1) {
    console.error('buildscript block not found in build.gradle');
    return;
  }

  // Find the end of the 'buildscript' block, accounting for nested braces
  let openBraces = 0;
  let closeBraces = 0;
  let buildscriptEnd = -1;

  for (let i = buildscriptStart; i < gradleFile.length; i++) {
    if (gradleFile[i] === '{') openBraces++;
    if (gradleFile[i] === '}') closeBraces++;

    // When all opened braces are closed, we've reached the end
    if (openBraces > 0 && openBraces === closeBraces) {
      buildscriptEnd = i + 1;
      break;
    }
  }

  if (buildscriptEnd <= 0) {
    console.error('Could not find the end of the buildscript block');
    return;
  }

  // Insert the plugins block after the 'buildscript' section
  // Define the custom plugins block
  const pluginConfig = `

// Custom plugin property
plugins {
    id 'org.jetbrains.kotlin.plugin.serialization' version '1.7.10'
}`;

  gradleFile =
    gradleFile.slice(0, buildscriptEnd) +
    pluginConfig +
    gradleFile.slice(buildscriptEnd);
  fs.writeFileSync(gradleFilePath, gradleFile, 'utf8');
  console.log('Added custom plugins property after buildscript block');
};
