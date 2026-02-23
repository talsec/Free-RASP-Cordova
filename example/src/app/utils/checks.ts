export const commonChecks = [
  { name: 'App Integrity', isSecure: true },
  { name: 'Privileged Access', isSecure: true },
  { name: 'Debug', isSecure: true },
  { name: 'Hooks', isSecure: true },
  { name: 'Passcode', isSecure: true },
  { name: 'Simulator', isSecure: true },
  { name: 'Secure Hardware Not Available', isSecure: true },
  { name: 'System VPN', isSecure: true },
  { name: 'Device Binding', isSecure: true },
  { name: 'Unofficial Store', isSecure: true },
  { name: 'Screenshot', isSecure: true },
  { name: 'Screen Recording', isSecure: true },
];

export const iosChecks = [{ name: 'Device ID', isSecure: true }];

export const androidChecks = [
  { name: 'Obfuscation Issues', isSecure: true },
  { name: 'Developer Mode', isSecure: true },
  { name: 'Malware', isSecure: true },
  { name: 'ADB Enabled', isSecure: true },
  { name: 'Multi Instance', isSecure: true },
  { name: 'Time Spoofing', isSecure: true },
  { name: 'Location Spoofing', isSecure: true },
  { name: 'Unsecure Wi-Fi', isSecure: true },
  { name: 'Automation', isSecure: true },
];
