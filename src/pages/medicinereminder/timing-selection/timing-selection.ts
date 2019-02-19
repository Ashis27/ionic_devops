import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
/**
 * Generated class for the TimingSelectionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-timing-selection',
  templateUrl: 'timing-selection.html',
})
export class TimingSelectionPage {
  structure: any = {};
  TimeCount: any;
  TimeZones: any = [];
  myDate: any;
  count: number = 0;
  selectedTimes: any = [];
  slectedMedicineTime: any = {
    totalCount: 1,
    medicineTime: []
  }

  medicineTime: any = [];
  constructor(public commonService: CommonServices, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private alertCtrl: AlertController) {
    this.medicineTime = this.navParams.get("selectedTime");
    if (this.medicineTime != "" && this.medicineTime != null && this.medicineTime != undefined) {
      this.slectedMedicineTime = {
        totalCount: 1,
        medicineTime: []
      };
      let time = this.medicineTime.split(",");
      console.log(time);
      this.slectedMedicineTime.totalCount = time.length;
      time.filter(item => {
        if (item && item != " ") {
          this.slectedMedicineTime.medicineTime.push({ time: item });
        }
      })
      console.log(this.slectedMedicineTime.medicineTime);
    }
    else {
      this.slectedMedicineTime = {
        totalCount: 1,
        medicineTime: [{ time: "" }]
      }
    }
  }

  ionViewDidLoad() {
    this.structure.lower = 33;
    this.structure.upper = 60;
    this.TimeZones = [];
  }
  closeTimings() {
    this.viewCtrl.dismiss();
  }
  TimeInterval(choosen: any) {
    if (choosen == "add") {
      if (this.slectedMedicineTime.totalCount >= 1 && this.slectedMedicineTime.totalCount < 7) {
        if (this.slectedMedicineTime.medicineTime[this.slectedMedicineTime.medicineTime.length - 1].time != "") {
          this.slectedMedicineTime.totalCount = this.slectedMedicineTime.totalCount + 1;
          this.slectedMedicineTime.medicineTime.push({ time: "" });
        }
        else{
          this.commonService.onMessageHandler("Please choose a reminder time", 0)
        }
        console.log(this.slectedMedicineTime);
      }
    } else {
      if (this.slectedMedicineTime.totalCount > 1) {
        this.slectedMedicineTime.totalCount = this.slectedMedicineTime.totalCount - 1;
        this.slectedMedicineTime.medicineTime.splice(this.slectedMedicineTime.totalCount, 1);
      }
    }
  }
  selectedTime(event, index) {
    let count = 0;
    let i = 0;
    this.slectedMedicineTime.medicineTime.filter(item => {
      i++;
      if (index > 0 && i < this.slectedMedicineTime.medicineTime.length) {
        if (item.time == this.slectedMedicineTime.medicineTime[index].time) {
          count++;
        }
      }
    })
    if (count > 0) {
      this.slectedMedicineTime.totalCount = this.slectedMedicineTime.totalCount - 1;
      this.slectedMedicineTime.medicineTime.splice(index, 1);
      this.commonService.onMessageHandler("You already have added this time", 0);
    }
  }
  saveTimings() {
    this.viewCtrl.dismiss(this.slectedMedicineTime);
  }
  // SetTime(ev) {
  //   this.count = this.count + 1;
  //   if (this.count > this.slectedMedicineTime.totalCount) {
  //     let alert = this.alertCtrl.create({
  //       title: '',
  //       subTitle: 'You cannot select morethan ' + this.slectedMedicineTime.totalCount + ' times',
  //       buttons: ['Dismiss']
  //     });
  //     alert.present();
  //   } else {
  //     this.selectedTimes.push(this.myDate);
  //     console.log(this.selectedTimes);
  //   }

  // }

}
