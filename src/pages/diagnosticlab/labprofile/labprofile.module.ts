import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LabProfile } from './labprofile';

@NgModule({
  declarations: [LabProfile],
  imports: [IonicPageModule.forChild(LabProfile)],
    entryComponents: [LabProfile]
})
export class LabProfileModule {}
