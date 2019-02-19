import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ApplicationStartUpPage } from "./applicationstartuppage";
@NgModule({
  declarations: [ApplicationStartUpPage],
  imports: [IonicPageModule.forChild(ApplicationStartUpPage)],
    entryComponents: [ApplicationStartUpPage]
})
export class ApplicationStartUpPageModule { }