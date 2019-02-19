import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthJournal } from './healthjournal';

@NgModule({
  declarations: [HealthJournal],
  imports: [IonicPageModule.forChild(HealthJournal)],
    entryComponents: [HealthJournal]
})
export class HealthJournalModule { }