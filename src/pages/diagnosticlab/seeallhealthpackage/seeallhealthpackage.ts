import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavParams, NavController, ViewController, App, ModalController } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import * as _ from "lodash";
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-seeallhealthpackage',
  templateUrl: 'seeallhealthpackage.html',
  providers: [CallNumber,InAppBrowser]
})
export class SeeAllHealthPackage {
  searchedKeyword: string;
  cityId: string;
  localityId: string;
  packageList: any = [];
  page: number = 0;
  start: number = 0;
  itemPerPage: number = 20;
  searchStatus: boolean = false;
  groupEntityId: number = 0;
  isAvailable: boolean = true;
  searchedResult: any = [];
  searchedSymptoms: string;
  sectionType: string;
  addedPackage: any = [];
  countList: any = []; any = [];
  addedPackageAndTestInCart: any = [];
  showAddedPackageCount: number = 0;
  selectedDiagnosticCenter: any;
  packageCount: number = 0;
  userId: number = 0;
  maxPrice: number = 10000;
  minPrice: number = 0;
  selectedPrice: number = 0;
  checkedGenders = [];
  ageGroups: any = [];
  checkedAgeGroups = [];
  genderTabValue: string = "All";
  filterObj: any = {
    gender: "",
    age: "",
    minPrice: 0,
    maxPrice: 0
  };
  filterResult: any = {
    minPrice: 0,
    maxPrice: 10000,
    age: 5,
    gender: 3,
    orderBy: []
  };
  bookingDCOrder: any = [];
  addedItemInCartCount: number = 0;
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };

  constructor(private iab: InAppBrowser,public modalCtrl: ModalController, public popoverCtrl: PopoverController, private callNumber: CallNumber, public appCtrl: App, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController, public navParams: NavParams) {
    this.searchedKeyword = this.navParams.get('searchKeyword');
    //this.packageList = this.navParams.get('packages');
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getFilterData"), false);
  }
  ionViewDidEnter() {
    this.page = 0;
    this.packageList = [];
    this.addedPackage = [];
    this.countList = [];
    this.showAddedPackageCount = 0;
    this.getUserInfo();
    //this.addedPackage = [];
    //this.packageList = [];
    // this.countList = [];

  }
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getAddedPackageFromCart();
          this.getCurrentLocationFromCache();
          if (this.searchedKeyword != "" && this.searchedKeyword != undefined && this.searchedKeyword != null) {
            this.getAllPackages();
          }
          // else {
          //   this.getDefaultPackages();
          // }
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  getAddedPackageFromCart() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId)
      .then((result) => {
        if (result && result.length > 0) {
          this.addedPackageAndTestInCart = result;
          this.addedPackageAndTestInCart.filter(item => {
            if (item.Package.length > 0) {
              item.Package.filter(item => {
                this.countList.push(item);
              });
            }
            if (item.LabTest.length > 0) {
              item.LabTest.filter(item => {
                this.countList.push(item);
              });
            }
            if (item.LabScan.length > 0) {
              item.LabScan.filter(item => {
                this.countList.push(item);
              });
            }
            if (item.LabProfile.length > 0) {
              item.LabProfile.filter(item => {
                this.countList.push(item);
              });
            }
          });
          this.packageCount = this.countList.length;
          this.showAddedPackageCount = this.countList.length;
          this.addedItemInCartCount = this.showAddedPackageCount;
        }
        else {
          this.addedPackageAndTestInCart = [];
          this.showAddedPackageCount = 0;
          this.addedItemInCartCount = 0;
        }
      });
  }
  //Get all the packages based on searched keyword
  getAllPackages() {
    this.searchedResult = [];
    let query: any = {}
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
                      //Filter and sorting 
                      if (this.filterResult.age != 5) {
                        query.query.bool.must.push({ "match": { "AgeGroup": this.filterResult.age } });
                      }
                      if (this.filterResult.gender != 3) {
                        query.query.bool.must.push({ "match": { "Gender": this.filterResult.gender } });
                      }
                      query.query.bool.must.push({ "range": { "PriceAfterDiscount": { "gte": this.filterResult.minPrice, "lte": this.filterResult.maxPrice } } });
                      if (this.filterResult.orderBy.length > 0) {
                        let sort_status = this.filterResult.orderBy[0].OrderByDesc ? "desc" : "asc";
                        query.sort = [{ "PriceAfterDiscount": { "order": sort_status } }];
                      }
                      this._dataContext.GetDCHealthPackages(query)
                        .subscribe(response => {
                          if (response.hits.total > 0) {
                            this.searchedResult = response.hits.hits;
                            let filterData = [];
                            // this.searchedResult.filter(item => {
                            //   if (item._id != "" && item._id != null && item._id != undefined) {
                            //     filterData.push(item._source);
                            //   }
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
                            this.packageList = this.packageList.concat(response.hits.hits);
                            this.packageList.filter(item => {
                              item._source.GenericDiscount = Math.floor(Number(item._source.GenericDiscount));
                              item._source.Price = Math.floor(Number(item._source.Price));
                              item._source.PriceAfterDiscount = Math.floor(Number(item._source.PriceAfterDiscount));
                              item._source.LabPackageName = this.commonService.convert_case(item._source.LabPackageName);
                              item._source.CenterName = this.commonService.convert_case(item._source.CenterName);
                              item._source.CityAreaName = this.commonService.convert_case(item._source.CityAreaName);
                            })
                            this.page = this.packageList.length;
                            this.isAvailable = true;
                          }
                          else {
                            if (this.packageList.length == 0) {
                              this.packageList = [];
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
  BookPackage(data) {
    let DiagnosticCenterName: any = {};
    let tempPackage = [];
    tempPackage.push(data);
    DiagnosticCenterName.CenterID = data.CenterID
    DiagnosticCenterName.CityAreaName = data.CityAreaName;
    DiagnosticCenterName.City = data.City;
    DiagnosticCenterName.CenterName = data.CenterName;
    DiagnosticCenterName.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    this.addedPackage =
      {
        DiagnosticCenterName: DiagnosticCenterName,
        Package: tempPackage
      }
    this.navCtrl.push("DiagnosticLabBooking", { providerInfo: this.addedPackage });
  }

  selectedPackage(data) {
    let DiagnosticCenterName: any = {};
    DiagnosticCenterName.CenterID = data.CenterID
    DiagnosticCenterName.CityAreaName = data.CityAreaName;
    DiagnosticCenterName.City = data.City;
    DiagnosticCenterName.CenterName = data.CenterName;
    DiagnosticCenterName.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    let testList = data.TestList.split("|");
    let indivisualTestName: any = [];
    testList.filter(item => {
      indivisualTestName.push({ TestName: item });
    })
    data["IndividualTests"] = indivisualTestName;
    data["PackageDescription"] = "";
    //this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart"), this.addedPackage).then(response => {
    this.navCtrl.push("PackageDetail", { selectedCenter: DiagnosticCenterName, selectedPackage: data });
    // })
  }
  ionViewWillLeave() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart);
  }
  filterPopover(myEvent) {
    let popover = this.popoverCtrl.create("FilterPopover");
    popover.present({
      ev: myEvent
    });
  }
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      if (this.searchedKeyword != "" && this.searchedKeyword != undefined && this.searchedKeyword != null) {
        this.getAllPackages();
      }
      infiniteScroll.complete();
    }, 500);
  }
  closeCurrentSection() {
    // this.viewCtrl.dismiss(true);
    this.navCtrl.pop();
  }
  _callr(data) {
    this.callNumber.callNumber(data, true)
      .then(() => {
      })
      .catch(() => {

      });
  }
  redirectTo(value, data) {
    this.appCtrl.getActiveNav().push(value, { providerInfo: data });
  }
  getPackageAgeGroupsListFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl('getAgeGroup')).then((data) => {
      if (data != "" && data != undefined && data.length > 0) {
        this.ageGroups = data;
        this.getPackageAgeGroups(0);
      }
      else {
        this.getPackageAgeGroups(1);
      }
    });
  }
  getPackageAgeGroups(value) {
    this._dataContext.GetPackageAgeGroups(value)
      .subscribe(response => {
        if (response.length > 0) {
          this.ageGroups = response;
        }
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl('getAgeGroup'), this.ageGroups);
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve age group.", 0);
        });
  }
  filterByAgeGroup(value) {
    this.filterObj.age = value;
  }
  filterByGender(value) {
    this.filterObj.gender = value;
  }
  setChangePrice(price) {
    this.filterObj.minPrice = price.lower;
    this.filterObj.maxPrice = price.upper;
  }
  applyFilter() {

  }
  goToCart() {
    this.navCtrl.push("AddtoCart");
  }
  selectedHealthPackage(data) {
    let DiagnosticCenter: any = {};
    DiagnosticCenter.CenterID = data.GroupEntityId;
    DiagnosticCenter.CityAreaName = data.CityAreaName;
    DiagnosticCenter.City = data.City;
    DiagnosticCenter.CenterName = data.CenterName;
    DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    DiagnosticCenter.LatLng = data.Latlong;
    this.navCtrl.push("HealthPackageProfile", { selectedCenter: DiagnosticCenter, selectedPackage: data });
  }
  bookHealthPackage(data) {
    let DiagnosticCenter: any = {};
    let tempPackage = [];
    tempPackage.push(data);
    DiagnosticCenter.CenterID = data.GroupEntityId
    DiagnosticCenter.CityAreaName = data.CityAreaName;
    DiagnosticCenter.City = data.City;
    DiagnosticCenter.CenterName = data.CenterName;
    DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    DiagnosticCenter.LatLng = data.Latlong;
    this.bookingDCOrder =
      {
        DiagnosticCenter: DiagnosticCenter,
        Package: tempPackage,
        LabTest: [],
        LabScan: [],
        LabProfile: []
      }
    this.navCtrl.push("DiagnosticLabBooking", { BookingDCInfo: this.bookingDCOrder });
  }
  addPackageInDC(filteredDC, data) {
    if (filteredDC.Package.length > 0) {
      let isPackageAdded = false;
      filteredDC.Package.filter(function (pck) {
        if (Number(pck.LabPackageId) === Number(data.LabPackageId)) {
          isPackageAdded = true;
        }
      });
      if (isPackageAdded) {
        this.commonService.onMessageHandler("This Package is already in your cart", 0);
      }
      else {
        this.addedItemInCartCount++;
        filteredDC.Package.push(data);
        this.commonService.onMessageHandler("Successfully added this package in your cart", 1);
      }
    }
    else {
      this.addedItemInCartCount++;
      this.commonService.onMessageHandler("Successfully added this package in your cart", 1);
      filteredDC.Package.push(data);
    }
    return filteredDC;
  }
  addTestInDC(filteredDC, data) {
    if (filteredDC.LabTest.length > 0) {
      let isTestAdded = false;
      filteredDC.LabTest.filter(function (test) {
        if (Number(test.LabTestId) === Number(data.LabTestId)) {
          isTestAdded = true;
        }
      });
      if (isTestAdded) {
        this.commonService.onMessageHandler("This Test is already in your cart", 0);
      }
      else {
        this.addedItemInCartCount++;
        this.commonService.onMessageHandler("Successfully added this test in your cart", 1);
        filteredDC.LabTest.push(data);
      }
    }
    else {
      this.addedItemInCartCount++;
      this.commonService.onMessageHandler("Successfully added this test in your cart", 1);
      filteredDC.LabTest.push(data);
    }
    return filteredDC;
  }
  addScanInDC(filteredDC, data) {
    if (filteredDC.LabScan.length > 0) {
      let isScanAdded = false;
      filteredDC.LabScan.filter(function (Scan) {
        if (Number(Scan.LabTestId) === Number(data.LabTestId)) {
          isScanAdded = true;
        }
      });
      if (isScanAdded) {
        this.commonService.onMessageHandler("This Scan is already in your cart", 0);
      }
      else {
        this.addedItemInCartCount++;
        this.commonService.onMessageHandler("Successfully added this Scan in your cart", 1);
        filteredDC.LabScan.push(data);
      }
    }
    else {
      this.addedItemInCartCount++;
      this.commonService.onMessageHandler("Successfully added this Scan in your cart", 1);
      filteredDC.LabScan.push(data);
    }
    return filteredDC;
  }
  addLabProfileInDC(filteredDC, data) {
    if (filteredDC.LabProfile.length > 0) {
      let isScanAdded = false;
      filteredDC.LabProfile.filter(function (labProfile) {
        if (Number(labProfile.LabProfileId) === Number(data.LabProfileId)) {
          isScanAdded = true;
        }
      });
      if (isScanAdded) {
        this.commonService.onMessageHandler("This lab profile is already in your cart", 0);
      }
      else {
        this.addedItemInCartCount++;
        this.commonService.onMessageHandler("Successfully added this lab profile in your cart", 1);
        filteredDC.LabProfile.push(data);
      }
    }
    else {
      this.addedItemInCartCount++;
      this.commonService.onMessageHandler("Successfully added this lab profile in your cart", 1);
      filteredDC.LabProfile.push(data);
    }
    return filteredDC;
  }
  addToCart(data, type) {
    let centerStatus = 0;
    let filteredDC: any = {};
    let selectedDCIndex = 0;
    this.addedPackageAndTestInCart.filter(item => {
      if (Number(item.DiagnosticCenter.CenterID) === Number(data.GroupEntityId)) {
        centerStatus++;
        selectedDCIndex = item.Id;
        filteredDC = item;
      }
    });
    if (centerStatus > 0) {
      switch (type) {
        case "Package":
          filteredDC = this.addPackageInDC(filteredDC, data);
          break;
        case "Test":
          filteredDC = this.addTestInDC(filteredDC, data);
          break;
        case "Scan":
          filteredDC = this.addScanInDC(filteredDC, data);
          break;
        case "LabProfile":
          filteredDC = this.addLabProfileInDC(filteredDC, data);
          break;
        default:
          break;
      }
      this.addedPackageAndTestInCart.filter(item => {
        if (Number(item.DiagnosticCenter.CenterID) === Number(data.GroupEntityId)) {
          item = filteredDC;
        }
      });
    }
    else {
      this.bookingDCOrder = [];
      let tempPackage = [];
      let tempTest = [];
      let tempScan = [];
      let tempLabProfile = [];
      let DiagnosticCenter: any = {};
      this.addedItemInCartCount++;
      if (type == "Package") {
        tempPackage.push(data);
      }
      else if (type == "Test") {
        tempTest.push(data);
      }
      else if (type == "Scan") {
        tempScan.push(data);
      }
      else {
        type = "Lab Profile"
        //lab profile will be added
        tempLabProfile.push(data);
      }
      DiagnosticCenter.CenterID = data.GroupEntityId
      DiagnosticCenter.CityAreaName = data.CityAreaName;
      DiagnosticCenter.City = data.City;
      DiagnosticCenter.CenterName = data.CenterName;
      DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
      DiagnosticCenter.LatLng = data.Latlong;
      this.bookingDCOrder.push(
        {
          DiagnosticCenter: DiagnosticCenter,
          Package: tempPackage,
          LabTest: tempTest,
          LabScan: tempScan,
          LabProfile: tempLabProfile
        }
      );
      this.addedPackageAndTestInCart.push(this.bookingDCOrder[0]);
      this.commonService.onMessageHandler("Successfully added " + type + " in your cart", 1);
    }
    this.showAddedPackageCount = this.addedItemInCartCount;
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart);
  }
  goToFilter() {
    let addModal = this.modalCtrl.create("DCFilter", { activeTab: 2 });
    addModal.onDidDismiss(item => {
      if (item) {
        this.packageList=[];
        this.page = 0;
        this.filterResult = item;
        this.getAllPackages();
      }
    });
    addModal.present();
  }
  showMap(latlng) {
    let url = "https://maps.google.com/maps?q=" + latlng + "&hl=es;z=14&amp;output=embed";
    const browser = this.iab.create(url, '_blank');
    browser.show();
  }
}
