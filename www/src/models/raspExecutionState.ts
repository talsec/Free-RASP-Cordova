export class RaspExecutionState {
  value: number;

  static AllChecksFinished = new RaspExecutionState(0);
  static CriticalChecksFinished = new RaspExecutionState(0);
  static PostponedChecksFinished = new RaspExecutionState(0);

  constructor(value: number) {
    this.value = value;
  }

  static getValues(): RaspExecutionState[] {
    return cordova.platformId === 'android'
      ? [
          this.AllChecksFinished,
          this.CriticalChecksFinished,
          this.PostponedChecksFinished,
        ]
      : [this.AllChecksFinished];
  }
}
