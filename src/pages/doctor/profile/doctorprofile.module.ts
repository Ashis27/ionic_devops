import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DoctorProfile } from './doctorprofile';
import { Ionic2RatingModule } from 'ionic2-rating';


@NgModule({
  declarations: [DoctorProfile],
  imports: [IonicPageModule.forChild(DoctorProfile),Ionic2RatingModule ],
    entryComponents: [DoctorProfile]
})
export class DoctorProfileModule { }