import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyFamily } from "./myfamily";
@NgModule({
  declarations: [MyFamily],
  imports: [IonicPageModule.forChild(MyFamily)],
   entryComponents: [MyFamily]
})
export class MyFamilyModule { }