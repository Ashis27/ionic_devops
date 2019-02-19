import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CityLocation } from "./citylocation";
@NgModule({
  declarations: [CityLocation],
  imports: [IonicPageModule.forChild(CityLocation)],
    entryComponents: [CityLocation]
})
export class CityLocationModule { }