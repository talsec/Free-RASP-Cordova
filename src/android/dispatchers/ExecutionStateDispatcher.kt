package com.aheaditec.talsec.cordova.dispatchers

import com.aheaditec.talsec.cordova.events.RaspExecutionStateEvent
import com.aheaditec.talsec.cordova.interfaces.PluginExecutionStateListener
import org.apache.cordova.CallbackContext

internal class ExecutionStateDispatcher(private val listener: PluginExecutionStateListener) {
    private val cache = mutableSetOf<RaspExecutionStateEvent>()

    private var isAppListening = false

    fun registerListener(callbackContext: CallbackContext?) {
        listener.executionStateCallbackContext = callbackContext
        isAppListening = true
        flushCache()
    }

    fun unregisterListener() {
        isAppListening = false
        listener.executionStateCallbackContext = null
    }

    fun onResume() {
        if (listener.executionStateCallbackContext == null) {
            return
        }
        isAppListening = true
        flushCache()
    }

    fun onPause() {
        isAppListening = false
    }

    fun dispatch(event: RaspExecutionStateEvent) {
        if (isAppListening) {
            listener.raspExecutionStateChanged(event)
        } else {
            synchronized(cache) {
                cache.add(event)
            }
        }
    }

    private fun flushCache() {
        val events = synchronized(cache) {
            val snapshot = cache.toSet()
            cache.clear()
            snapshot
        }
        events.forEach { listener.raspExecutionStateChanged(it) }
    }
}
