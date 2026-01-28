import { RaspExecutionStateEventActions, ThreatEventActions } from '../../types/types';
import { TalsecConfig } from '../../types/interfaces';
export declare const start: (config: TalsecConfig, eventListenerConfig: ThreatEventActions, raspExecutionStateActions?: RaspExecutionStateEventActions) => Promise<void>;
