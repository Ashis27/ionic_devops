import { Component } from '@angular/core';
import { App, NavParams, IonicPage, NavController, AlertController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';
import * as $ from 'jquery';

@IonicPage()
@Component({
  selector: 'page-diagnosticappointment',
  templateUrl: 'diagnosticappointment.html'

})
export class DiagnosticAppointment {
  providerInfo: any = [];
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
  addedPackageFromCart: any = [];
  packageCount: number = 0;
  showAddedPackageCount: number = 0;
  addedPackage: any = [];
  packages: any = [];
  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
    this.providerInfo = this.navParams.get('providerInfo');
  }
  ionViewDidEnter() {
    this.maxDate = "2049-12-31";
    this.minDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    this.showSelectedDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    this.showCurrentDate = moment().format('DD-MMM-YYYY');
    this.getUserInfo();
    this.getLabSettingsForGroupEntity();
    this.commonService.onEntryPageEvent("Enter to diagnostic appointment");
  }
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          //this.getAddedPackageFromCart();
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
  getLabSettingsForGroupEntity() {
    this._dataContext.GetLabSettingsByGroupEntityID(this.providerInfo.DiagnosticCenterName.CenterID)
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
            if(this.scheduleDetails.length > 0){
              this.isEmptySlots = true;
            }
            else{
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
    this.getLabSettingsForGroupEntity();
  }
  removePckage(item) {

  }
  slotSelectedToBookAppo(value, event) {
    $(".li-time-selector").removeClass("li-time-selector-active");
    $(event.currentTarget).addClass("li-time-selector-active");
    //this.navCtrl.push("AppointmentPreConfirmation", { doctorDetails: this.providerInfo, hospital: this.providerInfo });
    this.navCtrl.push("DiagnosticAppointmentPreConfirmation", { providerDetails: this.providerInfo, timeSlotInfo: { timeSlot: value, date: this.showCurrentDate } });
  }
}







