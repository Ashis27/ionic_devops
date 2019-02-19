import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TutorialPage } from "./tutorial";
@NgModule({
  declarations: [TutorialPage],
  imports: [IonicPageModule.forChild(TutorialPage)],
    entryComponents: [TutorialPage]
})
export class TutorialPageModule { }