import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
import { DataContext } from '../../../providers/dataContext.service';

@IonicPage()
@Component({
  selector: 'package-detail',
  templateUrl: 'packagedetail.html',
})

export class PackageDetail {
  selectedPackage: any;
  gender: string = "t1";
  addedPackage: any = {
    DiagnosticCenterName: {},
    Package: []
  };
  showAddedPackageCount: number = 0;
  countList: any = []; any = [];
  addedPackageFromCart: any = [];
  selectedDiagnosticCenter: any = {};
  packageCount: number = 0;
  userId: number = 0;
  constructor(public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public elemRef: ElementRef, public alertCtrl: AlertController) {
    this.selectedPackage = this.navParams.get('selectedPackage');
    this.selectedDiagnosticCenter = this.navParams.get('selectedCenter');
    this.addedPackage.DiagnosticCenterName = this.selectedDiagnosticCenter;
    //this.selectedDiagnosticCenter = this.commonService.convert_case(this.selectedDiagnosticCenter);
    this.selectedPackage.PackageName = this.commonService.convert_case(this.selectedPackage.PackageName);
  }
  ionViewDidEnter() {
    this.packageCount=0;
    this.showAddedPackageCount=0;
    this.addedPackage.Package = [];
    this.countList = [];
    this.getUserInfo();
  }
  closeCurrentPage() {
    this.navCtrl.pop();
    //this.appCtrl.getRootNav().pop();
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
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPackageFromCart")+ "/" + this.userId)
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
  addToCart() {
    let pckStatus = 0;
    let centerStatus = 0;
    this.addedPackageFromCart.filter(item => {
      if (item.DiagnosticCenterName.CenterID === this.selectedDiagnosticCenter.CenterID) {
        centerStatus++;
        item.Package.filter(pck => {
          if (pck.PackageName.toLowerCase() == this.selectedPackage.PackageName.toLowerCase() && pck.CenterID === this.selectedPackage.CenterID) {
            this.commonService.onMessageHandler("This package is already in your cart", 0);
            pckStatus++;
          }
        })
        if (pckStatus == 0) {
          item.Package.push(this.selectedPackage);
          this.packageCount = item.Package.length;
          this.commonService.onMessageHandler("Successfully added this package in your cart", 1);
        }
      }
    })
    if (centerStatus == 0) {
      this.packageCount++;
      this.addedPackage.Package.push(this.selectedPackage);
      this.addedPackageFromCart.push(this.addedPackage);
      this.commonService.onMessageHandler("Successfully added this package in your cart", 1);
    }
    this.showAddedPackageCount = this.packageCount;
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageFromCart);
  }
  bookPackage() {
    this.addedPackage.Package=[];
    this.addedPackage.Package.push(this.selectedPackage);
    this.navCtrl.push("DiagnosticAppointment", { providerInfo: this.addedPackage });
  }
  goToCart() {
    this.navCtrl.push("CartList");
  }
}
