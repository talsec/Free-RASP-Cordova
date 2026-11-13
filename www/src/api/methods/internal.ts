import { TalsecError, TalsecErrorCode } from '../../types/errors';

/**
 * Terminates the app. Called when the native side sends unexpected data.
 * Exposed publicly as `abortApp`.
 */
export const onInvalidCallback = () => {
  cordova.exec(
    () => {},
    () => {},
    'TalsecPlugin',
    'onInvalidCallback',
  );
};

/**
 * Calls a native plugin action and normalizes failures to [TalsecError].
 */
export const execNative = <T = unknown>(
  code: TalsecErrorCode,
  action: string,
  args: unknown[] = [],
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    cordova.exec(
      (result: T) => resolve(result),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error: any) =>
        reject(new TalsecError(code, error?.message ?? String(error))),
      'TalsecPlugin',
      action,
      args,
    );
  });
};

/**
 * Rejects with a [TalsecError] for features that are not available on iOS.
 */
export const rejectOnIos = (feature: string): Promise<never> | undefined => {
  if (cordova.platformId === 'ios') {
    return Promise.reject(
      new TalsecError(
        'unsupported-platform',
        `${feature} is not available on iOS`,
      ),
    );
  }
  return undefined;
};
