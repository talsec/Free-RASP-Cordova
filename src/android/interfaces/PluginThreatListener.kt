package com.aheaditec.talsec.cordova.interfaces

import app.talsec.rasp.security.api.SuspiciousAppInfo
import com.aheaditec.talsec.cordova.events.ThreatEvent
import org.apache.cordova.CallbackContext

internal interface PluginThreatListener {
    var threatCallbackContext: CallbackContext?

    fun threatDetected(threatEventType: ThreatEvent)
    fun malwareDetected(suspiciousApps: MutableList<SuspiciousAppInfo>)
}
