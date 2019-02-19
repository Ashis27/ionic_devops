import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LabTestProfile } from './labtestprofile';

@NgModule({
  declarations: [LabTestProfile],
  imports: [IonicPageModule.forChild(LabTestProfile)],
    entryComponents: [LabTestProfile]
})
export class LabTestProfileModule {}
