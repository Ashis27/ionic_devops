import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { SeeAllScan } from './seeallscan';


@NgModule({
  declarations: [SeeAllScan],
  imports: [IonicPageModule.forChild(SeeAllScan),Ionic2RatingModule],
    entryComponents: [SeeAllScan]
})
export class SeeAllScanModule { }