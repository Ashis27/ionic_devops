import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { SeeAllPackages } from './seeallpackage';


@NgModule({
  declarations: [SeeAllPackages],
  imports: [IonicPageModule.forChild(SeeAllPackages),Ionic2RatingModule],
    entryComponents: [SeeAllPackages]
})
export class SeeAllPackagesModule { }