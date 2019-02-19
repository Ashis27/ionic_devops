import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BloodsugarconversionPage } from './bloodsugarconversion';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    BloodsugarconversionPage,
  ],
  imports: [
    IonicPageModule.forChild(BloodsugarconversionPage),RoundProgressModule
  ],
})
export class BloodsularconversionPageModule {}
