import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Vaccine } from './Vaccination';

@NgModule({
  declarations: [
    Vaccine,
  ],
  imports: [
    IonicPageModule.forChild(Vaccine),
  ],
})
export class VaccineModule {}
