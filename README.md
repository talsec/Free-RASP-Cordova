
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
    * [Step 6: Additional note about obfuscation](#step-6-additional-note-about-obfuscation)
    * [Step 7: User Data Policies](#step-7-user-data-policies)
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
<preference name="android-targetSdkVersion" value="31" />
```
Then run following command to apply the preferences:

    $ cordova prepare android

### iOS
Talsec Cordova plugin uses Swift, add following plugin to support Swift.

    $ cordova plugin add cordova-plugin-add-swift-support --save

## Step 2: Install the plugin

    $ cordova plugin add https://github.com/talsec/Free-RASP-Cordova.git

## Step 3: Setup the Configuration for your App
You need to provide configuration for freeRASP to work properly and initialize it. The freeRASP configuration is an JavaScript object that contains configs for both Android and iOS, as well as common configuration. You must fill all the required values for the plugin to work. Use the following template to provide configuration to the Talsec plugin. You can find detailed description of the configuration below.
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
    watcherMail : "your_email_address@example.com",
    isProd: true
};
```

#### The configuration object should consist of:

1. `androidConfig` _: object | undefined_ - required for Android devices, has following keys:

    - `packageName` _: string_ - package name of your app you chose when you created it
    - `certificateHashes` _: string[]_ - hash of the certificate of the key which was used to sign the application. **Hash which is passed here must be encoded in Base64 form.** If you are not sure how to get your certificate hash, you can check out the guide on our [Github wiki](https://github.com/talsec/Free-RASP-Community/wiki/Getting-your-signing-certificate-hash-of-app). Multiple hashes are supported, e.g. if you are using a different one for the Huawei App Gallery.
    - `supportedAlternativeStores` _: string[] | undefined_ - If you publish on the Google Play Store and/or Huawei AppGallery, you **don't have to assign anything** there as those are supported out of the box.
1. `iosConfig` _: object | undefined_ - required for iOS devices, has following keys:
    - `appBundleId` _: string_ - Bundle ID of your app
    - `appTeamId` _: string_ - the Apple Team ID
1. `watcherMail` _: string_ - your mail address where you wish to receive reports. Mail has a strict form `name@domain.com` which is passed as String.
1. `isProd` _: boolean | undefined_ - defaults to `true` when undefined. If you want to use the Dev version to disable checks described [in the chapter below](#dev-vs-release-version), set the parameter to `false`. Make sure that you have the Release version in the production (i.e. isProd set to true)!

If you are developing only for one of the platforms, you can skip the configuration part for the other one, i.e., delete the unused configuration.

### Dev vs Release version

The Dev version is used to not complicate the development process of the application, e.g. if you would implement killing of the application on the debugger callback. It disables some checks which won't be triggered during the development process:

- Emulator-usage (simulator)
- Debugging (debug)
- Signing (appIntegrity)
- Unofficial store (unofficialStore)

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

## Step 6: Additional note about obfuscation
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

## Step 7: User Data Policies

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
            <td>Mentioning of the App name and logo in the marketing communications of Talsec (e.g. "Trusted by" section of the Talsec web or in the social media).</td>
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
