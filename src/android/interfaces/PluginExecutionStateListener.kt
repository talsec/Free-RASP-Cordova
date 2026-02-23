package com.aheaditec.talsec.cordova.interfaces

import com.aheaditec.talsec.cordova.events.RaspExecutionStateEvent

internal interface PluginExecutionStateListener {
    fun raspExecutionStateChanged(event: RaspExecutionStateEvent)
}
