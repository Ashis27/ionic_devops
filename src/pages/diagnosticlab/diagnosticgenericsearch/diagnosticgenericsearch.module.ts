import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { DiagnosticGenericSearch } from './diagnosticgenericsearch';

@NgModule({
  declarations: [DiagnosticGenericSearch],
  imports: [IonicPageModule.forChild(DiagnosticGenericSearch),Ionic2RatingModule],
    entryComponents: [DiagnosticGenericSearch]
})
export class DiagnosticGenericSearchModule {}
