import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavParams, NavController, ViewController, App } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import * as _ from "lodash";
import { Geolocation } from '@ionic-native/geolocation';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-seealldoctors',
  templateUrl: 'seealldoctors.html',
  providers: [CallNumber, InAppBrowser]
})
export class SeeAllDoctors {
  searchedKeyword: string;
  cityId: string;
  localityId: string;
  doctorList: any = [];
  page: number;
  start: number = 0;
  itemPerPage: number;
  searchStatus: boolean = false;
  groupEntityId: number = 0;
  isAvailable: boolean = true;
  searchedResult: any = [];
  searchedSymptoms: string;
  sectionType: string;
  currentPosition: any = { latitude: 0, longitude: 0 };
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };

  constructor(private iab: InAppBrowser, private geolocation: Geolocation, private callNumber: CallNumber, public appCtrl: App, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController, public navParams: NavParams) {
    this.searchedKeyword = this.navParams.get('searchKeyword');
    this.searchedSymptoms = this.navParams.get('searchedSymptoms');
    this.cityId = this.navParams.get('cityId');
    this.localityId = this.navParams.get('localityId');
    this.groupEntityId = this.navParams.get('groupEntityId');;
    // this.doctorList = this.navParams.get('doctors');
    this.searchStatus = this.navParams.get('searchStatus');
    this.sectionType = this.navParams.get('type');
    this.page = 0;
    this.itemPerPage = 30;
  }
  ionViewDidEnter() {
    if (this.sectionType == "Surgery") {
      this.getDoctorsBySurgeryName();
    }
    else {
      if (Number(this.groupEntityId) > 0) {
        this.getAllDoctorsByHospitalId();
      }
      else {
        this.getAllDoctors();
      }
    }
    this.getCurrentLocationFromCache();
  }
  //Get all the doctors based on hospital Id
  getAllDoctorsByHospitalId() {
    let query: any = this.commonService.getSearchedDoctorListByHospitalId();
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          let activelocationDetails = result;
          query.query.constant_score.filter.bool.must[0].term.GroupEntityID = this.groupEntityId;
          // query.query.bool.filter = query.query.bool.filter.concat(result);
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
                      // query.sort = [currentLocation];
                      //query.from = this.page;
                      // query.sort = [currentLocation];
                      query.from = this.page;
                      this._dataContext.GetAutocompleteSearchedData(query)
                        .subscribe(response => {
                          if (response.hits.total > 0) {
                            this.searchedResult = response.hits.hits;
                            let filterData = [];

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
                                  //item.sort[0] = item.sort[0].toFixed("1");
                                  filterData.push(item);
                                }
                              });
                            }
                            this.doctorList = this.doctorList.concat(filterData);
                            // this.doctorList = _.map(_.uniqBy(this.doctorList, 'ProviderID'), function (item) {
                            //   return item;
                            // });
                            this.doctorList.filter(item => {
                              item._source.ProviderName = this.commonService.convert_case(item._source.ProviderName);
                            })
                            this.page = this.doctorList.length;
                            this.isAvailable = true;
                          }
                          else {
                            this.doctorList = [];
                            this.page = 0;
                            this.isAvailable = false;
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
  }
  //Get all the doctors based on searched keyword
  getAllDoctors() {
    let query: any = this.commonService.getSearchedDoctorList();
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
                      //   //query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                      //   query.sort = [currentLocation];
                      // }
                      // else {
                      //   // if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined && activelocationDetails[0].term.City == cityFromGPSCache) {
                      //   //   query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                      //   // }
                      //   // else {
                      //   query.sort = [currentLocation];
                      //   //}
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
                      // query.sort = [currentLocation];
                      query.from = this.page;
                      this._dataContext.GetAutocompleteSearchedData(query)
                        .subscribe(response => {
                          if (response.hits.total > 0) {
                            this.searchedResult = response.hits.hits;
                            let filterData = [];
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
                                  //item.sort[0] = item.sort[0].toFixed("1");
                                  filterData.push(item);
                                }
                              });
                            }

                            this.doctorList = this.doctorList.concat(filterData);
                            // this.doctorList = _.map(_.uniqBy(this.doctorList, 'ProviderID'), function (item) {
                            //   return item;
                            // });
                            this.doctorList.filter(item => {
                              item._source.ProviderName = this.commonService.convert_case(item._source.ProviderName);
                            })
                            this.page = this.doctorList.length;
                            this.isAvailable = true;
                          }
                          else {
                            if (this.doctorList.length == 0) {
                              this.doctorList = [];
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
    // this._dataContext.GetDoctorsByKeyword(this.searchedKeyword, this.cityId, this.localityId, this.page, this.itemPerPage)
    //   .subscribe(response => {
    //     if (response.Data.Providers.length > 0) {
    //       this.doctorList = this.doctorList.concat(response.Data.Providers);
    //       this.page = this.doctorList.length;
    //       // this.doctorList = _.map(_.uniqBy(this.doctorList, 'ProviderID'), function (item) {
    //       //   return item;
    //       // });
    //       this.doctorList = _(this.doctorList)
    //         .groupBy('ProviderID')
    //         .map((value, key) => ({ 'ProviderID': key, 'ProviderName': value[0].ProviderName, 'ProviderImage': value[0].ProviderImage, 'ProviderDetails': value }))
    //         .value();
    //     }
    //   },
    //     error => {
    //       console.log(error);
    //       this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
    //     });
  }
  //Get doctors by surgery name
  getDoctorsBySurgeryName() {
    let query: any = {}
    query = this.commonService.getSurgeryByKeyword();
    query.query.bool.must[0].match._all.query = this.searchedKeyword;
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          let activelocationDetails = result;
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
                  //   //query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                  //   query.sort = [currentLocation];
                  // }
                  // else {
                  //   // if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined && activelocationDetails[0].term.City == cityFromGPSCache) {
                  //   //   query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                  //   // }
                  //   // else {
                  //   // query.aggs.by_type.aggs.tops.top_hits.sort = [];
                  //   query.sort = [];
                  //   //}
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
                  //query.sort = [currentLocation];
                  //query.query.bool.filter = query.query.bool.filter.concat(result);
                  this._dataContext.GetSurgeries(query)
                    .subscribe(response => {
                      if (response.hits.total > 0 && response.hits.hits.length > 0) {
                        let serachList = response.hits.hits;
                        let getDoctorsQuery = this.commonService.getDoctorsBySurgeryName();
                        serachList.filter(item => {
                          getDoctorsQuery.query.bool.filter[0].terms.ProviderID = getDoctorsQuery.query.bool.filter[0].terms.ProviderID.concat(item._source.SurgeryProviderID);
                        })
                        getDoctorsQuery.query.bool.filter = getDoctorsQuery.query.bool.filter.concat(activelocationDetails[0]);
                        getDoctorsQuery.from = this.page;
                        this._dataContext.GetAutocompleteSearchedData(getDoctorsQuery)
                          .subscribe(response => {
                            if (response.hits.total > 0) {
                              this.searchedResult = response.hits.hits;
                              let filterData = [];
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
                                    //item.sort[0] = item.sort[0].toFixed("1");
                                    filterData.push(item);
                                  }
                                });
                              }

                              this.doctorList = this.doctorList.concat(filterData);
                              // this.doctorList = _.map(_.uniqBy(this.doctorList, 'ProviderID'), function (item) {
                              //   return item;
                              // });
                              this.doctorList.filter(item => {
                                item._source.ProviderName = this.commonService.convert_case(item._source.ProviderName);
                              })
                              this.page = this.doctorList.length;
                              this.isAvailable = true;
                            }
                            else {
                              if (this.doctorList.length == 0) {
                                this.doctorList = [];
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
                    },
                      error => {
                        console.log(error);
                        this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
                      });
                });
              });
            });
        }
      });
  }
  //Get all the doctors and specializations based on hospital name
  getAllDoctorAndSpecs() {
    //Get all the doctors based on searched keyword
    let query: any = {};
    query = this.commonService.getDoctorListByHospitalId();
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
                  //   // else {
                  //   // query.aggs.by_type.aggs.tops.top_hits.sort = [];
                  //   //}
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
                  this._dataContext.GetAutocompleteSearchedData(query)
                    .subscribe(response => {
                      if (response.hits.total > 0) {
                        this.searchedResult = response.hits.hits;
                        let filterData = [];
                        if (activelocationDetails[0].term.City == cityFromGPSCache) {
                          this.searchedResult.filter(item => {
                            if (item._id != "" && item._id != null && item._id != undefined) {
                              if(item.fields != null && item.fields != undefined){
                                item.fields.distance[0] = item.fields.distance[0].toFixed("1");
                              }
                              filterData.push(item._source);
                            }
                          });
                        }
                        else {
                          this.searchedResult.filter(item => {
                            if (item._id != "" && item._id != null && item._id != undefined) {
                            //  item.fields.distance[0] = item.fields.distance[0].toFixed("1");
                              filterData.push(item._source);
                            }
                          });
                        }
                        this.doctorList = this.doctorList.concat(filterData);
                        this.page = this.doctorList.length;
                      }
                      else {
                        this.doctorList = [];
                        this.page = 0;
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

    // this._dataContext.GetDoctorsAndSpecsForHospital(this.groupEntityId)
    //   .subscribe(response => {
    //     if (response.Status) {
    //       this.doctorList = response.Result;//this.doctorList.concat(response.Result);
    //       this.doctorList = _(this.doctorList)
    //         .groupBy('ProviderID')
    //         .map((value, key) => ({ 'ProviderID': key, 'ProviderName': value[0].ProviderName,"HospitalName":this.searchedKeyword, 'SpecialisationDesc': "", 'SpecialisationCode': "", 'ProviderImage': value[0].ProviderImage, 'ProviderDetails': value }))
    //         .value();
    //       this.doctorList.filter(item => {
    //         item.ProviderDetails.filter(spec => {
    //           item.SpecialisationDesc = item.SpecialisationDesc + (item.SpecialisationDesc != '' ? ", " : '') + spec.SpecialisationDesc;
    //           item.SpecialisationCode = item.SpecialisationCode + (item.SpecialisationCode != '' ? ", " : '') + spec.SpecialisationCode;
    //         });
    //       })
    //       console.log(this.doctorList);
    //     }
    //   },
    //     error => {
    //       console.log(error);
    //       this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
    //     });
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
      if (this.sectionType == "Surgery") {
        this.getDoctorsBySurgeryName();
      }
      else {
        if (Number(this.groupEntityId) > 0) {
          this.getAllDoctorsByHospitalId();
        }
        else {
          this.getAllDoctors();
        }
      }
      infiniteScroll.complete();
    }, 500);
  }
  closeCurrentSection() {
    // this.viewCtrl.dismiss(true);
    this.navCtrl.pop();
  }
  bookAppointment(data) {
    // this.viewCtrl.dismiss();
    let doctorInformationDetails = {
      ProviderId: data.ProviderID,
      ProviderName: data.ProviderName,
      ProviderRating: 0,//data.ProviderAverageRating != null && data.ProviderAverageRating != "" && data.ProviderAverageRating != undefined ? data.ProviderAverageRating : 0,
      TotalRatedUser: 0,//data.ProviderTotalRatingCount != null && data.ProviderTotalRatingCount != "" && data.ProviderTotalRatingCount != undefined ? data.ProviderTotalRatingCount : 0,
      SpecializationName: data.SpecialisationDesc,
      SpecializationId: data.SpecialisationCode,
      ProviderImage: data.ProviderImage,
      City: this.selectedCityAndLocation.activeCity,
      Locality: this.selectedCityAndLocation.activeLocation,
      GroupEntityId: this.groupEntityId
    }
    this.appCtrl.getActiveNav().push("Appointment", { doctorDetails: doctorInformationDetails });
    // this.navCtrl.push("Appointment", { doctorDetails: doctorInformationDetails })
  }
  _callDoctor(data) {
    this.callNumber.callNumber(data, true)
      .then(() => {
      })
      .catch(() => {

      });
  }
  redirectTo(value, data) {
    //this.viewCtrl.dismiss();
    let providerDetails = {
      ProviderID: data.ProviderID,
      ProviderName: data.ProviderName,
      GroupEntityId: this.groupEntityId
    }
    this.appCtrl.getActiveNav().push(value, { providerInfo: providerDetails, });
    // this.navCtrl.push(value, { providerInfo: providerDetails });
  }
  showMap(latlng) {
    let url = "https://maps.google.com/maps?q=" + latlng + "&hl=es;z=14&amp;output=embed";
    const browser = this.iab.create(url, '_blank');
    browser.show();
  }
  // getCurrentLocationFromCache() {
  //   this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentLanLng"))
  //     .then((result) => {
  //       if (result) {
  //         this.currentPosition.latitude = result.lat;
  //         this.currentPosition.longitude = result.lng;
  //         this.getAddressFromCurrentLocation();
  //       }
  //       this.getCurrentLocation();
  //       // this.closeModal();
  //     });
  // }
  // getCurrentLocation() {
  //   this.geolocation.getCurrentPosition().then((resp) => {
  //     this.currentPosition.latitude = resp.coords.latitude;
  //     this.currentPosition.longitude = resp.coords.longitude;
  //   }).catch((error) => {
  //     console.log('Error getting location', error);
  //   });
  // }
}
