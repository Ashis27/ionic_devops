import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SeeAllHospitals } from './seeallhospitals';
import { Ionic2RatingModule } from 'ionic2-rating';


@NgModule({
  declarations: [SeeAllHospitals],
  imports: [IonicPageModule.forChild(SeeAllHospitals),Ionic2RatingModule],
    entryComponents: [SeeAllHospitals]
})
export class SeeAllHospitalsModule { }