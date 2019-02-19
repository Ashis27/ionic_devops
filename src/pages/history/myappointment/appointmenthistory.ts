import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, AlertController } from 'ionic-angular';
import * as $ from 'jquery';
import moment from 'moment';
import * as _ from "lodash";
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { ConsumerNotification } from '../../../interfaces/user-options';
import { String, StringBuilder } from 'typescript-string-operations';
import { CallNumber } from '@ionic-native/call-number';

@IonicPage()
@Component({
  selector: 'page-appointmenthistory',
  templateUrl: 'appointmenthistory.html',
  providers: [LocalNotifications,CallNumber]
})
export class AppointmentHistory {
  tapOption = [];
  upcomingAppointmentDetails: any = [];
  pastAppointmentDetails: any = [];
  upcomingAppointmentList: any = [];
  pastAppointmentList: any = [];
  optionObj: number = 0;
  tabValue: string;
  itemsPerPageForUpcomingAppo = 20;
  itemsPerPageForPastAppo = 20;
  totalItem = 1000;
  page = 0;
  pastAppoPage = 0;
  days: number;
  hours: number;
  mins: number;
  userId: number = 0;
  notificationDetails: ConsumerNotification = { ConsumerID: 0, Contact: "", Email: "", GroupEntityId: 0, ModuleId: 0, Message: "" }
  upcomingAvailableStatus: boolean = false;
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
  pastAvailableStatus: boolean = false
  constructor(private callNumber: CallNumber,public localNotifications: LocalNotifications, public navCtrl: NavController, public alertCtrl: AlertController, public _dataContext: DataContext, private commonService: CommonServices) {
    this.tapOption[0] = "Upcoming";
    this.tapOption[1] = "Past";
    //this.retrieveUpcomingAppointmentsFromCache();
  }

  //Initial entry point
  ionViewDidEnter() {
    this.upcomingAppointmentDetails = [];
    this.page = 0;
    this.tabValue = "appo-" + this.optionObj;
    this.getUserInfo();
    this.retrieveUpcomingAppointmentsList(1, false);
    this.getCurrentLocationFromCache();
    this.commonService.onEntryPageEvent("Come to history");
  }
  //Get Logged-In User details from Cache
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  //Retrieve Upcoming appo from cache
  retrieveUpcomingAppointmentsFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUpcomingAppo")).then((data) => {
      if (data) {
        this.upcomingAppointmentDetails = data;
        this.upcomingAppointmentList = data;
        this.upcomingAvailableStatus = false;
        this.totalItem = data.length;
        //this.page = Math.floor(this.upcomingAppointmentDetails.length / this.itemsPerPageForUpcomingAppo);
        this.retrieveUpcomingAppointmentsList(0, false);
      }
      else {
        this.page = 0;
        this.upcomingAvailableStatus = false;
        this.retrieveUpcomingAppointmentsList(1, false);
      }
    });

  }
  //Get all upcoming appointments from server
  retrieveUpcomingAppointmentsList(value, refresher) {
    this.totalItem = 0;
    this._dataContext.GetUserUpcomigAppointments(value, this.page, this.itemsPerPageForUpcomingAppo, this.userId)
      .subscribe(response => {
        if (response.Status && response.Result.rows.length > 0) {
          this.upcomingAppointmentDetails = this.upcomingAppointmentDetails.concat(response.Result.rows);
          this.upcomingAvailableStatus = false;
          this.totalItem = response.Result.TotalRows;
          this.upcomingAppointmentDetails.filter(item => {
            //  item["url"]="https://maps.google.com/maps?q=" + this.lat + "," + this.lng + "&hl=es;z=14&amp;output=embed";
            item["bookedDate"] = moment(item.Date).format("Do MMM");//+ ", " + moment(item.Date).format("YYYY");
            item["bookedTimeSlot"] = moment(item.TimeSlot, "h:mm").format("hh:mm A");
            var currentDate = moment(moment(), "DD-MM-YYYY HH:mm");
            var upcomingDate = moment(moment(item.Date + " " + item.TimeSlot), "DD-MM-YYYY HH:mm");
            item["leftDays"] = upcomingDate.diff(currentDate, 'days'); // calculate the difference in days
            item["leftHrs"] = upcomingDate.diff(currentDate, 'hours') % 24; // calculate the difference in hours
            item["leftMins"] = upcomingDate.diff(currentDate, 'minutes') % 60; // calculate the difference in hours
          })
          this.upcomingAppointmentDetails = _.map(_.uniqBy(this.upcomingAppointmentDetails, 'id'), function (item) {
            return item;
          });
          this.upcomingAppointmentList = this.upcomingAppointmentDetails;
          this.page++;//Math.floor(this.upcomingAppointmentDetails.length / this.itemsPerPageForUpcomingAppo);
          this.getAnimation();
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUpcomingAppo"), this.upcomingAppointmentDetails);
        }
        else {
          this.upcomingAvailableStatus = true;
        }
        if (refresher) {
          refresher.complete();
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  //Retrieve Past appo from cache
  retrievePastAppointmentsFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPastAppo")).then((data) => {
      if (data) {
        this.pastAppointmentDetails = data;
        this.pastAppointmentList = data;
        this.pastAvailableStatus = false;
        this.totalItem = data.length;
        this.upcomingAppointmentDetails = [];
        //this.pastAppoPage = Math.floor(this.pastAppointmentDetails.length / this.itemsPerPageForPastAppo);
        this.retrieveUpcomingAppointmentsList(0, false);
      }
      else {
        this.pastAvailableStatus = false;
        this.pastAppoPage = 0;
        this.retrievePastAppointmentsList(1, false);
      }
    });

  }
  //Retrieve past appointmet from server
  retrievePastAppointmentsList(value, refresher) {
    this.totalItem = 0;
    this._dataContext.GetUserPastAppointments(value, this.pastAppoPage, this.itemsPerPageForPastAppo)
      .subscribe(response => {
        if (response.Status && response.Result.rows.length > 0) {
          this.pastAppointmentDetails = this.pastAppointmentDetails.concat(response.Result.rows);
          this.pastAvailableStatus = false;
          this.totalItem = response.Result.TotalRows;
          this.pastAppointmentDetails.filter(item => {
            item["bookedDate"] = moment(item.Date).format("Do MMM") + ", " + moment(item.Date).format("YYYY");
            item["bookedTimeSlot"] = moment(item.TimeSlot, "h:mm").format("hh:mm A");
          });
          this.pastAppointmentDetails = _.map(_.uniqBy(this.pastAppointmentDetails, 'id'), function (item) {
            return item;
          });
          // this.pastAppointmentList = this.pastAppointmentDetails;
          this.pastAppoPage++;
          this.getAnimation();
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPastAppo"), this.pastAppointmentDetails);
        }
        else {
          this.pastAvailableStatus = true;
        }
        if (refresher) {
          refresher.complete();
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  getAnimation() {
    setTimeout(() => {
      this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUpcomgetAppoAnimationStatusingAppo")).then((result) => {
        if (result) {
          $(".animated").removeClass("slideInUp");
        }
        else {
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUpcomgetAppoAnimationStatusingAppo"), true);
          $(".animated").addClass("slideInUp");
        }
      }).catch(error => { })
    }, 1);
  }

  //While Tab change
  tabSelection(event, value) {
    if (value == 'Upcoming') {
      this.optionObj = 0;
      this.tabValue = "appo-" + this.optionObj;
      this.page = 0;
      this.upcomingAppointmentDetails = [];
      this.retrieveUpcomingAppointmentsList(1, false);
    }
    else {
      this.optionObj = 1;
      this.tabValue = "appo-" + this.optionObj;
      this.pastAppoPage = 0;
      this.pastAppointmentDetails = [];
      this.retrievePastAppointmentsList(1, false);
    }
  }
  //Show appointment details 0n popup
  getAppointmentDetails(data) {
    let alert = this.alertCtrl.create({
      title: 'Appointment Details',
      message: 'Name: ' + data.ConsumerName + '<br\>' + 'Date: ' + data.Date + '<br\>' + 'Time: ' + data.TimeSlot + '<br\>' + 'Doctor: ' + data.ProviderName + '<br\>' + 'Hospital: ' + data.Hospital,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          handler: () => {
            //this.viewCtrl.dismiss();
          }
        }
      ]
    });
    alert.present();
  }
  _callHospital(number) {
    this.callNumber.callNumber(number, true)
      .then(() => {
      })
      .catch(() => {

      });
  }
  showNoCancellationAlert(data) {
    let alert = this.alertCtrl.create({
      title: 'Appointment Cancellation',
      message: 'Please contact the hospital directly for cancellation and reschedule.' + '<br\>' + 'Contact Number : ' + data.HospitalContact,
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
            this._callHospital(data.HospitalContact);
          }
        }

      ]
    });
    alert.present();
  }
  cancelAppointment(status, appo, message) {
    if (appo.PaidOnLine != "False") {
      this.showNoCancellationAlert(appo);
    }
    else {
      let alert = this.alertCtrl.create({
        message: 'In case of Reschedule or Cancel appointment, you are unable to keep your appointment.',
        title: 'Do you want to ' + message + ' this appointment?',
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
              this._dataContext.CancelAppointment(appo.id)
                .subscribe(response => {
                  if (response.Status) {
                    this.commonService.onMessageHandler("Your appointment has been cancelled.", 1);
                    this.commonService.onEventSuccessOrFailure("Reschedule Appointment");
                    if (status) {
                      this.reBookAppointment(appo);
                    }
                    else {
                      this.page = 0;
                      this.upcomingAppointmentDetails = [];
                      this.upcomingAvailableStatus = false;
                      this.retrieveUpcomingAppointmentsList(1, false);
                    }
                    this.sendNotification(appo);
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
  }
  //send notification
  sendNotification(appoDetails) {
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
              text: String.Format(appoCancellationNotification[0].MessageBody, appoDetails.ConsumerName, appoDetails.ProviderName, appoDetails.Date, appoDetails.TimeSlot),
              trigger: { at: new Date(new Date().getTime() + 100) },
              vibrate: true,
              //sound: "file://notification.mp3",
              icon: "file://logo.png",
              //every: "0"
            });
            this.notificationDetails.ModuleId = appoCancellationNotification[0].ModuleId;
            this.notificationDetails.Message = String.Format(appoCancellationNotification[0].MessageBody, appoDetails.ConsumerName, appoDetails.ProviderName, appoDetails.Date, appoDetails.TimeSlot);
          }
          else {
            this.localNotifications.schedule({
              id: new Date().getMilliseconds(),
              title: 'Appointment Cancelled!',
              text: "Appointment for" + appoDetails.ConsumerName + " has been cancelled with " + appoDetails.ProviderName,
              trigger: { at: new Date(new Date().getTime() + 100) },
              vibrate: true,
              //sound: "file://notification.mp3",
              icon: "file://logo.png",
              //every: "0"
            });
            this.notificationDetails.Message = "Appointment for " + appoDetails.ConsumerName + " has been cancelled with " + appoDetails.ProviderName;
          }
          // this.notificationDetails.Contact = this.resetPassword.Contact;
          this.saveNotification(this.notificationDetails);
        }
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
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      if (this.optionObj == 0) {
        this.retrieveUpcomingAppointmentsList(0, false);
      }
      else {
        this.retrievePastAppointmentsList(0, false);
      }
      infiniteScroll.complete();
    }, 500);
  }
  rescheduleAppointment(appo) {
    this.cancelAppointment(true, appo, "reschedule");
  }
  getDirection(url) {
    window.open(url, '_system');
  }
  reBookAppointment(data) {
    let doctorInformationDetails = {
      ProviderId: data.ProviderID,
      ProviderName: data.ProviderName,
      ProviderRating: 0,//data.ProviderOverAllRating.AverageRating,
      SpecializationName: "",//this.doctorDetails.DoctorSpecialization[0].SpecializationText,
      SpecializationId: 0,//this.doctorDetails.DoctorSpecialization[0].Specialization,
      ProviderImage: (data.ProviderImage != null && data.ProviderImage != '') ? data.ProviderImage : 'assets/img/bookAppointment/specialities_icon.svg',
      City: this.selectedCityAndLocation.activeCity,
      Locality: this.selectedCityAndLocation.activeLocation,
    }
    this.navCtrl.push("Appointment", { doctorDetails: doctorInformationDetails, })
  }
  getCurrentLocationFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
      .then((result) => {
        if ((result.activeCity != "" && result.activeCity != undefined) || (result.activeLocation != "" && result.activeLocation != undefined)) {
          this.selectedCityAndLocation.activeCity = result.activeCity;
          this.selectedCityAndLocation.activeLocation = result.activeLocation;
          this.selectedCityAndLocation.activeCityKey = result.activeCityKey;
          this.selectedCityAndLocation.activeLocationKey = result.activeLocationKey;
        }
        else {
          this.selectedCityAndLocation = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
        }
      });
  }
  bookAppointment(){
    this.navCtrl.push("BookAppointment");
  }
  redirectToMenu(value, event) {
    // $(".footer-image-sec").removeClass("active-section").addClass("footer-back");
    // $(event.currentTarget).removeClass("footer-back").addClass("active-section");
    if (value == "DashBoard") {
      this.navCtrl.setRoot("DashBoard");
    }
  }
}
