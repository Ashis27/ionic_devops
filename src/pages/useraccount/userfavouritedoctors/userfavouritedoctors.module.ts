import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserFavouriteDoctors } from './userfavouritedoctors';


@NgModule({
  declarations: [UserFavouriteDoctors],
  imports: [IonicPageModule.forChild(UserFavouriteDoctors)],
    entryComponents: [UserFavouriteDoctors]
})
export class UserFavouriteDoctorsModule { }