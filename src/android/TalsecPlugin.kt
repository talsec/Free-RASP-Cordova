package com.aheaditec.talsec.cordova

import android.content.Context
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper
import android.util.Log
import android.os.Build
import com.aheaditec.talsec.cordova.utils.Utils
import com.aheaditec.talsec.cordova.utils.getArraySafe
import com.aheaditec.talsec.cordova.utils.getBooleanSafe
import com.aheaditec.talsec.cordova.utils.getNestedArraySafe
import com.aheaditec.talsec.cordova.utils.getStringSafe
import com.aheaditec.talsec.cordova.utils.toEncodedJsonArray
import com.aheaditec.talsec_security.security.api.SuspiciousAppInfo
import com.aheaditec.talsec_security.security.api.Talsec
import com.aheaditec.talsec_security.security.api.TalsecConfig
import com.aheaditec.talsec_security.security.api.ThreatListener
import com.aheaditec.talsec.cordova.ScreenProtectorHandler

import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaInterface
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.CordovaWebView
import org.apache.cordova.PluginResult
import org.json.JSONArray
import org.json.JSONObject

class TalsecPlugin : CordovaPlugin() {

    private val listener = ThreatListener(TalsecThreatHandler, TalsecThreatHandler)
    private var registered = true


    override fun initialize(cordova: CordovaInterface?, webView: CordovaWebView?) {
        super.initialize(cordova, webView)

        if (cordova == null) {
            Log.e("Talsec", "Unable to get Android Context.")
            return
        }
        appContext = cordova.context
    }

    override fun execute(
        action: String?,
        args: JSONArray?,
        callbackContext: CallbackContext?
    ): Boolean {
        return when (action) {
            "start" -> start(args, callbackContext)
            "onInvalidCallback" -> onInvalidCallback(callbackContext)
            "getThreatIdentifiers" -> getThreatIdentifiers(callbackContext)
            "getThreatChannelData" -> getThreatChannelData(callbackContext)
            "addToWhitelist" -> addToWhitelist(callbackContext, args)
            "getAppIcon" -> getAppIcon(callbackContext, args)
            "blockScreenCapture" -> {
                blockScreenCapture(callbackContext, args)
                true
            }

            "isScreenCaptureBlocked" -> isScreenCaptureBlocked(callbackContext)

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
            val config = buildTalsecConfigThrowing(configJson)
            callback = callbackContext
            listener.registerListener(this.cordova.context)
            TalsecThreatHandler.listener = ThreatListener
            this.cordova.activity.runOnUiThread {
                Talsec.start(this.cordova.context, config)
            }
            sendOngoingPluginResult("started")
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
     * @param packageName package name of the app we want to retrieve icon for
     * @return PNG with app icon encoded as a base64 string
     */
    fun getAppIcon(callbackContext: CallbackContext?, args: JSONArray?): Boolean {
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
    /**
     * Enables or disables screen capture blocking.
     *
     * This method sets the FLAG_SECURE flag on the application's main activity,
     * which prevents screenshots and screen recording. This feature enhances
     * security by protecting sensitive app content from being captured.
     *
     * @param callbackContext Cordova callback context to return the result.
     * @param args JSON array where the first parameter is a boolean indicating whether to enable or disable blocking.
     */
    private fun blockScreenCapture(callbackContext: CallbackContext?, args: JSONArray?) {
        try {
            val enable = args?.optBoolean(0, false) ?: false
            cordova.activity?.runOnUiThread {
                try {
                    Talsec.blockScreenCapture(cordova.activity, enable)
                    callbackContext?.success("Screen capture blocking is now ${if (enable) "enabled" else "disabled"}.")
                } catch (e: Exception) {
                    callbackContext?.error("Error while setting screen capture: ${e.message}")

                }
            }
        } catch (e: Exception) {
            callbackContext?.error("Failed to block screen capture: ${e.message}")
        }
    }
    /**
     * Checks if screen capture blocking is enabled.
     *
     * This method queries the current status of screen capture blocking and
     * returns a boolean result indicating whether it is enabled or not.
     *
     * @param callbackContext Cordova callback context to return the result.
     * @return Boolean indicating if screen capture is blocked (`true`) or not (`false`).
     */
    private fun isScreenCaptureBlocked(callbackContext: CallbackContext?): Boolean {
        return try {

            val isBlocked = Talsec.isScreenCaptureBlocked()
            val resultJson = JSONObject().put("result", isBlocked)
            callbackContext?.success(resultJson)
            true
        } catch (e: Exception) {
            callbackContext?.error("Failed to check screen capture status: ${e.message}")
            false
        }
    }

    override fun onPause(multitasking: Boolean) {
        super.onPause(multitasking)
        if (this.cordova.activity.isFinishing) {
            listener.unregisterListener(this.cordova.context)
            registered = false
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            this.cordova.activity?.let { activity ->
                ScreenProtectorHandler.unregisterScreenCaptureHandler(activity) // Fix: Pass `activity`
            }
        }
    }

    override fun onResume(multitasking: Boolean) {
        super.onResume(multitasking)
        if (!registered) {
            registered = true
            listener.registerListener(this.cordova.context)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            this.cordova.activity?.let { activity ->
                ScreenProtectorHandler.registerScreenCaptureHandler(
                    activity,
                    activity
                ) // Fix: Pass `activity`
            }
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
        callbackContext?.success(Threat.getThreatValues())
        return true
    }

    /**
     * Method to setup the message passing between native and Cordova
     * @return list of [THREAT_CHANNEL_KEY, MALWARE_CHANNEL_KEY]
     */
    private fun getThreatChannelData(callbackContext: CallbackContext?): Boolean {
        val channelData = JSONArray()
        channelData.put(THREAT_CHANNEL_KEY)
        channelData.put(MALWARE_CHANNEL_KEY)
        callbackContext?.success(channelData)
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

        if (androidConfig.has("malwareConfig")) {
            val malwareConfig = androidConfig.getJSONObject("malwareConfig")
            talsecBuilder.whitelistedInstallationSources(malwareConfig.getArraySafe("whitelistedInstallationSources"))
            talsecBuilder.blacklistedHashes(malwareConfig.getArraySafe("blacklistedHashes"))
            talsecBuilder.blacklistedPackageNames(malwareConfig.getArraySafe("blacklistedPackageNames"))
            talsecBuilder.suspiciousPermissions(malwareConfig.getNestedArraySafe("suspiciousPermissions"))
        }
        return talsecBuilder.build()
    }

    internal object ThreatListener : TalsecThreatHandler.TalsecCordova {
        override fun threatDetected(threatType: Threat) {
            notifyThreat(threatType)
        }

        override fun malwareDetected(suspiciousApps: MutableList<SuspiciousAppInfo>) {
            notifyMalware(suspiciousApps)
        }
    }

    companion object {
        private var callback: CallbackContext? = null

        private val THREAT_CHANNEL_KEY = (10000..999999999).random()
            .toString() // key of the argument map under which threats are expected
        private val MALWARE_CHANNEL_KEY = (10000..999999999).random()
            .toString() // key of the argument map under which malware data is expected

        private lateinit var appContext: Context
        private val backgroundHandlerThread = HandlerThread("BackgroundThread").apply { start() }
        private val backgroundHandler = Handler(backgroundHandlerThread.looper)
        private val mainHandler = Handler(Looper.getMainLooper())


        /**
         * Sends malware detected event to Cordova
         */
        private fun notifyMalware(suspiciousApps: MutableList<SuspiciousAppInfo>) {
            // Perform the malware encoding on a background thread
            backgroundHandler.post {

                val encodedSuspiciousApps = suspiciousApps.toEncodedJsonArray(appContext)

                mainHandler.post {
                    val response = JSONObject()
                    response.put(THREAT_CHANNEL_KEY, Threat.Malware.value)
                    response.put(MALWARE_CHANNEL_KEY, encodedSuspiciousApps)
                    val result = PluginResult(PluginResult.Status.OK, response)
                    result.keepCallback = true
                    callback?.sendPluginResult(result) ?: Log.w(
                        "TalsecPlugin",
                        "Listener not registered."
                    )
                }
            }
        }

        private fun notifyThreat(threat: Threat) {
            val response = JSONObject()
            response.put(THREAT_CHANNEL_KEY, threat.value)
            val result = PluginResult(PluginResult.Status.OK, response)
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
