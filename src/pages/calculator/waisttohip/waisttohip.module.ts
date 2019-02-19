import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WaisttohipPage } from './waisttohip';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    WaisttohipPage,
  ],
  imports: [
    IonicPageModule.forChild(WaisttohipPage),RoundProgressModule
  ],
})
export class WaisttohipPageModule {}
