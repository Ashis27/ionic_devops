import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PregnancyDashboard } from './pregnancydashboard';


@NgModule({
  declarations: [PregnancyDashboard],
  imports: [IonicPageModule.forChild(PregnancyDashboard)],
    entryComponents: [PregnancyDashboard]
})
export class PregnancyDashboardModule { }