import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthPlanProfile } from './healthplanprofile';

@NgModule({
  declarations: [HealthPlanProfile],
  imports: [IonicPageModule.forChild(HealthPlanProfile)],
    entryComponents: [HealthPlanProfile]
})
export class HealthPlanProfileModule { }