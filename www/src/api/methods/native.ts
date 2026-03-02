import { ScreenCaptureStatus } from '../../models/screenCaptureStatus';

export const storeExternalId = (externalId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    cordova.exec(
      () => {
        resolve(true);
      },
      reject,
      'TalsecPlugin',
      'storeExternalId',
      [externalId],
    );
  });
};

export const removeExternalId = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    cordova.exec(
      () => {
        resolve(true);
      },
      reject,
      'TalsecPlugin',
      'removeExternalId',
      [],
    );
  });
};

export const addToWhitelist = (packageName: string): Promise<string> => {
  if (cordova.platformId === 'ios') {
    return Promise.reject('Malware detection not available on iOS');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, 'TalsecPlugin', 'addToWhitelist', [
      packageName,
    ]);
  });
};

export const getAppIcon = (packageName: string): Promise<string> => {
  if (cordova.platformId === 'ios') {
    return Promise.reject('Malware detection not available on iOS');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, 'TalsecPlugin', 'getAppIcon', [packageName]);
  });
};

export const blockScreenCapture = (enable: boolean): Promise<string> => {
  return new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, 'TalsecPlugin', 'blockScreenCapture', [
      enable,
    ]);
  });
};

export const isScreenCaptureBlocked = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    cordova.exec(
      (result: number) => resolve(result === ScreenCaptureStatus.BLOCKED),
      reject,
      'TalsecPlugin',
      'isScreenCaptureBlocked',
      [],
    );
  });
};

export const onInvalidCallback = () => {
  cordova.exec(
    () => {},
    () => {},
    'TalsecPlugin',
    'onInvalidCallback',
  );
};
