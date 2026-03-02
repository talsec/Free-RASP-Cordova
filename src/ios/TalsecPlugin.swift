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
        TalsecContext.sendMessage(msg: [EventIdentifiers.threatChannelKey], callbackId: command.callbackId, keepCallback: false)
    }
    
    /**
     * Method to get the random identifiers of callbacks
     */
    @objc(getThreatIdentifiers:)
    private func getThreatIdentifiers(command: CDVInvokedUrlCommand) -> Void {
        let threatIdentifiers = getCordovaThreatIdentifiers()
        TalsecContext.sendMessage(msg: threatIdentifiers, callbackId: command.callbackId, keepCallback: false)
    }
    
    @objc(getRaspExecutionStateChannelData:)
    private func getRaspExecutionStateChannelData(command: CDVInvokedUrlCommand) -> Void {
        TalsecContext.sendMessage(msg: [EventIdentifiers.raspExecutionStateChannelKey], callbackId: command.callbackId, keepCallback: false)
    }
    
    /**
     * Method to get the random identifiers of callbacks
     */
    @objc(getRaspExecutionStateIdentifiers:)
    private func getRaspExecutionStateIdentifiers(command: CDVInvokedUrlCommand) -> Void {
        let threatIdentifiers = getCordovaRaspExecutionStateIdentifiers()
        TalsecContext.sendMessage(msg: threatIdentifiers, callbackId: command.callbackId, keepCallback: false)
    }
    
    @objc(start:)
    func start(command: CDVInvokedUrlCommand) {
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
        TalsecContext.sendMessage(msg: "started", callbackId: command.callbackId, keepCallback: false)
    }
  
    @objc(registerListener:)
    private func registerListener(command: CDVInvokedUrlCommand) {
        TalsecContext.context.threatCallbackCordova = command.callbackId
        ThreatDispatcher.shared.listener = { threat in
            TalsecContext.sendMessage(msg: [EventIdentifiers.threatChannelKey : threat.callbackIdentifier], callbackId: command.callbackId)
        }
    }

    @objc(registerRaspExecutionStateListener:)
    private func registerRaspExecutionStateListener(command: CDVInvokedUrlCommand) {
        TalsecContext.context.raspExecutionStateCallbackCordova = command.callbackId
        ExecutionStateDispatcher.shared.listener = { event in
             TalsecContext.sendMessage(msg: [EventIdentifiers.raspExecutionStateChannelKey : event.callbackIdentifier], callbackId: command.callbackId)
        }
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
            if #available(iOS 13.0, *) {
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
    
    @objc(removeExternalId:)
    private func removeExternalId(command: CDVInvokedUrlCommand) {
        UserDefaults.standard.removeObject(forKey: "app.talsec.externalid")
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

extension SecurityThreatCenter: @retroactive SecurityThreatHandler, @retroactive RaspExecutionState {
    
    public func threatDetected(_ securityThreat: TalsecRuntime.SecurityThreat) {
        if (securityThreat.rawValue == "passcodeChange") {
            return
        }
        ThreatDispatcher.shared.dispatch(threat: securityThreat)
    }
    
    public func onAllChecksFinished() {
        ExecutionStateDispatcher.shared.dispatch(event: RaspExecutionStates.allChecksFinished)
    }
}

class TalsecContext : CDVPlugin {
    static let context = TalsecContext()
    var threatCallbackCordova: String?
    var raspExecutionStateCallbackCordova: String?

    static func sendMessage(msg: Any, callbackId: String, keepCallback: Bool = true) {
        // send the result to JavaScript on the main thread
        DispatchQueue.main.async {
            var pluginResult: CDVPluginResult?

            if let intMsg = msg as? Int {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus.ok,
                    messageAs: intMsg
                )
            } else if let stringMsg = msg as? String {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus.ok,
                    messageAs: stringMsg
                )
            } else if let arrayMsg = msg as? [Any] {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus.ok,
                    messageAs: arrayMsg
                )
            } else if let dictMsg = msg as? [AnyHashable: Any] {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus.ok,
                    messageAs: dictMsg
                )
            }

            if let result = pluginResult {
                result.setKeepCallbackAs(keepCallback)
                
                context.commandDelegate?.send(
                    result,
                    callbackId: callbackId
                )
            } else {
                TalsecContext.sendError(msg: "Unsupported operation", callbackId: callbackId)
            }
        }
    }

    static func sendError(msg: String, callbackId: String) {
        DispatchQueue.main.async {
            // send the result to JavaScript on the main thread
            let pluginResult = CDVPluginResult(
                status: CDVCommandStatus.error,
                messageAs: msg
            )
            
            context.commandDelegate?.send(
                pluginResult,
                callbackId: callbackId
            )
        }
    }
}