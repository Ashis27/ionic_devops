import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BloodpressurePage } from './bloodpressure';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    BloodpressurePage,
  ],
  imports: [
    IonicPageModule.forChild(BloodpressurePage),RoundProgressModule
  ],
})
export class BloodpressurePageModule {}
