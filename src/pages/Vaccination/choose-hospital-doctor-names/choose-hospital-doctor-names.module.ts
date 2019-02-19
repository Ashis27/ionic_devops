import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChooseHospitalDoctorNamesPage } from './choose-hospital-doctor-names';

@NgModule({
  declarations: [
    ChooseHospitalDoctorNamesPage,
  ],
  imports: [
    IonicPageModule.forChild(ChooseHospitalDoctorNamesPage),
  ],
})
export class ChooseHospitalDoctorNamesPageModule {}
