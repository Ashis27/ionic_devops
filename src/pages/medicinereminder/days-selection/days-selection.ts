import { Component, ElementRef, Renderer2 } from '@angular/core';

import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the DaysSelectionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-days-selection',
  templateUrl: 'days-selection.html',
})
export class DaysSelectionPage {
  selected_days_format: string = "everyday";
  id: any;
  startsDate: any;
  DaysArray: any = [];
  content: any = "";
  daysVal: number = 1;
  FinalDaysSelected: any = [];
  Days: any = {
    type: "",
    value: ""
  }
  //Temp_Days: any = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public elemRef: ElementRef, public renderer: Renderer2) {
    this.DaysArray = [
      {
        day: "SUN",
        isActivated: false,
        dayStatus: "Sunday"
      },
      {
        day: "MON",
        isActivated: false,
        dayStatus: "Monday"
      },
      {
        day: "TUE",
        isActivated: false,
        dayStatus: "Tuesday"
      },
      {
        day: "WED",
        isActivated: false,
        dayStatus: "Wednesday"
      },
      {
        day: "THU",
        isActivated: false,
        dayStatus: "Thursday"
      },
      {
        day: "FRI",
        isActivated: false,
        dayStatus: "Friday"
      },
      {
        day: "SAT",
        isActivated: false,
        dayStatus: "Saturday"
      },
    ]
    this.Days = this.navParams.get("data");
    console.log(this.Days);


    //  selectedDays: {
    //   type:"",
    //   value:""
    // }


    if (this.Days != "" && this.Days != null && this.Days != undefined) {
      if (this.Days.type == "EveryDay") {
        this.selected_days_format = "everyday";
      }
      else if (this.Days.type == "SelectedDays") {
        this.selected_days_format = "selected_days";
        let selectedDays=this.Days.editVal.split(",");
          console.log(this.Days.editVal);
        for(let i=0;i<selectedDays.length;i++){
          switch((selectedDays[i])){
            case "Sunday":{  
              this.DaysArray[0].isActivated=true;
              break;
            }
            case "Monday":{
              this.DaysArray[1].isActivated=true;
              console.log(this.DaysArray[2].isActivated);
              break;
            }
            case "Tuesday":{
              this.DaysArray[2].isActivated=true;
              console.log(this.DaysArray[2].isActivated);
              break;
            }
            case "Wednesday":{
              this.DaysArray[3].isActivated=true;
              console.log(this.DaysArray[2].isActivated);
              break;
            }
            case "Thursday":{
              this.DaysArray[4].isActivated=true;
              console.log(this.DaysArray[2].isActivated);
              break;
            }
            case "Friday":{ 
              this.DaysArray[5].isActivated=true;
              console.log(this.DaysArray[2].isActivated);
              break;
            }
            case "Saturday":{
              this.DaysArray[6].isActivated=true;
              console.log(this.DaysArray[2].isActivated);
              break;
            }
            default:{
              break;
            }
          }
        }
      }
      else if (this.Days.type == "IntervalOfDays") {
        this.selected_days_format = "interval_of_days";
        this.daysVal = parseInt(this.Days.editVal);
      }
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DaysSelectionPage');

  }

  closeDays() {
    this.viewCtrl.dismiss();
  }
  SelectedDays(index) {
    this.DaysArray[index].isActivated = !this.DaysArray[index].isActivated;
  };

  daysData(e) {
    console.log(e);
    //this.daysVal = this.elemRef.nativeElement.querySelector('.daysValue');
    if (e === 'add') {
      if (this.daysVal < 30) {
        this.daysVal = (this.daysVal) + 1;
      }

    }
    else {
      if (this.daysVal > 1) {
        this.daysVal = (this.daysVal) - 1;
      }

    }
  }
  saveDays() {
    this.Days.editVal = "";
    console.log(this.selected_days_format);
    if (this.selected_days_format == "everyday") {
      this.FinalDaysSelected.selected = "everyday";
      this.content = "everyday";
      this.FinalDaysSelected.content = this.content;
      console.log(this.startsDate);
      if (this.startsDate == undefined) {
        this.startsDate = new Date();
      }
      this.FinalDaysSelected.startDate = this.startsDate;
      this.viewCtrl.dismiss(this.FinalDaysSelected);

    }
    else if (this.selected_days_format == "selected_days") {
      this.FinalDaysSelected.selected = "selecteddays";
      for (let i = 0; i < this.DaysArray.length; i++) {
        if (this.DaysArray[i].isActivated == true) {
          this.content+=(this.DaysArray[i].day)+",";
          this.Days.editVal+=this.DaysArray[i].dayStatus+",";
        }
      }
      console.log(this.Days.editVal);
      this.FinalDaysSelected.content = this.content;
      if (this.startsDate == undefined) {
        this.startsDate = new Date();
      }
      this.FinalDaysSelected.startDate = this.startsDate;
      console.log(this.FinalDaysSelected);
      this.viewCtrl.dismiss(this.FinalDaysSelected);
    }
    else if (this.selected_days_format == "interval_of_days") {
      this.FinalDaysSelected.selected = "intervalofdays";
      this.content=this.daysVal;
      this.FinalDaysSelected.content = this.content.toString();
      console.log(this.FinalDaysSelected);
      if (this.startsDate == undefined) {
        this.startsDate = new Date();
      }
      this.FinalDaysSelected.startDate = this.startsDate;
      this.FinalDaysSelected.editval = this.daysVal;
      this.viewCtrl.dismiss(this.FinalDaysSelected);
    }

  }
}
