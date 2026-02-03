import { RaspExecutionStateEventActions, TalsecConfig, ThreatEventActions } from '../../types/types';
export declare const start: (config: TalsecConfig, eventListenerConfig: ThreatEventActions, raspExecutionStateActions?: RaspExecutionStateEventActions) => Promise<void>;
