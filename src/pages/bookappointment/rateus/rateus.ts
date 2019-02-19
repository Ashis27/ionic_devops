import { Component, NgZone  } from "@angular/core"
import { NavController, NavParams, ViewController, AlertController, LoadingController, ToastController, PopoverController, App, IonicPage, Platform } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";
import { InAppBrowser } from '@ionic-native/in-app-browser';
//pages

@IonicPage()
@Component({
    selector: 'page-rateus',
    templateUrl: 'rateus.html',
    providers: [InAppBrowser]
})
export class RateUs {
    loading: any;
    rateNumber: number = 0;
    rating: any = 10;
    userID: string;
    feedbackQuestions: any;
    feedbackAns: any;
    playstoreUrl: string;
    rateUsPopup: any;
    appVersionConfig: any = [];
    feedback_img:string="";
    feedback_msg:string="";
    rateUs = [
        { "image": "assets/img/rateUs/rate1.png", "ratingMin": "0", "ratingMax": "1", "color": "#ff1016", "message": "Extremely Unsatisfied" },
        { "image": "assets/img/rateUs/rate2.png", "ratingMin": "1", "ratingMax": "4", "color": "#ff6200", "message": "Unsatisfied" },
        { "image": "assets/img/rateUs/rate3.png", "ratingMin": "4", "ratingMax": "6", "color": "#ffef00", "message": "Good" },
        { "image": "assets/img/rateUs/rate4.png", "ratingMin": "6", "ratingMax": "8", "color": "#a4e200", "message": "Really Good" },
        { "image": "assets/img/rateUs/rate5.png", "ratingMin": "8", "ratingMax": "10", "color": "#73ab00", "message": "Excellent" }
    ];
    rateUsDetails:any={};
    // rateUsDetails = { "image": "", "ratingMin": "", "ratingMax": "", "color": "", "message": "" };
    constructor(public platform: Platform,private iab: InAppBrowser,public viewCtrl: ViewController, public _dataContext: DataContext, private commonService: CommonServices, public alertCtrl: AlertController, public appCtrl: App, public navCtrl: NavController, public navParams: NavParams,private zone: NgZone) {
        this.userID = this.navParams.get("consumerId");
        //this.userID = "405940";
        this.feedbackQuestions = this.navParams.get("feedbackQuestion");
        this.feedbackAns = this.navParams.get("feedbackAns");
        this.rateUsDetails = this.rateUs[4];
        this.feedback_img = this.rateUsDetails.image;
        this.feedback_msg = this.rateUsDetails.message;
        this.feedbackAns.filter(item => {
            if (item.QuestionType == 1) {
                item.Value = 10;
            }
            return item;
        })
        this.getAppVersionFromCache();  
    }

    getAppVersionFromCache() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getAppVersionConfig"))
            .then((result) => {
                if (result) {
                    this.appVersionConfig = result;
                }
               // else {
                    this.getCurrentAppVersion(0);
               // }
            });
    }
    //Get Current App Version
    getCurrentAppVersion(value) {
        this._dataContext.GetAppVersion(value)
            .subscribe(response => {
                this.appVersionConfig = response.Result;
                this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getAppVersionConfig"), response.Result);
            },
                error => {
                });
    }
    setRating(value) {
        this.feedbackAns[value].Value = this.rating; 
        let line_color_android = $(".range-md-secondary .range-bar-active,.range-md-secondary .range-knob,.range-md-secondary .range-pin");
        let line_color_ios = $(".range-ios-secondary .range-bar-active,.range-ios-secondary .range-knob,.range-ios-secondary .range-pin");
           
        this.rateUs.filter(item => {
            if (this.rating > item.ratingMin && this.rating <= item.ratingMax) {
                this.zone.run(() => {
                    this.rateUsDetails = item;
                    this.feedback_img = item.image;
                    this.feedback_msg = item.message;
                    line_color_android.css({ 'background': item.color });
                    line_color_ios.css({ 'background': item.color });
                });
            }
        });
        
    }
    closeModal() {
        this.viewCtrl.dismiss();
    }
    checkRateUsStatus() {
        if (this.rateUsPopup.Message != "NEVER ASK AGAIN" && this.rateUsPopup.Count == 2) {
            this.askRating();
        }
    }
    askRating() {
        const alert = this.alertCtrl.create({
            title: 'Rate this app',
            message: "If you enjoy this app, would you mind taking a moment to rate it? It won't take more than a minute. Thank you for your suppoort!",
            buttons: [
                {
                    text: 'NEVER ASK AGAIN',
                    handler: () => {
                        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("rateUs"), { 'Message': 'NEVER ASK AGAIN', 'Count': 0 });
                    }
                },
                {
                    text: 'LATER',
                    handler: () => {
                        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("rateUs"), { 'Message': 'LATER', 'Count': 0 });
                    }
                },

                {
                    text: 'RATE NOW',
                    handler: () => {
                        this.commonService.getStoreDataFromCache(this.appVersionConfig.AndroidAppUrl).then(result => {
                            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("rateUs"), { 'Message': 'NEVER ASK AGAIN', 'Count': 0 });
                            if (navigator.onLine) {
                                if (this.platform.is('ios')) {
                                    //const browser = this.iab.create(this.appVersionConfig.IosAppUrl,'_system');
                                    //browser.show();
                                    window.open(this.appVersionConfig.IosAppUrl, '_system');
                                  } else if (this.platform.is('android')) {
                                    //const browser = this.iab.create(this.appVersionConfig.AndroidAppUrl,'_system');
                                    //browser.show();
                                     window.open(this.appVersionConfig.AndroidAppUrl, '_system');
                                  } 
                            }
                            else {
                                this.commonService.onMessageHandler("You are OFFLINE. Please check your network connection!", 0);
                            }
                        }).catch(error => {

                        });
                    }
                }
            ]
        });
        alert.present();
    }
    submitFeedback() {
        this.commonService.onMessageHandler("Thank you for your valuable feedback !", 1);
        this.viewCtrl.dismiss();
        this._dataContext.SubmitConsumerFeedbackForDoctor(this.feedbackAns)
            .subscribe(response => {
                if (response.Result == "Success") {
                    this.getCacheData(this.commonService.getCacheKeyUrl("rateUs")).then(result => {
                        if (this.rating >= 6) {
                            if (result) {
                                result.Count++;
                                this.rateUsPopup = result;
                                this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("rateUs"), { 'Message': result.Message, 'Count': result.Count });
                                this.rateUsPopup = result;
                                if (result.Count == 2) {
                                    this.checkRateUsStatus();
                                }
                                else if (result.Count > 2) {
                                    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("rateUs"), { 'Message': result.Message, 'Count': 0 });
                                }
                            }
                            else {
                                this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("rateUs"), { 'Message': '', 'Count': 0 });
                            }
                        }
                    }).catch(error => {

                    })
                }
            },
                error => {
                    console.log(error);
                    //this.commonService.onMessageHandler("Failed to retrieve family details. Please try again.", 0);
                });
    }

    getCacheData(value) {
        return this.commonService.getStoreDataFromCache(value).then(result => {
            if (navigator.onLine) {
                return result;
            }
            else {
                this.commonService.onMessageHandler("You are OFFLINE. Please check your network connection!", 0);

            }
        }).catch(error => {

        });
    }
}
