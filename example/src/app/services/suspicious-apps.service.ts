import { Injectable } from '@angular/core';
import { SuspiciousAppInfo } from 'cordova-talsec-plugin-freerasp';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SuspiciousAppsService {
  private suspiciousAppsSubject = new BehaviorSubject<any[]>([]);
  suspiciousApps$ = this.suspiciousAppsSubject.asObservable();

  setSuspiciousApps(apps: SuspiciousAppInfo[]) {
    this.suspiciousAppsSubject.next([...apps]);
  }

  getSuspiciousApps() {
    return this.suspiciousAppsSubject.getValue();
  }
}
