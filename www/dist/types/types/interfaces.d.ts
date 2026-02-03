import { RaspExecutionStateEventActions, TalsecConfig, ThreatEventActions } from './types';
export interface Talsec {
    start: (config: TalsecConfig, eventListenerConfig: ThreatEventActions, raspExecutionStateEventActions: RaspExecutionStateEventActions) => Promise<void>;
    addToWhitelist: (packageName: string) => Promise<string>;
    getAppIcon: (packageName: string) => Promise<string>;
    blockScreenCapture: (enable: boolean) => Promise<string>;
    isScreenCaptureBlocked: () => Promise<boolean>;
    storeExternalId: (value: string) => Promise<boolean>;
}
