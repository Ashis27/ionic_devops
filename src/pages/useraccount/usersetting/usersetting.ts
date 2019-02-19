import { Component } from '@angular/core';
import { PopoverController, IonicPage, AlertController, NavController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-usersetting',
  templateUrl: 'usersetting.html',
  providers:[InAppBrowser,Facebook ]
})
export class UserSetting {
  loggedInUser: any = { loginStatus: false, userName: "", contact: "", email: "", userDetails: [], consumerId: 0 }
 
  constructor(private iab: InAppBrowser, private fb: Facebook,public navCtrl: NavController, public alertCtrl: AlertController, public _dataContext: DataContext, private commonService: CommonServices) { }

  //Logout 
  logOut() {
    let alert = this.alertCtrl.create({
      title: "Logout",
      message: 'Do you want to Logout?',
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: () => {
            //this.viewCtrl.dismiss();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this._dataContext.UserLogOut()
              .subscribe(response => {
                if (response.Result) {
                  this.fb.logout()
                  .then( res => {})
                  .catch(e => console.log('Error logout from Facebook', e));
                  localStorage.setItem("user_auth_token", "");
                  // this.commonService.clearAllCache();
                  this.getNotificationCount();
                  this.resetAllUserCacheInformation();
                  this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
                    .then((result) => {
                      if (result) {
                        this.loggedInUser = result;
                      }
                      this.loggedInUser.loginStatus = false;
                      let url = this.commonService.getApiServiceUrl() + "/hasSeenTutorial";
                      this.commonService.setStoreDataIncache(url, true);
                      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), this.loggedInUser);
                      this.navCtrl.setRoot("LoginPage");
                      this.commonService.onEventSuccessOrFailure("Logout Clicked");
                    });
                }
              },
                error => {
                  console.log(error);
                  this.commonService.onMessageHandler("Failed. Please try again.", 0);
                });

          }
        }
      ]
    });
    alert.present();
  }

  //Redirect to Terms and Conditions page
  getTermsAndConditions() {
    const browser = this.iab.create(this.commonService.getTermsAndConditions(), '_blank');
  }

  getNotificationCount() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserNotification"))
      .then((result) => {
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserNotification"), result);
      });
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserNotificationCount"))
      .then((result) => {
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserNotificationCount"), result);
      });
  }
  
  resetAllUserCacheInformation() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), false);
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getProficPic"), false);
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getFavDoctors"), false);
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUploadedHealthRecordByUser"), false);
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUploadedHealthRecordByDoc"), false);
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserInfo"), false);
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUpcomingAppo"), false);
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPastAppo"), false);
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserMedicalStatus"), false);
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserFamily"), false);
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserAddedMedicalStatus"), false);
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getAddedReminderMedicineList"), false);

  }
  redirectTo(value){
    this.navCtrl.push(value);
  }

  
}