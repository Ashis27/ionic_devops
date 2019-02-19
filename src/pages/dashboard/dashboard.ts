import { Component, ViewChild } from '@angular/core';
import { IonicPage, Slides, ViewController, NavController, ModalController, AlertController, Platform } from 'ionic-angular';
import { CommonServices } from "../../providers/common.service";
import { DataContext } from "../../providers/dataContext.service";
import * as $ from 'jquery';
import { InAppBrowser } from '@ionic-native/in-app-browser';
@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
  providers: [InAppBrowser]
})
export class DashBoard {
  @ViewChild('myinput') input;
  @ViewChild('slides') slides: Slides;
  cityLocation: any = [];
  dashBoardConfig: any = [];
  selectedCityAndLocation: any = [];
  showSkip = true;
  appTitle: string;
  isSkipped: boolean = false;
  userNotificationList: any = [];
  notificationCount: number = 0;
  userId: number = 0;
  showNotificationCount: number = 0;
  isPremium: boolean = false;
  isIosPlatform: boolean = false;
  searchKeyword: string;
  dashboardMenuConfig: any = [
    { Title: "Appointment", Component: "BookAppointment", Image: "assets/img/dashboard/dash_doc.svg" },
    { Title: "Diagnostic", Component: "DiagnosticGenericSearch", Image: "assets/img/dashboard/booktest_icon.svg" },
    // { Title: "Pharmacy", Component: "Pharmacy", Image: "assets/img/dashboard/orderonline_icon.svg" },
    { Title: "Refer Friend", Component: "ReferralCode", Image: "assets/img/dashboard/referearn_icon.svg" }
  ];
  constructor(private iab: InAppBrowser, public platform: Platform, public alertCtrl: AlertController, private modalCtrl: ModalController, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController) {
    this.appTitle = this.commonService.getAppTitle().toString();
    //this.getDshboardConfig();
    this.dashBoardConfig = [];
    this.dashBoardConfig = [
      { Image: "assets/img/dashboard/slider0.png" },
      { Image: "assets/img/dashboard/slider1.png" },
      { Image: "assets/img/dashboard/slider2.png" }
    ];

    // this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getDashboardSliders"))
    //   .then((result) => {
    //     if (result) {
    //       this.dashBoardConfig = result;
    //     }
    //     this.getDashboardConfig(0);
    //     // else {
    //     //   this.getDashboardConfig(0);
    //     // }
    //   });
  }
  //Entry Point
  ionViewDidEnter() {
    this.showNotificationCount = 0;
    this.getUserInfo();
    this.getAppCurrentVersion();
    this.commonService.onEntryPageEvent("Enter to dashboard");
    if (this.platform.is('ios')) {
      this.isIosPlatform = true;
    } else {
      this.isIosPlatform = false;
    }
  }
  getAppCurrentVersion() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getAppVersion"))
      .then((result) => {
        if (result) {
          this.isSkipped = true;
        }
        else {
          this.isSkipped = false;
        }
        this.getCurrentAppVersion(0);
      });
  }
  //Get Logged-In User details
  getNotificationsFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserNotification") + "/" + this.userId)
      .then((result) => {
        if (result) {
          this.userNotificationList = result;
          //this.getUserNotification(0);
        }
        this.getUserNotification(0);
      });
  }
  // getNotificationCount(data) {
  //   this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserNotificationCount") + "/" + this.userId)
  //     .then((result) => {
  //       if (result) {
  //         this.showNotificationCount = data.length - result.length;
  //       }
  //       else {
  //         this.showNotificationCount = data.length;
  //       }
  //       this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserNotification")+ "/" + this.userId, data);
  //     });
  // }
  getUserNotification(value) {
    this._dataContext.GetUserNotifications(value)
      .subscribe(response => {
        if (response.Status) {
          this.showNotificationCount = response.Count;
          this.userNotificationList = response.Data;
          this.userNotificationList = this.userNotificationList.reverse();
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserNotification") + "/" + this.userId, response.Data);
          //this.getNotificationCount(this.userNotificationList);
        }
      },
        error => {
          console.log(error);
          // this.commonService.onMessageHandler("Failed to Retrieve Notifications. Please try again.", 0);
        });
  }
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.isPremium = result.IsPremium;
        }
        this.getUserProfile(0);
      });
  }

  //Get LoggedIn user details
  getUserProfile(value) {
    this._dataContext.GetLoggedOnUserProfile(value)
      .subscribe(response => {
        if (response.Result == "OK") {
          this.userId = response.data.ConsumerID;
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserPremiumStatus"), response.data.IsPremium);
          this.getNotificationsFromCache();
          //this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getProficPic"),response.data.ProfilePicUrl)
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), { loginStatus: true, userName: response.data.FirstName, contact: response.data.CountryCode + response.data.Contact, email: response.data.UserLogin, userDetails: [], consumerId: response.data.ConsumerID });
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserInfo"), response.data);
        }
        else {
          this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
            .then((result) => {
              let loggedInUser: any = [];
              if (result) {
                loggedInUser = result;
              }
              loggedInUser.loginStatus = false;
              this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserPremiumStatus"), false);
              this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), loggedInUser);
              this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserInfo"), null);
              this.navCtrl.setRoot("LoginPage");
            });
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          // this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }

  //Get Current App Version
  getCurrentAppVersion(value) {
    this._dataContext.GetAppVersion(value)
      .subscribe(response => {
        let result = response.Result;
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getAppVersionConfig"), result);
        // if (response.Result.CurrentVersion != this.commonService.getAppVersion()) {
        //   if (response.Result.IsForceUpdate) {
        //     this.forceAlert(result);
        //   }
        //   else if (!this.isSkipped) {
        //     this.skipAlert(result);
        //   }
        // }
        if (this.platform.is('ios'))
          this.isNewUpdateAvailableForIOS(response);
        else
          this.isNewUpdateAvailableForAndroid(response);
      },
        error => {
        });
  }
  
  isNewUpdateAvailableForAndroid(response) {
    if (Number((this.commonService.getAppVersion()).replace('.', '').replace('.', '')) < Number((response.Result.CurrentAndroidVersion).replace('.', '').replace('.', ''))) {
      if (response.Result.IsForceUpdateForAndroid) {
        this.forceAlert(response.Result);
      }
      else if (!this.isSkipped) {
        this.skipAlert(response.Result);
      }
    }
  }
  isNewUpdateAvailableForIOS(response) {
    if (Number((this.commonService.getAppVersion()).replace('.', '').replace('.', '')) < Number((response.Result.CurrentIosVersion).replace('.', '').replace('.', ''))) {
      if (response.Result.IsForceUpdateForIos) {
        this.forceAlert(response.Result);
      }
      else if (!this.isSkipped) {
        this.skipAlert(response.Result);
      }
    }
  }

  //Slider Change
  onSlideChangeStart(slider: Slides) {
    this.showSkip = !slider.isEnd();
  }

  getDashboardConfig(value) {
    this._dataContext.GetSliderConfig("DashBoard", value)
      .subscribe(response => {
        let result: any = response;
        if (result.Result == "Success") {
          this.dashBoardConfig = result.Data;
          this.dashBoardConfig.reverse();
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getDashboardSliders"), this.dashBoardConfig);
        }
        else {
          //  this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          // this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }

  getLocation() {
    let addModal = this.modalCtrl.create("CityLocation");
    addModal.onDidDismiss(item => {
      if (item) {
        this.selectedCityAndLocation = item;
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: this.selectedCityAndLocation.activeCity, activeLocation: this.selectedCityAndLocation.activeLocation });
      }
    })
    addModal.present();
  }
  //Back button restriction
  initializeBackButtonCustomHandler() {
    this.platform.registerBackButtonAction(() => {
      this.customHandleBackButton();
    }, 10);
  }
  skipAlert(value) {
    let alert = this.alertCtrl.create({
      title: "Updatation",
      message: 'New Version Update Available!',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'SKIP',
          handler: () => {
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getAppVersion"), true);
            //this.viewCtrl.dismiss();
          }
        },
        {
          text: 'UPDATE',
          handler: () => {
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getAppVersion"), true);
            if (this.platform.is('ios')) {
              //window.location.href = value.IosAppUrl;
              // const browser = this.iab.create(value.IosAppUrl);
              // browser.show();
              window.open(value.IosAppUrl, '_system');
            } else if (this.platform.is('android')) {
              //window.location.href = value.AndroidAppUrl;
              // const browser = this.iab.create(value.AndroidAppUrl);
              // browser.show();
              window.open(value.AndroidAppUrl, '_system');
            }
          }
        }
      ]
    });
    alert.present();
  }
  forceAlert(value) {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getAppVersion"), true);
    let alert = this.alertCtrl.create({
      title: "Updatation",
      message: 'New Version Update Available!',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'UPDATE',
          handler: () => {
            if (this.platform.is('ios')) {
              //window.location.href = value.IosAppUrl;
              // const browser = this.iab.create(value.IosAppUrl);
              // browser.show();
              window.open(value.IosAppUrl, '_system');
            } else if (this.platform.is('android')) {
              //window.location.href = value.AndroidAppUrl;
              // const browser = this.iab.create(value.AndroidAppUrl,'_blank');
              // browser.show();
              window.open(value.AndroidAppUrl, '_system');
            }
          }
        }
      ]
    });
    alert.present();
  }
  private customHandleBackButton(): void {
    const alert = this.alertCtrl.create({
      // title: 'Exit App',
      title: "Exit",
      message: 'Do you want to Exit App?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            alert.dismiss();
          }
        },
        {
          text: 'Ok',
          handler: () => {
            navigator['app'].exitApp();
          }
        }
      ]
    });
    alert.present();
  }
  //Redirect to indivisual page
  redirectTo(value) {
    if (value != "CityLocation") {
      this.checkuserAuthAndRedict(value);
      //this.navCtrl.push(value);
    }
    else {
      this.getActiveCityAndLocation(value);
    }
  }
  //Fetching User city and location
  getActiveCityAndLocation(value) {
    let addModal = this.modalCtrl.create(value);
    addModal.onDidDismiss(item => {
      if (item) {
        if (item.activeCityKey != 0 || item.activeLocationKey != 0) {
          this.selectedCityAndLocation = item;
        }
        else {
          this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
            .then((result) => {
              if (result.activeCity != "" || result.activeLocation != "") {
                this.selectedCityAndLocation.activeCity = result.activeCity;
                this.selectedCityAndLocation.activeLocation = result.activeLocation;
              }
              else {
                this.selectedCityAndLocation.activeCity = "Choose City";
                this.selectedCityAndLocation.activeLocation = "Choose Locality";
              }
            });
        }
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: this.selectedCityAndLocation.activeCity, activeLocation: this.selectedCityAndLocation.activeLocation });
        //this.commonService.setStoreDataIncache(this.location_url, item);
      }
    })
    addModal.present();
  }
  redirectToMenu(value, event) {
    // $(".footer-image-sec").removeClass("active-section").addClass("footer-back");
    // $(event.currentTarget).removeClass("footer-back").addClass("active-section");
    if (value == "DashBoard") {
      //this.navCtrl.setRoot("DashBoard");
    }
    else if (value == "HospitalForEmergency") {
      this.navCtrl.push(value);
      // let addModal = this.modalCtrl.create("HospitalForEmergency");
      // addModal.onDidDismiss(item => {
      // })
      // addModal.present();
    }
    else {
      this.checkuserAuthAndRedict(value);
      //this.navCtrl.push(value);
    }
  }
  checkuserAuthAndRedict(value) {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
      .then((result) => {
        if (result.loginStatus) {
          // if (value == "BookAppointment") {
          //   let addModal = this.modalCtrl.create("BookAppointment");
          //   addModal.onDidDismiss(item => {
          //   })
          //   addModal.present();
          // }
          // else 
          if (value != "HealthRecordList") {
            this.navCtrl.push(value);
          }
          else {
            this.checkPremiumStatus();
          }
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
    //this.navCtrl.push("AppointmentPreConfirmation");
  }
  checkPremiumStatus() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserPremiumStatus"))
      .then((result) => {
        if (result) {
          this.navCtrl.push("HealthRecordList");
        }
        else {
          this.navCtrl.push("ApplyCouponCode");
        }
      });
  }

  //Redirect to health blog
  setRootAsVideomenueslistingPage() {
    this.navCtrl.push("VideomenueslistingPage");
  }
  selectGenericSearch() {
    this.navCtrl.push("BookAppointment", { searchKeyword: this.searchKeyword });
  }

  referral() {
    this.navCtrl.push("Referral");
  }
}
