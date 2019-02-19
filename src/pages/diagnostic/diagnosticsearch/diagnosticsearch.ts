import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-diagnosticsearch',
  templateUrl: 'diagnosticsearch.html',
})

export class DiagnosticSearch {
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
  searchedResult: any = [];
  page: number = 0;
  isCenterAvailable: boolean = true;
  isPackageAvailable: boolean = true;
  diagnostic: any = [];
  searchKeyword: string = "";
  addedPackageFromCart: any = [];
  packageCount: number = 0;
  addedPackage: any = [];
  packages: any = [];
  showAddedPackageCount: number = 0;
  countList: any = [];
  userId: number = 0;
  apiCount: number = 0;

  constructor(public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public elemRef: ElementRef) {

  }
  ionViewDidEnter() {
    this.packageCount = 0;
    this.showAddedPackageCount = 0;
    this.addedPackage = [];
    this.countList = [];
    this.getUserInfo();
    this.commonService.onEntryPageEvent("Enter to diagnostic search");
    if (this.searchKeyword == "" || this.searchKeyword == undefined || this.searchKeyword == null) {
      this.defaultCenters();
      //this.defaultPackages();
    }
    // this.getDiagnosticCentersBySearch();
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
  defaultCenters() {
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
                // this.searchedResult = response.aggregations.by_type.buckets;
                this.searchedResult = response.aggregations.by_Center.buckets;
                let filterData = [];
                this.searchedResult.filter(item => {
                  item.tops.hits.hits.filter(result => {
                    filterData.push(result._source);
                  });
                });
                this.diagnostic = filterData;
                this.diagnostic.filter(item => {
                  //item.PackageName = this.commonService.convert_case(item.PackageName);
                  item.CenterName = this.commonService.convert_case(item.CenterName);
                  item.CityAreaName = this.commonService.convert_case(item.CityAreaName);
                })
                this.page = this.diagnostic.length;
                // if (this.searchedResult.length == 0) {
                //   this.getDiagnosticCenter();
                // }
                this.isCenterAvailable = true;
              }
              else {
                this.diagnostic = [];
                this.page = 0;
                this.isCenterAvailable = false;
              }
            },
              error => {
                console.log(error);
                this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
              });
        }
        else {
          //  this.getLocation();
        }
      });
  }
  defaultPackages() {
    let searchedResult = [];
    let query: any = {}
    query = "";//this.commonService.getDefaultPackageList();
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          query.query.bool.filter = query.query.bool.filter.concat(result);
          query.from = this.page;
          this._dataContext.GetDCHealthPackages(query)
            .subscribe(response => {
              if (response.hits.total > 0) {
                // this.searchedResult = response.aggregations.by_type.buckets;
                searchedResult = response.hits.hits;
                let filterData = [];
                searchedResult.filter(item => {
                  if (item._id != "" && item._id != null && item._id != undefined) {
                    filterData.push(item._source);
                  }
                });
                this.packages = filterData;
                this.packages.filter(item => {
                  item.PriceAfterDiscount = item.PriceAfterDiscount.toFixed(0);
                  item.OriginalPrice = item.OriginalPrice.toFixed(0);
                  item.PackageName = this.commonService.convert_case(item.PackageName);
                  item.CenterName = this.commonService.convert_case(item.CenterName);
                  item.CityAreaName = this.commonService.convert_case(item.CityAreaName);
                })
                this.page = this.packages.length;
                // if (searchedResult.length != response.hits.total && this.apiCount == 0) {
                //   this.getDiagnosticPackage();
                //   this.apiCount++;
                // }
                this.isPackageAvailable = true;
              }
              else {
                this.packages = [];
                this.page = 0;
                this.isPackageAvailable = false;
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
  getAddedPackageFromCart() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId)
      .then((result) => {
        if (result && result.length > 0) {
          this.addedPackageFromCart = result;
          this.addedPackageFromCart.filter(item => {
            item.Package.filter(pck => {
              this.countList.push(pck);
            })
          });
          this.packageCount = this.countList.length;
          this.showAddedPackageCount = this.countList.length;
        }
        else {
          this.addedPackageFromCart = [];
          this.showAddedPackageCount = 0;
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

  //Get data while scrolling for paggination.
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getDiagnosticCenter();
      infiniteScroll.complete();
    }, 500);
  }
  selectAllText(event) {
    if (event.target.value) {
      event.target.select();
    }
  }
  // getDiagnosticCentersBySearch() {
  //   this.searchedResult = [];
  //   let query: any = {}
  //   query = this.commonService.getSearchedDiagnosticCenter();
  //   this.commonService.checkActiveCityAndLocality()
  //     .then((result) => {
  //       if (result.length > 0) {
  //         query.query.bool.filter = query.query.bool.filter.concat(result);
  //         query.from = this.page;
  //         this._dataContext.GetDiagnosticsByKeyword(query)
  //           .subscribe(response => {
  //             if (response.hits.total > 0) {
  //               this.searchedResult = response.hits.hits;
  //               this.diagnostic = this.diagnostic.concat(this.searchedResult);
  //               this.page = this.diagnostic.length;
  //               this.isAvailable = true;
  //             }
  //             else {
  //               this.diagnostic = [];
  //               this.page = 0;
  //               this.isAvailable = false;
  //             }
  //           },
  //             error => {
  //               console.log(error);
  //               this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
  //             });
  //       }
  //       else {
  //         this.getLocation();
  //       }
  //     });
  // }
  getDiagnosticPackage() {
    if (this.searchKeyword.length > 1) {
      let searchedResult = [];
      let query: any = {}
      query = this.commonService.getSearchedDiagnosticPackageByKeywords();
      query.query.bool.must[0].multi_match.query = this.searchKeyword;
      this.commonService.checkActiveCityAndLocality()
        .then((result) => {
          if (result.length > 0) {
            query.query.bool.filter = query.query.bool.filter.concat(result);
            query.from = this.page;
            this._dataContext.GetDCHealthPackages(query)
              .subscribe(response => {
                if (response.hits.total > 0) {
                  // this.searchedResult = response.aggregations.by_type.buckets;
                  searchedResult = response.hits.hits;
                  let filterData = [];
                  searchedResult.filter(item => {
                    if (item._id != "" && item._id != null && item._id != undefined) {
                      filterData.push(item._source);
                    }
                  });
                  this.packages = filterData;
                  this.packages.filter(item => {
                    item.GenericDiscount = Math.floor(Number(item.GenericDiscount));
                    item.OriginalPrice = Math.floor(Number(item.OriginalPrice));
                    item.PriceAfterDiscount = Math.floor(Number(item.PriceAfterDiscount));
                    item.PackageName = this.commonService.convert_case(item.PackageName);
                    item.CenterName = this.commonService.convert_case(item.CenterName);
                    item.CityAreaName = this.commonService.convert_case(item.CityAreaName);
                  })
                  this.page = this.packages.length;
                  // if (searchedResult.length != response.hits.total && this.apiCount == 0) {
                  //   this.getDiagnosticPackage();
                  //   this.apiCount++;
                  // }
                  this.isPackageAvailable = true;
                }
                else {
                  this.packages = [];
                  this.page = 0;
                  this.isPackageAvailable = false;
                }
              },
                error => {
                  console.log(error);
                  this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
                });
          }
          else {
            //  this.getLocation();
          }
        });
    }
    else {
      if (this.searchKeyword.length == 0) {
        //this.getDiagnosticCentersBySearch();
      }
    }
  }
  getResultBySearchedKeyword() {
    this.diagnostic = [];
    this.packages = [];
    if (this.searchKeyword != "" && this.searchKeyword != undefined && this.searchKeyword != null) {
      this.getDiagnosticCenter();
      this.getDiagnosticPackage();
    }
    else {
      this.defaultCenters();
      // this.defaultPackages();
    }
  }
  getDiagnosticCenter() {
    this.searchedResult = [];
    let query: any = {};
    query = this.commonService.getSearchedDiagnosticCenterByKeywords();
    query.query.bool.must[0].multi_match.query = this.searchKeyword;
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          query.query.bool.filter = query.query.bool.filter.concat(result);
          query.from = this.page;
          this._dataContext.GetDiagnosticsCenters(query)
            .subscribe(response => {
              if (response.hits.total > 0) {
                // this.searchedResult = response.aggregations.by_type.buckets;
                this.searchedResult = response.aggregations.by_Center.buckets;
                let filterData = [];
                this.searchedResult.filter(item => {
                  item.tops.hits.hits.filter(result => {
                    filterData.push(result._source);
                  });
                });
                this.diagnostic = filterData;
                this.diagnostic.filter(item => {
                  //item.PackageName = this.commonService.convert_case(item.PackageName);
                  item.CenterName = this.commonService.convert_case(item.CenterName);
                  item.CityAreaName = this.commonService.convert_case(item.CityAreaName);
                })
                this.page = this.diagnostic.length;
                // if (this.searchedResult.length == 0) {
                //   this.getDiagnosticCenter();
                // }
                this.isCenterAvailable = true;
              }
              else {
                this.diagnostic = [];
                this.page = 0;
                this.isCenterAvailable = false;
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
  addToCart(data) {
    let pckStatus = 0;
    let centerStatus = 0;
    this.addedPackageFromCart.filter(function (item) {
      if (item.DiagnosticCenterName.CenterID === data.CenterID) {
        centerStatus++;
        item.Package.filter(pck => {
          if (pck.PackageName.toLowerCase() == data.PackageName.toLowerCase() && pck.CenterID === data.CenterID) {
            this.commonService.onMessageHandler("This Package is already in your cart", 0);
            pckStatus++;
          }
        })
        if (pckStatus == 0) {
          item.Package.push(data);
          this.packageCount++;
          this.commonService.onMessageHandler("Successfully added this package in your cart", 1);
        }
      }
    })
    if (centerStatus == 0) {
      this.packageCount++;
      let countStatus = 0;
      if (this.addedPackage.length > 0) {
        this.addedPackage.filter(item => {
          if (item.DiagnosticCenterName.CenterID === data.CenterID) {
            item.Pckage.push(data);
            countStatus++;
          }
        })
        if (countStatus == 0) {
          let DiagnosticCenterName: any = {};
          let tempPackage = [];
          tempPackage.push(data);
          DiagnosticCenterName.CenterID = data.CenterID
          DiagnosticCenterName.CityAreaName = data.CityAreaName;
          DiagnosticCenterName.City = data.City;
          DiagnosticCenterName.CenterName = data.CenterName;
          DiagnosticCenterName.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
          this.addedPackage.push(
            {
              DiagnosticCenterName: DiagnosticCenterName,
              Package: tempPackage
            }
          );
          this.addedPackage = this.addedPackage.reverse();
        }
      }
      else {
        this.addedPackage = [];
        let DiagnosticCenterName: any = {};
        let tempPackage = [];
        tempPackage.push(data);
        DiagnosticCenterName.CenterID = data.CenterID
        DiagnosticCenterName.CityAreaName = data.CityAreaName;
        DiagnosticCenterName.City = data.City;
        DiagnosticCenterName.CenterName = data.CenterName;
        DiagnosticCenterName.ProviderImage = data.ProviderImage != null && data.ProviderImage != undefined && data.ProviderImage != "" ? data.ProviderImage : "";
        this.addedPackage.push(
          {
            DiagnosticCenterName: DiagnosticCenterName,
            Package: tempPackage
          }
        );
      }
      this.addedPackageFromCart.push(this.addedPackage[0]);
      this.commonService.onMessageHandler("Successfully added this package in your cart", 1);
    }
    this.showAddedPackageCount = this.packageCount;
  }
  ionViewWillLeave() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageFromCart);
  }
  seeAllPackages() {
    this.navCtrl.push("SeeAllPackages", { packages: this.packages, searchKeyword: this.searchKeyword });
  }
  seeAllCenters() {
    this.navCtrl.push("SeeAllDiagnosticCenters", { packages: this.diagnostic, searchKeyword: this.searchKeyword });
  }
  getPackagesFromCart() {
    this.navCtrl.push("DiagnosticAppointment", { providerInfo: this.addedPackageFromCart });
  }
  selectedDiagnosticCenter(data) {
    this.navCtrl.push("PackageList", { selectedCenter: data });
  }
  bookPackage(data) {
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
    this.navCtrl.push("DiagnosticAppointment", { providerInfo: this.addedPackage });
  }
  selectedHealthPackage(data) {
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
  goToCart() {
    this.navCtrl.push("CartList");
    this.commonService.onEventSuccessOrFailure("cart is clicked");
  }
}
