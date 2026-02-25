package com.aheaditec.talsec.cordova.interfaces

import com.aheaditec.talsec.cordova.events.ThreatEvent
import com.aheaditec.talsec_security.security.api.SuspiciousAppInfo
import org.apache.cordova.CallbackContext

internal interface PluginThreatListener {
    var threatCallbackContext: CallbackContext?

    fun threatDetected(threatEventType: ThreatEvent)
    fun malwareDetected(suspiciousApps: MutableList<SuspiciousAppInfo>)
}
