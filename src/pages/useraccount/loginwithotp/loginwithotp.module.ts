import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginWithOTP } from './loginwithotp';
@NgModule({
  declarations: [LoginWithOTP],
  imports: [IonicPageModule.forChild(LoginWithOTP)],
    entryComponents: [LoginWithOTP]
})
export class LoginPageModule { }