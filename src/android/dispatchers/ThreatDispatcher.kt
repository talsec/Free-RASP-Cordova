package com.aheaditec.talsec.cordova.dispatchers

import com.aheaditec.talsec.cordova.events.ThreatEvent
import com.aheaditec.talsec.cordova.interfaces.PluginThreatListener
import com.aheaditec.talsec_security.security.api.SuspiciousAppInfo

internal class ThreatDispatcher {
    private val threatCache = mutableSetOf<ThreatEvent>()
    private val malwareCache = mutableSetOf<SuspiciousAppInfo>()

    var listener: PluginThreatListener? = null
        set(value) {
            field = value
            if (value != null) {
                flushCache(value)
            }
        }

    fun dispatchThreat(event: ThreatEvent) {
        val currentListener = listener
        if (currentListener != null) {
            currentListener.threatDetected(event)
        } else {
            synchronized(threatCache) {
                val checkedListener = listener
                checkedListener?.threatDetected(event) ?: threatCache.add(event)
            }
        }
    }

    fun dispatchMalware(apps: MutableList<SuspiciousAppInfo>) {
        val currentListener = listener
        if (currentListener != null) {
            currentListener.malwareDetected(apps)
        } else {
            synchronized(malwareCache) {
                val checkedListener = listener
                checkedListener?.malwareDetected(apps) ?: malwareCache.addAll(apps)
            }
        }
    }

    private fun flushCache(registeredListener: PluginThreatListener) {
        val threats = synchronized(threatCache) {
            val snapshot = threatCache.toSet()
            threatCache.clear()
            snapshot
        }
        threats.forEach { registeredListener.threatDetected(it) }

        val malware = synchronized(malwareCache) {
            val snapshot = malwareCache.toMutableList()
            malwareCache.clear()
            snapshot
        }
        if (malware.isNotEmpty()) {
            registeredListener.malwareDetected(malware)
        }
    }
}
