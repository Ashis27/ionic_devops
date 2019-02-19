import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OvulationPage } from './ovulation';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    OvulationPage,
  ],
  imports: [
    IonicPageModule.forChild(OvulationPage),RoundProgressModule
  ],
})
export class OvulationPageModule {}
