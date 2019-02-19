import { Component, ViewChild } from '@angular/core';
import { MenuController, NavController, Slides, IonicPage, ModalController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DataContext } from "../../providers/dataContext.service";
import { CommonServices } from "../../providers/common.service";
import { Geolocation } from '@ionic-native/geolocation';
import { File } from '@ionic-native/file';
declare var google: any;
@IonicPage()
@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html',
  providers: [File]
})

export class TutorialPage {
  showSkip = true;
  @ViewChild('slides') slides: Slides;
  cityLocation: any = [];
  sliderConfig: any = [];
  allCity: any = [];
  currentPosition: any;
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };

  constructor(
    public navCtrl: NavController,
    public menu: MenuController,
    public storage: Storage,
    public _dataContext: DataContext,
    private commonService: CommonServices,
    private modalCtrl: ModalController,
    private geolocation: Geolocation,
    private file: File,
    public platform: Platform
  ) {
    // this.getSliderConfig();
    this.getCurrentLocationFromCache();
    this.getActiveCountryAndState();
  }
  startApp() {
    this.navCtrl.setRoot("ApplicationStartUpPage").then(() => {
      this.storage.set('hasSeenTutorial', 'true');
    })
  }
  //Slider Change
  onSlideChangeStart(slider: Slides) {
    this.showSkip = !slider.isEnd();
  }
  //Entry Point
  ionViewWillEnter() {
    this.slides.update();
    this.sliderConfig = [];
    this.sliderConfig = [
      { Content: "Instant appointment with doctors", Image: "assets/img/tutorial/tutorial.png" },
    ];
    if (this.platform.is('android')) {
      this.file.removeRecursively("file:///storage/emulated/0/Download/", this.commonService.getAppTitle())
        .then(_ => {

        })
        .catch(err => {
        });
    }
  }
  //If above functionality will not work then it will execute.
  ionViewDidLoad(){
    if (this.platform.is('android')) {
      this.file.removeRecursively("file:///storage/emulated/0/Download/", this.commonService.getAppTitle())
        .then(_ => {

        })
        .catch(err => {
        });
    }
  }
  //Retriving Slider Configuration
  getSliderConfig() {
    this._dataContext.GetSliderConfig("Slider", 0)
      .subscribe(response => {
        let result: any = response;
        if (result.Result == "Success") {
          this.sliderConfig = result.Data;
          this.sliderConfig.reverse();
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
  //Fetching User city and location
  getActiveCityAndLocation() {
    let addModal = this.modalCtrl.create("CityLocation");
    addModal.onDidDismiss(item => {
      if (item) {
        if (item.activeCityKey != 0 || item.activeLocationKey != 0) {
          this.selectedCityAndLocation = item;
        }
        else {
          this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
            .then((result) => {
              if ((result.activeCity != "" && result.activeCity != undefined) || (result.activeLocation != "" && result.activeLocation != undefined)) {
                this.selectedCityAndLocation.activeCity = result.activeCity;
                this.selectedCityAndLocation.activeLocation = result.activeLocation;
                this.selectedCityAndLocation.activeCityKey = result.activeCityKey;
                this.selectedCityAndLocation.activeLocationKey = result.activeLocationKey;
              }
              else {
                this.selectedCityAndLocation = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
              }
            });
        }
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: this.selectedCityAndLocation.activeCity, activeLocation: this.selectedCityAndLocation.activeLocation, activeCityKey: this.selectedCityAndLocation.activeCityKey, activeLocationKey: this.selectedCityAndLocation.activeLocationKey });
      }
    })
    addModal.present();
  }
  getCurrentLocationFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"))
      .then((result) => {
        if (result) {
          this.currentPosition.latitude = result.lat;
          this.currentPosition.longitude = result.lng;
          this.getAddressFromCurrentLocation();
        }
        else {
          this.getCurrentLocation();
        }
      });
  }
  getCurrentLocation() {
    this.geolocation.getCurrentPosition({ timeout: 20000, maximumAge: 10000 }).then((resp) => {
      if (resp != null && resp != undefined) {
        this.currentPosition = resp.coords;
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"), { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude }); 
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLocalityLatLng"), { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude });
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude });
        this.getAddressFromCurrentLocation();
      }
      else {
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"),false); 
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), false);
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLocalityLatLng"), false);
      }
    }).catch((error) => {
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"),false); 
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), false);   
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLocalityLatLng"), false);
      console.log('Error getting location', error);
    });
    //this.watchLocationPosition();
  }
  // //Get current location from watch method
  // watchLocationPosition() {
  //   this.geolocation.watchPosition().subscribe((resp) => {
  //     this.currentPosition = resp.coords;
  //     this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude });
  //   }), (err) => {
  //     console.log(err);
  //   }
  // }
  //Get address from current location using google api
  getAddressFromCurrentLocation() {
    this._dataContext.GetAddress(this.currentPosition.latitude, this.currentPosition.longitude)
      .subscribe(response => {
        this.getCityLocality(response);
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
        });
  }
  //Filter City Locality
  getCityLocality(response) {
    for (var i = 0; i < response.results[0].address_components.length; i++) {
      var component = response.results[0].address_components[i];
      if (component.types.includes('locality')) {
        this.selectedCityAndLocation.activeCity = component.long_name;
      }
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentCityFromGPS"), this.selectedCityAndLocation.activeCity);
       
      //Only we are getting City name not locality as per new requirement
      this.selectedCityAndLocation.activeLocation = "";
      // else if (component.types.includes('sublocality_level_1')) {
      //   this.selectedCityAndLocation.activeLocation = component.short_name;
      // }
      // else if (component.types.includes('sublocality_level_2')) {
      //   this.selectedCityAndLocation.activeLocation = component.short_name;
      // }
    };
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"), { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude }); 
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude });
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLocalityLatLng"), { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude });
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: this.selectedCityAndLocation.activeCity, activeLocation: this.selectedCityAndLocation.activeLocation, activeCityKey: this.selectedCityAndLocation.activeCityKey, activeLocationKey: this.selectedCityAndLocation.activeLocationKey });
  }
  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewDidLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true);
  }
  //Redirect to Login Page
  onLogin() {
    this.navCtrl.setRoot("LoginPage");
  }
  //Redirect to SignUp Page
  onSingnUp() {
    this.navCtrl.setRoot("SignupPage");
  }
  //Skip to dashboard
  skipToDashboard() {
    this.navCtrl.setRoot("DashBoard");
  }
  //Get active countries and states
  getActiveCountryAndState() {
    this._dataContext.GetActiveCountryAndState(0)
      .subscribe(response => {
        if (response.Result == "Success") {
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
}
