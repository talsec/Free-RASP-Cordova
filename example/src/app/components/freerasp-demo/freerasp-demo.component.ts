import { Component, Input } from '@angular/core';
import { shieldCheckmarkOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'freerasp-demo',
  templateUrl: './freerasp-demo.component.html',
  styleUrls: ['./freerasp-demo.component.css'],
})
export class FreeRaspDemoComponent {
  @Input() checks: { name: string; isSecure: boolean }[] = [];
  @Input() suspiciousApps: any[] = [];

  shieldCheckmarkIcon = shieldCheckmarkOutline;
  alertCircleIcon = alertCircleOutline;

  constructor() {}
}
