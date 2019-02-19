import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Appointment } from './appointment';
import { Ionic2RatingModule } from 'ionic2-rating';


@NgModule({
  declarations: [Appointment],
  imports: [IonicPageModule.forChild(Appointment),Ionic2RatingModule],
    entryComponents: [Appointment]
})
export class AppointmentModule { }