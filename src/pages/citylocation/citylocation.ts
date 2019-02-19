import { Component, ViewChild } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';
import { CommonServices } from "../../providers/common.service";
import { DataContext } from "../../providers/dataContext.service";
import { Geolocation } from '@ionic-native/geolocation';
@IonicPage()
@Component({
  selector: 'page-citylocation',
  templateUrl: 'citylocation.html',
})
export class CityLocation {
  @ViewChild('myinput') input;
  activeCityLocation: any = { activeCity: "", activeCityKey: 0, activeLocation: "", activeLocationKey: 0 };
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
  cityList: any = [];
  locationList: any = [];
  backUpLocationList: any = [];
  backUpCityList: any = [];
  cityAvailableStatus: boolean = false;
  locationAvailableStatus: boolean = false;
  isSelectedCity: boolean = false;
  currentPosition: any = { latitude: 0, longitude: 0 };
  activeCity: string = "";
  activeLocation: string = "";
  constructor(private geolocation: Geolocation, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController) {
  }
  ionViewWillEnter() {
    this.getCurrentActiveLocationFromCache();
    // setTimeout(() => {
    //   this.input.setFocus();
    // }, 150);
    this.getActiveCitieseFromCache();
  }
  getCurrentActiveLocationFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
      .then((result) => {
        if ((result.activeCity != "" && result.activeCity != undefined && result.activeCity != "Choose City") || (result.activeLocation != "" && result.activeLocation != undefined && result.activeLocation != "Choose Locality")) {
          this.selectedCityAndLocation.activeCity = result.activeCity;
          this.selectedCityAndLocation.activeLocation = result.activeLocation;
          this.selectedCityAndLocation.activeCityKey = result.activeCityKey;
          this.selectedCityAndLocation.activeLocationKey = result.activeLocationKey;
        }
      });
  }
  //Get active countries and states from cache, if not available then get from server.
  getActiveCitieseFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCities"))
      .then((result) => {
        if (result) {
          this.cityList = result.Data;
          this.backUpCityList = this.cityList;
          this.getActiveCities(0);
        }
        else {
          this.getActiveCities(1);
        }
      });
  }
  //Get active cities
  getActiveCities(value) {
    this._dataContext.GetActiveCity(value)
      .subscribe(response => {
        if (response.Result == "Success") {
          this.cityList = response.Data;
          this.backUpCityList = this.cityList;
        }
        else {
          // this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          // this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  //Get all the location based on the city
  getLocation(cityId) {
    this._dataContext.GetActiveLocation(cityId)
      .subscribe(response => {
        if (response.Result == "Success") {
          this.locationList = response.Data;
          this.backUpLocationList = this.locationList;
        }
        else {
          //this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          // this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  //Filter City
  onInputCity(event) {
    this.isSelectedCity = false;
    let term = event.target.value;
    if (term && term.trim() != '') {
      this.cityList = this.backUpCityList.filter((item) => {
        return (item.DemographyName.toLowerCase().indexOf(term.toLowerCase()) > -1);
      })
      if (this.cityList.length == 0) {
        this.cityAvailableStatus = true;
      }
      else {
        this.cityAvailableStatus = false;
      }
    }
    else {
      this.cityAvailableStatus = true;
      this.cityList = this.backUpCityList;
    }
  }
  //Filter Location
  onInputLocation(event) {
    let term = event.target.value;
    if (term && term.trim() != '') {
      this.locationList = this.backUpLocationList.filter((item) => {
        return (item.CityAreaName.toLowerCase().indexOf(term.toLowerCase()) > -1);
      })
      if (this.locationList.length == 0) {
        this.locationAvailableStatus = true;
      }
      else {
        this.locationAvailableStatus = false;
      }
    }
    else {
      this.locationAvailableStatus = true;
      this.locationList = this.backUpLocationList;
    }
  }
  //Selected City
  getSelectedCity(data) {
    this.locationList = [];
    this.activeCity = data.DemographyName;
    this.isSelectedCity = !this.isSelectedCity;
    this.activeCityLocation.activeCity = data.DemographyName;
    this.activeCityLocation.activeCityKey = data.DemographyCode;
    this.selectedCityAndLocation.activeCity = data.DemographyName;
    this.selectedCityAndLocation.activeLocation = "";
    this.selectedCityAndLocation.activeCityKey = data.DemographyCode;
    this.selectedCityAndLocation.activeLocationKey = 0;
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"))
      .then((result) => {
        if (result) {
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), { lat: result.lat, lng: result.lng });
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLocalityLatLng"), { lat: result.lat, lng: result.lng });
        }
        else {
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLocalityLatLng"), false);
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), false);
        }
        });
    this.getLocation(data.DemographyCode);
  }

  //Selected City
  getSelectedLocation(data) {
    this.activeLocation = data.CityAreaName;
    this.activeCityLocation.activeLocation = data.CityAreaName;
    this.activeCityLocation.activeLocationKey = data.CityAreaID;
    // this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentCityFromGPS"))
    // .then((result) => {
    //   if (result) {
    //     this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentCityFromGPS"), result);
    //   }
    //   else{
    //  this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentCityFromGPS"), this.activeCityLocation.activeCity);
    //   }
    // });
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLocalityLatLng"), { lat: data.Latitude, lng: data.Longitude });
    this.viewCtrl.dismiss(this.activeCityLocation);
  }
  //Close modal
  closeModal() {
    if (this.activeCityLocation.activeCityKey != 0 || this.activeCityLocation.activeLocationKey != 0) {
      this.viewCtrl.dismiss(this.activeCityLocation);
    }
    else {
      this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
        .then((result) => {
          if ((result.activeCity != "" && result.activeCity != undefined) || (result.activeLocation != "" && result.activeLocation != undefined)) {
            this.viewCtrl.dismiss(result);
          }
          else {
            this.viewCtrl.dismiss(this.activeCityLocation);
          }
        });
    }
  }

  //Get location from Cache
  getCurrentLocationFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"))
      .then((result) => {
        if (result) {
          this.currentPosition.latitude = result.lat;
          this.currentPosition.longitude = result.lng;
          this.getAddressFromCurrentLocation();
        }
        this.getCurrentLocation();
        // this.closeModal();
      });
  }
  getCurrentLocation() {
    this.geolocation.getCurrentPosition().then((resp) => {
      if (resp != null && resp != undefined) {
        this.currentPosition = resp.coords;
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"), { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude });
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude });
        this.getAddressFromCurrentLocation();
      }
      else {
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"), false);
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), false);
      }
    }).catch((error) => {
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"), false);
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), false);
      console.log('Error getting location', error);
    });
  }
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
        this.activeCityLocation.activeCity = component.long_name;
      }
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentCityFromGPS"), this.selectedCityAndLocation.activeCity);
      //Only we are getting City name not locality as per new requirement
      this.selectedCityAndLocation.activeLocation = "";
      // else if (component.types.includes('sublocality_level_1')) {
      //   this.activeCityLocation.activeLocation = component.short_name;
      // }
      // else if (component.types.includes('sublocality_level_2')) {
      //   this.activeCityLocation.activeLocation = component.short_name;
      // }
    };
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentGPSLanLng"), { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude });
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getCurrentLanLng"), { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude });
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: this.activeCityLocation.activeCity, activeLocation: this.activeCityLocation.activeLocation, activeCityKey: 0, activeLocationKey: 0 });
    this.viewCtrl.dismiss(this.activeCityLocation);
  }

}
