export declare const storeExternalId: (externalId: string) => Promise<void>;
export declare const removeExternalId: () => Promise<void>;
/**
 * Android only. Adds the app with the given package name to the malware
 * whitelist.
 */
export declare const addToWhitelist: (packageName: string) => Promise<void>;
/**
 * Android only. Returns the icon of the given app as a base64 encoded PNG.
 */
export declare const getAppIcon: (packageName: string) => Promise<string>;
export declare const blockScreenCapture: (enable: boolean) => Promise<void>;
export declare const isScreenCaptureBlocked: () => Promise<boolean>;
/**
 * Android only. Prevents accessibility services from reading or controlling
 * the app screen.
 */
export declare const blockScreenControl: (enable: boolean) => Promise<void>;
/**
 * Android only. Returns whether screen control is blocked.
 */
export declare const isScreenControlBlocked: () => Promise<boolean>;
/**
 * Android only. Hides overlay windows of other apps over the app screen.
 * Requires Android 12+ and the `HIDE_OVERLAY_WINDOWS` permission.
 *
 * @returns whether the request was applied
 */
export declare const blockOverlayWindows: (enable: boolean) => Promise<boolean>;
/**
 * Android only. Returns whether overlay windows of other apps are hidden.
 */
export declare const isOverlayWindowsBlocked: () => Promise<boolean>;
/**
 * Android only. Starts the ongoing call (cellular and VoIP) detection.
 * Call states are reported through the `ongoingCall` threat action.
 */
export declare const startOngoingCallDetection: () => Promise<void>;
/**
 * Android only. Stops the ongoing call detection.
 */
export declare const stopOngoingCallDetection: () => Promise<void>;
/**
 * Terminates the app, e.g. as a reaction to a detected threat.
 */
export declare const abortApp: () => void;
