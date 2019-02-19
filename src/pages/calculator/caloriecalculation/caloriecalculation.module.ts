import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CaloriecalculationPage } from './caloriecalculation';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    CaloriecalculationPage,
  ],
  imports: [
    IonicPageModule.forChild(CaloriecalculationPage),RoundProgressModule
  ],
})
export class CaloriecalculationPageModule {}
