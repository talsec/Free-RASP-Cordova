import { RaspExecutionStateEventActions, TalsecConfig, ThreatEventActions } from './types';
export interface Talsec {
    start: (config: TalsecConfig, eventListenerConfig: ThreatEventActions, raspExecutionStateEventActions: RaspExecutionStateEventActions) => Promise<void>;
    addToWhitelist: (packageName: string) => Promise<void>;
    getAppIcon: (packageName: string) => Promise<string>;
    blockScreenCapture: (enable: boolean) => Promise<void>;
    isScreenCaptureBlocked: () => Promise<boolean>;
    blockScreenControl: (enable: boolean) => Promise<void>;
    isScreenControlBlocked: () => Promise<boolean>;
    blockOverlayWindows: (enable: boolean) => Promise<boolean>;
    isOverlayWindowsBlocked: () => Promise<boolean>;
    startOngoingCallDetection: () => Promise<void>;
    stopOngoingCallDetection: () => Promise<void>;
    storeExternalId: (value: string) => Promise<void>;
    removeExternalId: () => Promise<void>;
    abortApp: () => void;
}
