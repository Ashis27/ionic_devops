import { NgModule } from '@angular/core';
import { IonicPageModule, Config } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { AppointmentPostConfirmation } from './appointmentpostconfirmation';
import { ModalScaleUpLeaveTransition } from './scale-up-leave.transition';
import { ModalScaleUpEnterTransition } from './scale-up-enter.transition';

@NgModule({
  declarations: [AppointmentPostConfirmation],
  imports: [IonicPageModule.forChild(AppointmentPostConfirmation),Ionic2RatingModule],
    entryComponents: [AppointmentPostConfirmation]
})
export class AppointmentPostConfirmationModule { 
  constructor(public config: Config) {
    this.setCustomTransitions();
  }

  private setCustomTransitions() {
    this.config.setTransition('modal-scale-up-leave', ModalScaleUpLeaveTransition);
    this.config.setTransition('modal-scale-up-enter', ModalScaleUpEnterTransition);
  }
}