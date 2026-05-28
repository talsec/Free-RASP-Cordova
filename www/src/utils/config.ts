import {
  ReasonMode,
  ScanScope,
  SuspiciousAppDetectionConfig,
  TalsecAndroidConfig,
  TalsecConfig,
} from '../types/types';

const DEFAULT_SCAN_SCOPE: ScanScope = {
  scanScope: 'SIDELOADED_ONLY',
};
const DEFAULT_REASON_MODE: ReasonMode = 'HIGHEST_CONFIDENCE';

const withDetectionDefaults = (
  config: SuspiciousAppDetectionConfig,
): SuspiciousAppDetectionConfig => ({
  ...config,
  scanScope: config.scanScope ?? DEFAULT_SCAN_SCOPE,
  reasonMode: config.reasonMode ?? DEFAULT_REASON_MODE,
});

const normalizeAndroidConfig = (
  androidConfig: TalsecAndroidConfig,
): TalsecAndroidConfig => {
  if (!androidConfig.suspiciousAppDetectionConfig) return androidConfig;
  return {
    ...androidConfig,
    suspiciousAppDetectionConfig: withDetectionDefaults(
      androidConfig.suspiciousAppDetectionConfig,
    ),
  };
};

export const withDefaults = (config: TalsecConfig): TalsecConfig => {
  if (!config.androidConfig) return config;
  return {
    ...config,
    androidConfig: normalizeAndroidConfig(config.androidConfig),
  };
};
