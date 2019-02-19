import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ApplyCouponCode } from './applycouponcode';


@NgModule({
  declarations: [ApplyCouponCode],
  imports: [IonicPageModule.forChild(ApplyCouponCode)],
    entryComponents: [ApplyCouponCode]
})
export class ApplyCouponCodeModule { }