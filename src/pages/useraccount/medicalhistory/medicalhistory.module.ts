import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MedicalHistory } from "./medicalhistory";
@NgModule({
  declarations: [MedicalHistory],
  imports: [IonicPageModule.forChild(MedicalHistory)],
    entryComponents: [MedicalHistory]
})
export class MedicalHistoryModule { }