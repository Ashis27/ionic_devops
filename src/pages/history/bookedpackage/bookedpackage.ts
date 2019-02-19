import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-bookedpackage',
  templateUrl: 'bookedpackage.html'
})
export class BookedPackage {
  bookedPackageList: any = [];
  userDetails:any={};
  tapOption = [];
  optionObj: number = 0;
  tabValue: string;
  isPackageAvailable:boolean = true;
  constructor(public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {
    this.tapOption[0] = "Upcoming";
    this.tapOption[1] = "Past";
   }
  ionViewDidEnter() {
    this.optionObj = 0;
    this.bookedPackageList=[];
    this.tabValue = "appo-" + this.optionObj;
    this.getUpcomingBookedHealthPackagesForConsumer();
  }

  getUpcomingBookedHealthPackagesForConsumer() {
    this._dataContext.GetUpcomingBookedHealthPackagesForConsumer()
      .subscribe(response => {
        if (response.Status) {
          this.bookedPackageList = response.Result;
          this.bookedPackageList.filter(item=>{
            item.BookingDate =  moment(item.BookingDate).format("DD-MMM-YYYY");
            item.HealthPackageName = this.commonService.convert_case(item.HealthPackageName);
            item.HospitalName = this.commonService.convert_case(item.HospitalName);
          })
          this.isPackageAvailable = true;
        }
        else {
          this.isPackageAvailable = false;
          this.bookedPackageList=[];
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
  getPastBookedHealthPackagesForConsumer() {
    this._dataContext.GetPastBookedHealthPackagesForConsumer()
      .subscribe(response => {
        if (response.Status) {
          this.bookedPackageList = response.Result;
          this.bookedPackageList.filter(item=>{
            item.BookingDate =  moment(item.BookingDate).format("DD-MMM-YYYY");
            item.HealthPackageName = this.commonService.convert_case(item.HealthPackageName);
            item.HospitalName = this.commonService.convert_case(item.HospitalName);
          })
          this.isPackageAvailable = true;
        }
        else {
          this.isPackageAvailable = false;
          this.bookedPackageList=[];
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }

  //While Tab change
  tabSelection(event, value) {
    this.bookedPackageList=[];
    if (value == 'Upcoming') {
      this.optionObj = 0;
      this.tabValue = "appo-" + this.optionObj;
      this.getUpcomingBookedHealthPackagesForConsumer();
    }
    else {
      this.optionObj = 1;
      this.tabValue = "appo-" + this.optionObj;
      this.getPastBookedHealthPackagesForConsumer();
    }
  }
  bookPackage(){
    this.navCtrl.push("DiagnosticGenericSearch");
  }
}
