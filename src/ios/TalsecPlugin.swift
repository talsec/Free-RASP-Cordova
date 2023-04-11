import Foundation
import TalsecRuntime

@objc(TalsecPlugin) class TalsecPlugin : CDVPlugin {
    @objc(start:)
    func start(command: CDVInvokedUrlCommand) {
        SecurityThreatContainer.shared.callbackId = command.callbackId
        SecurityThreatContainer.shared.commandDelegate = self.commandDelegate
        
        guard let talsecConfig = command.arguments[0] as? NSDictionary else {
            sendError(msg: "Missing config parameter in Talsec Native Plugin")
            return
        }
        do {
            try initializeTalsec(talsecConfig: talsecConfig)
        }
        catch let error as NSError {
            sendError(msg: error.localizedDescription)
            return
        }
        
        DispatchQueue.main.async {
            let pluginResult = CDVPluginResult(
                status: CDVCommandStatus_OK,
                messageAs: "started"
            )

            pluginResult?.setKeepCallbackAs(true)

            SecurityThreatContainer.shared.commandDelegate!.send(
                pluginResult,
                callbackId: SecurityThreatContainer.shared.callbackId
            )
        }
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
    
    func sendError(msg: String) {
        let pluginResult = CDVPluginResult(
            status: CDVCommandStatus_ERROR,
            messageAs: msg
        )
        
        SecurityThreatContainer.shared.commandDelegate!.send(
            pluginResult,
            callbackId: SecurityThreatContainer.shared.callbackId
        )
    }
}

extension SecurityThreatCenter: SecurityThreatHandler {
    public func threatDetected(_ securityThreat: TalsecRuntime.SecurityThreat) {
        // It is better to implement security reactions (e.g. killing the app) here.
        
        DispatchQueue.main.async {
            let pluginResult = CDVPluginResult(
                status: CDVCommandStatus_OK,
                messageAs: securityThreat.rawValue
            )

            pluginResult?.setKeepCallbackAs(true)

            SecurityThreatContainer.shared.commandDelegate!.send(
                pluginResult,
                callbackId: SecurityThreatContainer.shared.callbackId
            )
        }
    }
}

class SecurityThreatContainer : CDVPlugin {
    static let shared = SecurityThreatContainer()
    var callbackId = "0"
}
