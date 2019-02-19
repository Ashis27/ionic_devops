import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DashBoard } from "./dashboard";

@NgModule({
  declarations: [DashBoard],
  imports: [IonicPageModule.forChild(DashBoard)],
    entryComponents: [DashBoard]
})
export class DashBoardModule { }