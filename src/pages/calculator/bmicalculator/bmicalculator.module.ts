import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BmicalculatorPage } from './bmicalculator';
import {RoundProgressModule} from 'angular-svg-round-progressbar';

@NgModule({
  declarations: [
    BmicalculatorPage,
  ],
  imports: [
    IonicPageModule.forChild(BmicalculatorPage),RoundProgressModule
  ],
})
export class BmicalculatorPageModule {}
