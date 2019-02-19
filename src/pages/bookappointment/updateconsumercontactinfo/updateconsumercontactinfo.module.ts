import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdateConsumerContactInfo } from './updateconsumercontactinfo';


@NgModule({
  declarations: [UpdateConsumerContactInfo],
  imports: [IonicPageModule.forChild(UpdateConsumerContactInfo)],
  exports: [UpdateConsumerContactInfo]
})
export class AddNewMemberModule { }