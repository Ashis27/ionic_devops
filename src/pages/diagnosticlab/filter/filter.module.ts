import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DCFilter } from './filter';

@NgModule({
  declarations: [DCFilter],
  imports: [IonicPageModule.forChild(DCFilter)],
    entryComponents: [DCFilter]
})
export class DCFilterModule {}
