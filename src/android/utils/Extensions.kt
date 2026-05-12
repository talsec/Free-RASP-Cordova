package com.aheaditec.talsec.cordova.utils

import android.content.Context
import android.content.pm.PackageInfo
import android.util.Base64
import android.util.Log
import com.aheaditec.talsec.cordova.models.CordovaPackageInfo
import com.aheaditec.talsec.cordova.models.CordovaSuspiciousAppInfo
import com.aheaditec.talsec_security.security.api.SuspiciousAppInfo
import com.aheaditec.talsec_security.security.api.SuspiciousAppDetectionConfig
import com.aheaditec.talsec_security.security.api.MalwareScanScope
import com.aheaditec.talsec_security.security.api.ScopeType
import com.aheaditec.talsec_security.security.api.ReasonMode
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

private inline fun <reified T> JSONArray.toPrimitiveArray(): Array<T> {
    val output = mutableListOf<T>()

    for (i in 0 until this.length()) {
        val element: T = when (T::class) {
            String::class -> this.getString(i) as T
            Int::class -> this.getInt(i) as T
            Double::class -> this.getDouble(i) as T
            Long::class -> this.getLong(i) as T
            Boolean::class -> this.getBoolean(i) as T
            else -> throw JSONException("Cannot parse JSON array - unsupported type")
        }
        output.add(element)
    }
    return output.toTypedArray()
}

internal fun JSONObject.getArraySafe(key: String): Array<String> {
    if (this.has(key)) {
        val inputArray = this.getJSONArray(key)
        return inputArray.toPrimitiveArray()
    }
    return arrayOf()
}

internal fun JSONObject.getNestedArraySafe(key: String): Array<Array<String>> {
    val outArray = mutableListOf<Array<String>>()
    if (this.has(key)) {
        val inputArray = this.getJSONArray(key)
        for (i in 0 until inputArray.length()) {
            outArray.add(inputArray.getJSONArray(i).toPrimitiveArray())
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
        reasons = this.reasons,
        permissions = this.permissions
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
        appIcon = null, // this requires heavier computations, so appIcon has to be retrieved separately
        installerStore = Utils.getInstallationSource(context, this.packageName)
    )
}

private inline fun <reified T : Enum<T>> String?.toEnumOrDefault(default: T): T =
    if (this == null) default
    else try { enumValueOf(this) } catch (_: IllegalArgumentException) { default }

internal fun JSONObject.toMalwareScanScope(): MalwareScanScope {
    val scanScope = optString("scanScope").toEnumOrDefault(ScopeType.SIDELOADED_ONLY)
    val trustedInstallSources = this.getArraySafe("trustedInstallSources").toList()
    return MalwareScanScope(scanScope, trustedInstallSources.ifEmpty { null })
}

internal fun JSONObject.toSuspiciousAppDetectionConfig(): SuspiciousAppDetectionConfig {
    val packageNames = this.getArraySafe("packageNames").toSet().ifEmpty { null }
    val hashes = this.getArraySafe("hashes").toSet().ifEmpty { null }
    val requestedPermissions = this.getNestedArraySafe("requestedPermissions")
        .map { it.toSet() }.toSet().ifEmpty { null }
    val grantedPermissions = this.getNestedArraySafe("grantedPermissions")
        .map { it.toSet() }.toSet().ifEmpty { null }
    val malwareScanScope = optJSONObject("malwareScanScope")?.toMalwareScanScope()
        ?: MalwareScanScope(ScopeType.SIDELOADED_ONLY, emptyList())
    val reasonMode = optString("reasonMode").toEnumOrDefault(ReasonMode.HIGHEST_CONFIDENCE)
    return SuspiciousAppDetectionConfig(
        packageNames,
        hashes,
        requestedPermissions,
        grantedPermissions,
        malwareScanScope,
        reasonMode
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
