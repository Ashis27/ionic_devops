import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserProfile } from "./userprofile";
@NgModule({
  declarations: [UserProfile],
  imports: [IonicPageModule.forChild(UserProfile)],
    entryComponents: [UserProfile]
})
export class UserProfileModule { }