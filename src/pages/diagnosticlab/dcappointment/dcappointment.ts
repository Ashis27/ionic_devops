import { Component } from '@angular/core';
import { App, NavParams, IonicPage, NavController, AlertController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';
import * as $ from 'jquery';

@IonicPage()
@Component({
  selector: 'page-dcappointment',
  templateUrl: 'dcappointment.html'

})
export class DiagnosticLabBooking {
  BookingDCInfo: any = {};
  sevenDaysAvailability: any = [];
  appoChargesPg: any = [];
  scheduleDetails: any = [];
  maxDate: string;
  minDate: string;
  isEmptySlots: boolean = true;
  showSelectedDate: string;
  showCurrentDate: string;
  selectedSlot: string;
  doctorShceduleCharges: any;
  hospitalList: any = [];
  groupEntityId: number = 0;
  isDateSelected: boolean = false;
  selectedHospitalName: string;
  selectedHospital: any = {};
  isDocAvailable: boolean = true;
  userId: number = 0;
  countList: any = [];
  addedPackageAndTestInCart: any = [];
  packageCount: number = 0;
  showAddedPackageCount: number = 0;
  addedPackage: any = [];
  packages: any = [];
  isAvailable: boolean = true;
  BookingDCInfoStatus: boolean = true;
  totalPrice: number = 0;
  bookingFrom: boolean = false;
  userDetails: any;

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
    this.BookingDCInfo = this.navParams.get('BookingDCInfo');
    this.bookingFrom = this.navParams.get('boookFromCart');
    this.getTotalPrice();
  }
  ionViewDidEnter() {
    this.maxDate = "2049-12-31";
    this.minDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    this.showSelectedDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    this.showCurrentDate = moment().format('DD-MMM-YYYY');
    this.getUserInfo();
    this.getLabSettingsByGroupEntityID();

    this.commonService.onEntryPageEvent("Enter to diagnostic appointment");
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
  getTotalPrice() {
    if (this.BookingDCInfo != null) {
      this.totalPrice = 0;
      if (this.BookingDCInfo.Package.length > 0) {
        this.BookingDCInfo.Package.filter(item => {
          this.totalPrice += Number(item.PriceAfterDiscount);
        });
      }
      if (this.BookingDCInfo.LabTest.length > 0) {
        this.BookingDCInfo.LabTest.filter(item => {
          this.totalPrice += Number(item.PriceAfterDiscount);
        });
      }
      if (this.BookingDCInfo.LabScan.length > 0) {
        this.BookingDCInfo.LabScan.filter(item => {
          this.totalPrice += Number(item.PriceAfterDiscount);
        });
      }
      if (this.BookingDCInfo.LabProfile.length > 0) {
        this.BookingDCInfo.LabProfile.filter(item => {
          this.totalPrice += Number(item.PriceAfterDiscount);
        });
      }
    }
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
          this.isAvailable = true;
        }
        else {
          this.addedPackageAndTestInCart = [];
          this.showAddedPackageCount = 0;
          this.isAvailable = false;
        }
      });
  }
  checkBookingDCInfo() {
    if (this.BookingDCInfo.LabProfile.length == 0 && this.BookingDCInfo.LabScan.length == 0 && this.BookingDCInfo.LabTest.length == 0 && this.BookingDCInfo.Package.length == 0) {
      this.BookingDCInfoStatus = false;
      this.isAvailable = false;
    }
  }
  getLabSettingsByGroupEntityID() {
    this._dataContext.GetLabSettingsByGroupEntityID(this.BookingDCInfo.DiagnosticCenter.CenterID)
      .subscribe(response => {
        if (response.SlotList.length > 0) {
          if (moment(this.showCurrentDate).isAfter(moment().format('DD-MMM-YYYY'))) {
            this.scheduleDetails = response.SlotList;
          }
          else {
            let filterResult: any = [];
            response.SlotList.filter(item => {
              //Slot must gretter or equal than current time.
              let currentTime = moment().format("HH:mm:ss");
              //let currentTime = moment(moment(),"h:mm:ss A").format("HH:mm:ss");
              let slotTime = moment(item, "h:mm:ss A").format("HH:mm:ss");
              if (slotTime >= currentTime) {
                filterResult.push(item);
              }
            });
            this.scheduleDetails = filterResult;
            if (this.scheduleDetails.length > 0) {
              this.isEmptySlots = true;
            }
            else {
              this.isEmptySlots = false;
            }
          }

        }
        else {
          this.isEmptySlots = false;
          this.scheduleDetails = [];
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
  onSelectedDate() {
    this.showCurrentDate = moment(this.showSelectedDate).format('DD-MMM-YYYY');//this.showSelectedDate;
    this.getLabSettingsByGroupEntityID();
  }
  removePckage(item) {

  }
  slotSelectedToBookAppo(value, event) {
    $(".li-time-selector").removeClass("li-time-selector-active");
    $(event.currentTarget).addClass("li-time-selector-active");
    //this.navCtrl.push("AppointmentPreConfirmation", { doctorDetails: this.BookingDCInfo, hospital: this.BookingDCInfo });
    this.navCtrl.push("DCLabBookingpPreConfirmation", { providerDetails: this.BookingDCInfo, timeSlotInfo: { timeSlot: value, date: this.showCurrentDate } });
  }
  deletePackage(pck) {
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
            this.BookingDCInfo.Package.splice(pck, 1);
            this.addedPackageAndTestInCart.filter(item => {
              if (Number(item.DiagnosticCenter.CenterID) === Number(item.DiagnosticCenter.CenterID)) {
                item.Package = this.BookingDCInfo.Package;
              }
            });
            this.isAvailable = this.addedPackageAndTestInCart.length > 0 ? true : false;
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart).then(response => {
              this.getAddedPackageFromCart();
              this.checkBookingDCInfo();
              this.getTotalPrice();
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
            this.BookingDCInfo.LabTest.splice(test, 1);
            this.addedPackageAndTestInCart.filter(item => {
              if (Number(item.DiagnosticCenter.CenterID) === Number(item.DiagnosticCenter.CenterID)) {
                item.LabTest = this.BookingDCInfo.LabTest;
              }
            });
            this.isAvailable = this.addedPackageAndTestInCart.length > 0 ? true : false;
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart).then(response => {
              this.getAddedPackageFromCart();
              this.checkBookingDCInfo();
              this.getTotalPrice();
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
            this.BookingDCInfo.LabScan.splice(scan, 1);
            this.addedPackageAndTestInCart.filter(item => {
              if (Number(item.DiagnosticCenter.CenterID) === Number(item.DiagnosticCenter.CenterID)) {
                item.LabScan = this.BookingDCInfo.LabScan;
              }
            });
            this.isAvailable = this.addedPackageAndTestInCart.length > 0 ? true : false;
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart).then(response => {
              this.getAddedPackageFromCart();
              this.checkBookingDCInfo();
              this.getTotalPrice();
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
            this.BookingDCInfo.LabProfile.splice(profile, 1);
            this.addedPackageAndTestInCart.filter(item => {
              if (Number(item.DiagnosticCenter.CenterID) === Number(item.DiagnosticCenter.CenterID)) {
                item.LabProfile = this.BookingDCInfo.LabProfile;
              }
            });
            this.isAvailable = this.addedPackageAndTestInCart.length > 0 ? true : false;
            this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPackageFromCart") + "/" + this.userId, this.addedPackageAndTestInCart).then(response => {
              this.getAddedPackageFromCart();
              this.checkBookingDCInfo();
              this.getTotalPrice();
            });
          }
        }
      ]
    });
    alert.present();
  }
  selectedHealthPackage(data) {
    this.navCtrl.push("HealthPackageProfile", { selectedCenter: this.BookingDCInfo.DiagnosticCenter, selectedPackage: data });
  }
  selectedDiagnosticCenter(data) {
    this.navCtrl.push("DiagnosticCenterProfile", { selectedCenter: data.DiagnosticCenter });
  }
  selectedLabTest(data) {
    this.navCtrl.push("LabTestProfile", { selectedCenter: this.BookingDCInfo.DiagnosticCenter, selectedLabTest: data });
  }
  selectedLabScan(data) {
    this.navCtrl.push("ScanProfile", { selectedCenter: this.BookingDCInfo.DiagnosticCenter, selectedScan: data });
  }
  selectedLabProfile(data) {
    this.navCtrl.push("LabProfile", { selectedCenter: this.BookingDCInfo.DiagnosticCenter, selectedLabProfile: data });
  }






    }



