import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, IonicPage, ModalController } from 'ionic-angular';
//Pages
import { CommonServices } from "../../../providers/common.service";
import { DataContext } from "../../../providers/dataContext.service";
import { UserLogin, UserRegister } from "../../../interfaces/user-options";

@IonicPage()
@Component({
  selector: 'page-user',
  templateUrl: 'askcontactforotp.html',
})
export class AskContactForOTP {
  countryCode: string;
  contactNumber: string;
  isNumberTyped: boolean = false;
  active_country_state: string;
  activeCountry: any = [];
  activeState: any = [];
  userEmailOrMobile: string;
  constructor(private modalCtrl: ModalController, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {
    this.getActiveCountryAndStateFromCache();
  }
  //Initial entry point
  ionViewDidEnter() {

  }
  //Get OTP
  onGetOTP(form: NgForm) {
    if (this.isNumberTyped) {
      this.contactNumber = this.countryCode + this.userEmailOrMobile;
    }
    if (this.isNumberTyped) {
      if (this.commonService.validatePhone(this.userEmailOrMobile)) {
        this.validateEmailAndMobile();
      }
      else {
        this.commonService.onMessageHandler("Please enter a valid mobile number", 0);
      }
    }
    else {
      if (this.commonService.validateEmail(this.userEmailOrMobile)) {
        this.validateEmailAndMobile();
      }
      else {
        this.commonService.onMessageHandler("Please enter a valid email id", 0);
      }
    }
  }
  //Validate Email and Mobile number
  validateEmailAndMobile() {
    let loginDetails = { CountryCode: this.countryCode, UserLogin: !this.isNumberTyped ? this.userEmailOrMobile : "", Contact: this.isNumberTyped ? this.userEmailOrMobile : "" }
    this._dataContext.GetValidateEmailAndMobileBeforeLogin(loginDetails)
      .subscribe(response => {
        if (response.Status) {
          if (this.isNumberTyped)
            this.getOTPByContactNumber();
          else
            this.getOTPByEmailId();
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
  //Generate OTP using user's contact number
  getOTPByContactNumber() {
    this._dataContext.GetOTP(this.contactNumber, 0)
      .subscribe(respons => {
        if (respons.Status) {
          this.commonService.onMessageHandler(respons.Message, 1);
          let addModal = this.modalCtrl.create("OTPVerification", { contactNumber: this.contactNumber, redirectPage: "", isContactSelected: true });
          addModal.onDidDismiss(item => {
            if (item) {
              this.navCtrl.push("ResetPassword", { contactNumber: this.contactNumber });
            }
          });
          addModal.present();
        }
        else {
          this.commonService.onMessageHandler(respons.Message, 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
        });
  }
  //Generate OTP using user's Email Id
  getOTPByEmailId() {
    this._dataContext.GenerateOTPForEmail(this.userEmailOrMobile)
      .subscribe(respons => {
        if (respons.Status) {
          this.commonService.onMessageHandler(respons.Message, 1);
          let addModal = this.modalCtrl.create("OTPVerification", { emailId: this.userEmailOrMobile,redirectPage: "", isContactSelected: false });
          addModal.onDidDismiss(item => {
            if (item) {
              this.navCtrl.push("ResetPassword", { emailId: this.userEmailOrMobile });
            }
          });
          addModal.present();
        }
        else {
          this.commonService.onMessageHandler(respons.Message, 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
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
  //Redirect to Sign up
  onSignup() {
    this.navCtrl.setRoot("SignupPage");
  }
  // //Validate Only number
  // onlyNumber(event) {
  //   return this.commonService.validateOnlyNumber(event);
  // }
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
  //Change Country countryCode
  selectedCountryCode(value) {
    this.countryCode = value;
  }
  closeCurrentPage() {
    this.navCtrl.setRoot("LoginPage");
  }
}
