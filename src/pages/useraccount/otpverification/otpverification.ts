import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, IonicPage, NavParams, ViewController, Platform, App } from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';

//Pages
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";
declare var SMS: any;
@IonicPage()
@Component({
  selector: 'page-otpverification',
  templateUrl: 'otpverification.html'
})

export class OTPVerification {
  contact: string;
  otpCode: number;
  signUpDetails: any = [];
  contactNumber: string;
  redirectPage: string;
  countryCode: string;
  active_country_state: string;
  emailId: string;
  messages: any;
  isContactSelected: boolean = true;
  smsWatchCount: number = 0;
  constructor(public appCtrl: App, public platform: Platform, public androidPermissions: AndroidPermissions, private viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
    this.contact = this.navParams.get('contactNumber');
    this.redirectPage = this.navParams.get('redirectPage');
    this.emailId = this.navParams.get('emailId');
    this.isContactSelected = this.navParams.get('isContactSelected');
    if (this.isContactSelected) {
      this.countryCode = this.commonService.splitCountryCode(this.contact);
      this.contactNumber = this.commonService.splitMobileNumber(this.contact);
    }
  }

  ionViewDidEnter() {
    this.checkPermission();
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
        if (res.data && (res.data.address == "IGKAREFU" || res.data.address == "BAKAREFU" || res.data.address == "MDKAREFU" || res.data.address == "MDSMSCou" ||res.data.address == "BA-SMSCou"|| res.data.address == "HPSMSCou" || res.data.service_center == "+911725199998" || smsContent == "Your one time verification code is") && this.navCtrl.getActive().name != "LoginWithOTP") {
          if (this.smsWatchCount == 0) {
            //this.stopSMSWatch();
            if (SMS) SMS.stopWatch(() => {
              console.log('watching stopped');
            }, Error => {
              console.log('failed to stop watching');
            });
            this.otpCode = (res.data.body.replace(/\s+/g, '')).substring(res.data.body.replace(/\s+/g, '').indexOf(":") + 1, res.data.body.length);
            this.verifyOTPAfterValidation(false);
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
  //Otp Verification
  onVerifyOTP(form: NgForm) {
    if (this.commonService.isValidateForm(form)) {
      this.verifyOTPAfterValidation(true);
    }
  }
  verifyOTPAfterValidation(status) {
    if (this.redirectPage == "signUp") {
      this._dataContext.GetVarifyTempOTPForMobile(this.contact, this.otpCode)
        .subscribe((response) => {
          if (response.Status) {
            this.viewCtrl.dismiss(response);
          }
          else {
            //if user manually entry the OTP code then it will show the error message
            if (status)
              this.commonService.onMessageHandler("Invalid OTP. Please try again", 0);
          }
        },
          error => {
            //this.commonService.onMessageHandler("Failed. Please try again.", 0);
          });
    }
    else {
      this.verifyOTPByContactNumberOrEmailId();
    }
  }
  //Otp Verification using User's contact number or email Id
  verifyOTPByContactNumberOrEmailId() {
    this._dataContext.GetOTPVerify(this.contact, this.emailId, this.otpCode, this.isContactSelected)
      .subscribe((response) => {
        if (response.Status) {
          this.viewCtrl.dismiss(response);
        }
        else {
          this.commonService.onMessageHandler("Invalid OTP. Please try again", 0);
        }
      },
        error => {
          // this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
  //Redirect to Sign up
  onSignup() {
    this.navCtrl.setRoot("SignupPage");
  }
  //Validate only number
  onlyNumber(event) {
    return this.commonService.validateOnlyNumber(event);
  }
  //Resend otp
  resendOTP() {
    if (this.redirectPage == "signUp") {
      this._dataContext.ResendTempOTP(this.contact)
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
            //loading.dismiss().catch(() => { });
            this.commonService.onMessageHandler("Failed to send OTP. Please try again.", 0);
          });

    }
    else {
      this._dataContext.ResendOTP(this.contact, this.emailId, this.isContactSelected)
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

  closeCurrentPage() {
    this.viewCtrl.dismiss(false);
  }

}

