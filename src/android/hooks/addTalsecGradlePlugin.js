#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// TODO: set the real version once app.talsec.plugin with wrapper support is released
const PLUGIN_CLASSPATH = 'app.talsec.plugin:talsec-security-plugin:1.1.0';
const PLUGIN_REPOSITORY =
  'https://europe-west3-maven.pkg.dev/talsec-artifact-repository/plugin';

module.exports = function (context) {
  const gradleFilePath = path.join(
    context.opts.projectRoot,
    'platforms/android/build.gradle',
  );

  if (!fs.existsSync(gradleFilePath)) {
    return;
  }

  const gradleFile = fs.readFileSync(gradleFilePath, 'utf8');

  if (gradleFile.includes('app.talsec.plugin:talsec-security-plugin')) {
    return;
  }

  const buildscriptMatch = gradleFile.match(/buildscript\s*\{[^\n]*\n/);
  if (!buildscriptMatch) {
    throw new Error(
      `freeRASP: buildscript block not found in ${gradleFilePath}, cannot add the Talsec Gradle plugin`,
    );
  }

  const insertAt = buildscriptMatch.index + buildscriptMatch[0].length;
  const snippet = [
    `    repositories { maven { url "${PLUGIN_REPOSITORY}" } }`,
    `    dependencies { classpath "${PLUGIN_CLASSPATH}" }`,
    '',
  ].join('\n');

  fs.writeFileSync(
    gradleFilePath,
    gradleFile.slice(0, insertAt) + snippet + gradleFile.slice(insertAt),
    'utf8',
  );
};
