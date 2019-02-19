import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-healthplanprofile',
  templateUrl: 'healthplanprofile.html'
})
export class HealthPlanProfile {

  constructor(private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController) { }
  ionViewDidEnter() {
  
  }
  redirectTo(value){
    this.navCtrl.push(value);
  }
}
