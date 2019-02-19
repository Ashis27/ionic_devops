import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-detailspage',
  templateUrl: 'detailspage.html'
})
export class DetailsPage {
  planDetails: any = {};
  pageDetailsTitle:string;


  constructor(public navParams: NavParams,private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController) { 
    this.planDetails = this.navParams.get("planDetails");
    this.pageDetailsTitle = this.navParams.get("pageDetailsTitle"); 
  }

  ionViewDidEnter() {
   // this.getPlanDetails();
  }

  // getPlanDetails() {
  //   this._dataContext.GetDietPlanDetails(this.planId)
  //     .subscribe(response => {
  //       if (response != null) {
  //         this.planDetails = response.Result;
  //       }
  //       else {
  //         this.planDetails = {};
  //       }
  //     },
  //       error => {
  //         console.log(error);
  //         this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
  //       });
  // }
}
