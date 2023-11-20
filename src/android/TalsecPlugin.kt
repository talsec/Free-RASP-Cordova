package com.aheaditec.talsec.cordova

import android.util.Log
import com.aheaditec.talsec_security.security.api.Talsec
import com.aheaditec.talsec_security.security.api.TalsecConfig
import com.aheaditec.talsec_security.security.api.ThreatListener

import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.PluginResult
import org.json.JSONArray
import org.json.JSONObject

class TalsecPlugin : CordovaPlugin() {

    private val listener = ThreatListener(TalsecThreatHandler, TalsecThreatHandler)
    private var registered = true

    override fun execute(
        action: String?,
        args: JSONArray?,
        callbackContext: CallbackContext?
    ): Boolean {
        return when (action) {
            "start" -> start(args, callbackContext)
            "onInvalidCallback" -> onInvalidCallback(callbackContext)
            "getThreatIdentifiers" -> getThreatIdentifiers(callbackContext)
            else -> {
                callbackContext?.error("Talsec plugin executed with unknown action - $action")
                return false
            }
        }
    }

    private fun start(args: JSONArray?, callbackContext: CallbackContext?): Boolean {
        val configJson = args?.optString(0, null) ?: kotlin.run {
            callbackContext?.error("Missing config parameter in Talsec Native Plugin")
            return false
        }

        try {
            val config = parseTalsecConfigThrowing(configJson)
            callback = callbackContext
            listener.registerListener(this.cordova.context)
            TalsecThreatHandler.listener = ThreatListener
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

    /**
     * We never send an invalid callback over our channel.
     * Therefore, if this happens, we want to kill the app.
     */
    private fun onInvalidCallback(_callbackContext: CallbackContext?): Boolean {
        android.os.Process.killProcess(android.os.Process.myPid())
        return true
    }

    /**
     * Method to get the random identifiers of callbacks
     */
    private fun getThreatIdentifiers(callbackContext: CallbackContext?): Boolean {
        callbackContext?.success(Threat.getThreatValues())
        return true
    }

    private fun parseTalsecConfigThrowing(configJson: String): TalsecConfig {
        val json = JSONObject(configJson)
        val androidConfig = json.getJSONObject("androidConfig")
        val packageName = androidConfig.getString("packageName")
        val certificateHashes = mutableListOf<String>()
        val hashes = androidConfig.getJSONArray("certificateHashes")
        for (i in 0 until hashes.length()) {
            certificateHashes.add(hashes.getString(i))
        }
        val watcherMail = json.getString("watcherMail")
        val alternativeStores = mutableListOf<String>()
        if (androidConfig.has("supportedAlternativeStores")) {
            val stores = androidConfig.getJSONArray("supportedAlternativeStores")
            for (i in 0 until stores.length()) {
                alternativeStores.add(stores.getString(i))
            }
        }
        var isProd = true
        if (json.has("isProd")) {
            isProd = json.getBoolean("isProd")
        }

        return TalsecConfig(
            packageName,
            certificateHashes.toTypedArray(),
            watcherMail,
            alternativeStores.toTypedArray(),
            isProd
        )
    }

    internal object ThreatListener : TalsecThreatHandler.TalsecCordova {
        override fun threatDetected(threatType: Threat) {
            sendOngoingPluginResult(threatType)
        }
    }

    companion object {
        private var callback: CallbackContext? = null

        private fun sendOngoingPluginResult(threat: Threat) {
            val result = PluginResult(PluginResult.Status.OK, threat.value)
            result.keepCallback = true
            callback?.sendPluginResult(result) ?: Log.w("TalsecPlugin", "Listener not registered.")
        }

        private fun sendOngoingPluginResult(msg: String) {
            val result = PluginResult(PluginResult.Status.OK, msg)
            result.keepCallback = true
            callback?.sendPluginResult(result)
        }
    }
}