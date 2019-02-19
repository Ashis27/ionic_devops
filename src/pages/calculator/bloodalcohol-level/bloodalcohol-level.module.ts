import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BloodalcoholLevelPage } from './bloodalcohol-level';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    BloodalcoholLevelPage,
  ],
  imports: [
    IonicPageModule.forChild(BloodalcoholLevelPage),RoundProgressModule
  ],
})
export class BloodalcoholLevelPageModule {}
