import { RaspExecutionStateEventActions, TalsecConfig, ThreatEventActions } from './types';
export interface Talsec {
    start: (config: TalsecConfig, eventListenerConfig: ThreatEventActions, raspExecutionStateEventActions: RaspExecutionStateEventActions) => Promise<void>;
    addToWhitelist: (packageName: string) => Promise<string>;
    getAppIcon: (packageName: string) => Promise<string>;
    blockScreenCapture: (enable: boolean) => Promise<string>;
    isScreenCaptureBlocked: () => Promise<boolean>;
    blockScreenControl: (enable: boolean) => Promise<string>;
    isScreenControlBlocked: () => Promise<boolean>;
    blockOverlayWindows: (enable: boolean) => Promise<boolean>;
    isOverlayWindowsBlocked: () => Promise<boolean>;
    startOngoingCallDetection: () => Promise<string>;
    stopOngoingCallDetection: () => Promise<string>;
    storeExternalId: (value: string) => Promise<boolean>;
    removeExternalId: () => Promise<boolean>;
}
