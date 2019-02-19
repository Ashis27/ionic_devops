import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserAccount } from "./useraccount";

@NgModule({
  declarations: [UserAccount],
  imports: [IonicPageModule.forChild(UserAccount)],
    entryComponents: [UserAccount]
})
export class UserAccountModule { }