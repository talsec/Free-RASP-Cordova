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

const androidOnly = (feature: string): Promise<never> =>
  Promise.reject(`${feature} not available on iOS`);

/**
 * Android only. Prevents accessibility services from reading or controlling
 * the app screen.
 */
export const blockScreenControl = (enable: boolean): Promise<string> => {
  if (cordova.platformId === 'ios') {
    return androidOnly('Screen control blocking');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, 'TalsecPlugin', 'blockScreenControl', [
      enable,
    ]);
  });
};

/**
 * Android only. Returns whether screen control is blocked.
 */
export const isScreenControlBlocked = (): Promise<boolean> => {
  if (cordova.platformId === 'ios') {
    return androidOnly('Screen control blocking');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, 'TalsecPlugin', 'isScreenControlBlocked', []);
  });
};

/**
 * Android only. Hides overlay windows of other apps over the app screen.
 * Requires Android 12+ and the `HIDE_OVERLAY_WINDOWS` permission.
 *
 * @returns whether the request was applied
 */
export const blockOverlayWindows = (enable: boolean): Promise<boolean> => {
  if (cordova.platformId === 'ios') {
    return androidOnly('Overlay windows blocking');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(resolve, reject, 'TalsecPlugin', 'blockOverlayWindows', [
      enable,
    ]);
  });
};

/**
 * Android only. Returns whether overlay windows of other apps are hidden.
 */
export const isOverlayWindowsBlocked = (): Promise<boolean> => {
  if (cordova.platformId === 'ios') {
    return androidOnly('Overlay windows blocking');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(
      resolve,
      reject,
      'TalsecPlugin',
      'isOverlayWindowsBlocked',
      [],
    );
  });
};

/**
 * Android only. Starts the ongoing call (cellular and VoIP) detection.
 * Call states are reported through the `ongoingCall` threat action.
 */
export const startOngoingCallDetection = (): Promise<string> => {
  if (cordova.platformId === 'ios') {
    return androidOnly('Ongoing call detection');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(
      resolve,
      reject,
      'TalsecPlugin',
      'startOngoingCallDetection',
      [],
    );
  });
};

/**
 * Android only. Stops the ongoing call detection.
 */
export const stopOngoingCallDetection = (): Promise<string> => {
  if (cordova.platformId === 'ios') {
    return androidOnly('Ongoing call detection');
  }
  return new Promise((resolve, reject) => {
    cordova.exec(
      resolve,
      reject,
      'TalsecPlugin',
      'stopOngoingCallDetection',
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
