package com.aheaditec.talsec.cordova

import com.aheaditec.talsec_security.security.api.SuspiciousAppInfo
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

    override fun onMalwareDetected(suspiciousAppInfos: MutableList<SuspiciousAppInfo>?) {
        listener?.malwareDetected(suspiciousAppInfos ?: mutableListOf())
    }

    override fun onDeveloperModeDetected() {
        listener?.threatDetected(Threat.DevMode)
    }

    override fun onADBEnabledDetected() {
        listener?.threatDetected(Threat.ADBEnabled)
    }

    override fun onSystemVPNDetected() {
        listener?.threatDetected(Threat.SystemVPN)
    }

    override fun onScreenshotDetected() {
        listener?.threatDetected(Threat.Screenshot)

    }

    override fun onScreenRecordingDetected() {
        listener?.threatDetected(Threat.ScreenRecording)
    }

    override fun onMultiInstanceDetected() {
        listener?.threatDetected(Threat.MultiInstance)
    }

    internal interface TalsecCordova {
        fun threatDetected(threatType: Threat)

        fun malwareDetected(suspiciousApps: MutableList<SuspiciousAppInfo>)
    }
}