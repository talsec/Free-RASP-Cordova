package com.aheaditec.talsec.cordova.utils

import android.content.Context
import android.content.pm.PackageInfo
import android.util.Base64
import android.util.Log
import com.aheaditec.talsec.cordova.models.CordovaPackageInfo
import com.aheaditec.talsec.cordova.models.CordovaSuspiciousAppInfo
import com.aheaditec.talsec_security.security.api.SuspiciousAppInfo
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject


internal fun JSONArray.toArray(): Array<String> {
  val output = mutableListOf<String>()
  for (i in 0 until this.length()) {
    this.getString(i)?.let(output::add)
  }
  return output.toTypedArray()
}

internal fun JSONObject.getArraySafe(key: String): Array<String> {
  if (this.has(key)) {
    val inputArray = this.getJSONArray(key)
    return inputArray.toArray()
  }
  return arrayOf()
}

internal fun JSONObject.getNestedArraySafe(key: String): Array<Array<String>> {
  val outArray = mutableListOf<Array<String>>()
  if (this.has(key)) {
    val inputArray = this.getJSONArray(key)
    for (i in 0 until inputArray.length()) {
      outArray.add(inputArray.getJSONArray(i).toArray())
    }
  }
  return outArray.toTypedArray()
}

internal fun JSONObject.getBooleanSafe(key: String, defaultValue: Boolean = true): Boolean {
  if (this.has(key)) {
    return this.getBoolean(key)
  }
  return defaultValue
}

internal fun JSONObject.getStringSafe(key: String): String? {
  if (this.has(key)) {
    return this.getString(key)
  }
  return null
}

/**
 * Converts the Talsec's SuspiciousAppInfo to Cordova equivalent
 */
internal fun SuspiciousAppInfo.toCordovaSuspiciousAppInfo(context: Context): CordovaSuspiciousAppInfo {
  return CordovaSuspiciousAppInfo(
    packageInfo = this.packageInfo.toCordovaPackageInfo(context),
    reason = this.reason,
  )
}

/**
 * Converts the Android's PackageInfo to Cordova equivalent
 */
internal fun PackageInfo.toCordovaPackageInfo(context: Context): CordovaPackageInfo {
  return CordovaPackageInfo(
    packageName = this.packageName,
    appName = Utils.getAppName(context, this.applicationInfo),
    version = this.versionName,
    appIcon = Utils.getAppIconAsBase64String(context, this.packageName),
    installerStore = Utils.getInstallationSource(context, this.packageName)
  )
}

/**
 * Convert the Talsec's SuspiciousAppInfo to base64-encoded json array,
 * which can be then sent to Cordova
 */
internal fun MutableList<SuspiciousAppInfo>.toEncodedJsonArray(context: Context): JSONArray {
  val output = JSONArray()
  this.forEach { suspiciousAppInfo ->
    val rnSuspiciousAppInfo = suspiciousAppInfo.toCordovaSuspiciousAppInfo(context)
    try {
      val encodedAppInfo =
        Base64.encodeToString(
          Json.encodeToString(rnSuspiciousAppInfo).toByteArray(),
          Base64.DEFAULT
        )
      output.put(encodedAppInfo)
    } catch (e: Exception) {
      Log.e("Talsec", "Could not serialize suspicious app data: ${e.message}")
    }

  }
  return output
}
