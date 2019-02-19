import { NgModule } from '@angular/core';
import { IonicPageModule, Config } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { ModalScaleUpLeaveTransition } from './scale-up-leave.transition';
import { ModalScaleUpEnterTransition } from './scale-up-enter.transition';
import { PackageConfirmationAfterPG } from './packageconfirmationafterpg';

@NgModule({
  declarations: [PackageConfirmationAfterPG],
  imports: [IonicPageModule.forChild(PackageConfirmationAfterPG),Ionic2RatingModule],
    entryComponents: [PackageConfirmationAfterPG]
})
export class PackageConfirmationAfterPGModule { 
  constructor(public config: Config) {
    this.setCustomTransitions();
  }

  private setCustomTransitions() {
    this.config.setTransition('modal-scale-up-leave', ModalScaleUpLeaveTransition);
    this.config.setTransition('modal-scale-up-enter', ModalScaleUpEnterTransition);
  }
}