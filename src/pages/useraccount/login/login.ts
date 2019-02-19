import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, IonicPage, Platform, ModalController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
// import { GooglePlus } from '@ionic-native/google-plus';
import moment from 'moment';
//Pages
import { CommonServices } from "../../../providers/common.service";
import { DataContext } from "../../../providers/dataContext.service";
import { UserLogin, UserRegister, FBInformation, GPInformation } from "../../../interfaces/user-options";

@IonicPage()
@Component({
  selector: 'page-user',
  templateUrl: 'login.html',
  providers: [Facebook]
})
export class LoginPage {
  login: UserLogin = { UserLogin: '', Password: '', rememberMe: false, Contact: "", CountryCode: "", GroupEntityId: 0, ParentGroupEntityId: 0 };
  signup: UserRegister = { UserLogin: "", Password: "", FirstName: "", Contact: "", CountryCode: "", DateOfBirth: "", Sex: "", City: "", Locality: "", TC: false, GroupEntityId: 0, ParentGroupEntityId: 0, ReferralCode: "", MobileDeviceId: "", MobileDeviceType: "" };
  fbInformation: FBInformation = {
    FBName: "",
    FBFirstName: "",
    FBLastName: "",
    FBVerified: true,
    FBGender: "",
    FBBirthday: "",
    FBEmail: "",
    FBToken: "string"
  };
  gpInformation: GPInformation = {
    GPName: "",
    GPFirstName: 0,
    GPLastName: "",
    GPVerified: true,
    GPGender: "",
    GPBirthday: "",
    GPEmail: "",
    GPToken: ""
  };
  submitted = false;
  userEmailOrMobile: string = "";
  maxLen: number = 100;
  countryCode: string;
  isNumberTyped: boolean = false;
  userPassword: string;
  activeCountry: any = [];
  activeState: any = [];
  loggedInUser = { loginStatus: false, userName: "", contact: "", email: "", userDetails: [] }
  constructor(private modalCtrl: ModalController, public platform: Platform, private fb: Facebook, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {
    this.getActiveCountryAndStateFromCache();
  }


  //Initial entry point
  ionViewDidEnter() {
    this.commonService.onEntryPageEvent("Login Page");
  }

  //User Login
  onLogin(form: NgForm) {
    // this.login.Password = this.userPassword;
    if (this.userEmailOrMobile != "" && this.userEmailOrMobile != undefined) {
      if (this.isNumberTyped) {
        if (this.commonService.validatePhone(this.userEmailOrMobile)) {
          this.login.Contact = this.countryCode + this.userEmailOrMobile;
          this.validateEmailAndMobile();
        }
        else {
          this.commonService.onMessageHandler("Please enter a valid mobile number", 0);
        }
      }
      else {
        if (this.commonService.validateEmail(this.userEmailOrMobile)) {
          this.login.UserLogin = this.userEmailOrMobile;
          this.validateEmailAndMobile();
        }
        else {
          this.commonService.onMessageHandler("Please enter a valid email id", 0);
        }
      }
    }
    else
      this.commonService.onMessageHandler("Please enter a valid email id or mobile number", 0);
  }
  //After validation call to Login method
  userLogin() {
    this._dataContext.UserLogin(this.login)
      .subscribe(response => {
        this.commonService.onMessageHandler("Successfully logged in.", 1);
        this.commonService.onLoginSuccess();
        this.onSetAuthToken(response);
        this.getLoggedInUserDetailsFromCache();
      },
        error => {
          this.commonService.onEventSuccessOrFailure("Login Failed");
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Invalid user id or password.", 0);
        });
  }
  //Get Logged In user details from cache, if not available then get from server.
  getLoggedInUserDetailsFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
      .then((result) => {
        if (result) {
          this.loggedInUser = result;
        }
        this.navCtrl.setRoot("DashBoard");
        this.updateUserDeviceToken();
        this.loggedInUser.loginStatus = true;
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), this.loggedInUser);
      });
  }
  //Get active countries and states from cache, if not available then get from server.
  getActiveCountryAndStateFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveCountryAndState"))
      .then((result) => {
        if (result) {
          this.activeCountry = result.countriesAvailable;
          this.countryCode = result.countriesAvailable[0].DemographyCode;
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
          this.countryCode = response.Data.countriesAvailable[0].DemographyCode;
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
  onSetAuthToken(response) {
    localStorage.setItem('user_auth_token', response.access_token);
  }
  //Change Country countryCode
  selectedCountryCode(value) {
    console.log(value);
    this.isNumberTyped = true;
    this.maxLen = 10;
  }
  //Redirect to verify onOTPVerify
  onOTPVerify(value) {
    this.navCtrl.push("OTPVerification", { userDetails: value });
  }
  //Redirect to Sign up
  onSignup() {
    this.navCtrl.push("SignupPage", { "status": true });
  }
  getFaceBookLoginDetails(authId) {
    this.fb.api(authId + "/?fields=id,email,name,last_name,gender,birthday", ['public_profile', 'email']).then(response => {
      this.fbInformation.FBEmail = response.email;
      // this.fbInformation.FBBirthday = moment(response.dob).format("DD-MMM-YYYY");
      this.fbInformation.FBName = response.name;
      this.fbInformation.FBFirstName = response.name;
      this.fbInformation.FBToken = response.id;
      this.fbInformation.FBGender = response.gender != undefined && response.gender != null ? response.gender : "";
      // "http://graph.facebook.com/{userId}/picture?type=large"
      this.login.UserLogin = response.email;
      this.loggedInUser.userName = response.name;
      this.loggedInUser.email = response.email;
      this._dataContext.FacebookSignUp(this.fbInformation)
        .subscribe(response => {
          if (response.Status) {
            this.onSocialLogin(this.fbInformation.FBToken, this.fbInformation.FBEmail);
            console.log(response);
          }
        },
          error => {
            console.log(error);
            //loading.dismiss().catch(() => { });
            this.commonService.onEventSuccessOrFailure("Facebook login failed");
            this.commonService.onMessageHandler("Failed. Please try again.", 0);
          });

    })
      .catch(e => { this.commonService.onMessageHandler(e.errorMessage, 0) });
  }
  onFaceBookLogin() {
    this.fb.login(['public_profile', 'email'])
      .then((res: FacebookLoginResponse) => {
        let authId = res.authResponse.userID;
        if (res.status == "connected") {
          this.getFaceBookLoginDetails(authId);
        } else {
          this.commonService.onEventSuccessOrFailure("Facebook login failed");
          alert("Not connected: " + res.status);
        }
      })
      .catch(e => console.log('Error logging into Facebook', e));
  }
  //Login through Social site
  onConnectWithSocial(value) {
    // this.loggedInUser = { loginStatus: false, userName: "", contact: "",email:"", userDetails: [] }
    if (value == "facebook") {
      this.fb.getLoginStatus().then((res) => {
        if (res.status === 'connected') {
          let authId = res.authResponse.userID;
          this.getFaceBookLoginDetails(authId);
        } else {
          this.onFaceBookLogin();
        }
      }, (error) => {
      });
    }
    else {
      //   this.googlePlus.login({})
      //     .then(response => {
      //       this.gpInformation.GPEmail = response.email;
      //       this.gpInformation.GPFirstName = response.givenName;
      //       this.gpInformation.GPToken = response.userId;
      //       this.login.UserLogin = response.email;
      //       this.loggedInUser.userName = response.givenName;
      //       this.loggedInUser.email = response.email;
      //       this._dataContext.GooglePlusSignUp(this.gpInformation)
      //         .subscribe(response => {
      //           if (response.Status) {
      //             this.onSocialLogin(this.gpInformation.GPToken, this.gpInformation.GPEmail);
      //             console.log(response);
      //           }
      //         },
      //           error => {
      //             console.log(error);
      //             //loading.dismiss().catch(() => { });
      //             this.commonService.onMessageHandler("Failed. Please try again.", 0);
      //           });
      //       //this.gpInformation.GPBirthday = moment().format("DD-MMM-YYYY");
      //     })
      //     .catch(err => {
      //       console.error(err)
      //     });
    }
  }
  //Login through Social site
  onSocialLogin(value, email) {
    this._dataContext.onSocialLogin(value, email)
      .subscribe(response => {
        this.onSetAuthToken(response);
        this.commonService.onLoginSuccess();
        this.loggedInUser.loginStatus = true;
        //This is used for storing user looged In type.
        //Via social or manual logged-In
        /// 1 = Logged-In Via Social site
        /// 0 = Normal log-In
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getConsumerLoggedInType"), 1);
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), this.loggedInUser);
        this.navCtrl.setRoot("DashBoard");
        this.updateUserDeviceToken();
      },
        error => {
          console.log(error);
          this.commonService.onEventSuccessOrFailure("Facebook login failed");
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }

  //Validate Only number
  onlyNumber(event) {
    let status = this.commonService.validateOnlyNumbeAndText(event, this.userEmailOrMobile);
    if (status) {
      this.isNumberTyped = true;
    }
    else {
      this.isNumberTyped = false;
    }
  }
  updateUserDeviceToken() {
    let deviceType = "";
    let deviceToken = "";
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserDeviceToken")).then(data => {
      if (data) {
        if (this.platform.is('ios')) {
          deviceType = "iOS";
        } else if (this.platform.is('android')) {
          deviceType = "android";
        }
        else{
          deviceType = "tablet";
        }
        deviceToken = data;
        this._dataContext.UpdateUserDeviceTokenId(deviceType, deviceToken)
          .subscribe(response => {
          },
            error => {
              console.log(error);
              this.commonService.onMessageHandler("Failed to update device token. Please try again.", 0);
            });
      }
    });
  }
  //Reset Password
  resetPassword() {
    this.navCtrl.push("AskContactForOTP");
  }
  //Skip to dashboard 
  onSkipToDashboard() {
    this.navCtrl.push("DashBoard");
  }

  // getPasswordOrOTP() {
  //  this.validateEmailAndMobile();
  // }
  //Validate Email and Mobile number
  validateEmailAndMobile() {
    let loginDetails = { CountryCode: this.countryCode, UserLogin: this.login.UserLogin, Contact: this.userEmailOrMobile }
    return this._dataContext.GetValidateEmailAndMobileBeforeLogin(loginDetails)
      .subscribe(response => {
        if (response.Status) {
          // let addModal = this.modalCtrl.create("LoginWithOTP", { isLoggedInWithContact: this.isNumberTyped, loginId: this.login });
          // addModal.onDidDismiss((item, status) => {
          //   if (item && status == "login") {
          //     this.login = item;
          //     if (this.isNumberTyped)
          //       this.login.UserLogin = "";
          //     else {
          //       this.login.CountryCode = "";
          //       this.login.Contact = "";
          //     }
          //     this.userLogin();
          //   }
          //   else if (item && status == "resetPassword") {
          //     this.resetPassword();
          //   }
          //   else {

          //   }
          // })
          // addModal.present();
          this.navCtrl.push("LoginWithPassword", { isLoggedInWithContact: this.isNumberTyped, loginId: this.login });
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0);
          return false;
        }
      },
        error => {
          this.commonService.onMessageHandler("Something went wrong. Please try again.", 0);
          return false;
        });
  }

}
