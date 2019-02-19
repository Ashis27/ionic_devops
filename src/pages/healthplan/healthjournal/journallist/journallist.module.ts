import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthJournalList } from './journallist';

@NgModule({
  declarations: [HealthJournalList],
  imports: [IonicPageModule.forChild(HealthJournalList)],
    entryComponents: [HealthJournalList]
})
export class HealthJournalListModule { }