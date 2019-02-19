import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OTPVerification } from "./otpverification";

@NgModule({
  declarations: [OTPVerification],
  imports: [IonicPageModule.forChild(OTPVerification)],
    entryComponents: [OTPVerification]
})
export class OTPVerificationModule { }