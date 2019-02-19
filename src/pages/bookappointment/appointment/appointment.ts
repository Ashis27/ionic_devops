import { Component, ViewChild } from '@angular/core';
import { App, NavParams, IonicPage, NavController, Slides, AlertController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';
import * as $ from 'jquery';

@IonicPage()
@Component({
  selector: 'page-appointment',
  templateUrl: 'appointment.html'

})
export class Appointment {
  @ViewChild('slides') slides: Slides;
  numbers = [0, 1, 2];
  firstLoad = true;
  doctorInfo: any = [];
  sevenDaysAvailability: any = [];
  appoChargesPg: any = [];
  scheduleDetails: any;
  maxDate: string;
  minDate: string;
  isEmptySlots: boolean = false;
  showSelectedDate: string;
  showCurrentDate: string;
  selectedSlot: string;
  doctorShceduleCharges: any;
  hospitalList: any = [];
  groupEntityId: number = 0;
  isDateSelected: boolean = false;
  selectedHospitalName: string;
  selectedHospital: any = {};
  isDocAvailable: boolean = true;

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
    this.doctorInfo = this.navParams.get('doctorDetails');
    this.doctorInfo.ProviderName = this.commonService.convert_case(this.doctorInfo.ProviderName);

    //this.commonService.setStoreDataIncache("doctorInfo", this.doctorInfo);
  }
  ionViewDidEnter() {
    // if (this.doctorInfo == undefined || this.doctorInfo == null) {
    //   this.commonService.getStoreDataFromCache("doctorInfo")
    //     .then((result) => {
    //       if (result) {
    //         this.doctorInfo = result;
    //         this.setDoctorDetails();
    //       }
    //     });
    // }
    this.setDoctorDetails();
    this.commonService.onEntryPageEvent("Time Slot Selection Page");
  }


  // added by vinod start 
loadNext() {
   this.slides.lockSwipeToPrev(false);
  if(this.firstLoad) {
    // Since the initial slide is 1, prevent the first 
    // movement to modify the slides
    this.firstLoad = false;
    return;
  }

    console.log(this.slides.getActiveIndex());
    let newIndex = this.slides.getActiveIndex();

  newIndex--;
  this.numbers.push(this.numbers[this.numbers.length - 1] + 1);
  this.numbers.shift();
  // Workaround to make it work: breaks the animation
  this.slides.slideTo(newIndex, 0, false);
  this.showCurrentDate = moment(this.sevenDaysAvailability[6].Date).format('DD-MMM-YYYY');//this.showSelectedDate;
  this.showSelectedDate = moment(this.showCurrentDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  
  this.selectedSlot = "";
  console.log(`${this.showCurrentDate}::${this.showSelectedDate}::`);
  $(".scheduleDays").removeClass("active-schedule").addClass("quick-date-li");
  this.getFreeScheduleForDayForSelectedDate(this.doctorInfo.ProviderId, this.showCurrentDate, this.groupEntityId);
  this.getSevenDaysAvailability(this.doctorInfo.ProviderId,this.showCurrentDate);
  console.log(`New status: ${this.numbers}`);
}

  loadPrev() {
    console.log('Prev');
    let newIndex = this.slides.getActiveIndex();

    newIndex++;
    this.numbers.unshift(this.numbers[0] - 1);
    this.numbers.pop();

    // Workaround to make it work: breaks the animation
    this.slides.slideTo(newIndex, 0, false);

console.log(`New status: ${this.numbers}`);
  this.showCurrentDate = moment(this.sevenDaysAvailability[0].Date).subtract(6,'days').format('DD-MMM-YYYY');//this.showSelectedDate;
  this.showSelectedDate = moment(this.showCurrentDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  console.log(`${this.showCurrentDate}::${this.showSelectedDate}`);
  //moment(this.showSelectedDate).isAfter(this.showCurrentDate);
  this.selectedSlot = "";

   $(".scheduleDays").removeClass("active-schedule").addClass("quick-date-li");
   this.getFreeScheduleForDayForSelectedDate(this.doctorInfo.ProviderId, this.showCurrentDate, this.groupEntityId);
   this.getSevenDaysAvailability(this.doctorInfo.ProviderId,this.showCurrentDate);
   console.log(`New status: ${this.numbers}`);
   if(moment(this.showSelectedDate).isSameOrBefore(moment(new Date()).format("DD-MMM-YYYY"))){
    this.slides.lockSwipeToPrev(true);
    console.log(moment(this.showSelectedDate).isSameOrAfter(this.showCurrentDate));
  }else{
    this.slides.lockSwipeToPrev(false);
  }  
}

// added by vinod end


  setDoctorDetails() {
    this.maxDate = "2049-12-31";
    this.minDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    if (this.doctorInfo.SelectedDate != undefined && this.doctorInfo.SelectedDate != null && this.doctorInfo.SelectedDate != "") {
      this.showSelectedDate = moment(this.doctorInfo.SelectedDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      this.showCurrentDate = moment(this.doctorInfo.SelectedDate).format('DD-MMM-YYYY');
    }
    else {
      this.showSelectedDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      this.showCurrentDate = moment().format('DD-MMM-YYYY');
    }
    if (this.doctorInfo.ProviderRating == 0) {
      this.getProviderRating();
    }
    this.getHospitals();
  }
  //Get indivual doctor hospital details based on ID.
  getHospitals() {
    this._dataContext.GetHospitals(this.doctorInfo.ProviderId)
      .subscribe(response => {
        if (response.Status && response.result != null && response.result.length> 0) {
          let isHospitalAvailable = false;
          this.hospitalList = response.result;
          if (this.doctorInfo.GroupEntityId) {
            this.groupEntityId = this.doctorInfo.GroupEntityId;
          }
          else {
            this.groupEntityId = response.result[0].GroupEntityID;
          }
          this.hospitalList.filter(item => {
            if (item.GroupEntityID == this.groupEntityId) {
              this.selectedHospitalName = item.Name;
              this.selectedHospital = item;
              isHospitalAvailable = true;
            }
          });
          if (isHospitalAvailable) {
            this.getSevenDaysAvailability(this.doctorInfo.ProviderId);
            this.getFreeScheduleForDayForSelectedDate(this.doctorInfo.ProviderId, this.showCurrentDate, this.groupEntityId);
            this.isDocAvailable = true;
          }
          else {
            this.isDocAvailable = false;
          }
        }
        else {
          this.isDocAvailable = false;
          let isHospitalAvailable = false;
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  changeHospital() {
    if (this.hospitalList && this.hospitalList.length > 1) {
      let prompt = this.alertCtrl.create();
      prompt.setTitle('Select Hospital');
      this.hospitalList.forEach(item => {
        prompt.addInput({
          type: 'radio',
          label: item.Name,
          value: item.GroupEntityID,
          checked: item.GroupEntityID == this.groupEntityId
        });
      });
      prompt.addButton('CANCEL');
      prompt.addButton({
        text: 'OK',
        handler: data => {
          this.hospitalList.filter(item => {
            if (item.GroupEntityID == data) {
              this.selectedHospitalName = item.Name;
              this.selectedHospital = item;
            }
          })
          this.groupEntityId = data;
          this.getFreeScheduleForDayForSelectedDate(this.doctorInfo.ProviderId, this.showCurrentDate, this.groupEntityId);
        }
      });
      prompt.present();
    }
  }
  getProviderRating() {
    this._dataContext.GetProviderRating(this.doctorInfo.ProviderId)
      .subscribe(response => {
        if (response.result != null) {
          this.doctorInfo.ProviderRating = response.result.AverageRating;
          this.doctorInfo.TotalRatedUser = response.result.TotalCount;
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve", 0);
        });
  }
  getSevenDaysAvailability(providerId, currentDate?) {
    // added by vinod start (changed to if else stmt)
    //console.log(`${providerId}::${currentDate}`);
    if(currentDate){
      let response=[];
      response.push({ Available: true, Date: currentDate, Day: moment(currentDate).format("DD"),
      currentMonth:moment(currentDate).format("MMM"),
      currentDate:moment(currentDate).format("DD"), currentYear:moment(currentDate).format("YYYY"),
      currentDay:moment().isoWeekday(moment(currentDate).day()).format("ddd") });
      
      for(let i=1;i<7;i++){
        let Temp_Date = moment(currentDate).add('days', i).format('DD-MMM-YYYY');
        response.push({
          Available: true, Date: Temp_Date, Day: moment(Temp_Date).format("DD"), currentMonth: moment(Temp_Date).format("MMM"),
          currentDate: moment(Temp_Date).format("DD"), currentYear: moment(Temp_Date).format("YYYY"),
          currentDay: moment().isoWeekday(moment(Temp_Date).day()).format("ddd")
        });
      }
      this.sevenDaysAvailability = response;
      console.log(this.sevenDaysAvailability);
      // added by vinod end
    }else{
    this._dataContext.GetSevenDaysAvailability(providerId)
      .subscribe(response => {
        response = response.reverse();
        
        response.push({ Available: true, Date: this.showCurrentDate, Day: moment(this.showCurrentDate).format("DD") });
        response = response.reverse();
        this.sevenDaysAvailability = response.filter((item) => {
          
          item["currentMonth"] = moment(item.Date).format("MMM");
          item["currentDate"] = moment(item.Date).format("DD");
          item["currentYear"] = moment(item.Date).format("YYYY");
          item["currentDay"] = moment().isoWeekday(moment(item.Date).day()).format("ddd");
          return item;
        
          //item["ActualDate"] = item.Date; return item.Date = item.Date.substr(0, item.Date.lastIndexOf(" "))
        }
        );
        console.log(response);
        // this.sevenDaysAvailability = response;
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
      }
  }
  getFreeScheduleForDayForSelectedDate(providerId, selectedDate, groupEntityId) {
    this._dataContext.GetFreeScheduleForDayForSelectedDate(providerId, selectedDate, groupEntityId)
      .subscribe(response => {
        if (response.length > 0) {
          this.appoChargesPg = response[0].AppoChargesforPG;
          this.scheduleDetails = response[0];
          if (this.scheduleDetails.Morning.length > 0) {
            this.scheduleDetails.Morning.filter(item => {
              item.TimeSlot = moment(item.TimeSlot, "h:mm").format("hh:mm");
            });
          }
          if (this.scheduleDetails.Afternoon.length > 0) {
            this.scheduleDetails.Afternoon.filter(item => {
              item.TimeSlot = moment(item.TimeSlot, "h:mm").format("hh:mm");
            });
          }
          if (this.scheduleDetails.Evening.length > 0) {
            this.scheduleDetails.Evening.filter(item => {
              item.TimeSlot = moment(item.TimeSlot, "h:mm").format("hh:mm");
            });
          }

        }
        else {
          this.appoChargesPg = [];
          this.scheduleDetails = null;
          this.isEmptySlots = true;
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve", 0);
        });
  }
  onSelectedDate() {
   // console.log(`${this.showCurrentDate}::${this.showSelectedDate}`);
    if (this.isDateSelected) {
      this.showCurrentDate = moment(this.showSelectedDate).format('DD-MMM-YYYY');//this.showSelectedDate;
      this.selectedSlot = "";
      $(".scheduleDays").removeClass("active-schedule").addClass("quick-date-li");
      this.getFreeScheduleForDayForSelectedDate(this.doctorInfo.ProviderId, this.showCurrentDate, this.groupEntityId);
      // this.getSevenDaysAvailability(this.doctorInfo.ProviderId);
    }
  }
  slectedDateFromAvailableSchedule(data, event) {
    if (data.Available) {
      this.isDateSelected = false;
      this.showSelectedDate = moment(data.Date).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      $(".scheduleDays").removeClass("active-schedule").addClass("quick-date-li");
      $(event.currentTarget).addClass("active-schedule").removeClass("quick-date-li");
      this.showCurrentDate = moment(data.Date).format('DD-MMM-YYYY');
      this.selectedSlot = "";
      this.getFreeScheduleForDayForSelectedDate(this.doctorInfo.ProviderId, data.Date, this.groupEntityId);
    }
  }
  slotSelectedToBookAppo(value, event, timeFormat) {
    $(".li-time-selector").removeClass("li-time-selector-active");
    $(event.currentTarget).addClass("li-time-selector-active");
    // let alert = this.alertCtrl.create({
    //   message: 'Do you want to Confirm this Time slot?',
    //   buttons: [
    //     {
    //       text: 'Cancel',
    //       role: 'cancel',
    //       handler: () => {
    //       }
    //     },
    //     {
    //       text: 'Confirm',
    //       handler: () => {
    if (timeFormat != 'am') {
      this.commonService.onEntryPageEvent("Morning " + value + " time slot selected");
      value = moment(value + " PM", "h:mm A").format("HH:mm");

    }
    else {
      this.commonService.onEntryPageEvent("Afternoon/Evening " + value + " time slot selected");
    }
    this.selectedSlot = value;
    let selectedDate = new Date();
    this.doctorShceduleCharges = this.scheduleDetails.AppoChargesforPG;
    if (this.scheduleDetails.AppoChargesforPG != null) {
      selectedDate.setMinutes(selectedDate.getMinutes() + this.scheduleDetails.AppoChargesforPG.OnlineAppointmentMinimumDelay);
      let hr = selectedDate.getHours();
      let min = selectedDate.getMinutes();
      let date1 = moment().format("DD-MMM-YYYY");
      let time = this.selectedSlot.split(":");
      let hour = time[0].trim();
      let min1 = time[1].trim();
      let status = moment(this.showCurrentDate).isSame(date1);
      let currentTime = (selectedDate.getHours() + ":" + selectedDate.getMinutes());
      if (status) {
        if ((hr > parseInt(hour))) {
          this.selectedSlot = "";
          this.commonService.onMessageHandler("Online appointment booking for this hospital should be done at least " + this.scheduleDetails.AppoChargesforPG.OnlineAppointmentMinimumDelay + " minutes before.", 0);
        }
        else if ((hr >= parseInt(hour)) && (min > parseInt(min1))) {
          this.selectedSlot = "";
          this.commonService.onMessageHandler("Online appointment booking for this hospital should be done at least " + this.scheduleDetails.AppoChargesforPG.OnlineAppointmentMinimumDelay + " minutes before.", 0);
        }
        else {
          this.navCtrl.push("AppointmentPreConfirmation", { doctorDetails: this.doctorInfo, appoCharges: this.doctorShceduleCharges, timeSlotInfo: { timeSlot: this.selectedSlot, date: this.showCurrentDate }, hospital: this.selectedHospital, });
        }
      }
      else {
        this.navCtrl.push("AppointmentPreConfirmation", { doctorDetails: this.doctorInfo, appoCharges: this.doctorShceduleCharges, timeSlotInfo: { timeSlot: this.selectedSlot, date: this.showCurrentDate }, hospital: this.selectedHospital, });
      }
    }
    else {
      this.navCtrl.push("AppointmentPreConfirmation", { doctorDetails: this.doctorInfo, appoCharges: this.doctorShceduleCharges, timeSlotInfo: { timeSlot: this.selectedSlot, date: this.showCurrentDate }, hospital: this.selectedHospital, });
    }
    //       }
    //     }
    //   ]
    // });
    // alert.present();
  }
}







