export declare class RaspExecutionState {
    value: number;
    static AllChecksFinished: RaspExecutionState;
    static CriticalChecksFinished: RaspExecutionState;
    static PostponedChecksFinished: RaspExecutionState;
    constructor(value: number);
    static getValues(): RaspExecutionState[];
}
