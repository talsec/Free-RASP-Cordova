import Foundation
import TalsecRuntime

@objc(TalsecPlugin) class TalsecPlugin : CDVPlugin {
    public static var shared:TalsecPlugin?
    
    override func pluginInitialize() {
        TalsecContext.context.commandDelegate = self.commandDelegate
        TalsecPlugin.shared = self
    }
    
    @objc(getThreatChannelData:)
    private func getThreatChannelData(command: CDVInvokedUrlCommand) -> Void {
        TalsecContext.sendMessage(msg: [ThreatIdentifiers.threatChannelKey], callbackId: command.callbackId, keepCallback: false)
    }
    
    /**
     * Method to get the random identifiers of callbacks
     */
    @objc(getThreatIdentifiers:)
    private func getThreatIdentifiers(command: CDVInvokedUrlCommand) -> Void {
        let threatIdentifiers = SecurityThreat.allCases
            .filter {
                threat in threat.rawValue != "passcodeChange"
            }
            .map {
                threat in threat.callbackIdentifier
            }
        TalsecContext.sendMessage(msg: threatIdentifiers, callbackId: command.callbackId, keepCallback: false)
    }
    
    @objc(start:)
    func start(command: CDVInvokedUrlCommand) {
        TalsecContext.context.listenerCallbackId = command.callbackId
        
        guard let talsecConfig = command.arguments[0] as? NSDictionary else {
            TalsecContext.sendError(msg: "Missing config parameter in Talsec Native Plugin", callbackId: command.callbackId)
            return
        }
        do {
            try initializeTalsec(talsecConfig: talsecConfig)
        }
        catch let error as NSError {
            TalsecContext.sendError(msg: "Could not initialize freeRASP: \(error.domain)", callbackId: command.callbackId)
            return
        }
        TalsecContext.sendMessage(msg: "started", callbackId: command.callbackId, keepCallback: true)
    }
    
    @objc(onInvalidCallback:)
    private func onInvalidCallback(command: CDVInvokedUrlCommand) -> Void {
        abort()
    }

    @objc(blockScreenCapture:)
    private func blockScreenCapture(command: CDVInvokedUrlCommand) -> Void {
        guard let enable = (command.arguments[0] as? Bool) else {
            TalsecContext.sendError(msg: "Wrong format of the enable argument", callbackId: command.callbackId)
            return
        }
        
        getProtectedWindow { window in
            if let window = window {
                Talsec.blockScreenCapture(enable: enable, window: window)
                TalsecContext.sendMessage(msg: "OK", callbackId: command.callbackId)
            } else {
                TalsecContext.sendError(msg: "No windows found to block screen capture", callbackId: command.callbackId)
            }
        }
    }
    
    @objc(isScreenCaptureBlocked:)
    private func isScreenCaptureBlocked(command: CDVInvokedUrlCommand) -> Void {
        getProtectedWindow { window in
            if let window = window {
                let isBlocked = Talsec.isScreenCaptureBlocked(in: window)
                TalsecContext.sendMessage(msg: isBlocked ? ScreenCaptureStatus.blocked.rawValue : ScreenCaptureStatus.allowed.rawValue, callbackId: command.callbackId)
            } else {
                TalsecContext.sendError(msg: "Error while checking if screen capture is blocked", callbackId: command.callbackId)
            }
        }
    }
    
    private func getProtectedWindow(completion: @escaping (UIWindow?) -> Void) {
        DispatchQueue.main.async {
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                if let window = windowScene.windows.first {
                    completion(window)
                } else {
                    completion(nil)
                }
            } else {
                completion(nil)
            }
        }
    }

    @objc(storeExternalId:)
    private func storeExternalId(command: CDVInvokedUrlCommand) {
        
        guard let data = command.arguments[0] as? String else {
            TalsecContext.sendError(msg: "External id must be String", callbackId: command.callbackId)
            return
        }
        
        UserDefaults.standard.set(data, forKey: "app.talsec.externalid")
        TalsecContext.sendMessage(msg: "OK", callbackId: command.callbackId, keepCallback: false)
    }
    
    func initializeTalsec(talsecConfig: NSDictionary) throws {
        guard let iosConfig = talsecConfig["iosConfig"] as? NSDictionary else {
            throw NSError(domain: "Missing iosConfig parameter in Talsec Native Plugin", code: 1)
        }
        guard let appBundleIds = iosConfig["appBundleIds"] as? String else {
            throw NSError(domain: "Missing appBundleIds parameter in Talsec Native Plugin", code: 2)
        }
        guard let appTeamId = iosConfig["appTeamId"] as? String else {
            throw NSError(domain: "Missing appTeamId parameter in Talsec Native Plugin", code: 3)
        }
        guard let watcherMailAddress = talsecConfig["watcherMail"] as? String else {
            throw NSError(domain: "Missing watcherMail parameter in Talsec Native Plugin", code: 4)
        }
        let isProd = talsecConfig["isProd"] as? Bool ?? true
        
        let config = TalsecConfig(appBundleIds: [appBundleIds], appTeamId: appTeamId, watcherMailAddress: watcherMailAddress, isProd: isProd)
        commandDelegate.run(inBackground: {
            Talsec.start(config: config)
        })
    }
}

enum ScreenCaptureStatus: Int {
    case allowed = 0
    case blocked = 1
}

extension SecurityThreatCenter: SecurityThreatHandler {
    
    public func threatDetected(_ securityThreat: TalsecRuntime.SecurityThreat) {
        // It is better to implement security reactions (e.g. killing the app) here.
        if (securityThreat.rawValue == "passcodeChange") {
            return
        }
        if let listenerCallbackId = TalsecContext.context.listenerCallbackId {
            TalsecContext.sendMessage(msg: [ThreatIdentifiers.threatChannelKey : securityThreat.callbackIdentifier], callbackId: listenerCallbackId)
        }
    }
}

class TalsecContext : CDVPlugin {
    static let context = TalsecContext()
    var listenerCallbackId: String?

    static func sendMessage(msg: Any, callbackId: String, keepCallback: Bool = true) {
        // send the result to JavaScript on the main thread
        DispatchQueue.main.async {
            var pluginResult: CDVPluginResult?

            if let intMsg = msg as? Int {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus_OK,
                    messageAs: intMsg
                )
            } else if let stringMsg = msg as? String {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus_OK,
                    messageAs: stringMsg
                )
            } else if let arrayMsg = msg as? [Any] {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus_OK,
                    messageAs: arrayMsg
                )
            } else if let dictMsg = msg as? [AnyHashable: Any] {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus_OK,
                    messageAs: dictMsg
                )
            }

            pluginResult?.setKeepCallbackAs(keepCallback)
            
            context.commandDelegate?.send(
                pluginResult,
                callbackId: callbackId
            )
        }
    }

    static func sendError(msg: String, callbackId: String) {
        DispatchQueue.main.async {
            // send the result to JavaScript on the main thread
            let pluginResult = CDVPluginResult(
                status: CDVCommandStatus_ERROR,
                messageAs: msg
            )
            
            context.commandDelegate?.send(
                pluginResult,
                callbackId: callbackId
            )
        }
    }
}

struct ThreatIdentifiers {
    static let threatChannelKey = String(Int.random(in: 100_000..<999_999_999))
    static let threatIdentifierList: [Int] = (1...14).map { _ in Int.random(in: 100_000..<999_999_999) }
}

/// An extension to unify callback names with Cordova ones.
extension SecurityThreat {
    var callbackIdentifier: Int {
        switch self {
            case .signature:
                return ThreatIdentifiers.threatIdentifierList[0]
            case .jailbreak:
                return ThreatIdentifiers.threatIdentifierList[1]
            case .debugger:
                return ThreatIdentifiers.threatIdentifierList[2]
            case .runtimeManipulation:
                return ThreatIdentifiers.threatIdentifierList[3]
            case .passcode:
                return ThreatIdentifiers.threatIdentifierList[4]
            case .passcodeChange:
                return ThreatIdentifiers.threatIdentifierList[5]
            case .simulator:
                return ThreatIdentifiers.threatIdentifierList[6]
            case .missingSecureEnclave:
                return ThreatIdentifiers.threatIdentifierList[7]
            case .systemVPN:
                return ThreatIdentifiers.threatIdentifierList[8]
            case .deviceChange:
                return ThreatIdentifiers.threatIdentifierList[9]
            case .deviceID:
                return ThreatIdentifiers.threatIdentifierList[10]
            case .unofficialStore:
                return ThreatIdentifiers.threatIdentifierList[11]
            case .screenshot:
                return ThreatIdentifiers.threatIdentifierList[12]
            case .screenRecording:
                return ThreatIdentifiers.threatIdentifierList[13]

            @unknown default:
                abort()
        }
    }
}
