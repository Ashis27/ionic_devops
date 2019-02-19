import { Component, ViewChild } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { DataContext } from '../../providers/dataContext.service';
import { CommonServices } from '../../providers/common.service';
import * as $ from 'jquery';
import * as _ from "lodash";
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-bookappointment',
  templateUrl: 'bookappointment.html',
  providers: [InAppBrowser]
})
export class BookAppointment {
  @ViewChild('myinput') input;
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
  appointmentConfig: any = [];
  searchKeyword: string = "";
  searchedResult: any = [];
  hospitals: any = [];
  providers: any = [];
  popularSpecList: any = [];
  isAvailableResult: boolean = true;
  isAutoCompleteSearched: boolean = false;
  specializations: any = [];
  isSelected: number = 1;
  symptomsList: any = [];
  hospitalList: any = [];
  surgeryList: any = [];
  SpecializationList: any = [];
  page: number = 0;
  itemPerPageForSymptoms: number = 30;
  itemPerPage: number = 10;
  isSpecAvailable: boolean = true;
  isSurgeryAvailable: boolean = true;
  isHospitalAvailable: boolean = true;
  isSymptomAvailable: boolean = true;
  groupEntityId: number = 0;
  searchedPopularSearchResult: any = [];
  isSymptomsandSurgeryAvailable: boolean = true;
  isPopularSearchAvailable: boolean = true;
  constructor(private navParams: NavParams, private iab: InAppBrowser, private modalCtrl: ModalController, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {
    this.appointmentConfig = [];
    this.appointmentConfig = [
      { ModuleName: "Specialization", Image: "assets/img/bookAppointment/doctor_icon.svg" },
      { ModuleName: "Hospitals", Image: "assets/img/bookAppointment/hospital_icon.svg" },
      { ModuleName: "Symptoms", Image: "assets/img/bookAppointment/symptoms.svg" },
      { ModuleName: "Surgeries", Image: "assets/img/bookAppointment/surgery-icon.svg" }
    ];
    this.searchKeyword = this.navParams.get('searchKeyword');
    //this.getAppointmentCofig();
    this.getSpecializationList();
  }
  ionViewDidEnter() {
    setTimeout(() => {
      this.input.setFocus();
    });
    this.getCurrentLocationFromCache();
    this.commonService.onEntryPageEvent("Book appointment start");
  }
  //Get Book Appointment cofiguration from cache
  getAppointmentCofig() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getAppoConfig"))
      .then((result) => {
        if (result) {
          this.appointmentConfig = result;
          this.getAppointmentConfig(0);
        }
        else {
          this.getAppointmentConfig(1);
          // this.dashBoardConfig = result
        }
      });
  }
  //Get Book Appointment cofiguration from server
  getAppointmentConfig(value) {
    this._dataContext.GetSliderConfig("BookAppointment", value)
      .subscribe(response => {
        let result: any = response;
        // $(".horizontal-list-circle-menu-image").removeClass("active-back pulse");
        // $(".Specialization").addClass("active-back pulse");
        this.getSpecializationList();
        if (result.Result == "Success") {
          this.appointmentConfig = result.Data;
          this.appointmentConfig.reverse();
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getAppoConfig"), this.appointmentConfig);
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
  //Search all the dotors, hospitals, specializations based on keywords.
  searchResultByKeyword() {
    if (this.searchKeyword.length > 1) {
      $(".horizontal-list-circle-menu-image").removeClass("active-back pulse");
      this.getSymptomsSearchByKeyword();
      let query: any = {}
      query = this.commonService.getAllSearchData();
      query.query.bool.must[0].match._all.query = this.searchKeyword;
      this.commonService.checkActiveCityAndLocality()
        .then((result) => {
          if (result.length > 0) {
            let activelocationDetails = result;
            query.query.bool.filter = query.query.bool.filter.concat(activelocationDetails[0]);
            let currentLocation = {};
            let currentLocalityLatLng: any = {};
            let locationlatlng: any = {};
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
                          // if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined) {
                          //   query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                          //   query.aggs.by_type.aggs.tops.top_hits.script_fields = currentLocalityLatLng;
                          // }
                          // else {
                          query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                          query.aggs.by_type.aggs.tops.top_hits.script_fields = currentLocalityLatLng;
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
                            query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                            query.aggs.by_type.aggs.tops.top_hits.script_fields = {};
                          }
                          else {
                            // query.aggs.by_type.aggs.tops.top_hits.sort = [];
                            query.aggs.by_type.aggs.tops.top_hits.script_fields = {};
                            query.aggs.by_type.aggs.tops.top_hits.sort = [];
                          }
                        }
                        this._dataContext.GetAutocompleteSearchedData(query)
                          .subscribe(response => {
                            if (response.hits.total > 0) {
                              this.searchedResult = response.aggregations.by_type.buckets;
                              this.hospitals = [];
                              this.providers = [];
                              let filterData = [];
                              let hos_filterData = [];
                              this.searchedResult.filter(item => {
                                if (item.key === "10") {
                                  if (activelocationDetails[0].term.City == cityFromGPSCache) {
                                    item.tops.hits.hits.filter(result => {
                                      result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                      filterData.push(result);
                                    });
                                  }
                                  else {
                                    // if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined && activelocationDetails[0].term.City == cityFromGPSCache) {
                                    //   item.tops.hits.hits.filter(result => {
                                    //     result.sort[0] = result.sort[0].toFixed("1");
                                    //     filterData.push(result);
                                    //   });
                                    // }
                                    // else {
                                    item.tops.hits.hits.filter(result => {
                                      // result.sort[0] = result.sort[0].toFixed("1");
                                      filterData.push(result);
                                    });
                                    //}
                                  }
                                  this.providers = filterData;
                                  // this.providers = _.map(_.uniqBy(this.providers, 'ProviderID'), function (item) {
                                  //   return item;
                                  // });
                                  this.providers.filter(item => {
                                    item._source.ProviderName = this.commonService.convert_case(item._source.ProviderName);
                                  })
                                }
                                else {
                                  if (activelocationDetails[0].term.City == cityFromGPSCache) {
                                    item.tops.hits.hits.filter(result => {
                                      result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                      hos_filterData.push(result);
                                    });
                                  }
                                  else {
                                    // if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined && activelocationDetails[0].term.City == cityFromGPSCache) {
                                    //   item.tops.hits.hits.filter(result => {
                                    //     result.sort[0] = result.sort[0].toFixed("1");
                                    //     hos_filterData.push(result);
                                    //   });
                                    // }
                                    // else {
                                    item.tops.hits.hits.filter(result => {
                                      // result.sort[0] = result.sort[0].toFixed("1");
                                      hos_filterData.push(result);
                                    });
                                    // }
                                  }
                                  this.hospitals = hos_filterData;
                                  // this.hospitals = item.tops.hits.hits;
                                }
                              });

                              //this.providers = this.searchedResult.Providers;
                              this.isAutoCompleteSearched = true;
                              this.isSelected = 0;
                            }
                            else {
                              this.hospitals = [];
                              this.providers = [];
                              this.isAvailableResult = false;
                              this.isSelected = 0;
                              this.page = 0;
                            }
                            console.log(response.hits.hits);
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
            this.getLocation();
          }
        });
    }
    else if (this.searchKeyword.length == 0) {
      this.hospitals = [];
      this.providers = [];
      this.symptomsList = [];
      this.surgeryList = [];
      this.isSelected = 1;
      $(".horizontal-list-circle-menu-image").removeClass("active-back pulse");
      $(".Specialization").addClass("active-back pulse");
      this.getSpecializationList();
    }

    // this._dataContext.GetAutoCompleteSearch(this.searchKeyword.toLowerCase(), this.selectedCityAndLocation.activeCityKey, this.selectedCityAndLocation.activeLocationKey)
    //   .subscribe(response => {
    //     $(".horizontal-list-circle-menu-image").removeClass("active-back pulse");
    //     this.isSelected = 0;
    //     if (response.Data.Hospitals.length > 0 || response.Data.Providers.length > 0) {
    //       this.searchedResult = response.Data;
    //       this.hospitals = this.searchedResult.Hospitals;
    //       this.providers = this.searchedResult.Providers;
    //       this.isAutoCompleteSearched = true;
    //     }
    //     else {
    //       this.hospitals = [];
    //       this.providers = [];
    //       this.isAvailableResult = false;
    //     }
    //   },
    //     error => {
    //       console.log(error);
    //       this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
    //     });
  }

  //Get popular specializations list
  getSpecializationList() {
    this.isSelected = 1;
    this.searchedResult = [];
    let query: any = {}
    query = this.commonService.getSearchedSpecializationList();
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          query.query.bool.filter = query.query.bool.filter.concat(result[0]);
          query.from = this.page;
          this._dataContext.GetAutocompleteSearchedData(query)
            .subscribe(response => {
              if (response.hits.total > 0) {
                this.searchedResult = response.aggregations.by_type.buckets;
                let filterData = [];
                this.searchedResult.filter(item => {
                  if (item.key != "" && item.key != null && item.key != undefined) {
                    filterData.push(item.tops.hits.hits[0]);
                  }
                });
                this.SpecializationList = filterData;//this.SpecializationList.concat(filterData);
                if (this.SpecializationList.length > 0) {
                  this.isSpecAvailable = true;
                }
                else {
                  this.isSpecAvailable = false;
                }
                this.page = this.SpecializationList.length;

              }
              else {
                this.SpecializationList = [];
                this.page = 0;
                this.isSpecAvailable = false;
              }
            },
              error => {
                console.log(error);
                this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
              });
        }
        else {
          //   this.getLocation();
        }
      });
    // this._dataContext.GetSpecializationList(this.page, this.itemPerPage)
    //   .subscribe(response => {
    //     if (response.Result.length > 0) {
    //       this.SpecializationList = this.SpecializationList.concat(response.Result);
    //       // this.page = this.SpecializationList.length;
    //       this.page++;
    //       this.SpecializationList = _.map(_.uniqBy(this.SpecializationList, 'SearchKey'), function (item) {
    //         return item;
    //       });
    //     }
    //   },
    //     error => {
    //       console.log(error);
    //       this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
    //     });

  }
  getSymptomsSearchByKeyword() {
    let query: any = {}
    query = this.commonService.getAllSearchSymptomList();
    query.query.bool.must[0].match._all.query = this.searchKeyword;
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          // query.query.bool.filter = query.query.bool.filter.concat(result);
          this._dataContext.GetSymptomsByKeyword(query)
            .subscribe(response => {
              this.getSurgeryBySearchedKeyword();
              if (response.hits.total > 0) {
                let searchedList = response.aggregations.by_type.buckets[0];
                let filterData = [];
                searchedList.tops.hits.hits.filter(item => {
                  filterData.push(item._source);
                });
                this.symptomsList = filterData;
                this.page = this.symptomsList.length;
                this.isSymptomsandSurgeryAvailable = true;
              }
              else {
                this.symptomsList = [];
                this.page = 0;
                this.isSymptomsandSurgeryAvailable = false;
              }
            },
              error => {
                console.log(error);
                this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
              });
        }
        else {
          this.getLocation();
        }
      });

  }

  //Get surgeries by searched keyword
  getSurgeryBySearchedKeyword() {
    this.searchedResult = [];
    let query: any = {}
    query = this.commonService.getSurgeryByGenericSearchKeyword();
    query.query.bool.must[0].match._all.query = this.searchKeyword;
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          //query.query.bool.filter = query.query.bool.filter.concat(result);
          // query.from = this.page;
          this._dataContext.GetSurgeries(query)
            .subscribe(response => {
              if (response.hits.total > 0) {
                this.searchedResult = response.hits.hits;
                let filterData = [];
                this.searchedResult.filter(item => {
                  item._source["key"] = item._source.Surgery;
                  filterData.push(item._source);
                });
                this.surgeryList = filterData;
                this.surgeryList = _.map(_.uniqBy(this.surgeryList, 'Surgery'), function (item) {
                  return item;
                });
                //this.surgeryList.concat(filterData);
                this.page = this.surgeryList.length;
                this.isSymptomsandSurgeryAvailable = true;
              }
              else {
                this.surgeryList = [];
                this.page = 0;
                this.isSymptomsandSurgeryAvailable = false;
              }
            },
              error => {
                console.log(error);
                this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
              });
        }
        else {
          this.getLocation();
        }
      });


  }
  //Get Popular Symptoms List from cache
  getPopularSymptomListFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPopularSymptomsSearch"))
      .then((result) => {
        if (result) {
          this.searchedPopularSearchResult = result;
          this.getSymptomsList(0);
        }
        else {
          this.searchedPopularSearchResult = [];
          this.getSymptomsList(1);
        }
      });
  }
  //Get Popular Surgery List from cache
  getPopularSurgeryListFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPopularSymptomsSurgery"))
      .then((result) => {
        if (result) {
          this.searchedPopularSearchResult = result;
          this.getSurgeryList(0);
        }
        else {
          this.searchedPopularSearchResult = [];
          this.getSurgeryList(1);
        }
      });
  }
  //Get all symptoms list
  getSymptomsList(value) {
    this.isSelected = 2;
    this._dataContext.GetPopularSearch(value, 4)
      .subscribe(response => {
        if (response.Status && response.Result.length > 0) {
          this.searchedPopularSearchResult = response.Result;
          //his.page = this.searchedPopularSearchResult.length;
          this.searchedPopularSearchResult.filter(item => {
            item["key"] = item.SearchText;
          });
          this.searchedPopularSearchResult = _.map(_.uniqBy(this.searchedPopularSearchResult, 'SearchID'), function (item) {
            return item;
          });
          this.isPopularSearchAvailable = true;
        }
        else {
          this.isPopularSearchAvailable = false;
          this.searchedPopularSearchResult = [];
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  //Get all the surgery list 
  getSurgeryList(value) {
    this.isSelected = 4;
    this._dataContext.GetPopularSearch(value, 5)
      .subscribe(response => {
        if (response.Status && response.Result.length > 0) {
          this.searchedPopularSearchResult = response.Result;
          //his.page = this.searchedPopularSearchResult.length;
          this.searchedPopularSearchResult.filter(item => {
            item["key"] = item.SearchText;
          });
          this.searchedPopularSearchResult = _.map(_.uniqBy(this.searchedPopularSearchResult, 'SearchID'), function (item) {
            return item;
          });
          this.isPopularSearchAvailable = true;
        }
        else {
          this.isPopularSearchAvailable = false;
          this.searchedPopularSearchResult = [];
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });


  }
  slectedSpecialization(value) {
    // let addModal = this.modalCtrl.create("DoctorList", { specId: value.SpecialisationCode, specName: value.SpecialisationDesc, groupEntityId: 0, specList: this.SpecializationList });
    // addModal.onDidDismiss(item => {
    //   if (item) {
    //     console.log(item);
    //   }
    //   this.getCurrentLocationFromCache();
    // })
    // addModal.present();
    this.navCtrl.push("DoctorList", { specId: value.SpecialisationCode, specName: value.SpecialisationDesc, groupEntityId: 0, specList: this.SpecializationList });
  }
  //Get all symptoms list
  getHospitalList() {
    this.isSelected = 3;
    this.searchedResult = [];
    let query: any = {}
    query = this.commonService.getSearchedHospitalList();
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          let activelocationDetails = result;
          query.query.bool.filter = query.query.bool.filter.concat(activelocationDetails[0]);
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
                      // // query.sort = [currentLocation];
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
                            this.searchedResult = response.hits.hits;
                            if (activelocationDetails[0].term.City == cityFromGPSCache) {
                              this.searchedResult.filter(item => {
                                if(item.fields != null && item.fields != undefined){
                                  item.fields.distance[0] = item.fields.distance[0].toFixed("1");
                                }
                              });
                            }
                            this.hospitalList = this.hospitalList.concat(this.searchedResult);
                            this.page = this.hospitalList.length;
                            this.isHospitalAvailable = true;
                          }
                          else {
                            this.hospitalList = [];
                            this.page = 0;
                            this.isHospitalAvailable = false;
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
          this.getLocation();
        }
      });

  }

  //get details while selecting the menu item
  getSelectedDetails(item) {
    this.searchKeyword = "";
    this.symptomsList = [];
    this.SpecializationList = [];
    this.hospitalList = [];
    this.surgeryList = [];
    this.searchedPopularSearchResult = [];
    this.page = 0;
    this.itemPerPage = 20;
    $(".horizontal-list-circle-menu-image").removeClass("active-back pulse");
    $(event.currentTarget).addClass("active-back pulse");
    this.getActiveDetails(item.ModuleName);
  }
  //Get data while scrolling for paggination.
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      if ((this.searchKeyword == "" || this.searchKeyword == null || this.searchKeyword == undefined) && this.isSelected != 2 && this.isSelected != 4) {
        this.getActiveSection();
      }
      infiniteScroll.complete();
    }, 1000);
  }
  getActiveSection() {
    if (this.isSelected == 1) {
      this.getSpecializationList();
    }
    else if (this.isSelected == 2) {
      this.getPopularSymptomListFromCache();
    }
    else if (this.isSelected == 3) {
      this.getHospitalList();
    }
    else if (this.isSelected == 4) {
      this.getPopularSurgeryListFromCache();
    }
    else {
      this.searchResultByKeyword();
    }
  }
  selectAllText(event) {
    if (event.target.value) {
      event.target.select();
    }
  }
  getActiveDetails(value) {
    switch (value) {
      case "Symptoms":
        this.getPopularSymptomListFromCache();
        break;
      case "Specialities":
      case "Specialization":
        this.getSpecializationList();
        break;
      case "Hospitals":
      case "clinic/Hospitals":
        this.getHospitalList();
        break;
      case "Surgeries":
        this.getPopularSurgeryListFromCache();
        break;
      default:
        break;
    }
  }
  storeLocationResultInCache() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: this.selectedCityAndLocation.activeCity, activeLocation: this.selectedCityAndLocation.activeLocation, activeCityKey: this.selectedCityAndLocation.activeCityKey, activeLocationKey: this.selectedCityAndLocation.activeLocationKey })
      .then((result) => {
        this.symptomsList = [];
        this.surgeryList = [];
        this.SpecializationList = [];
        this.hospitalList = [];
        this.page = 0;
        this.itemPerPage = 20;
        this.getActiveSection();
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
  seeAllDoctors() {
    // let addModal = this.modalCtrl.create("SeeAllDoctors", { searchKeyword: this.searchKeyword, cityId: this.selectedCityAndLocation.activeCityKey, localityId: this.selectedCityAndLocation.activeLocationKey, doctors: this.providers, groupEntityId: 0, searchStatus: true, type: 'Doctor' });
    // addModal.onDidDismiss(item => {
    //   if (item) {
    //     console.log(item);
    //     this.getCurrentLocationFromCache();
    //   }
    // })
    // addModal.present();
    this.navCtrl.push("SeeAllDoctors", { searchKeyword: this.searchKeyword, cityId: this.selectedCityAndLocation.activeCityKey, localityId: this.selectedCityAndLocation.activeLocationKey, doctors: this.providers, groupEntityId: 0, searchStatus: true, type: 'Doctor' });
  }
  seeAllHospitals() {
    // let addModal = this.modalCtrl.create("SeeAllHospitals", { searchKeyword: this.searchKeyword, cityId: this.selectedCityAndLocation.activeCityKey, localityId: this.selectedCityAndLocation.activeLocationKey, hospitals: this.hospitals });
    // addModal.onDidDismiss(item => {
    //   if (item) {
    //     console.log(item);
    //     this.getCurrentLocationFromCache();
    //   }
    // })
    // addModal.present();
    this.navCtrl.push("SeeAllHospitals", { searchKeyword: this.searchKeyword, cityId: this.selectedCityAndLocation.activeCityKey, localityId: this.selectedCityAndLocation.activeLocationKey, hospitals: this.hospitals });

  }
  closeCurrentSection() {
    // this.navCtrl.setRoot("DashBoard");
    this.navCtrl.pop();
  }
  bookAppointment(data) {
    let doctorInformationDetails = {
      ProviderId: data.ProviderID,
      ProviderName: data.ProviderName,
      ProviderRating: 0,//data.ProviderAverageRating != null && data.ProviderAverageRating != "" && data.ProviderAverageRating != undefined ? data.ProviderAverageRating : 0,
      TotalRatedUser: 0,//data.ProviderTotalRatingCount != null && data.ProviderTotalRatingCount != "" && data.ProviderTotalRatingCount != undefined ? data.ProviderTotalRatingCount : 0,
      SpecializationName: data.SpecialisationDesc,
      SpecializationId: data.SpecialisationCode,
      ProviderImage: data.ProviderImage,
      ProviderFees: data.ProviderFees,
      Contact: data.Contact,
      City: this.selectedCityAndLocation.activeCity,
      Locality: this.selectedCityAndLocation.activeLocation,
      GroupEntityId: this.groupEntityId
    }
    this.navCtrl.push("Appointment", { doctorDetails: doctorInformationDetails })
  }
  redirectTo(value, data) {
    if (value == "SurgeryList") {
      // let addModal = this.modalCtrl.create("DoctorList", { searchedKeyword: data.key, surgeryList: this.searchedPopularSearchResult, groupEntityId: 0, type: "Surgery" });
      // addModal.onDidDismiss(item => {
      //   if (item) {
      //     console.log(item);
      //     this.getCurrentLocationFromCache();
      //   }
      //   this.getCurrentLocationFromCache();
      // })
      // addModal.present();
      this.navCtrl.push("DoctorList", { searchedKeyword: data.key, surgeryList: this.searchedPopularSearchResult, groupEntityId: 0, type: "Surgery" });

    }
    else if (value == "SymptomList") {
      // let addModal = this.modalCtrl.create("DoctorList", { searchedKeyword: data.key, symptomList: this.searchedPopularSearchResult, groupEntityId: 0, type: "Symptom", symptomId: data.SearchID });
      // addModal.onDidDismiss(item => {
      //   if (item) {
      //     console.log(item);
      //     this.getCurrentLocationFromCache();
      //   }
      //   this.getCurrentLocationFromCache();
      // })
      // addModal.present();
      this.navCtrl.push("DoctorList", { searchedKeyword: data.key, symptomList: this.searchedPopularSearchResult, groupEntityId: 0, type: "Symptom", symptomId: data.SearchID });

    }
    else {
      //To resole navbar issue for ionic ios for customize page.
      this.navCtrl.push(value, { providerInfo: data });
    }
  }
  getDoctorsBySymptoms(value, data) {
    // let addModal = this.modalCtrl.create("SeeAllDoctors", { searchedSymptoms: data.PrimarySymptom, searchKeyword: data.Specialization, cityId: this.selectedCityAndLocation.activeCityKey, localityId: this.selectedCityAndLocation.activeLocationKey, groupEntityId: 0, searchStatus: false, type: 'Symptom' });
    // addModal.onDidDismiss(item => {
    //   if (item) {
    //     console.log(item);
    //     this.getCurrentLocationFromCache();
    //   }
    // })
    // addModal.present();
    this.navCtrl.push("SeeAllDoctors", { searchedSymptoms: data.PrimarySymptom, searchKeyword: data.Specialization, cityId: this.selectedCityAndLocation.activeCityKey, localityId: this.selectedCityAndLocation.activeLocationKey, groupEntityId: 0, searchStatus: false, type: 'Symptom' });
  }
  getDoctorsBySurgery(value, data) {
    // let addModal = this.modalCtrl.create("SeeAllDoctors", { searchKeyword: data.Surgery, cityId: this.selectedCityAndLocation.activeCityKey, localityId: this.selectedCityAndLocation.activeLocationKey, groupEntityId: 0, searchStatus: true, type: 'Surgery' });
    // addModal.onDidDismiss(item => {
    //   if (item) {
    //     console.log(item);
    //     this.getCurrentLocationFromCache();
    //   }
    // })
    // addModal.present();
    this.navCtrl.push("SeeAllDoctors", { searchKeyword: data.Surgery, cityId: this.selectedCityAndLocation.activeCityKey, localityId: this.selectedCityAndLocation.activeLocationKey, groupEntityId: 0, searchStatus: true, type: 'Surgery' });
  }
  showMap(latlng) {
    let url = "https://maps.google.com/maps?q=" + latlng + "&hl=es;z=14&amp;output=embed";
    const browser = this.iab.create(url, '_blank');
    browser.show();
  }
}
