import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, IonicPage, NavParams, ViewController, AlertController } from 'ionic-angular';

//Pages
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";

@IonicPage()
@Component({
  selector: 'page-edituseraddress',
  templateUrl: 'edituseraddress.html'
})
export class EditUserAddress {
  userAddress: any = {};
  activeCountry: any = [];
  activeState: any = [];
  activeCity: any = [];
  status: boolean = false;
  countryCode: string;
  constructor(public alertCtrl: AlertController, private viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
    this.userAddress = this.navParams.get('address');
    this.activeCity = this.navParams.get('city');
    this.activeState = this.navParams.get('state');
    this.activeCountry = this.navParams.get('country');
    this.status = this.navParams.get('status');
    this.countryCode = this.activeCountry[0].DemographyCode;
  }
  //Entry point
  ionViewDidEnter() {

  }
  //Validate

  validateAddress(form: NgForm) {
    if (this.status) {
      this.updateAddress(form);
    }
    else {
      this.addUserShippingAddress(form);
    }
  }
  //Edit Address
  updateAddress(form: NgForm) {
    if (this.commonService.isValidateForm(form)) {
      this._dataContext.UpdateShippingAddress(this.userAddress)
        .subscribe(response => {
          if (response.Status) {
            this.userAddress = {};
            this.viewCtrl.dismiss();
            this.commonService.onMessageHandler(response.Message, 1);
          }
          else {
            this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
          }
        },
          error => {
            console.log(error);
            //loading.dismiss().catch(() => { });
            this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
          });
    }
  }
  //Add new consumer shipping address
  addUserShippingAddress(form: NgForm) {
    if (this.commonService.isValidateForm(form)) {
      this._dataContext.AddUserShippingAddress(this.userAddress)
        .subscribe(response => {
          if (response.Status) {
            this.userAddress = {};
            this.commonService.onMessageHandler(response.Message, 1);
            this.viewCtrl.dismiss();
          }
          else {
            this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
          }
        },
          error => {
            console.log(error);
            //loading.dismiss().catch(() => { });
            this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
          });
    }
  }
  //Close modal
  closeModal() {
    this.viewCtrl.dismiss();
  }
  //validate only number
  onlyNumber(event) {
    return this.commonService.validateOnlyNumber(event);
  }
  redirectToMenu(value,event) {
    // $(".footer-image-sec").removeClass("active-section").addClass("footer-back");
    // $(event.currentTarget).removeClass("footer-back").addClass("active-section");
    if (value == "DashBoard") {
      this.navCtrl.setRoot("DashBoard");
    }
  }
}

