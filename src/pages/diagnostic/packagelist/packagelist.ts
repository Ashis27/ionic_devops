import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, PopoverController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';

@IonicPage()
@Component({
  selector: 'package-list',
  templateUrl: 'packagelist.html',
})

export class PackageList {
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
  countList: any = []; any = [];
  addedPackageFromCart: any = [];
  packageCount: number = 0;
  userId: number = 0;
  constructor(public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public elemRef: ElementRef, public alertCtrl: AlertController, public popoverCtrl: PopoverController) {
    this.selectedDiagnosticCenter = this.navParams.get('selectedCenter');
    this.addedPackage.DiagnosticCenterName = this.selectedDiagnosticCenter;
    this.reviewModal = document.getElementById('openReviewModal');

  }

  ionViewDidEnter() {
    this.packageCount = 0;
    this.showAddedPackageCount = 0;
    this.addedPackage.Package = [];
    this.countList = [];
    //this.getPackageGendersList();
    this.getUserInfo();
    this.commonService.onEntryPageEvent("Enter to diagnostic package list");
  }
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getAddedPackageFromCart();
          this.getHealthPackages();
          this.getPackageAgeGroupsListFromCache();
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
  filterPopover(myEvent) {
    let popover = this.popoverCtrl.create("FilterPopover");
    popover.present({
      ev: myEvent
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
  addToCart(data) {
    let pckStatus = 0;
    let centerStatus = 0;
    let centerID = data.GroupEntityId;
    this.addedPackageFromCart.filter(item => {
      if (item.DiagnosticCenterName.CenterID === this.selectedDiagnosticCenter.CenterID) {
        centerStatus++;
        item.Package.filter(pck => {
          if (pck.PackageName.toLowerCase() == data.PackageName.toLowerCase() && pck.CenterID === data.CenterID) {
            this.commonService.onMessageHandler("This package is already in your cart", 0);
            pckStatus++;
          }
        })
        if (pckStatus == 0) {
          item.Package.push(data);
          this.packageCount = item.Package.length;
          this.commonService.onMessageHandler("Successfully added this package in your cart", 1);
        }
      }
    })
    if (centerStatus == 0) {
      this.packageCount++;
      this.addedPackage.Package.push(data);
      this.addedPackageFromCart.push(this.addedPackage);
      this.commonService.onMessageHandler("Successfully added this package in your cart", 1);
    }
    this.showAddedPackageCount = this.packageCount;
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageFromCart);
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
    this.navCtrl.push("DiagnosticAppointment", { providerInfo: this.addedPackage });
  }
  ionViewWillLeave() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageFromCart);
  }
  goToCart() {
    this.navCtrl.push("CartList");
  }

}
