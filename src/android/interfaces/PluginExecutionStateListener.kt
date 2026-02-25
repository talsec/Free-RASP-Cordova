package com.aheaditec.talsec.cordova.interfaces

import com.aheaditec.talsec.cordova.events.RaspExecutionStateEvent
import org.apache.cordova.CallbackContext

internal interface PluginExecutionStateListener {
    var executionStateCallbackContext: CallbackContext?

    fun raspExecutionStateChanged(event: RaspExecutionStateEvent)
}
