import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResetPassword } from "./resetpassword";
@NgModule({
  declarations: [ResetPassword],
  imports: [IonicPageModule.forChild(ResetPassword)],
    entryComponents: [ResetPassword]
})
export class ResetPasswordModule { }