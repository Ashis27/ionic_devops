import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthPlanDiagnosticAppointmentHistory } from './healthplandiagnosticappointment';



@NgModule({
  declarations: [HealthPlanDiagnosticAppointmentHistory],
  imports: [IonicPageModule.forChild(HealthPlanDiagnosticAppointmentHistory)],
    entryComponents: [HealthPlanDiagnosticAppointmentHistory]
})
export class HealthPlanDiagnosticAppointmentHistoryModule { }