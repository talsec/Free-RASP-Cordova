package com.aheaditec.talsec.cordova

import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper
import android.util.Log
import com.aheaditec.talsec.cordova.events.RaspExecutionStateEvent
import com.aheaditec.talsec.cordova.events.ThreatEvent
import com.aheaditec.talsec.cordova.interfaces.PluginExecutionStateListener
import com.aheaditec.talsec.cordova.interfaces.PluginThreatListener
import com.aheaditec.talsec.cordova.utils.Utils
import com.aheaditec.talsec.cordova.utils.ScreenCaptureStatus
import com.aheaditec.talsec.cordova.utils.toEncodedJsonArray
import com.aheaditec.talsec.cordova.utils.getArraySafe
import com.aheaditec.talsec.cordova.utils.getBooleanSafe
import com.aheaditec.talsec.cordova.utils.getNestedArraySafe
import com.aheaditec.talsec.cordova.utils.getStringSafe
import com.aheaditec.talsec_security.security.api.SuspiciousAppInfo
import com.aheaditec.talsec_security.security.api.Talsec
import com.aheaditec.talsec_security.security.api.TalsecConfig

import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.PluginResult
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

class TalsecPlugin : CordovaPlugin(), PluginThreatListener, PluginExecutionStateListener {

    private var threatCallbackContext: CallbackContext? = null
    private var executionStateCallbackContext: CallbackContext? = null

    private var isThreatListenerRegistered = false
    private var isExecutionStateListenerRegistered = false

    override fun pluginInitialize() {
        super.pluginInitialize()
        // Trigger lazy initialization of the events
        ThreatEvent.ALL_EVENTS
        RaspExecutionStateEvent.ALL_EVENTS

        if (this.cordova == null) {
            Log.e("Talsec", "Unable to get Android Context.")
            return
        }
        appContext = this.cordova.context
    }

    override fun execute(
        action: String?, args: JSONArray?, callbackContext: CallbackContext?
    ): Boolean {
        return when (action) {
            "start" -> start(args, callbackContext)
            "onInvalidCallback" -> onInvalidCallback(callbackContext)
            "getThreatIdentifiers" -> getThreatIdentifiers(callbackContext)
            "getRaspExecutionStateIdentifiers" -> getRaspExecutionStateIdentifiers(callbackContext)
            "getThreatChannelData" -> getThreatChannelData(callbackContext)
            "getRaspExecutionStateChannelData" -> getRaspExecutionStateChannelData(callbackContext)
            "addToWhitelist" -> addToWhitelist(callbackContext, args)
            "getAppIcon" -> getAppIcon(callbackContext, args)
            "blockScreenCapture" -> blockScreenCapture(callbackContext, args)
            "isScreenCaptureBlocked" -> isScreenCaptureBlocked(callbackContext)
            "storeExternalId" -> storeExternalId(callbackContext, args)
            "removeExternalId" -> removeExternalId(callbackContext)
            "registerListener" -> registerListener(callbackContext)
            "registerRaspExecutionStateListener" -> registerRaspExecutionStateListener(callbackContext)
            else -> {
                callbackContext?.error("Talsec plugin executed with unknown action - $action")
                return false
            }
        }
    }

    private fun start(args: JSONArray?, callbackContext: CallbackContext?): Boolean {
        if (talsecStarted) {
            callbackContext?.success("started")
            return true
        }

        val configJson = args?.optString(0, null) ?: kotlin.run {
            callbackContext?.error("Missing config parameter in Talsec Native Plugin")
            return false
        }

        try {
            val config = buildTalsecConfigThrowing(configJson)
            TalsecThreatHandler.registerListener(this.cordova.context)
            this.cordova.activity.runOnUiThread {
                Talsec.start(this.cordova.context, config)
                mainHandler.post {
                    talsecStarted = true
                    // This code must be called only AFTER Talsec.start
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                        ScreenProtector.register(cordova.activity)
                    }
                }
            }
            callbackContext?.success("started")
            return true
        } catch (e: Exception) {
            callbackContext?.error("Error during Talsec Native plugin initialization - ${e.message}")
        }
        return false
    }

    private fun addToWhitelist(callbackContext: CallbackContext?, args: JSONArray?): Boolean {
        val packageName = args?.optString(0, null) ?: run {
            callbackContext?.error("Missing packageName parameter in Talsec Native Plugin")
            return false
        }
        this.cordova.activity.runOnUiThread {
            Talsec.addToWhitelist(cordova.context, packageName)
        }
        callbackContext?.success("OK - package $packageName added to whitelist")
        return true
    }

    /**
     * Method retrieves app icon for the given parameter
     * @param args - should contain `packageName`: package name of the app we want to retrieve icon for
     * @return PNG with app icon encoded as a base64 string
     */
    private fun getAppIcon(callbackContext: CallbackContext?, args: JSONArray?): Boolean {
        val packageName = args?.optString(0, null) ?: run {
            callbackContext?.error("Missing packageName parameter in Talsec Native Plugin")
            return false
        }
        // Perform the app icon encoding on a background thread
        backgroundHandler.post {
            val encodedData = Utils.getAppIconAsBase64String(cordova.context, packageName)
            mainHandler.post { callbackContext?.success(encodedData) }
        }
        return true
    }

    private fun blockScreenCapture(callbackContext: CallbackContext?, args: JSONArray?): Boolean {
        try {
            val enable = args?.getBoolean(0) ?: run {
                callbackContext?.error("Missing enable parameter in Talsec Native Plugin")
                return false
            }
            cordova.activity.runOnUiThread {
                try {
                    Talsec.blockScreenCapture(cordova.activity, enable)
                    callbackContext?.success("Screen capture is now ${if (enable) "Blocked" else "Enabled"}.")
                } catch (e: Exception) {
                    callbackContext?.error("Failed to block screen capture: ${e.message}")
                }
            }
            return true
        } catch (e: JSONException) {
            callbackContext?.error("Invalid argument: Expected a boolean value")
            return false
        } catch (e: Exception) {
            callbackContext?.error("Failed to block screen capture: ${e.message}")
            return false
        }
    }

    private fun isScreenCaptureBlocked(callbackContext: CallbackContext?): Boolean {
        try {
            val isBlocked = Talsec.isScreenCaptureBlocked()
            val status = if (isBlocked) ScreenCaptureStatus.BLOCKED else ScreenCaptureStatus.ALLOWED
            callbackContext?.success(status)
            return true
        } catch (e: Exception) {
            callbackContext?.error("Failed to check screen capture status: ${e.message}")
            return false
        }
    }

    private fun storeExternalId(
        callbackContext: CallbackContext?, args: JSONArray?
    ): Boolean {
        val externalIdValue = args?.optString(0, null) ?: kotlin.run {
            callbackContext?.error("Missing external ID parameter in freeRASP Native Plugin")
            return false
        }

        return try {
            Talsec.storeExternalId(cordova.context, externalIdValue)
            callbackContext?.success("OK.")
            true
        } catch (e: Exception) {
            callbackContext?.error("Error during storeExternalId operation in freeRASP Native Plugin")
            false
        }
    }

    override fun onPause(multitasking: Boolean) {
        super.onPause(multitasking)
        TalsecThreatHandler.threatDispatcher.listener = null
        TalsecThreatHandler.executionStateDispatcher.listener = null
    }

    private fun removeExternalId(callbackContext: CallbackContext?): Boolean {
        return try {
            Talsec.removeExternalId(cordova.context)
            callbackContext?.success("OK.")
            true
        } catch (e: Exception) {
            callbackContext?.error("Error during removeExternalId operation in freeRASP Native Plugin")
            false
        }
    }

    override fun onStart() {
        super.onStart()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            ScreenProtector.register(cordova.activity)
        }
    }

    override fun onStop() {
        super.onStop()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            ScreenProtector.unregister(cordova.activity)
        }
    }

    override fun onResume(multitasking: Boolean) {
        super.onResume(multitasking)
        if (isThreatListenerRegistered) {
            TalsecThreatHandler.threatDispatcher.listener = this
        }
        if (isExecutionStateListenerRegistered) {
            TalsecThreatHandler.executionStateDispatcher.listener = this
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        backgroundHandlerThread.quitSafely()
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
        callbackContext?.success(ThreatEvent.ALL_EVENTS)
        return true
    }

    /**
     * Method to get the random identifiers of callbacks
     */
    private fun getRaspExecutionStateIdentifiers(callbackContext: CallbackContext?): Boolean {
        callbackContext?.success(RaspExecutionStateEvent.ALL_EVENTS)
        return true
    }

    /**
     * Method to setup the message passing between native and Cordova
     * @return list of [ThreatEvent.CHANNEL_KEY, ThreatEvent.MALWARE_CHANNEL_KEY]
     */
    private fun getThreatChannelData(callbackContext: CallbackContext?): Boolean {
        val channelData = JSONArray()
        channelData.put(ThreatEvent.CHANNEL_KEY)
        channelData.put(ThreatEvent.MALWARE_CHANNEL_KEY)
        callbackContext?.success(channelData)
        return true
    }

    /**
     * Method to setup the message passing between native and Cordova
     * @return list of [RaspExecutionStateEvent.CHANNEL_KEY]
     */
    private fun getRaspExecutionStateChannelData(callbackContext: CallbackContext?): Boolean {
        val channelData = JSONArray()
        channelData.put(RaspExecutionStateEvent.CHANNEL_KEY)
        callbackContext?.success(channelData)
        return true
    }

    private fun registerListener(callbackContext: CallbackContext?): Boolean {
        threatCallbackContext = callbackContext
        TalsecThreatHandler.threatDispatcher.listener = this
        isThreatListenerRegistered = true
        return true
    }

    private fun registerRaspExecutionStateListener(callbackContext: CallbackContext?): Boolean {
        executionStateCallbackContext = callbackContext
        TalsecThreatHandler.executionStateDispatcher.listener = this
        isExecutionStateListenerRegistered = true
        return true
    }

    private fun buildTalsecConfigThrowing(configJson: String): TalsecConfig {
        val json = JSONObject(configJson)
        val androidConfig = json.getJSONObject("androidConfig")
        val packageName = androidConfig.getString("packageName")
        val certificateHashes = androidConfig.getArraySafe("certificateHashes")
        val talsecBuilder = TalsecConfig.Builder(packageName, certificateHashes)
            .watcherMail(json.getStringSafe("watcherMail"))
            .supportedAlternativeStores(androidConfig.getArraySafe("supportedAlternativeStores"))
            .prod(json.getBooleanSafe("isProd"))
            .killOnBypass(json.getBooleanSafe("killOnBypass", false))

        if (androidConfig.has("malwareConfig")) {
            val malwareConfig = androidConfig.getJSONObject("malwareConfig")
            talsecBuilder.whitelistedInstallationSources(malwareConfig.getArraySafe("whitelistedInstallationSources"))
            talsecBuilder.blacklistedHashes(malwareConfig.getArraySafe("blacklistedHashes"))
            talsecBuilder.blacklistedPackageNames(malwareConfig.getArraySafe("blacklistedPackageNames"))
            talsecBuilder.suspiciousPermissions(malwareConfig.getNestedArraySafe("suspiciousPermissions"))
        }
        return talsecBuilder.build()
    }

    override fun threatDetected(threatEventType: ThreatEvent) {
        val response = JSONObject()
        response.put(threatEventType.channelKey, threatEventType.value)
        val result = PluginResult(PluginResult.Status.OK, response)
        result.keepCallback = true
        threatCallbackContext?.sendPluginResult(result) ?: Log.w("TalsecPlugin", "Threat listener not registered.")
    }

    override fun malwareDetected(suspiciousApps: MutableList<SuspiciousAppInfo>) {
        backgroundHandler.post {
            val encodedSuspiciousApps = suspiciousApps.toEncodedJsonArray(appContext)

            mainHandler.post {
                val response = JSONObject()
                response.put(ThreatEvent.CHANNEL_KEY, ThreatEvent.Malware.value)
                response.put(ThreatEvent.MALWARE_CHANNEL_KEY, encodedSuspiciousApps)
                val result = PluginResult(PluginResult.Status.OK, response)
                result.keepCallback = true
                threatCallbackContext?.sendPluginResult(result) ?: Log.w(
                    "TalsecPlugin", "Threat listener not registered."
                )
            }
        }
    }

    override fun raspExecutionStateChanged(event: RaspExecutionStateEvent) {
        val response = JSONObject()
        response.put(event.channelKey, event.value)
        val result = PluginResult(PluginResult.Status.OK, response)
        result.keepCallback = true
        executionStateCallbackContext?.sendPluginResult(result) ?: Log.w("TalsecPlugin", "Execution state listener not registered.")
    }

    companion object {
        private lateinit var appContext: Context
        private val backgroundHandlerThread = HandlerThread("BackgroundThread").apply { start() }
        private val backgroundHandler = Handler(backgroundHandlerThread.looper)
        private val mainHandler = Handler(Looper.getMainLooper())

        internal var talsecStarted = false
    }
}