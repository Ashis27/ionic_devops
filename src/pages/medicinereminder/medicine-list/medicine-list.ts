import { Component, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, AlertController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';

/**
 * Generated class for the DaysSelectionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'medicine-list',
  templateUrl: 'medicine-list.html',
})
export class MedicineList {
  addedMedicineReminder = [];
  isAvailable: boolean = true;
  medicineTimeDetails: any = [];
  isRedirectFromHealthPlan: boolean = false;
  constructor(private alertCtrl: AlertController, private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public elemRef: ElementRef) {
    this.isRedirectFromHealthPlan = this.navParams.get("status");
  }
  ionViewDidEnter() {
    this.getReminderFromCache();
    this.commonService.onEntryPageEvent("Come to reminder list");
  }
  getReminderFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getAddedReminderMedicineList"))
      .then((result) => {
        if (result.length > 0) {
          this.addedMedicineReminder = result;
          this.addedMedicineReminder.filter(item => {
            this.medicineTimeDetails = [];
            item.EndTime = moment(item.EndTime).format('DD-MMM-YYYY');
            item.StartDate = moment(item.StartDate).format('DD-MMM-YYYY');
            item.MedicineTime = item.MedicineTime.substring(0, item.MedicineTime.length);
            let medicineTime = item.MedicineTime.split(",");
            medicineTime.filter(time => {
              time = moment(time, "h:mm").format("hh:mm A");
              this.medicineTimeDetails.push({ selectedTime: time });
            });
            item["medicineTimeDetails"] = this.medicineTimeDetails;
          })
          this.isAvailable = true;
        }
        else {
          this.addedMedicineReminder = [];
          //  this.isAvailable = false;
        }
        this.getReminders();
      });
  }
  getReminders() {
    this._dataContext.GetMedicineReminder()
      .subscribe(response => {
        if (response.Status && response.Result.length > 0) {
          this.addedMedicineReminder = response.Result;
          this.isAvailable = true;
          this.addedMedicineReminder.filter(item => {
            this.medicineTimeDetails = [];
            item.EndTime = moment(item.EndTime).format('DD-MMM-YYYY');
            item.StartDate = moment(item.StartDate).format('DD-MMM-YYYY');
            item.MedicineTime = item.MedicineTime.substring(0, item.MedicineTime.length);
            let medicineTime = item.MedicineTime.split(",");
            medicineTime.filter(time => {
              time = moment(time, "h:mm").format("hh:mm A");
              this.medicineTimeDetails.push({ selectedTime: time });
            });
            item["medicineTimeDetails"] = this.medicineTimeDetails;
          })
        }
        else {
          this.addedMedicineReminder = [];
          this.isAvailable = false;
          //this.commonService.onMessageHandler(response.Message, 0);
        }
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getAddedReminderMedicineList"), this.addedMedicineReminder)
      },
        error => {
          this.commonService.onMessageHandler("Failed to retrieve reminders. Please try again.", 0);
        });
  }
  addReminder() {
    let addModal = this.modalCtrl.create("AddReminderPage", { status: "Add" });
    addModal.onDidDismiss(item => {
      if (item) {
        this.navCtrl.push("AddremiderFormPage", { medicineName: item, pageFrom: "Search" });
      }
    })
    addModal.present();
  }
  editReminder(value) {
    value["reminder"] = value;
    this.navCtrl.push("AddremiderFormPage", { data: value, pageFrom: "Edit" });
  }
  deleteReminder(data) {
    let alert = this.alertCtrl.create({
      title: "Delete Reminder",
      message: 'Do you want to delete?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            // this.viewCtrl.dismiss();
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          role: 'cancel',
          handler: () => {
            this._dataContext.DeleteReminder(data.Id)
              .subscribe(response => {
                if (response.Status) {
                  this.commonService.onMessageHandler(response.Message, 1);
                  this.getReminders();
                }
                else {
                  this.commonService.onMessageHandler(response.Message, 0);
                }
              },
                error => {
                  this.commonService.onMessageHandler("Failed. Please try again.", 0);
                });
          }
        }
      ]
    });
    alert.present();
  }
  closeCurrentSection() {
    if (this.isRedirectFromHealthPlan)
      this.navCtrl.pop();
    else
      this.navCtrl.setRoot("DashBoard");
  }
  deleteAllReminder() {
    let alert = this.alertCtrl.create({
      title: "Delete Reminder",
      message: 'Do you want to delete?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            // this.viewCtrl.dismiss();
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          role: 'cancel',
          handler: () => {
            this._dataContext.DeleteAllReminder()
              .subscribe(response => {
                if (response.Status) {
                  this.commonService.onMessageHandler(response.Message, 1);
                  this.getReminders();
                }
                else {
                  this.commonService.onMessageHandler(response.Message, 0);
                }
              },
                error => {
                  this.commonService.onMessageHandler("Failed. Please try again.", 0);
                });

          }
        }
      ]
    });
    alert.present();
  }
}
