import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScanProfile } from './scanprofile';

@NgModule({
  declarations: [ScanProfile],
  imports: [IonicPageModule.forChild(ScanProfile)],
    entryComponents: [ScanProfile]
})
export class ScanProfileModule {}
