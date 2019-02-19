import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddMedicalInfo } from "./addmedicalinfo";
@NgModule({
  declarations: [AddMedicalInfo],
  imports: [IonicPageModule.forChild(AddMedicalInfo)],
    entryComponents: [AddMedicalInfo]
})
export class AddMedicalInfoModule { }