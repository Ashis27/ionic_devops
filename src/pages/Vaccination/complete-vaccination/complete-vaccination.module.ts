import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CompleteVaccinationPage } from './complete-vaccination';

@NgModule({
  declarations: [
    CompleteVaccinationPage,
  ],
  imports: [
    IonicPageModule.forChild(CompleteVaccinationPage),
  ],
})
export class CompleteVaccinationPageModule {}
