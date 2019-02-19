import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyFamilyList } from "./myfamilylist";


@NgModule({
  declarations: [MyFamilyList],
  imports: [IonicPageModule.forChild(MyFamilyList)],
   entryComponents: [MyFamilyList]
})
export class MyHealthRecordModule { }