import { TimelineLite } from 'gsap/TweenMax';
import { TimelineMax, Bounce, Linear } from 'gsap/all';
import { HospitalForEmergencyModule } from './../../../emergency/emergency.module';
import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, ActionSheetController, Platform, NavParams, ModalController, Events } from 'ionic-angular';
import moment from 'moment';
import { DataContext } from './../../../../providers/dataContext.service';
import { CommonServices } from '../../../../providers/common.service';


@IonicPage()
@Component({
  selector: 'page-pregnancydashboard',
  templateUrl: 'pregnancydashboard.html'
})
export class PregnancyDashboard {
  pregnancyStatustext: string;
  pregnancyStatusUrl: string;
  categoryId: number;
  consumerId: number;
  healthPlanId: number;
  lineItemData: any[];
  motherName: string;
  timeOfPregnancy: number;
  remainingTimeofPregnacy: number;
  consumerData: any;
  pregnancyStatus: number = 0;
  footerIcon: string;
  dialogTimeline: any;
  uploadedDocumentDetails: any = {};
  pageStatus: string;
  isAdded: boolean = false;
  providerName: string;
  userDetails: any;
  healthplanbooked = false;
  vitals: any = [];
  showSelectedDate: string;
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };

  constructor(public events: Events, private modalCtrl: ModalController, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, public platform: Platform, public actionsheetCtrl: ActionSheetController, public navParams: NavParams) {
    this.healthPlanId = this.navParams.get("healthPlanId");
    this.consumerId = this.navParams.get("consumerId");
    this.footerIcon = "ios-menu-outline";
    setTimeout(() => {
      this.setCardAnimation();
    }, 0);
    // even subscribed for line item status update
    this.events.subscribe('healthPlanAppontment:created', (user) => {
      this.userDetails = user;
      this.healthplanbooked = true;
      this.providerName = user.ProviderName;
      this.getUploadedPlanStatus(user.LineItemId, this.consumerId);
    });
    this.events.subscribe('healthPlanDiagnostic:created', (diagnosticUser) => {
      this.userDetails = diagnosticUser;
      this.healthplanbooked = true;
      this.getUploadedPlanStatus(diagnosticUser.ProviderHealthPlanLineItemId, this.consumerId);
    });
  }
  pregnancyStatusArray = [
    "Your baby is the size of a poppy seed",
    "Your baby is the size of an orange seed",
    "Your baby is the size of a pomegranate seed",
    "Your baby is the size of a blueberry",
    "Your baby is the size of a raspberry",
    "Your baby is the size of a cherry",
    "Your baby is the size of a strawberry",
    "Your baby is the size of a Brussels sprout",
    "Your baby is the size of a passion fruit",
    "Your baby is the size of a large plum",
    "Your baby is the size of a nectarine",
    "Your baby is the size of a grapefruit",
    "Your baby is the size of an apple",
    "Your baby is the size of a pear",
    "Your baby is the size of a sweet potato",
    "Your baby is the size of a mango",
    "Your baby is the size of a bell pepper",
    "Your baby is the size of a banana",
    "Your baby is the size of a papaya",
    "Your baby is the size of an eggplant",
    "Your baby is the size of an ear of corn",
    "Your baby is the size of an acorn squash",
    "Your baby is the size of a zucchini",
    "Your baby is the size of a cauliflower",
    "Your baby is the size of a lettuce",
    "Your baby is the size of a butternut squash",
    "Your baby is the size of a cabbage",
    "Your baby is the size of a coconut",
    "Your baby is the size of a Napa cabbage",
    "Your baby is the size of a pineapple",
    "Your baby is the size of a cantaloupe",
    "Your baby is the size of a honeydew melon",
    "Your baby is the size of a romaine lettuce",
    "Your baby is the size of a Swiss chard",
    "Your baby is the size of a rhubarb",
    "Your baby is the size of a watermelon",
    "Your baby is the size of a pumpkin",
  ]
  ionViewDidEnter() {
    this.getUserInfo();
    this.getDashboardData();
    this.getConsumerData();
  }

  ionViewDidLoad() {
    this.dialogTimeline = new TimelineMax({ paused: true });
    this.dialogTimeline.to('#dashboard-menu', 0, { display: 'flex' })
      .from('#dashboard-menu', 1, { rotation: '90', opacity: 0, transformOrigin: "center bottom" });
  }
  getUploadedPlanStatus(lineItemId, consumerId) {
    this._dataContext.GetUploadedAppointmentPlanStatus(lineItemId, consumerId)
      .subscribe(response => {
        this.uploadedDocumentDetails = response;
        this.vitals = (this.uploadedDocumentDetails.ConsumerResponse.Vitals && this.uploadedDocumentDetails.ConsumerResponse.Vitals.length > 0) ? this.uploadedDocumentDetails.ConsumerResponse.Vitals : [];
        if (this.vitals.length > 0) {
          this.vitals.forEach(element => {
            element["SelectedDate"] = moment(element.Date).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
          });
        }
        if (this.uploadedDocumentDetails.ConsumerResponse && this.uploadedDocumentDetails.ConsumerResponse.Document && this.uploadedDocumentDetails.ConsumerResponse.Document.length > 0) {
          this.isAdded = true;
        }
        if (this.pageStatus == "pregnancyAppointment") {
          this.providerName = this.uploadedDocumentDetails.ConsumerResponse.DoctorName ? this.uploadedDocumentDetails.ConsumerResponse.DoctorName : this.uploadedDocumentDetails.ProviderName;
        }
        else if (this.pageStatus == "DCAppointment") {
          this.providerName = this.uploadedDocumentDetails.ConsumerResponse.DiagnosticCentreName ? this.uploadedDocumentDetails.ConsumerResponse.DiagnosticCentreName : this.uploadedDocumentDetails.ProviderName;
        }
        this.showSelectedDate = moment(this.uploadedDocumentDetails.CompletionDate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        // intializes the data to save after event is firedḍḍ
        if (this.healthplanbooked && this.uploadedDocumentDetails && this.uploadedDocumentDetails.ConsumerResponse) {
          let user = this.userDetails;
          this.uploadedDocumentDetails.Completed = true;
          this.uploadedDocumentDetails.ConsumerResponse.Completed = true;
          this.uploadedDocumentDetails.HealthPlanId = user.HealthPlanId;
          // this.providerName = user.ProviderName;
          this.uploadedDocumentDetails.CompletionDate = user.SelectedDate;
          this.SaveConsumerHealthPlanLineItemResponse();
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }
  SaveConsumerHealthPlanLineItemResponse() {
    this.uploadedDocumentDetails.Completed = true;
    if (this.uploadedDocumentDetails.CompletionDate == "Invalid date" || this.uploadedDocumentDetails.CompletionDate == null || this.uploadedDocumentDetails.CompletionDate == '')
      this.uploadedDocumentDetails.CompletionDate = moment().format("DD-MMM-YYYY");
    let updateDetails = {
      ProviderHealthPlanLineItemId: this.uploadedDocumentDetails.ProviderHealthPlanLineItemId,
      UserType: this.uploadedDocumentDetails.UserType,
      ConsumerId: this.consumerId,
      ConsumerResponse: {
        Completed: this.uploadedDocumentDetails.Completed,
        CompletionDate: this.uploadedDocumentDetails.CompletionDate,
        Note: "",
        Document: [],
        DoctorName: this.providerName,
        DiagnosticCentreName: this.providerName,
        Vitals: this.vitals
      }
    }
    this._dataContext.SaveConsumerHealthPlanLineItemResponse(updateDetails)
      .subscribe(response => {
        this.getDashboardData();
      },
        error => {

          this.commonService.onEventSuccessOrFailure("Upload failed");
        });

  }
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.consumerId = result.ConsumerID;
        }
      });
  }

  getDashboardData() {
    this._dataContext.GetHealthPlanActionItems(this.healthPlanId, this.consumerId)
      .subscribe(response => {
        if (response.length > 0) {
          response.forEach(element => {
            element["url"] = this.getCategoryUrl(element.Category);
            element.ScheduledDate = moment(element.ScheduledDate).format("DD-MMM-YYYY");
          });
          this.lineItemData = response;

        }
        else {
          this.lineItemData = [];
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve health plan. Please try again.", 0);
        });
  }

  getConsumerData() {
    // this.consumerId;
    this._dataContext.GetConsumerHealthPlanData(this.consumerId, this.healthPlanId)
      .subscribe(response => {
        this.consumerData = response;
        console.log(this.consumerData);
        this.setTimeofPregnancy(this.consumerData.PregnancyPlanResponse.LMP);
        this.motherName = this.consumerData.PregnancyPlanResponse.Mother;
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve health plan. Please try again.", 0);
        });
  }
  getCategoryUrl(value) {
    if (value == "1") {
      return Imageurl.case1;
    } else if (value == "2") {
      return Imageurl.case2;
    } else if (value == "3") {
      return Imageurl.case3;
    } else if (value == "4") {
      return Imageurl.case4;
    }
  }

  setTimeofPregnancy(eventStartTime) {
    let timeDiff = new Date().getTime() - new Date(eventStartTime).getTime();
    this.timeOfPregnancy = moment(timeDiff).week();
    this.remainingTimeofPregnacy = 40 - this.timeOfPregnancy;
    this.pregnancyStatus = this.timeOfPregnancy * (2.5);
    this.pregnancyStatusUrl = "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/pregnancy/status/" + this.timeOfPregnancy + ".png"
    this.pregnancyStatustext = this.pregnancyStatusArray[this.timeOfPregnancy - 4]
  }

  showmenu() {
    let menu = document.getElementById("dashboard-menu");
    if (menu.style.display === "none") {
      this.footerIcon = "ios-close-outline";
      this.dialogTimeline.play();
    } else {
      this.footerIcon = "ios-menu-outline";
      this.dialogTimeline.reverse();
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

  // sets up the data for bookappointment via healthplan
  bookAppointment(data) {
    let doctorInformationDetails = {
      LineItemId: data.Id,
      HealthPlanId: this.healthPlanId,
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

  redirectTo(value) {
    if (value == "MedicineList") {
      this.navCtrl.push("MedicineList", { status: true });
    }
    else if (value == "YageAndExcercise") {
      this.navCtrl.push("PlanList", { healthPlanId: 101, pageTitle: "Excercise" });
    }
    else if (value == "diet") {
      this.navCtrl.push("PlanList", { healthPlanId: 100, pageTitle: "Diet Plan" });
    }
    else if (value == "HealthJournalList") {
      this.navCtrl.push("HealthJournalList", { healthPlanId: this.healthPlanId, lmp: this.consumerData.PregnancyPlanResponse.LMP, timeOfPregnancy: this.timeOfPregnancy });
    }
    else
      this.navCtrl.push(value, { healthPlanId: this.healthPlanId, consumerId: this.consumerId });
  }
  redirectToBook(data) {
    if (data.CategoryDesc == "Appointment") {
      this.bookAppointment(data);
    } else if (data.CategoryDesc == "Diagnostic") {
      this.navCtrl.push("DiagnosticGenericSearch", { searchedKeyWord: "" });
      let DiagnosticData = { ProviderHealthPlanId: data.ProviderHealthPlanId, ProviderHealthPlanLineItemId: data.ProviderHealthPlanLineItemId };
      this.commonService.setStoreDataIncache("diagnosticAppointmentdetails", DiagnosticData);
      console.log(DiagnosticData);
    } else if (data.CategoryDesc == "Diet") {
      this.navCtrl.push("");
    } else if (data.CategoryDesc == "Medication") {
      this.navCtrl.push("");
    }
  }

  editProfile() {
    let addModal = this.modalCtrl.create("PregnancyForm", { healthPlanId: this.healthPlanId, consumerId: this.consumerId, status: true });
    addModal.onDidDismiss(item => {
      if (item) {
        this.getDashboardData();
        this.getConsumerData();
      }
    })
    addModal.present();
  }
  setCardAnimation() {
    let myCurrentForm = document.getElementsByClassName('actioncard');
    let formTimeline = new TimelineMax();
    formTimeline.to('#cardContainer', 0, { display: 'block' })
      .staggerFrom(myCurrentForm, 0.5, {
        y: 100, opacity: 0, delay: 0.2,
        ease: Linear.easeOut, force3D: true
      }, 0.3);
    let img = new TimelineMax();
    img.from('.statusImg', 1.5, {
      scale: 0, opacity: 0, delay: 0.3,
      ease: Linear.easeOut, force3D: true

    });
    let text = new TimelineMax();

    text.from('.color-white', 1, {
      x: 200, opacity: 0, delay: 0.3,
      ease: Linear.easeOut, force3D: true

    })
  }
}
export enum Imageurl {
  case1 = "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/pregnancy/calendar.svg",
  case2 = "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/pregnancy/diabetic.svg",
  case3 = "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/pregnancy/info.svg",
  case4 = "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/pregnancy/pills.svg",
}