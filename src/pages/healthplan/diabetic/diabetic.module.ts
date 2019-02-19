import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Diabetic } from './diabetic';


@NgModule({
  declarations: [Diabetic],
  imports: [IonicPageModule.forChild(Diabetic)],
    entryComponents: [Diabetic]
})
export class DiabeticModule { }