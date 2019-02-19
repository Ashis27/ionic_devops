import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HeightweightPage } from './heightweight';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    HeightweightPage,
  ],
  imports: [
    IonicPageModule.forChild(HeightweightPage),RoundProgressModule
  ],
})
export class HeightweightPageModule {}
