import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { DiagnosticLabBooking } from './dcappointment';

@NgModule({
  declarations: [DiagnosticLabBooking],
  imports: [IonicPageModule.forChild(DiagnosticLabBooking),Ionic2RatingModule],
    entryComponents: [DiagnosticLabBooking]
})
export class DiagnosticLabBookingModule { }