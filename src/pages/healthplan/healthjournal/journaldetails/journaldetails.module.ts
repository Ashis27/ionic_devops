import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthJournalDetails } from './journaldetails';


@NgModule({
  declarations: [HealthJournalDetails],
  imports: [IonicPageModule.forChild(HealthJournalDetails)],
    entryComponents: [HealthJournalDetails]
})
export class HealthJournalDetailsModule { }