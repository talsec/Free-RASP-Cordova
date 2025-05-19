import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { FreeRaspDemoComponent } from './components/freerasp-demo/freerasp-demo.component';
import { MalwareModalComponent } from './components/malware-modal/malware-modal.component';
import { MalwareItemComponent } from './components/malware-item/malware-item.component';

@NgModule({
  declarations: [
    AppComponent,
    FreeRaspDemoComponent,
    MalwareModalComponent,
    MalwareItemComponent,
  ],
  imports: [BrowserModule, IonicModule.forRoot(), FormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
