import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UploadAppoStatus } from './uploadappostatus';

@NgModule({
  declarations: [UploadAppoStatus],
  imports: [IonicPageModule.forChild(UploadAppoStatus)],
    entryComponents: [UploadAppoStatus]
})
export class UploadAppoStatusModule { }