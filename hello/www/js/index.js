/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* global cordova, talsec */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
  // Cordova is now initialized. Have fun!
  console.log(`Running cordova-${cordova.platformId}@${cordova.version}`);

  const checks = {
    appIntegrity: 'App Integrity',
    privilegedAccess: 'Privileged Access',
    debug: 'Debug',
    hooks: 'Hooks',
    passcode: 'Passcode',
    simulator: 'Simulator',
    secureHardwareNotAvailable: 'Secure Hardware Not Available',
    systemVPN: 'System VPN',
    deviceBinding: 'Device binding',
    unofficialStore: 'Unofficial Store',
  };

  if (cordova.platformId === 'ios') {
    checks.deviceID = 'Device ID';
  } else {
    checks.obfuscationIssues = 'Obfuscation Issues';
    checks.devMode = 'Developer Mode';
  }

  Object.entries(checks).forEach(([check, msg]) => {
    const newElem = Object.assign(document.createElement('div'), {
      id: check,
      innerHTML: `<p class="event received">${msg}</p>`,
    });
    document.getElementById('parent').appendChild(newElem);
    setDefaultThreatStyle(check);
  });

  const config = {
    androidConfig: {
      packageName: 'com.example.helloapp',
      certificateHashes: ['AKoRuyLMM91E7lX/Zqp3u4jMmd0A7hH/Iqozu0TMVd0='],
      // supportedAlternativeStores: ['storeOne', 'storeTwo'],
    },
    iosConfig: {
      appBundleIds: 'com.example.helloapp',
      appTeamId: 'your_team_ID',
    },
    watcherMail: 'your_email_address@example.com',
    isProd: true,
  };

  const actions = {
    // Android & iOS
    privilegedAccess: () => {
      console.log('privilegedAccess');
      changeThreatStyle('privilegedAccess');
    },
    // Android & iOS
    debug: () => {
      console.log('debug');
      changeThreatStyle('debug');
    },
    // Android & iOS
    simulator: () => {
      console.log('simulator');
      changeThreatStyle('simulator');
    },
    // Android & iOS
    appIntegrity: () => {
      console.log('appIntegrity');
      changeThreatStyle('appIntegrity');
    },
    // Android & iOS
    unofficialStore: () => {
      console.log('unofficialStore');
      changeThreatStyle('unofficialStore');
    },
    // Android & iOS
    hooks: () => {
      console.log('hooks');
      changeThreatStyle('hooks');
    },
    // Android & iOS
    deviceBinding: () => {
      console.log('deviceBinding');
      changeThreatStyle('deviceBinding');
    },
    // Android & iOS
    secureHardwareNotAvailable: () => {
      console.log('secureHardwareNotAvailable');
      changeThreatStyle('secureHardwareNotAvailable');
    },
    // Android & iOS
    systemVPN: () => {
      console.log('systemVPN');
      changeThreatStyle('systemVPN');
    },
    // Android & iOS
    passcode: () => {
      console.log('passcode');
      changeThreatStyle('passcode');
    },
    // iOS only
    deviceID: () => {
      console.log('deviceID');
      changeThreatStyle('deviceID');
    },
    // Android only
    overlay: () => {
      console.log('overlay');
      changeThreatStyle('overlay');
    },
    // Android only
    obfuscationIssues: () => {
      console.log('obfuscationIssues');
      changeThreatStyle('obfuscationIssues');
    },
    // Android only
    devMode: () => {
      console.log('devMode');
      changeThreatStyle('devMode');
    },
  };

  talsec
    .start(config, actions)
    .then(() => {
      console.log('freeRASP initialized.');
    })
    .catch((error) => {
      console.log('Error during freeRASP initialization: ', error);
    });
}

function changeThreatStyle(threatType) {
  document.getElementById(threatType).style.backgroundColor = 'red';
}

function setDefaultThreatStyle(threatType) {
  document.getElementById(threatType).style.backgroundColor = 'green';
  document.getElementById(threatType).style.borderRadius = '4px';
  document.getElementById(threatType).style.margin = '4px 10px';
  document.getElementById(threatType).style.padding = '2px 0px';
  document.getElementById(threatType).style.textAlign = 'center';
}
