import { TweenMax, TimelineMax, Elastic, Linear } from "gsap/TweenMax";
import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, NavParams } from 'ionic-angular';
import moment from 'moment';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-actionbox',
  templateUrl: 'actionbox.html'
})
export class ActionBox {
  consumerId: number;
  healthPlanId: number;
  tapOption: any = [];
  userId: number;
  optionObj: number = 0;
  tabValue: string;
  itemsPerPageForUpcomingAppo = 20;
  itemsPerPageForPastAppo = 20;
  totalItem = 1000;
  page = 0;
  pastAppoPage = 0;
  upcomingAppointmentDetails: any = [];
  isWalletEmpty: boolean = false;
  pastAppointmentDetails: any = [];
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };

  upcomingActionItems = [];
  pendingActionItems = [];
  isAvailable: boolean = true;
  isExpaired: boolean = true;

  constructor(public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, public navParams: NavParams) {
    this.tapOption[0] = "Upcoming";
    this.tapOption[1] = "Expired";
    this.healthPlanId = this.navParams.get("healthPlanId");
    this.consumerId = this.navParams.get("consumerId");
  }
  ionViewDidEnter() {
    this.tabValue = "appo-" + this.optionObj;
    this.getUserInfo();
    this.getCurrentLocationFromCache();
  }
  //Get Logged-In User details from Cache
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getUpcomingAppointment();

        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  //While Tab change
  tabSelection(event, value) {
    this.isAvailable = true;
    this.isExpaired = true;
    if (value == 'Upcoming') {
      this.optionObj = 0;
      this.tabValue = "appo-" + this.optionObj;      
          setTimeout(() => {
            this.setCardAnimation();
          }, 0);
    
      this.upcomingActionItems = [];
    }
    else {
      this.optionObj = 1;
      this.tabValue = "appo-" + this.optionObj;
      this.pendingActionItems = [];
      setTimeout(() => {
        this.setCardAnimation();
      },100);

    }
    this.getUpcomingAppointment();
  }
  redirectToBook(data) {
    if (data.CategoryDesc == "Appointment") {
      this.bookAppointment(data);
    } else if (data.CategoryDesc == "Diagnostic") {
      this.navCtrl.push("DiagnosticGenericSearch", { searchedKeyWord: "" });
    } else if (data.CategoryDesc == "Diet") {
      this.navCtrl.push("");
    } else if (data.CategoryDesc == "Medication") {
      this.navCtrl.push("");
    }
  }
  getUpcomingAppointment() {
    this._dataContext.GetPendingAndApproachingHealthPlanLineItems(this.healthPlanId, this.consumerId)
      .subscribe(response => {
        if (response.length > 0) {
          this.isAvailable = true;
          this.isExpaired = true;
          this.upcomingActionItems=[];
          response.forEach(element => {
            // element["url"] = this.getCategoryUrl(element.Category);
            if (element.ApproachingLineItem) {
              element.ApproachingLineItem["url"] = this.getCategoryUrl(element.Category);
              element.ApproachingLineItem.ScheduledDate = moment(element.ApproachingLineItem.ScheduledDate).format("DD-MM-YYYY");
              this.upcomingActionItems.push(element.ApproachingLineItem);
              this.isAvailable = true;
            }
            else {
              this.isAvailable = false;
            }
            if (element.PendingLineItems.length > 0) {
              element.PendingLineItems.forEach(pending => {
                //  element.PendingLineItems;
                pending["url"] = this.getCategoryUrl(element.Category);
                pending.ScheduledDate = moment(pending.ScheduledDate).format("DD-MMM-YYYY");
                this.pendingActionItems.push(pending);
              });
              this.isExpaired = true;
            }
            else {
              this.isExpaired = false;
            }
          });
        }
        else {
          this.isAvailable = false;
          this.upcomingActionItems = [];
        }
        console.log(response)
        console.log(this.pendingActionItems, this.upcomingAppointmentDetails)
      },
        error => {
        });
  }
  getCategoryUrl(value) {
    if (value == 1) {
      return Imageurl.case1;
    } else if (value == 2) {
      return Imageurl.case2;
    } else if (value == 3) {
      return Imageurl.case3;
    } else if (value == 4) {
      return Imageurl.case4;
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

  bookAppointment(data) {
    let doctorInformationDetails = {
      ProviderId: data.ProviderId,
      ProviderName: data.ProviderName,
      ProviderRating: 0,//data.ProviderAverageRating != null && data.ProviderAverageRating != "" && data.ProviderAverageRating != undefined ? data.ProviderAverageRating : 0,
      TotalRatedUser: 0,//data.ProviderTotalRatingCount != null && data.ProviderTotalRatingCount != "" && data.ProviderTotalRatingCount != undefined ? data.ProviderTotalRatingCount : 0,
      SpecializationName: "",
      SpecializationId: 0,
      ProviderImage: "",
      City: this.selectedCityAndLocation.activeCity,
      Locality: this.selectedCityAndLocation.activeLocation,
      GroupEntityId: 0,
      SelectedDate: data.ScheduledDate
    }
    this.navCtrl.push("Appointment", { doctorDetails: doctorInformationDetails });
  }
  setCardAnimation() {
    let myCurrentForm = document.getElementsByClassName('actioncard');
    var formTimeline = new TimelineMax();
    formTimeline.to('#cardContainer', 0, { display: 'block' })
      .staggerFrom(myCurrentForm, 0.5, {
        y: 100, opacity: 0, delay: 0.2,
        ease: Linear.easeOut, force3D: true
      }, 0.3);

  }
}

export enum Imageurl {
  case1 = "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/pregnancy/calendar.svg",
  case2 = "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/pregnancy/diabetic.svg",
  case3 = "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/pregnancy/info.svg",
  case4 = "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/pregnancy/pills.svg",
}