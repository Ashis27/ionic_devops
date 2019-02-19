import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavParams, NavController, ViewController, App, ModalController } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import * as _ from "lodash";
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-seealldignosticcenterlist',
  templateUrl: 'seealldignosticcenterlist.html',
  providers: [CallNumber,InAppBrowser]
})
export class SeeAllDiagnosticCenterList {
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

  constructor(private iab: InAppBrowser, public modalCtrl: ModalController, private callNumber: CallNumber, public appCtrl: App, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController, public navParams: NavParams) {
    this.searchedKeyword = this.navParams.get('searchKeyword');
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getFilterData"), false);
  }
  ionViewDidEnter() {
    this.getCurrentLocationFromCache();
    if (this.searchedKeyword != "" && this.searchedKeyword != undefined && this.searchedKeyword != null) {
      this.page = 0;
      this.diagnosticCenterList=[];
      this.getAllDiagnosticCenters();
    }
    // else {
    //   this.getDefaultDiagnosticCenters();
    // }
  }
  //Get all the diagnostic centers based on searched keyword
  getAllDiagnosticCenters() {
    this.searchedResult = [];
    let query: any = {};
    query = this.commonService.getDCSeeAllResultByKeyword();
    query.query.bool.must[0].match._all.query = this.searchedKeyword;
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          let activelocationDetails = result;
          query.query.bool.filter = query.query.bool.filter.concat(result[0]);
          let currentLocation = {};
          let locationlatlng: any = {};
          let currentLocalityLatLng: any = {};
          this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentLanLng"))
            .then((result) => {
              if (result) {
                locationlatlng = result;
                currentLocation = {
                  "_geo_distance": {
                    "Latlong": result.lat + "," + result.lng,
                    "order": "asc",
                    "unit": "km",
                    "distance_type": "plane"
                  }
                }
              }
              this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentLocalityLatLng"))
                .then((result) => {
                  if (result) {
                    currentLocalityLatLng =
                      {
                        "distance": {
                          "script": {
                            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
                            "lang": "painless",
                            "params": {
                              "lat": result.lat,
                              "lon": result.lng
                            }
                          }
                        }
                      }
                  }
                  this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentCityFromGPS"))
                    .then((response) => {
                      let cityFromGPSCache = response;
                      if (activelocationDetails[0].term.City == cityFromGPSCache) {
                        currentLocation = {
                          "_geo_distance": {
                            "Latlong": currentLocalityLatLng.distance.script.params.lat + "," + currentLocalityLatLng.distance.script.params.lon,
                            "order": "asc",
                            "unit": "km",
                            "distance_type": "plane"
                          }
                        }
                        currentLocalityLatLng =
                          {
                            "distance": {
                              "script": {
                                "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
                                "lang": "painless",
                                "params": {
                                  "lat": locationlatlng.lat,
                                  "lon": locationlatlng.lng
                                }
                              }
                            }
                          }
                        query.sort = [currentLocation];
                        query.script_fields = currentLocalityLatLng;
                      }
                      else {
                        if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined) {
                          currentLocation = {
                            "_geo_distance": {
                              "Latlong": currentLocalityLatLng.distance.script.params.lat + "," + currentLocalityLatLng.distance.script.params.lon,
                              "order": "asc",
                              "unit": "km",
                              "distance_type": "plane"
                            }
                          }

                          query.sort = [currentLocation];
                          query.script_fields = {};
                        }
                        else {
                          query.sort = [];
                          query.script_fields = {};
                        }
                      }
                      query.from = this.page;
                      this._dataContext.GetDiagnosticsCenters(query)
                        .subscribe(response => {
                          if (response.hits.total > 0) {
                            //this.searchedResult = response.aggregations.by_type.buckets;
                            this.searchedResult = response.hits.hits;
                            let filterData = [];
                            // this.searchedResult.filter(item => {
                            //   item.tops.hits.hits.filter(result => {
                            //     filterData.push(result._source);
                            //   });
                            // });
                            if (activelocationDetails[0].term.City == cityFromGPSCache) {
                              this.searchedResult.filter(item => {
                                if (item._id != "" && item._id != null && item._id != undefined) {
                                  if(item.fields != null && item.fields != undefined){
                                    item.fields.distance[0] = item.fields.distance[0].toFixed("1");
                                  }
                                  filterData.push(item);
                                }
                              });
                            }
                            else {
                              this.searchedResult.filter(item => {
                                if (item._id != "" && item._id != null && item._id != undefined) {
                                  filterData.push(item);
                                }
                              });
                            }
                            this.diagnosticCenterList = this.diagnosticCenterList.concat(response.hits.hits);
                            this.diagnosticCenterList.filter(item => {
                              item._source.CenterName = this.commonService.convert_case(item._source.CenterName);
                              item._source.CityAreaName = this.commonService.convert_case(item._source.CityAreaName);
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
                    });
                });
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
  selectedDiagnosticCenter(data) {
    let DiagnosticCenter: any = {};
    DiagnosticCenter.CenterID = data.GroupEntityId;
    DiagnosticCenter.CityAreaName = data.CityAreaName;
    DiagnosticCenter.City = data.City;
    DiagnosticCenter.CenterName = data.CenterName;
    DiagnosticCenter.PackageCount = data.PackageCount;
    DiagnosticCenter.TestCount = data.TestCount;
    DiagnosticCenter.LatLng = data.Latlong;
    DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    this.navCtrl.push("DiagnosticCenterProfile", { selectedCenter: DiagnosticCenter });
  }
  showMap(latlng) {
    let url = "https://maps.google.com/maps?q=" + latlng + "&hl=es;z=14&amp;output=embed";
    const browser = this.iab.create(url, '_blank');
    browser.show();
  }
}
