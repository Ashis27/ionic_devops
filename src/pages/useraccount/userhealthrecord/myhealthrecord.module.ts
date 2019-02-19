import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyHealthRecord } from "./myhealthrecord";
import {RoundProgressModule} from 'angular-svg-round-progressbar';
@NgModule({
  declarations: [MyHealthRecord],
  imports: [IonicPageModule.forChild(MyHealthRecord),RoundProgressModule],
   entryComponents: [MyHealthRecord]
})
export class MyHealthRecordModule { }