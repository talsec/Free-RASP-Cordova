/* global cordova */

declare const cordova: any;

export interface Talsec {
  start: (
    config: TalsecConfig,
    eventListenerConfig: NativeEventEmitterActions,
  ) => Promise<void>;
  addToWhitelist: (packageName: string) => Promise<string>;
}

export type SuspiciousAppInfo = {
  packageInfo: PackageInfo;
  reason: string;
};

export type PackageInfo = {
  packageName: string;
  appName?: string;
  version?: string;
  appIcon?: string;
  installerStore?: string;
};

export type NativeEventEmitterActions = {
  privilegedAccess?: () => any;
  debug?: () => any;
  simulator?: () => any;
  appIntegrity?: () => any;
  unofficialStore?: () => any;
  hooks?: () => any;
  deviceBinding?: () => any;
  deviceID?: () => any;
  passcode?: () => any;
  secureHardwareNotAvailable?: () => any;
  obfuscationIssues?: () => any;
  devMode?: () => any;
  systemVPN?: () => any;
  malware?: (suspiciousApps: SuspiciousAppInfo[]) => any;
};

export type TalsecConfig = {
  androidConfig?: TalsecAndroidConfig;
  iosConfig?: TalsecIosConfig;
  watcherMail: string;
  isProd?: boolean;
};

export type TalsecAndroidConfig = {
  packageName: string;
  certificateHashes: string[];
  supportedAlternativeStores?: string[];
  malwareConfig?: TalsecMalwareConfig;
};

export type TalsecIosConfig = {
  appBundleIds: string;
  appTeamId: string;
};

export type TalsecMalwareConfig = {
  blocklistedHashes?: string[];
  blocklistedPackageNames?: string[];
  blocklistedPermissions?: string[][];
  whitelistedInstallationSources?: string[];
};

class Threat {
  value: number;
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

  constructor(value: number) {
    this.value = value;
  }

  static getValues = (): Threat[] => {
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

const getThreatCount = (): number => {
  return Threat.getValues().length;
};

const getThreatChannelData = async (): Promise<[string, string]> => {
  const dataLength = cordova.platformId === 'ios' ? 1 : 2;
  const data: [string, string] = await new Promise((resolve, reject) => {
    cordova.exec(
      (data: [string, string]) => {
        resolve(data);
      },
      (error: any) => {
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

const itemsHaveType = (data: any[], desidedType: string) => {
  // eslint-disable-next-line valid-typeof
  return data.every((item) => typeof item === desidedType);
};

const getThreatIdentifiers = async (): Promise<number[]> => {
  const identifiers: number[] = await new Promise((resolve, reject) => {
    cordova.exec(
      (data: number[]) => {
        resolve(data);
      },
      (error: any) => {
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

const prepareMapping = async (): Promise<void> => {
  const newValues = await getThreatIdentifiers();
  const threats = Threat.getValues();
  // eslint-disable-next-line array-callback-return
  threats.map((threat, index) => {
    threat.value = newValues[index]!;
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
const parseMalwareData = (data: string[]): SuspiciousAppInfo[] => {
  return data.map((entry) => toSuspiciousAppInfo(entry));
};

const toSuspiciousAppInfo = (base64Value: string): SuspiciousAppInfo => {
  const data = JSON.parse(atob(base64Value));
  const packageInfo = data.packageInfo as PackageInfo;
  return { packageInfo, reason: data.reason } as SuspiciousAppInfo;
};

const start = async (
  config: TalsecConfig,
  eventListenerConfig: NativeEventEmitterActions,
): Promise<void> => {
  await prepareMapping();
  const [key, malwareKey] = await getThreatChannelData();

  const eventListener = (event: any) => {
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

  return new Promise<void>((resolve, reject) => {
    cordova.exec(
      (message: string) => {
        if (message != null && message === 'started') {
          resolve();
        } else {
          eventListener(message);
        }
      },
      (error: any) => {
        console.error(`${error.code}: ${error.message}`);
        reject(error);
      },
      'TalsecPlugin',
      'start',
      [config],
    );
  });
};

const addToWhitelist = (packageName: string): Promise<string> => {
  if (cordova.platformId === 'ios') {
    return Promise.reject('Malware detection not available on iOS');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(
      (response: string) => {
        resolve(response);
      },
      (error: any) => {
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
