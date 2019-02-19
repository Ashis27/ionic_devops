import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppointmentViewDocumentModalContentPage } from './appointmentdocumentview';


@NgModule({
  declarations: [AppointmentViewDocumentModalContentPage],
  imports: [IonicPageModule.forChild(AppointmentViewDocumentModalContentPage)],
    entryComponents: [AppointmentViewDocumentModalContentPage]
})
export class AppointmentViewDocumentModalContentPageModule { }