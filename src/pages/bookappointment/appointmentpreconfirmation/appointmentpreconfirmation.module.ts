import { NgModule } from '@angular/core';
import { IonicPageModule, Config } from 'ionic-angular';
import { AppointmentPreConfirmation } from './appointmentpreconfirmation';
import { Ionic2RatingModule } from 'ionic2-rating';
import { ModalScaleUpLeaveTransition } from '../appointmentpostconfirmation/scale-up-leave.transition';
import { ModalScaleUpEnterTransition } from '../appointmentpostconfirmation/scale-up-enter.transition';


@NgModule({
  declarations: [AppointmentPreConfirmation],
  imports: [IonicPageModule.forChild(AppointmentPreConfirmation),Ionic2RatingModule],
    entryComponents: [AppointmentPreConfirmation]
})
export class AppointmentPreConfirmationModule { 
  constructor(public config: Config) {
    this.setCustomTransitions();
  }

  private setCustomTransitions() {
    this.config.setTransition('modal-scale-up-leave', ModalScaleUpLeaveTransition);
    this.config.setTransition('modal-scale-up-enter', ModalScaleUpEnterTransition);
  }
}