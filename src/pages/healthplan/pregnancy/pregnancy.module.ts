import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Pregnancy } from './pregnancy';


@NgModule({
  declarations: [Pregnancy],
  imports: [IonicPageModule.forChild(Pregnancy)],
    entryComponents: [Pregnancy]
})
export class PregnancyModule { }