import {
  RaspExecutionStateEventActions,
  TalsecConfig,
  ThreatEventActions,
} from '../../types/types';
import { registerThreatListener } from '../listeners/threat';
import { registerRaspExecutionStateListener } from '../listeners/raspExecutionState';
import { onInvalidCallback } from './internal';
import { TalsecError } from '../../types/errors';
import { withDefaults } from '../../utils/config';

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
        reject(
          new TalsecError('talsec-failure', error?.message ?? String(error)),
        );
      },
      'TalsecPlugin',
      'start',
      [withDefaults(config)],
    );
  });
};
