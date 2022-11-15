cordova.define("com.talsec.cordova.freerasp.talsec", function(require, exports, module) {
/*global cordova, module*/

module.exports = {
    start: function (config, eventListener) {
        return new Promise((resolve, reject) => {
            cordova.exec(
                (success) => {
                    if (success != null && success == "started") {
                        resolve();
                    }
                    else {
                        eventListener(success);
                    }
                },
                (error) => {
                    reject(error);
                },
                "TalsecPlugin", "start", [config]
            );
        })
    }
};

});
