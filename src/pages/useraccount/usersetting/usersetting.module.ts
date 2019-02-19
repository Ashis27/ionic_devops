import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserSetting } from './usersetting';



@NgModule({
  declarations: [UserSetting],
  imports: [IonicPageModule.forChild(UserSetting)],
    entryComponents: [UserSetting]
})
export class UserWalletModule { }