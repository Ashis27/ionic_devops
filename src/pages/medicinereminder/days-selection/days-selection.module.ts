import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DaysSelectionPage } from './days-selection';

@NgModule({
  declarations: [
    DaysSelectionPage,
  ],
  imports: [
    IonicPageModule.forChild(DaysSelectionPage),
  ],
})
export class DaysSelectionPageModule {}
