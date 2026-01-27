package com.aheaditec.talsec.cordova

import com.aheaditec.talsec.cordova.events.RaspExecutionStateEvent
import com.aheaditec.talsec.cordova.events.ThreatEvent
import com.aheaditec.talsec_security.security.api.ThreatListener
import com.aheaditec.talsec_security.security.api.SuspiciousAppInfo

internal object TalsecThreatHandler : ThreatListener.ThreatDetected, ThreatListener.DeviceState, ThreatListener.RaspExecutionState() {
    internal var detectedThreats = mutableSetOf<ThreatEvent>()
    internal var detectedRaspStateEvents = mutableSetOf<RaspExecutionStateEvent>()
    internal var detectedMalware = mutableSetOf<SuspiciousAppInfo>()
    private var listener: TalsecCordova? = null

    internal fun setNewListener(newListener: TalsecCordova?) {
        listener = newListener
    }

    internal fun hasListener(): Boolean {
        return listener != null
    }

    override fun onRootDetected() {
        ThreatEvent.PrivilegedAccess.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onDebuggerDetected() {
        ThreatEvent.Debug.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onEmulatorDetected() {
        ThreatEvent.Simulator.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onTamperDetected() {
        ThreatEvent.AppIntegrity.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onUntrustedInstallationSourceDetected() {
        ThreatEvent.UnofficialStore.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onHookDetected() {
        ThreatEvent.Hooks.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onDeviceBindingDetected() {
        ThreatEvent.DeviceBinding.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onUnlockedDeviceDetected() {
        ThreatEvent.Passcode.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onHardwareBackedKeystoreNotAvailableDetected() {
        ThreatEvent.SecureHardwareNotAvailable.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onObfuscationIssuesDetected() {
        ThreatEvent.ObfuscationIssues.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onDeveloperModeDetected() {
        ThreatEvent.DevMode.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onADBEnabledDetected() {
        ThreatEvent.ADBEnabled.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onSystemVPNDetected() {
        ThreatEvent.SystemVPN.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onMalwareDetected(suspiciousAppInfos: MutableList<SuspiciousAppInfo>) {
        suspiciousAppInfos.let {
            listener?.malwareDetected(it) ?: detectedMalware.addAll(it)
        }
    }

    override fun onScreenshotDetected() {
        ThreatEvent.Screenshot.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onScreenRecordingDetected() {
        ThreatEvent.ScreenRecording.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onMultiInstanceDetected() {
        ThreatEvent.MultiInstance.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onUnsecureWifiDetected() {
        ThreatEvent.UnsecureWifi.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onTimeSpoofingDetected() {
        ThreatEvent.TimeSpoofing.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onLocationSpoofingDetected() {
        ThreatEvent.LocationSpoofing.let {
            listener?.threatDetected(it) ?: detectedThreats.add(it)
        }
    }

    override fun onAllChecksFinished() {
        RaspExecutionStateEvent.AllChecksFinished.let {
            listener?.raspExecutionStateChanged(it) ?: detectedRaspStateEvents.add(it)
        }
    }

    internal interface TalsecCordova {
        fun threatDetected(threatEventType: ThreatEvent)

        fun raspExecutionStateChanged(event: RaspExecutionStateEvent)

        fun malwareDetected(suspiciousApps: MutableList<SuspiciousAppInfo>)
    }

}