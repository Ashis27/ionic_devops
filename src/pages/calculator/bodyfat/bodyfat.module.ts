import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BodyfatPage } from './bodyfat';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    BodyfatPage,
  ],
  imports: [
    IonicPageModule.forChild(BodyfatPage),RoundProgressModule
  ],
})
export class BodyfatPageModule {}
