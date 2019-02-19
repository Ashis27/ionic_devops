import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, IonicPage, ToastController, NavParams, ModalController, Platform } from 'ionic-angular';
import { Device } from '@ionic-native/device';

// import * as $ from 'jquery';
import moment from 'moment';
import { UserRegister, UserLogin, ConsumerNotification } from "../../../interfaces/user-options";
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";
import { LocalNotifications } from '@ionic-native/local-notifications';
import { String, StringBuilder } from 'typescript-string-operations';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-user',
  templateUrl: 'signup.html',
  providers: [LocalNotifications, InAppBrowser]
})
export class SignupPage {
  signup: UserRegister = { UserLogin: "", Password: "", FirstName: "", Contact: "", CountryCode: "", DateOfBirth: "", Sex: "", City: "", Locality: "", TC: false, GroupEntityId: 0, ParentGroupEntityId: 0, ReferralCode: "", MobileDeviceId: "", MobileDeviceType: "" };
  loginData: UserLogin = { UserLogin: "", Password: "", Contact: "", CountryCode: "", GroupEntityId: 0, ParentGroupEntityId: 0 };
  submitted = false;
  maxDate: string;
  showSelectedDate: string;
  genders: any = [];
  //countryCode: string;
  contactNumber: string;
  isNumberTyped: boolean = false;
  contact: string;
  status: boolean = false;
  activeCountry: any = [];
  activeState: any = [];
  notificationDetails: ConsumerNotification = { ConsumerID: 0, Contact: "", Email: "", GroupEntityId: 0, ModuleId: 0, Message: "" }
  constructor(private iab: InAppBrowser, public platform: Platform, public localNotifications: LocalNotifications, private device: Device, private modalCtrl: ModalController, public navParams: NavParams, public navCtrl: NavController, public _dataContext: DataContext, public _toastCtrl: ToastController, private commonService: CommonServices) {
    this.status = this.navParams.get('status');
    this.getActiveCountryAndStateFromCache();
    this.getGenderFromCache();
    this.getActiveLocation();
  }

  //Initial entry point
  ionViewDidEnter() {
    this.getDeviceTOKEN();
    //this.signup.MobileDeviceId = this.device.uuid;
    //this.maxDate = moment().subtract(18, 'years').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    this.showSelectedDate = moment().subtract(18, 'years').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    this.maxDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    // this.showSelectedDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  }
  getDeviceTOKEN() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserDeviceToken")).then(data => {
      if (data) {
        if (this.platform.is('ios')) {
          this.signup.MobileDeviceType = "iOS";
        } else if (this.platform.is('android')) {
          this.signup.MobileDeviceType = "android";
        }
        else {
          this.signup.MobileDeviceType = "tablet";
        }
        this.signup.MobileDeviceId = data;
      }
    });
  }
  getActiveLocation() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation")).then(data => {
      this.signup.City = data.activeCity;
      this.signup.Locality = data.activeLocation;
    })
  }
  //Get Gender List from cache, if not available then get from server.
  getGenderFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getGender"))
      .then((result) => {
        if (result) {
          this.genders = result;
          this.signup.Sex = this.genders[1].Value;
          this.getGenderList(0);
        }
        else {
          this.getGenderList(1);
        }
      });
  }
  //Get gender list.
  getGenderList(value) {
    this._dataContext.GetGenderList(value)
      .subscribe(response => {
        this.genders = response;
        this.signup.Sex = this.genders[1].Value;
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getGender"), this.genders);
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to retrieve. Please try again.", 0);
        });
  }
  //Change Country countryCode
  selectedCountryCode(value) {
    // this.countryCode = value
  }

  //User Registration
  onSignup(form: NgForm) {
    if (this.commonService.isValidateForm(form)) {
      if (this.signup.Password && this.signup.Password.length > 0) {
        if (this.signup.Password.length >= 8)
          this.validateEmailAndMobile();
        else
          this.commonService.onMessageHandler("Password must be at least 8 characters", 0);
      }
      else
        this.validateEmailAndMobile();
    }
  }

  //After OTP verifying 
  userSignUp() {
    this._dataContext.UserRegister(this.signup)
      .subscribe(response => {
        if (response.Result == "Success") {
          this.commonService.onMessageHandler(response.Message, 1);
          this.onLogin(this.signup);
          this.commonService.onEventSuccessOrFailure("SignUp Successfully");
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
          this.commonService.onEventSuccessOrFailure("SignUp Failed");
        });
  }
  //Get active countries and states from cache, if not available then get from server.
  getActiveCountryAndStateFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveCountryAndState"))
      .then((result) => {
        if (result) {
          this.activeCountry = result.countriesAvailable;
          this.signup.CountryCode = result.countriesAvailable[0].DemographyCode;
          this.getActiveCountriesAndStates(0);
        }
        else {
          this.getActiveCountriesAndStates(1);
        }
      });
  }
  //Get Active Countries and States based on network status.
  getActiveCountriesAndStates(value) {
    this._dataContext.GetActiveCountryAndState(value)
      .subscribe(response => {
        if (response.Result == "Success") {
          this.activeCountry = response.Data.countriesAvailable;
          this.signup.CountryCode = response.Data.countriesAvailable[0].DemographyCode;
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveCountryAndState"), response.Data);
        }
        else {
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  //User Sign In
  onLogin(data) {
    if (data.Password && data.Password.length >= 8)
      this.onLoginWithPassword(data);
    else
      this.onLoginWithOTP(data);
  }
  onLoginWithOTP(data) {
    data.Contact = data.CountryCode + data.Contact;
    this._dataContext.UserLoginWithOTP(data)
      .subscribe((response) => {
        if (response.access_token) {
          //This is used for storing user looged In type.
          //Via social or manual logged-In
          /// 1 = Logged-In Via Social site
          /// 0 = Normal log-In
          localStorage.setItem('user_auth_token', response.access_token);
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getConsumerLoggedInType"), 0);
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), { loginStatus: true, userName: data.FirstName, contact: data.CountryCode + data.Contact, email: data.UserLogin, userDetails: [] });
          this.navCtrl.push("DashBoard");
          this.sendNotification();
          this.updateOTP();
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
        });


  }
  onLoginWithPassword(data) {
    data.Contact = data.CountryCode + data.Contact;
    this._dataContext.UserLogin(data)
      .subscribe((response) => {
        if (response.access_token) {
          localStorage.setItem('user_auth_token', response.access_token);
          //This is used for storing user looged In type.
          //Via social or manual logged-In
          /// 1 = Logged-In Via Social site
          /// 0 = Normal log-In
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getConsumerLoggedInType"), 0);
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), { loginStatus: true, userName: data.FirstName, contact: data.CountryCode + data.Contact, email: data.UserLogin, userDetails: [] });
          // this.sendEmailThroughSNS();
          this.navCtrl.push("DashBoard");
          this.sendNotification();
          this.updateOTP();
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
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
    let signupNotification = result.filter(item => {
      if (item.ModuleName == "Registration Confirmation") {
        return item;
      }
    })
    if (signupNotification.length > 0) {
      this.localNotifications.schedule({
        id: new Date().getMilliseconds(),
        title: signupNotification[0].Subject,
        text: signupNotification[0].MessageBody,
        trigger: { at: new Date(new Date().getTime() + 100) },
        vibrate: true,
        //sound: "file://notification.mp3",
        icon: "file://logo.png",
        //every: "0"
      });
      this.notificationDetails.ModuleId = signupNotification[0].ModuleId;
      this.notificationDetails.Message = signupNotification[0].MessageBody;
    }
    else {
      this.localNotifications.schedule({
        id: new Date().getMilliseconds(),
        title: 'Welcome to HealthPro!',
        text: "We are always committed to provide you the best of quality services",
        trigger: { at: new Date(new Date().getTime() + 100) },
        vibrate: true,
        //sound: "file://notification.mp3",
        icon: "file://logo.png",
        //every: "0"
      });
      this.notificationDetails.Message = "We are always committed to provide you the best of quality services";
    }
    this.notificationDetails.Contact = this.signup.Contact;
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
  updateOTP() {
    this._dataContext.UpdateConsumerOTP(this.signup.Contact)
      .subscribe((response) => {
        console.log(response);
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
        });
  }
  //Sending email through SNS
  sendEmailThroughSNS() {
    let emailJsonData = this.commonService.getAWSEmailJsonFormat();
    emailJsonData.email[0].to_email = this.signup.UserLogin;
    emailJsonData.email[0].from_name = this.commonService.getAppTitle();
    this._dataContext.SendEmailThroughSNS(emailJsonData)
      .subscribe(response => {
        if (response.Status) {
          console.log(response);
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          // this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  //send SMS through SNS
  sendSMSThroughSNS() {
    this._dataContext.GetOTP(this.signup.Contact, 0)
      .subscribe(response => {
        if (response.Status) {
          this.onOTPVerify(this.signup);
          console.log(response);
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          // this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  //Redirect to verify onOTPVerify
  onOTPVerify(value) {
    let addModal = this.modalCtrl.create("OTPVerification", { contactNumber: value.CountryCode + value.Contact, redirectPage: "signUp", isContactSelected: true });
    addModal.onDidDismiss(item => {
      if (item) {
        this.userSignUp();
      }
    })
    addModal.present();
  }

  //Validate Email and Mobile number
  // validateEmailAndMobile() {
  //   this._dataContext.getValidateEmailAndMobile(this.signup)
  //     .subscribe(response => {
  //       if (response.Status) {
  //         //this.sendSMSThroughSNS();
  //         this.onOTPVerify(this.signup);
  //       }
  //       else {
  //         this.commonService.onMessageHandler(response.Message, 0);
  //       }
  //     },
  //       error => {
  //         console.log(error);
  //         //loading.dismiss().catch(() => { });
  //         this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
  //       });
  // }
  validateEmailAndMobile() {
    this._dataContext.getValidateEmailAndMobile(this.signup)
      .subscribe(response => {
        if (response.Status) {
          this.onOTPVerify(this.signup);
        }
        else {
          //This is for getting consumer reg. details(Through provider or App)
          if (response.Result != null && response.Result != undefined && response.Result.Password == null && response.Result.Stage == 0) {
            this._dataContext.GetOTP(this.signup.CountryCode + this.signup.Contact, 0)
              .subscribe(respons => {
                if (respons.Status) {
                  let addModal = this.modalCtrl.create("OTPVerification", { contactNumber: this.signup.CountryCode + this.signup.Contact, isContactSelected: true, isRegisteredByDoc: true });
                  addModal.onDidDismiss(item => {
                    if (item) {
                      this.navCtrl.push("ResetPassword", { contactNumber: this.signup.CountryCode + this.signup.Contact });
                    }
                  })
                  addModal.present();
                }
                else {
                  this.commonService.onMessageHandler(respons.Message, 0);
                }
              },
                error => {
                  console.log(error);
                  //loading.dismiss().catch(() => { });
                  this.commonService.onMessageHandler("Failed. Please try again.", 0);
                });
          }
          else
            this.commonService.onMessageHandler(response.Message, 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  //Redirect to Login page
  onSignIn() {
    this.navCtrl.setRoot("LoginPage");
  }
  //Date select from drop down
  onSelectedDate() {
    this.signup.DateOfBirth = moment(this.showSelectedDate).subtract(330, "minutes").format('DD-MMM-YYYY');
  }
  //Skip to dashboard 
  onSkipToDashboard() {
    this.navCtrl.push("DashBoard");
  }
  //validate only number
  onlyNumber(event) {
    return this.commonService.validateOnlyNumber(event);
  }
  //Redirect to Terms and Conditions page
  getTermsAndConditions() {
    const browser = this.iab.create(this.commonService.getTermsAndConditions(), '_blank');
  }
  //validate alpha-numeric
  ValidateAlphaNumeric(event) {
    return this.commonService.validateAlphanumeric(event);
  }
}
