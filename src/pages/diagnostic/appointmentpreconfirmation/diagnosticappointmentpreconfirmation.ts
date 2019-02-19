import { Component } from '@angular/core';
import { NavParams, IonicPage, NavController, AlertController, ModalController, App, Platform } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';
import * as $ from 'jquery';
import { UserRegister } from '../../../interfaces/user-options';
import { NgForm } from '@angular/forms';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-diagnosticappointmentpreconfirmation',
  templateUrl: 'diagnosticappointmentpreconfirmation.html',
  providers: [InAppBrowser,]

})
export class DiagnosticAppointmentPreConfirmation {
  addMembers: string = "ForMeAndFamily";
  providerInfo: any = [];
  timeSlotInfo: any;
  varifyOTPStatus: boolean = false;
  genderList: any = [];
  getApiCount: number = 0;
  signup: UserRegister = { UserLogin: "", Password: "", FirstName: "", Contact: "", CountryCode: "", DateOfBirth: "", Sex: "", City: "", Locality: "", TC: false, GroupEntityId: 0, ParentGroupEntityId: 0, ReferralCode: "", MobileDeviceId: "", MobileDeviceType: "" };
  packageDetails = {
    LineItemId: 0,
    CartItem: "",
    BookingDate: "",
    BookingSlot: "",
    Price: 0,
    BookedFor: 0,
    BookedForName: "",
    ContactNo: "",
    CustomerName: "",
    Email: "",
    PaymentGateway: 1,
    ConsumerId: 0,
    CustomerCity: "",
    GroupEntityId: 0,
    ParentGroupEntityId: 0,
    LabName: "",
    ProviderID: 0,
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
  //countryCode: string;
  contact: string;
  activeCountry: any = [];
  hospital: any;
  newConsumerId: number = 0;
  addedPackageList: any = [];
  totalPrice: number = 0;
  showTotalPrice: string;
  selectedUser: string;
  constructor(public platform: Platform, public appCtrl: App, private iab: InAppBrowser, private modalCtrl: ModalController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
    this.providerInfo = this.navParams.get('providerDetails');
    this.timeSlotInfo = this.navParams.get('timeSlotInfo');
    this.providerInfo.Package.filter(item => {
      this.totalPrice += Number(item.PriceAfterDiscount);
    });
    this.showTotalPrice = this.totalPrice.toFixed(2);
  }
  ionViewDidEnter() {
    this.getDeviceTOKEN();
    if (this.navCtrl.getActive().name == "PackageConfirmationAfterPG" || this.navCtrl.getActive().id == "PackageConfirmationAfterPG") {
      this.navCtrl.setRoot("DashBoard");
      this.appCtrl.getActiveNav().push("BookedPackage");
    }
    this.getUserDetailsFromCache();
    this.commonService.onEntryPageEvent("Diagnostic appointment pre conformation start");
    // onEventSuccessOrFailure
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
  getUserDetailsFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userDetails = result;
          this.selectedUser = this.userDetails.ConsumerID;
          this.selectedDate = this.timeSlotInfo.date;
          this.selectedMemberId = this.userDetails.ConsumerID;
          this.packageDetails.BookingSlot = this.timeSlotInfo.timeSlot;
          // this.timeSlotInfo.timeSlot = moment(this.timeSlotInfo.timeSlot, "h:mm").format("hh:mm A");
          this.timeSlotInfo.date = moment(this.selectedDate).format("Do MMM") + ", " + moment(this.selectedDate).format("YYYY");
          this.leftTime = "";
          this.signup.FirstName = "";
          this.signup.UserLogin = "";
          this.signup.Sex = "";
          this.getActiveCountryAndStateFromCache();
          this.getGenderFromCache();
          this.getFamilyList(false);
          this.configurepackageDetails();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });

  }
  configurepackageDetails() {
    this.providerInfo.Package.filter(item => {
      this.packageDetails.ConsumerId = this.userDetails.ConsumerID;
      this.packageDetails.CustomerName = this.userDetails.FirstName;
      this.packageDetails.BookedForName = this.userDetails.FirstName;
      this.packageDetails.CustomerCity = item.City;
      this.packageDetails.BookingDate = this.selectedDate;
      this.packageDetails.GroupEntityId = this.commonService.getGroupEntityId();
      this.packageDetails.ParentGroupEntityId = this.commonService.getParentGroupEntityId();
      this.packageDetails.HospitalID = item.CenterID
      this.packageDetails.LabName = item.ProviderName;
      this.packageDetails.ProviderID = item.ProviderId;
      this.packageDetails.Email = this.userDetails.UserLogin;
      this.packageDetails.ContactNo = this.userDetails.CountryCode + this.userDetails.Contact;
      this.packageDetails.LineItemId = item.LabPackageId;
      this.addedPackageList.push(this.packageDetails);
      console.log("this.addedPackageList");
      console.log(this.addedPackageList);
    })
  }
  //Get Family list
  getFamilyList(value) {
    this._dataContext.GetFamilyListForDropDown()
      .subscribe(response => {
        if (response.length > 0) {
          this.documentsFor = response;
          if (value) {
            //this.isChecked = false;
            this.packageDetails.BookedFor = this.documentsFor[this.documentsFor.length - 1].Value;
            this.packageDetails.BookedForName = this.documentsFor[this.documentsFor.length - 1].DisplayText;
            this.packageDetails.CustomerName = this.documentsFor[this.documentsFor.length - 1].DisplayText;
            this.packageDetails.ConsumerId = 0;
            this.selectedUser = this.documentsFor[this.documentsFor.length - 1].Value;
            this.familyUser = this.documentsFor[this.documentsFor.length - 1].Value;
            this.confirmBooking();
          }
          this.documentsFor.push({ DisplayText: this.userDetails.FirstName, Value: this.userDetails.ConsumerID, Relation: "Self", RelationId: 0 });
          this.documentsFor.reverse();
        }
        else {
          this.documentsFor.push({ DisplayText: this.userDetails.FirstName, Value: this.userDetails.ConsumerID, Relation: "Self", RelationId: 0 });
          this.documentsFor.reverse();
        }
        this.documentsFor.filter(item => {
          item.DisplayText = this.commonService.convert_case(item.DisplayText);
        });
        // this.documentsFor.filter((item) => { item.DisplayText = item.DisplayText.substr(0, item.DisplayText.indexOf('(')); })
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
    this.packageDetails.ConsumerId = id;
    this.packageDetails.BookedFor = id;
    //  this.familyUser = 0;
    this.packageDetails.BookedForName = name;
    this.packageDetails.CustomerName = name;
    // }
    // else {
    //   this.isChecked = false;
    //   this.packageDetails.BookedFor = id;
    //   this.packageDetails.BookedForName = name;
    //   this.packageDetails.CustomerName = name;
    //   this.packageDetails.ConsumerId = 0;
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
      title: "Booking Confirmation",
      message: '<b style="color: #00bebc !important;font-weight: 100 !important;">Please verify your Booking details</b>' + '<br\><br\>' + '<b>Center Name:</b>   ' + this.providerInfo.DiagnosticCenterName.CenterName + '<br\>' + '<b>City:   </b>' + this.providerInfo.DiagnosticCenterName.City + '<br\>' + '<b>Booking For:   </b>' + this.packageDetails.BookedForName + '<br\>' + '<b>Date:   </b>' + this.packageDetails.BookingDate + '<br\>' + '<b>Time:   </b>' + this.timeSlotInfo.timeSlot + '<br\>' + '<b>Number Of Package:   </b>' + this.addedPackageList.length + '<br\>' + '<b>Total Price:   </b>' + this.showTotalPrice,
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel',
          handler: () => {
            //this.viewCtrl.dismiss();
            // console.log('Cancel clicked');

          }
        },
        {
          text: 'CONFIRM',
          handler: () => {
            this.commonService.onEventSuccessOrFailure("Diagnostic appointment pre conformation start");
            this.ProceedToPay();
          }
        }
      ]
    });
    alert.present();
  }

  ProceedToPay() {
    this.addedPackageList.filter(item => {
      item.BookedFor = this.packageDetails.BookedFor;
      item.PaymentType = "Paytm";
    })
    this._dataContext.ScheduleHealthPackageThroughPayment(this.addedPackageList,false)
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
          const browser = this.iab.create(this.commonService.getPaymentApiURL() + "Payment/PaytmPamentGateway?interimOrderDeatilsId=" + refId,'_blank',options);
          browser.show();
          browser.on('loadstop').subscribe(event => {
            if (event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentSuccessResponse" || event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentPendingResponse") {
              browser.close();
              let addedPackageFromCart = [];
              this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userDetails.ConsumerID, addedPackageFromCart).then(result => {
                this.navCtrl.push("PackageConfirmationAfterPG", { appoDetails: this.addedPackageList, centerDetails: this.providerInfo.DiagnosticCenterName, AppoFor: this.addMembers, referenceId: refId });
              });
            }
            else if (event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentFailureResponse") {
              browser.close();
              this.navCtrl.push("PackageFailureAfterPG", { appoDetails: this.addedPackageList, centerDetails: this.providerInfo.DiagnosticCenterName, AppoFor: this.addMembers, referenceId: refId });
            }
            // else if (event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentPendingResponse") {
            //   browser.close();
            // }
          });
        }
        else {
          this.commonService.onMessageHandler(result.Message, 0);
        }
      },
        error => {
          this.commonService.onEventSuccessOrFailure("Failed to book package.");
          this.commonService.onMessageHandler("Failed. Please contact support.", 0);
        });
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
      //this.signup.Contact = this.countryCode + this.contact;
      this._dataContext.getValidateEmailAndMobile(this.signup)
        .subscribe(response => {
          if (response.Status) {
            //this.sendSMSThroughSNS();
            this.userSignUp();
          }
          else {
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
    let addModal = this.modalCtrl.create("AddNewMember", { contact: this.packageDetails.ContactNo });
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
          let userDetails = response.result.ConsumerCollection[0];
          this.packageDetails.BookedFor = 0;
          this.packageDetails.BookedForName = userDetails.FirstName;
          this.packageDetails.CustomerName = userDetails.FirstName;
          this.packageDetails.ConsumerId = userDetails.ConsumerID;
          this.packageDetails.Email = userDetails.UserLogin;
          this.packageDetails.ContactNo = this.signup.CountryCode + this.signup.Contact;
          this.confirmBooking();
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
        });
  }
}







