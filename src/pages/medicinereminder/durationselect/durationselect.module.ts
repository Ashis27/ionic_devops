import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DurationselectPage } from './durationselect';
import { DatePickerModule } from 'ion-datepicker';
@NgModule({
  declarations: [
    DurationselectPage,
  ],
  imports: [
    IonicPageModule.forChild(DurationselectPage),DatePickerModule
  ],
})
export class DurationselectPageModule {}
