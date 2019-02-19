import { Component } from '@angular/core';
import { NavParams, IonicPage, NavController, AlertController, ModalController, App, Platform, Events } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';
import * as $ from 'jquery';
import { UserRegister } from '../../../interfaces/user-options';
import { NgForm } from '@angular/forms';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-appointmentpreconfirmation',
  templateUrl: 'appointmentpreconfirmation.html',
  providers: [InAppBrowser]

})
export class AppointmentPreConfirmation {
  addMembers: string = "ForMeAndFamily";
  doctorInfo: any = [];
  timeSlotInfo: any;
  varifyOTPStatus: boolean = false;
  genderList: any = [];
  getApiCount: number = 0;
  signup: UserRegister = { UserLogin: "", Password: "", FirstName: "", Contact: "", CountryCode: "", DateOfBirth: "", Sex: "", City: "", Locality: "", TC: false, GroupEntityId: 0, ParentGroupEntityId: 0, ReferralCode: "", MobileDeviceId: "", MobileDeviceType: "" };
  paymentDetails: any =
    {
      BookingForSelf: false,
      City: "",
      Center: "",
      ConsumerName: "",
      ConsumerID: 0,
      ChildConsumerID: 0,
      ContactNo: "",
      Email: "",
      Premium: 0,
      SpecializationId: 0,
      TimeSlot: "",
      Date: "",
      GroupEntityID: "",
      ParentGroupEntityID: "",
      ProviderName: "",
      ProviderID: "",
      ConsultationCharge: 0,
      RegistrationCharge: 0,
      PriceToShow: 0,
      ChargeBrakeUp: 0,
      Specialization: "",
      AppointmentFor: "",
      ProviderImage: "",
      PaymentType: "",
      PaymentPaidStatus: "",
      HospitalID: 0
    };

  appoCharges: any;
  documentsFor: any = [];
  userDetails: any;
  leftTime: string;
  selectedDate: string;
  selfUser: string;
  isChecked: boolean = true;
  familyUser: number;
  selectedMemberId: string;
  showNewMemberField: boolean = false;
  selectedUser: string;
  //countryCode: string;
  contact: string;
  activeCountry: any = [];
  hospital: any;
  newConsumerId: number = 0;
  isRegistrationConfirmed: boolean = false;
  constructor(private iab: InAppBrowser, public platform: Platform, public appCtrl: App, private modalCtrl: ModalController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices, public events: Events) {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userDetails = result;
          //   this.selectedUser =this.userDetails.ConsumerID;
          this.selectedUser = this.userDetails.ConsumerID;
          this.doctorInfo = this.navParams.get('doctorDetails');
          this.timeSlotInfo = this.navParams.get('timeSlotInfo');
          this.hospital = this.navParams.get('hospital');
          this.selectedDate = this.timeSlotInfo.date;
          this.selectedMemberId = this.userDetails.ConsumerID;
          this.paymentDetails.TimeSlot = this.timeSlotInfo.timeSlot;
          this.timeSlotInfo.timeSlot = moment(this.timeSlotInfo.timeSlot, "h:mm").format("hh:mm A");
          this.timeSlotInfo.date = moment(this.selectedDate).format("Do MMM") + ", " + moment(this.selectedDate).format("YYYY");
          this.appoCharges = this.navParams.get('appoCharges');
          this.leftTime = "";
          this.signup.FirstName = "";
          this.signup.UserLogin = "";
          this.signup.Sex = "";
          this.getFamilyList(false);
          this.configurePaymentDetails();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });

  }
  ionViewDidEnter() {
    this.commonService.onEntryPageEvent("Appo confirmation Page");
    this.getDeviceTOKEN();
    if (this.navCtrl.getActive().name == "AppointmentPostConfirmation" || this.navCtrl.getActive().id == "AppointmentPostConfirmation" || this.navCtrl.getActive().name == "AppointmentConfirmationAfterPG" || this.navCtrl.getActive().id == "AppointmentConfirmationAfterPG") {
      this.navCtrl.setRoot("DashBoard");
      this.appCtrl.getActiveNav().push("AppointmentHistory");

    }
    this.getActiveCountryAndStateFromCache();
    this.getGenderFromCache();
  }
  // @Output() notifyParent: EventEmitter<any> = new EventEmitter();

  configurePaymentDetails() {
    this.paymentDetails.ConsumerID = this.userDetails.ConsumerID;
    this.paymentDetails.ConsumerName = this.userDetails.FirstName;
    this.paymentDetails.AppointmentFor = this.userDetails.FirstName;
    this.paymentDetails.City = this.doctorInfo.City;
    this.paymentDetails.SpecializationId = 0;//this.doctorInfo.SpecializationId; // getting list of spec id
    this.paymentDetails.Specialization = this.doctorInfo.SpecializationName;
    this.paymentDetails.Date = this.selectedDate;
    this.paymentDetails.GroupEntityID = this.commonService.getGroupEntityId();
    this.paymentDetails.ParentGroupEntityID = this.commonService.getParentGroupEntityId();
    this.paymentDetails.HospitalID = this.hospital.GroupEntityID;
    this.paymentDetails.ProviderName = this.doctorInfo.ProviderName;
    this.paymentDetails.ProviderID = this.doctorInfo.ProviderId;
    this.paymentDetails.Email = this.commonService.validateEmail(this.userDetails.UserLogin)?this.userDetails.UserLogin:"";
    this.paymentDetails.ContactNo = this.commonService.validatePhone(this.userDetails.Contact)? this.userDetails.CountryCode + this.userDetails.Contact:"";
    this.paymentDetails.ProviderImage = this.doctorInfo.ProviderImage;
    this.paymentDetails.PriceToShow = this.appoCharges != null ? (this.appoCharges.ConsultationCharge - (this.appoCharges.AppoDiscount / 100 * this.appoCharges.ConsultationCharge)).toFixed(2) : 0;
  }
  getDeviceTOKEN() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserDeviceToken")).then(data => {
      if (data) {
        if (this.platform.is('ios')) {
          this.signup.MobileDeviceType = "iOS";
        } else if (this.platform.is('android')) {
          this.signup.MobileDeviceType = "android";
        }
        this.signup.MobileDeviceId = data;
      }
    })
  }
  //Get Family list
  getFamilyList(value) {
    this._dataContext.GetFamilyListForDropDown()
      .subscribe(response => {
        if (response.length > 0) {
          this.documentsFor = response;
          if (value) {
            // this.isChecked = false;
            this.paymentDetails.ChildConsumerID = this.documentsFor[this.documentsFor.length - 1].Value;
            this.paymentDetails.AppointmentFor = this.documentsFor[this.documentsFor.length - 1].DisplayText;
            this.paymentDetails.ConsumerName = this.documentsFor[this.documentsFor.length - 1].DisplayText;
            this.paymentDetails.ConsumerID = 0;
            this.selectedUser = this.documentsFor[this.documentsFor.length - 1].Value;
            this.familyUser = this.documentsFor[this.documentsFor.length - 1].Value;
            if (this.appoCharges == null) {
              this.confirmBooking();
            }
            else {
              if (this.appoCharges.PriceToShow > 0)
                this.confirmBookingWithPayment();
              else
                this.confirmBooking();
            }
          }
          this.documentsFor.push({ DisplayText: this.userDetails.FirstName, Value: this.userDetails.ConsumerID, Relation: "Self", RelationId: 0 });
          this.documentsFor.reverse();
          // this.documentsFor.filter((item) => { item.DisplayText = item.DisplayText.substr(0, item.DisplayText.indexOf('(')); })
        }
        else {
          this.documentsFor.push({ DisplayText: this.userDetails.FirstName, Value: this.userDetails.ConsumerID, Relation: "Self", RelationId: 0 });
          this.documentsFor.reverse();
        }
        this.documentsFor.filter(item => {
          item.DisplayText = this.commonService.convert_case(item.DisplayText);
        })

      },
        error => {
          if (this.getApiCount < 1) {
            this.getFamilyList(value);
          }
          this.getApiCount++;
          console.log(error);
          // this.commonService.onMessageHandler("Failed to retrieve family details. Please try again.", 0);
        });
  }
  // selectedMember(value) {

  // }
  selectedMember(value, id, name) {
    this.selectedMemberId = id;
    // if (value == 'self') {
    //   this.selfUser = id;
    //   this.isChecked = true;
    this.paymentDetails.ConsumerID = id;
    this.paymentDetails.ChildConsumerID = 0;
    // this.familyUser = 0;
    this.paymentDetails.AppointmentFor = name;
    this.paymentDetails.ConsumerName = name;
    // }
    // else {
    //   this.isChecked = false;
    //   this.paymentDetails.ChildConsumerID = id;
    //   this.paymentDetails.AppointmentFor = name;
    //   this.paymentDetails.ConsumerName = name;
    //   this.paymentDetails.ConsumerID = 0;
    //   this.familyUser = id;
    // }
  }
  //Get active countries and states from cache, if not available then get from server.
  getActiveCountryAndStateFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveCountryAndState"))
      .then((result) => {
        if (result) {
          this.signup.CountryCode = result.countriesAvailable[0].DemographyCode;
          this.activeCountry = result.countriesAvailable;
        }
        else {
        }
      });
  }
  changeDate() {
    this.navCtrl.pop();
  }

  confirmBooking() {
    let alert = this.alertCtrl.create({
      title: "Appointment Confirmation",
      message: '<b style="color: #00bebc !important;font-weight: 100 !important;">Please verify your appointment details</b>' + '<br\><br\>' + '<b>Hospital Name:</b>   ' + this.hospital.Name + '<br\>' + '<b>Doctor Name:   </b>' + this.paymentDetails.ProviderName + '<br\>' + '<b>Department:   </b>' + this.doctorInfo.SpecializationName + '<br\>' + '<b>Appointment For:   </b>' + this.paymentDetails.AppointmentFor + '<br\>' + '<b>Date:   </b>' + this.paymentDetails.Date + '<br\>' + '<b>Time:   </b>' + this.timeSlotInfo.timeSlot,
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel',
          handler: () => {
            //this.viewCtrl.dismiss();
            // console.log('Cancel clicked');
            this.commonService.onEventSuccessOrFailure("Appointment Failed");
          }
        },
        {
          text: 'CONFIRM',
          handler: () => {
            // this.confirmAppointment();
            this.askUserToUpdateContactInfoBeforeAppo("Confirm");
          }
        }
      ]
    });
    alert.present();
  }
  ProceedToPay() {
    let alert = this.alertCtrl.create({
      title: "Appointment Confirmation",
      message: '<b style="color: #00bebc !important;font-weight: 100 !important;">Please verify your appointment details</b>' + '<br\><br\>' + '<b>Hospital Name:</b>   ' + this.hospital.Name + '<br\>' + '<b>Doctor Name:   </b>' + this.paymentDetails.ProviderName + '<br\>' + '<b>Department:   </b>' + this.doctorInfo.SpecializationName + '<br\>' + '<b>Appointment For:   </b>' + this.paymentDetails.AppointmentFor + '<br\>' + '<b>Date:   </b>' + this.paymentDetails.Date + '<br\>' + '<b>Time:   </b>' + this.timeSlotInfo.timeSlot,
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel',
          handler: () => {
            //this.viewCtrl.dismiss();
            // console.log('Cancel clicked');
            this.commonService.onEventSuccessOrFailure("Appointment Failed");
          }
        },
        {
          text: 'CONFIRM',
          handler: () => {
            //  this.proceedToPaymentThroughPayTM();
            this.askUserToUpdateContactInfoBeforeAppo("Paid");
          }
        }
      ]
    });
    alert.present();
  }
  confirmBookingWithPayment() {
    let alert = this.alertCtrl.create({
      title: "Appointment Confirmation",
      message: '<b style="color: #00bebc !important;font-weight: 100 !important;">Please verify your appointment details</b>' + '<br\><br\>' + '<b>Hospital Name:</b>   ' + this.hospital.Name + '<br\>' + '<b>Doctor Name:   </b>' + this.paymentDetails.ProviderName + '<br\>' + '<b>Department:   </b>' + this.doctorInfo.SpecializationName + '<br\>' + '<b>Appointment For:   </b>' + this.paymentDetails.AppointmentFor + '<br\>' + '<b>Date:   </b>' + this.paymentDetails.Date + '<br\>' + '<b>Time:   </b>' + this.timeSlotInfo.timeSlot,
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel',
          handler: () => {
            //this.viewCtrl.dismiss();
            // console.log('Cancel clicked');
            // this.commonService.onEventSuccessOrFailure("Appointment Failed");
          }
        },
        {
          text: 'PAY LATER',
          cssClass: this.appoCharges.PayLaterEnabled ? 'show' : 'hide',
          handler: () => {
            //this.confirmAppointment();
            this.askUserToUpdateContactInfoBeforeAppo("Confirm");
          }
        },
        {
          text: 'PAY NOW',
          handler: () => {
            //this.proceedToPaymentThroughPayTM();
            this.askUserToUpdateContactInfoBeforeAppo("Paid");
          }
        }
      ]
    });
    alert.present();
  }
  proceedToPaymentThroughPayTM() {
    this.paymentDetails.PaymentType = "Paytm";
    if (this.paymentDetails.ChildConsumerID == 0) {
      this.paymentDetails.BookingForSelf = true;
    }
    else {
      this.paymentDetails.ConsumerID = this.paymentDetails.ChildConsumerID;
    }
    this._dataContext.ScheduleAppointmentThroughPayment(this.paymentDetails)
      .subscribe(result => {
        if (result.Status) {
          let options: InAppBrowserOptions = {
            location: 'no', //Or 'no' 
            //hidden: 'yes', //Or  'yes'
            zoom: 'no', //Android only ,shows browser zoom controls 
            hardwareback: 'yes',
            mediaPlaybackRequiresUserAction: 'yes',
            shouldPauseOnSuspend: 'no', //Android only 
            closebuttoncaption: 'Share', //iOS only
            disallowoverscroll: 'no', //iOS only 
            toolbar: 'yes', //iOS only 
            toolbarposition: 'bottom',
            enableViewportScale: 'no', //iOS only 
            allowInlineMediaPlayback: 'no', //iOS only 
            presentationstyle: 'formsheet', //iOS only 
            fullscreen: 'yes', //Windows only  
            suppressesIncrementalRendering: 'no',
            transitionstyle: 'crossdissolve',

          };
          let refId = result.Result;
          const browser = this.iab.create(this.commonService.getPaymentApiURL() + "Payment/PaytmPamentGateway?interimOrderDeatilsId=" + refId, '_blank', options);
          browser.show();
          browser.on('loadstop').subscribe(event => {
            if (event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentSuccessResponse" || event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentPendingResponse") {
              browser.close();
              this.paymentDetails.PaymentPaidStatus = "Success";
              this.navCtrl.push("AppointmentConfirmationAfterPG", { appoDetails: this.paymentDetails, appoCharges: this.appoCharges, hospital: this.hospital, AppoFor: this.addMembers, referenceId: refId });
            }
            else if (event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentFailureResponse") {
              browser.close();
              this.paymentDetails.PaymentPaidStatus = "Failure";
              this.navCtrl.push("AppointmentFailureAfterPG", { referenceId: refId });
            }
            // else if (event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentPendingResponse") {
            //   browser.close();
            //   this.paymentDetails.PaymentPaidStatus = "Pending";
            // }
            // else {
            //   this.commonService.onMessageHandler("Failed. Please contact support!", 0);
            //   browser.close();
            // }
          });
          //window.open("http://localhost:63661/Payment/PaytmPamentGateway?interimOrderDeatilsId=" + result.Result);
          // this.commonService.onMessageHandler("Payment functionality has not been configured. Please try later", 0);
          //this.commonService.onEventSuccessOrFailure("Successfully Scheduled Appointment");
          //this.commonService.onMessageHandler(result.Message, 1);
          // this.navCtrl.push("AppointmentPostConfirmation", { appoDetails: this.paymentDetails, appoCharges: this.appoCharges, hospital: this.hospital, AppoFor: this.addMembers,});
          //this.commonService.onEventSuccessOrFailure("Appointment confirmed");
        }
        else {
          this.commonService.onMessageHandler(result.Message, 0);
        }
      },
        error => {
          this.commonService.onEventSuccessOrFailure("Appointment Failed");
          this.commonService.onMessageHandler("Failed. Please contact support.", 0);
        });
  }
  confirmAppointment() {
    if (this.paymentDetails.ChildConsumerID == 0) {
      this._dataContext.ScheduleAppointmentForUser(this.paymentDetails)
        .subscribe(result => {
          if (result.VerifiedOTP == 'N') {
            this.varifyOTPStatus = true;
            this.commonService.onMessageHandler(result.Message, 1);
          }
          else if (result.Result == "Failed") {
            this.navCtrl.setRoot("LoginPage");
          }
          else {
            if (result.Result == "OK") {
              this.commonService.onEventSuccessOrFailure("Successfully Scheduled Appointment");
              this.commonService.onMessageHandler(result.Message, 1);
              this.paymentDetails.PaymentPaidStatus = "Not Paid";
              this.navCtrl.push("AppointmentPostConfirmation", { appoDetails: this.paymentDetails, appoCharges: this.appoCharges, hospital: this.hospital, AppoFor: this.addMembers });
 
 
              //  event published
           
              if (this.doctorInfo.HealthPlanId) {
                this.events.publish('healthPlanAppontment:created', this.doctorInfo);
              }


              
              this.commonService.onEventSuccessOrFailure("Click  appo confirm");
            }
            else {

              this.commonService.onMessageHandler("Failed. Please contact support.", 0);
            }
          }
        },
          error => {
            this.commonService.onEventSuccessOrFailure("Appointment Failed");
            this.commonService.onMessageHandler("Failed. Please contact support.", 0);
          });
    }
    else {
      this._dataContext.ScheduleAppointmentForFamily(this.paymentDetails)
        .subscribe(result => {
          if (result.VerifiedOTP == 'N') {
            this.varifyOTPStatus = true;
            this.commonService.onMessageHandler(result.Message, 1);
          }
          else {
            if (result.Result == "OK") {
              this.commonService.onMessageHandler(result.Message, 1);
              this.paymentDetails.PaymentPaidStatus = "Not Paid";
              this.navCtrl.push("AppointmentPostConfirmation", { appoDetails: this.paymentDetails, appoCharges: this.appoCharges, hospital: this.hospital });
              if (this.doctorInfo.HealthPlanId && this.doctorInfo.LineItemId) {
                // console.log("from healthplan", this.doctorInfo.HealthPlanId);
                this.events.publish('healthPlanAppontment:created', this.doctorInfo);
              }
              this.commonService.onEventSuccessOrFailure("Click  appo conform");
            }
            else {
              this.commonService.onMessageHandler(result.Message, 0);
            }
          }
        },
          error => {
            this.commonService.onMessageHandler("Failed. Please Contact Support", 0);
            this.commonService.onEventSuccessOrFailure("Appointment Failed");
          });
    }
  }
  askUserToUpdateContactInfoBeforeAppo(value) {
    if (this.commonService.validatePhone(this.userDetails.Contact) && this.commonService.validateEmail(this.userDetails.UserLogin)) {
      this.onBookingAppo(value);
    }
    else {
      let addModal = this.modalCtrl.create("UpdateConsumerContactInfo", { consumerDetails: this.userDetails });
      addModal.onDidDismiss(item => {
        if (item){
         // this.paymentDetails = item;
          this.paymentDetails.Email = item.UserLogin;
          this.paymentDetails.ContactNo = item.CountryCode + item.Contact;
        }
        this.onBookingAppo(value);
      });
      addModal.present();
    }
  }
  onBookingAppo(value) {
    if (value == "Paid")
      this.proceedToPaymentThroughPayTM();
    else
      this.confirmAppointment();
  }
  //validate only number
  onlyNumber(event) {
    return this.commonService.validateOnlyNumber(event);
  }
  //Get Gender List from cache, if not available then get from server.
  getGenderFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getGender"))
      .then((result) => {
        if (result) {
          this.genderList = result;
          this.signup.Sex = this.genderList[1].Value;
          this.getGenderList(0)
        }
        else {
          this.getGenderList(1);
        }
      });
  }
  //Get gender based on network status.
  getGenderList(value) {
    this._dataContext.GetGenderList(value)
      .subscribe(response => {
        this.genderList = response;
        this.signup.Sex = this.genderList[1].Value;
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getGender"), this.genderList);
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
  //Validate Email and Mobile number
  validateEmailAndMobile(form: NgForm) {
    if (this.commonService.isValidateForm(form)) {
      this.signup.Password = "K@re1234";
      this.signup.GroupEntityId = this.commonService.getGroupEntityId();
      this._dataContext.getValidateEmailAndMobile(this.signup)
        .subscribe(response => {
          if (response.Status) {
            //this.sendSMSThroughSNS();
            this.userSignUp();
          }
          else {
            // this.isRegistrationConfirmed = true;
            this.getUserDetailsByContactNumber(this.signup.CountryCode + this.signup.Contact);
            //this.commonService.onMessageHandler(response.Message, 0);
          }
        },
          error => {
            console.log(error);
            //loading.dismiss().catch(() => { });
            this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
          });
    }
  }
  userSignUp() {
    this._dataContext.UserRegister(this.signup)
      .subscribe(response => {
        if (response.Result == "Success") {
          this.getUserDetailsByContactNumber(this.signup.CountryCode + this.signup.Contact);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
        });
  }
  addNewMember() {
    let addModal = this.modalCtrl.create("AddNewMember", { contact: this.paymentDetails.ContactNo });
    addModal.onDidDismiss(item => {
      if (item.status) {
        // this.getUserDetailsByContactNumber(item.data);
        this.getFamilyList(true);
      }
    })
    addModal.present();
  }
  getUserDetailsByContactNumber(value) {
    this._dataContext.GetUserDetailsByContactNumber(value)
      .subscribe(response => {
        if (response.Status) {
          if (response.result.ConsumerCollection.length > 0) {
            let userDetails = response.result.ConsumerCollection[0];
            this.paymentDetails.ChildConsumerID = 0;
            this.paymentDetails.AppointmentFor = userDetails.FirstName;
            this.paymentDetails.ConsumerName = userDetails.FirstName;
            this.paymentDetails.ConsumerID = userDetails.ConsumerID;
            this.paymentDetails.Email = userDetails.UserLogin;
            this.paymentDetails.ContactNo = this.signup.CountryCode + this.signup.Contact;
            //
            if (this.appoCharges == null) {
              this.confirmBooking();
            }
            // else {
            //   this.confirmBookingWithPayment();
            //   // this.commonService.onMessageHandler("New User has been registered successfully. Please proceed to payment.", 1);
            //   this.isRegistrationConfirmed = true;
            // }
            else if (this.appoCharges != null) {
              if (this.appoCharges.PriceToShow > 0)
                this.confirmBookingWithPayment();
              else
                this.confirmBooking();
              //  // this.commonService.onMessageHandler("Please proceed to payment.", 1);
              //   this.isRegistrationConfirmed = true;
            }
          }
          else {
            this.commonService.onMessageHandler("Email id and mobile number combination is not valid.", 0);
          }
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
        });
  }
  selfAndFamilyClicked() {
    this.isRegistrationConfirmed = false;
  }
}







