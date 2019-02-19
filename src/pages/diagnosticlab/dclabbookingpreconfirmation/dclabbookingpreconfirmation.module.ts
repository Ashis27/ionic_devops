import { NgModule } from '@angular/core';
import { IonicPageModule, Config } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { ModalScaleUpLeaveTransition } from '../../bookappointment/appointmentpostconfirmation/scale-up-leave.transition';
import { ModalScaleUpEnterTransition } from '../../bookappointment/appointmentpostconfirmation/scale-up-enter.transition';
import { DCLabBookingpPreConfirmation } from './dclabbookingpreconfirmation';
import { TooltipsModule } from 'ionic-tooltips';

@NgModule({
  declarations: [DCLabBookingpPreConfirmation],
  imports: [IonicPageModule.forChild(DCLabBookingpPreConfirmation),Ionic2RatingModule,TooltipsModule],
    entryComponents: [DCLabBookingpPreConfirmation]
})
export class DCLabBookingpPreConfirmationModule { 
  constructor(public config: Config) {
    this.setCustomTransitions();
  }

  private setCustomTransitions() {
    this.config.setTransition('modal-scale-up-leave', ModalScaleUpLeaveTransition);
    this.config.setTransition('modal-scale-up-enter', ModalScaleUpEnterTransition);
  }
}