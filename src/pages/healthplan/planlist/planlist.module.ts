import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlanList } from './planlist';


@NgModule({
  declarations: [PlanList],
  imports: [IonicPageModule.forChild(PlanList)],
    entryComponents: [PlanList]
})
export class PlanListModule { }