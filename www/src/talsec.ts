/* global cordova */

import {
  storeExternalId,
  addToWhitelist,
  getAppIcon,
  blockScreenCapture,
  isScreenCaptureBlocked,
} from './api/methods/native';
import { start } from './api/methods/cordova';

// @ts-ignore
module.exports = {
  start,
  addToWhitelist,
  getAppIcon,
  blockScreenCapture,
  isScreenCaptureBlocked,
  storeExternalId,
};
