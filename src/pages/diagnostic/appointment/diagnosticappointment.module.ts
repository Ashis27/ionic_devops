import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { DiagnosticAppointment } from './diagnosticappointment';


@NgModule({
  declarations: [DiagnosticAppointment],
  imports: [IonicPageModule.forChild(DiagnosticAppointment),Ionic2RatingModule],
    entryComponents: [DiagnosticAppointment]
})
export class DiagnosticAppointmentModule { }