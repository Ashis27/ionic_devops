import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import * as _ from "lodash";

@IonicPage()
@Component({
  selector: 'page-healthplandashboard',
  templateUrl: 'healthplandashboard.html'
})
export class HealthPlanDashBoard {
  subscribedHealthPlan: any = [];
  activeHealthPlan: any = [];
  userId: number = 0;
  isAvailable:boolean=true;
  constructor(private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController) { }
  ionViewDidEnter() {
    this.getLoggedonUserDetails();
  }
  getLoggedonUserDetails() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getSubscribedPlan();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  //This is used to get all subscribed plan activated by User
  getSubscribedPlan() {
    this._dataContext.GetSubscribedHealthPlan(this.userId)
      .subscribe(response => {
        if (response.length > 0) {
          this.subscribedHealthPlan = response;
          this.isAvailable= true;
          this.getHealthPlan();
        }
        else {
          this.isAvailable=false;
          this.subscribedHealthPlan
          this.subscribedHealthPlan = [];
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve activated plan. Please try again.", 0);
        });
  }

  //This is used to get all subscribed plan activated by User
  getHealthPlan() {
    this.activeHealthPlan=[];
    this._dataContext.GetHealthPlan()
      .subscribe(response => {
        if (response.length > 0) {
          response.filter(plan => {
            this.subscribedHealthPlan.filter(subsPlan => {
              if (plan.Id !== subsPlan.ProviderHealthPlanId) {
                this.activeHealthPlan.push(plan);
              }
            });
          });
        }
        else {
          this.activeHealthPlan = [];
        }
        console.log(this.activeHealthPlan);
        console.log(response)
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve health plan. Please try again.", 0);
        });
  }
  isPregnencyPageVisited(activatedPlan) {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPregnencyPageStatus"))
      .then((result) => {
        if (result) {
          this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getPregnancyForm"))
            .then((result) => {
              if (result) {
                this.navCtrl.push("PregnancyDashboard", { healthPlanId: activatedPlan.ProviderHealthPlanId, consumerId: this.userId });
              }
              else {
                let addModal = this.modalCtrl.create("PregnancyForm", { healthPlanId: activatedPlan.ProviderHealthPlanId, consumerId: this.userId });
                addModal.onDidDismiss(item => {
                  if (item) {
                    this.getLoggedonUserDetails();
                  }
                })
                addModal.present();
                // this.navCtrl.push("PregnancyForm", { healthPlanId: activatedPlan.ProviderHealthPlanId, consumerId: this.userId });
              }
            });
        }
        else {
          this.navCtrl.push("Pregnancy", { healthPlanId: activatedPlan.ProviderHealthPlanId, consumerId: this.userId });
        }
      });
  }
  setNotification() {
    let addModal = this.modalCtrl.create("NotificationSetting");
    addModal.onDidDismiss(item => {
      if (item) {
       
      }
    })
    addModal.present();
    // this.navCtrl.push("NotificationSetting");
  }
  activateKareplan(item) {
    this.commonService.onMessageHandler("This functionality has not been provided yet.", 0);
  }
  // redirectTo(value) {
  //   this.navCtrl.push(value);
  // }
}
