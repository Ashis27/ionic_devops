import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HeartbeatPage } from './heartbeat';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    HeartbeatPage,
  ],
  imports: [
    IonicPageModule.forChild(HeartbeatPage),RoundProgressModule
  ],
})
export class HeartbeatPageModule {}