import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
import { DataContext } from '../../../providers/dataContext.service';

@IonicPage()
@Component({
  selector: 'page-addtocart',
  templateUrl: 'addtocart.html',
})

export class AddtoCart {
  countList: any = [];
  userId: number = 0;
  addedPackageAndTestInCart: any = [];
  packageCount: number = 0;
  addedPackage: any = [];
  showAddedPackageCount: number = 0;
  isAvailable: boolean = true;
  constructor(public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public elemRef: ElementRef, public alertCtrl: AlertController) {

  }
  ionViewDidEnter() {
    this.showAddedPackageCount = 0;
    this.countList = [];
    this.getUserInfo();
    this.commonService.onEntryPageEvent("Enter to diagnostic Cart list");
  }
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getAddedPackageFromCart();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  getAddedPackageFromCart() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId)
      .then((result) => {
        console.log(result);
        if (result && result.length > 0) {
          this.addedPackageAndTestInCart = result;
          this.addedPackageAndTestInCart.filter(item => {
            let totalPrice = 0;
            if (item.Package.length > 0) {
              item.Package.filter(item => {
                totalPrice += Number(item.PriceAfterDiscount);
                this.countList.push(item);
              });
            }
            if (item.LabTest.length > 0) {
              item.LabTest.filter(item => {
                totalPrice += Number(item.PriceAfterDiscount);
                this.countList.push(item);
              });
            }
            if (item.LabScan.length > 0) {
              item.LabScan.filter(item => {
                totalPrice += Number(item.PriceAfterDiscount);
                this.countList.push(item);
              });
            }
            if (item.LabProfile.length > 0) {
              item.LabProfile.filter(item => {
                totalPrice += Number(item.PriceAfterDiscount);
                this.countList.push(item);
              });
            }
            item["totalPrice"] = Math.round(totalPrice);
          });
          this.packageCount = this.countList.length;
          this.showAddedPackageCount = this.countList.length;
          this.isAvailable = this.showAddedPackageCount > 0 ? true : false;
        }
        else {
          this.addedPackageAndTestInCart = [];
          this.showAddedPackageCount = 0;
          this.isAvailable = false;
        }
      });
  }
  deletePackage(data, pck) {
    let alert = this.alertCtrl.create({
      title: "Delete Package",
      message: 'Do you want to delete?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          role: 'cancel',
          handler: () => {
            this.addedPackageAndTestInCart[data].Package.splice(pck, 1);
            if (this.addedPackageAndTestInCart[data].LabProfile.length == 0 && this.addedPackageAndTestInCart[data].LabScan.length == 0 && this.addedPackageAndTestInCart[data].LabTest.length == 0 && this.addedPackageAndTestInCart[data].Package.length == 0) {
              this.addedPackageAndTestInCart.splice(data, 1);
            }
            this.isAvailable = this.addedPackageAndTestInCart.length > 0 ? true : false;
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart).then(response => {
              this.getAddedPackageFromCart()
            });
          }
        }
      ]
    });
    alert.present();
  }
  deleteLabTest(data, test) {
    let alert = this.alertCtrl.create({
      title: "Delete Lab Test",
      message: 'Do you want to delete?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          role: 'cancel',
          handler: () => {
            this.addedPackageAndTestInCart[data].LabTest.splice(test, 1);
            if (this.addedPackageAndTestInCart[data].LabProfile.length == 0 && this.addedPackageAndTestInCart[data].LabScan.length == 0 && this.addedPackageAndTestInCart[data].LabTest.length == 0 && this.addedPackageAndTestInCart[data].Package.length == 0) {
              this.addedPackageAndTestInCart.splice(data, 1);
            }
            this.isAvailable = this.addedPackageAndTestInCart.length > 0 ? true : false;
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart).then(response => {
              this.getAddedPackageFromCart()
            });
          }
        }
      ]
    });
    alert.present();
  }
  deleteLabScan(data, scan) {
    let alert = this.alertCtrl.create({
      title: "Delete Radiology",
      message: 'Do you want to delete?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          role: 'cancel',
          handler: () => {
            this.addedPackageAndTestInCart[data].LabScan.splice(scan, 1);
            if (this.addedPackageAndTestInCart[data].LabProfile.length == 0 && this.addedPackageAndTestInCart[data].LabScan.length == 0 && this.addedPackageAndTestInCart[data].LabTest.length == 0 && this.addedPackageAndTestInCart[data].Package.length == 0) {
              this.addedPackageAndTestInCart.splice(data, 1);
            }
            this.isAvailable = this.addedPackageAndTestInCart.length > 0 ? true : false;
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart).then(response => {
              this.getAddedPackageFromCart()
            });
          }
        }
      ]
    });
    alert.present();
  }
  deleteLabProfile(data, profile) {
    let alert = this.alertCtrl.create({
      title: "Delete Lab Profile",
      message: 'Do you want to delete?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          role: 'cancel',
          handler: () => {
            this.addedPackageAndTestInCart[data].LabProfile.splice(profile, 1);
            if (this.addedPackageAndTestInCart[data].LabProfile.length == 0 && this.addedPackageAndTestInCart[data].LabScan.length == 0 && this.addedPackageAndTestInCart[data].LabTest.length == 0 && this.addedPackageAndTestInCart[data].Package.length == 0) {
              this.addedPackageAndTestInCart.splice(data, 1);
            }
            this.isAvailable = this.addedPackageAndTestInCart.length > 0 ? true : false;
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart).then(response => {
              this.getAddedPackageFromCart();
            });
          }
        }
      ]
    });
    alert.present();
  }
  bookSelectedOrder(item) {
    this.navCtrl.push("DiagnosticLabBooking", { BookingDCInfo: item, boookFromCart: true });
  }
  ionViewWillLeave() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart);
  }
  removeAllPackages() {
    let alert = this.alertCtrl.create({
      title: "Clear All",
      message: 'Do you want to delete all?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          role: 'cancel',
          handler: () => {
            this.addedPackageAndTestInCart = [];
            this.isAvailable = false;
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart);
          }
        }
      ]
    });
    alert.present();
  }
  closeCurrentPage() {
    this.navCtrl.pop();
    //this.appCtrl.getRootNav().pop();
  }
  selectedHealthPackage(center, data) {
    this.navCtrl.push("HealthPackageProfile", { selectedCenter: center, selectedPackage: data });
  }
  selectedDiagnosticCenter(data) {
    this.navCtrl.push("DiagnosticCenterProfile", { selectedCenter: data.DiagnosticCenter });
  }
  selectedLabTest(center, data) {
    this.navCtrl.push("LabTestProfile", { selectedCenter: center, selectedLabTest: data });
  }
  selectedLabScan(center, data) {
    this.navCtrl.push("ScanProfile", { selectedCenter: center, selectedScan: data });
  }
  selectedLabProfile(center, data) {
    this.navCtrl.push("LabProfile", { selectedCenter: center, selectedLabProfile: data });
  }
}
