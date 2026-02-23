import { Component, OnInit, NgZone } from '@angular/core';
import { commonChecks, iosChecks, androidChecks } from './utils/checks';
import { SuspiciousAppsService } from './services/suspicious-apps.service';
import { SuspiciousAppInfo, Talsec } from 'cordova-talsec-plugin-freerasp';

declare var cordova: any;
declare var talsec: Talsec;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
})
export class AppComponent implements OnInit {
  appChecks = [
    ...commonChecks,
    ...(cordova.platformId === 'ios' ? iosChecks : androidChecks),
  ];
  screenCaptureBlocked: boolean = false;
  platformId = cordova.platformId;
  isModalOpen = false;
  inputText = '';
  showToast = false;
  toastMessage = '';
  toastColor: 'success' | 'warning' = 'success';
  checksFinished = false;

  config = {
    androidConfig: {
      packageName: 'io.ionic.starter',
      certificateHashes: ['AKoRuyLMM91E7lX/Zqp3u4jMmd0A7hH/Iqozu0TMVd0='],
      malwareConfig: {
        blacklistedHashes: ['FgvSehLMM91E7lX/Zqp3u4jMmd0A7hH/Iqozu0TMVd0u'],
        blacklistedPackageNames: ['io.ionic.starter'],
        suspiciousPermissions: [
          [
            'android.permission.INTERNET',
            'android.permission.ACCESS_COARSE_LOCATION',
          ],
          ['android.permission.BLUETOOTH'],
          ['android.permission.BATTERY_STATS'],
        ],
        whitelistedInstallationSources: ['com.apkpure.aegon'],
      },
    },
    iosConfig: {
      appBundleIds: 'io.ionic.starter',
      appTeamId: 'your_team_ID',
    },
    watcherMail: 'your_email_address@example.com',
    isProd: true,
  };

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onInputChange(event: any) {
    this.inputText = event.target.value;
  }

  async handleModalSend() {
    try {
      await talsec.storeExternalId(this.inputText);
      this.toastColor = 'success';
      this.toastMessage = 'External ID stored';
    } catch (error: any) {
      this.toastColor = 'warning';
      this.toastMessage = `Error while storing external ID ${error.message}`;
    }

    this.showToast = true;

    this.closeModal();
  }

  async handleRemoveExternalId() {
    try {
      await talsec.removeExternalId();
      this.toastColor = 'success';
      this.toastMessage = 'External ID removed';
    } catch (error: any) {
      this.toastColor = 'warning';
      this.toastMessage = `Error while removing external ID ${error.message}`;
    }

    this.showToast = true;

    this.closeModal();
  }

  constructor(
    private zone: NgZone,
    private suspiciousAppsService: SuspiciousAppsService,
  ) {}

  ngOnInit() {
    document.addEventListener('deviceready', async () => {
      await this.startFreeRASP();
      if (cordova.platformId === 'android') {
        await this.addItemsToMalwareWhitelist();
        await this.checkScreenCaptureStatus();
        this.requestPermissions();
      }
    });
  }

  requestPermissions() {
    const permissions = cordova.plugins.permissions;
    const list = [
      permissions.ACCESS_FINE_LOCATION,
      permissions.ACCESS_COARSE_LOCATION,
    ];

    permissions.requestPermissions(
      list,
      (status: any) => {
        if (!status.hasPermission) {
          console.log('Permissions not granted');
        }
      },
      (error: any) => {
        console.error('Error requesting permissions', error);
      },
    );
  }

  async startFreeRASP() {
    this.appChecks = [
      ...commonChecks,
      ...(cordova.platformId === 'ios' ? iosChecks : androidChecks),
    ];
    try {
      await talsec.start(this.config, this.actions, this.raspExecutionStateActions);
      console.log('freeRASP initialized.');
    } catch (error: any) {
      console.log('Error during freeRASP initialization: ', error);
    }
  }

  actions = {
    privilegedAccess: () => this.updateAppChecks('Privileged Access'),
    debug: () => this.updateAppChecks('Debug'),
    simulator: () => this.updateAppChecks('Simulator'),
    appIntegrity: () => this.updateAppChecks('App Integrity'),
    unofficialStore: () => this.updateAppChecks('Unofficial Store'),
    hooks: () => this.updateAppChecks('Hooks'),
    deviceBinding: () => this.updateAppChecks('Device Binding'),
    secureHardwareNotAvailable: () =>
      this.updateAppChecks('Secure Hardware Not Available'),
    systemVPN: () => this.updateAppChecks('System VPN'),
    passcode: () => this.updateAppChecks('Passcode'),
    deviceID: () => this.updateAppChecks('Device ID'),
    obfuscationIssues: () => this.updateAppChecks('Obfuscation Issues'),
    devMode: () => this.updateAppChecks('Developer Mode'),
    malware: (detectedApps: SuspiciousAppInfo[]) => {
      this.updateMalware(detectedApps);
      this.updateAppChecks('Malware');
    },
    adbEnabled: () => this.updateAppChecks('ADB Enabled'),
    screenshot: () => this.updateAppChecks('Screenshot'),
    screenRecording: () => this.updateAppChecks('Screen Recording'),
    multiInstance: () => this.updateAppChecks('Multi Instance'),
    timeSpoofing: () => this.updateAppChecks('Time Spoofing'),
    locationSpoofing: () => this.updateAppChecks('Location Spoofing'),
    unsecureWifi: () => this.updateAppChecks('Unsecure Wi-Fi'),
    automation: () => this.updateAppChecks('Automation'),
  };

  raspExecutionStateActions = {
    allChecksFinished: () => {
      this.zone.run(() => {
        this.checksFinished = true;
      });
      console.log('All checks finished');
    },
  };

  async addItemsToMalwareWhitelist() {
    const appsToWhitelist = ['io.ionic.starter', 'com.example.myApp'];

    await Promise.all(
      appsToWhitelist.map(async (app) => {
        try {
          const whitelistResponse = await talsec.addToWhitelist(app);
          console.info(
            `${app} stored to Malware Whitelist: ${whitelistResponse}`,
          );
        } catch (error) {
          console.info('Malware whitelist failed: ', error);
        }
      }),
    );
  }

  updateAppChecks(threatName: string) {
    this.zone.run(() => {
      this.appChecks = this.appChecks.map((threat) =>
        threat.name === threatName ? { ...threat, isSecure: false } : threat,
      );
    });
  }

  updateMalware(susApps: SuspiciousAppInfo[]) {
    this.zone.run(() => {
      this.suspiciousAppsService.setSuspiciousApps([...susApps]);
    });
  }

  async toggleScreenCapture(enable: boolean) {
    try {
      await talsec.blockScreenCapture(enable);
      console.info(
        `Screen capture blocking is ${enable ? 'enabled' : 'disabled'}.`,
      );
      this.zone.run(() => {
        this.screenCaptureBlocked = enable;
      });
    } catch (e) {
      console.error('Error while changing screen capture blocking status:');
    }
  }

  async checkScreenCaptureStatus() {
    try {
      const isBlocked = await talsec.isScreenCaptureBlocked();
      this.zone.run(() => {
        this.screenCaptureBlocked = isBlocked;
      });
    } catch (e) {
      console.error('Error checking screen capture blocking status:');
    }
  }
}
