import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PregnancyAppointment } from './pregnancyappointment';


@NgModule({
  declarations: [PregnancyAppointment],
  imports: [IonicPageModule.forChild(PregnancyAppointment)],
    entryComponents: [PregnancyAppointment]
})
export class PregnancyAppointmentModule { }