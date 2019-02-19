import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../../providers/dataContext.service';
import { CommonServices } from '../../../../providers/common.service';
import moment from 'moment';
import * as $ from 'jquery';

@IonicPage()
@Component({
  selector: 'page-healthplandiagnosticappointment',
  templateUrl: 'healthplandiagnosticappointment.html'
})
export class HealthPlanDiagnosticAppointmentHistory {
  appointmentHistoryList = [];
  categoryId: number = 0;
  healthPlanId: number = 0;
  consumerId: number = 0;
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };


  constructor(public navParams: NavParams, private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController) {
    this.healthPlanId = this.navParams.get("healthPlanId");
  }
  ionViewDidEnter() {
    this.getLoggedonUserDetails();
  }
  getLoggedonUserDetails() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.consumerId = result.ConsumerID;
          this.getAppointmentHistory();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  getAppointmentHistory() {
    this.categoryId = 2;
    this._dataContext.GetHealthPlanAppointmentHistory(this.categoryId, this.healthPlanId, this.consumerId)
      .subscribe(response => {
        if (response.length > 0) {
          this.appointmentHistoryList = response;
          this.appointmentHistoryList.forEach(item => {
            item["Date"] = moment(item.ScheduledDate).format("DD-MMM-YYYY");
            item["Day"] = moment(moment(item.ScheduledDate).format("DD-MMM-YYYY")).format("ddd");
          });
        }
        else {
          this.appointmentHistoryList = [];
        }
      },
      error => {
        console.log(error);
        this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
      });
  }
  redirectTo(value) {
    this.navCtrl.push(value);
  }
  gotoAppoDetails(data) {
    if (!data.Expired) {
      let addModal = this.modalCtrl.create("UploadAppoStatus", { lineItemDetails: data, healthPlanId: this.healthPlanId, pageStatus: "DCAppointment" });
      addModal.onDidDismiss(item => {
        if (item) {
          this.getAppointmentHistory();
        }
      })
      addModal.present();

    }
    else {
      this.commonService.onMessageHandler("This schedule is expired. You can not change the status.", 0);
    }
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
  addNewAppointment() {
    this.navCtrl.push("DiagnosticGenericSearch", { searchedKeyWord: "" });
  }
  bookAppointment(data) {
    this.navCtrl.push("DiagnosticGenericSearch", { searchedKeyWord: "", data });
    let DiagnosticData = {Category: data.Category, ProviderHealthPlanId: data.ProviderHealthPlanId, ProviderHealthPlanLineItemId: data.Id };
    this.commonService.setStoreDataIncache("diagnosticAppointmentdetails", DiagnosticData);
  }
  // selectedAppo(id) {
  //   $(".commom-fab-btn").removeClass("fab-close-active");
  //   $(".commom-fab-gotoAppoDetailslist").removeClass("fab-list-active");
  //   $(".fab-btn-" + id).addClass("fab-close-active");
  //   $(".fab-list-" + id).addClass("fab-list-active");
  // }
}
