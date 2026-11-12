import { TalsecErrorCode } from '../../types/errors';
/**
 * Terminates the app. Called when the native side sends unexpected data.
 * Exposed publicly as `abortApp`.
 */
export declare const onInvalidCallback: () => void;
/**
 * Calls a native plugin action and normalizes failures to [TalsecError].
 */
export declare const execNative: <T = unknown>(code: TalsecErrorCode, action: string, args?: unknown[]) => Promise<T>;
/**
 * Rejects with a [TalsecError] for features that are not available on iOS.
 */
export declare const rejectOnIos: (feature: string) => Promise<never> | undefined;
