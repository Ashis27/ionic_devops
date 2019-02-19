import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReferralCode } from "./userreferral";

@NgModule({
  declarations: [ReferralCode],
  imports: [IonicPageModule.forChild(ReferralCode)],
    entryComponents: [ReferralCode]
})
export class ReferralCodeModule { }