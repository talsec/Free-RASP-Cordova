package com.aheaditec.talsec.cordova.dispatchers

import com.aheaditec.talsec.cordova.events.RaspExecutionStateEvent
import com.aheaditec.talsec.cordova.interfaces.PluginExecutionStateListener
import org.apache.cordova.CallbackContext

internal object ExecutionStateDispatcher {
    private lateinit var listener: PluginExecutionStateListener
    private val cache = mutableSetOf<RaspExecutionStateEvent>()

    private var isAppInForeground = false
    private var isListenerRegistered = false

    fun registerListener(newListener: PluginExecutionStateListener, callbackContext: CallbackContext?) {
        listener = newListener
        listener.executionStateCallbackContext = callbackContext
        isListenerRegistered = true
        isAppInForeground = true
        flushCache()
    }

    fun unregisterListener() {
        isListenerRegistered = false
        isAppInForeground = false
        listener.executionStateCallbackContext = null
    }

    fun onResume() {
        isAppInForeground = true
        if (isListenerRegistered) {
            flushCache()
        }
    }

    fun onPause() {
        isAppInForeground = false
    }

    fun dispatch(event: RaspExecutionStateEvent) {
        if (isAppInForeground && isListenerRegistered) {
            listener.raspExecutionStateChanged(event)
        } else {
            synchronized(cache) {
                cache.add(event)
            }
        }
    }

    private fun flushCache() {
        if (!isListenerRegistered || !isAppInForeground) {
            return
        }
        val events = synchronized(cache) {
            val snapshot = cache.toSet()
            cache.clear()
            snapshot
        }
        events.forEach { listener.raspExecutionStateChanged(it) }
    }
}
