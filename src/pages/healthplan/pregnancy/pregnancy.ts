import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import moment from 'moment';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import { TweenMax, TimelineMax, Elastic } from "gsap/TweenMax";

@IonicPage()
@Component({
  selector: 'page-pregnancy',
  templateUrl: 'pregnancy.html'
})
export class Pregnancy {
  consumerId: number;
  healthPlanId: number;
  userId: number = 0;
  healthPlanDetails: any = {};
  constructor(private modalCtrl: ModalController, public navParams: NavParams, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, ) {
    this.healthPlanId = this.navParams.get("healthPlanId");
    this.consumerId = this.navParams.get("consumerId")
  }
  ionViewDidEnter() {
    this.setPageStatusInCache();
    this.getLoggedonUserDetails();
    // this.animated();
  }
  ionViewDidLoad() {
    let formTimeline = new TimelineMax();
    formTimeline.from('.animate', 1, {
      scale: 0.5, opacity: 0, delay: 0.5,
      ease: Elastic.easeOut,
    });
  }

  //Get logged on user details from cache
  getLoggedonUserDetails() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getHealthPlanSubscriberDetails();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  setPageStatusInCache() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getPregnencyPageStatus"), true);
  }

  //Get health plan subscriber details
  getHealthPlanSubscriberDetails() {
    this._dataContext.GetHealthPlanSubscriberDetails(this.userId, this.healthPlanId)
      .subscribe(response => {
        this.healthPlanDetails = response;
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }
  redirectTo() {
    
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPregnancyForm"))
      .then((result) => {
        this.navCtrl.pop();
        if (result) {
          this.navCtrl.push("PregnancyDashboard", { healthPlanId: this.healthPlanId, consumerId: this.userId });
        }
        else {
          let addModal = this.modalCtrl.create("PregnancyForm", { healthPlanId: this.healthPlanId, consumerId: this.userId, status: false });
          addModal.onDidDismiss(item => {
            if (item) {
              this.getLoggedonUserDetails();
            }
          })
          addModal.present();
        }
      });
    let animatedTextElements = document.getElementsByClassName('animate');
  }
}