import {
  getRaspExecutionStateChannelData,
  prepareRaspExecutionStateMapping,
} from '../../channels/raspExecutionState';
import { RaspExecutionState } from '../../models/raspExecutionState';
import type { RaspExecutionStateEventActions } from '../../types/types';
import { onInvalidCallback } from '../methods/internal';

export const registerRaspExecutionStateListener = async (
  config: RaspExecutionStateEventActions,
): Promise<void> => {
  const [key] = await getRaspExecutionStateChannelData();
  await prepareRaspExecutionStateMapping();

  const eventListener = async (event: any) => {
    switch (event[key]) {
      case RaspExecutionState.FastChecksFinished.value:
        config.fastChecksFinished?.();
        break;
      case RaspExecutionState.CriticalChecksFinished.value:
        config.criticalChecksFinished?.();
        break;
      case RaspExecutionState.PostponedChecksFinished.value:
        config.postponedChecksFinished?.();
        break;
      default:
        onInvalidCallback();
        break;
    }
  };

  cordova.exec(
    eventListener,
    (error: any) => {
      console.error(
        `Error during RASP+ execution state listener attaching: ${error}`,
      );
    },
    'TalsecPlugin',
    'registerRaspExecutionStateListener',
    [],
  );
};
