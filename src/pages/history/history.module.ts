import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserHistory } from './history';


@NgModule({
  declarations: [UserHistory],
  imports: [IonicPageModule.forChild(UserHistory)],
    entryComponents: [UserHistory]
})
export class UserHistoryModule { }