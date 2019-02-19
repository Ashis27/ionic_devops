import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VaccinationDetsPage } from './vaccination-dets';

@NgModule({
  declarations: [
    VaccinationDetsPage,
  ],
  imports: [
    IonicPageModule.forChild(VaccinationDetsPage),
  ],
})
export class VaccinationDetsPageModule {}
