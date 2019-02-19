import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SeeAllDoctors } from './seealldoctors';
import { Ionic2RatingModule } from 'ionic2-rating';


@NgModule({
  declarations: [SeeAllDoctors],
  imports: [IonicPageModule.forChild(SeeAllDoctors),Ionic2RatingModule],
    entryComponents: [SeeAllDoctors]
})
export class SeeAllDoctorsModule { }