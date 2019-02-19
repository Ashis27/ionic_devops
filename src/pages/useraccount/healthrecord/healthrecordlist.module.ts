import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthRecordList } from './healthrecordlist';

@NgModule({
  declarations: [HealthRecordList],
  imports: [IonicPageModule.forChild(HealthRecordList)],
    entryComponents: [HealthRecordList]
})
export class HealthRecordListModule { }