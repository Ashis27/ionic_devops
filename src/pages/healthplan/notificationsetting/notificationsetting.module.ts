import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationSetting } from './notificationsetting';

@NgModule({
  declarations: [NotificationSetting],
  imports: [IonicPageModule.forChild(NotificationSetting)],
    entryComponents: [NotificationSetting]
})
export class NotificationSettingModule { }