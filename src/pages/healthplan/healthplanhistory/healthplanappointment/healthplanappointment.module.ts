import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthPlanAppointmentHistory } from './healthplanappointment';


@NgModule({
  declarations: [HealthPlanAppointmentHistory],
  imports: [IonicPageModule.forChild(HealthPlanAppointmentHistory)],
    entryComponents: [HealthPlanAppointmentHistory]
})
export class HealthPlanAppointmentHistoryModule { }