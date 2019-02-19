import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, IonicPage, NavParams } from 'ionic-angular';
import moment from 'moment';
//Pages
import { CommonServices } from "../../../providers/common.service";
import { DataContext } from "../../../providers/dataContext.service";
import { ResetUserPassword, ConsumerNotification } from "../../../interfaces/user-options";
import { LocalNotifications } from '@ionic-native/local-notifications';

@IonicPage()
@Component({
  selector: 'page-user',
  templateUrl: 'resetpassword.html',
  providers: [LocalNotifications]
})
export class ResetPassword {
  emailId: string;
  isContactSelected: boolean = true;
  resetPassword: ResetUserPassword = { GroupEntityId: 0, ParentGroupEntityId: 0, Contact: "",Email:"", NewPassword: "" };
  notificationDetails: ConsumerNotification = { ConsumerID: 0, Contact: "", Email:"",GroupEntityId: 0, ModuleId: 0, Message: "" }

  constructor(public localNotifications: LocalNotifications, public navParams: NavParams, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {
    this.resetPassword.Contact = this.navParams.get('contactNumber');
    this.isContactSelected = this.navParams.get('isContactSelected');
    this.emailId = this.navParams.get('emailId');
  }

  //Initial entry point
  ionViewDidEnter() {
   
  }

  //Reset password
  onResetPassword(form: NgForm) {
    if (this.commonService.isValidateForm(form)) 
    {
      this.resetPassword.Email = this.emailId;
      this._dataContext.ResetPassword(this.resetPassword)
        .subscribe((response) => {
          if (response.Status) {
            this.sendNotification();
            this.commonService.onMessageHandler(response.Message, 1);
            this.navCtrl.setRoot("LoginPage");
          }
          else {
            this.commonService.onMessageHandler(response.Message, 0);
          }
        },
          error => {
            console.log(error);
            //loading.dismiss().catch(() => { });
            //this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
          });
    }
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
    let passwordResetNotification = result.filter(item => {
      if (item.ModuleName == "Reset Password") {
        return item;
      }
    })
    if (passwordResetNotification.length > 0) {
      this.localNotifications.schedule({
        id: new Date().getMilliseconds(),
        title: passwordResetNotification[0].Subject,
        text: passwordResetNotification[0].MessageBody,
        trigger: { at: new Date(new Date().getTime() + 100) },
        vibrate: true,
        //sound: "file://notification.mp3",
        icon: "file://logo.png",
        //every: "0"
      });
      this.notificationDetails.ModuleId = passwordResetNotification[0].ModuleId;
      this.notificationDetails.Message = passwordResetNotification[0].MessageBody;
    }
    else {
      this.localNotifications.schedule({
        id: new Date().getMilliseconds(),
        title: 'Successful Password Reset!',
        text: "You have successfully reset your password.!",
        trigger: { at: new Date(new Date().getTime() + 100) },
        vibrate: true,
        //sound: "file://notification.mp3",
        icon: "file://logo.png",
        //every: "0"
      });
      this.notificationDetails.Message = "You have successfully reset your password";
    }
    this.notificationDetails.Contact = this.resetPassword.Contact;
    this.notificationDetails.Email = this.resetPassword.Email;
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
  //Redirect to Sign up
  onSignup() {
    this.navCtrl.setRoot("SignupPage");
  }
  closeCurrentPage() {
    this.commonService.closeCurrentPage();
  }

}
