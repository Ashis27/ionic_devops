import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatinineclearencePage } from './creatinineclearence';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    CreatinineclearencePage,
  ],
  imports: [
    IonicPageModule.forChild(CreatinineclearencePage),RoundProgressModule
  ],
})
export class CreatinineclearencePageModule {}
