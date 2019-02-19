import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BlooddonationduedatePage } from './blooddonationduedate';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    BlooddonationduedatePage,
  ],
  imports: [
    IonicPageModule.forChild(BlooddonationduedatePage),RoundProgressModule
  ],
})
export class BlooddonationduedatePageModule {}
