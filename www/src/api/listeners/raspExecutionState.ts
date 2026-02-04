import {
  getRaspExecutionStateChannelData,
  prepareRaspExecutionStateMapping,
} from '../../channels/raspExecutionState';
import { RaspExecutionState } from '../../models/raspExecutionState';
import type { RaspExecutionStateEventActions } from '../../types/types';
import { onInvalidCallback } from '../methods/native';

export const registerRaspExecutionStateListener = async (
  config: RaspExecutionStateEventActions,
): Promise<void> => {
  const [key] = await getRaspExecutionStateChannelData();
  await prepareRaspExecutionStateMapping();

  const eventListener = async (event: any) => {
    switch (event[key]) {
      case RaspExecutionState.AllChecksFinished.value:
        config.allChecksFinished?.();
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
