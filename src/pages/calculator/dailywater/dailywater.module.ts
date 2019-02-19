import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DailywaterPage } from './dailywater';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    DailywaterPage,
  ],
  imports: [
    IonicPageModule.forChild(DailywaterPage),RoundProgressModule
  ],
})
export class DailywaterPageModule {}
