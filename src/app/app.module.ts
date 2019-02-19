import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
// import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { HealthProApp } from './app.component';
import { ConferenceData } from '../providers/conference-data';
import { CommonServices } from "../providers/common.service";
import { DataContext } from "../providers/dataContext.service";
import { HttpService } from "../providers/http.service";
import { Geolocation } from '@ionic-native/geolocation';
import { CacheModule } from 'ionic-cache';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Device } from '@ionic-native/device';
import { CodePush } from '@ionic-native/code-push';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import { DatePickerModule } from 'ion-datepicker';
@NgModule({
  declarations: [
    HealthProApp,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(HealthProApp),
    IonicStorageModule.forRoot(),
    CacheModule.forRoot(),
    BrowserAnimationsModule,
    DatePickerModule,
    
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    HealthProApp,
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ConferenceData,
    CommonServices,
    DataContext,
    // InAppBrowser,
    HttpService,
    SplashScreen,
    Geolocation,
    SocialSharing,
    Device,
    CodePush,
    AndroidPermissions
  ]
})
export class AppModule { }
