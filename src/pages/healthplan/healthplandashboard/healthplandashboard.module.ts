import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthPlanDashBoard } from './healthplandashboard';


@NgModule({
  declarations: [HealthPlanDashBoard],
  imports: [IonicPageModule.forChild(HealthPlanDashBoard)],
    entryComponents: [HealthPlanDashBoard]
})
export class HealthPlanDashBoardModule { }