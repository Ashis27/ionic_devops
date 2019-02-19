import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { DiagnosticCenterProfile } from './diagnosticcenterprofile';

@NgModule({
  declarations: [DiagnosticCenterProfile],
  imports: [IonicPageModule.forChild(DiagnosticCenterProfile),Ionic2RatingModule],
    entryComponents: [DiagnosticCenterProfile]
})
export class DiagnosticCenterProfileModule {}
