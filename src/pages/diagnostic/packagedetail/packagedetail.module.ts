import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PackageDetail } from './packagedetail';

@NgModule({
  declarations: [PackageDetail],
  imports: [IonicPageModule.forChild(PackageDetail)],
    entryComponents: [PackageDetail]
})
export class PackageDetailModule {}
