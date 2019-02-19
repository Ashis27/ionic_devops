import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DoctorList } from './doctorlist';
import { Ionic2RatingModule } from 'ionic2-rating';


@NgModule({
  declarations: [DoctorList],
  imports: [IonicPageModule.forChild(DoctorList),Ionic2RatingModule],
    entryComponents: [DoctorList]
})
export class DoctorListModule { }