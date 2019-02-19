import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VaccineStatusPage } from './vaccine-status';

@NgModule({
  declarations: [
    VaccineStatusPage,
  ],
  imports: [
    IonicPageModule.forChild(VaccineStatusPage),
  ],
})
export class VaccineStatusPageModule {}
