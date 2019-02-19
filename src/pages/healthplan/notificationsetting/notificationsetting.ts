import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController, NavParams, ViewController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';

@IonicPage()
@Component({
  selector: 'page-notificationsetting',
  templateUrl: 'notificationsetting.html'
})
export class NotificationSetting {
  notificationConfig: any = {};
  status:boolean=false;
  constructor(private viewCtrl: ViewController,public navParams: NavParams,private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController) { 
    
    this.status = this.navParams.get("fromPregnancyPage");
  }
  ionViewDidEnter() {
    this.getNotificationSettingConfig();
  }

  getNotificationSettingConfig() {
    this._dataContext.GetNotificationSettingConfig()
      .subscribe(response => {
        if (response.length > 0) {
          this.notificationConfig = response;
        }
        else {
          this.notificationConfig = {};
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
  ionViewDidLeave() {
    let notiPref = {consumerNotificationPreferences: this.notificationConfig};
    //console.log(this.notificationConfig);
    //console.log(notiPref);
    this._dataContext.SaveNotificationSettingConfig(notiPref)
      .subscribe(response => {
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
  closeUploadModal() {
    this.viewCtrl.dismiss(false);
  }
}
