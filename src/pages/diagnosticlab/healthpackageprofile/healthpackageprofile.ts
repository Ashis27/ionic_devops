import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
import { DataContext } from '../../../providers/dataContext.service';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-healthpackageprofile',
  templateUrl: 'healthpackageprofile.html',
  providers: [InAppBrowser]
})

export class HealthPackageProfile {
  selectedPackage: any;
  gender: string = "t1";
  addedPackage: any = {
    DiagnosticCenterName: {},
    Package: []
  };
  showAddedPackageCount: number = 0;
  countList: any = []; any = [];
  addedPackageAndTestInCart: any = [];
  selectedDiagnosticCenter: any = {};
  packageCount: number = 0;
  userId: number = 0;
  labTestList: any = [];
  labProfileList: any = [];
  bookingDCOrder: any = [];
  addedItemInCartCount: number = 0;

  constructor(private iab: InAppBrowser, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public elemRef: ElementRef, public alertCtrl: AlertController) {
    this.selectedPackage = this.navParams.get('selectedPackage');
    this.selectedDiagnosticCenter = this.navParams.get('selectedCenter');
    this.selectedPackage.LabPackageName = this.commonService.convert_case(this.selectedPackage.LabPackageName);
    this.selectedPackage.PriceAfterDiscount = Math.round(this.selectedPackage.PriceAfterDiscount);
    this.selectedPackage.GenericDiscount = Math.round(this.selectedPackage.GenericDiscount);
    this.selectedPackage.Price = Math.round(this.selectedPackage.Price);
  }
  ionViewDidEnter() {
    this.packageCount = 0;
    this.showAddedPackageCount = 0;
    this.addedItemInCartCount = 0;
    this.addedPackage.Package = [];
    this.countList = [];
    this.getUserInfo();
  }
  closeCurrentPage() {
    this.navCtrl.pop();
  }
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getAddedPackageFromCart();
          this.getHealthPackageProfile();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  getHealthPackageProfile() {
    this._dataContext.GetHealthPackageProfile(this.selectedPackage.LabPackageId, this.selectedPackage.GroupEntityId)
      .subscribe(response => {
        console.log(response);
        this.labTestList = response.LabTests;
        this.labProfileList = response.LabProfiles;
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
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
  goToCart() {
    this.navCtrl.push("AddtoCart");
  }
  getLocationOnMap() {
    let url = "https://maps.google.com/maps?q=" + this.selectedDiagnosticCenter.LatLng + "&hl=es;z=14&amp;output=embed";
    const browser = this.iab.create(url, '_blank');
    browser.show();
  }
}
