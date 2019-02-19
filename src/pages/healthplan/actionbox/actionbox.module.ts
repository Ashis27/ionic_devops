import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ActionBox } from './actionbox';


@NgModule({
  declarations: [ActionBox],
  imports: [IonicPageModule.forChild(ActionBox)],
    entryComponents: [ActionBox]
})
export class ActionaBoxModule { }