import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookAppointment } from './bookappointment';


@NgModule({
  declarations: [BookAppointment],
  imports: [IonicPageModule.forChild(BookAppointment)],
    entryComponents: [BookAppointment]
})
export class BookAppointmentModule { }