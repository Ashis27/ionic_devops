import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { DaysSelectionPage } from '../days-selection/days-selection'
import { TimingSelectionPage } from '../timing-selection/timing-selection'

import moment from 'moment';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
// import { DatePicker } from '@ionic-native/date-picker';
/**
 * Generated class for the AddremiderFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addremider-form',
  templateUrl: 'addremider-form.html',
})
export class AddremiderFormPage {
  @ViewChild('dval') dval;
  self = this;
  daySlectionType: number = 0;
  medicinetype: string = "Tablet";
  medicineName: string;
  reminderType: string = "Medicine";
  //slectedDosage:number=1.01;
  increseLimit: any = 0.25;
  slectedTime: any = [];
  slectedDays: string = "Everyday";
  slectedDuration: string = "days";
  dosageval: any = 1.0;
  daysRange: any = 1;
  weeksRange: any = 1;
  monthsRange: any = 1;
  // added by vinod start
  DosageUnit: string = "mg";
  DosageUnits: any = [];
  maxDate: string;
  minDate: string;
  DurationFrom: string;
  DurationTo: string;
  // added by vinod end
  days: string = "Day";
  weeks: string = "Week";
  months: string = "Month";
  medicinesearched: string;
  showMedicine: boolean = false;
  medicineList: any = [];
  searchTerm: string = '';
  mednotfound: boolean = false;
  TempMedicineDosage: any = "1.0";
  finalSelectedDays: string = "";
  reminder: any = {
    medicineName: "",
    selectedTime: "",
    selectedDays: {
      type: "",
      value: "",
      editVal: " "
    },
    medicineDose: "",
    duration: {
      durationType: "days",
      durationTime: ""
    }
  }
  temp_selectedDays: any = [];
  DaysArray = [
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
  finalObj: any = {};
  isDateChanged: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public elemRef: ElementRef, public render: Renderer2, public _dataContext: DataContext, private commonService: CommonServices) {
    this.DurationFrom = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    this.DurationTo = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    this.maxDate = "2049-12-31";
    this.minDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    this.finalObj.StartDate = moment(this.DurationFrom).format('DD-MMM-YYYY');
  }

  // async onInput(ev: any) {
  //   if (this.medicinesearched.length >= 2) {
  //     console.log(this.medicinesearched);
  //     this.showMedicine = true;
  //     this.medicineList = await (this.commonService.filterMedicine(this.medicinesearched));
  //     console.log(this.medicineList.length);
  //     if (this.medicineList.length == 0 || this.medicineList.length == undefined) {
  //       this.mednotfound = true;
  //     } else {
  //       this.mednotfound = false;
  //     }
  //   } else if (this.medicinesearched.length == 0 || this.medicinesearched.length == undefined) {
  //     this.showMedicine = false;
  //     this.mednotfound = true;
  //   }
  // }
  selctedMedicine(selectedmedicine) {
    this.navCtrl.push("AddremiderFormPage", { data: selectedmedicine.medicinename });
  }
  ionViewDidLoad() {
    this.isDateChanged = true;
    //var self = this;
    this.DosageUnits = [
      {
        unit: "mg"
      },
      {
        unit: "ml"
      },
      {
        unit: "drops"
      }
    ]
    this.commonService.onEntryPageEvent("Enter reminder detail");
    this.days = "Days";
    this.reminder.duration.durationTime = this.daysRange;
    this.reminder.medicineDose = "1.0";
    let data = (this.navParams.get("medicineName"));
    let pageFrom = (this.navParams.get("pageFrom"));
    if (pageFrom == "Search") {
      this.finalObj.Id = 0;
      this.reminder.medicineName = this.navParams.get("medicineName");
    }
    /*-----------------from Edit-------------------*/
    else if (pageFrom == "Edit") {
      let edit_reminder = this.navParams.get("data");
      this.isDateChanged = edit_reminder != null ? true : false;
      this.finalObj.Id = edit_reminder.Id;
      this.reminder.selectedDays.type = edit_reminder.reminder.DayType;
      this.reminder.medicineName = edit_reminder.reminder.MedicineName;
      this.reminder.medicineDose = edit_reminder.reminder.MedicineDose;
      this.TempMedicineDosage = this.reminder.medicineDose;
      this.reminder.selectedTime = edit_reminder.reminder.MedicineTime;
      this.reminder.selectedDays.type = edit_reminder.reminder.DayType;
      this.DosageUnit = edit_reminder.reminder.MedicineDose.split("(")[1].replace(")", "");
      this.reminder.medicineDose = edit_reminder.reminder.MedicineDose.split("(")[0].replace("(", "");
      // this.DosageUnit = edit_reminder.reminder.MedicineDose.;
      //this.reminder.selectedDays.value=edit_reminder.reminder.DayValue;
      this.reminder.selectedDays.editVal = edit_reminder.reminder.DayValue;
      if (this.reminder.selectedDays.type === "EveryDay") {
        this.reminder.selectedDays.value = edit_reminder.reminder.DayValue;
      }
      if (edit_reminder.reminder.DayType === "SelectedDays") {
        let selectedDays = edit_reminder.reminder.DayValue.split(",");
        this.reminder.selectedDays.value = "";
        for (let i = 0; i < selectedDays.length; i++) {
          switch ((selectedDays[i])) {
            case "Monday": {
              this.reminder.selectedDays.value += "MON" + ",";
              break;
            }
            case "Tuesday": {
              this.reminder.selectedDays.value += "TUE" + ",";
              break;
            }
            case "Wednesday": {
              this.reminder.selectedDays.value += "WED" + ",";
              break;
            }
            case "Thursday": {
              this.reminder.selectedDays.value += "THU" + ",";
              break;
            }
            case "Friday": {
              this.reminder.selectedDays.value += "FRI" + ",";
              break;
            }
            case "Saturday": {
              this.reminder.selectedDays.value += "SAT" + ",";
              break;
            }
            case "Sunday": {
              this.reminder.selectedDays.value += "SUN" + ",";
              break;
            }
            default: {
              // this.reminder.selectedDays.value
            }
          }
        }
        this.reminder.selectedDays.value = this.reminder.selectedDays.value.substring(0, this.reminder.selectedDays.value.length - 1);
      }
      if (edit_reminder.reminder.DayType === "IntervalOfDays") {
        //this.reminder.selectedDays.editVal=edit_reminder.reminder.DayValue;
        this.reminder.selectedDays.value = "every " + edit_reminder.reminder.DayValue + " days";
      }
      this.reminder.duration.durationType = edit_reminder.reminder.DurationType;
      this.DurationFrom = moment(edit_reminder.reminder.StartDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      this.DurationTo = moment(edit_reminder.reminder.EndTime).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      // var a = moment([2007, 0, 29]);
      // var b = moment([2007, 0, 28]);
      // a.diff(b, 'days');
      // if (this.reminder.duration.durationType == "days") {
      //   let a = moment(edit_reminder.reminder.StartDate, "DD-MMM-YYYY");
      //   let b = moment(edit_reminder.reminder.EndTime, "DD-MMM-YYYY");
      //   this.daysRange = (b.diff(a, 'days'));
      //   this.reminder.duration.durationTime = this.daysRange;
      //   if (this.daysRange > 1) {
      //     this.days = "Days";
      //   } else {
      //     this.days = "Day";
      //   }
      // }
      // if (this.reminder.duration.durationType == "weeks") {
      //   let a = moment(edit_reminder.reminder.StartDate, "DD-MMM-YYYY");
      //   let b = moment(edit_reminder.reminder.EndTime, "DD-MMM-YYYY");
      //   this.weeksRange = (b.diff(a, 'weeks'));
      //   this.reminder.duration.durationTime = this.weeksRange;
      //   if (this.weeksRange > 1) {
      //     this.weeks = "Weeks";
      //   } else {
      //     this.weeks = "Week";
      //   }
      // }
      // if (this.reminder.duration.durationType == "months") {
      //   let a = moment(edit_reminder.reminder.StartDate, "DD-MMM-YYYY");
      //   let b = moment(edit_reminder.reminder.EndTime, "DD-MMM-YYYY");
      //   this.monthsRange = (b.diff(a, 'months'));
      //   this.reminder.duration.durationTime = this.monthsRange;
      //   if (this.monthsRange > 1) {
      //     this.months = "Months";
      //   } else {
      //     this.months = "Month";
      //   }

      // }

    } else {

    }


  }


  // added by vinod start
  onSelectedDate(val) {
    let selectedFromDate = moment(this.DurationFrom).format('DD-MMM-YYYY');
    let selectedToDate = moment(this.DurationTo).format('DD-MMM-YYYY');
    this.DurationTo = moment(selectedFromDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    this.finalObj.StartDate = selectedFromDate;
  }
  onSelectedToDate(val) {
    let endDate = moment(this.DurationTo).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    this.finalObj.EndTime = moment(endDate).format('DD-MMM-YYYY');
  }

  // added by vinod end



  /*-----------------Saving Reminder---------------------*/
  SaveReminder() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getAddedReminderMedicineList"), []);

    // if (this.reminder.duration.durationType == "days") {
    //   let temp_endDate = moment().add(this.reminder.duration.durationTime, 'days').format("DD-MMM-YYYY");
    //   this.finalObj.EndTime = temp_endDate;
    // }
    // if (this.reminder.duration.durationType == "weeks") {
    //   let temp_endDate = moment().add(this.reminder.duration.durationTime, 'weeks').format("DD-MMM-YYYY");
    //   this.finalObj.EndTime = temp_endDate;
    // }
    // if (this.reminder.duration.durationType == "months") {
    //   let temp_endDate = moment().add(this.reminder.duration.durationTime, 'months').format("DD-MMM-YYYY");
    //   this.finalObj.EndTime = temp_endDate;
    // }
    // if (this.reminder.duration.durationType == "forever") {
    //   this.reminder.duration.durationTime = 5;
    //   let temp_endDate = moment().add(this.reminder.duration.durationTime, 'years').format("DD-MMM-YYYY");
    //   this.finalObj.EndTime = temp_endDate;
    // }

    this.finalObj.MedicineName = this.reminder.medicineName;
    this.finalObj.MedicineDose = this.reminder.medicineDose + "(" + this.DosageUnit + ")";
    this.finalObj.MedicineTime = this.reminder.selectedTime;
    this.finalObj.DayType = this.reminder.selectedDays.type;
    this.finalObj.DurationType = this.reminder.duration.durationType;
    //this.finalObj.DayValue=this.reminder.selectedDays.value;
    //this.finalObj.StartDate = start_Date;
    if (this.reminder.selectedDays.type == "IntervalOfDays") {
      this.finalObj.DayValue = this.reminder.selectedDays.editVal;
    } else if (this.reminder.selectedDays.type == "SelectedDays") {
      this.temp_selectedDays = this.reminder.selectedDays.value.split(",");
      this.finalSelectedDays = "";
      for (let i = 0; i < this.temp_selectedDays.length; i++) {
        switch (this.temp_selectedDays[i]) {
          case "SUN": {
            this.finalSelectedDays += "Sunday" + ",";
            //this.reminder.selectedDays.value+="7"+",";
            break;
          }
          case "MON": {
            this.finalSelectedDays += "Monday" + ",";
            //this.reminder.selectedDays.value+="1"+",";
            break;
          }
          case "TUE": {
            this.finalSelectedDays += "Tuesday" + ",";
            // this.reminder.selectedDays.value+="2"+",";
            break;
          }
          case "WED": {
            this.finalSelectedDays += "Wednesday" + ",";
            //this.reminder.selectedDays.value+="3"+",";
            break;
          }
          case "THU": {
            this.finalSelectedDays += "Thursday" + ",";
            // this.reminder.selectedDays.value+="4"+",";
            break;
          }
          case "FRI": {
            this.finalSelectedDays += "Friday" + ",";
            // this.reminder.selectedDays.value+="5"+",";
            break;
          }
          case "SAT": {
            this.finalSelectedDays += "Saturday" + ",";
            //this.reminder.selectedDays.value+="6"+",";
            break;
          }
        }
      }

      this.finalSelectedDays = this.finalSelectedDays.substring(0, this.finalSelectedDays.length - 1);
      this.finalObj.DayValue = this.finalSelectedDays;
    } else {
      this.finalObj.DayValue = this.reminder.selectedDays.value;
    }
    if (this.finalObj.MedicineTime != "" && this.finalObj.MedicineTime != undefined && this.finalObj.MedicineTime != null) {
      if (this.finalObj.DayValue != "" && this.finalObj.DayValue != undefined && this.finalObj.DayValue != null) {
        this._dataContext.AddMedicineReminder(this.finalObj)
          .subscribe(response => {
            if (response.Status) {
              this.navCtrl.push("MedicineList");
              if (this.finalObj.Id > 0) {
                this.commonService.onMessageHandler("Reminder successfully updated", 1);
                this.commonService.onEventSuccessOrFailure("reminder added successfully");

              }
              else {
                this.commonService.onMessageHandler(response.Message, 1);
              }
            }
            else {
              this.commonService.onMessageHandler(response.Message, 0);
            }
          },
            error => {
              this.commonService.onMessageHandler("Failed to Retrieve Notifications. Please try again.", 0);
              this.commonService.onEventSuccessOrFailure("reminder add failed");
            });
      }
      else {
        this.commonService.onMessageHandler("Please choose day", 0);
      }
    }
    else {
      this.commonService.onMessageHandler("Please select time", 0);
    }
  }
  increaseDosage() {
    this.TempMedicineDosage = (parseFloat(this.TempMedicineDosage) + .25);
    //this.dosageval = parseFloat(this.dosageval + this.increseLimit);
  }
  reduceDosage() {
    if (this.TempMedicineDosage > 1.0) {
      //this.dosageval = parseFloat(this.dosageval - this.increseLimit);
      this.TempMedicineDosage = (parseFloat(this.TempMedicineDosage) - .25);
    }
  }


  setDosage() {
    this.reminder.medicineDose = this.TempMedicineDosage;
    this.render.setStyle(this.elemRef.nativeElement.querySelector('.customPopUp'), 'display', 'none');
    let obj = this;
    setTimeout(function () {
      obj.render.setStyle(obj.elemRef.nativeElement.querySelector('.mainPopUp'), 'transform', 'scale(0)');
      obj.render.setStyle(obj.elemRef.nativeElement.querySelector('.mainPopUp'), 'transition', 'all 0.3s');
    }, 120)
  }
  cancelDosage() {
    this.render.setStyle(this.elemRef.nativeElement.querySelector('.customPopUp'), 'display', 'none');
    let obj = this;
    setTimeout(function () {
      obj.render.setStyle(obj.elemRef.nativeElement.querySelector('.mainPopUp'), 'transform', 'scale(0)');
      obj.render.setStyle(obj.elemRef.nativeElement.querySelector('.mainPopUp'), 'transition', 'all 0.3s');
    }, 120)
  }
  OnTimeChange(ev: any) {
    //this.slectedTime.push((ev.hour+":"+ev.minute+":"+ev.ampm));
    this.slectedTime.push(5);
  }
  selectTimings() {
    let TimeModal = this.modalCtrl.create("TimingSelectionPage", { selectedTime: this.reminder.selectedTime, });
    TimeModal.onDidDismiss(data => {
      if (data != "" && data != undefined) {
        this.daySlectionType = 2;
        if (data.totalCount > 0) {
          this.slectedTime = "";
          data.medicineTime.filter(item => {
            if (item.time != '' && item.time != null && item.time != undefined) {
              this.slectedTime += item.time + ",";
              this.reminder.selectedTime = this.slectedTime;
            }
          })
        }
        /*-------------this needs to check  for timing selection-----------*/
        this.reminder.selectedTime = this.reminder.selectedTime.substring(0, this.reminder.selectedTime.length - 1);
      }

    });
    TimeModal.present();
  }
  selectDays() {
    let DaysModal = this.modalCtrl.create("DaysSelectionPage", { data: this.reminder.selectedDays });
    DaysModal.onDidDismiss(data => {
      if (data) {
        if (data.selected == "everyday") {
          this.slectedDays = "Everyday";
          //this.reminder.selectedDays.type = 1;
          this.reminder.selectedDays.type = "EveryDay";
          this.reminder.selectedDays.value = "Everyday";
        } else if (data.selected == "selecteddays") {
          this.slectedDays = data.content;
          //this.reminder.selectedDays.type = 2;
          this.reminder.selectedDays.type = "SelectedDays";
          this.reminder.selectedDays.value = data.content;
          this.reminder.selectedDays.value = this.reminder.selectedDays.value.substring(0, this.reminder.selectedDays.value.length - 1);
        }
        else if (data.selected == "intervalofdays") {
          //this.slectedDays = "Every " + data.content[0] + " Days";
          //this.reminder.selectedDays.type = this.slectedDays;
          //this.reminder.selectedDays.type = 3;
          this.reminder.selectedDays.type = "IntervalOfDays";
          this.reminder.selectedDays.value = "Every " + data.content + " Days";
          this.reminder.selectedDays.editVal = data.content;
        }
      }
    });
    DaysModal.present();
  }
  openPopUp() {
    var self = this;
    //var  = el.getElementsByClassName('editbtn');
    //this.elemRef.nativeElement.querySelector('.doseVal').innerHTML = this.elemRef.nativeElement.querySelector('.dval').innerHTML
    this.render.setStyle(this.elemRef.nativeElement.querySelector('.customPopUp'), 'display', 'block');
    setTimeout(function () {
      self.render.setStyle(self.elemRef.nativeElement.querySelector('.mainPopUp'), 'transform', 'scale(1)');
      self.render.setStyle(self.elemRef.nativeElement.querySelector('.mainPopUp'), 'transition', 'all 0.3s');
    }, 120);
  }
  selectedRange(range, ev) {
    if (range == "days") {
      if (ev.value >= 1) {
        this.days = "Days";
        // this.reminder.duration.durationType = this.days;
        this.reminder.duration.durationTime = this.daysRange;
      }
    }
    if (range == "weeks") {
      if (ev.value >= 1) {
        this.weeks = "Weeks";
        // this.reminder.duration.durationType = this.weeks;
        this.reminder.duration.durationTime = this.weeksRange;
      }
    }
    if (range == "months") {
      if (ev.value >= 1) {
        this.months = "Months";
        //this.reminder.duration.durationType = this.months;
        this.reminder.duration.durationTime = this.monthsRange;
      }
    }
  }
  changeDuration(ev) {
    if (this.reminder.duration.durationType == "days") {
      this.days = "Days";
      // this.reminder.duration.durationType = this.days;
      this.reminder.duration.durationTime = this.daysRange;
    }
    if (this.reminder.duration.durationType == "weeks") {
      this.weeks = "Weeks";
      this.reminder.duration.durationTime = this.weeksRange;
    }
    if (this.reminder.duration.durationType == "months") {
      this.months = "Months";
      this.reminder.duration.durationTime = this.monthsRange;
    }
  }
  addReminder() {
    let addModal = this.modalCtrl.create("AddReminderPage", { status: "Edit" });
    addModal.onDidDismiss(item => {
      if (item) {
        this.reminder.medicineName = item;
      }
    })
    addModal.present();
  }
}

