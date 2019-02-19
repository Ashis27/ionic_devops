import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShareHealthRecord } from './sharerecord';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

@NgModule({
  declarations: [ShareHealthRecord],
  imports: [IonicPageModule.forChild(ShareHealthRecord),RoundProgressModule],
    entryComponents: [ShareHealthRecord]
})
export class ShareHealthRecordModule { }