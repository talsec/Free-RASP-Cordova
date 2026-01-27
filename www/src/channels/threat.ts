import { onInvalidCallback } from '../api/methods/native';
import { Threat } from '../models/threat';

import { itemsHaveType, getThreatCount } from '../utils/utils';

export const getThreatChannelData = async (): Promise<[string, string]> => {
  const dataLength = cordova.platformId === 'ios' ? 1 : 2;
  const identifiers: [string, string] = await new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, 'TalsecPlugin', 'getThreatChannelData');
  });
  if (
    identifiers.length !== dataLength ||
    !itemsHaveType(identifiers, 'string')
  ) {
    onInvalidCallback();
  }
  return identifiers;
};

export const getThreatIdentifiers = async (): Promise<number[]> => {
  const identifiers: number[] = await new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, 'TalsecPlugin', 'getThreatIdentifiers');
  });
  if (
    identifiers.length !== getThreatCount() ||
    !itemsHaveType(identifiers, 'number')
  ) {
    onInvalidCallback();
  }
  return identifiers;
};

export const prepareMapping = async (): Promise<void> => {
  const newValues = await getThreatIdentifiers();
  const threats = Threat.getValues();
  // eslint-disable-next-line array-callback-return
  threats.map((threat, index) => {
    threat.value = newValues[index]!;
  });
};
