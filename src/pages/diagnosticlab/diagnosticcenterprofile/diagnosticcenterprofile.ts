import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, PopoverController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-diagnosticcenterprofile',
  templateUrl: 'diagnosticcenterprofile.html',
  providers: [InAppBrowser]
})

export class DiagnosticCenterProfile {
  searchHealthPackage: any;
  healthPackages = [];
  groupEntityId: number;
  minPackagePrice = 0;
  maxPackagePrice = 0;
  packageNameToSearch = "";
  selectedDiagnosticCenter: any;
  selectedPopularPackageID: any;
  checkedGenders = [];
  ageGroups: any = [];
  checkedAgeGroups = [];
  showAddedPackageCount: number = 0;
  isAvailable: boolean = true;
  submittedFeedbackList: any = [];
  userRating: number = 5;
  feedbackModuleType: string = "7";
  feedbackQuestionList: any = [];
  feedbackAns: any = [];
  answer: any = {};
  myRatingDetails: any = {};
  userMessage: string;
  reviewModal: any;
  addedPackage: any = {
    DiagnosticCenterName: {},
    Package: []
  };
  tapOption: any = [];
  countList: any = []; any = [];
  addedPackageAndTestInCart: any = [];
  packageCount: number = 0;
  userId: number = 0;
  tabValue: string;
  optionObj: number = 0;
  page = 0;
  healthPackageList: any = [];
  labTestList: any = [];
  labScanList: any = [];
  labProfileList: any = [];
  labTestSearch: any = {
    GroupEntityId: 0,
    LabTestName: "",
    LabTestCategory: 0,
    LabTestCode: "",
    IsActive: true,
    MinPrice: Number,
    MaxPrice: Number,
    AgeGroup: Number,
    Gender: Number,
    Ordering: [{
      OrderByColumn: "",
      OrderByDesc: false
    }],
    Page: 1,
    Rows: 5
  };
  healthPackageSearch: any = {
    GroupEntityId: 0,
    LabPackageName: "",
    LabPackageCategory: 0,
    LabPackageCode: "",
    IsActive: true,
    MinPrice: Number,
    MaxPrice: Number,
    AgeGroup: Number,
    Gender: Number,
    Ordering: [{
      OrderByColumn: "",
      OrderByDesc: false
    }],
    Page: 1,
    Rows: 5
  };
  labProfileSearch: any = {
    GroupEntityId: 0,
    LabProfileName: "",
    LabProfileCategory: 0,
    LabProfileCode: "",
    IsActive: true,
    MinPrice: Number,
    MaxPrice: Number,
    AgeGroup: Number,
    Gender: Number,
    Ordering: [{
      OrderByColumn: "",
      OrderByDesc: false
    }],
    Page: 1,
    Rows: 5
  };
  labScanSearch: any = {
    GroupEntityId: 0,
    LabTestName: "",
    LabTestCategory: 0,
    LabTestCode: "",
    IsActive: true,
    MinPrice: Number,
    MaxPrice: Number,
    AgeGroup: Number,
    Gender: Number,
    Ordering: [{
      OrderByColumn: "",
      OrderByDesc: false
    }],
    Page: 1,
    Rows: 5
  };
  bookingDCOrder: any = [];
  isTestAvailable: boolean = true;
  isPackageAvailable: boolean = true;
  isScanAvailable: boolean = true;
  isLabProfileAvailable: boolean = true;
  addedItemInCartCount: number = 0;

  constructor(private iab: InAppBrowser, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public elemRef: ElementRef, public alertCtrl: AlertController, public popoverCtrl: PopoverController) {
    this.selectedDiagnosticCenter = this.navParams.get('selectedCenter');
    this.reviewModal = document.getElementById('openReviewModal');
    this.tapOption.push({ module: "HealthPackage", tabName: "Packages", available: "" });
    this.tapOption.push({ module: "LabTest", tabName: "Lab Tests", available: "" });
    this.tapOption.push({ module: "LabProfile", tabName: "Lab Profiles", available: "" });
    this.tapOption.push({ module: "LabScan", tabName: "Radiology", available: "" });
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getFilterData"), false);
  }
  ionViewDidEnter() {
    this.packageCount = 0;
    this.addedItemInCartCount = 0;
    this.showAddedPackageCount = 0;
    this.addedPackage.Package = [];
    this.countList = [];
    this.tabValue = "item-" + this.optionObj;
    this.getUserInfo();
    this.commonService.onEntryPageEvent("Enter to diagnostic profile");
  }
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getaddedPackageAndTestInCart();
          this.getHealthPackageList();
          // this.getPackageAgeGroupsListFromCache();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  getaddedPackageAndTestInCart() {
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
  filterPopover(myEvent) {
    let popover = this.popoverCtrl.create("FilterPopover");
    popover.present({
      ev: myEvent
    });
  }
  getFilterInfoFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getFilterData"))
      .then((result) => {
        if (result) {
          return result;
        }
        else {
          return {
            minPrice: 0,
            maxPrice: 10000,
            age: 5,
            gender: 3,
            orderBy: []
          }
        }
      });
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

  //Get health package test list based on search parameters
  getHealthPackageList() {
    this.healthPackageSearch.GroupEntityId = this.selectedDiagnosticCenter.CenterID;
    this._dataContext.GetHealthPackageList(this.healthPackageSearch)
      .subscribe(response => {
        this.healthPackageList = this.healthPackageList.concat(response.Items);
        this.healthPackageList.filter(item => {
          item.PriceAfterDiscount = Math.round(item.PriceAfterDiscount);
          item.GenericDiscount = Math.round(item.GenericDiscount);
          item.Price = Math.round(item.Price);
          item.LabPackageName = this.commonService.convert_case(item.LabPackageName);
          item["LabPackageId"] = item.Id;
        });
        this.healthPackageSearch.Page++;
        //  this.tapOption[0].available = this.healthPackageList.length + " package(s) available"
        if (this.healthPackageList.length == 0) {
          this.isPackageAvailable = false;
        }
        else {
          this.isPackageAvailable = true;
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }

  //Get lab test list based on search parameters
  getLabTestList() {
    this.labTestSearch.GroupEntityId = this.selectedDiagnosticCenter.CenterID;
    this.labTestSearch.LabTestCategory = 1; // 1 is for test
    this._dataContext.GetLabTestList(this.labTestSearch)
      .subscribe(response => {
        this.labTestList = this.labTestList.concat(response.Items);
        this.labTestList.filter(item => {
          item.PriceAfterDiscount = Math.round(item.PriceAfterDiscount);
          item.GenericDiscount = Math.round(item.GenericDiscount);
          item.Price = Math.round(item.Price);
          item.LabTestName = this.commonService.convert_case(item.LabTestName);
          item["LabTestId"] = item.Id;
        });
        this.labTestSearch.Page++;
        //this.tapOption[2].available = this.labTestList.length + " test(s) available"
        if (this.labTestList.length == 0) {
          this.isTestAvailable = false;
        }
        else {
          this.isTestAvailable = true;
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }

  //Get lab profile list based on search parameters
  getLabProfileList() {
    this.labProfileSearch.GroupEntityId = this.selectedDiagnosticCenter.CenterID;
    this._dataContext.GetLabProfileList(this.labProfileSearch)
      .subscribe(response => {
        this.labProfileList = this.labProfileList.concat(response.Items);
        this.labProfileList.filter(item => {
          item.PriceAfterDiscount = Math.round(item.PriceAfterDiscount);
          item.GenericDiscount = Math.round(item.GenericDiscount);
          item.Price = Math.round(item.Price);
          item.LabProfileName = this.commonService.convert_case(item.LabProfileName);
          item["LabProfileId"] = item.Id;
        });
        this.labProfileSearch.Page++;
        //this.tapOption[2].available = this.labProfileList.length + " test(s) available"
        if (this.labProfileList.length == 0) {
          this.isLabProfileAvailable = false;
        }
        else {
          this.isLabProfileAvailable = true;
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  //Get lab profile list based on search parameters
  getLabScanList() {
    this.labScanSearch.GroupEntityId = this.selectedDiagnosticCenter.CenterID;
    this.labScanSearch.LabTestCategory = 2; // 2 is for radiology
    this._dataContext.GetLabTestList(this.labScanSearch)
      .subscribe(response => {
        this.labScanList = this.labScanList.concat(response.Items);
        this.labScanList.filter(item => {
          item.PriceAfterDiscount = Math.round(item.PriceAfterDiscount);
          item.GenericDiscount = Math.round(item.GenericDiscount);
          item.Price = Math.round(item.Price);
          item.LabTestName = this.commonService.convert_case(item.LabTestName);
          item["LabTestId"] = item.Id;
        });
        this.labScanSearch.Page++;
        //this.tapOption[2].available = this.labScanList.length + " test(s) available"
        if (this.labScanList.length == 0) {
          this.isScanAvailable = false;
        }
        else {
          this.isScanAvailable = true;
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  selectedLabTest(data) {
    this.navCtrl.push("LabTestProfile", { selectedCenter: this.selectedDiagnosticCenter, selectedLabTest: data });
  }
  selectedHealthPackage(data) {
    this.navCtrl.push("HealthPackageProfile", { selectedCenter: this.selectedDiagnosticCenter, selectedPackage: data });
  }
  selectedLabScan(data) {
    this.navCtrl.push("ScanProfile", { selectedCenter: this.selectedDiagnosticCenter, selectedScan: data });
  }
  selectedLabProfile(data) {
    this.navCtrl.push("LabProfile", { selectedCenter: this.selectedDiagnosticCenter, selectedLabProfile: data });
  }
  bookHealthPackage(data) {
    let tempPackage = [];
    tempPackage.push(data);
    this.bookingDCOrder =
      {
        DiagnosticCenter: this.selectedDiagnosticCenter,
        Package: tempPackage,
        LabTest: [],
        LabScan: [],
        LabProfile: []
      }
    this.navCtrl.push("DiagnosticLabBooking", { BookingDCInfo: this.bookingDCOrder });
  }
  bookLabTest(data) {
    let tempLabTest = [];
    tempLabTest.push(data);
    this.bookingDCOrder =
      {
        DiagnosticCenter: this.selectedDiagnosticCenter,
        Package: [],
        LabTest: tempLabTest,
        LabScan: [],
        LabProfile: []
      }
    this.navCtrl.push("DiagnosticLabBooking", { BookingDCInfo: this.bookingDCOrder });
  }
  bookLabScan(data) {
    let tempScan = [];
    tempScan.push(data);
    this.bookingDCOrder =
      {
        DiagnosticCenter: this.selectedDiagnosticCenter,
        Package: [],
        LabTest: [],
        LabScan: tempScan,
        LabProfile: []
      }
    this.navCtrl.push("DiagnosticLabBooking", { BookingDCInfo: this.bookingDCOrder });
  }
  bookLabProfile(data) {
    let tempLabProfile = [];
    tempLabProfile.push(data);
    this.bookingDCOrder =
      {
        DiagnosticCenter: this.selectedDiagnosticCenter,
        Package: [],
        LabTest: [],
        LabScan: [],
        LabProfile: tempLabProfile
      }
    this.navCtrl.push("DiagnosticLabBooking", { BookingDCInfo: this.bookingDCOrder });
  }
  getHealthPackages() {
    this.searchHealthPackage = {
      GroupEntityID: this.selectedDiagnosticCenter.CenterID,
      MaxPrice: this.maxPackagePrice,
      MinPrice: this.minPackagePrice,
      PackageName: this.packageNameToSearch,
      GenderIDs: this.checkedGenders, // added later on 28 Apr 2014
      AgeGroupIDs: this.checkedAgeGroups,
    };
    this._dataContext.GetHealthPackages(this.searchHealthPackage)
      .subscribe(response => {
        if (response.length > 0) {
          this.healthPackages = response;
          this.healthPackages.filter(item => {
            item.GenericDiscount = Math.floor(Number(item.GenericDiscount));
            item.OriginalPrice = Math.floor(Number(item.OriginalPrice));
            item.PriceAfterDiscount = Math.floor(Number(item.PriceAfterDiscount));
            item["CenterID"] = item.GroupEntityId.toString();
            item["LabPackageId"] = item.Id;
          })
          this.isAvailable = true;
        }
        else {
          this.isAvailable = false;
        }
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("userHealthPackages"), this.healthPackages);
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve package.", 0);
        });
  }
  filterByAgeGroup(genderStandardCodeValue) {
    let index = this.checkedAgeGroups.findIndex((item) => { return item == genderStandardCodeValue });
    if (index != -1) {
      this.checkedAgeGroups.splice(index, 1);
    } else {
      this.checkedAgeGroups.push(genderStandardCodeValue);
    }
    //this.getHealthPackages();
  }
  filterByGender(event, genderObj) {
    this.selectedPopularPackageID = 0;
    this.checkedGenders = [];
    if (genderObj.Value != "All") {
      this.checkedGenders.push(genderObj.StandardCodesValuesID);
      // adding a both search parameter in case of male and female. 
      // so by clicking male (package for male and both will appear). similarly for female. 
      this.checkedGenders.push(3);
    } else {
      this.checkedGenders = [];
    }
  }
  onRatingChange(event) {
    this.myRatingDetails.CenterID = this.selectedDiagnosticCenter.CenterID;
    this.myRatingDetails.ProviderName = this.selectedDiagnosticCenter.ProviderName;
    this.myRatingDetails.TotalRating = event;
    this._dataContext.SaveMyRating(this.myRatingDetails)
      .subscribe(response => {
        this.getProviderRating();
        //this.commonService.onMessageHandler("Successfully rated to this doctor.", 1);
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  getProviderRating() {
    this._dataContext.GetProviderRating(this.selectedDiagnosticCenter.CenterID)
      .subscribe(response => {
        if (response.result != null) {
          this.selectedDiagnosticCenter.ProviderAverageRating = response.result.AverageRating;
          this.selectedDiagnosticCenter.ProviderTotalRatingCount = response.result.TotalCount;
        }
      },
        error => {
          //this.commonService.onMessageHandler("Failed to Retrieve", 0);
        });
  }
  submitFeedback() {
    this.feedbackAns = [];
    this.onRatingChange(this.userRating);
    this.answer = {
      PlatformFeedbackQuestionID: 13,
      QuestionType: 2,
      Value: this.userMessage,
      CenterID: this.selectedDiagnosticCenter.CenterID, // added in order to send the providerID if feedback is given for any doctor
      FeedbackModuleType: this.feedbackModuleType   //added on 30-DEC-2015, in order to get the rating of doctors.
    };
    this.feedbackAns.push(this.answer);
    this.submitConsumerFeedbackForDoctor();
  }
  submitConsumerFeedbackForDoctor() {
    this._dataContext.SubmitConsumerFeedbackForDoctor(this.feedbackAns)
      .subscribe(response => {
        if (response.Result == 'Success') {
          this.feedbackAns = [];
          this.userRating = 5;
          this.userMessage = "";
          this.commonService.onMessageHandler("Thank you for your feedback.", 1);
        }
        this.reviewModal.style.display = "none";
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed.", 0);
        });
  }
  applyFilter() {
    this.getHealthPackages();
  }
  openReviewModal() {
    this.reviewModal.style.display = "block";
  }
  closeModal() {
    this.reviewModal.style.display = "none";
  }
  closeCurrentPage() {
    this.navCtrl.pop();
    //this.appCtrl.getRootNav().pop();
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
        //lab profile will be added
        tempLabProfile.push(data);
      }
      this.bookingDCOrder.push(
        {
          DiagnosticCenter: this.selectedDiagnosticCenter,
          Package: tempPackage,
          LabTest: tempTest,
          LabScan: tempScan,
          LabProfile: tempLabProfile
        }
      );
      this.addedPackageAndTestInCart.push(this.bookingDCOrder[0]);
      this.commonService.onMessageHandler("Successfully added this package in your cart", 1);
    }
    this.showAddedPackageCount = this.addedItemInCartCount;
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart);
  }
  selectedPackage(data) {
    //this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart"), this.addedPackage).then(response => {
    this.navCtrl.push("PackageDetail", { selectedCenter: this.selectedDiagnosticCenter, selectedPackage: data });
    // })
  }
  bookPackage(data) {
    let DiagnosticCenterName: any = {};
    let tempPackage = [];
    tempPackage.push(data);
    // DiagnosticCenterName.CenterID = this.selectedDiagnosticCenter.CenterID;
    // DiagnosticCenterName.CityAreaName = this.selectedDiagnosticCenter.CityAreaName;
    // DiagnosticCenterName.City = this.selectedDiagnosticCenter.City;
    // DiagnosticCenterName.CenterName = this.selectedDiagnosticCenter.CenterName;
    DiagnosticCenterName = this.selectedDiagnosticCenter;
    DiagnosticCenterName.ProviderImage = data.ImageUrl != null && data.ImageUrl != undefined && data.ImageUrl != "" ? data.ImageUrl : "";
    this.addedPackage =
      {
        DiagnosticCenterName: DiagnosticCenterName,
        Package: tempPackage
      }
    this.navCtrl.push("DiagnosticLabBooking", { providerInfo: this.addedPackage });
  }
  ionViewWillLeave() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart);
  }
  goToCart() {
    this.navCtrl.push("AddtoCart");
  }
  goToFilter() {
    let isSelectedTab = this.tabValue == "item-0" ? "HealthPackage" : this.tabValue == "item-2" ? "LabProfile" : "null";
    let addModal = this.modalCtrl.create("DCFilter", { activeTab: isSelectedTab });
    addModal.onDidDismiss(item => {
      if (item) {
        this.labTestList = [];
        this.healthPackageList = [];
        this.labProfileList = [];
        this.labScanList = [];
        this.healthPackageSearch.Page = 1;
        this.labTestSearch.Page = 1;
        this.labProfileSearch.Page = 1;
        this.labScanSearch.Page = 1;
        if (Number(item.age) == 5) {
          item.age = 0;
        }
        if (Number(item.gender) == 3) {
          item.gender = 0;
        }
        this.getActiveTab(this.tabValue, item);
      }
    });
    addModal.present();
  }
  getLocationOnMap() {
    let url = "https://maps.google.com/maps?q=" + this.selectedDiagnosticCenter.LatLng + "&hl=es;z=14&amp;output=embed";
    const browser = this.iab.create(url, '_blank');
    browser.show();
  }
  //While Tab change
  tabSelection(event, value) {
    let filterResult: any = {
      minPrice: 0,
      maxPrice: 10000,
      age: 5,
      gender: 3,
      orderBy: []
    };
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getFilterData"))
      .then((result) => {
        if (result) {
          filterResult = result;
        }
        this.selectedTabResponse(event, value, filterResult);
      });
  }
  selectedTabResponse(event, value, filterResult) {
    if (value.module == 'HealthPackage') {
      this.optionObj = 0;
      this.healthPackageSearch.Page = 1;
      this.tabValue = "item-" + this.optionObj;
      this.healthPackageList = [];
      //this.getHealthPackageList();
    }
    else if (value.module == "LabTest") {
      this.optionObj = 1;
      this.labTestSearch.Page = 1;
      this.tabValue = "item-" + this.optionObj;
      this.labTestList = [];
      //this.getLabTestList();

    }
    else if (value.module == "LabProfile") {
      this.optionObj = 2; this.getLabTestList();
      this.labProfileSearch.Page = 1;
      this.tabValue = "item-" + this.optionObj;
      this.labProfileList = [];
      // this.getLabProfileList();
    }
    else if (value.module == "LabScan") {
      this.optionObj = 3;
      this.labScanSearch.Page = 1;
      this.tabValue = "item-" + this.optionObj;
      this.labScanList = [];
      //this.getLabScanList();
    }
    else {

    }
    this.getActiveTab(this.tabValue, filterResult);
  }
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getActiveTab(this.tabValue, false);
      infiniteScroll.complete();
    }, 500);
  }
  getActiveTab(key, filterData) {
    if (Number(filterData.age) == 5) {
      filterData.age = 0;
    }
    if (Number(filterData.gender) == 3) {
      filterData.gender = 0;
    }
    switch (key) {
      case 'item-0':
        if (filterData) {
          this.healthPackageSearch.MinPrice = filterData.minPrice;
          this.healthPackageSearch.MaxPrice = filterData.maxPrice;
          this.healthPackageSearch.AgeGroup = filterData.age;
          this.healthPackageSearch.Gender = filterData.gender;
          this.healthPackageSearch.Ordering = filterData.orderBy;
        }
        this.getHealthPackageList();
        break;
      case 'item-1':
        if (filterData) {
          this.labTestSearch.MinPrice = filterData.minPrice;
          this.labTestSearch.MaxPrice = filterData.maxPrice;
          this.labTestSearch.AgeGroup = filterData.age;
          this.labTestSearch.Gender = filterData.gender;
          this.labTestSearch.Ordering = filterData.orderBy;
        }
        this.getLabTestList();
        break;
      case 'item-2':
        if (filterData) {
          this.labProfileSearch.MinPrice = filterData.minPrice;
          this.labProfileSearch.MaxPrice = filterData.maxPrice;
          this.labProfileSearch.AgeGroup = filterData.age;
          this.labProfileSearch.Gender = filterData.gender;
          this.labProfileSearch.Ordering = filterData.orderBy;
        }
        this.getLabProfileList();
        break;
      case 'item-3':
        if (filterData) {
          this.labScanSearch.MinPrice = filterData.minPrice;
          this.labScanSearch.MaxPrice = filterData.maxPrice;
          this.labScanSearch.AgeGroup = filterData.age;
          this.labScanSearch.Gender = filterData.gender;
          this.labScanSearch.Ordering = filterData.orderBy;
        }
        this.getLabScanList();
        break;
      default:
        break;
    }
  }
}
