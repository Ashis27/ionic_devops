import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthPackageProfile } from './healthpackageprofile';

@NgModule({
  declarations: [HealthPackageProfile],
  imports: [IonicPageModule.forChild(HealthPackageProfile)],
    entryComponents: [HealthPackageProfile]
})
export class HealthPackageProfileModule {}
