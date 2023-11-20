package com.aheaditec.talsec.cordova

import com.aheaditec.talsec_security.security.api.ThreatListener

internal object TalsecThreatHandler : ThreatListener.ThreatDetected, ThreatListener.DeviceState {
    internal var listener: TalsecCordova? = null

    override fun onRootDetected() {
        listener?.threatDetected(Threat.PrivilegedAccess)
    }

    override fun onDebuggerDetected() {
        listener?.threatDetected(Threat.Debug)
    }

    override fun onEmulatorDetected() {
        listener?.threatDetected(Threat.Simulator)
    }

    override fun onTamperDetected() {
        listener?.threatDetected(Threat.AppIntegrity)
    }

    override fun onUntrustedInstallationSourceDetected() {
        listener?.threatDetected(Threat.UnofficialStore)
    }

    override fun onHookDetected() {
        listener?.threatDetected(Threat.Hooks)
    }

    override fun onDeviceBindingDetected() {
        listener?.threatDetected(Threat.DeviceBinding)
    }

    override fun onUnlockedDeviceDetected() {
        listener?.threatDetected(Threat.Passcode)
    }

    override fun onHardwareBackedKeystoreNotAvailableDetected() {
        listener?.threatDetected(Threat.SecureHardwareNotAvailable)
    }

    override fun onObfuscationIssuesDetected() {
        listener?.threatDetected(Threat.ObfuscationIssues)
    }

    internal interface TalsecCordova {
        fun threatDetected(threatType: Threat)
    }
}