/**
 * Codes of [TalsecError], shared with the Flutter plugin's TalsecException.
 */
export type TalsecErrorCode =
  | 'talsec-failure'
  | 'unsupported-platform'
  | 'configuration-exception'
  | 'external-id-failure'
  | 'malware-failure';

/**
 * Error thrown by every freeRASP method.
 */
export class TalsecError extends Error {
  readonly code: TalsecErrorCode;

  constructor(code: TalsecErrorCode, message?: string) {
    super(message);
    this.name = 'TalsecError';
    this.code = code;
    Object.setPrototypeOf(this, TalsecError.prototype);
  }
}
