import { RaspExecutionStateEventActions, ThreatEventActions } from './types';
export interface Talsec {
    start: (config: TalsecConfig, eventListenerConfig: ThreatEventActions, raspExecutionStateEventActions: RaspExecutionStateEventActions) => Promise<void>;
    addToWhitelist: (packageName: string) => Promise<string>;
    getAppIcon: (packageName: string) => Promise<string>;
    blockScreenCapture: (enable: boolean) => Promise<string>;
    isScreenCaptureBlocked: () => Promise<boolean>;
    storeExternalId: (value: string) => Promise<boolean>;
    removeExternalId: () => Promise<boolean>;
}
export type TalsecConfig = {
    androidConfig?: TalsecAndroidConfig;
    iosConfig?: TalsecIosConfig;
    watcherMail: string;
    isProd?: boolean;
    killOnBypass?: boolean;
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
    blacklistedHashes?: string[];
    blacklistedPackageNames?: string[];
    suspiciousPermissions?: string[][];
    whitelistedInstallationSources?: string[];
};
