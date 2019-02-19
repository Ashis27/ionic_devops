import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Feedback } from "./feedback";
import { Ionic2RatingModule } from 'ionic2-rating';

@NgModule({
  declarations: [Feedback],
  imports: [IonicPageModule.forChild(Feedback),Ionic2RatingModule],
    entryComponents: [Feedback]
})
export class ReferralCodeModule { }