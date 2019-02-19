import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { SeeAllDiagnosticCenters } from './seealldignosticcenter';


@NgModule({
  declarations: [SeeAllDiagnosticCenters],
  imports: [IonicPageModule.forChild(SeeAllDiagnosticCenters),Ionic2RatingModule],
    entryComponents: [SeeAllDiagnosticCenters]
})
export class SeeAllDiagnosticCentersModule { }