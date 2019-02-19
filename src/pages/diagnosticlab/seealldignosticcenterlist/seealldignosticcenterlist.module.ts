import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { SeeAllDiagnosticCenterList } from './seealldignosticcenterlist';


@NgModule({
  declarations: [SeeAllDiagnosticCenterList],
  imports: [IonicPageModule.forChild(SeeAllDiagnosticCenterList),Ionic2RatingModule],
    entryComponents: [SeeAllDiagnosticCenterList]
})
export class SeeAllDiagnosticCenterListModule { }