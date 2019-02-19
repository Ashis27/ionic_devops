import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { HospitalForEmergency } from './emergency';


@NgModule({
  declarations: [HospitalForEmergency],
  imports: [IonicPageModule.forChild(HospitalForEmergency),Ionic2RatingModule],
    entryComponents: [HospitalForEmergency]
})
export class HospitalForEmergencyModule { }