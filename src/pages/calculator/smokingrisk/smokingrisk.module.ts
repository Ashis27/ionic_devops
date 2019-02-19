import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SmokingriskPage } from './smokingrisk';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    SmokingriskPage,
  ],
  imports: [
    IonicPageModule.forChild(SmokingriskPage),RoundProgressModule
  ],
})
export class SmokingriskPageModule {}
