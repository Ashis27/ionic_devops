import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, IonicPage, ModalController } from 'ionic-angular';
import moment from 'moment';
//Pages
import { CommonServices } from "../../../providers/common.service";
import { DataContext } from "../../../providers/dataContext.service";

@IonicPage()
@Component({
  selector: 'page-userprofile',
  templateUrl: 'userprofile.html',
})
export class UserProfile {
  uploaded_image = { "FileName": "", "File": "", GroupEntityId: "" }
  //countryCode: string;
  countryCodeForEmer: string;
  tapOption = [];
  isNumberTyped: boolean = false;
  userPassword: string;
  userProfile: any = [];
  optionObj: number = 0;
  tabValue: string;
  maxDate: string;
  userContactInfo: any = {};
  bloodGroupList: any = [];
  maritalList: any = [];
  genderList: any = [];
  key: string;
  oldPassword: string;
  newPassword: string;
  showSelectedDate: any;
  loggedInUser: any = { loginStatus: false, userName: "", contact: "", email: "", userDetails: [] };
  emailStatus: boolean = false;
  contactUpdate: boolean = false;
  emergencyContactUpdate: boolean = false;
  counterFilterForMail: number = 0;
  activeCountry: any = [];
  activeState: any = [];
  constructor(private modalCtrl: ModalController, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {
    this.tapOption[0] = "Update Profile";
    this.tapOption[1] = "Update Password";
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
      .then((result) => {
        if (result.loginStatus) {
          this.getActiveCountryAndStateFromCache();
          this.getUserProfile();
          this.getMaritalStatusFromCache();
          this.getBloodGroupFromCache();
          this.getGenderFromCache();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }

  //Initial entry point
  ionViewDidEnter() {
    this.tabValue = "profile-" + this.optionObj;
    // this.showSelectedDate = moment().subtract(18, 'years').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    // this.maxDate = moment().subtract(18, 'years').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    this.showSelectedDate = moment().subtract(18, 'years').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    this.maxDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    this.commonService.onEntryPageEvent("Edit user profile");
    // this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation")).then(data => {
    //   this.userProfile.ConsumerCity = data.activeCity;
    //   this.userProfile.ConsumerLocality = data.activeLocation;
    // })
  }
  //Get Profile Pic from cache
  getLoggedInUserProfilePicFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getProficPic"))
      .then((result) => {
        if (result) {
          this.uploaded_image.File = result;
        }
      });
  }
  //Retrieving User Profile getUserProfileDetails
  getUserProfile() {
    this._dataContext.GetLoggedOnUserProfile(0)
      .subscribe(response => {
        if (response.Result == "OK") {
          this.userProfile = response.data;
          this.loggedInUser = { loginStatus: true, userName: response.data.FirstName, email: response.data.UserLogin, contact: response.data.CountryCode + response.data.Contact, userDetails: [] };
          //this.userProfileInfo(response.data);
          if (this.userProfile.DateOfBirth != "Not Updated") {
            this.userProfile.DateOfBirth = moment(this.userProfile.DateOfBirth).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
          }
          else {
            this.userProfile.DateOfBirth = moment().subtract(18, 'years').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
          }
          // this.countryCode=this.userProfile.CountryCode;
          //   this.countryCode = this.userProfile.Contact != null ? this.commonService.splitCountryCode(this.userProfile.Contact) : this.countryCode;
          this.countryCodeForEmer = this.userProfile.EmegencyContact != null ? this.commonService.splitCountryCode(this.userProfile.EmegencyContact) : this.countryCodeForEmer;
          this.userProfile.EmegencyContact = this.userProfile.EmegencyContact != null ? this.commonService.splitMobileNumber(this.userProfile.EmegencyContact) : this.userProfile.EmegencyContact;
          // this.userProfile.Contact = this.userProfile.Contact != null ? this.commonService.splitMobileNumber(this.userProfile.Contact) : this.userProfile.Contact;
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), this.loggedInUser);
          // this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation")).then(data => {
          //   this.userProfile.ConsumerCity = data.activeCity;
          //   this.userProfile.ConsumerLocality = data.activeLocation;
          // })
        }
        else {
          this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
            .then((result) => {
              if (result) {
                this.loggedInUser = result;
              }
              this.loggedInUser.loginStatus = false;
              this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), this.loggedInUser);
              this.navCtrl.setRoot("LoginPage");
            });
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }
  //Store User Profile Updated Profile details
  updateUserProfile(form: NgForm) {
    if (this.commonService.isValidateForm(form)) {
      this.userProfile.DateOfBirth = moment(this.userProfile.DateOfBirth).format('DD-MMM-YYYY');
      this._dataContext.UpdateUserProfile(this.userProfile)
        .subscribe(response => {
          this.getUserProfile();
          this.commonService.onMessageHandler(response.Message, 1);
        },
          error => {
            console.log(error);
            //loading.dismiss().catch(() => { });
            this.commonService.onMessageHandler("Failed. Please try again.", 0);
          });
    }
  }
  onSelectedDate() {
    this.userProfile.DateOfBirth = moment(this.userProfile.DateOfBirth).format('DD-MMM-YYYY');
  }
  //Get Marital Status from cache, if not available then get from server.
  getMaritalStatusFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getMaritalStatus"))
      .then((result) => {
        if (result) {
          this.maritalList = result;
          // this.userProfile.MaritalStatus = this.maritalList[this.maritalList.length - 1].Value;
          this.getMaritalStatus(0);
        }
        else {
          this.getMaritalStatus(1);
        }
      });
  }
  //Retrieve Marital Status countryCodeList
  getMaritalStatus(value) {
    this._dataContext.GetMeritalStatus(value)
      .subscribe(response => {
        this.maritalList = response;
        // this.userProfile.MaritalStatus = this.maritalList[this.maritalList.length - 1].Value;
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getMaritalStatus"), response);
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
  //Get Gender List from cache, if not available then get from server.
  getGenderFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getGender"))
      .then((result) => {
        if (result) {
          this.genderList = result;
          //this.userProfile.Sex = this.genderList[0].Value;
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
        //this.userProfile.Sex = this.genderList[1].Value;
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getGender"), this.genderList);
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
  //Get Blood group from cache, if not available then get from server.
  getBloodGroupFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getBloodGroup"))
      .then((result) => {
        if (result) {
          this.bloodGroupList = result;
          // this.userProfile.BloodGroup = this.bloodGroupList[0].Value;
          this.getBloodGroupList(0);
        }
        else {
          this.getBloodGroupList(1);
        }
      });
  }
  //Get Blood group List
  getBloodGroupList(value) {
    this._dataContext.GetBloodGroup(value)
      .subscribe(response => {
        this.bloodGroupList = response;
        // this.userProfile.BloodGroup = this.bloodGroupList[0].Value;
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }

  //While Tab change
  tabSelection(event, value) {
    if (value == 'Update Profile') {
      this.optionObj = 0;
      this.tabValue = "profile-" + this.optionObj;
      this.getUserProfile();
    }
    else {
      this.optionObj = 1;
      this.oldPassword = "";
      this.newPassword = "";
      this.tabValue = "profile-" + this.optionObj;
    }
  }
  editSection(value) {
    if (value == 'email') {
      this.emailStatus = true;
    }
    else if (value == 'contact') {
      this.contactUpdate = true;
    }
    else {
      this.emergencyContactUpdate = true;
    }
  }
  //Change Country countryCode
  selectedCountryCode(value) {
    console.log(value);
    this.isNumberTyped = true;
  }

  // this._dataContext.UpdateUserContactInfo(this.userContactInfo)
  // .subscribe(response => {
  //   if (response.Success) {
  //     this.userContactInfo = {};
  //     this.optionObj = 0;
  //     this.commonService.onMessageHandler(response.Message, 0);
  //   }
  //   else {
  //     this.commonService.onMessageHandler(response.Message, 0);
  //   }
  //   // this.navCtrl.setRoot("DashBoard");
  // },
  // error => {
  //   console.log(error);
  //   //loading.dismiss().catch(() => { });
  //   this.commonService.onMessageHandler("Failed to Update.", 0);
  // });

  //Password Update
  updateUserPassword(form: NgForm) {
    this.userContactInfo = {};
    this.userContactInfo.Password = this.oldPassword
    this.userContactInfo.NewPassword = this.newPassword;
    if (this.commonService.isValidateForm(form)) {
      this.UpdateUserIdEmailContact();
    }
  }
  //Email Update
  updateUserEmail() {
    this.userContactInfo = {}
    this.userContactInfo.UserLogin = this.userProfile.UserLogin;
    if (this.commonService.validateEmail(this.userContactInfo.UserLogin)) {
      this.UpdateUserIdEmailContact();
    }
    else {
      this.commonService.onMessageHandler("Please enter a valid email id.", 0);
    }
  }

  //Update Contact,Emergency, Email or Password

  UpdateUserIdEmailContact() {
    this._dataContext.UpdateUserContactInfo(this.userContactInfo)
      .subscribe(response => {
        if (response.Result == "OK") {
          this.userContactInfo = {};
          this.optionObj = 0;
          this.tabValue = "profile-" + this.optionObj;
          this.emailStatus = false;
          this.contactUpdate = false;
          this.emergencyContactUpdate = false;
          this.getUserProfile();
          this.commonService.onMessageHandler(response.Message, 1);
          this.commonService.onEventSuccessOrFailure("'Profile update successfully");
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0);
        }
        // this.navCtrl.setRoot("DashBoard");
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Update.", 0);
          this.commonService.onEventSuccessOrFailure("'Profile updateation failed");
        });

  }
  updateUserContact() {
    this.userContactInfo = {}
    this.userContactInfo.Contact = this.userProfile.Contact;
    this.userContactInfo.CountryCode = this.userProfile.CountryCode;
    if (this.commonService.validatePhone(this.userProfile.Contact)) {
      this._dataContext.CheckContactExistOrNot(this.userProfile.CountryCode + this.userProfile.Contact)
        .subscribe(response => {
          if (response.Status) {
            this.onGetOTP();
          }
          else {
            this.commonService.onMessageHandler(response.Message, 0);
          }
        },
          error => {
            console.log(error);
            this.commonService.onMessageHandler("Failed to Update.", 0);
          });
    }
    else {
      this.commonService.onMessageHandler("Please enter a valid mobile number.", 0);
    }
  }
  updateUserEmergencyContact() {
    this.userContactInfo = {}
    this.userContactInfo.EmegencyContact = this.countryCodeForEmer + this.userProfile.EmegencyContact;
    if (this.commonService.validatePhone(this.userProfile.EmegencyContact)) {
      this.UpdateUserIdEmailContact();
    }
    else {
      this.commonService.onMessageHandler("Please enter a valid mobile number.", 0);
    }

  }
  // //Validate Only number
  // onlyNumber(event) {
  //   let status = this.commonService.validateOnlyNumber(event);
  //   if (status) {
  //     this.isNumberTyped = true;
  //   }
  //   else {
  //     this.isNumberTyped = false;
  //   }
  // }
  //validate only number
  onlyNumber(event) {
    return this.commonService.validateOnlyNumber(event);
  }
  //Generate otp 
  onGetOTP() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getConsumerLoggedInType"))
      .then((result) => {
        if (result == 1) {
          this.generateOTP(1);
        }
        else {
          this.generateTempOTP();
        }
      });
  }
  generateOTP(value) {
    let contact = this.userProfile.CountryCode + this.userProfile.Contact;
    this._dataContext.GetOTP(contact, value)
      .subscribe(respons => {
        if (respons.Status) {
          // this.commonService.onMessageHandler(respons.Message, 0);
          this.commonService.onMessageHandler(respons.Message, 1);
          let addModal = this.modalCtrl.create("OTPVerification", { contactNumber: contact, redirectPage: "", isContactSelected: true });
          addModal.onDidDismiss(item => {
            if (item) {
              this.UpdateUserIdEmailContact();
            }
          })
          addModal.present();
          // this.navCtrl.push("OTPVerification", { contactNumber: contact, redirectPage: "UserProfile" });
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
  generateTempOTP() {
    let contact = this.userProfile.CountryCode + this.userProfile.Contact;
    this._dataContext.GenerateTempOTPForMobile(contact)
      .subscribe(respons => {
        if (respons.Status) {
          // this.commonService.onMessageHandler(respons.Message, 0);
          this.commonService.onMessageHandler(respons.Message, 1);
          let addModal = this.modalCtrl.create("OTPVerification", { contactNumber: contact, redirectPage: "signUp", isContactSelected: true });
          addModal.onDidDismiss(item => {
            if (item) {
              this.UpdateUserIdEmailContact();
            }
          })
          addModal.present();
          // this.navCtrl.push("OTPVerification", { contactNumber: contact, redirectPage: "UserProfile" });
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
          this.userProfile.CountryCode = result.countriesAvailable[0].DemographyCode;
          this.countryCodeForEmer = result.countriesAvailable[0].DemographyCode;
          this.activeCountry = result.countriesAvailable;
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
          this.userProfile.CountryCode = response.Data.countriesAvailable[0].DemographyCode;
          this.countryCodeForEmer = response.Data.countriesAvailable[0].DemographyCode;
          this.activeCountry = response.Data.countriesAvailable;
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
  redirectToMenu(value, event) {
    // $(".footer-image-sec").removeClass("active-section").addClass("footer-back");
    // $(event.currentTarget).removeClass("footer-back").addClass("active-section");
    if (value == "DashBoard") {
      this.navCtrl.setRoot("DashBoard");
    }
  }
  //Get current location
  getCurrentLocation() {
    let addModal = this.modalCtrl.create("CityLocation");
    addModal.onDidDismiss(item => {
      if (item) {
        if (item.activeCity != "" || item.activeLocation != "") {
          this.userProfile.ConsumerCity = item.activeCity;
          this.userProfile.ConsumerLocality = item.activeLocation;
        }
      }
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: item.activeCity, activeLocation: item.activeLocation });
    })
    addModal.present();
  }
}
