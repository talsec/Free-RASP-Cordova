/* global cordova */
class Threat {
  value;
  static AppIntegrity = new Threat(0);
  static PrivilegedAccess = new Threat(0);
  static Debug = new Threat(0);
  static Hooks = new Threat(0);
  static Passcode = new Threat(0);
  static Simulator = new Threat(0);
  static SecureHardwareNotAvailable = new Threat(0);
  static SystemVPN = new Threat(0);
  static DeviceBinding = new Threat(0);
  static DeviceID = new Threat(0);
  static UnofficialStore = new Threat(0);
  static ObfuscationIssues = new Threat(0);
  static DevMode = new Threat(0);
  static Malware = new Threat(0);
  constructor(value) {
    this.value = value;
  }
  static getValues = () => {
    return cordova.platformId === 'android'
      ? [
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
        ]
      : [
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
        ];
  };
}
const getThreatCount = () => {
  return Threat.getValues().length;
};
const getThreatChannelData = async () => {
  const dataLength = cordova.platformId === 'ios' ? 1 : 2;
  const data = await new Promise((resolve, reject) => {
    cordova.exec(
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      },
      'TalsecPlugin',
      'getThreatChannelData',
    );
  });
  if (data.length !== dataLength || !itemsHaveType(data, 'string')) {
    onInvalidCallback();
  }
  return data;
};
const itemsHaveType = (data, desidedType) => {
  // eslint-disable-next-line valid-typeof
  return data.every((item) => typeof item === desidedType);
};
const getThreatIdentifiers = async () => {
  const identifiers = await new Promise((resolve, reject) => {
    cordova.exec(
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      },
      'TalsecPlugin',
      'getThreatIdentifiers',
    );
  });
  if (
    identifiers.length !== getThreatCount() ||
    !itemsHaveType(identifiers, 'number')
  ) {
    onInvalidCallback();
  }
  return identifiers;
};
const prepareMapping = async () => {
  const newValues = await getThreatIdentifiers();
  const threats = Threat.getValues();
  // eslint-disable-next-line array-callback-return
  threats.map((threat, index) => {
    threat.value = newValues[index];
  });
};
const onInvalidCallback = () => {
  cordova.exec(
    () => {},
    () => {},
    'TalsecPlugin',
    'onInvalidCallback',
  );
};
// parses base64-encoded malware data to SuspiciousAppInfo[]
const parseMalwareData = (data) => {
  return data.map((entry) => toSuspiciousAppInfo(entry));
};
const toSuspiciousAppInfo = (base64Value) => {
  const data = JSON.parse(atob(base64Value));
  const packageInfo = data.packageInfo;
  return { packageInfo, reason: data.reason };
};
const start = async (config, eventListenerConfig) => {
  await prepareMapping();
  const [key, malwareKey] = await getThreatChannelData();
  const eventListener = (event) => {
    switch (event[key]) {
      case Threat.PrivilegedAccess.value:
        eventListenerConfig.privilegedAccess?.();
        break;
      case Threat.Debug.value:
        eventListenerConfig.debug?.();
        break;
      case Threat.Simulator.value:
        eventListenerConfig.simulator?.();
        break;
      case Threat.AppIntegrity.value:
        eventListenerConfig.appIntegrity?.();
        break;
      case Threat.UnofficialStore.value:
        eventListenerConfig.unofficialStore?.();
        break;
      case Threat.Hooks.value:
        eventListenerConfig.hooks?.();
        break;
      case Threat.DeviceBinding.value:
        eventListenerConfig.deviceBinding?.();
        break;
      case Threat.Passcode.value:
        eventListenerConfig.passcode?.();
        break;
      case Threat.SecureHardwareNotAvailable.value:
        eventListenerConfig.secureHardwareNotAvailable?.();
        break;
      case Threat.ObfuscationIssues.value:
        eventListenerConfig.obfuscationIssues?.();
        break;
      case Threat.DeviceID.value:
        eventListenerConfig.deviceID?.();
        break;
      case Threat.DevMode.value:
        eventListenerConfig.devMode?.();
        break;
      case Threat.SystemVPN.value:
        eventListenerConfig.systemVPN?.();
        break;
      case Threat.Malware.value:
        eventListenerConfig.malware?.(parseMalwareData(event[malwareKey]));
        break;
      default:
        onInvalidCallback();
        break;
    }
  };
  return new Promise((resolve, reject) => {
    cordova.exec(
      (message) => {
        if (message != null && message === 'started') {
          resolve();
        } else {
          eventListener(message);
        }
      },
      (error) => {
        console.error(`${error.code}: ${error.message}`);
        reject(error);
      },
      'TalsecPlugin',
      'start',
      [config],
    );
  });
};
const addToWhitelist = (packageName) => {
  if (cordova.platformId === 'ios') {
    return Promise.reject('Malware detection not available on iOS');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(
      (response) => {
        resolve(response);
      },
      (error) => {
        reject(error);
      },
      'TalsecPlugin',
      'addToWhitelist',
      [packageName],
    );
  });
};
// @ts-ignore
module.exports = {
  start,
  addToWhitelist,
};
