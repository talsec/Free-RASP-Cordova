/* global cordova */

export function start (config, eventListener) {
    return new Promise((resolve, reject) => {
        cordova.exec(
            (success) => {
                if (success !== null && success === 'started') {
                    resolve();
                } else {
                    eventListener(success);
                }
            },
            (error) => {
                reject(error);
            },
            'TalsecPlugin', 'start', [config]
        );
    });
}
