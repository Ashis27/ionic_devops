import { TweenMax, TimelineMax, Elastic, Linear } from "gsap/TweenMax";
import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-planlist',
  templateUrl: 'planlist.html'
})
export class PlanList {
  planList: any = [];
  pageTitle: string;
  healthPlanId: number;
  isAvailable: boolean = true;
  bacgroundImg: string;
  constructor(public navParams: NavParams, private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController) {
    this.pageTitle = this.navParams.get("pageTitle");
    this.healthPlanId = this.navParams.get("healthPlanId");
  }
  ionViewDidEnter() {
    this.getPlans();
  }

  getPlans() {
    this._dataContext.GetPlans(this.healthPlanId)
      .subscribe(response => {
        if (response.length > 0) {
          this.planList = response;
          setTimeout(() => {
            this.isAvailable = true;
            this.setCardAnimation();
          }, 0);
        }
        else {
          this.planList = [];
          this.isAvailable = false;
        }

        if (this.healthPlanId == 100) {
          this.bacgroundImg = "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/diet-back.jpg"
        } else if (this.healthPlanId == 101) {
          this.bacgroundImg = "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/yoga-back.jpg"
        }

      },
      error => {
        console.log(error);
        this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
      });


  }
  selectedItem(item) {
    this.navCtrl.push("DetailsPage", { planDetails: item });
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
