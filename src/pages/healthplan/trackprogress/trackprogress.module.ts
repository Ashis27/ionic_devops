import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TrackProgress } from './trackprogress';

@NgModule({
  declarations: [TrackProgress],
  imports: [IonicPageModule.forChild(TrackProgress)],
    entryComponents: [TrackProgress]
})
export class TrackProgressModule { }