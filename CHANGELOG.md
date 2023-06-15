# freeRASP 5.0.0

### Android

-   ❗ BREAKING CHANGE: Raised minimum supported Android version to 6.0 (API level 23)
-   ✔️ Removed deprecated BouncyCastle dependency that could cause errors in the build phase
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
