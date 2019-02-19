import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavParams, NavController, ViewController, App, ModalController } from 'ionic-angular';
import * as _ from "lodash";
import { DataContext } from '../../providers/dataContext.service';
import { CommonServices } from '../../providers/common.service';
import { CallNumber } from '@ionic-native/call-number';

@IonicPage()
@Component({
  selector: 'page-emergency',
  templateUrl: 'emergency.html',
  providers: [CallNumber]
})
export class HospitalForEmergency {
  searchedKeyword: string;
  cityId: string;
  localityId: string;
  hospitals: any = [];
  page: number;
  searchedResult: any = [];
  itemPerPage: number;
  isAvailable: boolean = true;
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };

  constructor(private modalCtrl: ModalController, private callNumber: CallNumber, public appCtrl: App, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController, public navParams: NavParams) {

  }
  ionViewDidEnter() {
    this.page = 0;
    this.itemPerPage = 20;
    this.hospitals=[];
    this.getCurrentLocationFromCache();
    this.getAllHospitals();
    this.commonService.onEntryPageEvent("Come to emergency");
  }
  //Get all the doctors based on searched keyword
  getAllHospitals() {
    this.searchedResult = [];
    let query: any = {}
    query = this.commonService.getHospitalEmergencyNumber();
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          query.query.bool.filter = query.query.bool.filter.concat(result);
          query.from = this.page;
          this._dataContext.GetHospitalEmergencyContact(query)
            .subscribe(response => {
              if (response.hits.total > 0) {
                this.searchedResult = response.hits.hits;
                this.hospitals = this.hospitals.concat(this.searchedResult);
                console.log(this.hospitals);
                this.page = this.hospitals.length;
                this.isAvailable = true;
              }
              else {
                this.hospitals = [];
                this.page = 0;
                this.isAvailable = false;
              }
            },
              error => {
                console.log(error);
                this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
              });
        }
        else {
          //this.getLocation();
        }
      });

    // this._dataContext.GetAutocompleteSearchedData(query)
    //   .subscribe(response => {
    //     if (response.hits.total > 0) {
    //       this.hospitals = this.hospitals.concat(response.hits.hits);
    //       this.page = this.hospitals.length;
    //       this.hospitals = _.map(_.uniqBy(this.hospitals, '_id'), function (item) {
    //         return item;
    //       });
    //     }
    //     console.log(response.hits.hits);
    //   },
    //     error => {
    //       console.log(error);
    //       this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
    //     });
  }
  storeLocationResultInCache() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: this.selectedCityAndLocation.activeCity, activeLocation: this.selectedCityAndLocation.activeLocation, activeCityKey: this.selectedCityAndLocation.activeCityKey, activeLocationKey: this.selectedCityAndLocation.activeLocationKey })
      .then((result) => {
        this.hospitals = [];
        this.page = 0;
        this.itemPerPage = 20;
        this.getAllHospitals();
      });
  }
  getCurrentLocationFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
      .then((result) => {
        if ((result.activeCity != "" && result.activeCity != undefined && result.activeCity != "Choose City") || (result.activeLocation != "" && result.activeLocation != undefined && result.activeLocation != "Choose Locality")) {
          this.selectedCityAndLocation.activeCity = result.activeCity;
          this.selectedCityAndLocation.activeLocation = result.activeLocation;
          this.selectedCityAndLocation.activeCityKey = result.activeCityKey;
          this.selectedCityAndLocation.activeLocationKey = result.activeLocationKey;
        }
        else {
          this.selectedCityAndLocation = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
          this.getLocation();
        }
      });
  }
  getLocation() {
    let addModal = this.modalCtrl.create("CityLocation");
    addModal.onDidDismiss(item => {
      if (item) {
        if (item.activeCityKey != 0 || item.activeLocationKey != 0) {
          this.selectedCityAndLocation = item;
          this.storeLocationResultInCache();
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
              this.storeLocationResultInCache();
            });
        }
      }
    })
    addModal.present();
  }
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getAllHospitals();
      infiniteScroll.complete();
    }, 500);
  }
  _call(number) {
    this.callNumber.callNumber(number, true)
      .then(() => {
      })
      .catch(() => {

      });
  }
  closeCurrentSection() {
   // this.navCtrl.pop(); 
   this.viewCtrl.dismiss(true);
  }
  redirectTo(value, data) {
    let hospitalDetails = {
      ProviderID: data.GroupEntityID,
      ProviderImage:"",
      ProviderName: data.Hospital,
      Latlong: data.Latlong,
      City: data.City,
      CityAreaName: data.CityAreaName,
      EmergencyNumberType: data.ContactNumberType,
      Number: data.ContactNumber
    }
    this.appCtrl.getActiveNav().push(value, { providerInfo: hospitalDetails });
  }
}
