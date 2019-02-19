import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-userfavouritedoctors',
  templateUrl: 'userfavouritedoctors.html'
})
export class UserFavouriteDoctors {
  providers: any = [];
  pageSize: number = 3;
  isRecentAppoAvailable: boolean = true;
  isFavouriteAvailable: boolean = true;
  recentAppointmentList: any = [];
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
  constructor(public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {

  }
  ionViewDidEnter() {
    this.GetRecentAppointment();
    this.getMyFavourite();
    this.getCurrentLocationFromCache();
  }
  GetRecentAppointment() {
    this._dataContext.GetRecentAppointmentList(this.pageSize)
      .subscribe(response => {
        if (response.Status && response.Result.length > 0) {
          this.recentAppointmentList = response.Result;
          this.isRecentAppoAvailable = true;
        }
        else {
          this.isRecentAppoAvailable = false;
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  getFavouriteDoctorsFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getFavDoctors"))
      .then((result) => {
        if (result) {
          this.providers = result.reverse();
          this.isFavouriteAvailable = true;
        }
        else {
          this.isFavouriteAvailable = false;
          this.getMyFavourite();
        }
      });
  }
  getMyFavourite() {
    this._dataContext.GetMyFavouriteDoctors(0)
      .subscribe(response => {
        if (response.result.length > 0) {
          this.providers = response.result.reverse();
          this.isFavouriteAvailable = true;;
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getFavDoctors"), response.result);
        }
        else {
          this.providers=[];
          this.isFavouriteAvailable = false;
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
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
  bookAppointment(data) {
    let doctorInformationDetails = {
      ProviderId: data.ProviderID,
      ProviderName: data.ProviderName,
      ProviderRating: 0,//data.OverAllRating.AverageRating,
      TotalRatedUser: 0,//data.OverAllRating.TotalCount,
      SpecializationName: data.SpecializationName,
      SpecializationId: data.SpecializationID,
      ProviderImage: data.ProviderImage,
      City: this.selectedCityAndLocation.activeCity,
      Locality: this.selectedCityAndLocation.activeLocation,
    }
    this.navCtrl.push("Appointment", { doctorDetails: doctorInformationDetails })
  }
  redirectTo(value, data) {
    data["ProviderID"] = data.ProviderID;
    this.navCtrl.push(value, { providerInfo: data});
  }
  bookNewAppointment(){
    this.navCtrl.push("BookAppointment");
  }
}
