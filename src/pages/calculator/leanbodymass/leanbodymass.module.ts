import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LeanbodymassPage } from './leanbodymass';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [
    LeanbodymassPage,
  ],
  imports: [
    IonicPageModule.forChild(LeanbodymassPage),RoundProgressModule
  ],
})
export class LeanbodymassPageModule {}
