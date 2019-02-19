import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MedicineList } from './medicine-list';

@NgModule({
  declarations: [
    MedicineList,
  ],
  imports: [
    IonicPageModule.forChild(MedicineList),
  ],
})
export class MedicineListPageModule {}
