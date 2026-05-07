# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [8.4.0] - 2026-05-07

- Android SDK version: 18.3.0
- iOS SDK version: 6.14.4

### Breaking

- `SuspiciousAppInfo.reason` (String) renamed to `reasons` (string[])
- Value `"blacklist"` in `reasons` renamed to `"blocklist"`

### Cordova

#### Deprecated

- `blacklistedPackageNames`, `blacklistedHashes`, `suspiciousPermissions`, `whitelistedInstallationSources` are deprecated but remain functional — use `SuspiciousAppDetectionConfig` instead

### Android

#### Added

- Added a new sub-check for `HMA` detection to the root detector
- Added a new sub-check for `KernelSU` detection to the root detector
- Added a new sub-check for `Frida Server` detection to the hook detector
- Added Huawei App Market provider to HMA detection queries
- New API class `SuspiciousAppDetectionConfig` that can be used to configure malware detection
- New API for malware detection configuration in `TalsecConfig`, see `TalsecConfig.Builder#suspiciousAppDetection`

#### Fixed

- Fixed `VerifyError` caused by `JaCoCo` bytecode instrumentation
- Fixed a potential cause of crash in the multi-instance detector
- Fixed crash caused by unhandled `SecurityException` thrown by `UsageStatsManager` in root detection
- Fixed manifest merge conflicts in HMA detection providers
- Fixed Java interoperability of `ScreenProtector` methods
- Fixed Kotlin classpath conflicts in SDK dependency resolution (Kotlin 2.0.0)

#### Changed

- Fine-tuned `KernelSU` detection
- Fine-tuned hook detection
- Fine-tuned location spoofing detection
- Modified malware incident log structure for better aggregation
- Old malware configuration API methods in `TalsecConfig.Builder` tagged as deprecated (but remain functional): `blacklistedPackageNames`, `blacklistedHashes`, `suspiciousPermissions`, `whitelistedInstallationSources`

## [8.3.1] - 2026-03-24

- Android SDK version: 18.0.4
- iOS SDK version: 6.14.4

### Cordova

#### Fixed

- Fixed case where event dispatchers on Android were not initialized before calling onResume at the app launch

### iOS

#### Fixed

- Fixed new jailbreak checks false positives on iOS 14 and 13.
- Fixed false positives with jailbreak on iOS 15 and 16.
- Fixed issue with app crashing on screenshot/screen recording.
- Fixed retrigger jailbreak issue on iOS 15 and 16.

## [8.3.0] - 2026-02-23

- Android SDK version: 18.0.4
- iOS SDK version: 6.14.1

### Cordova

#### Added

- Added cache for freeRASP callbacks when listener is not registered with the app
- Added API for `automation` callback into `ThreatEventActions` (Android only)

#### Fixed

- Prevent multiple registration of the freeRASP listeners on the native side

#### Changed

- Updated compile and target SDK versions to 36 on Android
- Higher compileSdk from [rootProject, plugin] is now used in build.gradle on Android

### Android

#### Added

- Added new detection check for KernelSU
- Added support for `KernelSU` to the existing root detection capabilities
- Added support for `HMA` to the existing root detection capabilities
- Added new malware detection capabilities
- Added `onAutomationDetected()` callback to `ThreatDetected` interface
  - We are introducing a new capability, detecting whether the device is being automated using tools like Appium
- Added value restrictions to `externalId`
  - Method `storeExternalId()` now returns `ExternalIdResult`, which indicates `Success` or `Error` when `externalId` violates restrictions

#### Fixed

- Fixed memory management issues in the native code
- Patched possibility of `getInstalledPackages` throwing `DeadSystemException`
- Patched possibility of `getNetworkCapabilities` throwing `SecurityException`
- Fixed well-known issue of `Cipher.init` throwing `KeyStoreConnectException`
- Fixed exception handling for the KeyStore `getEntry` operation
- Fixed issue in `ScreenProtector` concerning the `onScreenRecordingDetected` invocations
- Merged internal shared libraries into a single one, reducing the final APK size
- Fixed bug related to key storing in keystore type detection (hw-backed keystore check)
- Fixed manifest queries merge

#### Changed

- Removed unused library `tmlib`
- Refactoring of signature verification code
- Updated compile and target API to 36
- Improved root detection capabilities
- Detection of wireless ADB added to ADB detections

#### Removed

- Removed deprecated `monitoring` feature

### iOS

#### Added

- Added time spoofing detection, detecting an inaccurate device clock. It is a new threat `timeSpoofing`.

#### Changed

- Improved jailbreak detection methods

## [8.2.0] - 2025-02-03

- Android SDK version: 17.0.1
- iOS SDK version: 6.13.0

### Cordova

#### Added

- Added `killOnBypass` to `TalsecConfig` that configures if the app should be terminated when the threat callbacks are suppressed/hooked by an attacker (Android only) ([Issue 65](https://github.com/talsec/Free-RASP-Android/issues/65))
- Added API for `timeSpoofing` callback into `ThreatEventActions` (Android only)
- Added API for `unsecureWifi` callback into `ThreatEventActions` (Android only)
- Added API for `allChecksFinished` callback into new `RaspExecutionStateEventActions` object
- Added matched permissions to `SuspiciousAppInfo` object when malware detection reason is `suspiciousPermission`

#### Changed

- Changed deprecated initialize for pluginInitialize on Android
- Improved the RASP listener registration

#### Fixed

- Resolved potential collision in threat identifiers

### Android

#### Added

- Added `killOnBypass` method to the `TalsecConfig.Builder` that configures if the app should be terminated when the threat callbacks are suppressed/hooked by an attacker [Issue 65](https://github.com/talsec/Free-RASP-Android/issues/65)
- We are introducing a new capability, detecting whether the device time has been tampered with (`timeSpoofing`)
- We are introducing a new capability, detecting whether the location is being spoofed on the device (`locationSpoofing`)
- We are introducing a new capability, detection of unsecure WiFi (`unecureWifi`)
- Removed deprecated functionality `Pbkdf2Native` and both related native libraries (`libpbkdf2_native.so` and `libpolarssl.so`)
- Added new `RaspExecutionState` which contains `onAllChecksFinished()` method, which is triggered after all checks are completed.
- Added matched permissions to `SuspiciousAppInfo` object when malware detection reason is `suspiciousPermission`
- New option to start Talsec, `Talsec.start()` takes new parameter `TalsecMode` that determines the dispatcher thread of initialization and sync checks (uses background thread by default)
- Capability to check if another app has an option `REQUEST_INSTALL_PACKAGES` enabled in the system settings to malware detection

#### Fixed

- ANR issue caused by `registerScreenCaptureCallback()` method on the main thread
- `NullPointerException` when checking key alias in Keystore on Android 7
- `JaCoCo` issue causing `MethodTooLargeException` during instrumentation
- `DeadApplicationException` when calling `Settings.Global.getInt` or `Settings.Secure.getInt` on invalid context
- `AndroidKeyStore` crashes causing `java.util.concurrent.TimeoutException` when calling `finalize()` method on `Cipher` (GC issues)
- Fixed issue with late initializers and `TalsecMode` coroutines scopes

#### Changed

- Shortened the value of threat detection interval
- Refactoring of internal architecture of SDK that newly uses Coroutines to manage threading
- Update of internal dependencies and security libraries

### iOS

#### Changed

- Updated internal dependencies

## [8.1.1] - 2025-08-05

### Android

#### Fixed

- Issue with empty `SharedPreferences` files

#### Changed

- Decreased version of `Kotlin` to `2.0.0`

## [8.1.0] - 2025-07-16

- iOS SDK version: 6.12.1
- Android SDK version: 16.0.1

### Cordova

#### Fixed

- Fixed error on iOS with unsafe call

### Android

#### Added

- Added support for 16 KB memory page sizes
- Added `multiInstance` callback
  - Detecting whether the application is installed/running in various multi-instancing environments (e.g. Parallel Space)

#### Changed

- The ADB service running as a root is a signal for root detection
- Improved emulator detection
- Internal security improvements

#### Fixed

- Removed malware report duplicates

### iOS

#### Added

- Added palera1n jailbreak detection

#### Changed

- Improved Dopamine jailbreak detection

#### Fixed

- Resolved memory-related stability issues.

## [8.0.0] - 2025-05-19

- iOS SDK version: 6.11.0
- Android SDK version: 15.1.0

### Cordova

#### Added

- Added interface for screenshot / screen recording blocking on iOS
- Added interface for external ID storage

#### Changed

- Plugin now requires kotlin version >= 2.0.0

### Android

#### Added

- Added externalId to put an integrator-specified custom identifier into the logs.
- Added eventId to the logs, which is unique per each log. It allows traceability of the same log across various systems.

#### Changed

- New root detection checks added

### iOS

#### Added

- Added externalId to put an integrator-specified custom identifier into the logs.
- Added eventId to the logs, which is unique per each log. It allows traceability of the same log across various systems.
- Screen capture protection obscuring app content in screenshots and screen recordings preventing unauthorized content capture. Refer to the freeRASP integration documentation.

#### Fixed

- Resolved an issue with the screen recording detection.
- Resolved an issue that prevented Xcode tests from running correctly.

## [7.4.1] - 2024-03-25

- iOS SDK version: 6.9.0
- Android SDK version: 15.0.0

### Android

#### Changed

- Compile API increased to 35, dependencies updated
- Internal library obfuscation reworked
- Root detection divided into 2 parts (quick initial checks, and time-demanding asynchronous post checks)

#### Fixed

- ANR issues bug-fixing

### iOS

#### Added

- Improvement of the obfuscation of the SDK.

#### Changed

- Deep signing of the OpenSSL binaries.

## [7.4.0] - 2025-03-05

- iOS SDK version: 6.8.0
- Android SDK version: 14.0.1

### Cordova

#### Added

- Introduced `blockScreenCapture(boolean enable)` method to block/unblock screen capture.
- Introduced `isScreenCaptureBlocked()` method to get the current screen capture blocking status.
- New callbacks:
  - `screenshot`: Detects when a screenshot is taken
  - `screenRecording`: Detects when screen recording is active

#### Changed

- Set following required SDK versions for Android plugin:
  - targetSdkVersion to 35
  - compileSdkVersion to 35

### Android

#### Added

- Passive and active screenshot/screen recording protection

#### Changed

- Improved root detection

#### Fixed

- Proguard rules to address warnings from okhttp dependency

### iOS

### Added

- Passive Screenshot/Screen Recording protection

## [7.3.0] - 2024-12-29

- iOS SDK version: 6.6.3
- Android SDK version: 13.2.0

### Android

#### Added

- Added request integrity information to data collection headers.
- Enhanced and accelerated the data collection logic.

## [7.2.0] - 2024-12-06

- iOS SDK version: 6.6.3
- Android SDK version: 13.0.0

### Cordova

#### Changed

- App icons for detected malware are not fetched automatically anymore, which reduces computation required to retrieve malware data. From now on, app icons have to be retrieved using the `getAppIcon` method
- Parsing of malware data is now async

### Android

#### Changed

- Malware data is now parsed on background thread to improve responsiveness

## [7.1.0] - 2024-11-19

### Cordova

#### Added

- Added `adbEnabled` callback, which allows you to detect USB debugging option enabled in the developer settings on the device

### Android

#### Added

- ADB detection feature

## [7.0.1] - 2024-11-18

- Android SDK version: 12.0.0
- iOS SDK version: 6.6.3

### Cordova

#### Fixed

- Removed conflicting export on npmjs

## [7.0.0] - 2024-11-15

- Android SDK version: 12.0.0
- iOS SDK version: 6.6.3

### Cordova

#### Added

- **BREAKING CHANGE:** New dependency is required to run freeRASP; add following plugin to `android/build.gradle`:

```gradle
plugins{
    id 'org.jetbrains.kotlin.plugin.serialization' version '1.7.10'
}
```

- Added configuration fields for malware detection

### Android

#### Added

- New feature: **malware detection** as a new callback for enhanced app security

#### Fixed

- Refactoring Magisk checks in the root detection
- Resolving IllegalArgumentException caused by unregistering not registered receiver in TalsecMonitoringReceiver

### iOS

#### Added

- Enhanced security with **[Serotonin Jailbreak](https://github.com/SerotoninApp/Serotonin) Detection** to identify compromised devices.

#### Changed

- Updated SDK code signing; it will now be signed with:
  - Team ID: PBDDS45LQS
  - Team Name: Lynx SFT s.r.o.

## [6.3.3] - 2024-10-28

- Android SDK version: 11.1.3
- iOS SDK version: 6.6.1

### iOS

#### Changed

- Renewed the signing certificate

## [6.3.2] - 2024-10-18

- Android SDK version: 11.1.3
- iOS SDK version: 6.6.0

### Android

#### Fixed

- Reported ANR issues present on some devices were resolved ([GH Flutter issue #138](https://github.com/talsec/Free-RASP-Flutter/issues/138))
- Reported crashes caused by ConcurrentModificationException and NullPointerException were resolved ([GH Flutter issue #140](https://github.com/talsec/Free-RASP-Flutter/issues/140))
- Reported crashes caused by the UnsupportedOperationException were resolved

## [6.3.1] - 2024-09-30

- Android SDK version: 11.1.1
- iOS SDK version: 6.6.0

### Android

#### Fixed

- False positives for hook detection

## [6.3.0] - 2024-09-25

- Android SDK version: 11.1.0
- iOS SDK version: 6.6.0

### Cordova

#### Changed

- Improved error messages when validation of the freeRASP configuration fails

### Android

#### Added

- Added the auditing of the internal execution for the future check optimization and overall security improvements.

#### Fixed

- Fixed native crashes (SEGFAULT errors) in `ifpip` method
- Fixed collision for command line tools (like ping) invoked without absolute path

#### Changed

- ❗️Breaking: Changed the way TalsecConfig is created, we introduced a Builder pattern to make the process more streamlined and readable
- Updated OpenSSL to version 3.0.14
- Updated CURL to version 8.8.0
- Refactored fetching the list of installed applications for root and hook detection.

### iOS

#### Added

- [Dopamine](https://github.com/opa334/Dopamine) jailbreak detection.
- Enhanced and accelerated the data collection logic

#### Changed

- Updated OpenSSL to version 3.0.14
- Updated CURL to version 8.8.0

## [6.2.1] - 2024-07-02

### Cordova

#### Changed

- CHANGELOG now adheres to the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## [6.2.0] - 2024-05-31

# freeRASP 6.2.0

- ⚡ Added new threat `systemVPN` for VPN detection
- 📄 Documentation updates

### Android

- ⚡ Added new threat `devMode` for Developer mode detection
- ⚡ Fixed proguard warning in specific versions of RN
- ⚡ Fixed issue with Arabic alphabet in logs caused by the device’s default system locale
- ✔️ Increased the version of the GMS dependency
- ✔️ Updated CA bundle

### iOS

- ⚡ Fixed issue with Arabic alphabet in logs caused by the device’s default system locale
- ⚡ Passcode check is now periodical
- ✔️ Updated CA bundle

# freeRASP 6.1.3

### iOS

- ⚡ Fixed BAD_ACCESS error occurring in specific versions of `cordova-ios` plugin ([#28](https://github.com/talsec/Free-RASP-Cordova/issues/28))

# freeRASP 6.1.2

### Android

- ❗ Removed the talsec namespace that caused change of namespaces for whole app

### iOS

- ⚡ Fixed issue causing app crash with lower versions of `cordova-ios` plugin

# freeRASP 6.1.1

### Android

- ⚡ Updated freeRASP SDK artifact hosting ensuring better stability and availibility

# freeRASP 6.1.0

- 📄 Documentation updates

### Android

- ⚡ Shortened duration of threat evaluation
- ⚡ Fixed a native crash bug during one of the native root checks (detected after NDK upgrade)
- ⚡ Improved _appIntegrity_ check and its logging
- ⚡ Updated `CURL` to `8.5.0` and `OpenSSL` to `1.1.1w`

### iOS

- ❗ Added Privacy Manifest
- ❗ Added codesigning for the SDK, it is signed by:
  - _Team ID_: `ASQC376HCN`
  - _Team Name_: `AHEAD iTec, s.r.o.`
- ⚡ Improved obfuscation of Swift and C strings
- ⚡ Fixed memory leak ([freeRASP iOS issue #13](https://github.com/talsec/Free-RASP-iOS/issues/13))
- ⚡ Updated `CURL` to `8.5.0` and `OpenSSL` to `1.1.1w`

# freeRASP 6.0.1

### Android

- ⚡ Fixed bug that prevented firing callbacks in specific situations

### iOS

- ⚡ Fixed bug that caused app being killed in specific situations ([#42](https://github.com/talsec/Free-RASP-ReactNative/issues/42))

# freeRASP 6.0.0

- ❗ **BREAKING API CHANGE**: changed the way how threats are received. Now, it is necessary to pass object with reactions to `talsec.start()` method instead of a function.
- ⚡ Improved message passing between native iOS/Android and Cordova
- ✔️ Restricted message passing to valid callbacks only. If an invalid callback is received, the SDK will kill the app
- ⚡ Improved reaction obfuscation
- 📄 Documentation updates and improvements

### Android

- ⚡ Fixed ProviderException which could be occassionally triggered

### iOS

- ❗ Raised supported Xcode version to 14.3.1
- ⚡ Improved SDK obfuscation

# freeRASP 5.4.0

- 📄 Documentation updates and improvements

### Android

- ✔️ updated CA bundle for logging pinning
- ✔️ added error logging of network issues within the logging process
- ✔️ added retry politics for logging
- ⚡ fixed issue with DeadObjectException on Android 5 and 6 caused by excessive PackageManager.queryIntentActivities() usage
- ⚡ improved root detection capabilities

# freeRASP 5.3.0

### Android

- ✔️ Removed PolarSSL native library from main flow of the application
- ✔️ Fixed issue with denied USE_BIOMETRICS permission

# freeRASP 5.2.0

### Android

- ⚡ Added support for AGP 8.0

# freeRASP 5.1.0

### Android

- ⚡ Fixed issue with incorrect Keystore type detection on Android 11 and above (https://github.com/talsec/Free-RASP-Flutter/issues/77)

### iOS

- ⚡ Reduced timeout period for logging from 20 sec to 5 sec
- ⚡ Logging is now async in all calls

# freeRASP 5.0.0

### Android

- ❗ BREAKING CHANGE: Raised minimum supported Android version to 6.0 (API level 23)
- ✔️ Removed deprecated BouncyCastle dependency that could cause errors in the build phase
- ✔️ Fixed issue that could cause NullPointerException
- 🆕 Added new `obfuscationIssues` check, which is triggered when freeRASP doesn't detect any obfuscation of the source code

# freeRASP 4.0.1

### iOS

- ✔️ Fixed issue with metadata in iOS framework

# freeRASP 4.0.0

## What's new?

Android devices now support device state listeners. What's more, we unified remaining Android and iOS interfaces for more convenient developer's experience.

### Android & iOS

- ❗ BREAKING API CHANGE: Renamed `device binding` to `deviceBinding` to align it with the camelCase convention. This makes the case consistent with our other checks.

### Android

- 🆕 Android now has support for device state callbacks:
  - 📲 **`Secure Hardware Not Available`**: fires when hardware-backed KeyStore is not available
  - 📲 **`Passcode`**: fires when freeRASP detects that device is not secured with any type of lock

### iOS

- ❗ BREAKING API CHANGE: Renamed `Missing Secure Enclave` to **`Secure Hardware Not Available`** to match the newly added Android callback. The functionality remains unchanged.
- ❗️ `PasscodeChange` check has been deprecated

### Other improvements

- 📄 Documentation updates and improvements

# freeRASP 3.0.1

- 📄 Documentation updates and improvements

# freeRASP 3.0.0

## What's new?

Most of the changes relates to accomodating a new way of choosing between the dev and release version of the SDK. Android has also removed the HMS dependencies and improved the root detection capabilities.

### JS/TS interface

- ❗ Added **isProd** boolean parameter, which now differentiates between the release (true) and dev (false) version of the SDK. By default set to **true**

### Android

- ❗ Removed the HMS dependencies
- ❗ Only one version of the SDK is used from now on, instead of two separate for dev and release
- ❗ The app's build.gradle does not have to be modified now
- ⚡ Improved root detection accuracy by moving the 'ro.debuggable' property state to an ignored group
- ⚡ Enhanced root detection capabilities by moving the selinux properties check to device state
- ⚡ Fine-tuning root evaluation strategy

### iOS

- ❗ Removed one of the xcframeworks
- ❗ Removed the dependency on the symlinks choosing the proper version (release/dev)
- ❗️ Removed pre-built script for changing the Debug and Release versions

### Other improvements

- 📄 Documentation updates and improvements
- ⚡ Updated demo app for new implementation

# freeRASP 2.0.0

A new round of fixes and improvements! Here's the list of all the new things we included in the latest release.

- ❗ BREAKING API CHANGE: Added multi-signature support for certificate hashes of Android apps
- ✔️ Fixed a bug with supportedAlternativeStores ([issue](https://github.com/talsec/Free-RASP-Cordova/issues/3))
- ✔️ Fixed NPE bug in RootDetector when there are no running processes ([issue](https://github.com/talsec/Free-RASP-Flutter/issues/40)) on Android
- ✔️ Removed deprecated SafetyNet dependency ([issue](https://github.com/talsec/Free-RASP-Flutter/issues/28)) on Android
- ✔️ Fixed the ANR issue ([issue](https://github.com/talsec/Free-RASP-Flutter/issues/32)) on Android
- ✔️ Updated HMS and GMS dependencies on Android
- 🔎 Improved detection of Blue Stacks emulator and Nox emulator ([issue](https://github.com/talsec/Free-RASP-Android/issues/6)) on Android
- ❗ Improved device binding detection to not trigger for moving the app to a new device on iOS
- ⚡ Improved hook detection and logging on iOS
- 🔎 Improved logging of non-existing hardware for biometrics on iOS

# freeRASP 1.0.0

- Initial release of freeRASP.
