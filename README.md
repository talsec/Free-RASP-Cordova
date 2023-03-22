
![FreeRasp](https://raw.githubusercontent.com/talsec/Free-RASP-Community/master/visuals/freeRASP.png)

![GitHub Repo stars](https://img.shields.io/github/stars/talsec/Free-RASP-Community?color=green) ![GitHub](https://img.shields.io/github/license/talsec/Free-RASP-Community) ![GitHub](https://img.shields.io/github/last-commit/talsec/Free-RASP-Community) ![Publisher](https://img.shields.io/pub/publisher/freerasp)
# freeRASP for Cordova

freeRASP for Cordova is a mobile in-app protection and security monitoring plugin. It aims to cover the main aspects of RASP (Runtime App Self Protection) and application shielding.

# :notebook_with_decorative_cover: Table of contents

- [Overview](#overview)
- [Usage](#usage)
    * [(Optional) Create a new Cordova demo application](#optional-create-a-new-cordova-demo-application)
    * [Step 1: Talsec Cordova plugin prerequisites](#step-1-talsec-cordova-plugin-prerequisites)
    * [Step 2: Install the plugin](#step-2-install-the-plugin)
    * [Step 3: Setup the Configuration for your App](#step-3-setup-the-configuration-for-your-app)
    * [Step 4: Handle detected threats](#step-4-handle-detected-threats)
    * [Step 5: Start the Talsec](#step-5-start-the-talsec)
    * [Step 6: Dev vs Release version](#step-6-dev-vs-release-version)
    * [Step 7: Additional note about obfuscation](#step-7-additional-note-about-obfuscation)
    * [Step 8: User Data Policies](#step-8-user-data-policies)
- [Security Report](#security-report)
- [Enterprise Services](#bar_chart-enterprise-services)
    * [Commercial version](#commercial-version)
    * [Plans comparison](#plans-comparison)

# Overview

The freeRASP is available for Flutter, Cordova, Android, and iOS developers. We encourage community contributions, investigations of attack cases, joint data research, and other activities aiming to make better app security and app safety for end-users.

freeRASP plugin is designed to combat

* Reverse engineering attempts
* Re-publishing or tampering with the apps
* Running application in a compromised OS environment
* Malware, fraudsters, and cybercriminal activities

Key features are the detection and prevention of

* Root/Jailbreak (e.g., unc0ver, check1rain)
* Hooking framework (e.g., Frida, Shadow)
* Untrusted installation method
* App/Device (un)binding

Additional freeRASP features include low latency, easy integration and a weekly [Security Report](#security-report) containing detailed information about detected incidents and potential threats, summarizing the state of your app security.

The commercial version provides a top-notch protection level, extra features, support and maintenance. One of the most valued commercial features is AppiCrypt® - App Integrity Cryptogram.

It allows easy to implement API protection and App Integrity verification on the backend to prevent API abuse:

* Bruteforce attacks
* Botnets
* Session-hijacking
* DDoS

It is a unified solution that works across all mobile platforms without dependency on external web services (i.e., without extra latency, an additional point of failure, and maintenance costs).

Learn more about commercial features at [https://talsec.app](https://talsec.app).

Learn more about freemium freeRASP features at [GitHub main repository](https://github.com/talsec/Free-RASP-Community).

# Usage

We will guide you step-by-step, but you can always check the expected result in the example.


## (Optional) Create a new Cordova demo application
Create a new Cordova project:

    $ cordova create hello com.example.helloapp Hello

Add platforms to your Cordova project:

    $ cd hello
    $ cordova platform add android
    $ cordova platform add ios

## Step 1: Talsec Cordova plugin prerequisites
### Android
Talsec Cordova plugin uses Kotlin, add following lines into the `config.xml` file in your project root directory.
```xml
<preference name="GradlePluginKotlinEnabled" value="true" />
<preference name="GradlePluginKotlinCodeStyle" value="official" />
<preference name="GradlePluginKotlinVersion" value="1.7.10" />
```

### iOS
Talsec Cordova plugin uses Swift, add following plugin to support Swift.

    $ cordova plugin add cordova-plugin-add-swift-support --save

## Step 2: Install the plugin

    $ cordova plugin add https://github.com/talsec/Free-RASP-Cordova.git

## Step 3: Setup the Configuration for your App
You need to provide configuration for Talsec to work properly. Use following format to provide configuration to the Talsec plugin.
```js
var config = {
    androidConfig : {
        packageName : "com.example.helloapp", 
        certificateHashes : ["your_signing_certificate_hash_base64"],
	// supportedAlternativeStores: ['storeOne', 'storeTwo'],
    },
    iosConfig : {
        appBundleIds: "com.example.helloapp",
        appTeamId: "your_team_ID",
    },
    watcherMail : "your_email_address@example.com"
};
```

Talsec configuration contains configs for both Android and iOS. You must fill all the values for the plugin to work. If you are not sure how to get your certificate hash, you can check out the guide on our [Github wiki](https://github.com/talsec/Free-RASP-Community/wiki/Getting-your-signing-certificate-hash-of-app).


If you are developing only for one of the platforms, you can leave the configuration part for the other one, i.e., delete the other configuration.

## Step 4: Handle detected threats
Talsec executes periodical checks when the application is running. To be able to receive detected threats, you need to provide listener to the plugin. The threat types are defined in the example bellow:

```js
var threatListener = function(threatType) {
    switch(threatType) {
        case "privilegedAccess": // Android & iOS
            // TODO place your reaction here
            break;
        case "debug": // Android & iOS
            // TODO place your reaction here 
            break;
        case "simulator": // Android & iOS
            // TODO place your reaction here
            break;
        case "appIntegrity": // Android & iOS
            // TODO place your reaction here
            break;
        case "unofficialStore": // Android & iOS
            // TODO place your reaction here 
            break;
        case "hooks": // Android & iOS
            // TODO place your reaction here
            break;
        case "device binding": // Android & iOS
            // TODO place your reaction here
            break;
        case "deviceID": // iOS only
            // TODO place your reaction here 
            break;
        case "missingSecureEnclave": // iOS only
            // TODO place your reaction here
            break;
        case "passcodeChange": // iOS only
            // TODO place your reaction here 
            break;
        case "passcode": // iOS only
            // TODO place your reaction here
            break;
        default:
            console.log('Unknown threat type detected: ' + threatType);
    }
}
```

Visit our [wiki](https://github.com/talsec/Free-RASP-Community/wiki/Threat-detection) to learn more details about the performed checks and their importance for app security.

## Step 5: Start the Talsec

Talsec can be started after the Cordova initialization is completed. 

The initialization should be done inside the `onDeviceReady` function in the `index.js`. 

```js
talsec.start(config, threatListener).then(() => {
    console.log('Talsec initialized.');
}).catch((error) => {
    console.log('Error during Talsec initialization: ', error);
});
```

## Step 6: Dev vs Release version
The Dev version is used to not complicate the development process of the application, e.g. if you would implement killing of the application on the debugger callback. It disables some checks which won't be triggered during the development process:

* Emulator-usage (simulator)
* Debugging (debug)
* Signing (appIntegrity)
* Unofficial store (unofficialStore)

Which version of freeRASP is used is tied to the application's development stage - more precisely, how the application is compiled.

### Android
Android implementation of the Cordova plugin detects selected development stage and automatically applies the suitable version of the library.

* `cordova run android` (debug) -> uses dev version of Talsec
* `cordova run android --release` (release) -> uses release version of Talsec

### iOS
For the iOS implemtation, it's neccesary to add script into the Xcode environment, that automatically switches between the library dev/release versions according to selected development stage. Then, it is necessary to embedd a symlink to correct TalsecRuntime.xcframework.

1. Add pre-built script for changing the Debug and Release versions of the framework:
   * Go to your **Target** -> **Build Phases** -> **New Run Script Phase**
   * Copy-paste following script:
        ```shell
        cd "${SRCROOT}/../../plugins/cordova-talsec-plugin-freerasp/src/ios"
        if [ "${CONFIGURATION}" = "Release" ]; then
            rm -rf ./TalsecRuntime.xcframework
            ln -s ./Release/TalsecRuntime.xcframework/ TalsecRuntime.xcframework
        else
            rm -rf ./TalsecRuntime.xcframework
            ln -s ./Debug/TalsecRuntime.xcframework/ TalsecRuntime.xcframework
        fi 
        ```
2. Place the new run script phase at the **top of the build phases**
   * Do clean build before change Debug <-> Release version
3. Add dependency on the symlink
   * Go to your **Target** -> **General** -> **Frameworks, Libraries and Embedded Content**
   * Add dependency (drag & drop) on the symlink on the following location:
     *MyApp/plugins/cordova-talsec-plugin-freerasp/src/ios/TalsecRuntime.xcframework*
   * If there is no symlink, try to create it manually by the following command:
   *     $ ln -s ./Debug/TalsecRuntime.xcframework/ TalsecRuntime.xcframework

## Step 7: Additional note about obfuscation
The freeRASP contains public API, so the integration process is as simple as possible. Unfortunately, this public API also creates opportunities for the attacker to use publicly available information to interrupt freeRASP operations or modify your custom reaction implementation in threat callbacks. In order for freeRASP to be as effective as possible, it is highly recommended to apply obfuscation to the final package/application, making the public API more difficult to find and also partially randomized for each application so it cannot be automatically abused by generic hooking scripts.

### Android
The majority of Android projects support code shrinking and obfuscation without any additional need for setup. The owner of the project can define the set of rules that are usually automatically used when the application is built in the release mode. For more information, please visit the official documentation
* https://developer.android.com/studio/build/shrink-code 
* https://www.guardsquare.com/manual/configuration/usage

You can make sure, that the obfuscation is enabled by checking the value of **minifyEnabled** property in your **module's build.gradle** file.
```gradle
android {
    ...

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Step 8: User Data Policies

Google Play [requires](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en) all app publishers to declare how they collect and handle user data for the apps they publish on Google Play. They should inform users properly of the data collected by the apps and how the data is shared and processed. Therefore, Google will reject the apps which do not comply with the policy.

Apple has a [similar approach](https://developer.apple.com/app-store/app-privacy-details/) and specifies the types of collected data.

You should also visit our [Android](https://github.com/talsec/Free-RASP-Android/tree/4dd5a41b33244c979de79bb3e16f9ccf167a948d) and [iOS](https://github.com/talsec/Free-RASP-iOS/tree/78dc848ef66c09438e338780ff46dda40efae331) submodules to learn more about their respective data policies.

And you're done 🎉!

If you encounter any other issues, you can see the list of solved issues [here](https://github.com/talsec/Free-RASP-Cordova/issues?q=is%3Aissue+is%3Aclosed), or open up a [new one](https://github.com/talsec/Free-RASP-Cordova/issues?q=is%3Aissue+is%3Aopen).

# Security Report

The Security Report is a weekly summary describing the application's security state and characteristics of the devices it runs on in a practical and easy-to-understand way.

The report provides a quick overview of the security incidents, their dynamics, app integrity, and reverse engineering attempts. It contains info about the security of devices, such as OS version or the ratio of devices with screen locks and biometrics. Each visualization also comes with a concise explanation.

To receive Security Reports, fill out the _watcherMail_ field in [config](#step-3-setup-the-configuration-for-your-app).

![dashboard](https://raw.githubusercontent.com/talsec/Free-RASP-Community/master/visuals/dashboard.png)

# :bar_chart: Enterprise Services
We provide app security hardening SDK: i.e. AppiCrypt®, Customer Data Encryption (local storage), End-to-end encryption, Strings protection (e.g. API keys) and Dynamic Certificate Pinning to our commercial customers as well. To get the most advanced protection compliant with PSD2 RT and eIDAS and support from our experts, contact us at [talsec.app](https://talsec.app).

## Commercial version
The commercial version provides a top-notch protection level, extra features, support, and maintenance. One of the most valued commercial features is [AppiCrypt®](https://www.talsec.app/appicrypt) - App Integrity Cryptogram.

It allows easy to implement API protection and App Integrity verification on the backend to prevent API abuse:

-   Bruteforce attacks
-   Botnets
-   Session-hijacking
-   DDoS

It is a unified solution that works across all mobile platforms without dependency on external web services (i.e., without extra latency, an additional point of failure, and maintenance costs).

Learn more about commercial features at  [https://talsec.app](https://talsec.app/).

**TIP:** You can try freeRASP and then upgrade easily to an enterprise service.


## Plans Comparison

<table>
    <thead>
        <tr>
            <th></th>
            <th>freeRASP</th>
            <th>Business RASP+</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan=5><strong>Runtime App Self Protection (RASP, app shielding)</strong></td>
        </tr>
        <tr>
            <td>Advanced root/jailbreak protections</td>
            <td>basic</td>
            <td>advanced</td>
        </tr>
        <tr>
            <td>Runtime reverse engineering controls 
                <ul>
                    <li>Debug</li>
                    <li>Emulator</li>
                    <li>Hooking protections (e.g. Frida)</li>
                </ul>
            </td>
            <td>basic</td>
            <td>advanced</td>
        </tr>
        <tr>
            <td>Runtime integrity controls 
                <ul>
                    <li>Tamper protection</li>
                    <li>Repackaging / Cloning protection</li>
                    <li>Device binding protection</li>
                    <li>Unofficial store detection</li>
                </ul>
            </td>
            <td>basic</td>
            <td>advanced</td>
        </tr>
        <tr>
            <td>Device OS security status check 
                <ul>
                    <li>HW security module control</li>
                    <li>Screen lock control</li>
                </ul>
            </td>
            <td>yes</td>
            <td>yes</td>
        </tr>
        <tr>
            <td>UI protection 
                <ul>
                    <li>Overlay protection</li>
                    <li>Accessibility services protection</li>
                </ul>
            </td>
            <td>no</td>
            <td>yes</td>
        </tr>
        <tr>
            <td colspan=5><strong>Hardening suite</strong></td>
        </tr>
        <tr>
            <td>Security hardening suite 
                <ul>
                    <li>Customer Data Encryption (local storage)</li>
                    <li>End-to-end encryption</li>
                    <li>Strings protection (e.g. API keys)</li>
                    <li>Dynamic certificate pinning</li>
                </ul>
            </td>
            <td>no</td>
            <td>yes</td>
        </tr>
        <tr>
            <td colspan=5><strong>AppiCrypt® - App Integrity Cryptogram</strong></td>
        </tr>
        <tr>
            <td>API protection by mobile client integrity check, online risk scoring, online fraud prevention, client App integrity check. The cryptographic proof of app & device integrity.</td>
            <td>no</td>
            <td>yes</td>
        </tr>
        <tr>
            <td colspan=5><strong>Monitoring</strong></td>
        </tr>
        <tr>
            <td>AppSec regular email reporting</td>
            <td>yes (up to 100k devices)</td>
            <td>yes</td>
        </tr>
        <tr>
            <td>Data insights and auditing portal</td>
            <td>no</td>
            <td>yes</td>
        </tr>
        <tr>
            <td>Embed code to integrate with portal</td>
            <td>no</td>
            <td>yes</td>
        </tr>
        <tr>
            <td>API data access</td>
            <td>no</td>
            <td>yes</td>
        </tr>
         <td colspan=5><strong>Fair usage policy</strong></td>
        </tr>
        <tr>
            <td>Mentioning of the app name in Talsec marketing communication (e.g. "Trusted by Talsec section" on social media)</td>
            <td>over 100k downloads</td>
            <td>no</td>
        </tr>
        <tr>
            <td>Threat signals data collection to Talsec database for processing and product improvement</td>
            <td>yes</td>
            <td>no</td>
        </tr>
    </tbody>
</table>

For further comparison details (and planned features), follow our [discussion](https://github.com/talsec/Free-RASP-Community/discussions/5).
