import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PregnancyForm } from './pregnancyform';


@NgModule({
  declarations: [PregnancyForm],
  imports: [IonicPageModule.forChild(PregnancyForm)],
    entryComponents: [PregnancyForm]
})
export class PregnancyFormModule { }