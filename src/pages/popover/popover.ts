import { Component } from '@angular/core';
import { App, NavController, NavParams, ViewController, LoadingController, AlertController, ToastController, IonicPage } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import * as $ from 'jquery';
import moment from 'moment';
import { CommonServices } from '../../providers/common.service';
import { DataContext } from '../../providers/dataContext.service';

@IonicPage()
@Component({
  selector: 'popover-page',
  template: `
   <ion-item-group>
   <ion-row class="health-record-sec " *ngIf="!status && section == 'user'" (click)="selectedRecord('Edit')"><ion-col col-12><ion-row class="indivisual-sec-border"><ion-col col-12 style="padding:0px"><p class="user-record-details-sec"> Edit </p></ion-col></ion-row></ion-col></ion-row>
    <ion-row class="health-record-sec" (click)="deleteRecord()"><ion-col col-12><ion-row class="indivisual-sec-border"><ion-col col-12 style="padding:0px"><p class="user-record-details-sec"> Delete </p></ion-col></ion-row></ion-col></ion-row>
    <ion-row class="health-record-sec" (click)="shareRecord()"><ion-col col-12><ion-row class="indivisual-sec-border indivisual-sec-border-delete"><ion-col col-12 style="padding:0px"><p class="user-record-details-sec"> Share </p></ion-col></ion-row></ion-col></ion-row>
  </ion-item-group>
     
  `
})
export class PopoverPage {
  record: any = [];
  section: string;
  status: boolean = false;
  familyList: any = [];
  constructor(public commonService: CommonServices, public _dataContext: DataContext, public navParams: NavParams, public appCtrl: App, public viewCtrl: ViewController, public navCtrl: NavController, private alertCtrl: AlertController) {
    this.record = this.navParams.get("record");
    this.section = this.navParams.get("section");
    this.status = this.navParams.get("status");
  }
  selectedRecord(value) {
    this.viewCtrl.dismiss(false);
    this.appCtrl.getActiveNav().push("AddNewRecord", { record: this.record, action: value, status: this.section,isOpenFromPopover:true });
  }
  shareRecord() {
    this.viewCtrl.dismiss(false);
    this.appCtrl.getActiveNav().push("ShareHealthRecord", { record: this.record,status: this.section });
  }
  deleteRecord() {
    let alert = this.alertCtrl.create({
      title: "Delete",
      message: 'Do you want to delete this record?',
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: () => {
            //this.viewCtrl.dismiss();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            if (this.section == "user") {
              this.deleteHealthRecordUploadedByConsumer();
            }
            else{
              this.deleteHealthRecordUploadedByProvider();
            }
          }
        }
      ]
    });
    alert.present();
  }
  deleteHealthRecordUploadedByConsumer() {
    this._dataContext.DeleteHealthRecordUploadedByConsumer(this.record)
      .subscribe(response => {
        if (response.status) {
          this.viewCtrl.dismiss(true);
        }
        this.commonService.onMessageHandler(response.message, 1);
      },
        error => {
          this.commonService.onMessageHandler("Failed to delete document. Please try again.", 0);
        });
  }
  deleteHealthRecordUploadedByProvider() {
    this._dataContext.DeleteHealthRecordUploadedByProvider(this.record)
      .subscribe(response => {
        if (response.status) {
          this.viewCtrl.dismiss(true);
        }
        this.commonService.onMessageHandler(response.message, 1);
      },
        error => {
          this.commonService.onMessageHandler("Failed to delete document. Please try again.", 0);
        });
  }
  close() {
    this.viewCtrl.dismiss();
  }


}