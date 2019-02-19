import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import * as $ from 'jquery';
import * as _ from "lodash";
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-diagnosticgenericsearch',
  templateUrl: 'diagnosticgenericsearch.html',
  providers: [InAppBrowser]
})

export class DiagnosticGenericSearch {
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
  searchedResult: any = [];
  page: number = 0;
  itemPerPage: number = 20;
  userId: number = 0;
  apiCount: number = 0;
  healthPackages: any = [];
  isAvailableResult: boolean = true;
  isAutoCompleteSearched: boolean = false;
  isTabSelectionResultAvailable: boolean = true;
  isSelected: number = 1;
  searchedPopularSearchResult: any = [];
  addedPackageAndTestInCart: any = [];
  addedItemInCartCount: number = 0;
  bookingDCOrder: any = [];
  addedTest: any = [];
  packages: any = [];
  showAddedPackageCount: number = 0;
  countList: any = [];
  isCenterAvailable: boolean = true;
  isPackageAvailable: boolean = true;
  isScanAvailable: boolean = true;
  isTestAvailable: boolean = true;
  isDCAvailable: boolean = true;
  diagnostic: any = [];
  searchKeyword: string = "";
  appointmentConfig: any = [];
  diagnosticCenters: any = [];
  labTests: any = [];
  radiologyScans: any = [];
  labProfile: any = [];
  filterResult: any = {
    minPrice: 0,
    maxPrice: 10000,
    age: 5,
    gender: 3,
    orderBy: []
  };

  constructor(private iab: InAppBrowser, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public elemRef: ElementRef) {
    this.appointmentConfig = [];
    this.searchKeyword = this.navParams.get("searchedKeyWord");
    this.appointmentConfig = [
      { ModuleName: "Patho Labs", Image: "assets/img/dc_icon/dc.svg" },
      { ModuleName: "Lab Tests", Image: "assets/img/dc_icon/labTest.svg" },
      { ModuleName: "Radiology", Image: "assets/img/dc_icon/scan.svg" },
      { ModuleName: "Packages", Image: "assets/img/dc_icon/package2.svg" }
    ];
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getFilterData"), false);
  }
  ionViewDidEnter() {
    this.diagnosticCenters = [];
    this.addedItemInCartCount = 0;
    this.showAddedPackageCount = 0;
    this.bookingDCOrder = [];
    this.countList = [];
    this.getUserInfo();
    this.commonService.onEntryPageEvent("Enter to diagnostic search");
    if (this.searchKeyword != "" && this.searchKeyword != undefined && this.searchKeyword != null) {
      this.searchResultByKeyword();
    }
    else {
      this.getActiveSection();
    }
  }
  getActiveSection() {
    this.page = 0;
    this.diagnosticCenters = [];
    this.labTests = [];
    this.radiologyScans = [];
    this.healthPackages = [];
    this.labProfile = [];
    if (this.isSelected == 1) {
      this.getDiagnosticCenters();
    }
    else if (this.isSelected == 2) {
      this.getHealthPackages();
    }
    else if (this.isSelected == 3) {
      this.getLabTests();
    }
    else if (this.isSelected == 4) {
      this.getRadiologyScans();
    }
    else {
      this.searchResultByKeyword();
    }
  }
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getAddedPackageFromCart();
          this.getCurrentLocationFromCache();
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
          this.addedItemInCartCount = this.countList.length;
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
  storeLocationResultInCache() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: this.selectedCityAndLocation.activeCity, activeLocation: this.selectedCityAndLocation.activeLocation, activeCityKey: this.selectedCityAndLocation.activeCityKey, activeLocationKey: this.selectedCityAndLocation.activeLocationKey })
      .then((result) => {
        this.getResultBySearchedKeyword();
      });
  }

  selectAllText(event) {
    if (event.target.value) {
      event.target.select();
    }
  }
  getResultBySearchedKeyword() {
    this.page = 0;
    this.diagnosticCenters = [];
    this.healthPackages = [];
    this.labTests = [];
    this.radiologyScans = [];
    this.labProfile = [];
    if (this.searchKeyword != "" && this.searchKeyword != undefined && this.searchKeyword != null) {
      this.searchResultByKeyword();
    }
    else {
      this.getActiveDetails(this.isSelected);
    }
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

  ionViewWillLeave() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart);
  }
  getPackagesFromCart() {
    this.navCtrl.push("DiagnosticLabBooking", { providerInfo: this.addedPackageAndTestInCart });
  }

  goToCart() {
    this.navCtrl.push("AddtoCart");
    this.commonService.onEventSuccessOrFailure("cart is clicked");
  }
  //get details while selecting the menu item
  getSelectedDetails(item) {
    this.searchKeyword = "";
    this.diagnosticCenters = [];
    this.labTests = [];
    this.radiologyScans = [];
    this.healthPackages = [];
    this.labProfile = [];
    this.page = 0;
    $(".horizontal-list-circle-menu-image").removeClass("active-back pulse");
    $(event.currentTarget).addClass("active-back pulse");
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getFilterData"))
      .then((result) => {
        if (result) {
          this.filterResult = result;
        }
        this.getActiveDetails(item.ModuleName);
      });
  }
  //Get data while scrolling for paggination.
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      if ((this.searchKeyword == "" || this.searchKeyword == null || this.searchKeyword == undefined)) {
        this.getActiveDetails(this.isSelected);
      }
      infiniteScroll.complete();
    }, 500);
  }
  getActiveDetails(value) {
    switch (value) {
      case "Patho Labs":
      case 1:
        this.getDiagnosticCenters();
        break;
      case "Packages":
      case 2:
        this.getHealthPackages();
        break;
      case "Lab Tests":
      case 3:
        this.getLabTests();
        break;
      case "Radiology":
      case 4:
        this.getRadiologyScans();
        break;
      default:
        break;
    }
  }
  //Generic search for  DC centers, tests, scans, Packages based on keywords.
  searchResultByKeyword() {
    if (this.searchKeyword.length > 1) {
      $(".horizontal-list-circle-menu-image").removeClass("active-back pulse");
      let query: any = {}
      query = this.commonService.getDCGenericSearchDataByKeyword();
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
                          query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                          query.aggs.by_type.aggs.tops.top_hits.script_fields = currentLocalityLatLng;
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
                        this._dataContext.GetAutocompleteSearchedDataForDC(query)
                          .subscribe(response => {
                            if (response.hits.total > 0) {
                              this.searchedResult = response.aggregations.by_type.buckets;
                              this.diagnosticCenters = [];
                              this.labTests = [];
                              this.radiologyScans = [];
                              this.healthPackages = [];
                              this.labProfile = [];
                              let filterData = [];
                              let scan_filterData = [];
                              let package_filterData = [];
                              let test_filterData = [];
                              let profile_filterData = [];
                              this.searchedResult.filter(item => {
                                if (item.key === "DiagnosticTest") {
                                  if (activelocationDetails[0].term.City == cityFromGPSCache) {
                                    item.tops.hits.hits.filter(result => {
                                      result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                      test_filterData.push(result);
                                    });
                                  }
                                  else {
                                    item.tops.hits.hits.filter(result => {
                                      test_filterData.push(result);
                                    });
                                  }
                                  this.labTests = test_filterData;
                                  this.labTests.filter(item => {
                                    item._source.PriceAfterDiscount = Math.round(item._source.PriceAfterDiscount);
                                    item._source.GenericDiscount = Math.round(item._source.GenericDiscount);
                                    item._source.Price = Math.round(item._source.Price);
                                    item._source.LabTestName = this.commonService.convert_case(item._source.LabTestName);
                                    item._source.CenterName = this.commonService.convert_case(item._source.CenterName);
                                    item._source.CityAreaName = this.commonService.convert_case(item._source.CityAreaName);
                                    item._source.City = this.commonService.convert_case(item._source.City);
                                  })
                                }
                                else if (item.key === "DiagnosticProfiles") {
                                  if (activelocationDetails[0].term.City == cityFromGPSCache) {
                                    item.tops.hits.hits.filter(result => {
                                      result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                      profile_filterData.push(result);
                                    });
                                  }
                                  else {
                                    item.tops.hits.hits.filter(result => {
                                      profile_filterData.push(result);
                                    });
                                  }
                                  this.labProfile = profile_filterData;
                                  this.labProfile.filter(item => {
                                    item._source.PriceAfterDiscount = Math.round(item._source.PriceAfterDiscount);
                                    item._source.GenericDiscount = Math.round(item._source.GenericDiscount);
                                    item._source.Price = Math.round(item._source.Price);
                                    item._source.LabProfileName = this.commonService.convert_case(item._source.LabProfileName);
                                    item._source.CenterName = this.commonService.convert_case(item._source.CenterName);
                                    item._source.CityAreaName = this.commonService.convert_case(item._source.CityAreaName);
                                    item._source.City = this.commonService.convert_case(item._source.City);
                                  })
                                }
                                else if (item.key === "DiagnosticScan") {
                                  if (activelocationDetails[0].term.City == cityFromGPSCache) {
                                    item.tops.hits.hits.filter(result => {
                                      result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                      scan_filterData.push(result);
                                    });
                                  }
                                  else {
                                    item.tops.hits.hits.filter(result => {
                                      scan_filterData.push(result);
                                    });
                                  }
                                  this.radiologyScans = scan_filterData;
                                  this.radiologyScans.filter(item => {
                                    item._source.PriceAfterDiscount = Math.round(item._source.PriceAfterDiscount);
                                    item._source.GenericDiscount = Math.round(item._source.GenericDiscount);
                                    item._source.Price = Math.round(item._source.Price);
                                    item._source.LabTestName = this.commonService.convert_case(item._source.LabTestName);
                                    item._source.CenterName = this.commonService.convert_case(item._source.CenterName);
                                    item._source.CityAreaName = this.commonService.convert_case(item._source.CityAreaName);
                                    item._source.City = this.commonService.convert_case(item._source.City);
                                  })
                                }
                                else if (item.key === "DiagnosticPackages") {
                                  if (activelocationDetails[0].term.City == cityFromGPSCache) {
                                    item.tops.hits.hits.filter(result => {
                                      result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                      package_filterData.push(result);
                                    });
                                  }
                                  else {
                                    item.tops.hits.hits.filter(result => {
                                      package_filterData.push(result);
                                    });
                                  }
                                  this.healthPackages = package_filterData;
                                  this.healthPackages.filter(item => {
                                    item._source.PriceAfterDiscount = Math.round(item._source.PriceAfterDiscount);
                                    item._source.GenericDiscount = Math.round(item._source.GenericDiscount);
                                    item._source.Price = Math.round(item._source.Price);
                                    item._source.LabPackageName = this.commonService.convert_case(item._source.LabPackageName);
                                    item._source.CenterName = this.commonService.convert_case(item._source.CenterName);
                                    item._source.CityAreaName = this.commonService.convert_case(item._source.CityAreaName);
                                    item._source.City = this.commonService.convert_case(item._source.City);
                                  })
                                }
                                else if (item.key === "DiagnosticCenters") {
                                  if (activelocationDetails[0].term.City == cityFromGPSCache) {
                                    item.tops.hits.hits.filter(result => {
                                      result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                      filterData.push(result);
                                    });
                                  }
                                  else {
                                    item.tops.hits.hits.filter(result => {
                                      filterData.push(result);
                                    });
                                  }
                                  this.diagnosticCenters = filterData;
                                  this.diagnosticCenters.filter(item => {
                                    item._source.CenterName = this.commonService.convert_case(item._source.CenterName);
                                    item._source.CityAreaName = this.commonService.convert_case(item._source.CityAreaName);
                                    item._source.City = this.commonService.convert_case(item._source.City);
                                  })
                                }
                              });

                              //this.providers = this.searchedResult.Providers;
                              this.isAvailableResult = true;
                              this.isSelected = 0;
                            }
                            else {
                              this.diagnosticCenters = [];
                              this.labTests = [];
                              this.radiologyScans = [];
                              this.healthPackages = [];
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
      this.diagnosticCenters = [];
      this.labTests = [];
      this.radiologyScans = [];
      this.healthPackages = [];
      this.labProfile = [];
      this.isSelected = 1;
      this.page = 0;
      $(".horizontal-list-circle-menu-image").removeClass("active-back pulse");
      $(".diagnostic_centers").addClass("active-back pulse");
      this.getDiagnosticCenters();
    }
  }
  getDiagnosticCenters() {
    this.isSelected = 1;
    this.searchedResult = [];
    let query: any = {};
    query = this.commonService.getDiagnosticCenterList();
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
                      // else {
                      //   query.sort.push({ "PriceAfterDiscount": { "order": "asc" } });
                      // }
                      ///////////////////////////
                      this._dataContext.GetDiagnosticsCenters(query)
                        .subscribe(response => {
                          if (response.hits.total > 0) {
                            this.searchedResult = response.hits.hits;
                            let filterData = [];
                            // this.searchedResult.filter(item => {
                            //   item.tops.hits.hits.filter(result => {
                            //     filterData.push(result._source);
                            //   });
                            // });

                            if (activelocationDetails[0].term.City == cityFromGPSCache) {
                              response.hits.hits.filter(result => {
                                result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                filterData.push(result);
                              });
                            }
                            else {
                              response.hits.hits.filter(result => {
                                filterData.push(result);
                              });
                            }
                            this.diagnosticCenters = this.diagnosticCenters.concat(response.hits.hits);
                            // this.diagnosticCenters = filterData;
                            this.diagnosticCenters.filter(item => {
                              item._source.CenterName = this.commonService.convert_case(item._source.CenterName);
                              item._source.CityAreaName = this.commonService.convert_case(item._source.CityAreaName);
                              item._source.City = this.commonService.convert_case(item._source.City);
                            })
                            this.page = this.diagnosticCenters.length;
                            this.isDCAvailable = true;
                          }
                          else {
                            this.diagnosticCenters = [];
                            this.page = 0;
                            this.isDCAvailable = false;
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
          //  this.getLocation();
        }
      });
  }
  getHealthPackages() {
    this.isSelected = 2;
    let searchedResult = [];
    let query: any = {}
    query = this.commonService.getHealthPackageList();
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
                            // this.searchedResult = response.aggregations.by_type.buckets;
                            searchedResult = response.hits.hits;
                            let filterData = [];
                            // searchedResult.filter(item => {
                            //   if (item._id != "" && item._id != null && item._id != undefined) {
                            //     filterData.push(item._source);
                            //   }
                            // });


                            if (activelocationDetails[0].term.City == cityFromGPSCache) {
                              response.hits.hits.filter(result => {
                                result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                filterData.push(result);
                              });
                            }
                            else {
                              response.hits.hits.filter(result => {
                                filterData.push(result);
                              });
                            }
                            this.healthPackages = this.healthPackages.concat(response.hits.hits);
                            // this.healthPackages = filterData;
                            this.healthPackages.filter(item => {
                              item._source.PriceAfterDiscount = Math.round(item._source.PriceAfterDiscount);
                              item._source.GenericDiscount = Math.round(item._source.GenericDiscount);
                              item._source.Price = Math.round(item._source.Price);
                              item._source.LabPackageName = this.commonService.convert_case(item._source.LabPackageName);
                              item._source.CenterName = this.commonService.convert_case(item._source.CenterName);
                              item._source.CityAreaName = this.commonService.convert_case(item._source.CityAreaName);
                              item._source.City = this.commonService.convert_case(item._source.City);
                            })
                            this.page = this.healthPackages.length;
                            this.isPackageAvailable = true;
                          }
                          else {
                            this.healthPackages = [];
                            this.page = 0;
                            this.isPackageAvailable = false;
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
  getRadiologyScans() {
    this.isSelected = 4;
    let searchedResult = [];
    let query: any = {}
    query = this.commonService.getLabScanList();
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
                      // if (this.filterResult.age != 5) {
                      //   query.query.bool.must.push({ "match": { "AgeGroup": this.filterResult.age } });
                      // }
                      // if (this.filterResult.gender != 3) {
                      //   query.query.bool.must.push({ "match": { "Gender": this.filterResult.gender } });
                      // }
                      query.query.bool.must.push({ "range": { "PriceAfterDiscount": { "gte": this.filterResult.minPrice, "lte": this.filterResult.maxPrice } } });
                      if (this.filterResult.orderBy.length > 0) {
                        let sort_status = this.filterResult.orderBy[0].OrderByDesc ? "desc" : "asc";
                        query.sort = [{ "PriceAfterDiscount": { "order": sort_status } }];
                      }
                      this._dataContext.GetLabScans(query)
                        .subscribe(response => {
                          if (response.hits.total > 0) {
                            searchedResult = response.hits.hits;
                            let filterData = [];
                            if (activelocationDetails[0].term.City == cityFromGPSCache) {
                              response.hits.hits.filter(result => {
                                result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                filterData.push(result);
                              });
                            }
                            else {
                              response.hits.hits.filter(result => {
                                filterData.push(result);
                              });
                            }
                            this.radiologyScans = this.radiologyScans.concat(response.hits.hits);
                            // this.radiologyScans = filterData;
                            this.radiologyScans.filter(item => {
                              item._source.PriceAfterDiscount = Math.round(item._source.PriceAfterDiscount);
                              item._source.GenericDiscount = Math.round(item._source.GenericDiscount);
                              item._source.Price = Math.round(item._source.Price);
                              item._source.LabTestName = this.commonService.convert_case(item._source.LabTestName);
                              item._source.CenterName = this.commonService.convert_case(item._source.CenterName);
                              item._source.CityAreaName = this.commonService.convert_case(item._source.CityAreaName);
                              item._source.City = this.commonService.convert_case(item._source.City);
                            })
                            this.page = this.radiologyScans.length;
                            this.isScanAvailable = true;
                          }
                          else {
                            this.radiologyScans = [];
                            this.page = 0;
                            this.isScanAvailable = false;
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
  getLabTests() {
    this.isSelected = 3;
    let searchedResult = [];
    let query: any = {}
    query = this.commonService.getLabTestList();
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
                      // if (this.filterResult.age != 5) {
                      //   query.query.bool.must.push({ "match": { "AgeGroup": this.filterResult.age } });
                      // }
                      // if (this.filterResult.gender != 3) {
                      //   query.query.bool.must.push({ "match": { "Gender": this.filterResult.gender } });
                      // }
                      query.query.bool.must.push({ "range": { "PriceAfterDiscount": { "gte": this.filterResult.minPrice, "lte": this.filterResult.maxPrice } } });
                      if (this.filterResult.orderBy.length > 0) {
                        let sort_status = this.filterResult.orderBy[0].OrderByDesc ? "desc" : "asc";
                        query.sort = [{ "PriceAfterDiscount": { "order": sort_status } }];
                      }
                      this._dataContext.GetLabTests(query)
                        .subscribe(response => {
                          if (response.hits.total > 0) {
                            // this.searchedResult = response.aggregations.by_type.buckets;
                            searchedResult = response.hits.hits;
                            let filterData = [];
                            // searchedResult.filter(item => {
                            //   if (item._id != "" && item._id != null && item._id != undefined) {
                            //     filterData.push(item._source);
                            //   }
                            // });
                            if (activelocationDetails[0].term.City == cityFromGPSCache) {
                              response.hits.hits.filter(result => {
                                result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                filterData.push(result);
                              });
                            }
                            else {
                              response.hits.hits.filter(result => {
                                filterData.push(result);
                              });
                            }
                            this.labTests = this.labTests.concat(response.hits.hits);
                            //this.labTests = filterData;
                            this.labTests.filter(item => {
                              item._source.PriceAfterDiscount = Math.round(item._source.PriceAfterDiscount);
                              item._source.GenericDiscount = Math.round(item._source.GenericDiscount);
                              item._source.Price = Math.round(item._source.Price);
                              item._source.LabTestName = this.commonService.convert_case(item._source.LabTestName);
                              item._source.CenterName = this.commonService.convert_case(item._source.CenterName);
                              item._source.CityAreaName = this.commonService.convert_case(item._source.CityAreaName);
                              item._source.City = this.commonService.convert_case(item._source.City);
                            })
                            this.page = this.labTests.length;
                            // if (searchedResult.length != response.hits.total && this.apiCount == 0) {
                            //   this.getDiagnosticPackage();
                            //   this.apiCount++;
                            // }
                            this.isTestAvailable = true;
                          }
                          else {
                            this.labTests = [];
                            this.page = 0;
                            this.isTestAvailable = false;
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
  selectedHealthPackage(data) {
    let DiagnosticCenter: any = {};
    DiagnosticCenter.CenterID = data.GroupEntityId;
    DiagnosticCenter.CityAreaName = data.CityAreaName;
    DiagnosticCenter.City = data.City;
    DiagnosticCenter.CenterName = data.CenterName;
    DiagnosticCenter.LatLng = data.Latlong;
    DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    this.navCtrl.push("HealthPackageProfile", { selectedCenter: DiagnosticCenter, selectedPackage: data });
  }
  selectedDiagnosticCenter(data) {
    let DiagnosticCenter: any = {};
    DiagnosticCenter.CenterID = data.GroupEntityId;
    DiagnosticCenter.CityAreaName = data.CityAreaName;
    DiagnosticCenter.City = data.City;
    DiagnosticCenter.CenterName = data.CenterName;
    DiagnosticCenter.PackageCount = data.PackageCount;
    DiagnosticCenter.TestCount = data.TestCount;
    DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    DiagnosticCenter.LatLng = data.Latlong;
    this.navCtrl.push("DiagnosticCenterProfile", { selectedCenter: DiagnosticCenter });
  }
  selectedLabTest(data) {
    let DiagnosticCenter: any = {};
    DiagnosticCenter.CenterID = data.GroupEntityId;
    DiagnosticCenter.CityAreaName = data.CityAreaName;
    DiagnosticCenter.City = data.City;
    DiagnosticCenter.CenterName = data.CenterName;
    DiagnosticCenter.LatLng = data.Latlong;
    DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    this.navCtrl.push("LabTestProfile", { selectedCenter: DiagnosticCenter, selectedLabTest: data });
  }
  selectedLabScan(data) {
    let DiagnosticCenter: any = {};
    DiagnosticCenter.CenterID = data.GroupEntityId;
    DiagnosticCenter.CityAreaName = data.CityAreaName;
    DiagnosticCenter.City = data.City;
    DiagnosticCenter.CenterName = data.CenterName;
    DiagnosticCenter.LatLng = data.Latlong;
    DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    this.navCtrl.push("ScanProfile", { selectedCenter: DiagnosticCenter, selectedScan: data });
  }
  selectedLabProfile(data) {
    let DiagnosticCenter: any = {};
    DiagnosticCenter.CenterID = data.GroupEntityId;
    DiagnosticCenter.CityAreaName = data.CityAreaName;
    DiagnosticCenter.City = data.City;
    DiagnosticCenter.CenterName = data.CenterName;
    DiagnosticCenter.LatLng = data.Latlong;
    DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    this.navCtrl.push("LabProfile", { selectedCenter: DiagnosticCenter, selectedLabProfile: data });

  }
  seeAllLabProfile() {
    this.navCtrl.push("SeeAllLabProfile", { searchKeyword: this.searchKeyword });
  }
  seeAllPackages() {
    this.navCtrl.push("SeeAllHealthPackage", { searchKeyword: this.searchKeyword });
  }
  seeAllCenters() {
    this.navCtrl.push("SeeAllDiagnosticCenterList", { searchKeyword: this.searchKeyword });
  }
  seeAllLabTest() {
    this.navCtrl.push("SeeAllTest", { searchKeyword: this.searchKeyword });
  }
  seeAllScan() {
    this.navCtrl.push("SeeAllScan", { searchKeyword: this.searchKeyword });
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
  bookLabTest(data) {
    let DiagnosticCenter: any = {};
    let tempLabTest = [];
    tempLabTest.push(data);
    DiagnosticCenter.CenterID = data.GroupEntityId
    DiagnosticCenter.CityAreaName = data.CityAreaName;
    DiagnosticCenter.City = data.City;
    DiagnosticCenter.CenterName = data.CenterName;
    DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    this.bookingDCOrder =
      {
        DiagnosticCenter: DiagnosticCenter,
        Package: [],
        LabTest: tempLabTest,
        LabScan: [],
        LabProfile: []
      }
    this.navCtrl.push("DiagnosticLabBooking", { BookingDCInfo: this.bookingDCOrder });
  }
  bookLabScan(data) {
    let DiagnosticCenter: any = {};
    let tempScan = [];
    tempScan.push(data);
    DiagnosticCenter.CenterID = data.GroupEntityId
    DiagnosticCenter.CityAreaName = data.CityAreaName;
    DiagnosticCenter.City = data.City;
    DiagnosticCenter.CenterName = data.CenterName;
    DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    this.bookingDCOrder =
      {
        DiagnosticCenter: DiagnosticCenter,
        Package: [],
        LabTest: [],
        LabScan: tempScan,
        LabProfile: []
      }
    this.navCtrl.push("DiagnosticLabBooking", { BookingDCInfo: this.bookingDCOrder });
  }
  bookLabProfile(data) {
    let DiagnosticCenter: any = {};
    let tempProfile = [];
    tempProfile.push(data);
    DiagnosticCenter.CenterID = data.GroupEntityId
    DiagnosticCenter.CityAreaName = data.CityAreaName;
    DiagnosticCenter.City = data.City;
    DiagnosticCenter.CenterName = data.CenterName;
    DiagnosticCenter.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
    this.bookingDCOrder =
      {
        DiagnosticCenter: DiagnosticCenter,
        Package: [],
        LabTest: [],
        LabScan: [],
        LabProfile: tempProfile
      }
    this.navCtrl.push("DiagnosticLabBooking", { BookingDCInfo: this.bookingDCOrder });
  }
  showMap(latlng) {
    let url = "https://maps.google.com/maps?q=" + latlng + "&hl=es;z=14&amp;output=embed";
    const browser = this.iab.create(url, '_blank');
    browser.show();
  }
  goToFilter() {
    let isSelectedTab = this.isSelected == 2 ? "HealthPackage" : "null";
    let addModal = this.modalCtrl.create("DCFilter", { activeTab: isSelectedTab });
    addModal.onDidDismiss(item => {
      if (item) {
        //this.searchKeyword = "";
        this.diagnosticCenters = [];
        this.labTests = [];
        this.radiologyScans = [];
        this.healthPackages = [];
        this.labProfile = [];
        this.page = 0;
        this.filterResult = item;
        // $(".horizontal-list-circle-menu-image").removeClass("active-back pulse");
        // $(event.currentTarget).addClass("active-back pulse");
        this.getActiveDetails(this.isSelected);
      }
    });
    addModal.present();
  }
}
