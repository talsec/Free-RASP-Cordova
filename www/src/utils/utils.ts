import { RaspExecutionState } from '../models/raspExecutionState';
import { Threat } from '../models/threat';

export const getThreatCount = (): number => {
  return Threat.getValues().length;
};

export const getRaspExecutionStateCount = (): number => {
  return RaspExecutionState.getValues().length;
};

export const itemsHaveType = (data: unknown[], desiredType: string) => {
  // eslint-disable-next-line valid-typeof
  return data.every((item) => typeof item === desiredType);
};
