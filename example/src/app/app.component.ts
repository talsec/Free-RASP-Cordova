import { Component, OnInit, NgZone } from '@angular/core';
import { commonChecks, iosChecks, androidChecks } from './utils/checks';
import { SuspiciousAppsService } from './services/suspicious-apps.service';

declare var cordova: any;
declare var talsec: any;

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

  config = {
    androidConfig: {
      packageName: 'com.cordova.example',
      certificateHashes: ['AKoRuyLMM91E7lX/Zqp3u4jMmd0A7hH/Iqozu0TMVd0='],
      malware: {
        blocklistedHashes: ['FgvSehLMM91E7lX/Zqp3u4jMmd0A7hH/Iqozu0TMVd0u'],
        blocklistedPackageNames: ['com.wultra.app.screenlogger'],
        blocklistedPermissions: [
          ['android.permission.BLUETOOTH', 'android.permission.INTERNET'],
          ['android.permission.INTERNET'],
          ['android.permission.BATTERY_STATS'],
        ],
        whitelistedInstallationSources: ['com.apkpure.aegon'],
      },
    },
    iosConfig: {
      appBundleIds: 'com.cordova.example',
      appTeamId: 'your_team_ID',
    },
    watcherMail: 'your_email_address@example.com',
    isProd: true,
  };

  constructor(
    private zone: NgZone,
    private suspiciousAppsService: SuspiciousAppsService,
  ) {}

  ngOnInit() {
    document.addEventListener('deviceready', async () => {
      await this.startFreeRASP();
      if (cordova.platformId === 'android') {
        await this.addItemsToMalwareWhitelist();
      }
    });
  }

  async startFreeRASP() {
    this.appChecks = [
      ...commonChecks,
      ...(cordova.platformId === 'ios' ? iosChecks : androidChecks),
    ];
    try {
      await talsec.start(this.config, this.actions);
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
    malware: (detectedApps: any[]) => {
      this.updateMalware(detectedApps);
      this.updateAppChecks('Malware');
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

  updateMalware(susApps: any) {
    this.zone.run(() => {
      this.suspiciousAppsService.setSuspiciousApps([...susApps]);
    });
  }
}
