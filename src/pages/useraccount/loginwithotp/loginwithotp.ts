import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, IonicPage, Platform, ViewController, NavParams, App } from 'ionic-angular';
import moment from 'moment';
//Pages
import { CommonServices } from "../../../providers/common.service";
import { DataContext } from "../../../providers/dataContext.service";
import { UserLogin, UserRegister, FBInformation, GPInformation } from "../../../interfaces/user-options";
import { AndroidPermissions } from '@ionic-native/android-permissions';
declare var SMS: any;

@IonicPage()
@Component({
  selector: 'page-user',
  templateUrl: 'loginwithotp.html',
  providers: []
})
export class LoginWithOTP {
  submitted = false;
  isNumberTyped: boolean = false;
  password: string;
  smsWatchCount: number = 0;
  messages: any;
  isLoggedInWithContact: boolean = false;
  login: UserLogin = { UserLogin: '', Password: '', rememberMe: false, Contact: "", CountryCode: "", GroupEntityId: 0, ParentGroupEntityId: 0 };
  loggedInUser = { loginStatus: false, userName: "", contact: "", email: "", userDetails: [] }
  otpCode: number;
  constructor(public androidPermissions: AndroidPermissions, public appCtrl: App, public navParams: NavParams, private viewCtrl: ViewController, public platform: Platform, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {
    this.login = this.navParams.get('loginId');
    this.isLoggedInWithContact = this.navParams.get('isLoggedInWithContact');
    if (this.isLoggedInWithContact)
      this.login.UserLogin = "";
    else {
      this.login.CountryCode = "";
      this.login.Contact = "";
    }
  }

  //Initial entry point
  ionViewDidEnter() {
    this.commonService.onEntryPageEvent("Login with OTP page.");
    this.checkPermission();
    //Generate OTP based on consumer contact number or email id
    this.onGetOTP();
  }
  checkPermission() {
    this.androidPermissions.checkPermission
      (this.androidPermissions.PERMISSION.READ_SMS).then(
        success => {
          //if permission granted
          this.readSMS();
        },
        err => {
          this.androidPermissions.requestPermission
            (this.androidPermissions.PERMISSION.READ_SMS).
            then(success => {
              this.readSMS();
            },
              err => {
                console.log(JSON.stringify(err));
                // alert("cancelled")
              });
        });

    this.androidPermissions.requestPermissions
      ([this.androidPermissions.PERMISSION.READ_SMS]);
  }
  readSMS() {
    this.platform.ready().then((readySource) => {

      if (SMS) SMS.startWatch(() => {
        console.log('watching started');
      }, Error => {
        console.log('failed to start watching');
      });
      document.addEventListener('onSMSArrive', (res: any) => {
        //matching with sms sent by HealthPro
        let smsContent = res.data.body.substring(0, res.data.body.indexOf(":"));
        if (res.data && (res.data.address == "IGKAREFU" || res.data.address == "BAKAREFU" || res.data.address == "MDKAREFU" || res.data.address == "MDSMSCou" ||res.data.address == "BA-SMSCou"|| res.data.address == "HPSMSCou" || res.data.service_center == "+911725199998" || smsContent == "Your one time verification code is") && (this.navCtrl.getActive().name == "LoginWithOTP" || this.navCtrl.getActive().id == "LoginWithOTP")) {
          if (this.smsWatchCount == 0) {
            //this.stopSMSWatch();
            if (SMS) SMS.stopWatch(() => {
              console.log('watching stopped');
            }, Error => {
              console.log('failed to stop watching');
            });
            this.otpCode = (res.data.body.replace(/\s+/g, '')).substring(res.data.body.replace(/\s+/g, '').indexOf(":") + 1, res.data.body.length);
            this.onVerifyOTP();
            this.smsWatchCount++;
          }
        }
      });
    });
  }
  //this is used for stop watching SMS, once read
  stopSMSWatch() {
    if (SMS) SMS.stopWatch(() => {
      console.log('watching stopped');
    }, Error => {
      console.log('failed to stop watching');
    });
  }
  //Get OTP
  onGetOTP() {
    if (this.isLoggedInWithContact)
      this.getOTPByContactNumber();
    else
      this.getOTPByEmailId();
  }
  //Generate OTP using user's contact number
  getOTPByContactNumber() {
    this._dataContext.GetOTP(this.login.Contact, 0)
      .subscribe(respons => {
        if (respons.Status) {
          this.commonService.onMessageHandler(respons.Message, 1);
        }
        else {
          this.commonService.onMessageHandler(respons.Message, 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to send OTP. Please try again.", 0);
        });
  }
  //Generate OTP using user's Email Id
  getOTPByEmailId() {
    this._dataContext.GenerateOTPForEmail(this.login.UserLogin)
      .subscribe(respons => {
        if (respons.Status) {
          this.commonService.onMessageHandler(respons.Message, 1);
        }
        else {
          this.commonService.onMessageHandler(respons.Message, 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to send OTP. Please try again.", 0);
        });
  }
  onLoginWithOTP(form: NgForm) {
    if (this.commonService.isValidateForm(form)) {
      // this.viewCtrl.dismiss(this.login, "login");
      this.onVerifyOTP();
    }
  }
  userLogin() {
    this._dataContext.UserLoginWithOTP(this.login)
      .subscribe(response => {
        // this.commonService.onMessageHandler("Successfully logged in with OTP.", 1);
        this.commonService.onLoginSuccess();
        this.onSetAuthToken(response);
        this.getLoggedInUserDetailsFromCache();
      },
        error => {
          this.commonService.onEventSuccessOrFailure("Failed to login with OTP");
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Something went wrong. Please try again", 0);
        });
  }
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
  onSetAuthToken(response) {
    localStorage.setItem('user_auth_token', response.access_token);
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
  redirectToPasswordLogin() {
    this.navCtrl.pop();
  }
  //Otp Verification
  onVerifyOTP() {
    this._dataContext.GetOTPVerify(this.login.Contact, this.login.UserLogin, this.otpCode, this.isLoggedInWithContact)
      .subscribe((response) => {
        if (response.Status) {
          this.userLogin();
        }
        else {
          this.commonService.onMessageHandler("Invalid OTP. Please try again", 0);
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });

  }
  //Validate only number
  onlyNumber(event) {
    return this.commonService.validateOnlyNumber(event);
  }
  //Resend otp
  resendOTP() {
    this._dataContext.ResendOTP(this.login.Contact, this.login.UserLogin, this.isLoggedInWithContact)
      .subscribe((response) => {
        if (response.Status) {
          this.commonService.onMessageHandler("OTP has been successfully sent.", 1);
        }
        else {
          this.commonService.onMessageHandler("Failed to send OTP. Please try again.", 0);
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to send OTP. Please try again.", 0);
        });
  }
}
