import { onInvalidCallback } from '../api/methods/native';
import { RaspExecutionState } from '../models/raspExecutionState';
import { getRaspExecutionStateCount, itemsHaveType } from '../utils/utils';

export const getRaspExecutionStateIdentifiers = async (): Promise<number[]> => {
  const identifiers: number[] = await new Promise((resolve, reject) => {
    cordova.exec(
      resolve,
      reject,
      'TalsecPlugin',
      'getRaspExecutionStateIdentifiers',
    );
  });
  if (
    identifiers.length !== getRaspExecutionStateCount() ||
    !itemsHaveType(identifiers, 'number')
  ) {
    onInvalidCallback();
  }
  return identifiers;
};

export const getRaspExecutionStateChannelData = async (): Promise<[string]> => {
  const dataLength = 1;
  const identifiers: [string] = await new Promise((resolve, reject) => {
    cordova.exec(
      resolve,
      reject,
      'TalsecPlugin',
      'getRaspExecutionStateChannelData',
    );
  });
  if (
    identifiers.length !== dataLength ||
    !itemsHaveType(identifiers, 'string')
  ) {
    onInvalidCallback();
  }
  return identifiers;
};

export const prepareRaspExecutionStateMapping = async (): Promise<void> => {
  const newValues = await getRaspExecutionStateIdentifiers();
  const threats = RaspExecutionState.getValues();
  threats.map((threat, index) => {
    threat.value = newValues[index]!;
  });
};
