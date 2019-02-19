import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController } from 'ionic-angular';
import { CommonServices } from '../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-history',
  templateUrl: 'history.html'
})
export class UserHistory {
  constructor(private commonService: CommonServices,public navCtrl: NavController) { }

  ionViewDidEnter() {
    this.commonService.onEntryPageEvent("My history page");
  }
  redirectTo(value){
    this.navCtrl.push(value);
  }
}
