import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController } from 'ionic-angular';
import moment from 'moment';
import { DataContext } from '../../../../providers/dataContext.service';
import { CommonServices } from '../../../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-pregnancynotification',
  templateUrl: 'pregnancynotification.html'
})
export class PregnancyNotification {

  constructor(public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, ) { }
  ionViewDidEnter() {
   
  }
  redirectTo(value){
    this.navCtrl.push(value);
  }
}
