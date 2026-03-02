export declare class Threat {
    value: number;
    static AppIntegrity: Threat;
    static PrivilegedAccess: Threat;
    static Debug: Threat;
    static Hooks: Threat;
    static Passcode: Threat;
    static Simulator: Threat;
    static SecureHardwareNotAvailable: Threat;
    static SystemVPN: Threat;
    static DeviceBinding: Threat;
    static DeviceID: Threat;
    static UnofficialStore: Threat;
    static ObfuscationIssues: Threat;
    static DevMode: Threat;
    static Malware: Threat;
    static ADBEnabled: Threat;
    static Screenshot: Threat;
    static ScreenRecording: Threat;
    static MultiInstance: Threat;
    static TimeSpoofing: Threat;
    static LocationSpoofing: Threat;
    static UnsecureWifi: Threat;
    static Automation: Threat;
    constructor(value: number);
    static getValues(): Threat[];
}
