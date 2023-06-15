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

function onDeviceReady () {
    // Cordova is now initialized. Have fun!
    console.log(`Running cordova-${cordova.platformId}@${cordova.version}`);

    const checks = {
        privilegedAccess: 'Privileged Access',
        debug: 'Debug',
        simulator: 'Simulator',
        appIntegrity: 'App Integrity',
        unofficialStore: 'Unofficial Store',
        hooks: 'Hooks',
        deviceBinding: 'Device binding',
        passcode: 'Passcode',
        secureHardwareNotAvailable: 'Secure Hardware Not Available'
    };

    if (cordova.platformId === 'ios') {
        checks.deviceID = 'Device ID';
    } else {
        checks.obfuscationIssues = 'Obfuscation Issues';
    }

    Object.entries(checks).forEach(([check, msg]) => {
        const newElem = Object.assign(document.createElement('div'), {
            id: check,
            innerHTML: `<p class="event received">${msg}</p>`
        });
        document.getElementById('parent').appendChild(newElem);
        setDefaultThreatStyle(check);
    });

    const config = {
        androidConfig: {
            packageName: 'com.example.helloapp',
            certificateHashes: ['your_signing_certificate_hash_base64']
            // supportedAlternativeStores: ['storeOne', 'storeTwo'],
        },
        iosConfig: {
            appBundleIds: 'com.example.helloapp',
            appTeamId: 'your_team_ID'
        },
        watcherMail: 'your_email_address@example.com',
        isProd: true
    };

    const threatListener = function (threatType) {
        switch (threatType) {
        case 'privilegedAccess': // Android & iOS
            console.log('privilegedAccess');
            changeThreatStyle('privilegedAccess');
            break;
        case 'debug': // Android & iOS
            console.log('debug');
            changeThreatStyle('debug');
            break;
        case 'simulator': // Android & iOS
            console.log('simulator');
            changeThreatStyle('simulator');
            break;
        case 'appIntegrity': // Android & iOS
            console.log('appIntegrity');
            changeThreatStyle('appIntegrity');
            break;
        case 'unofficialStore': // Android & iOS
            console.log('unofficialStore');
            changeThreatStyle('unofficialStore');
            break;
        case 'hooks': // Android & iOS
            console.log('hooks');
            changeThreatStyle('hooks');
            break;
        case 'deviceBinding': // Android & iOS
            console.log('deviceBinding');
            changeThreatStyle('deviceBinding');
            break;
        case 'secureHardwareNotAvailable': // Android & iOS
            console.log('secureHardwareNotAvailable');
            changeThreatStyle('secureHardwareNotAvailable');
            break;
        case 'passcode': // Android & iOS
            console.log('passcode');
            changeThreatStyle('passcode');
            break;
        case 'deviceID': // iOS only
            console.log('deviceID');
            changeThreatStyle('deviceID');
            break;
        case 'obfuscationIssues': // Android only
            console.log('obfuscationIssues');
            changeThreatStyle('obfuscationIssues');
            break;
        default:
            console.log(`Unknown threat type detected: ${threatType}`);
        }
    };

    talsec
        .start(config, threatListener)
        .then(() => {
            console.log('Talsec initialized.');
        })
        .catch((error) => {
            console.log('Error during Talsec initialization: ', error);
        });
}

function changeThreatStyle (threatType) {
    document.getElementById(threatType).style.backgroundColor = 'red';
}

function setDefaultThreatStyle (threatType) {
    document.getElementById(threatType).style.backgroundColor = 'green';
    document.getElementById(threatType).style.borderRadius = '4px';
    document.getElementById(threatType).style.margin = '4px 10px';
    document.getElementById(threatType).style.padding = '2px 0px';
    document.getElementById(threatType).style.textAlign = 'center';
}
