import { Component, NgZone } from '@angular/core';
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
  selector: 'page-dclabbookingpreconfirmation',
  templateUrl: 'dclabbookingpreconfirmation.html',
  providers: [InAppBrowser]

})
export class DCLabBookingpPreConfirmation {
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
    HospitalID: 0,
    CartItemType: 0,
    IsRedeem: false
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
  addedBookingDCOrderList: any = [];
  totalPrice: number = 0;
  totalDiscount: any;
  totalPriceBeforeDiscount: number = 0;
  showTotalPriceBeforeDiscount: string;
  showTotalPrice: number = 0;
  selectedUser: string;
  countList: any = [];
  redeemableConsumerWallet: any = {
    isRedeemableFromConsumerWallet: false,
    consumerWalletBalance: 0,
    totalOrderPrice: 0,
    consumerWalletRedeemableAmount: 0,
    maxWalletRedeemableAmount: 0,
    maxWalletRedeemablePercentage: 0,
    consumerWalletRedeemableHPCash: 0,
    maxRedeemableHPCash: 0,
    hPCashRupeeValue: 0
  };
  isRedeemable: boolean = false;
  redeemableAmount: number = 0;
  remainingWalletBalance: any;
  redeemMessage: string = "";
  selectedUserName: string;
  addedPackageAndTestInCart = [];
  constructor(public events: Events, public ngZone: NgZone, public platform: Platform, public appCtrl: App, private iab: InAppBrowser, private modalCtrl: ModalController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
    this.providerInfo = this.navParams.get('providerDetails');
    this.timeSlotInfo = this.navParams.get('timeSlotInfo');
    if (this.providerInfo.Package.length > 0) {
      this.providerInfo.Package.filter(item => {
        this.totalPrice += Number(item.PriceAfterDiscount);
        this.totalPriceBeforeDiscount += Number(item.Price);
        this.countList.push(item);
      });
    }
    if (this.providerInfo.LabTest.length > 0) {
      this.providerInfo.LabTest.filter(item => {
        this.totalPrice += Number(item.PriceAfterDiscount);
        this.totalPriceBeforeDiscount += Number(item.Price);
        this.countList.push(item);
      });
    }
    if (this.providerInfo.LabScan.length > 0) {
      this.providerInfo.LabScan.filter(item => {
        this.totalPrice += Number(item.PriceAfterDiscount);
        this.totalPriceBeforeDiscount += Number(item.Price);
        this.countList.push(item);
      });
    }
    if (this.providerInfo.LabProfile.length > 0) {
      this.providerInfo.LabProfile.filter(item => {
        this.totalPrice += Number(item.PriceAfterDiscount);
        this.totalPriceBeforeDiscount += Number(item.Price);
        this.countList.push(item);
      });
    }
    this.totalPrice = Math.round(this.totalPrice);
    this.showTotalPrice = this.totalPrice;
    this.totalDiscount = (((this.totalPriceBeforeDiscount - this.totalPrice) / this.totalPriceBeforeDiscount) * 100).toFixed(2);
    this.showTotalPriceBeforeDiscount = Math.round(this.totalPriceBeforeDiscount).toString();
  }
  ionViewDidEnter() {
    this.getDeviceTOKEN();
    if (this.navCtrl.getActive().name == "DCBookingConfirmationAfterPG" || this.navCtrl.getActive().id == "DCBookingConfirmationAfterPG") {
      this.navCtrl.setRoot("DashBoard");
      this.appCtrl.getActiveNav().push("BookedPackage");
    }
    this.getUserDetailsFromCache();
    this.commonService.onEntryPageEvent("Diagnostic appointment pre conformation start");
    // onEventSuccessOrFailure
    // this.getDiagnosticAppointmentDetailsFromCache();
  }
  UpdateDateOfDiagnosticInCache(bookedDate) {
    this.commonService.getStoreDataFromCache("diagnosticAppointmentdetails")
      .then((result) => {
        if (result.ProviderHealthPlanId != undefined && result.ProviderHealthPlanLineItemId != undefined) {
          // this.events.publish('healthPlanDiagnostic:created', result);
          let DiagnosticData = result;
          DiagnosticData["SelectedDate"] = bookedDate;
          this.commonService.setStoreDataIncache("diagnosticAppointmentdetails", DiagnosticData);
          console.log(DiagnosticData)
        }

      });
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
  //This is used for getting user wallet details to redem while booking DC order.
  getWalletRedeemtionDetails() {
    this._dataContext.GetRedeemableConsumerWalletForCart(this.addedBookingDCOrderList)
      .subscribe(response => {
        this.ngZone.run(result => {
          this.redeemableConsumerWallet.isRedeemableFromConsumerWallet = response.IsRedeemableFromConsumerWallet;
          this.redeemableConsumerWallet.consumerWalletBalance = response.ConsumerWalletBalance;
          this.redeemableConsumerWallet.totalOrderPrice = response.TotalOrderAmount;
          this.redeemableConsumerWallet.consumerWalletRedeemableAmount = response.ConsumerWalletRedeemableAmount;
          this.redeemableConsumerWallet.maxWalletRedeemableAmount = response.MaxWalletRedeemableAmount;
          this.redeemableConsumerWallet.maxWalletRedeemablePercentage = response.MaxWalletRedeemablePercentage;
          this.redeemableConsumerWallet.consumerWalletRedeemableHPCash = response.ConsumerWalletRedeemableHPCash;
          this.redeemableConsumerWallet.maxRedeemableHPCash = response.MaxRedeemableHPCash;
          this.redeemableConsumerWallet.hPCashRupeeValue = response.HPCashRupeeValue;
          this.remainingWalletBalance = Math.round(Number(this.redeemableConsumerWallet.consumerWalletBalance) - Number(this.redeemableConsumerWallet.consumerWalletRedeemableAmount));
          this.redeemMessage = "You can redeem " + this.redeemableConsumerWallet.maxWalletRedeemableAmount + " units or " + this.redeemableConsumerWallet.maxWalletRedeemablePercentage + "% of your total wallet balance. Current valuation of a HealthPro Cash unit is Re 1, which is subject to change. i.e 1 unit = Re 1"
          this.isRedeemable = this.redeemableConsumerWallet.isRedeemableFromConsumerWallet;
          this.redeemableAmount = this.redeemableConsumerWallet.consumerWalletRedeemableAmount;
          this.showTotalPrice = this.totalPrice - this.redeemableAmount;
        });
      },
      error => {
        this.commonService.onMessageHandler("Failed. Please try again.", 0);
      });
  }
  getRedeemAmount() {
    if (this.isRedeemable) {
      this.showTotalPrice = Math.round(this.totalPrice - this.redeemableConsumerWallet.consumerWalletRedeemableAmount);
      this.remainingWalletBalance = Math.round(Number(this.redeemableConsumerWallet.consumerWalletBalance) - Number(this.redeemableConsumerWallet.consumerWalletRedeemableAmount));
    } else {
      this.showTotalPrice = this.totalPrice;
      this.remainingWalletBalance = Math.round(Number(this.redeemableConsumerWallet.consumerWalletBalance));
    }
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
  // configurepackageDetails() {
  //   if (this.providerInfo.Package.length > 0) {
  //     this.providerInfo.Package.filter(result => {
  //       this.packageDetails.ConsumerId = this.userDetails.ConsumerID;
  //       this.packageDetails.CustomerName = this.userDetails.FirstName;
  //       this.packageDetails.BookedForName = this.userDetails.FirstName;
  //       this.packageDetails.CustomerCity = result.City;
  //       this.packageDetails.BookingDate = this.selectedDate;
  //       this.packageDetails.GroupEntityId = this.commonService.getGroupEntityId();
  //       this.packageDetails.ParentGroupEntityId = this.commonService.getParentGroupEntityId();
  //       this.packageDetails.HospitalID = result.GroupEntityId
  //       this.packageDetails.LabName = this.providerInfo.DiagnosticCenter.CenterName;
  //       this.packageDetails.ProviderID = this.providerInfo.DiagnosticCenter.CenterID;
  //       this.packageDetails.Email = this.commonService.validateEmail(this.userDetails.UserLogin)?this.userDetails.UserLogin:"";;
  //       this.packageDetails.ContactNo = this.commonService.validatePhone(this.userDetails.Contact)? this.userDetails.CountryCode + this.userDetails.Contact:"";
  //       this.packageDetails.LineItemId = result.LabPackageId;
  //       this.packageDetails.CartItemType = 1;
  //       this.addedBookingDCOrderList.push(Object.assign({}, this.packageDetails));
  //     });
  //   }
  //   if (this.providerInfo.LabTest.length > 0) {
  //     this.providerInfo.LabTest.filter(item => {
  //       this.packageDetails.ConsumerId = this.userDetails.ConsumerID;
  //       this.packageDetails.CustomerName = this.userDetails.FirstName;
  //       this.packageDetails.BookedForName = this.userDetails.FirstName;
  //       this.packageDetails.CustomerCity = item.City;
  //       this.packageDetails.BookingDate = this.selectedDate;
  //       this.packageDetails.GroupEntityId = this.commonService.getGroupEntityId();
  //       this.packageDetails.ParentGroupEntityId = this.commonService.getParentGroupEntityId();
  //       this.packageDetails.HospitalID = item.GroupEntityId
  //       this.packageDetails.LabName = this.providerInfo.DiagnosticCenter.CenterName;
  //       this.packageDetails.ProviderID = this.providerInfo.DiagnosticCenter.CenterID;
  //       this.packageDetails.Email = this.commonService.validateEmail(this.userDetails.UserLogin)?this.userDetails.UserLogin:"";;
  //       this.packageDetails.ContactNo = this.commonService.validatePhone(this.userDetails.Contact)? this.userDetails.CountryCode + this.userDetails.Contact:"";
  //       this.packageDetails.LineItemId = item.LabTestId;
  //       this.packageDetails.CartItemType = 2;
  //       this.addedBookingDCOrderList.push(Object.assign({}, this.packageDetails));
  //     });
  //   }
  //   if (this.providerInfo.LabScan.length > 0) {
  //     this.providerInfo.LabScan.filter(response => {
  //       this.packageDetails.ConsumerId = this.userDetails.ConsumerID;
  //       this.packageDetails.CustomerName = this.userDetails.FirstName;
  //       this.packageDetails.BookedForName = this.userDetails.FirstName;
  //       this.packageDetails.CustomerCity = response.City;
  //       this.packageDetails.BookingDate = this.selectedDate;
  //       this.packageDetails.GroupEntityId = this.commonService.getGroupEntityId();
  //       this.packageDetails.ParentGroupEntityId = this.commonService.getParentGroupEntityId();
  //       this.packageDetails.HospitalID = response.GroupEntityId
  //       this.packageDetails.LabName = this.providerInfo.DiagnosticCenter.CenterName;
  //       this.packageDetails.ProviderID = this.providerInfo.DiagnosticCenter.CenterID;
  //       this.packageDetails.Email = this.commonService.validateEmail(this.userDetails.UserLogin)?this.userDetails.UserLogin:"";;
  //       this.packageDetails.ContactNo = this.commonService.validatePhone(this.userDetails.Contact)? this.userDetails.CountryCode + this.userDetails.Contact:"";
  //       this.packageDetails.LineItemId = response.LabTestId;
  //       this.packageDetails.CartItemType = 3;
  //       this.addedBookingDCOrderList.push(Object.assign({}, this.packageDetails));
  //     });
  //   }
  //   if (this.providerInfo.LabProfile.length > 0) {
  //     this.providerInfo.LabProfile.filter(res => {
  //       this.packageDetails.ConsumerId = this.userDetails.ConsumerID;
  //       this.packageDetails.CustomerName = this.userDetails.FirstName;
  //       this.packageDetails.BookedForName = this.userDetails.FirstName;
  //       this.packageDetails.CustomerCity = res.City;
  //       this.packageDetails.BookingDate = this.selectedDate;
  //       this.packageDetails.GroupEntityId = this.commonService.getGroupEntityId();
  //       this.packageDetails.ParentGroupEntityId = this.commonService.getParentGroupEntityId();
  //       this.packageDetails.HospitalID = res.GroupEntityId
  //       this.packageDetails.LabName = this.providerInfo.DiagnosticCenter.CenterName;
  //       this.packageDetails.ProviderID = this.providerInfo.DiagnosticCenter.CenterID;
  //       this.packageDetails.Email = this.commonService.validateEmail(this.userDetails.UserLogin)?this.userDetails.UserLogin:"";;
  //       this.packageDetails.ContactNo = this.commonService.validatePhone(this.userDetails.Contact)? this.userDetails.CountryCode + this.userDetails.Contact:"";
  //       this.packageDetails.LineItemId = res.LabProfileId;
  //       this.packageDetails.CartItemType = 4;
  //       this.addedBookingDCOrderList.push(Object.assign({}, this.packageDetails));
  //     });
  //   }
  //   this.addedBookingDCOrderList.filter(resp => {
  //     resp.BookedFor = this.packageDetails.BookedFor;
  //     resp.PaymentType = "Paytm";
  //   });
  //   this.selectedUserName = this.userDetails.FirstName;
  //   this.getWalletRedeemtionDetails();
  // }
  configurepackageDetails() {
    if (this.providerInfo.Package.length > 0) {
      this.setPackageDetails(this.providerInfo.Package,1,"LabPackageId");
    }
    if (this.providerInfo.LabTest.length > 0) {
      this.setPackageDetails(this.providerInfo.LabTest,2,"LabTestId");
    }
    if (this.providerInfo.LabScan.length > 0) {
      this.setPackageDetails(this.providerInfo.LabScan,3,"LabTestId");
    }
    if (this.providerInfo.LabProfile.length > 0) {
      this.setPackageDetails(this.providerInfo.LabProfile,4,"LabProfileId");
    }
    this.addedBookingDCOrderList.filter(resp => {
      resp.BookedFor = this.packageDetails.BookedFor;
      resp.PaymentType = "Paytm";
    });
    this.selectedUserName = this.userDetails.FirstName;
    this.getWalletRedeemtionDetails();
  }
  setPackageDetails(data,type,id){
    data.filter(response => {
      this.packageDetails.ConsumerId = this.userDetails.ConsumerID;
      this.packageDetails.CustomerName = this.userDetails.FirstName;
      this.packageDetails.BookedForName = this.userDetails.FirstName;
      this.packageDetails.CustomerCity = response.City;
      this.packageDetails.BookingDate = this.selectedDate;
      this.packageDetails.GroupEntityId = this.commonService.getGroupEntityId();
      this.packageDetails.ParentGroupEntityId = this.commonService.getParentGroupEntityId();
      this.packageDetails.HospitalID = response.GroupEntityId
      this.packageDetails.LabName = this.providerInfo.DiagnosticCenter.CenterName;
      this.packageDetails.ProviderID = this.providerInfo.DiagnosticCenter.CenterID;
      this.packageDetails.Email = this.commonService.validateEmail(this.userDetails.UserLogin)?this.userDetails.UserLogin:"";;
      this.packageDetails.ContactNo = this.commonService.validatePhone(this.userDetails.Contact)? this.userDetails.CountryCode + this.userDetails.Contact:"";
      this.packageDetails.LineItemId = response[id];
      this.packageDetails.CartItemType = type;
      this.addedBookingDCOrderList.push(Object.assign({}, this.packageDetails));
    });
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
    this.packageDetails.ConsumerId = id;
    this.selectedUserName = name;
    this.packageDetails.CustomerName = name;
    if (this.userDetails.ConsumerID == id)
      this.packageDetails.BookedFor = 0;
    else
      this.packageDetails.BookedFor = id;
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
    this.UpdateDateOfDiagnosticInCache(this.packageDetails.BookingDate);
    let alert = this.alertCtrl.create({
      title: "Booking Confirmation",
      message: '<b style="color: #00bebc !important;font-weight: 100 !important;">Please verify your Booking details</b>' + '<br\><br\>' + '<b>Center Name:</b>   ' + this.providerInfo.DiagnosticCenter.CenterName + '<br\>' + '<b>City:   </b>' + this.providerInfo.DiagnosticCenter.City + '<br\>' + '<b>Booking For:   </b>' + this.packageDetails.BookedForName + '<br\>' + '<b>Date:   </b>' + this.packageDetails.BookingDate + '<br\>' + '<b>Time:   </b>' + this.timeSlotInfo.timeSlot + '<br\>' + '<b>Number Of Order(s):   </b>' + this.countList.length + '<br\>' + '<b>Total Price:   </b>₹ ' + this.showTotalPrice,
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
            this.askUserToUpdateContactInfoBeforeAppo();
          }
        }
      ]
    });
    alert.present();
  }

  ProceedToPay() {
    this.addedBookingDCOrderList.filter(resp => {
      resp.BookedFor = this.packageDetails.BookedFor;
      resp.PaymentType = "Paytm";
      resp.BookedForName = this.selectedUserName;
    });
    this._dataContext.ScheduleHealthPackageThroughPayment(this.addedBookingDCOrderList, this.isRedeemable)
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
              this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userDetails.ConsumerID)
                .then((dcOrders) => {
                  this.addedPackageAndTestInCart = dcOrders;
                  if (this.addedPackageAndTestInCart && this.addedPackageAndTestInCart.length > 0) {
                    for (var i = 0; i < this.addedPackageAndTestInCart.length; i++) {
                      if (Number(this.addedPackageAndTestInCart[i].DiagnosticCenter.CenterID) == Number(this.providerInfo.DiagnosticCenter.CenterID)) {
                        this.addedPackageAndTestInCart.splice(i, 1);
                        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userDetails.ConsumerID, this.addedPackageAndTestInCart).then(response => {
                          this.getAddedPackageFromCart()
                        });
                        //this.navCtrl.push("DCBookingConfirmationAfterPG", { appoDetails: this.addedBookingDCOrderList, centerDetails: this.providerInfo.DiagnosticCenter, AppoFor: this.addMembers, referenceId: refId });
                      }
                    }
                  }
				  this.navCtrl.push("DCBookingConfirmationAfterPG", { appoDetails: this.addedBookingDCOrderList, centerDetails: this.providerInfo.DiagnosticCenter, AppoFor: this.addMembers, referenceId: refId });
                });
            }
            else if (event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentFailureResponse") {
              browser.close();
              this.navCtrl.push("DCBookingFailureAfterPG", { appoDetails: this.addedBookingDCOrderList, centerDetails: this.providerInfo.DiagnosticCenter, AppoFor: this.addMembers, referenceId: refId });
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
  askUserToUpdateContactInfoBeforeAppo() {
    if (this.commonService.validatePhone(this.userDetails.Contact) && this.commonService.validateEmail(this.userDetails.UserLogin)) {
      this.ProceedToPay();
    }
    else {
      let addModal = this.modalCtrl.create("UpdateConsumerContactInfo", { consumerDetails: this.userDetails });
      addModal.onDidDismiss(item => {
        if (item){
         // this.paymentDetails = item;
          this.packageDetails.Email = item.UserLogin;
          this.packageDetails.ContactNo = item.CountryCode + item.Contact;
        }
        this.ProceedToPay();
      });
      addModal.present();
    }
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
          this.getGenderList(0);
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
  ionViewWillLeave() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userDetails.ConsumerID, this.addedPackageAndTestInCart);
  }
  getAddedPackageFromCart() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userDetails.ConsumerID)
      .then((result) => {
        if (result && result.length > 0)
          this.addedPackageAndTestInCart = result;
        else
          this.addedPackageAndTestInCart = [];
      });
  }
}







