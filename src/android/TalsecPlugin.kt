package app.talsec.rasp.cordova

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper
import android.util.Log
import app.talsec.rasp.security.api.SuspiciousAppInfo
import app.talsec.rasp.security.api.Talsec
import app.talsec.rasp.security.api.TalsecConfig
import app.talsec.rasp.security.api.ThreatListener.CallState
import app.talsec.rasp.cordova.dispatchers.ExecutionStateDispatcher
import app.talsec.rasp.cordova.dispatchers.ThreatDispatcher
import app.talsec.rasp.cordova.events.BaseRaspEvent
import app.talsec.rasp.cordova.events.RaspExecutionStateEvent
import app.talsec.rasp.cordova.events.ThreatEvent
import app.talsec.rasp.cordova.interfaces.PluginExecutionStateListener
import app.talsec.rasp.cordova.interfaces.PluginThreatListener
import app.talsec.rasp.cordova.utils.Utils
import app.talsec.rasp.cordova.utils.ScreenCaptureStatus
import app.talsec.rasp.cordova.utils.toEncodedJsonArray
import app.talsec.rasp.cordova.utils.getArraySafe
import app.talsec.rasp.cordova.utils.getBooleanSafe
import app.talsec.rasp.cordova.utils.getStringSafe
import app.talsec.rasp.cordova.utils.toSuspiciousAppDetectionConfig

import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.PluginResult
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.lang.ref.WeakReference

class TalsecPlugin : CordovaPlugin() {

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
            "blockScreenControl" -> blockScreenControl(callbackContext, args)
            "isScreenControlBlocked" -> isScreenControlBlocked(callbackContext)
            "blockOverlayWindows" -> blockOverlayWindows(callbackContext, args)
            "isOverlayWindowsBlocked" -> isOverlayWindowsBlocked(callbackContext)
            "startOngoingCallDetection" -> startOngoingCallDetection(callbackContext)
            "stopOngoingCallDetection" -> stopOngoingCallDetection(callbackContext)
            "storeExternalId" -> storeExternalId(callbackContext, args)
            "removeExternalId" -> removeExternalId(callbackContext)
            "registerListener" -> registerListener(callbackContext)
            "registerRaspExecutionStateListener" -> registerRaspExecutionStateListener(
                callbackContext
            )

            else -> {
                callbackContext?.error("Talsec plugin executed with unknown action - $action")
                return false
            }
        }
    }

    override fun pluginInitialize() {
        super.pluginInitialize()
        // Trigger lazy initialization of the events
        initializeEventKeys()
    }

    override fun onPause(multitasking: Boolean) {
        super.onPause(multitasking)
        ThreatDispatcher.onPause()
        ExecutionStateDispatcher.onPause()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            ScreenProtector.unregister(cordova.activity)
        }
        if (this.cordova.activity.isFinishing) {
            stopOngoingCallDetectionInternal()
            ThreatDispatcher.unregisterListener()
            ExecutionStateDispatcher.unregisterListener()
            TalsecThreatHandler.unregisterSDKListener(this.cordova.context)
        }
    }

    override fun onResume(multitasking: Boolean) {
        super.onResume(multitasking)
        ThreatDispatcher.onResume()
        ExecutionStateDispatcher.onResume()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            ScreenProtector.register(this.cordova.activity)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        backgroundHandlerThread.quitSafely()
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
            TalsecThreatHandler.registerSDKListener(this.cordova.context)
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
            val isBlocked = Talsec.isScreenCaptureBlocked(cordova.activity)
            val status = if (isBlocked) ScreenCaptureStatus.BLOCKED else ScreenCaptureStatus.ALLOWED
            callbackContext?.success(status)
            return true
        } catch (e: Exception) {
            callbackContext?.error("Failed to check screen capture status: ${e.message}")
            return false
        }
    }

    private fun blockScreenControl(callbackContext: CallbackContext?, args: JSONArray?): Boolean {
        val enable = try {
            args?.getBoolean(0) ?: run {
                callbackContext?.error("Missing enable parameter in Talsec Native Plugin")
                return false
            }
        } catch (e: JSONException) {
            callbackContext?.error("Invalid argument: Expected a boolean value")
            return false
        }
        cordova.activity.runOnUiThread {
            try {
                Talsec.blockScreenControl(cordova.activity, enable)
                callbackContext?.success("Screen control is now ${if (enable) "Blocked" else "Enabled"}.")
            } catch (e: Exception) {
                callbackContext?.error("Failed to block screen control: ${e.message}")
            }
        }
        return true
    }

    private fun isScreenControlBlocked(callbackContext: CallbackContext?): Boolean {
        return try {
            sendBoolean(callbackContext, Talsec.isScreenControlBlocked(cordova.activity))
            true
        } catch (e: Exception) {
            callbackContext?.error("Failed to check screen control status: ${e.message}")
            false
        }
    }

    /**
     * Hides or shows overlay windows of other apps over the activity. Requires Android 12+ and the
     * HIDE_OVERLAY_WINDOWS permission, otherwise `false` is returned.
     */
    // Missing permission is suppressed because the decision to use the overlay API is made
    // by developer, and not enforced by the library.
    @SuppressLint("MissingPermission")
    private fun blockOverlayWindows(callbackContext: CallbackContext?, args: JSONArray?): Boolean {
        val enable = try {
            args?.getBoolean(0) ?: run {
                callbackContext?.error("Missing enable parameter in Talsec Native Plugin")
                return false
            }
        } catch (e: JSONException) {
            callbackContext?.error("Invalid argument: Expected a boolean value")
            return false
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            sendBoolean(callbackContext, false)
            return true
        }
        cordova.activity.runOnUiThread {
            try {
                sendBoolean(callbackContext, Talsec.blockOverlayWindows(cordova.activity, enable))
            } catch (e: Exception) {
                callbackContext?.error("Failed to block overlay windows: ${e.message}")
            }
        }
        return true
    }

    private fun isOverlayWindowsBlocked(callbackContext: CallbackContext?): Boolean {
        return try {
            sendBoolean(callbackContext, Talsec.isOverlayWindowsBlocked(cordova.activity))
            true
        } catch (e: Exception) {
            callbackContext?.error("Failed to check overlay windows status: ${e.message}")
            false
        }
    }

    private fun startOngoingCallDetection(callbackContext: CallbackContext?): Boolean {
        return try {
            val activity = cordova.activity
            if (ongoingCallActivity?.get() !== activity) {
                stopOngoingCallDetectionInternal()
                Talsec.startOngoingCallDetection(activity)
                ongoingCallActivity = WeakReference(activity)
            }
            callbackContext?.success("Ongoing call detection started.")
            true
        } catch (e: Exception) {
            callbackContext?.error("Failed to start ongoing call detection: ${e.message}")
            false
        }
    }

    private fun stopOngoingCallDetection(callbackContext: CallbackContext?): Boolean {
        return try {
            stopOngoingCallDetectionInternal()
            callbackContext?.success("Ongoing call detection stopped.")
            true
        } catch (e: Exception) {
            callbackContext?.error("Failed to stop ongoing call detection: ${e.message}")
            false
        }
    }

    private fun stopOngoingCallDetectionInternal() {
        ongoingCallActivity?.get()?.let { Talsec.stopOngoingCallDetection(it) }
        ongoingCallActivity = null
    }

    private fun sendBoolean(callbackContext: CallbackContext?, value: Boolean) {
        callbackContext?.sendPluginResult(PluginResult(PluginResult.Status.OK, value))
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
     * @return list of [ThreatEvent.CHANNEL_KEY, ThreatEvent.MALWARE_CHANNEL_KEY, ThreatEvent.CALL_STATE_CHANNEL_KEY]
     */
    private fun getThreatChannelData(callbackContext: CallbackContext?): Boolean {
        val channelData = JSONArray()
        channelData.put(ThreatEvent.CHANNEL_KEY)
        channelData.put(ThreatEvent.MALWARE_CHANNEL_KEY)
        channelData.put(ThreatEvent.CALL_STATE_CHANNEL_KEY)
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
        ThreatDispatcher.registerListener(PluginListener(this.cordova.context), callbackContext)
        return true
    }

    private fun registerRaspExecutionStateListener(callbackContext: CallbackContext?): Boolean {
        ExecutionStateDispatcher.registerListener(PluginListener(this.cordova.context), callbackContext)
        return true
    }

    private fun initializeEventKeys() {
        ThreatEvent.ALL_EVENTS
        RaspExecutionStateEvent.ALL_EVENTS
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

        if (androidConfig.has("suspiciousAppDetectionConfig")) {
            val suspiciousAppDetectionConfig = androidConfig.getJSONObject("suspiciousAppDetectionConfig")
                .toSuspiciousAppDetectionConfig()
            talsecBuilder.suspiciousAppDetection(suspiciousAppDetectionConfig)
        }
        return talsecBuilder.build()
    }

    companion object {
        private val backgroundHandlerThread = HandlerThread("BackgroundThread").apply { start() }
        private val backgroundHandler = Handler(backgroundHandlerThread.looper)
        private val mainHandler = Handler(Looper.getMainLooper())

        internal var talsecStarted = false

        // Ongoing call detection is registered per activity
        private var ongoingCallActivity: WeakReference<Activity>? = null
    }

    internal class PluginListener(
        private val context: Context
    ) : PluginThreatListener, PluginExecutionStateListener {

        override var threatCallbackContext: CallbackContext? = null
        override var executionStateCallbackContext: CallbackContext? = null

        override fun threatDetected(threatEventType: ThreatEvent) {
            val params = JSONObject()
            params.put(threatEventType.channelKey, threatEventType.value)
            sendResult(params, threatCallbackContext)
        }

        override fun malwareDetected(suspiciousApps: MutableList<SuspiciousAppInfo>) {
            backgroundHandler.post {
                val encodedSuspiciousApps = suspiciousApps.toEncodedJsonArray(context)
                mainHandler.post {
                    val params = JSONObject()
                    params.put(ThreatEvent.CHANNEL_KEY, ThreatEvent.Malware.value)
                    params.put(ThreatEvent.MALWARE_CHANNEL_KEY, encodedSuspiciousApps)
                    sendResult(params, threatCallbackContext)
                }
            }
        }

        override fun ongoingCallDetected(state: CallState) {
            val params = JSONObject()
            params.put(ThreatEvent.CHANNEL_KEY, ThreatEvent.OngoingCall.value)
            params.put(ThreatEvent.CALL_STATE_CHANNEL_KEY, state.name)
            sendResult(params, threatCallbackContext)
        }

        override fun raspExecutionStateChanged(event: RaspExecutionStateEvent) {
            val params = JSONObject()
            params.put(event.channelKey, event.value)
            sendResult(params, executionStateCallbackContext)
        }

        private fun sendResult(json: JSONObject, callbackContext: CallbackContext?) {
            if (callbackContext != null) {
                val result = PluginResult(PluginResult.Status.OK, json)
                result.keepCallback = true
                callbackContext.sendPluginResult(result)
            } else {
                Log.w("TalsecPlugin", "Listener not registered.")
            }
        }
    }
}
