import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserNotification } from './notification';

@NgModule({
  declarations: [UserNotification],
  imports: [IonicPageModule.forChild(UserNotification)],
    entryComponents: [UserNotification]
})
export class UserNotificationModule { }