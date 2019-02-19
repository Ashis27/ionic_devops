import { Component, ViewChild, NgZone } from '@angular/core';
import { App, IonicPage, Events, MenuController, Platform, NavParams, Nav, ViewController, LoadingController, ToastController, NavController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonServices } from "../../providers/common.service";
import { DataContext } from '../../providers/dataContext.service';
import { Geolocation } from '@ionic-native/geolocation';
import { CodePush, SyncStatus } from '@ionic-native/code-push';
import { SyncAsync } from '@angular/compiler/src/util';
@IonicPage()
@Component({
  selector: 'page-applicationstartuppage',
  templateUrl: 'applicationstartuppage.html',
  providers: []
})
export class ApplicationStartUpPage {
  @ViewChild(Nav) nav: Nav;
  loading: any;
  rootPage: any = "";
  splash: boolean = true;
  masterLoginStatus = { loginStatus: false, userName: "", userDetails: [] };
  url: string;
  codePushSyncStatus: string = "";
  downLoadProgressStatus: any;
  downLoadStatus: boolean = true;
  receiveFileSize: number = 0;
  totalFileSize: number = 0;
  downloadProgressFlag: boolean = false;
  constructor(
    public platform: Platform,
    public menu: MenuController,
    public commonServices: CommonServices,
    public storage: Storage,
    public viewCtrl: ViewController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public appCtrl: App,
    public alertCtrl: AlertController,
    public events: Events,
    public navParams: NavParams,
    public _dataContext: DataContext,
    private commonService: CommonServices,
    private geolocation: Geolocation,
    private codePush: CodePush,
    private ngZone: NgZone
  ) {
    // this.url = this.commonServices.getApiServiceUrl() + "/hasSeenTutorial";
    // this.commonServices.getStoreDataFromCache(this.url)
    //   .then((hasVisitRegisterPage) => {
    //     if (hasVisitRegisterPage) {
    //       this.rootPage = "DashBoard";
    //     } else {
    //        this.rootPage = "DashBoard";
    //     }
    //   });
    this.platform.ready().then(() => {
      // this.codePushDeployment();
    });
  }
  ionViewDidEnter() {
    this.getLoggedInUserDetailsFromCache();

  }
  //Get Logged In user details from cache, if not available then get from server.
  getLoggedInUserDetailsFromCache() {
    let token = localStorage.getItem('user_auth_token');
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
      .then((result) => {
        if (result && result.loginStatus && token != "" && token !=undefined) {
          this.getNotifications();
          // this.getCurrentLatLng();
          this.getCurrentLocation();
          this.rootPage = "DashBoard";
        }
        else {
          this.rootPage = "LoginPage";
        }
      });
  }
  codePushDeployment() {
    this.codePush.sync({}, progress => {
      this.ngZone.run(() => {
        this.downLoadProgressStatus = progress;
        this.downloadProgressFlag = true;
        if (Number(this.downLoadProgressStatus.receivedBytes) === Number(this.downLoadProgressStatus.totalBytes)) {
          this.downLoadStatus = false;
        }
        this.receiveFileSize = Math.round(Number(this.downLoadProgressStatus.receivedBytes / 1024));
        this.totalFileSize = Math.round(Number(this.downLoadProgressStatus.totalBytes / 1024));
      });
    })
      .subscribe((status) => {
        if (status == SyncStatus.CHECKING_FOR_UPDATE) {
          this.codePushSyncStatus = "Checking for Update";
          this.downloadProgressFlag = false;
        }
        else if (status == SyncStatus.DOWNLOADING_PACKAGE) {
          this.codePushSyncStatus = "Downloading Packages";
          this.downloadProgressFlag = true;
        }
        else if (status == SyncStatus.IN_PROGRESS) {
          this.codePushSyncStatus = "Downloading in Progress";
          this.downloadProgressFlag = true;
        }
        else if (status == SyncStatus.INSTALLING_UPDATE) {
          this.codePushSyncStatus = "Installing Update";
          this.downloadProgressFlag = true;
        }
        else if (status == SyncStatus.UP_TO_DATE) {
          this.codePushSyncStatus = "Up to Update";
          this.downloadProgressFlag = false;
        }
        else if (status == SyncStatus.UPDATE_INSTALLED) {
          this.codePushSyncStatus = "Update Installed";
          this.downloadProgressFlag = false;
        }
        else if (status == SyncStatus.ERROR) {
          this.codePushSyncStatus = "Error Occured";
          this.downloadProgressFlag = false;
        }
        else {
          this.downloadProgressFlag = false;
        }
        //else
        //this.splash = false;
        //  this.showAlertMessage(this.codePushSyncStatus);
      }),
      (err) => {
        console.log('CODE PUSH ERROR: ' + err);
      }
  }
  getNotifications() {
    this._dataContext.GetNotificationCofiguration("LocalNotification")
      .subscribe(response => {
        let result: any = response;
        if (result.Result == "OK") {
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getNotification"), result.Data);
        }
      },
        error => {
          console.log(error);
        });
  }
  // getCurrentLatLng() {
  //   this.commonService.getCurrentLocation()
  //     .then((result) => {
  //       if (result != null && result != undefined) {
  //         this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserCurrentLatLng"), result);
  //       }
  //     });
  // }
  getCurrentLocation() {
    this.geolocation.getCurrentPosition({ timeout: 20000, maximumAge: 10000 }).then((resp) => {
      if (resp != null && resp != undefined) {
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), { lat: resp.coords.latitude, lng: resp.coords.longitude });
        this.getAddressFromCurrentLocation(resp.coords);
      }
      else {
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), false);
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"), false);
      }
    }).catch((error) => {
      this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentLanLng"))
        .then((result) => {
          if (result) {
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), { lat: result.lat, lng: result.lng });
          }
          else {
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), false);
          }
        });
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"), false);
    });
    //this.watchLocationPosition();
  }
  //Get address from current location using google api
  getAddressFromCurrentLocation(value) {
    this._dataContext.GetAddress(value.latitude, value.longitude)
      .subscribe(response => {
        this.getCityLocality(response, value);
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
        });
  }
  //Filter City Locality
  getCityLocality(response, latlng) {
    let activeCity = "";
    let activeLocation = "";
    for (var i = 0; i < response.results[0].address_components.length; i++) {
      var component = response.results[0].address_components[i];
      if (component.types.includes('locality')) {
        activeCity = component.long_name;
      }
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentCityFromGPS"), activeCity);
      //Only we are getting City name not locality as per new requirement
      activeLocation = "";
    };
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
      .then((result) => {
        if ((result.activeCity != "" && result.activeCity != undefined && result.activeCity != "Choose City") || (result.activeLocation != "" && result.activeLocation != undefined && result.activeLocation != "Choose Locality")) {
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: result.activeCity, activeLocation: result.activeLocation, activeCityKey: result.activeCityKey, activeLocationKey: result.activeLocationKey });
        }
        else {
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: activeCity, activeLocation: activeLocation, activeCityKey: 0, activeLocationKey: 0 });
        }
      });
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"), { lat: latlng.latitude, lng: latlng.longitude });
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), { lat: latlng.latitude, lng: latlng.longitude });
  }
  ionViewDidLoad() {
    setTimeout(() => {
      this.splash = false
    }, 3000);
  }

}
