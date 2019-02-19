import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavParams, NavController, ViewController, App } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import * as _ from "lodash";

@IonicPage()
@Component({
  selector: 'page-seeallpackage',
  templateUrl: 'seeallpackage.html',
  providers: [CallNumber]
})
export class SeeAllPackages {
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
  addedPackageFromCart: any = [];
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
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };

  constructor(public popoverCtrl: PopoverController, private callNumber: CallNumber, public appCtrl: App, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController, public navParams: NavParams) {
    this.searchedKeyword = this.navParams.get('searchKeyword');
     this.packageList = [];

    //this.packageList = this.navParams.get('packages');
  }
  ionViewDidEnter() {
    this.addedPackage = [];
    this.countList = [];
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
          else {
            this.getDefaultPackages();
          }
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
  //Get all the packages with out searched keyword
  getDefaultPackages() {
    this.searchedResult = [];
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
                //this.searchedResult = response.aggregations.by_type.buckets;
                this.searchedResult = response.hits.hits;
                let filterData = [];
                this.searchedResult.filter(item => {
                  if (item._id != "" && item._id != null && item._id != undefined) {
                    filterData.push(item._source);
                  }
                });
                this.packageList = this.packageList.concat(filterData);
                this.packageList.filter(item => {
                  item.GenericDiscount = Math.floor(Number(item.GenericDiscount));
                  item.OriginalPrice = Math.floor(Number(item.OriginalPrice));
                  item.PriceAfterDiscount = Math.floor(Number(item.PriceAfterDiscount));
                  item.PackageName = this.commonService.convert_case(item.PackageName);
                  item.CenterName = this.commonService.convert_case(item.CenterName);
                  item.CityAreaName = this.commonService.convert_case(item.CityAreaName);
                })
                this.page = this.packageList.length;
                this.isAvailable = true;
              }
              else {
                this.packageList = [];
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
  //Get all the packages based on searched keyword
  getAllPackages() {
    this.searchedResult = [];
    let query: any = {}
    query = this.commonService.getSearchedDiagnosticPackageByKeywords();
    query.query.bool.must[0].multi_match.query = this.searchedKeyword;
    this.commonService.checkActiveCityAndLocality()
      .then((result) => {
        if (result.length > 0) {
          query.query.bool.filter = query.query.bool.filter.concat(result);
          query.from = this.page;
          this._dataContext.GetDCHealthPackages(query)
            .subscribe(response => {
              if (response.hits.total > 0) {
                //this.searchedResult = response.aggregations.by_type.buckets;
                this.searchedResult = response.hits.hits;
                let filterData = [];
                this.searchedResult.filter(item => {
                  if (item._id != "" && item._id != null && item._id != undefined) {
                    filterData.push(item._source);
                  }
                });
                this.packageList = this.packageList.concat(filterData);
                this.packageList.filter(item => {
                  item.GenericDiscount = Math.floor(Number(item.GenericDiscount));
                  item.OriginalPrice = Math.floor(Number(item.OriginalPrice));
                  item.PriceAfterDiscount = Math.floor(Number(item.PriceAfterDiscount));
                  item.PackageName = this.commonService.convert_case(item.PackageName);
                  item.CenterName = this.commonService.convert_case(item.CenterName);
                  item.CityAreaName = this.commonService.convert_case(item.CityAreaName);
                })
                this.page = this.packageList.length;
                this.isAvailable = true;
              }
              else {
                if(this.packageList.length ==0){
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
    this.navCtrl.push("DiagnosticAppointment", { providerInfo: this.addedPackage });
  }
  addToCart(data) {
    let pckStatus = 0;
    let centerStatus = 0;
    this.addedPackageFromCart.filter(item => {
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
         // this.packageCount = item.Package.length;
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
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageFromCart);
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
      else {
        this.getDefaultPackages();
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
    this.navCtrl.push("CartList");
  }
}
