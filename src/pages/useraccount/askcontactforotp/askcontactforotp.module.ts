import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AskContactForOTP } from "./askcontactforotp";
@NgModule({
  declarations: [AskContactForOTP],
  imports: [IonicPageModule.forChild(AskContactForOTP)],
    entryComponents: [AskContactForOTP]
})
export class AskContactForOTPModule { }