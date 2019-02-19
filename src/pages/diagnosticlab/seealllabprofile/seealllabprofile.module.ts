import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { SeeAllLabProfile } from './seealllabprofile';


@NgModule({
  declarations: [SeeAllLabProfile],
  imports: [IonicPageModule.forChild(SeeAllLabProfile),Ionic2RatingModule],
    entryComponents: [SeeAllLabProfile]
})
export class SeeAllLabProfileModule { }