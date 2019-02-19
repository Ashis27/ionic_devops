import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavParams, NavController, ViewController, App, ModalController } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import * as _ from "lodash";

@IonicPage()
@Component({
  selector: 'page-seealldignosticcenter',
  templateUrl: 'seealldignosticcenter.html',
  providers: [CallNumber]
})
export class SeeAllDiagnosticCenters {
  searchedKeyword: string;
  cityId: string;
  localityId: string;
  diagnosticCenterList: any = [];
  page: number;
  start: number = 0;
  itemPerPage: number;
  searchStatus: boolean = false;
  groupEntityId: number = 0;
  isAvailable: boolean = true;
  searchedResult: any = [];
  searchedSymptoms: string;
  sectionType: string;
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };

  constructor(public modalCtrl: ModalController, private callNumber: CallNumber, public appCtrl: App, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController, public navParams: NavParams) {
    this.searchedKeyword = this.navParams.get('searchKeyword');
    this.page = 0;
    this.itemPerPage = 30;
  }
  ionViewDidEnter() {
    this.diagnosticCenterList = [];
    this.getCurrentLocationFromCache();
    if (this.searchedKeyword != "" && this.searchedKeyword != undefined && this.searchedKeyword != null) {
      this.getAllDiagnosticCenters();
    }
    else {
      this.getDefaultDiagnosticCenters();
    }
  }
  //Get all the diagnostic centers based on searched keyword
  getDefaultDiagnosticCenters() {
    this.searchedResult = [];
    let query: any = {};
    query = "";//this.commonService.getDefaultCenterList();
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          query.query.bool.filter = query.query.bool.filter.concat(result);
          query.from = this.page;
          this._dataContext.GetDiagnosticsCenters(query)
            .subscribe(response => {
              if (response.hits.total > 0) {
                //this.searchedResult = response.aggregations.by_type.buckets;
                this.searchedResult = response.aggregations.by_Center.buckets;
                let filterData = [];
                this.searchedResult.filter(item => {
                  item.tops.hits.hits.filter(result => {
                    filterData.push(result._source);
                  });
                });
                this.diagnosticCenterList = this.diagnosticCenterList.concat(filterData);
                this.diagnosticCenterList.filter(item => {
                  item.CenterName = this.commonService.convert_case(item.CenterName);
                  item.CityAreaName = this.commonService.convert_case(item.CityAreaName);
                })
                this.page = this.diagnosticCenterList.length;
                this.isAvailable = true;
              }
              else {
                this.diagnosticCenterList = [];
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
          // this.getLocation();
        }
      });
  }
  //Get all the diagnostic centers based on searched keyword
  getAllDiagnosticCenters() {
    this.searchedResult = [];
    let query: any = {};
    query = this.commonService.getSearchedDiagnosticCenterByKeywords();
    query.query.bool.must[0].multi_match.query = this.searchedKeyword;
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          query.query.bool.filter = query.query.bool.filter.concat(result);
          query.from = this.page;
          this._dataContext.GetDiagnosticsCenters(query)
            .subscribe(response => {
              if (response.hits.total > 0) {
                //this.searchedResult = response.aggregations.by_type.buckets;
                this.searchedResult = response.aggregations.by_Center.buckets;
                let filterData = [];
                this.searchedResult.filter(item => {
                  item.tops.hits.hits.filter(result => {
                    filterData.push(result._source);
                  });
                });
                this.diagnosticCenterList = this.diagnosticCenterList.concat(filterData);
                this.diagnosticCenterList.filter(item => {
                  item.CenterName = this.commonService.convert_case(item.CenterName);
                  item.CityAreaName = this.commonService.convert_case(item.CityAreaName);
                })
                this.page = this.diagnosticCenterList.length;
                this.isAvailable = true;
              }
              else {
                if (this.diagnosticCenterList.length == 0) {
                  this.diagnosticCenterList = [];
                  this.page = 0;
                  this.isAvailable = false;
                }

              }
            },
              error => {
                console.log(error);
                this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
              });
        }
        else {
          // this.getLocation();
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
  storeLocationResultInCache() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: this.selectedCityAndLocation.activeCity, activeLocation: this.selectedCityAndLocation.activeLocation, activeCityKey: this.selectedCityAndLocation.activeCityKey, activeLocationKey: this.selectedCityAndLocation.activeLocationKey })
      .then((result) => {
        this.diagnosticCenterList = [];
        if (this.searchedKeyword != "" && this.searchedKeyword != undefined && this.searchedKeyword != null) {
          this.getAllDiagnosticCenters();
        }
        else {
          this.getDefaultDiagnosticCenters();
        }
      });
  }
  getCurrentLocationFromCache() {
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
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getAllDiagnosticCenters();
      infiniteScroll.complete();
    }, 500);
  }
  closeCurrentSection() {
    this.viewCtrl.dismiss(true);
  }
  _callr(data) {
    this.callNumber.callNumber(data, true)
      .then(() => {
      })
      .catch(() => {

      });
  }
  redirectTo(value, data) {
    this.navCtrl.push(value, { selectedCenter: data });
    // this.appCtrl.getActiveNav().push(value, { providerInfo: data });
  }
}
