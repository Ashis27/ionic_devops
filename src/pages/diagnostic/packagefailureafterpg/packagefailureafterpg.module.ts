import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PackageFailureAfterPG } from './packagefailureafterpg';

@NgModule({
  declarations: [PackageFailureAfterPG],
  imports: [IonicPageModule.forChild(PackageFailureAfterPG)],
    entryComponents: [PackageFailureAfterPG]
})
export class PackageFailureAfterPGModule { }