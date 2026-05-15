import { ScreenCaptureStatus } from '../../models/screenCaptureStatus';
import {
  MalwareScanScope,
  ReasonMode,
  SuspiciousAppDetectionConfig,
  TalsecAndroidConfig,
  TalsecConfig,
} from '../../types/types';

const DEFAULT_MALWARE_SCAN_SCOPE: MalwareScanScope = {
  scanScope: 'SIDELOADED_ONLY',
};
const DEFAULT_REASON_MODE: ReasonMode = 'HIGHEST_CONFIDENCE';

const withSuspiciousAppDetectionDefaults = (
  config: SuspiciousAppDetectionConfig,
): SuspiciousAppDetectionConfig => ({
  ...config,
  malwareScanScope: config.malwareScanScope ?? DEFAULT_MALWARE_SCAN_SCOPE,
  reasonMode: config.reasonMode ?? DEFAULT_REASON_MODE,
});

const normalizeAndroidConfig = (
  androidConfig: TalsecAndroidConfig,
): TalsecAndroidConfig => {
  if (!androidConfig.suspiciousAppDetectionConfig) return androidConfig;
  return {
    ...androidConfig,
    suspiciousAppDetectionConfig: withSuspiciousAppDetectionDefaults(
      androidConfig.suspiciousAppDetectionConfig,
    ),
  };
};

export const normalizeConfig = (config: TalsecConfig): TalsecConfig => {
  if (!config.androidConfig) return config;
  return {
    ...config,
    androidConfig: normalizeAndroidConfig(config.androidConfig),
  };
};

export const storeExternalId = (externalId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    cordova.exec(
      () => {
        resolve(true);
      },
      reject,
      'TalsecPlugin',
      'storeExternalId',
      [externalId],
    );
  });
};

export const removeExternalId = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    cordova.exec(
      () => {
        resolve(true);
      },
      reject,
      'TalsecPlugin',
      'removeExternalId',
      [],
    );
  });
};

export const addToWhitelist = (packageName: string): Promise<string> => {
  if (cordova.platformId === 'ios') {
    return Promise.reject('Malware detection not available on iOS');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, 'TalsecPlugin', 'addToWhitelist', [
      packageName,
    ]);
  });
};

export const getAppIcon = (packageName: string): Promise<string> => {
  if (cordova.platformId === 'ios') {
    return Promise.reject('Malware detection not available on iOS');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, 'TalsecPlugin', 'getAppIcon', [packageName]);
  });
};

export const blockScreenCapture = (enable: boolean): Promise<string> => {
  return new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, 'TalsecPlugin', 'blockScreenCapture', [
      enable,
    ]);
  });
};

export const isScreenCaptureBlocked = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    cordova.exec(
      (result: number) => resolve(result === ScreenCaptureStatus.BLOCKED),
      reject,
      'TalsecPlugin',
      'isScreenCaptureBlocked',
      [],
    );
  });
};

export const onInvalidCallback = () => {
  cordova.exec(
    () => {},
    () => {},
    'TalsecPlugin',
    'onInvalidCallback',
  );
};
