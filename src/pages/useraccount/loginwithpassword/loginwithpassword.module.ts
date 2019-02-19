import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginWithPassword } from './loginwithpassword';

@NgModule({
  declarations: [LoginWithPassword],
  imports: [IonicPageModule.forChild(LoginWithPassword)],
    entryComponents: [LoginWithPassword]
})
export class LoginPageModule { }