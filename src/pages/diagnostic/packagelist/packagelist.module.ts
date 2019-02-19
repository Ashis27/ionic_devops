import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PackageList } from './packagelist';
import { Ionic2RatingModule } from 'ionic2-rating';

@NgModule({
  declarations: [PackageList],
  imports: [IonicPageModule.forChild(PackageList),Ionic2RatingModule],
    entryComponents: [PackageList]
})
export class PackageListModule {}
