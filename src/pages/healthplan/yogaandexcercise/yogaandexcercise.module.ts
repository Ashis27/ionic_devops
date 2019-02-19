import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { YogeAndExcercise } from './yogaandexcercise';


@NgModule({
  declarations: [YogeAndExcercise],
  imports: [IonicPageModule.forChild(YogeAndExcercise)],
    entryComponents: [YogeAndExcercise]
})
export class YogeAndExcerciseModule { }