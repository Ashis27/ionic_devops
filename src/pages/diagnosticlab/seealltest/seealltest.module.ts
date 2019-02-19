import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { SeeAllTest } from './seealltest';


@NgModule({
  declarations: [SeeAllTest],
  imports: [IonicPageModule.forChild(SeeAllTest),Ionic2RatingModule],
    entryComponents: [SeeAllTest]
})
export class SeeAllTestModule { }