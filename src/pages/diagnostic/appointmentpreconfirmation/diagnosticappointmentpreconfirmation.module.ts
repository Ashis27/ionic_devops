import { NgModule } from '@angular/core';
import { IonicPageModule, Config } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';
import { ModalScaleUpLeaveTransition } from '../../bookappointment/appointmentpostconfirmation/scale-up-leave.transition';
import { ModalScaleUpEnterTransition } from '../../bookappointment/appointmentpostconfirmation/scale-up-enter.transition';
import { DiagnosticAppointmentPreConfirmation } from './diagnosticappointmentpreconfirmation';


@NgModule({
  declarations: [DiagnosticAppointmentPreConfirmation],
  imports: [IonicPageModule.forChild(DiagnosticAppointmentPreConfirmation),Ionic2RatingModule],
    entryComponents: [DiagnosticAppointmentPreConfirmation]
})
export class DiagnosticAppointmentPreConfirmationModule { 
  constructor(public config: Config) {
    this.setCustomTransitions();
  }

  private setCustomTransitions() {
    this.config.setTransition('modal-scale-up-leave', ModalScaleUpLeaveTransition);
    this.config.setTransition('modal-scale-up-enter', ModalScaleUpEnterTransition);
  }
}