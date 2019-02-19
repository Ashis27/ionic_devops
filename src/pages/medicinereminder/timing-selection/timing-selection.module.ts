import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TimingSelectionPage } from './timing-selection';

@NgModule({
  declarations: [
    TimingSelectionPage,
  ],
  imports: [
    IonicPageModule.forChild(TimingSelectionPage),
  ],
})
export class TimingSelectionPageModule {}
