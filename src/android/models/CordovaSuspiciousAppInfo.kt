package com.aheaditec.talsec.cordova.models

import kotlinx.serialization.Serializable


/**
 * Simplified, serializable wrapper for Talsec's SuspiciousAppInfo
 */
@Serializable
data class CordovaSuspiciousAppInfo(
    val packageInfo: CordovaPackageInfo,
    val reason: String,
)

/**
 * Simplified, serializable wrapper for Android's PackageInfo
 */
@Serializable
data class CordovaPackageInfo(
    val packageName: String,
    val appName: String?,
    val version: String?,
    val appIcon: String?,
    val installerStore: String?
)
