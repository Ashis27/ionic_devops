import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserWallet } from './userwallet';


@NgModule({
  declarations: [UserWallet],
  imports: [IonicPageModule.forChild(UserWallet)],
    entryComponents: [UserWallet]
})
export class UserWalletModule { }