import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PregnancyduedatePage } from './pregnancyduedate';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    PregnancyduedatePage,
  ],
  imports: [
    IonicPageModule.forChild(PregnancyduedatePage),RoundProgressModule
  ],
})
export class PregnancyduedatePageModule {}
