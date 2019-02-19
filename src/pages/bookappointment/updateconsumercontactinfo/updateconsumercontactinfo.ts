import { Component } from "@angular/core"
import { NavController, NavParams, ViewController, AlertController, LoadingController, ToastController, PopoverController, App, IonicPage, ModalController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";
import { NgForm } from "@angular/forms";
//pages

@IonicPage()
@Component({
    selector: 'page-updateconsumercontactinfo',
    templateUrl: 'updateconsumercontactinfo.html',
})
export class UpdateConsumerContactInfo {
    countryCode: string;
    contact: string;
    activeCountry: any = [];
    userProfile: any = {};
    userContactInfo: any = {};
    isContactAvailable: boolean = false;
    isEmailAvailable: boolean = false;
    constructor(private modalCtrl: ModalController, public viewCtrl: ViewController, public _dataContext: DataContext, private commonService: CommonServices, public alertCtrl: AlertController, public appCtrl: App, public navCtrl: NavController, public navParams: NavParams) {
        this.userProfile = this.navParams.get('consumerDetails');
        if (this.commonService.validatePhone(this.userProfile.Contact))
            this.isContactAvailable = true;
        else if (this.commonService.validateEmail(this.userProfile.UserLogin))
            this.isEmailAvailable = true;
        else {
            this.commonService.onMessageHandler("Session timed out. Please login", 0);
            this.navCtrl.setRoot("LoginPage");
        }
    }
    ionViewDidEnter() {
        this.getActiveCountryAndStateFromCache();
    }

    //Get active countries and states from cache, if not available then get from server.
    getActiveCountryAndStateFromCache() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveCountryAndState"))
            .then((result) => {
                if (result) {
                    if (!this.isContactAvailable)
                        this.userProfile.CountryCode = result.countriesAvailable[0].DemographyCode;
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
                    if (!this.isContactAvailable)
                        this.userProfile.CountryCode = response.Data.countriesAvailable[0].DemographyCode;
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
    //validate only number
    onlyNumber(event) {
        return this.commonService.validateOnlyNumber(event);
    }
    skip() {
        this.viewCtrl.dismiss(false);
    }
    updateConsumerContactInfo() {
        if (!this.isContactAvailable)
            this.updateUserContact();
        else if (!this.isEmailAvailable)
            this.updateUserEmail();
        else {
            this.commonService.onMessageHandler("Session timed out. Please login", 0);
            this.navCtrl.setRoot("LoginPage");
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
                    this.viewCtrl.dismiss(this.userProfile);
                }
                else {
                    this.commonService.onMessageHandler(response.Message, 0);
                }
            },
                error => {
                    console.log(error);
                    this.commonService.onMessageHandler("Failed to Update.", 0);
                    this.commonService.onEventSuccessOrFailure("'Profile updatation failed");
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
}
