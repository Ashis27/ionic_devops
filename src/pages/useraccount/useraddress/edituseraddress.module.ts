import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditUserAddress } from "./edituseraddress";


@NgModule({
  declarations: [EditUserAddress],
  imports: [IonicPageModule.forChild(EditUserAddress)],
    entryComponents: [EditUserAddress]
})
export class EditUserAddressModule { }