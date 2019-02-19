import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, IonicPage, Platform, ViewController, NavParams, App } from 'ionic-angular';
import moment from 'moment';
//Pages
import { CommonServices } from "../../../providers/common.service";
import { DataContext } from "../../../providers/dataContext.service";
import { UserLogin, UserRegister, FBInformation, GPInformation } from "../../../interfaces/user-options";

@IonicPage()
@Component({
  selector: 'page-user',
  templateUrl: 'loginwithpassword.html',
  providers: []
})
export class LoginWithPassword {
  submitted = false;
  isNumberTyped: boolean = false;
  password: string;
  isLoggedInWithContact: boolean = false;
  login: UserLogin = { UserLogin: '', Password: '', rememberMe: false, Contact: "", CountryCode: "", GroupEntityId: 0, ParentGroupEntityId: 0 };
  loggedInUser = { loginStatus: false, userName: "", contact: "", email: "", userDetails: [] }

  constructor(public appCtrl: App, public navParams: NavParams, private viewCtrl: ViewController, public platform: Platform, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {
    this.login = this.navParams.get('loginId');
    this.isLoggedInWithContact = this.navParams.get('isLoggedInWithContact');
  }


  //Initial entry point
  ionViewDidEnter() {
    this.commonService.onEntryPageEvent("Login with password page.");
  }
  onLogin(form: NgForm) {
    if (this.commonService.isValidateForm(form)) {
      // this.viewCtrl.dismiss(this.login, "login");
      if (this.isLoggedInWithContact)
        this.login.UserLogin = "";
      else {
        this.login.CountryCode = "";
        this.login.Contact = "";
      }
      this.userLogin();
    }
  }
  
  //Reset Password
  resetPassword() {
    this.navCtrl.push("AskContactForOTP");
  }
  closeModal() {
    this.navCtrl.pop();
  }
  onChnage() {
    this.navCtrl.pop();
  }
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
  redirectToOTPLogin(){
    this.navCtrl.push("LoginWithOTP", { isLoggedInWithContact: this.isLoggedInWithContact, loginId: this.login });  
  }
}
