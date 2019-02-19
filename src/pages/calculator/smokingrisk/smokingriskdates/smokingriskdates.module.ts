import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SmokingriskdatesPage } from './smokingriskdates';
import { DatePickerModule } from 'ion-datepicker';
@NgModule({
  declarations: [
    SmokingriskdatesPage,
  ],
  imports: [
    IonicPageModule.forChild(SmokingriskdatesPage),DatePickerModule
  ],
})
export class SmokingriskdatesPageModule {}
