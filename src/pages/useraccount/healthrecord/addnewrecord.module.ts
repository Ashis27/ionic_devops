import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddNewRecord } from './addnewrecord';


@NgModule({
  declarations: [AddNewRecord],
  imports: [IonicPageModule.forChild(AddNewRecord)],
    entryComponents: [AddNewRecord]
})
export class AddNewRecordModule { }