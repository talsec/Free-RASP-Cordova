export declare class RaspExecutionState {
    value: number;
    static FastChecksFinished: RaspExecutionState;
    static CriticalChecksFinished: RaspExecutionState;
    static PostponedChecksFinished: RaspExecutionState;
    constructor(value: number);
    static getValues(): RaspExecutionState[];
}
