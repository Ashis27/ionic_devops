import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
import { DataContext } from '../../../providers/dataContext.service';

@IonicPage()
@Component({
  selector: 'cart-list',
  templateUrl: 'cartlist.html',
})

export class CartList {
  countList: any = [];
  userId: number = 0;
  addedPackageFromCart: any = [];
  packageCount: number = 0;
  addedPackage: any = [];
  showAddedPackageCount: number = 0;
  isAvailable: boolean = true;
  constructor(public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public elemRef: ElementRef, public alertCtrl: AlertController) {

  }
  ionViewDidEnter() {
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
        if (result && result.length > 0) {
          console.log(result);
          this.addedPackageFromCart = result;
          this.addedPackageFromCart.filter(item => {
            let totalPrice = 0;
            item.Package.filter(pck => {
              this.countList.push(pck);
              totalPrice += Number(pck.PriceAfterDiscount);
            })
            item["totalPrice"] = totalPrice.toFixed(2);
          });
          this.packageCount = this.countList.length;
          this.showAddedPackageCount = this.countList.length;
          this.isAvailable = true;
        }
        else {
          this.addedPackageFromCart = [];
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
            this.addedPackageFromCart[data].Package.splice(pck, 1);
            if (this.addedPackageFromCart[data].Package.length == 0) {
              this.addedPackageFromCart.splice(data, 1);
            }
            this.isAvailable = this.addedPackageFromCart.length > 0 ? true : false;
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageFromCart).then(response=>{
              this.getAddedPackageFromCart()
            });
          }
        }
      ]
    });
    alert.present();
  }
  bookSelectedPackages(item) {
    this.navCtrl.push("DiagnosticAppointment", { providerInfo: item });
  }
  ionViewWillLeave() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageFromCart);
  }
  removeAllPackages() {
    let alert = this.alertCtrl.create({
      title: "Delete All Packages",
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
            this.addedPackageFromCart = [];
            this.isAvailable = false;
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageFromCart);
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
}
