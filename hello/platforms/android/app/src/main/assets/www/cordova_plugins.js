cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "com.talsec.cordova.freerasp.talsec",
      "file": "plugins/com.talsec.cordova.freerasp/www/talsec.js",
      "pluginId": "com.talsec.cordova.freerasp",
      "clobbers": [
        "talsec"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-add-swift-support": "2.0.2",
    "com.talsec.cordova.freerasp": "1.0.0"
  };
});