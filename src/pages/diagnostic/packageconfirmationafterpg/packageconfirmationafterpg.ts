import { Component } from '@angular/core';
import { App, NavController, NavParams, IonicPage, AlertController, ModalController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';
import * as $ from 'jquery';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { String, StringBuilder } from 'typescript-string-operations';
import { ConsumerNotification } from '../../../interfaces/user-options';
import { CallNumber } from '@ionic-native/call-number';

@IonicPage()
@Component({
  selector: 'page-packageconfirmationafterpg',
  templateUrl: 'packageconfirmationafterpg.html',
  providers: [LocalNotifications, CallNumber]
})
export class PackageConfirmationAfterPG {
  addMembers: string = "ForMeAndFamily";
  appoDetails: any = [];
  userDetails: any;
  leftTime: string;
  upcomingAppoList: any = [];
  selectedDate: string;
  feedbackModuleType: string = "1";
  feedbackQuestionList: any = [];
  feedbackAns: any = [];
  answer: any = {};
  AppoFor: string;
  referenceId: string;
  centerDetails: any = {};
  notificationDetails: ConsumerNotification = { ConsumerID: 0, Contact: "", Email: "", GroupEntityId: 0, ModuleId: 0, Message: "" }
  latestUpcomingAppoDetails: any = [];
  bookingDate: string;
  bookingSlot: string;
  paymentResponse: any = {};
  constructor(private callNumber: CallNumber, public localNotifications: LocalNotifications, public modalCtrl: ModalController, public appCtrl: App, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
    this.appoDetails = this.navParams.get('appoDetails');
    this.AppoFor = this.navParams.get('AppoFor');
    this.referenceId = this.navParams.get('referenceId');
    this.centerDetails = this.navParams.get('centerDetails');
    this.getAppointmentResponse();
    //this.sendEmailThroughSNS();
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userDetails = result;
          this.selectedDate = this.appoDetails[0].BookingDate;
          this.bookingSlot = this.appoDetails[0].BookingSlot;
          this.bookingDate = moment(this.selectedDate).format("Do MMM") + ", " + moment(this.selectedDate).format("YYYY");
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  // ionViewDidEnter() {
  //  // setTimeout(() => {
     
  //  // }, 3000);
  // }
  // ionViewDidLoad() {
  //   setTimeout(() => {
  //     this.retrieveFeedbackQuestionList();
  //   }, 4000);
  // }
  // ionViewDidLeave() {
  //   this.navCtrl.setRoot("DashBoard");
  //   this.appCtrl.getActiveNav().push("BookedPackage");
  // }
  //Sending payment successful notification
  sendPaymentSuccessfulNotification(data) {
    this.localNotifications.schedule({
      id: new Date().getMilliseconds(),
      title: "Payment Successful",
      text: "Thank you, your payment of " + data.BilledAmount + " was processed successful with" + "Reffference Number: " + data.UniqueReference + "and Transaction Number: " + data.TransactionID,
      trigger: { at: new Date(new Date().getTime() + 100) },
      vibrate: true,
      //sound: "file://notification.mp3",
      icon: "file://logo.png",
      //every: "0"
    });
    this.notificationDetails.ModuleId = 0; // Payment transaction module has not been configured in standardcodevalues.
    this.notificationDetails.Message = "Thank you, your payment of " + data.BilledAmount + " was processed successful with" + "Reffference Number: " + data.UniqueReference + "and Transaction Number: " + data.TransactionID;
    this.saveNotification(this.notificationDetails);
  }
  getAppointmentResponse() {
    this._dataContext.GetAppointmentResponseAfterPG(this.referenceId)
      .subscribe(response => {
        if (response.Status) {
          this.paymentResponse = response.Result;
          this.paymentResponse.BilledAmount = this.paymentResponse.BilledAmount.toFixed("2");
          if (response.Result.PaymentStatus && (response.Result.PaymentResponse == "Success" || response.Result.PaymentResponse == "Pending")) {
            if (this.AppoFor != "ForOthers") {
             // this.bookingConfirmationNotification(response.Result);
              //this.sendNotification();
              this.bokingConfirmationNotification();
            }
            this.commonService.onMessageHandler("Your booking has been confirmed",1);
            this.retrieveFeedbackQuestionList();
          }
          else if (!response.Result.PaymentStatus) {
            this.paymentResponse.PaymentResponse = "Failed";
           // this.sendPaymentSuccessfulNotification(response.Result);
            this.showFailedAppoMsg(response.Result);
          }
          else {
            this.paymentResponse.PaymentResponse = "Failed";
          }
          this.appoDetails["TransactionID"] = response.Result.TransactionID;
        }
        else {
          this.commonService.onMessageHandler("Failed to get payment information. Please contact support!", 0);
        }
      },
        error => {
          console.log(error);
        });
  }
  showFailedAppoMsg(data) {
    this.appoCancelledNotification(data);
    let alert = this.alertCtrl.create({
      title: 'Booking Cancelled!',
      message: '<p style="color: #00bebc !important;font-weight: 100 !important;>Dear ' + this.appoDetails.ConsumerName + ', </p><br\>' + '<p> Your booking has been cancelled with refference number ' + data.UniqueReference + '<br\>' + '. We are processing your refund of ' + data.BilledAmount + " as soon as possible. Please cooperate with us.</p>",
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            //this.viewCtrl.dismiss();
            // console.log('Cancel clicked');
          }
        },
        // {
        //   text: 'CALL NOW',
        //   handler: () => {
        //     this._callHospital(data.HospitalContact);
        //   }
        // }

      ]
    });
    alert.present();
  }
  // bookingConfirmationNotification(data) {
  //   this.localNotifications.schedule({
  //     id: new Date().getMilliseconds(),
  //     title: "Booking Confirmation",
  //     text: 'Your booking has been confirmed with refference number ' + data.UniqueReference + ' and Transaction Number ' + data.TransactionID + " in " + this.centerDetails.CenterName,
  //     trigger: { at: new Date(new Date().getTime() + 100) },
  //     vibrate: true,
  //     //sound: "file://notification.mp3",
  //     icon: "file://logo.png",
  //     //every: "0"
  //   });
  //   this.notificationDetails.ModuleId = 0; // Refund amount module has not been configured in standardcodevalues.
  //   this.notificationDetails.Message = 'Your booking has been confirmed with refference number ' + data.UniqueReference + ' and Transaction Number ' + data.TransactionID + " in " + this.centerDetails.CenterName,
  //     this.saveNotification(this.notificationDetails);
  // }
  appoCancelledNotification(data) {
    this.localNotifications.schedule({
      id: new Date().getMilliseconds(),
      title: "Booking Cancelled",
      text: 'Your booking has been cancelled with refference number ' + data.UniqueReference + '. We are processing your refund amount of ' + data.BilledAmount + ' as soon as possible. Please cooperate with us.',
      trigger: { at: new Date(new Date().getTime() + 100) },
      vibrate: true,
      //sound: "file://notification.mp3",
      icon: "file://logo.png",
      //every: "0"
    });
    this.notificationDetails.ModuleId = 0; // Refund amount module has not been configured in standardcodevalues.
    this.notificationDetails.Message = 'Your booking has been cancelled with refference number ' + data.UniqueReference + '. We are processing your refund amount of ' + data.BilledAmount + ' as soon as possible. Please cooperate with us.',
      this.saveNotification(this.notificationDetails);
  }
  //Sending email through SNS
  sendEmailThroughSNS() {
    let emailJsonData = this.commonService.getAWSEmailJsonFormat();
    emailJsonData.email[0].to_email = this.appoDetails.Email;
    emailJsonData.email[0].subject = "Appointment Confirmation";
    emailJsonData.email[0].email_body = "Hey " + this.appoDetails.AppointmentFor + "<br/>" + "Your appointment hass been successfully booked with " + this.appoDetails.ProviderName + " on " + this.appoDetails.Date + " " + this.appoDetails.TimeSlot + "<br/>" + "Team <br/> health Pro";
    emailJsonData.email[0].from_name = this.commonService.getAppTitle();
    this._dataContext.SendEmailThroughSNS(emailJsonData)
      .subscribe(response => {
        if (response.Status) {
          console.log(response);
        }
        else {
          // this.commonService.onMessageHandler(response.Message, 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          //this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  //send notification
  sendNotification() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getNotification"))
      .then((result) => {
        if (result) {
          this.sendNotificationToDevice(result);
        }
        else {
          this.getNotificationConfig();
        }
      });

  }
  bokingConfirmationNotification(){
    this.localNotifications.schedule({
      id: new Date().getMilliseconds(),
      title: "Booking Confirmation!",
      text: "Booking package for " + this.appoDetails[0].BookedForName + " has been confirmed " + " in " + this.centerDetails.CenterName,
      trigger: { at: new Date(new Date().getTime() + 100) },
      vibrate: true,
      //sound: "file://notification.mp3",
      icon: "file://logo.png",
      //every: "0"
    });
    this.notificationDetails.Message = "Booking package for " + this.appoDetails[0].BookedForName + " has been confirmed " + " in " + this.centerDetails.CenterName;
    // }
    this.notificationDetails.Contact = this.appoDetails[0].ContactNo;
    this.saveNotification(this.notificationDetails);
  }
  sendNotificationToDevice(result) {
    // let appointmentNotification = result.filter(item => {
    //   if (item.ModuleName == "Booking Health Package Confirmation") {
    //     return item;
    //   }
    // })
    // if (appointmentNotification.length > 0) {
    //   this.localNotifications.schedule({
    //     id: new Date().getMilliseconds(),
    //     title: appointmentNotification[0].Subject,
    //     text: String.Format(appointmentNotification[0].MessageBody, this.appoDetails.ConsumerName, this.appoDetails.ProviderName, this.appoDetails.Date, this.appoDetails.TimeSlot, this.hospital.Name),
    //     trigger: { at: new Date(new Date().getTime() + 100) },
    //     vibrate: true,
    //     //sound: "file://notification.mp3",
    //     icon: "file://logo.png",
    //     //every: "0"
    //   });
    //   this.notificationDetails.ModuleId = appointmentNotification[0].ModuleId;
    //   this.notificationDetails.Message = String.Format(appointmentNotification[0].MessageBody, this.appoDetails.ConsumerName, this.appoDetails.ProviderName, this.appoDetails.Date, this.appoDetails.TimeSlot, this.hospital.Name);
    // }
    // else {
    this.localNotifications.schedule({
      id: new Date().getMilliseconds(),
      title: "Booking Confirmation!",
      text: "Booking package for " + this.appoDetails.ConsumerName + " has been confirmed " + " in " + this.centerDetails.CenterName,
      trigger: { at: new Date(new Date().getTime() + 100) },
      vibrate: true,
      //sound: "file://notification.mp3",
      icon: "file://logo.png",
      //every: "0"
    });
    this.notificationDetails.Message = "Booking package for " + this.appoDetails.ConsumerName + " has been confirmed " + " in " + this.centerDetails.CenterName;
    // }
    this.notificationDetails.Contact = this.appoDetails.ContactNo;
    this.saveNotification(this.notificationDetails);
  }
  getNotificationConfig() {
    this._dataContext.GetNotificationCofiguration("LocalNotification")
      .subscribe(response => {
        let result: any = response;
        if (result.Result == "OK") {
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getNotification"), result.Data);
          this.sendNotificationToDevice(result.Data);
        }
      },
        error => {
          console.log(error);
        });

  }
  //Save Notification
  saveNotification(data) {
    this._dataContext.SaveNotification(data)
      .subscribe(response => {
        if (response.Status) {

        }
      },
        error => {
          console.log(error);
          //this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  retrievUpcomingAppointments() {
    this._dataContext.GetUserUpcomigAppointments(0, 0, 100, this.appoDetails.ConsumerID)
      .subscribe(response => {
        if (response.Status && response.Result.rows.length > 0) {
          this.upcomingAppoList = response.Result.rows.reverse();
          this.latestUpcomingAppoDetails = this.upcomingAppoList[0];
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
  _callHospital() {
    this.callNumber.callNumber("", true)
      .then(() => {
      })
      .catch(() => {

      });
  }
  cancelAppointment(status, message) {
    let alert = this.alertCtrl.create({
      title: 'Booking Cancellation',
      message: '<p>Please contact the hospital directly for cancellation and reschedule. </p>' + '<br\><br\>' + '<p style="color: #00bebc !important;font-weight: 100 !important;>Contact Number :</p>' + "",
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            //this.viewCtrl.dismiss();
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'CALL NOW',
          handler: () => {
            this._callHospital();
          }
        }
        // {
        //   text: 'Yes',
        //   handler: () => {
        //     // this._dataContext.CancelAppointment(this.latestUpcomingAppoDetails.id)
        //     //   .subscribe(response => {
        //     //     if (response.Status) {
        //     //       this.commonService.onMessageHandler("You have successfully cancelled your appointment.", 1);
        //     //       this.sendCancelNotification();
        //     //       if (status) {
        //     //         this.navCtrl.pop();
        //     //         this.navCtrl.pop();
        //     //       }
        //     //       else {
        //     //         this.navCtrl.setRoot("DashBoard");
        //     //         this.appCtrl.getActiveNav().push("AppointmentHistory");
        //     //       }
        //     //     }
        //     //     else {
        //     //       this.commonService.onMessageHandler(response.Message, 0);
        //     //     }
        //     //   },
        //     //     error => {
        //     //       console.log(error);
        //     //       this.commonService.onMessageHandler("Failed. Please try again.", 0);
        //     //     });
        //   }
        // }
      ]
    });
    alert.present();
  }

  rescheduleAppointment() {
    this.cancelAppointment(true, 'reschedule');
  }

  retrieveFeedbackQuestionList() {
    this._dataContext.GetFeedbackQuestionsForDoctor(this.feedbackModuleType)
      .subscribe(response => {
        if (response.Data.length > 0) {
          this.feedbackQuestionList = response.Data;
          this.setFeedbackVar();
        }

      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  setFeedbackVar() {
    this.feedbackAns = [];
    for (var i = 0; i < this.feedbackQuestionList.length; i++) {
      this.answer = {
        PlatformFeedbackQuestionID: this.feedbackQuestionList[i].PlatformFeedbackQuestionID,
        QuestionType: this.feedbackQuestionList[i].Type,
        Value: this.feedbackQuestionList[i].Type == 2 ? "" : 0,
        FeedbackModuleType: 1   //Appointment Module Type
      };
      this.feedbackAns.push(this.answer);
      this.answer = {};
    }
    let option = {
      showBackdrop: true,
      enableBackdropDismiss: true,
      enterAnimation: 'modal-scale-up-enter',
      // leaveAnimation: 'modal-scale-up-leave'
    }
    let profileModal = this.modalCtrl.create("RateUs", { "consumerId": this.appoDetails.ConsumerID, feedbackQuestion: this.feedbackQuestionList, feedbackAns: this.feedbackAns }, option);
    profileModal.onDidDismiss(item => {
      if (item) {
        console.log(item);
      }
    })
    profileModal.present();
  }
  closeCurrentSection() {
    this.navCtrl.setRoot("DashBoard");
    this.appCtrl.getActiveNav().push("BookedPackage");
  }
  redirectPage(value){
    this.navCtrl.setRoot("DashBoard");
    this.appCtrl.getActiveNav().push(value);
  }
}







