"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// www/src/talsec.ts
var talsec_exports = {};
__export(talsec_exports, {
  TalsecError: () => TalsecError,
  abortApp: () => abortApp,
  addToWhitelist: () => addToWhitelist,
  blockOverlayWindows: () => blockOverlayWindows,
  blockScreenCapture: () => blockScreenCapture,
  blockScreenControl: () => blockScreenControl,
  getAppIcon: () => getAppIcon,
  isOverlayWindowsBlocked: () => isOverlayWindowsBlocked,
  isScreenCaptureBlocked: () => isScreenCaptureBlocked,
  isScreenControlBlocked: () => isScreenControlBlocked,
  removeExternalId: () => removeExternalId,
  start: () => start,
  startOngoingCallDetection: () => startOngoingCallDetection,
  stopOngoingCallDetection: () => stopOngoingCallDetection,
  storeExternalId: () => storeExternalId
});
module.exports = __toCommonJS(talsec_exports);

// www/src/models/screenCaptureStatus.ts
var ScreenCaptureStatus = {
  ALLOWED: 0,
  BLOCKED: 1
};

// www/src/types/errors.ts
var TalsecError = class _TalsecError extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.name = "TalsecError";
    this.code = code;
    Object.setPrototypeOf(this, _TalsecError.prototype);
  }
};

// www/src/api/methods/internal.ts
var onInvalidCallback = () => {
  cordova.exec(
    () => {
    },
    () => {
    },
    "TalsecPlugin",
    "onInvalidCallback"
  );
};
var execNative = (code, action, args = []) => {
  return new Promise((resolve, reject) => {
    cordova.exec(
      (result) => resolve(result),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error) => reject(new TalsecError(code, error?.message ?? String(error))),
      "TalsecPlugin",
      action,
      args
    );
  });
};
var rejectOnIos = (feature) => {
  if (cordova.platformId === "ios") {
    return Promise.reject(
      new TalsecError(
        "unsupported-platform",
        `${feature} is not available on iOS`
      )
    );
  }
  return void 0;
};

// www/src/api/methods/native.ts
var storeExternalId = async (externalId) => {
  await execNative("external-id-failure", "storeExternalId", [externalId]);
};
var removeExternalId = async () => {
  await execNative("external-id-failure", "removeExternalId");
};
var addToWhitelist = async (packageName) => {
  await (rejectOnIos("Malware detection") ?? execNative("malware-failure", "addToWhitelist", [packageName]));
};
var getAppIcon = (packageName) => {
  return rejectOnIos("Malware detection") ?? execNative("malware-failure", "getAppIcon", [packageName]);
};
var blockScreenCapture = async (enable) => {
  await execNative("talsec-failure", "blockScreenCapture", [enable]);
};
var isScreenCaptureBlocked = async () => {
  const result = await execNative(
    "talsec-failure",
    "isScreenCaptureBlocked"
  );
  return result === ScreenCaptureStatus.BLOCKED;
};
var blockScreenControl = async (enable) => {
  await (rejectOnIos("Screen control blocking") ?? execNative("talsec-failure", "blockScreenControl", [enable]));
};
var isScreenControlBlocked = () => {
  return rejectOnIos("Screen control blocking") ?? execNative("talsec-failure", "isScreenControlBlocked");
};
var blockOverlayWindows = (enable) => {
  return rejectOnIos("Overlay windows blocking") ?? execNative("talsec-failure", "blockOverlayWindows", [enable]);
};
var isOverlayWindowsBlocked = () => {
  return rejectOnIos("Overlay windows blocking") ?? execNative("talsec-failure", "isOverlayWindowsBlocked");
};
var startOngoingCallDetection = async () => {
  await (rejectOnIos("Ongoing call detection") ?? execNative("talsec-failure", "startOngoingCallDetection"));
};
var stopOngoingCallDetection = async () => {
  await (rejectOnIos("Ongoing call detection") ?? execNative("talsec-failure", "stopOngoingCallDetection"));
};
var abortApp = () => {
  onInvalidCallback();
};

// www/src/models/threat.ts
var Threat = class _Threat {
  value;
  static AppIntegrity = new _Threat(0);
  static PrivilegedAccess = new _Threat(0);
  static Debug = new _Threat(0);
  static Hooks = new _Threat(0);
  static Passcode = new _Threat(0);
  static Simulator = new _Threat(0);
  static SecureHardwareNotAvailable = new _Threat(0);
  static SystemVPN = new _Threat(0);
  static DeviceBinding = new _Threat(0);
  static DeviceID = new _Threat(0);
  static UnofficialStore = new _Threat(0);
  static ObfuscationIssues = new _Threat(0);
  static DevMode = new _Threat(0);
  static Malware = new _Threat(0);
  static ADBEnabled = new _Threat(0);
  static Screenshot = new _Threat(0);
  static ScreenRecording = new _Threat(0);
  static MultiInstance = new _Threat(0);
  static TimeSpoofing = new _Threat(0);
  static LocationSpoofing = new _Threat(0);
  static UnsecureWifi = new _Threat(0);
  static Automation = new _Threat(0);
  static Bootloader = new _Threat(0);
  static OngoingCall = new _Threat(0);
  constructor(value) {
    this.value = value;
  }
  static getValues() {
    return cordova.platformId === "android" ? [
      this.AppIntegrity,
      this.PrivilegedAccess,
      this.Debug,
      this.Hooks,
      this.Passcode,
      this.Simulator,
      this.SecureHardwareNotAvailable,
      this.SystemVPN,
      this.DeviceBinding,
      this.UnofficialStore,
      this.ObfuscationIssues,
      this.DevMode,
      this.Malware,
      this.ADBEnabled,
      this.Screenshot,
      this.ScreenRecording,
      this.MultiInstance,
      this.TimeSpoofing,
      this.LocationSpoofing,
      this.UnsecureWifi,
      this.Automation,
      this.Bootloader,
      this.OngoingCall
    ] : [
      this.AppIntegrity,
      this.PrivilegedAccess,
      this.Debug,
      this.Hooks,
      this.Passcode,
      this.Simulator,
      this.SecureHardwareNotAvailable,
      this.SystemVPN,
      this.DeviceBinding,
      this.DeviceID,
      this.UnofficialStore,
      this.Screenshot,
      this.ScreenRecording,
      this.TimeSpoofing
    ];
  }
};

// www/src/models/raspExecutionState.ts
var RaspExecutionState = class _RaspExecutionState {
  value;
  static FastChecksFinished = new _RaspExecutionState(0);
  static CriticalChecksFinished = new _RaspExecutionState(0);
  static PostponedChecksFinished = new _RaspExecutionState(0);
  constructor(value) {
    this.value = value;
  }
  static getValues() {
    return cordova.platformId === "android" ? [
      this.FastChecksFinished,
      this.CriticalChecksFinished,
      this.PostponedChecksFinished
    ] : [this.FastChecksFinished];
  }
};

// www/src/utils/utils.ts
var getThreatCount = () => {
  return Threat.getValues().length;
};
var getRaspExecutionStateCount = () => {
  return RaspExecutionState.getValues().length;
};
var itemsHaveType = (data, desiredType) => {
  return data.every((item) => typeof item === desiredType);
};

// www/src/channels/threat.ts
var getThreatChannelData = async () => {
  const identifiers = await new Promise(
    (resolve, reject) => {
      cordova.exec(resolve, reject, "TalsecPlugin", "getThreatChannelData");
    }
  );
  if (identifiers.length !== 3 || !itemsHaveType(identifiers, "string")) {
    onInvalidCallback();
  }
  return identifiers;
};
var getThreatIdentifiers = async () => {
  const identifiers = await new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, "TalsecPlugin", "getThreatIdentifiers");
  });
  if (identifiers.length !== getThreatCount() || !itemsHaveType(identifiers, "number")) {
    onInvalidCallback();
  }
  return identifiers;
};
var prepareMapping = async () => {
  const newValues = await getThreatIdentifiers();
  const threats = Threat.getValues();
  threats.map((threat, index) => {
    threat.value = newValues[index];
  });
};

// www/src/utils/malware.ts
var parseMalwareData = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(data.map((entry) => toSuspiciousAppInfo(entry)));
    } catch (error) {
      reject(`Error while parsing app data: ${error}`);
    }
  });
};
var toSuspiciousAppInfo = (base64Value) => {
  const data = JSON.parse(atob(base64Value));
  const packageInfo = data.packageInfo;
  return {
    packageInfo,
    reasons: data.reasons,
    permissions: data.permissions
  };
};

// www/src/api/listeners/threat.ts
var registerThreatListener = async (config) => {
  await prepareMapping();
  const [key, malwareKey, callStateKey] = await getThreatChannelData();
  const callStates = ["STARTED", "ONGOING", "STOPPED"];
  const isCallState = (value) => typeof value === "string" && callStates.includes(value);
  const eventListener = async (event) => {
    switch (event[key]) {
      case Threat.PrivilegedAccess.value:
        config.privilegedAccess?.();
        break;
      case Threat.Debug.value:
        config.debug?.();
        break;
      case Threat.Simulator.value:
        config.simulator?.();
        break;
      case Threat.AppIntegrity.value:
        config.appIntegrity?.();
        break;
      case Threat.UnofficialStore.value:
        config.unofficialStore?.();
        break;
      case Threat.Hooks.value:
        config.hooks?.();
        break;
      case Threat.DeviceBinding.value:
        config.deviceBinding?.();
        break;
      case Threat.Passcode.value:
        config.passcode?.();
        break;
      case Threat.SecureHardwareNotAvailable.value:
        config.secureHardwareNotAvailable?.();
        break;
      case Threat.ObfuscationIssues.value:
        config.obfuscationIssues?.();
        break;
      case Threat.DeviceID.value:
        config.deviceID?.();
        break;
      case Threat.DevMode.value:
        config.devMode?.();
        break;
      case Threat.SystemVPN.value:
        config.systemVPN?.();
        break;
      case Threat.Malware.value:
        config.malware?.(await parseMalwareData(event[malwareKey]));
        break;
      case Threat.ADBEnabled.value:
        config.adbEnabled?.();
        break;
      case Threat.Screenshot.value:
        config.screenshot?.();
        break;
      case Threat.ScreenRecording.value:
        config.screenRecording?.();
        break;
      case Threat.MultiInstance.value:
        config.multiInstance?.();
        break;
      case Threat.TimeSpoofing.value:
        config.timeSpoofing?.();
        break;
      case Threat.LocationSpoofing.value:
        config.locationSpoofing?.();
        break;
      case Threat.UnsecureWifi.value:
        config.unsecureWifi?.();
        break;
      case Threat.Automation.value:
        config.automation?.();
        break;
      case Threat.Bootloader.value:
        config.bootloader?.();
        break;
      case Threat.OngoingCall.value: {
        const callState = callStateKey ? event[callStateKey] : void 0;
        if (!isCallState(callState)) {
          onInvalidCallback();
          break;
        }
        config.ongoingCall?.(callState);
        break;
      }
      default:
        onInvalidCallback();
        break;
    }
  };
  cordova.exec(
    eventListener,
    (error) => {
      console.error(`Error during RASP+ events listener attaching: ${error}`);
    },
    "TalsecPlugin",
    "registerListener",
    []
  );
};

// www/src/channels/raspExecutionState.ts
var getRaspExecutionStateIdentifiers = async () => {
  const identifiers = await new Promise((resolve, reject) => {
    cordova.exec(
      resolve,
      reject,
      "TalsecPlugin",
      "getRaspExecutionStateIdentifiers"
    );
  });
  if (identifiers.length !== getRaspExecutionStateCount() || !itemsHaveType(identifiers, "number")) {
    onInvalidCallback();
  }
  return identifiers;
};
var getRaspExecutionStateChannelData = async () => {
  const dataLength = 1;
  const identifiers = await new Promise((resolve, reject) => {
    cordova.exec(
      resolve,
      reject,
      "TalsecPlugin",
      "getRaspExecutionStateChannelData"
    );
  });
  if (identifiers.length !== dataLength || !itemsHaveType(identifiers, "string")) {
    onInvalidCallback();
  }
  return identifiers;
};
var prepareRaspExecutionStateMapping = async () => {
  const newValues = await getRaspExecutionStateIdentifiers();
  const threats = RaspExecutionState.getValues();
  threats.map((threat, index) => {
    threat.value = newValues[index];
  });
};

// www/src/api/listeners/raspExecutionState.ts
var registerRaspExecutionStateListener = async (config) => {
  const [key] = await getRaspExecutionStateChannelData();
  await prepareRaspExecutionStateMapping();
  const eventListener = async (event) => {
    switch (event[key]) {
      case RaspExecutionState.FastChecksFinished.value:
        config.fastChecksFinished?.();
        break;
      case RaspExecutionState.CriticalChecksFinished.value:
        config.criticalChecksFinished?.();
        break;
      case RaspExecutionState.PostponedChecksFinished.value:
        config.postponedChecksFinished?.();
        break;
      default:
        onInvalidCallback();
        break;
    }
  };
  cordova.exec(
    eventListener,
    (error) => {
      console.error(
        `Error during RASP+ execution state listener attaching: ${error}`
      );
    },
    "TalsecPlugin",
    "registerRaspExecutionStateListener",
    []
  );
};

// www/src/utils/config.ts
var DEFAULT_SCAN_SCOPE = {
  scopeType: "SIDELOADED_ONLY"
};
var DEFAULT_REASON_MODE = "HIGHEST_CONFIDENCE";
var withDetectionDefaults = (config) => ({
  ...config,
  scanScope: config.scanScope ?? DEFAULT_SCAN_SCOPE,
  reasonMode: config.reasonMode ?? DEFAULT_REASON_MODE
});
var normalizeAndroidConfig = (androidConfig) => {
  if (!androidConfig.suspiciousAppDetectionConfig) return androidConfig;
  return {
    ...androidConfig,
    suspiciousAppDetectionConfig: withDetectionDefaults(
      androidConfig.suspiciousAppDetectionConfig
    )
  };
};
var withDefaults = (config) => {
  if (!config.androidConfig) return config;
  return {
    ...config,
    androidConfig: normalizeAndroidConfig(config.androidConfig)
  };
};

// www/src/api/methods/cordova.ts
var start = async (config, eventListenerConfig, raspExecutionStateActions) => {
  await registerThreatListener(eventListenerConfig);
  if (raspExecutionStateActions) {
    await registerRaspExecutionStateListener(raspExecutionStateActions);
  }
  return new Promise((resolve, reject) => {
    cordova.exec(
      (message) => {
        if (message != null && message === "started") {
          resolve();
        } else {
          onInvalidCallback();
        }
      },
      (error) => {
        reject(
          new TalsecError("talsec-failure", error?.message ?? String(error))
        );
      },
      "TalsecPlugin",
      "start",
      [withDefaults(config)]
    );
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TalsecError,
  abortApp,
  addToWhitelist,
  blockOverlayWindows,
  blockScreenCapture,
  blockScreenControl,
  getAppIcon,
  isOverlayWindowsBlocked,
  isScreenCaptureBlocked,
  isScreenControlBlocked,
  removeExternalId,
  start,
  startOngoingCallDetection,
  stopOngoingCallDetection,
  storeExternalId
});
