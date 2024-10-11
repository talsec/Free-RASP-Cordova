import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SuspiciousAppsService {
  private suspiciousAppsSubject = new BehaviorSubject<any[]>([]);
  suspiciousApps$ = this.suspiciousAppsSubject.asObservable();

  setSuspiciousApps(apps: any[]) {
    this.suspiciousAppsSubject.next([...apps]);
  }

  getSuspiciousApps() {
    return this.suspiciousAppsSubject.getValue();
  }
}
