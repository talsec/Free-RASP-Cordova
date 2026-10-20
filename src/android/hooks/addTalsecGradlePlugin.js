#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// TODO: set the real version once app.talsec.plugin with wrapper support is released
const PLUGIN_ARTIFACT = 'app.talsec.plugin:talsec-security-plugin';
const PLUGIN_CLASSPATH = `${PLUGIN_ARTIFACT}:1.1.0`;
const PLUGIN_CLASSPATH_PATTERN =
  /app\.talsec\.plugin:talsec-security-plugin:[^"'\s]+/;
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

  // An earlier freeRASP version may have added another plugin version, so keep it in step with this one
  if (gradleFile.includes(PLUGIN_ARTIFACT)) {
    const updated = gradleFile.replace(
      PLUGIN_CLASSPATH_PATTERN,
      PLUGIN_CLASSPATH,
    );
    if (updated !== gradleFile) {
      fs.writeFileSync(gradleFilePath, updated, 'utf8');
    }
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
