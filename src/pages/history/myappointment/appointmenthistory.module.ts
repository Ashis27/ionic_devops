import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppointmentHistory } from './appointmenthistory';


@NgModule({
  declarations: [AppointmentHistory],
  imports: [IonicPageModule.forChild(AppointmentHistory)],
    entryComponents: [AppointmentHistory]
})
export class AppointmentHistoryModule { }