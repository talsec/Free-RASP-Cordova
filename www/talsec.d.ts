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