import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, IonicPage, NavParams, ViewController, AlertController, ModalController } from 'ionic-angular';

//Pages
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";

@IonicPage()
@Component({
  selector: 'page-useraddress',
  templateUrl: 'useraddress.html'
})
export class UserAddress {
  activeCountry: any = [];
  activeState: any = [];
  activeCity: any = [];
  userAddress: any = {};
  tapOption: any = [];
  // optionObj: number = 0;
  shippingAddressList: any = [];
  isAvailable: boolean = true;
  backUpList: any = [];
  countryCode: string;
  active_country_state: string;
  constructor(
    public alertCtrl: AlertController,
    private viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public _dataContext: DataContext,
    private commonService: CommonServices,
    private modalCtrl: ModalController,
  ) {
    // this.tapOption[0] = "Add New Address";
    // this.tapOption[1] = "Your Address";
    this.getActiveCitieseFromCache();
    this.getActiveCountryAndStateFromCache();
    this.getUserShippingAddress();
  }
  //Entry point
  ionViewDidEnter() {

  }
  //Add new consumer shipping address
  addUserShippingAddress(form: NgForm) {
    if (this.commonService.isValidateForm(form)) {
      this._dataContext.AddUserShippingAddress(this.userAddress)
        .subscribe(response => {
          if (response.Status) {
            this.userAddress = {};
            this.commonService.onMessageHandler(response.Message, 1);
            this.getUserShippingAddress();
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
  //Get User Shipping address list 
  getUserShippingAddress() {
    this._dataContext.GetUserShippingAddress()
      .subscribe(response => {
        if (response.Result == "Success") {
          this.shippingAddressList = response.Data;
          this.isAvailable = response.Data.length > 0 ? true : false;
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

  //Get active countries and states from cache, if not available then get from server.
  getActiveCountryAndStateFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveCountryAndState"))
      .then((result) => {
        if (result) {
          this.countryCode = result.countriesAvailable[0].DemographyCode;
          this.activeCountry = result.countriesAvailable;
          this.activeState = result.statesAvailable;
          this.getActiveCountriesAndStates(0);
        }
        else {
          this.getActiveCountriesAndStates(1);
        }
      });
  }
  //Open Address form
  addUserAddress() {
    let addModal = this.modalCtrl.create("EditUserAddress", { address: {}, city: this.activeCity, state: this.activeState, country: this.activeCountry,status:false });
    addModal.onDidDismiss(item => {
      // if (item) {
      this.getUserShippingAddress();
      //  }
    })
    addModal.present();
  }
  //Get Active Countries and States based on network status.
  getActiveCountriesAndStates(value) {
    this._dataContext.GetActiveCountryAndState(value)
      .subscribe(response => {
        if (response.Result == "Success") {
          this.activeCountry = response.Data.countriesAvailable;
          this.countryCode = response.Data.countriesAvailable[0].DemographyCode;
          this.activeState = response.Data.statesAvailable;
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveCountryAndState"), response.Data);
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

  //Get active Cities from cache, if not available then get from server.
  getActiveCitieseFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCities"))
      .then((result) => {
        if (result) {
          this.activeCity = result.Data;
          this.getActiveCities(0);
        }
        else {
          this.getActiveCities(1);
        }
      });
  }
  //Get active cities
  getActiveCities(value) {
    this._dataContext.GetActiveCity(value)
      .subscribe(response => {
        if (response.Result == "Success") {
          this.activeCity = response.Data;
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
  // //While Tab change
  // tabSelection(event, value) {
  //   if (value == 'Add New Address') {
  //     this.optionObj = 0;
  //   }
  //   else {
  //     this.getUserShippingAddress();
  //     this.optionObj = 1;
  //   }
  // }
  //Edit Address
  updateAddress(data) {
    let addModal = this.modalCtrl.create("EditUserAddress", { address: data, city: this.activeCity, state: this.activeState, country: this.activeCountry,status:true });
    addModal.onDidDismiss(item => {
      // if (item) {
      this.getUserShippingAddress();
      //  }
    })
    addModal.present();
  }
  //Delete address
  deleteAddress(data) {
    let alert = this.alertCtrl.create({
      title:"Delete",
      message: 'Do you want to Delete ?',
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: () => {
            //this.viewCtrl.dismiss();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this._dataContext.DeleteShippingAddress(data)
              .subscribe(response => {
                if (response.Status) {
                  this.commonService.onMessageHandler(response.Message, 1);
                  this.getUserShippingAddress();
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
      ]
    });
    alert.present();
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

