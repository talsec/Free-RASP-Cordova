import {
  RaspExecutionStateEventActions,
  ThreatEventActions,
} from '../../types/types';
import { TalsecConfig } from '../../types/interfaces';
import { registerThreatListener } from '../listeners/threat';
import { registerRaspExecutionStateListener } from '../listeners/raspExecutionState';
import { onInvalidCallback } from './native';

export const start = async (
  config: TalsecConfig,
  eventListenerConfig: ThreatEventActions,
  raspExecutionStateActions?: RaspExecutionStateEventActions,
): Promise<void> => {
  await registerThreatListener(eventListenerConfig);
  if (raspExecutionStateActions) {
    await registerRaspExecutionStateListener(raspExecutionStateActions);
  }

  return new Promise<void>((resolve, reject) => {
    cordova.exec(
      (message: string) => {
        if (message != null && message === 'started') {
          resolve();
        } else {
          onInvalidCallback();
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
