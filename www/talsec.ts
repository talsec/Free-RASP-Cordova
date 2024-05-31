/* global cordova */

type NativeEventEmitterActions = {
    privilegedAccess?: () => any;
    debug?: () => any;
    simulator?: () => any;
    appIntegrity?: () => any;
    unofficialStore?: () => any;
    hooks?: () => any;
    deviceBinding?: () => any;
    deviceID?: () => any;
    passcode?: () => any;
    secureHardwareNotAvailable?: () => any;
    obfuscationIssues?: () => any;
    devMode?: () => any;
    systemVPN?: () => any;
};

type TalsecConfig = {
    androidConfig?: {
        packageName: string;
        certificateHashes: string[];
        supportedAlternativeStores?: string[];
    };
    iosConfig?: {
        appBundleId: string;
        appTeamId: string;
    };
    watcherMail: string;
    isProd?: boolean;
};

class Threat {
    value: number;
    static AppIntegrity = new Threat(0);
    static PrivilegedAccess = new Threat(0);
    static Debug = new Threat(0);
    static Hooks = new Threat(0);
    static Passcode = new Threat(0);
    static Simulator = new Threat(0);
    static SecureHardwareNotAvailable = new Threat(0);
    static SystemVPN = new Threat(0);
    static DeviceBinding = new Threat(0);
    static DeviceID = new Threat(0);
    static UnofficialStore = new Threat(0);
    static ObfuscationIssues = new Threat(0);
    static DevMode = new Threat(0);

    constructor (value: number) {
        this.value = value;
    }

    static getValues = (): Threat[] => {
        return cordova.platformId === 'android'
            ? [
                this.AppIntegrity,
                this.PrivilegedAccess,
                this.Debug,
                this.Hooks,
                this.Passcode,
                this.Simulator,
                this.SecureHardwareNotAvailable,
                this.SystemVPN,
                this.DeviceBinding,
                this.UnofficialStore,
                this.ObfuscationIssues,
                this.DevMode
            ]
            : [
                this.AppIntegrity,
                this.PrivilegedAccess,
                this.Debug,
                this.Hooks,
                this.Passcode,
                this.Simulator,
                this.SecureHardwareNotAvailable,
                this.SystemVPN,
                this.DeviceBinding,
                this.DeviceID,
                this.UnofficialStore
            ];
    };
}

const getThreatCount = (): number => {
    return Threat.getValues().length;
};

const itemsHaveType = (data: any[], desidedType: string) => {
    // eslint-disable-next-line valid-typeof
    return data.every((item) => typeof item === desidedType);
};
const getThreatIdentifiers = async (): Promise<number[]> => {
    const identifiers: number[] = await new Promise((resolve, reject) => {
        cordova.exec(
            (data) => {
                resolve(data);
            },
            (error) => {
                reject(error);
            },
            'TalsecPlugin',
            'getThreatIdentifiers'
        );
    });
    if (
        identifiers.length !== getThreatCount() ||
        !itemsHaveType(identifiers, 'number')
    ) {
        onInvalidCallback();
    }
    return identifiers;
};
const prepareMapping = async (): Promise<void> => {
    const newValues = await getThreatIdentifiers();
    const threats = Threat.getValues();
    // eslint-disable-next-line array-callback-return
    threats.map((threat, index) => {
        threat.value = newValues[index]!;
    });
};
const onInvalidCallback = () => {
    cordova.exec(
        () => {},
        () => {},
        'TalsecPlugin',
        'onInvalidCallback'
    );
};

const start = async (
    config: TalsecConfig,
    eventListenerConfig: NativeEventEmitterActions
) => {
    await prepareMapping();

    const eventListener = (event: number) => {
        switch (event) {
        case Threat.PrivilegedAccess.value:
            eventListenerConfig.privilegedAccess?.();
            break;
        case Threat.Debug.value:
            eventListenerConfig.debug?.();
            break;
        case Threat.Simulator.value:
            eventListenerConfig.simulator?.();
            break;
        case Threat.AppIntegrity.value:
            eventListenerConfig.appIntegrity?.();
            break;
        case Threat.UnofficialStore.value:
            eventListenerConfig.unofficialStore?.();
            break;
        case Threat.Hooks.value:
            eventListenerConfig.hooks?.();
            break;
        case Threat.DeviceBinding.value:
            eventListenerConfig.deviceBinding?.();
            break;
        case Threat.Passcode.value:
            eventListenerConfig.passcode?.();
            break;
        case Threat.SecureHardwareNotAvailable.value:
            eventListenerConfig.secureHardwareNotAvailable?.();
            break;
        case Threat.ObfuscationIssues.value:
            eventListenerConfig.obfuscationIssues?.();
            break;
        case Threat.DeviceID.value:
            eventListenerConfig.deviceID?.();
            break;
        case Threat.DevMode.value:
            eventListenerConfig.devMode?.();
            break;
        case Threat.SystemVPN.value:
            eventListenerConfig.systemVPN?.();
            break;
        default:
            onInvalidCallback();
            break;
        }
    };

    return new Promise<void>((resolve, reject) => {
        cordova.exec(
            (message) => {
                if (message != null && message === 'started') {
                    resolve();
                } else {
                    eventListener(message);
                }
            },
            (error) => {
                reject(error);
            },
            'TalsecPlugin',
            'start',
            [config]
        );
    });
};

module.exports = {
    start
};
