import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { SeeAllHealthPackage } from './seeallhealthpackage';


@NgModule({
  declarations: [SeeAllHealthPackage],
  imports: [IonicPageModule.forChild(SeeAllHealthPackage),Ionic2RatingModule],
    entryComponents: [SeeAllHealthPackage]
})
export class SeeAllHealthPackageModule { }