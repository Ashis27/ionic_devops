import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-knowledgecenter',
  templateUrl: 'knowledgecenter.html'
})
export class KnowledgeCenter {
  knowledgeTransferInfo: any = {};
  
  constructor(private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController) { }
  ionViewDidEnter() {
    this.getKnowledgeTransferInfo();
  }

  getKnowledgeTransferInfo() {
    this._dataContext.GetYogaAndExcerciseInfo()
      .subscribe(response => {
        if (response.Result.length > 0) {
          this.knowledgeTransferInfo = response.Result;
        }
        else {
          this.knowledgeTransferInfo = {};
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }
  redirectTo(value) {
    this.navCtrl.push(value);
  }
}
