import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../providers/dataContext.service';
import { CommonServices } from '../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-pharmacy',
  templateUrl: 'pharmacy.html'
})
export class Pharmacy {
  pharmacyFeedback: any = {
    Location: "",
    Message: ""
  };
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };

  constructor(private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController) { }
  ionViewDidEnter() {
    this.getCurrentLocationFromCache();
  }
  redirectToMenu(value, event) {
    // $(".footer-image-sec").removeClass("active-section").addClass("footer-back");
    // $(event.currentTarget).removeClass("footer-back").addClass("active-section");
    if (value == "DashBoard") {
      this.navCtrl.setRoot("DashBoard");
    }
  }
  getCurrentLocationFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
      .then((result) => {
        if ((result.activeCity != "" && result.activeCity != undefined && result.activeCity != "Choose City") || (result.activeLocation != "" && result.activeLocation != undefined && result.activeLocation != "Choose Locality")) {
          this.selectedCityAndLocation.activeCity = result.activeCity;
          this.selectedCityAndLocation.activeLocation = result.activeLocation;
          this.selectedCityAndLocation.activeCityKey = result.activeCityKey;
          this.selectedCityAndLocation.activeLocationKey = result.activeLocationKey;
          this.pharmacyFeedback.Location = this.selectedCityAndLocation.activeCity + ", " + this.selectedCityAndLocation.activeLocation;
        }
        else {
          this.selectedCityAndLocation = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
          this.getLocation();
        }
      });
  }
  getLocation() {
    let addModal = this.modalCtrl.create("CityLocation");
    addModal.onDidDismiss(item => {
      if (item) {
        if (item.activeCityKey != 0 || item.activeLocationKey != 0) {
          this.selectedCityAndLocation = item;
          this.pharmacyFeedback.Location = this.selectedCityAndLocation.activeCity + ", " + this.selectedCityAndLocation.activeLocation;
          this.storeLocationResultInCache();
        }
        else {
          this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
            .then((result) => {
              if ((result.activeCity != "" && result.activeCity != undefined) || (result.activeLocation != "" && result.activeLocation != undefined)) {
                this.selectedCityAndLocation.activeCity = result.activeCity;
                this.selectedCityAndLocation.activeLocation = result.activeLocation;
                this.selectedCityAndLocation.activeCityKey = result.activeCityKey;
                this.selectedCityAndLocation.activeLocationKey = result.activeLocationKey;
                this.pharmacyFeedback.Location = this.selectedCityAndLocation.activeCity + ", " + this.selectedCityAndLocation.activeLocation;
              }
              else {
                this.selectedCityAndLocation = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
              }
              this.storeLocationResultInCache();
            });
        }
      }
    })
    addModal.present();
  }
  storeLocationResultInCache() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: this.selectedCityAndLocation.activeCity, activeLocation: this.selectedCityAndLocation.activeLocation, activeCityKey: this.selectedCityAndLocation.activeCityKey, activeLocationKey: this.selectedCityAndLocation.activeLocationKey })
      .then((result) => {
      });
  }
  submitPharmacyFeedback(form: NgForm) {
    if (this.commonService.isValidateForm(form)) {
      this._dataContext.SendPharmacyFeedback(this.pharmacyFeedback)
        .subscribe(response => {
          if (response.Status) {
            this.pharmacyFeedback.Message = "";
            this.commonService.onMessageHandler(response.Message, 1);
          }
          else {
            this.commonService.onMessageHandler(response.Message, 0);
          }
        },
          error => {
            console.log(error);
            //loading.dismiss().catch(() => { });
            this.commonService.onMessageHandler("Failed. Please try again.", 0);
          });
    }
  }
}
