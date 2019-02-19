import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavParams, NavController, ViewController, App } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import * as _ from "lodash";
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-seeallhospitals',
  templateUrl: 'seeallhospitals.html',
  providers: [CallNumber, InAppBrowser]
})
export class SeeAllHospitals {
  searchedKeyword: string;
  cityId: string;
  localityId: string;
  hospitals: any = [];
  page: number;
  searchedResult: any = [];
  itemPerPage: number;
  isAvailable: boolean = true;

  constructor(private iab: InAppBrowser, private callNumber: CallNumber, public appCtrl: App, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController, public navParams: NavParams) {
    this.searchedKeyword = this.navParams.get('searchKeyword');
    this.cityId = this.navParams.get('cityId');
    this.localityId = this.navParams.get('localityId');
    // this.hospitals = this.navParams.get('hospitals');
    this.page = 0;
    this.itemPerPage = 20;
    this.getAllHospitals();
  }

  //Get all the doctors based on searched keyword
  getAllHospitals() {
    let query: any = {};
    query = this.commonService.getSearchedHospitalsByKeyword();
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
                      // if (activelocationDetails[0].term.City == cityFromGPSCache) {
                      //   // query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                      //   query.sort = [currentLocation];
                      // }
                      // else {
                      //   // if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined && activelocationDetails[0].term.City == cityFromGPSCache) {
                      //   //   query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                      //   // }
                      //   //else {
                      //   // query.aggs.by_type.aggs.tops.top_hits.sort = [];
                      //   // }
                      //   query.sort = [];
                      // }
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
                        // if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined) {
                        //   query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                        //   query.aggs.by_type.aggs.tops.top_hits.script_fields = currentLocalityLatLng;
                        // }
                        // else {
                        query.sort = [currentLocation];
                        query.script_fields = currentLocalityLatLng;
                        // }
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
                          // query.aggs.by_type.aggs.tops.top_hits.sort = [];
                          query.sort = [];
                          query.script_fields = {};
                        }
                      }
                      query.from = this.page;
                      this._dataContext.GetAutocompleteSearchedData(query)
                        .subscribe(response => {
                          if (response.hits.total > 0) {
                            //this.searchedResult = response.hits.hits;
                            if (activelocationDetails[0].term.City == cityFromGPSCache) {
                              response.hits.hits.filter(item => {
                                if (item._id != "" && item._id != null && item._id != undefined) {
                                  if(item.fields != null && item.fields != undefined){
                                    item.fields.distance[0] = item.fields.distance[0].toFixed("1");
                                  }
                                }
                              });
                            }

                            this.hospitals = this.hospitals.concat(response.hits.hits);
                            this.page = this.hospitals.length;
                            this.isAvailable = true;
                          }
                          else {
                            if (this.hospitals.length == 0) {
                              this.hospitals = [];
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
  _callDoctor(data) {
    this.callNumber.callNumber(data, true)
      .then(() => {
      })
      .catch(() => {

      });
  }
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getAllHospitals();
      infiniteScroll.complete();
    }, 500);
  }
  closeCurrentSection() {
    this.viewCtrl.dismiss(true);
  }
  redirectTo(value, data) {
    this.appCtrl.getActiveNav().push(value, { providerInfo: data });
  }
  showMap(latlng) {
    let url = "https://maps.google.com/maps?q=" + latlng + "&hl=es;z=14&amp;output=embed";
    const browser = this.iab.create(url, '_blank');
    browser.show();
  }
}
