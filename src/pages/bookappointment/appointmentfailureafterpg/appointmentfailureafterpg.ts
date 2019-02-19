import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import { LocalNotifications } from '@ionic-native/local-notifications';

@IonicPage()
@Component({
  selector: 'page-appointmentfailureafterpg',
  templateUrl: 'appointmentfailureafterpg.html',
  providers: [LocalNotifications]
})
export class AppointmentFailureAfterPG {
  referenceId: string;
  orderDetails: any = {};
  constructor(public localNotifications: LocalNotifications, public navParams: NavParams, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {
    this.referenceId = this.navParams.get('referenceId');
    this.getAppointmentResponse();
    this.sendNotification();
  }
  sendNotification() {
    this.localNotifications.schedule({
      id: new Date().getMilliseconds(),
      title: "Payment Failed",
      text: "Oops!! Something went wrong. Your payment request was Declined.",
      trigger: { at: new Date(new Date().getTime() + 100) },
      vibrate: true,
      //sound: "file://notification.mp3",
      icon: "file://logo.png",
      //every: "0"
    });
  }
  getAppointmentResponse() {
    this._dataContext.GetAppointmentResponseAfterPG(this.referenceId)
      .subscribe(response => {
        if (response.Status) {
          this.orderDetails = response.Result;
        }
        else {
          this.commonService.onMessageHandler("Failed to get payment information. Please contact support!", 0);
        }
      },
        error => {
          console.log(error);
        });
  }
  bookAgain() {
    this.navCtrl.push("DashBoard");
    this.navCtrl.push("BookAppointment");
  }
  backToDashBoard() {
    this.navCtrl.push("DashBoard");
  }
}
