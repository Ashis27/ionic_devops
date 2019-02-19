import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Referral } from './referral';

@NgModule({
  declarations: [Referral],
  imports: [IonicPageModule.forChild(Referral)],
    entryComponents: [Referral]
})
export class ReferralModule { }