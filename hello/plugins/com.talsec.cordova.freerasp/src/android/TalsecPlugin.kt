package com.aheaditec.talsec.cordova

import com.aheaditec.talsec_security.security.api.Talsec
import com.aheaditec.talsec_security.security.api.TalsecConfig
import com.aheaditec.talsec_security.security.api.ThreatListener

import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.PluginResult
import org.json.JSONArray
import org.json.JSONObject

class TalsecPlugin : CordovaPlugin(), ThreatListener.ThreatDetected {

    private var callback: CallbackContext? = null
    private val listener = ThreatListener(this)
    private var registered = true

    override fun execute(
        action: String?,
        args: JSONArray?,
        callbackContext: CallbackContext?
    ): Boolean {
        if ("start" != action) {
            callbackContext?.error("Talsec plugin executed with unknown action - $action")
            return false
        }

        val configJson = args?.optString(0, null) ?: kotlin.run {
            callbackContext?.error("Missing config parameter in Talsec Native Plugin")
            return false
        }

        try {
            val config = parseTalsecConfigThrowing(configJson)
            this.callback = callbackContext
            listener.registerListener(this.cordova.context)
            Talsec.start(this.cordova.context, config)
            sendOngoingPluginResult("started")
            return true
        } catch (e: Exception) {
            callbackContext?.error("Error during Talsec Native plugin initialization - ${e.message}")
        }
        return false
    }

    override fun onPause(multitasking: Boolean) {
        super.onPause(multitasking)
        listener.unregisterListener(this.cordova.context)
        registered = false
    }

    override fun onResume(multitasking: Boolean) {
        super.onResume(multitasking)
        if (!registered) {
            registered = true
            listener.registerListener(this.cordova.context)
        }
    }

    override fun onRootDetected() {
        sendOngoingPluginResult("privilegedAccess")
    }

    override fun onDebuggerDetected() {
        sendOngoingPluginResult("debug")
    }

    override fun onEmulatorDetected() {
        sendOngoingPluginResult("simulator")
    }

    override fun onTamperDetected() {
        sendOngoingPluginResult("appIntegrity")
    }

    override fun onUntrustedInstallationSourceDetected() {
        sendOngoingPluginResult("unofficialStore")
    }

    override fun onHookDetected() {
        sendOngoingPluginResult("hooks")
    }

    override fun onDeviceBindingDetected() {
        sendOngoingPluginResult("device binding")
    }

    private fun sendOngoingPluginResult(msg: String) {
        val result = PluginResult(PluginResult.Status.OK, msg)
        result.keepCallback = true
        callback?.sendPluginResult(result)
    }

    private fun parseTalsecConfigThrowing(configJson: String): TalsecConfig {
        val json = JSONObject(configJson)
        val androidConfig = json.getJSONObject("androidConfig")
        val packageName = androidConfig.getString("packageName")
        val certificateHash = androidConfig.getString("certificateHash")
        val watcherMail = json.getString("watcherMail")
        val alternativeStores = mutableListOf<String>()
        if (androidConfig.has("supportedAlternativeStores")) {
            val stores = androidConfig.getJSONArray("supportedAlternativeStores")
            for (i in 0 .. stores.length()) {
                alternativeStores.add(stores.getString(i))
            }
        }
        return TalsecConfig(packageName, certificateHash, watcherMail, null)
    }
}