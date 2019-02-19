import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HospitalProfile } from './hospitalprofile';
import { Ionic2RatingModule } from 'ionic2-rating';


@NgModule({
  declarations: [HospitalProfile],
  imports: [IonicPageModule.forChild(HospitalProfile),Ionic2RatingModule],
    entryComponents: [HospitalProfile]
})
export class HospitalProfileModule { }