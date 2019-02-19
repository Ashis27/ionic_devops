import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
import { DataContext } from '../../../providers/dataContext.service';
import * as $ from 'jquery';

@IonicPage()
@Component({
  selector: 'page-filter',
  templateUrl: 'filter.html',
})

export class DCFilter {
  ageRange: any;
  priceRange: any;
  selectedGenderValue: any;
  selectedAgeValue: any;
  genders: any = [];
  minPrice: number = 0;
  maxPrice: number = 10000;
  minAge: number = 0;
  maxAge: number = 100;
  dc_filter = {
    minPrice: 0,
    maxPrice: 10000,
    age: 5,
    gender: 3,
    orderBy: []
  };
  isSelectedFilterOption: boolean = false;
  ageGroups: any = [];
  priceRangeObject: any = { lower: 0, upper: 100 };
  ageRangeObject: any = { lower: 0, upper: 100 };
  activeTab: string; // We can have one tab index is 0
  isSorted: boolean = false;
  constructor(public viewCtrl: ViewController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public elemRef: ElementRef, public alertCtrl: AlertController) {
    this.genders = [];
    this.dc_filter.orderBy = [];
  }
  ionViewDidEnter() {
    this.isFilterSelected();
    this.activeTab = this.navParams.get("activeTab");
    this.getPackageGenderFromCache();
    this.getPackageAgeGroupsListFromCache();
    this.getFilterInfoFromCache();
    this.commonService.onEntryPageEvent("Enter to Diagnostic center Filter page");
  }
  getFilterInfoFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getFilterData"))
      .then((result) => {
        if (result) {
          this.dc_filter = result;
          this.selectedGenderValue = this.dc_filter.gender;
          this.selectedAgeValue = this.dc_filter.age;
        }
        else {
          this.dc_filter = {
            minPrice: 0,
            maxPrice: 10000,
            age: 5,
            gender: 3,
            orderBy: []
          }
        }
        if (this.dc_filter.orderBy.length > 0) {
          $(".sort_by_option").removeClass("sort_by_btn_active");
          $(".item_" + this.dc_filter.orderBy[0].OrderByDesc).addClass("sort_by_btn_active");
        }
        this.priceRangeObject = { lower: (this.dc_filter.minPrice / 100), upper: (this.dc_filter.maxPrice / 100) };
      });
  }
  setPrice(event, value) {
    this.dc_filter.minPrice = (value.lower * 100);
    this.dc_filter.maxPrice = (value.upper * 100);
    this.isFilterSelected();
  }
  // setAge(value) {
  //   this.dc_filter.minAge = value.lower;
  //   this.dc_filter.maxAge = value.upper;
  // }
  selectedGender() {
    this.dc_filter.gender = this.selectedGenderValue;
    this.isFilterSelected();
  }
  selectedAge() {
    this.dc_filter.age = this.selectedAgeValue;
    this.isFilterSelected();
  }
  applyFilter() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getFilterData"), this.dc_filter).then(result => {
      this.viewCtrl.dismiss(this.dc_filter);
    });
  }
  closeModal() {
    this.viewCtrl.dismiss(false);
  }
  isFilterSelected() {
    if (this.dc_filter.age != 5 || this.dc_filter.gender != 3 || this.dc_filter.minPrice > 0 || this.dc_filter.maxPrice < 10000 || this.isSorted) {
      this.isSelectedFilterOption = true;
    }
    else {
      this.isSelectedFilterOption = false;
    }
  }
  clearFilter() {
    this.dc_filter = {
      minPrice: 0,
      maxPrice: 10000,
      age: 5,
      gender: 3,
      orderBy: []
    };
    this.selectedGenderValue = 3;
    this.selectedAgeValue = 5;
    this.priceRangeObject = { lower: 0, upper: 10000 };
    $(".sort_by_option").removeClass("sort_by_btn_active");
  }
  selectedSortOption(event, type, status) {
    this.dc_filter.orderBy = [];
    $(".sort_by_option").removeClass("sort_by_btn_active");
    $(event.currentTarget).addClass("sort_by_btn_active");
    this.dc_filter.orderBy.push({ OrderByColumn: type, OrderByDesc: status });
    this.isSorted = true;
    this.isFilterSelected();
  }
  //This is used for getting available gender details for filter from cache
  getPackageGenderFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl('getPackageGender')).then((data) => {
      if (data) {
        this.genders = data;
        this.selectedGenderValue = this.genders[0].StandardCodesValuesID;
        this.dc_filter.gender = this.selectedGenderValue;
      }
      else {
        this.getPackageGenders();
      }
    });
  }
  //This is used for getting available gender details for filter
  getPackageGenders() {
    this._dataContext.GetPackageGenderList()
      .subscribe(response => {
        if (response.length > 0) {
          this.genders = response;
          this.genders.reverse();
          this.genders.filter(item => {
            if (item.Value == "Both")
              item.Value = "All";
            this.selectedGenderValue = item.StandardCodesValuesID;
            this.dc_filter.gender = this.selectedGenderValue;
          });
        }
        else {
          this.commonService.onMessageHandler("Failed to retrieve gender list", 0);
        }
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl('getPackageGender'), this.genders);
      },
        error => {
          this.commonService.onMessageHandler("Failed to retrieve. Please try again", 0);
        });
  }
  //This is used for getting available age group details for filter from cache
  getPackageAgeGroupsListFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl('getAgeGroup')).then((data) => {
      if (data != "" && data != undefined && data.length > 0) {
        this.ageGroups = data;
        this.selectedAgeValue = this.ageGroups[0].StandardCodesValuesID;
        this.dc_filter.age = this.selectedAgeValue;
      }
      else {
        this.getPackageAgeGroups(0);
      }
    });
  }
  //This is used for getting available age group details for filter
  getPackageAgeGroups(value) {
    this._dataContext.GetPackageAgeGroups(value)
      .subscribe(response => {
        if (response.length > 0) {
          this.ageGroups = response;
          this.ageGroups.reverse();
          this.selectedAgeValue = this.ageGroups[0].StandardCodesValuesID;
          this.dc_filter.age = this.selectedAgeValue;
        }
        else {
          this.commonService.onMessageHandler("Failed to Retrieve age group.", 0);
        }
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl('getAgeGroup'), this.ageGroups);
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve age group.", 0);
        });
  }
}
