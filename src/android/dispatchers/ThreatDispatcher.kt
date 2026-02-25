package com.aheaditec.talsec.cordova.dispatchers

import com.aheaditec.talsec.cordova.events.ThreatEvent
import com.aheaditec.talsec.cordova.interfaces.PluginThreatListener
import com.aheaditec.talsec_security.security.api.SuspiciousAppInfo
import org.apache.cordova.CallbackContext

internal class ThreatDispatcher(private val listener: PluginThreatListener) {
    private val threatCache = mutableSetOf<ThreatEvent>()
    private val malwareCache = mutableSetOf<SuspiciousAppInfo>()

    private var isAppListening = false

    fun registerListener(callbackContext: CallbackContext?) {
        listener.threatCallbackContext = callbackContext
        isAppListening = true
        flushCache()
    }

    fun unregisterListener() {
        isAppListening = false
        listener.threatCallbackContext = null
    }

    fun onResume() {
        if (listener.threatCallbackContext == null) {
            return
        }
        isAppListening = true
        flushCache()
    }

    fun onPause() {
        isAppListening = false
    }

    fun dispatchThreat(event: ThreatEvent) {
        if (isAppListening) {
            listener.threatDetected(event)
        } else {
            synchronized(threatCache) {
                threatCache.add(event)
            }
        }
    }

    fun dispatchMalware(apps: MutableList<SuspiciousAppInfo>) {
        if (isAppListening) {
            listener.malwareDetected(apps)
        } else {
            synchronized(malwareCache) {
                malwareCache.addAll(apps)
            }
        }
    }

    private fun flushCache() {
        val threats = synchronized(threatCache) {
            val snapshot = threatCache.toSet()
            threatCache.clear()
            snapshot
        }
        threats.forEach { listener.threatDetected(it) }

        val malware = synchronized(malwareCache) {
            val snapshot = malwareCache.toMutableList()
            malwareCache.clear()
            snapshot
        }
        if (malware.isNotEmpty()) {
            listener.malwareDetected(malware)
        }
    }
}
