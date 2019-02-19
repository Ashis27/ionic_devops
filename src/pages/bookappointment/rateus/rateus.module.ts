import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RateUs } from "./rateus";
@NgModule({
  declarations: [RateUs],
  imports: [IonicPageModule.forChild(RateUs)],
  exports: [RateUs]
})
export class RateUsModule { }