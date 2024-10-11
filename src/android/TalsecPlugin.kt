package com.aheaditec.talsec.cordova

import android.content.Context
import android.util.Log
import com.aheaditec.talsec.cordova.utils.getArraySafe
import com.aheaditec.talsec.cordova.utils.getBooleanSafe
import com.aheaditec.talsec.cordova.utils.getNestedArraySafe
import com.aheaditec.talsec.cordova.utils.getStringSafe
import com.aheaditec.talsec.cordova.utils.toEncodedJsonArray
import com.aheaditec.talsec_security.security.api.SuspiciousAppInfo
import com.aheaditec.talsec_security.security.api.Talsec
import com.aheaditec.talsec_security.security.api.TalsecConfig
import com.aheaditec.talsec_security.security.api.ThreatListener

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

  override fun onPause(multitasking: Boolean) {
    super.onPause(multitasking)
    if (this.cordova.activity.isFinishing) {
      listener.unregisterListener(this.cordova.context)
      registered = false
    }
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

    if (androidConfig.has("malware")) {
      val malwareConfig = androidConfig.getJSONObject("malware")
      talsecBuilder.whitelistedInstallationSources(malwareConfig.getArraySafe("whitelistedInstallationSources"))
      talsecBuilder.blocklistedHashes(malwareConfig.getArraySafe("blocklistedHashes"))
      talsecBuilder.blocklistedPermissions(malwareConfig.getNestedArraySafe("blocklistedPermissions"))
      talsecBuilder.blocklistedPackageNames(malwareConfig.getArraySafe("blocklistedPackageNames"))
    }
    return talsecBuilder.build()
  }

  internal object ThreatListener : TalsecThreatHandler.TalsecCordova {
    override fun threatDetected(threatType: Threat) {
      notifyThreat(threatType)
    }

    override fun malwareDetected(suspiciousApps: MutableList<SuspiciousAppInfo>) {
      Log.e("Talsec", "sending ${suspiciousApps.size} apps")
      notifyMalware(suspiciousApps)
    }
  }

  companion object {
    private var callback: CallbackContext? = null

    val THREAT_CHANNEL_KEY = (10000..999999999).random()
      .toString() // key of the argument map under which threats are expected
    val MALWARE_CHANNEL_KEY = (10000..999999999).random()
      .toString() // key of the argument map under which malware data is expected

    private lateinit var appContext: Context

    /**
     * Sends malware detected event to Cordova
     */
    private fun notifyMalware(suspiciousApps: MutableList<SuspiciousAppInfo>) {
      val response = JSONObject()
      response.put(THREAT_CHANNEL_KEY, Threat.Malware.value)
      response.put(MALWARE_CHANNEL_KEY, suspiciousApps.toEncodedJsonArray(appContext))
      val result = PluginResult(PluginResult.Status.OK, response)
      result.keepCallback = true
      callback?.sendPluginResult(result) ?: Log.w("TalsecPlugin", "Listener not registered.")
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
