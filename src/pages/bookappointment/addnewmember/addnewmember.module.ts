import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddNewMember } from './addnewmember';

@NgModule({
  declarations: [AddNewMember],
  imports: [IonicPageModule.forChild(AddNewMember)],
  exports: [AddNewMember]
})
export class AddNewMemberModule { }