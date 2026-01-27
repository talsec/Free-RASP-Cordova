import { getThreatChannelData, prepareMapping } from '../../channels/threat';
import { onInvalidCallback } from '../methods/native';
import { Threat } from '../../models/threat';
import { ThreatEventActions } from '../../types/types';
import { parseMalwareData } from '../../utils/malware';

export const registerThreatListener = async (
  config: ThreatEventActions,
): Promise<void> => {
  await prepareMapping();
  const [key, malwareKey] = await getThreatChannelData();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventListener = async (event: any) => {
    switch (event[key]) {
      case Threat.PrivilegedAccess.value:
        config.privilegedAccess?.();
        break;
      case Threat.Debug.value:
        config.debug?.();
        break;
      case Threat.Simulator.value:
        config.simulator?.();
        break;
      case Threat.AppIntegrity.value:
        config.appIntegrity?.();
        break;
      case Threat.UnofficialStore.value:
        config.unofficialStore?.();
        break;
      case Threat.Hooks.value:
        config.hooks?.();
        break;
      case Threat.DeviceBinding.value:
        config.deviceBinding?.();
        break;
      case Threat.Passcode.value:
        config.passcode?.();
        break;
      case Threat.Overlay.value:
        config.overlay?.();
        break;
      case Threat.SecureHardwareNotAvailable.value:
        config.secureHardwareNotAvailable?.();
        break;
      case Threat.ObfuscationIssues.value:
        config.obfuscationIssues?.();
        break;
      case Threat.DeviceID.value:
        config.deviceID?.();
        break;
      case Threat.DevMode.value:
        config.devMode?.();
        break;
      case Threat.SystemVPN.value:
        config.systemVPN?.();
        break;
      case Threat.Malware.value:
        config.malware?.(await parseMalwareData(event[malwareKey]));
        break;
      case Threat.ADBEnabled.value:
        config.adbEnabled?.();
        break;
      case Threat.Screenshot.value:
        config.screenshot?.();
        break;
      case Threat.ScreenRecording.value:
        config.screenRecording?.();
        break;
      case Threat.MultiInstance.value:
        config.multiInstance?.();
        break;
      case Threat.TimeSpoofing.value:
        config.timeSpoofing?.();
        break;
      case Threat.LocationSpoofing.value:
        config.locationSpoofing?.();
        break;
      case Threat.UnsecureWifi.value:
        config.unsecureWifi?.();
        break;
      default:
        onInvalidCallback();
        break;
    }
  };
  cordova.exec(
    eventListener,
    (error: any) => {
      console.error(`Error during RASP+ events listener attaching: ${error}`);
    },
    'TalsecPlugin',
    'registerListener',
    [],
  );
};
