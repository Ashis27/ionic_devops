import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-dietplan',
  templateUrl: 'dietplan.html'
})
export class DietPlan {
  dietDetails:any;

  constructor(public navParams: NavParams, private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController) {

      this.dietDetails= this.navParams.get("item");
   }
  ionViewDidEnter() {
    console.log(this.dietDetails)
  }

  
  redirectTo(value) {
    this.navCtrl.push(value);
  }
}
