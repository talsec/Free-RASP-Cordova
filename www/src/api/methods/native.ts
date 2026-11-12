import { ScreenCaptureStatus } from '../../models/screenCaptureStatus';
import { execNative, onInvalidCallback, rejectOnIos } from './internal';

export const storeExternalId = async (externalId: string): Promise<void> => {
  await execNative('external-id-failure', 'storeExternalId', [externalId]);
};

export const removeExternalId = async (): Promise<void> => {
  await execNative('external-id-failure', 'removeExternalId');
};

/**
 * Android only. Adds the app with the given package name to the malware
 * whitelist.
 */
export const addToWhitelist = async (packageName: string): Promise<void> => {
  await (rejectOnIos('Malware detection') ??
    execNative('malware-failure', 'addToWhitelist', [packageName]));
};

/**
 * Android only. Returns the icon of the given app as a base64 encoded PNG.
 */
export const getAppIcon = (packageName: string): Promise<string> => {
  return (
    rejectOnIos('Malware detection') ??
    execNative<string>('malware-failure', 'getAppIcon', [packageName])
  );
};

export const blockScreenCapture = async (enable: boolean): Promise<void> => {
  await execNative('talsec-failure', 'blockScreenCapture', [enable]);
};

export const isScreenCaptureBlocked = async (): Promise<boolean> => {
  const result = await execNative<number>(
    'talsec-failure',
    'isScreenCaptureBlocked',
  );
  return result === ScreenCaptureStatus.BLOCKED;
};

/**
 * Android only. Prevents accessibility services from reading or controlling
 * the app screen.
 */
export const blockScreenControl = async (enable: boolean): Promise<void> => {
  await (rejectOnIos('Screen control blocking') ??
    execNative('talsec-failure', 'blockScreenControl', [enable]));
};

/**
 * Android only. Returns whether screen control is blocked.
 */
export const isScreenControlBlocked = (): Promise<boolean> => {
  return (
    rejectOnIos('Screen control blocking') ??
    execNative<boolean>('talsec-failure', 'isScreenControlBlocked')
  );
};

/**
 * Android only. Hides overlay windows of other apps over the app screen.
 * Requires Android 12+ and the `HIDE_OVERLAY_WINDOWS` permission.
 *
 * @returns whether the request was applied
 */
export const blockOverlayWindows = (enable: boolean): Promise<boolean> => {
  return (
    rejectOnIos('Overlay windows blocking') ??
    execNative<boolean>('talsec-failure', 'blockOverlayWindows', [enable])
  );
};

/**
 * Android only. Returns whether overlay windows of other apps are hidden.
 */
export const isOverlayWindowsBlocked = (): Promise<boolean> => {
  return (
    rejectOnIos('Overlay windows blocking') ??
    execNative<boolean>('talsec-failure', 'isOverlayWindowsBlocked')
  );
};

/**
 * Android only. Starts the ongoing call (cellular and VoIP) detection.
 * Call states are reported through the `ongoingCall` threat action.
 */
export const startOngoingCallDetection = async (): Promise<void> => {
  await (rejectOnIos('Ongoing call detection') ??
    execNative('talsec-failure', 'startOngoingCallDetection'));
};

/**
 * Android only. Stops the ongoing call detection.
 */
export const stopOngoingCallDetection = async (): Promise<void> => {
  await (rejectOnIos('Ongoing call detection') ??
    execNative('talsec-failure', 'stopOngoingCallDetection'));
};

/**
 * Terminates the app, e.g. as a reaction to a detected threat.
 */
export const abortApp = (): void => {
  onInvalidCallback();
};
