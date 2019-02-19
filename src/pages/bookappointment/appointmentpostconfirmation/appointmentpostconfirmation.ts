import { Component } from '@angular/core';
import { App, NavController, NavParams, IonicPage, AlertController, ModalController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';
import * as $ from 'jquery';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { String, StringBuilder } from 'typescript-string-operations';
import { ConsumerNotification } from '../../../interfaces/user-options';

@IonicPage()
@Component({
  selector: 'page-appointmentpostconfirmation',
  templateUrl: 'appointmentpostconfirmation.html',
  providers: [LocalNotifications]
})
export class AppointmentPostConfirmation {
  addMembers: string = "ForMeAndFamily";
  appoDetails: any = [];
  appoCharges: any;
  userDetails: any;
  leftTime: string;
  upcomingAppoList: any = [];
  selectedDate: string;
  feedbackModuleType: string = "1";
  feedbackQuestionList: any = [];
  feedbackAns: any = [];
  answer: any = {};
  hospital: any;
  AppoFor: string;
  notificationDetails: ConsumerNotification = { ConsumerID: 0, Contact: "", Email: "", GroupEntityId: 0, ModuleId: 0, Message: "" }
  latestUpcomingAppoDetails: any = [];
  constructor(public localNotifications: LocalNotifications, public modalCtrl: ModalController, public appCtrl: App, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
    this.appoDetails = this.navParams.get('appoDetails');
    this.AppoFor = this.navParams.get('AppoFor');
    //this.retrievUpcomingAppointments();
    this.hospital = this.navParams.get('hospital');
    if (this.AppoFor != "ForOthers") {
      this.sendNotification();
    }
    //this.sendEmailThroughSNS();
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userDetails = result;
          this.selectedDate = this.appoDetails.Date;
          this.appoDetails.TimeSlot = moment(this.appoDetails.TimeSlot, "h:mm").format("hh:mm A");
          this.appoDetails.Date = moment(this.selectedDate).format("Do MMM") + ", " + moment(this.selectedDate).format("YYYY");
          this.appoCharges = this.navParams.get('appoCharges');
          this.leftTime = "";
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
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
  sendNotificationToDevice(result) {
    let appointmentNotification = result.filter(item => {
      if (item.ModuleName == "Appointment Confirmation") {
        return item;
      }
    })
    if (appointmentNotification.length > 0) {
      this.localNotifications.schedule({
        id: new Date().getMilliseconds(),
        title: appointmentNotification[0].Subject,
        text: String.Format(appointmentNotification[0].MessageBody, this.appoDetails.ConsumerName, this.appoDetails.ProviderName, this.appoDetails.Date, this.appoDetails.TimeSlot, this.hospital.Name),
        trigger: { at: new Date(new Date().getTime() + 100) },
        vibrate: true,
        //sound: "file://notification.mp3",
        icon: "file://logo.png",
        //every: "0"
      });
      this.notificationDetails.ModuleId = appointmentNotification[0].ModuleId;
      this.notificationDetails.Message = String.Format(appointmentNotification[0].MessageBody, this.appoDetails.ConsumerName, this.appoDetails.ProviderName, this.appoDetails.Date, this.appoDetails.TimeSlot, this.hospital.Name);
    }
    else {
      this.localNotifications.schedule({
        id: new Date().getMilliseconds(),
        title: "Appointment Confirmation!",
        text: "Appointment for " + this.appoDetails.ConsumerName + " has been confirmed with " + this.appoDetails.ProviderName + " on " + this.appoDetails.Date + " at " + this.appoDetails.TimeSlot + " in " + this.hospital.Name,
        trigger: { at: new Date(new Date().getTime() + 100) },
        vibrate: true,
        //sound: "file://notification.mp3",
        icon: "file://logo.png",
        //every: "0"
      });
      this.notificationDetails.Message = "Appointment for " + this.appoDetails.ConsumerName + " has been confirmed with " + this.appoDetails.ProviderName + " on " + this.appoDetails.Date + " at " + this.appoDetails.TimeSlot + " in " + this.hospital.Name;
    }
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
  cancelAppointment(status, message) {
    let alert = this.alertCtrl.create({
      title: 'Do you want to ' + message + ' this appointment?',
      message: 'In case of Reschedule or Cancel appointment, you are unable to keep your appointment.',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            //this.viewCtrl.dismiss();
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this._dataContext.CancelAppointment(this.latestUpcomingAppoDetails.id)
              .subscribe(response => {
                if (response.Status) {
                  this.commonService.onMessageHandler("You have successfully cancelled your appointment.", 1);
                  this.sendCancelNotification();
                  if (status) {
                    this.rescheduleUserAppointment();
                  }
                  else {
                    this.navCtrl.setRoot("DashBoard");
                    this.appCtrl.getActiveNav().push("AppointmentHistory");
                  }
                }
                else {
                  this.commonService.onMessageHandler(response.Message, 0);
                }
              },
                error => {
                  console.log(error);
                  this.commonService.onMessageHandler("Failed. Please try again.", 0);
                });
          }
        }
      ]
    });
    alert.present();
  }
  rescheduleUserAppointment() {
    let doctorInformationDetails = {
      ProviderId: this.appoDetails.ProviderID,
      ProviderName: this.appoDetails.ProviderName,
      ProviderRating: 0,//data.ProviderOverAllRating.AverageRating,
      SpecializationName: "",//this.doctorDetails.DoctorSpecialization[0].SpecializationText,
      SpecializationId: 0,//this.doctorDetails.DoctorSpecialization[0].Specialization,
      ProviderImage: (this.appoDetails.ProviderImage != null && this.appoDetails.ProviderImage != '') ? this.appoDetails.ProviderImage : 'assets/img/bookAppointment/specialities_icon.svg',
      City: this.appoDetails.City,
      //Locality: this.appoDetails.Center,
    }
    this.navCtrl.push("Appointment", { doctorDetails: doctorInformationDetails, })
  }
  //send notification
  sendCancelNotification() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getNotification"))
      .then((result) => {
        if (result) {
          let appoCancellationNotification = result.filter(item => {
            if (item.ModuleName == "Appointment Cancellation") {
              return item;
            }
          })
          if (appoCancellationNotification.length > 0) {
            this.localNotifications.schedule({
              id: new Date().getMilliseconds(),
              title: appoCancellationNotification[0].Subject,
              text: String.Format(appoCancellationNotification[0].MessageBody, this.appoDetails.ConsumerName, this.appoDetails.ProviderName, this.appoDetails.Date, this.appoDetails.TimeSlot),
              trigger: { at: new Date(new Date().getTime() + 100) },
              vibrate: true,
              //sound: "file://notification.mp3",
              icon: "file://logo.png",
              //every: "0"
            });
            this.notificationDetails.ModuleId = appoCancellationNotification[0].ModuleId;
            this.notificationDetails.Message = String.Format(appoCancellationNotification[0].MessageBody, this.appoDetails.ConsumerName, this.appoDetails.ProviderName, this.appoDetails.Date, this.appoDetails.TimeSlot);
          }
          else {
            this.localNotifications.schedule({
              id: new Date().getMilliseconds(),
              title: 'Appointment Cancelled!',
              text: "Appointment for " + this.appoDetails.ConsumerName + " has been cancelled with " + this.appoDetails.ProviderName,
              trigger: { at: new Date(new Date().getTime() + 100) },
              vibrate: true,
              //sound: "file://notification.mp3",
              icon: "file://logo.png",
              //every: "0"
            });
            this.notificationDetails.Message = "Appointment for " + this.appoDetails.ConsumerName + " has been cancelled with " + this.appoDetails.ProviderName;
          }
          // this.notificationDetails.Contact = this.resetPassword.Contact;
          this.saveNotification(this.notificationDetails);
        }
      });

  }
  rescheduleAppointment() {
    this.cancelAppointment(true, 'reschedule');
  }
  ionViewDidLoad() {
    setTimeout(() => {
      this.retrieveFeedbackQuestionList();
    }, 4000);
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
    this.navCtrl.setRoot("DashBoard", { status: true });
    this.appCtrl.getActiveNav().push("AppointmentHistory");
  }
  goToDashBoard() {
    this.navCtrl.setRoot("DashBoard");
  }
  bookPackage() {
    this.navCtrl.setRoot("DashBoard");
    this.appCtrl.getActiveNav().push("DiagnosticSearch");
  }
  redirectPage(value) {
    this.navCtrl.setRoot("DashBoard");
    if (value != "DashBoard")
      this.appCtrl.getActiveNav().push(value);
  }
}







