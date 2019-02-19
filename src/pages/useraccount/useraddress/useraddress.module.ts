import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserAddress } from "./useraddress";

@NgModule({
  declarations: [UserAddress],
  imports: [IonicPageModule.forChild(UserAddress)],
    entryComponents: [UserAddress]
})
export class UserAddressModule { }