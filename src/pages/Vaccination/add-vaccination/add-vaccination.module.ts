import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddVaccinationPage } from './add-vaccination';

@NgModule({
  declarations: [
    AddVaccinationPage,
  ],
  imports: [
    IonicPageModule.forChild(AddVaccinationPage),
  ],
})
export class AddVaccinationPageModule {}

