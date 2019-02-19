import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, NavParams, ViewController, App, ModalController, AlertController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import * as _ from "lodash";
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-doctorlist',
  templateUrl: 'doctorlist.html',
  providers: [CallNumber, InAppBrowser]
})
export class DoctorList {
  specId: number = 0;
  specName: string = "";
  searchedResult: any = [];
  doctorList: any = [];
  page: number = 0;
  groupEntityId: number = 0;
  specList: any = [];
  isAvailable: boolean = true;
  selectedSpecialization: any;
  sectionType: string = "";
  searchedKeyword: string = "";
  surgeryList: any = [];
  symptomList: any = [];
  symptomId: number = 0;
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };

  constructor(private iab: InAppBrowser, private callNumber: CallNumber, public alertCtrl: AlertController, private modalCtrl: ModalController, public appCtrl: App, private viewCtrl: ViewController, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, public navParams: NavParams) {
    this.specId = this.navParams.get('specId');
    this.specName = this.navParams.get('specName');
    this.groupEntityId = this.navParams.get('groupEntityId');
    this.specList = this.navParams.get('specList');
    this.selectedSpecialization = this.specId;
    this.sectionType = this.navParams.get('type');
    this.searchedKeyword = this.navParams.get('searchedKeyword');
    this.surgeryList = this.navParams.get('surgeryList');
    this.symptomList = this.navParams.get('symptomList');
    this.symptomId = this.navParams.get('symptomId');

    this.getCurrentLocationFromCache();
    if (this.sectionType == "Surgery") {
      this.getDoctorsBySurgeryName();
    }
    else if (this.sectionType == "Symptom") {
      this.getSpecializationsBySymptomId();
    }
    else {
      let filterResult = [];
      this.specList.filter(item => {
        filterResult.push(item._source);
      });
      this.specList = filterResult;
      this.getAllDoctorList();
    }
  }
  ionViewDidEnter() {

  }
  //Get Specialization by Symptom id
  getSpecializationsBySymptomId() {
    this._dataContext.GetSpecializationBySymptomsId(this.symptomId)
      .subscribe(response => {
        if (response) {
          this.specName = response._source.Specialization;
          this.getAllDoctorList();
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });

  }
  //Get all the doctors based on searched keyword
  getAllDoctorList() {
    let query: any = {};
    query = this.commonService.getSearchedDoctorList();
    query.query.bool.must[0].match._all.query = this.specName;
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
                                  // item.sort[0] = item.sort[0].toFixed("1");
                                  filterData.push(item);
                                }
                              });
                            }
                            this.doctorList = this.doctorList.concat(filterData);
                            this.doctorList.filter(item => {
                              item._source.ProviderName = this.commonService.convert_case(item._source.ProviderName);
                            })
                            this.page = this.doctorList.length;
                            this.isAvailable = true;
                            if (this.searchedResult.length == 0) {
                              this.getAllDoctorList();
                            }
                          }
                          else {
                            this.isAvailable = false;
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

  }
  getDoctorsBySurgeryName() {
    let query: any = {}
    query = this.commonService.getSurgeryByKeyword();
    query.query.bool.must[0].match._all.query = this.searchedKeyword;
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          let activelocationDetails = result;
          let currentAddress = result;
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
                  query.script_fields = {};
                  //query.query.bool.filter = query.query.bool.filter.concat(result);
                  this._dataContext.GetSurgeries(query)
                    .subscribe(response => {
                      if (response.hits.total > 0 && response.hits.hits.length > 0) {
                        let serachList = response.hits.hits;
                        let getDoctorsQuery: any = this.commonService.getDoctorsBySurgeryName();
                        serachList.filter(item => {
                          getDoctorsQuery.query.bool.filter[0].terms.ProviderID = getDoctorsQuery.query.bool.filter[0].terms.ProviderID.concat(item._source.SurgeryProviderID);
                        });
                        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentCityFromGPS"))
                          .then((response) => {
                            let cityFromGPSCache = response;
                            // if (activelocationDetails[0].term.City == cityFromGPSCache) {
                            //   // query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                            //   getDoctorsQuery.sort = [currentLocation];
                            // }
                            // else {
                            //   // if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined && activelocationDetails[0].term.City == cityFromGPSCache) {
                            //   //   query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                            //   // }
                            //   //else {
                            //   // query.aggs.by_type.aggs.tops.top_hits.sort = [];
                            //   // }
                            //   getDoctorsQuery.sort = [];
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
                              getDoctorsQuery.sort = [currentLocation];
                              getDoctorsQuery.script_fields = currentLocalityLatLng;
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

                                getDoctorsQuery.sort = [currentLocation];
                                getDoctorsQuery.script_fields = {};
                              }
                              else {
                                // query.aggs.by_type.aggs.tops.top_hits.sort = [];
                                getDoctorsQuery.sort = [];
                                getDoctorsQuery.script_fields = {};
                              }
                            }
                            getDoctorsQuery.query.bool.filter = getDoctorsQuery.query.bool.filter.concat(currentAddress[0]);
                            getDoctorsQuery.from = this.page;
                            getDoctorsQuery.sort = query.sort;
                            getDoctorsQuery.script_fields = query.script_fields;
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
                                  });
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
                      }
                      else {
                        this.doctorList = [];
                        this.page = 0;
                        this.isAvailable = false;
                      }
                    },
                      error => {
                        console.log(error);
                        this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
                      });
                });
            });
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
        this.doctorList = [];
        this.page = 0;
        if (this.sectionType != "Surgery") {
          this.getAllDoctorList();
        }
        else {
          this.getDoctorsBySurgeryName();
        }
      });
  }
  changeSurgery() {
    let prompt = this.alertCtrl.create();
    prompt.setTitle('Select Surgery');
    this.surgeryList.forEach(item => {
      prompt.addInput({
        type: 'radio',
        label: item.key,
        value: item.key,
        checked: item.key == this.searchedKeyword
      });
    });
    prompt.addButton('CANCEL');
    prompt.addButton({
      text: 'OK',
      handler: data => {
        this.page = 0;
        this.searchedKeyword = data;
        this.surgeryList.filter(item => {
          if (item.key == data) {
            this.searchedKeyword = item.key;
          }
        })
        this.doctorList = [];
        this.getDoctorsBySurgeryName();
      }
    });
    prompt.present();
  }
  changeSymptom() {
    let prompt = this.alertCtrl.create();
    prompt.setTitle('Select Symptom');
    this.symptomList.forEach(item => {
      prompt.addInput({
        type: 'radio',
        label: item.key,
        value: item.key,
        checked: item.key == this.searchedKeyword
      });
    });
    prompt.addButton('CANCEL');
    prompt.addButton({
      text: 'OK',
      handler: data => {
        this.page = 0;
        this.searchedKeyword = data;
        this.symptomList.filter(item => {
          if (item.key == data) {
            this.searchedKeyword = item.key;
            this.symptomId = item.SearchID;
          }
        })
        this.doctorList = [];
        this.getSpecializationsBySymptomId();
      }
    });
    prompt.present();
  }
  changeSpecialization() {
    let prompt = this.alertCtrl.create();
    prompt.setTitle('Select Specialization');
    this.specList.forEach(item => {
      prompt.addInput({
        type: 'radio',
        label: item.SpecialisationDesc,
        value: item.SpecialisationCode,
        checked: item.SpecialisationCode == this.specId
      });
    });
    prompt.addButton('CANCEL');
    prompt.addButton({
      text: 'OK',
      handler: data => {
        this.specId = data;
        this.specList.filter(item => {
          if (item.SpecialisationCode == data) {
            this.specName = item.SpecialisationDesc;
          }
        })
        this.doctorList = [];
        this.getAllDoctorList();
      }
    });
    prompt.present();
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
      City: this.selectedCityAndLocation.activeCity,
      Locality: this.selectedCityAndLocation.activeLocation,
    }
    this.appCtrl.getActiveNav().push("Appointment", { doctorDetails: doctorInformationDetails });
    // this.navCtrl.push("Appointment", { doctorDetails: doctorInformationDetails })
  }
  redirectTo(value, data) {
    let providerDetails = {
      ProviderID: data.ProviderID,
      ProviderName: data.ProviderName,
      GroupEntityId: this.groupEntityId
    }
    this.appCtrl.getActiveNav().push(value, { providerInfo: providerDetails });
    // this.navCtrl.push(value, { providerInfo: providerDetails });
  }
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      if (this.sectionType != "Surgery") {
        this.getAllDoctorList();
      }
      else {
        this.getDoctorsBySurgeryName();
      }
      infiniteScroll.complete();
    }, 500);
  }
  closeCurrentSection() {
    this.viewCtrl.dismiss(true);
  }
  _callDoctor(data) {
    this.callNumber.callNumber("9439392845", true)
      .then(() => {
      })
      .catch(() => {

      });
  }
  showMap(latlng) {
    let url = "https://maps.google.com/maps?q=" + latlng + "&hl=es;z=14&amp;output=embed";
    const browser = this.iab.create(url, '_blank');
    browser.show();
  }
}
