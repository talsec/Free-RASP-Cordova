# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [6.4.0] - 2024-10-14

-   Android SDK version: 11.1.1
-   iOS SDK version: 6.6.0

### Cordova

-   Updated the communication channels between js and native platforms
-   Example app now uses Angular + Ionic

### Android

-   A whole new **feature**, malware detection capability. All the necessary information about which can be found in the documentation

## [6.3.1] - 2024-09-30

-   Android SDK version: 11.1.1
-   iOS SDK version: 6.6.0

### Android

#### Fixed

-   False positives for hook detection

## [6.3.0] - 2024-09-25

-   Android SDK version: 11.1.0
-   iOS SDK version: 6.6.0

### Cordova

#### Changed

-   Improved error messages when validation of the freeRASP configuration fails

### Android

#### Added

-   Added the auditing of the internal execution for the future check optimization and overall security improvements.

#### Fixed

-   Fixed native crashes (SEGFAULT errors) in `ifpip` method
-   Fixed collision for command line tools (like ping) invoked without absolute path

#### Changed

-   ❗️Breaking: Changed the way TalsecConfig is created, we introduced a Builder pattern to make the process more streamlined and readable
-   Updated OpenSSL to version 3.0.14
-   Updated CURL to version 8.8.0
-   Refactored fetching the list of installed applications for root and hook detection.

### iOS

#### Added

-   [Dopamine](https://github.com/opa334/Dopamine) jailbreak detection.
-   Enhanced and accelerated the data collection logic

#### Changed

-   Updated OpenSSL to version 3.0.14
-   Updated CURL to version 8.8.0

## [6.2.1] - 2024-07-02

### Cordova

#### Changed

-   CHANGELOG now adheres to the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## [6.2.0] - 2024-05-31

# freeRASP 6.2.0

-   ⚡ Added new threat `systemVPN` for VPN detection
-   📄 Documentation updates

### Android

-   ⚡ Added new threat `devMode` for Developer mode detection
-   ⚡ Fixed proguard warning in specific versions of RN
-   ⚡ Fixed issue with Arabic alphabet in logs caused by the device’s default system locale
-   ✔️ Increased the version of the GMS dependency
-   ✔️ Updated CA bundle

### iOS

-   ⚡ Fixed issue with Arabic alphabet in logs caused by the device’s default system locale
-   ⚡ Passcode check is now periodical
-   ✔️ Updated CA bundle

# freeRASP 6.1.3

### iOS

-   ⚡ Fixed BAD_ACCESS error occurring in specific versions of `cordova-ios` plugin ([#28](https://github.com/talsec/Free-RASP-Cordova/issues/28))

# freeRASP 6.1.2

### Android

-   ❗ Removed the talsec namespace that caused change of namespaces for whole app

### iOS

-   ⚡ Fixed issue causing app crash with lower versions of `cordova-ios` plugin

# freeRASP 6.1.1

### Android

-   ⚡ Updated freeRASP SDK artifact hosting ensuring better stability and availibility

# freeRASP 6.1.0

-   📄 Documentation updates

### Android

-   ⚡ Shortened duration of threat evaluation
-   ⚡ Fixed a native crash bug during one of the native root checks (detected after NDK upgrade)
-   ⚡ Improved _appIntegrity_ check and its logging
-   ⚡ Updated `CURL` to `8.5.0` and `OpenSSL` to `1.1.1w`

### iOS

-   ❗ Added Privacy Manifest
-   ❗ Added codesigning for the SDK, it is signed by:
    -   _Team ID_: `ASQC376HCN`
    -   _Team Name_: `AHEAD iTec, s.r.o.`
-   ⚡ Improved obfuscation of Swift and C strings
-   ⚡ Fixed memory leak ([freeRASP iOS issue #13](https://github.com/talsec/Free-RASP-iOS/issues/13))
-   ⚡ Updated `CURL` to `8.5.0` and `OpenSSL` to `1.1.1w`

# freeRASP 6.0.1

### Android

-   ⚡ Fixed bug that prevented firing callbacks in specific situations

### iOS

-   ⚡ Fixed bug that caused app being killed in specific situations ([#42](https://github.com/talsec/Free-RASP-ReactNative/issues/42))

# freeRASP 6.0.0

-   ❗ **BREAKING API CHANGE**: changed the way how threats are received. Now, it is necessary to pass object with reactions to `talsec.start()` method instead of a function.
-   ⚡ Improved message passing between native iOS/Android and Cordova
-   ✔️ Restricted message passing to valid callbacks only. If an invalid callback is received, the SDK will kill the app
-   ⚡ Improved reaction obfuscation
-   📄 Documentation updates and improvements

### Android

-   ⚡ Fixed ProviderException which could be occassionally triggered

### iOS

-   ❗ Raised supported Xcode version to 14.3.1
-   ⚡ Improved SDK obfuscation

# freeRASP 5.4.0

-   📄 Documentation updates and improvements

### Android

-   ✔️ updated CA bundle for logging pinning
-   ✔️ added error logging of network issues within the logging process
-   ✔️ added retry politics for logging
-   ⚡ fixed issue with DeadObjectException on Android 5 and 6 caused by excessive PackageManager.queryIntentActivities() usage
-   ⚡ improved root detection capabilities

# freeRASP 5.3.0

### Android

-   ✔️ Removed PolarSSL native library from main flow of the application
-   ✔️ Fixed issue with denied USE_BIOMETRICS permission

# freeRASP 5.2.0

### Android

-   ⚡ Added support for AGP 8.0

# freeRASP 5.1.0

### Android

-   ⚡ Fixed issue with incorrect Keystore type detection on Android 11 and above (https://github.com/talsec/Free-RASP-Flutter/issues/77)

### iOS

-   ⚡ Reduced timeout period for logging from 20 sec to 5 sec
-   ⚡ Logging is now async in all calls

# freeRASP 5.0.0

### Android

-   ❗ BREAKING CHANGE: Raised minimum supported Android version to 6.0 (API level 23)
-   ✔️ Removed deprecated BouncyCastle dependency that could cause errors in the build phase
-   ✔️ Fixed issue that could cause NullPointerException
-   🆕 Added new `obfuscationIssues` check, which is triggered when freeRASP doesn't detect any obfuscation of the source code

# freeRASP 4.0.1

### iOS

-   ✔️ Fixed issue with metadata in iOS framework

# freeRASP 4.0.0

## What's new?

Android devices now support device state listeners. What's more, we unified remaining Android and iOS interfaces for more convenient developer's experience.

### Android & iOS

-   ❗ BREAKING API CHANGE: Renamed `device binding` to `deviceBinding` to align it with the camelCase convention. This makes the case consistent with our other checks.

### Android

-   🆕 Android now has support for device state callbacks:
    -   📲 **`Secure Hardware Not Available`**: fires when hardware-backed KeyStore is not available
    -   📲 **`Passcode`**: fires when freeRASP detects that device is not secured with any type of lock

### iOS

-   ❗ BREAKING API CHANGE: Renamed `Missing Secure Enclave` to **`Secure Hardware Not Available`** to match the newly added Android callback. The functionality remains unchanged.
-   ❗️ `PasscodeChange` check has been deprecated

### Other improvements

-   📄 Documentation updates and improvements

# freeRASP 3.0.1

-   📄 Documentation updates and improvements

# freeRASP 3.0.0

## What's new?

Most of the changes relates to accomodating a new way of choosing between the dev and release version of the SDK. Android has also removed the HMS dependencies and improved the root detection capabilities.

### JS/TS interface

-   ❗ Added **isProd** boolean parameter, which now differentiates between the release (true) and dev (false) version of the SDK. By default set to **true**

### Android

-   ❗ Removed the HMS dependencies
-   ❗ Only one version of the SDK is used from now on, instead of two separate for dev and release
-   ❗ The app's build.gradle does not have to be modified now
-   ⚡ Improved root detection accuracy by moving the 'ro.debuggable' property state to an ignored group
-   ⚡ Enhanced root detection capabilities by moving the selinux properties check to device state
-   ⚡ Fine-tuning root evaluation strategy

### iOS

-   ❗ Removed one of the xcframeworks
-   ❗ Removed the dependency on the symlinks choosing the proper version (release/dev)
-   ❗️ Removed pre-built script for changing the Debug and Release versions

### Other improvements

-   📄 Documentation updates and improvements
-   ⚡ Updated demo app for new implementation

# freeRASP 2.0.0

A new round of fixes and improvements! Here's the list of all the new things we included in the latest release.

-   ❗ BREAKING API CHANGE: Added multi-signature support for certificate hashes of Android apps
-   ✔️ Fixed a bug with supportedAlternativeStores ([issue](https://github.com/talsec/Free-RASP-Cordova/issues/3))
-   ✔️ Fixed NPE bug in RootDetector when there are no running processes ([issue](https://github.com/talsec/Free-RASP-Flutter/issues/40)) on Android
-   ✔️ Removed deprecated SafetyNet dependency ([issue](https://github.com/talsec/Free-RASP-Flutter/issues/28)) on Android
-   ✔️ Fixed the ANR issue ([issue](https://github.com/talsec/Free-RASP-Flutter/issues/32)) on Android
-   ✔️ Updated HMS and GMS dependencies on Android
-   🔎 Improved detection of Blue Stacks emulator and Nox emulator ([issue](https://github.com/talsec/Free-RASP-Android/issues/6)) on Android
-   ❗ Improved device binding detection to not trigger for moving the app to a new device on iOS
-   ⚡ Improved hook detection and logging on iOS
-   🔎 Improved logging of non-existing hardware for biometrics on iOS

# freeRASP 1.0.0

-   Initial release of freeRASP.
