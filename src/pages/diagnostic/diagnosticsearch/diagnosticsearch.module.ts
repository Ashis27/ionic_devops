import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiagnosticSearch } from './diagnosticsearch';
import { Ionic2RatingModule } from 'ionic2-rating';

@NgModule({
  declarations: [DiagnosticSearch],
  imports: [IonicPageModule.forChild(DiagnosticSearch),Ionic2RatingModule],
    entryComponents: [DiagnosticSearch]
})
export class DiagnosticSearchModule {}
