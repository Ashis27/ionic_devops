import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DietPlan } from './dietplan';

@NgModule({
  declarations: [DietPlan],
  imports: [IonicPageModule.forChild(DietPlan)],
    entryComponents: [DietPlan]
})
export class DietPlanModule { }