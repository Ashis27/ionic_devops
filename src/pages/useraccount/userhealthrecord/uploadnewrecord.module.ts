import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UploadNewRecord } from './uploadnewrecord';


@NgModule({
  declarations: [UploadNewRecord],
  imports: [IonicPageModule.forChild(UploadNewRecord)],
    entryComponents: [UploadNewRecord]
})
export class UploadNewRecordModule { }