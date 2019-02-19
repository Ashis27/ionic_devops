import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PregnancyNotification } from './pregnancynotification';


@NgModule({
  declarations: [PregnancyNotification],
  imports: [IonicPageModule.forChild(PregnancyNotification)],
    entryComponents: [PregnancyNotification]
})
export class PregnancyNotificationModule { }