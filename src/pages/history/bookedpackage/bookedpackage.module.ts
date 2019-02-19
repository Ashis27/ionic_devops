import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookedPackage } from './bookedpackage';


@NgModule({
  declarations: [BookedPackage],
  imports: [IonicPageModule.forChild(BookedPackage)],
    entryComponents: [BookedPackage]
})
export class BookedPackageModule { }