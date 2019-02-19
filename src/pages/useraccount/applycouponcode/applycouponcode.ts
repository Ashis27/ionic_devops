import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
import { DataContext } from '../../../providers/dataContext.service';
import { NgForm } from '@angular/forms';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { ConsumerNotification } from '../../../interfaces/user-options';

@IonicPage()
@Component({
  selector: 'page-applycouponcode',
  templateUrl: 'applycouponcode.html',
  providers: [InAppBrowser, LocalNotifications]
})
export class ApplyCouponCode {
  couponCodeDetails: any = {
    Code: "",
    GroupEntityID: 0,
    MobileNumber: "",
    Name: "",
    Email: "",
    PaymentType: ""
  };
  userDetails: any = {};
  notificationDetails: ConsumerNotification = { ConsumerID: 0, Contact: "", Email: "", GroupEntityId: 0, ModuleId: 0, Message: "" }

  constructor(public localNotifications: LocalNotifications, private iab: InAppBrowser, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController) { }
  ionViewDidEnter() {
    this.getUserInfo();
  }
  //Get Logged-In User details from Cache
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userDetails = result.ProfilePicUrl;
          this.getUserProfile(0);
        }
        else {
        this.getUserProfile(1);
        //this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserInfo"))
        }
      });
  }
  //Get LoggedIn user details
  getUserProfile(value) {
    this._dataContext.GetLoggedOnUserProfile(value)
      .subscribe(response => {
        if (response.Result == "OK") {
          this.userDetails = response.data;
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }

  //Validate only number
  onlyNumber(event) {
    return this.commonService.validateOnlyNumber(event);
  }
  //Verify coupon code
  onVerifyCouponCode(form: NgForm) {
    this.couponCodeDetails.GroupEntityID = this.commonService.getGroupEntityId();
    this.couponCodeDetails.Name = this.userDetails.FirstName;
    this.couponCodeDetails.Email = this.userDetails.UserLogin;
    this.couponCodeDetails.MobileNumber = this.userDetails.CountryCode + this.userDetails.Contact;
    if (this.commonService.isValidateForm(form)) {
      this._dataContext.GetVarifyCouponCode(this.couponCodeDetails)
        .subscribe((response) => {
          if (response.Status) {
            this.commonService.onMessageHandler(response.Message, 1);
            this.navCtrl.pop();
            this.navCtrl.push("HealthRecordList");
            this.sendPremiumActivatedNotification();
          }
          else {
            this.commonService.onMessageHandler(response.Message, 0);
          }
        },
          error => {
            this.commonService.onMessageHandler("Failed. Please try again.", 0);
          });
    }
  }
  //Sending payment successful notification
  sendPremiumActivatedNotification() {
    this.localNotifications.schedule({
      id: new Date().getMilliseconds(),
      title: "Activation Successful",
      text: "Congratulation, Your are now a HealthPro premium member. Your account has been granted access to premium features.",
      trigger: { at: new Date(new Date().getTime() + 100) },
      vibrate: true,
      //sound: "file://notification.mp3",
      icon: "file://logo.png",
      //every: "0"
    });
    this.notificationDetails.ModuleId = 0; // Payment transaction module has not been configured in standardcodevalues.
    this.notificationDetails.Message = "Congratulation, Your are now a HealthPro premium member. Your account has been granted access to premium features.";
    this.saveNotification(this.notificationDetails);
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
  //Pay to active premium fetaures
  payToActivatePremiumFeatures() {
    this.couponCodeDetails.GroupEntityID = this.commonService.getGroupEntityId();
    this.couponCodeDetails.Name = this.userDetails.FirstName;
    this.couponCodeDetails.Email = this.userDetails.UserLogin;
    this.couponCodeDetails.MobileNumber = this.userDetails.CountryCode + this.userDetails.Contact;
    this.couponCodeDetails.PaymentType = "Paytm";
    this._dataContext.StorePremiumSubscriptionDetailsBeforePG(this.couponCodeDetails)
      .subscribe((response) => {
        if (response.Status) {
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
          let refId = response.Result;
          const browser = this.iab.create(this.commonService.getPaymentApiURL() + "Payment/PaytmPamentGateway?interimOrderDeatilsId=" + response.Result,'_blank',options);
          browser.show();
          browser.on('loadstop').subscribe(event => {
            if (event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentSuccessResponse") {
              browser.close();
              this.navCtrl.pop();
              this.navCtrl.push("HealthRecordList");
              this.sendPremiumActivatedNotification();
            }
            else if (event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentFailureResponse") {
              browser.close();
              this.navCtrl.push("AppointmentFailureAfterPG", { referenceId: refId });
            }
            else if (event.url == this.commonService.getPaymentApiURL() + "Payment/PaymentPendingResponse") {
              browser.close();
            }
            // else {
            //   this.commonService.onMessageHandler("Failed. Please contact support!", 0);
            //   browser.close();
            // }
          });
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0);
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });

  }
}
