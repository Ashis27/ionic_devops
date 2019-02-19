import { TimelineMax, Elastic } from 'gsap/all';
import { Pregnancy } from './../pregnancy';
import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, NavParams, ViewController, App, ModalController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import moment from 'moment';
import { DataContext } from './../../../../providers/dataContext.service';
import { CommonServices } from '../../../../providers/common.service';
@IonicPage()
@Component({
  selector: 'page-pregnancyform',
  templateUrl: 'pregnancyform.html'
})
export class PregnancyForm {
  userData: any;

  healthPlanDetails: any;
  healthPlanId: number;
  isChecked: boolean = false;
  // date: new Date();
  pergnancyDetails: any = {
    Id: 0,
    ConsumerId: 0,
    ProviderHealthPlanId: 0,
    PregnancyPlanResponse: {
      PregnancyPlanId: 0,
      LMP: new Date().toISOString(),
      Vitals: [
        {
          VitalName: "",
          Value: "",
          Unit: "",
          Date: new Date().toISOString(),
        }
      ],
      Mother: "",
      Father: "",
      Doctor: "",
      Hospital: "",
      SpecialConditions: []
    }
  }
  isSubmitted: boolean = false;
  specialConditions: Set<any> = new Set<any>();
  allSpecialconditions: any[];
  isRedirectFromDashBoard: boolean = false;
  minDate: string;
  maxDate: string;

  constructor(private modalCtrl: ModalController, public appCtrl: App, private viewCtrl: ViewController, public navParams: NavParams, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, ) {
    this.pergnancyDetails.ProviderHealthPlanId = this.navParams.get("healthPlanId");
    this.healthPlanId = this.navParams.get("healthPlanId");
    this.pergnancyDetails.ConsumerId = this.navParams.get("consumerId");
    this.userData = this.navParams.get("userData");
    this.isRedirectFromDashBoard = this.navParams.get("status");
    this.minDate = moment().subtract(9, "month").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    this.maxDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  }

  ionViewDidEnter() {
    if (this.navCtrl.getActive().name == "PregnancyDashboard" || this.navCtrl.getActive().id == "PregnancyDashboard") {
      this.viewCtrl.dismiss(true);
    }
    this.getConsumerData();
    this.enableNotification();
    this.getHealthPlanSubscriberDetails();
  }
  ionViewDidLoad() {
    var formTimeline = new TimelineMax();
    formTimeline.to(".myCurrentForm", 0, { display: 'flex' })
      .staggerFrom(".myCurrentForm", 2, {
        x: 75, opacity: 0, delay: 0.5,
        ease: Elastic.easeOut, force3D: true
      }, 0.2);
  }

  enableNotification() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getNotificationStatus"))
      .then((result) => {
        if (!result) {
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getNotificationStatus"), true);
          // this.navCtrl.push("NotificationSetting",{fromPregnancyPage:true});
          let addModal = this.modalCtrl.create("NotificationSetting");
          addModal.onDidDismiss(item => {
            if (item) {

            }
          })
          addModal.present();
        }

      });
  }
  getHealthPlanSubscriberDetails() {
    this._dataContext.GetHealthPlanSubscriberDetails(this.pergnancyDetails.ConsumerId, this.healthPlanId)
      .subscribe(response => {
        this.healthPlanDetails = response;
        if (this.pergnancyDetails && this.pergnancyDetails.PregnancyPlanResponse) {
          if (this.healthPlanDetails.ProviderName) {
            this.pergnancyDetails.PregnancyPlanResponse.Doctor = this.healthPlanDetails.ProviderName;
          }
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }
  redirectTo(value) {
    this.navCtrl.push(value, { healthPlanId: this.healthPlanId });
  }
  // setPageStatusInCache() {
  //   this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPregnancyForm"), true);
  // }
  // gets the list of all special contitions
  getSpecialConditions() {
    this._dataContext.GetSpecialConditionsForHealthPlan(this.healthPlanId)
      .subscribe(response => {
        if (this.pergnancyDetails && this.pergnancyDetails.PregnancyPlanResponse.SpecialConditions.length > 0) {
          for (let i = 0; i < response.length; i++) {
            response[i]["Checked"] = false;
            this.pergnancyDetails.PregnancyPlanResponse.SpecialConditions.forEach(element => {
              if (element.SpecialCondition == response[i].SpecialCondition)
                response[i]["Checked"] = element.Checked;
            });
          }
          this.allSpecialconditions = response;
          //A new itemis pushed to view the last element in  ionic slider.
          this.allSpecialconditions.push({});
        } else {
          if (response.length > 0) {
            for (let i = 0; i < response.length; i++) {
              response[i]["Checked"] = false;
            }
            this.allSpecialconditions = response;
          }
          else {
            this.allSpecialconditions = [];
          }
        }

      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve health plan. Please try again.", 0);
        });
  }

  onSubmit() {
    // this.submitForm();
    //this.navCtrl.push("PregnancyDashboard", { healthPlanId: this.healthPlanId, consumerId: this.pergnancyDetails.ConsumerId });
    this.isSubmitted = true;
    if (!this.isRedirectFromDashBoard)
      this.navCtrl.push("PregnancyDashboard", { healthPlanId: this.healthPlanId, consumerId: this.pergnancyDetails.ConsumerId });
    else
      this.viewCtrl.dismiss(true);
  }
  submitForm() {
    let test = [];
    this.allSpecialconditions.forEach(element => {
      if (element.SpecialCondition)
        test.push(element);
    });
    this.pergnancyDetails.PregnancyPlanResponse.SpecialConditions = test;
    this._dataContext.SaveHealthPlanData(this.pergnancyDetails)
      .subscribe(response => {
        this.isSubmitted = true;
        if (!this.isRedirectFromDashBoard)
          this.navCtrl.push("PregnancyDashboard", { healthPlanId: this.healthPlanId, consumerId: this.pergnancyDetails.ConsumerId });
        else
          this.viewCtrl.dismiss(true);
      }, error => {
        this.isSubmitted = false;
        this.commonService.onMessageHandler("Failed to Save health Data. Please try again.", 0);
      });
  }
  getConsumerData() {
    this._dataContext.GetConsumerHealthPlanData(this.pergnancyDetails.ConsumerId, this.healthPlanId)
      .subscribe(response => {
        if (response) {
          this.pergnancyDetails = response;
        }
        this.getSpecialConditions();
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve health plan. Please try again.", 0);
        });
  }
  ionViewWillLeave() {
    if (this.isSubmitted) {
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPregnancyForm"), true);

    }
  }
  closeUploadModal() {
    this.viewCtrl.dismiss(false);
  }
}
