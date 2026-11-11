package app.talsec.rasp.cordova.interfaces

import app.talsec.rasp.cordova.events.RaspExecutionStateEvent
import org.apache.cordova.CallbackContext

internal interface PluginExecutionStateListener {
    var executionStateCallbackContext: CallbackContext?

    fun raspExecutionStateChanged(event: RaspExecutionStateEvent)
}
