export declare const storeExternalId: (externalId: string) => Promise<boolean>;
export declare const removeExternalId: () => Promise<boolean>;
export declare const addToWhitelist: (packageName: string) => Promise<string>;
export declare const getAppIcon: (packageName: string) => Promise<string>;
export declare const blockScreenCapture: (enable: boolean) => Promise<string>;
export declare const isScreenCaptureBlocked: () => Promise<boolean>;
/**
 * Android only. Prevents accessibility services from reading or controlling
 * the app screen.
 */
export declare const blockScreenControl: (enable: boolean) => Promise<string>;
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
export declare const startOngoingCallDetection: () => Promise<string>;
/**
 * Android only. Stops the ongoing call detection.
 */
export declare const stopOngoingCallDetection: () => Promise<string>;
export declare const onInvalidCallback: () => void;
