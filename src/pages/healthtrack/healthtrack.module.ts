import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthTrack } from './healthtrack';


@NgModule({
  declarations: [HealthTrack],
  imports: [IonicPageModule.forChild(HealthTrack)],
    entryComponents: [HealthTrack]
})
export class HealthTracktModule { }