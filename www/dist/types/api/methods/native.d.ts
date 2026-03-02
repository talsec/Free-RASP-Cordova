export declare const storeExternalId: (externalId: string) => Promise<boolean>;
export declare const removeExternalId: () => Promise<boolean>;
export declare const addToWhitelist: (packageName: string) => Promise<string>;
export declare const getAppIcon: (packageName: string) => Promise<string>;
export declare const blockScreenCapture: (enable: boolean) => Promise<string>;
export declare const isScreenCaptureBlocked: () => Promise<boolean>;
export declare const onInvalidCallback: () => void;
