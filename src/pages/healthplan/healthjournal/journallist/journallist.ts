import { TweenMax, TimelineMax, Elastic, Linear } from "gsap/TweenMax";
import { Component, ViewChild } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController, NavParams, Slides } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../../providers/dataContext.service';
import { CommonServices } from '../../../../providers/common.service';
import * as _ from "lodash";
import moment from 'moment';
import * as $ from 'jquery';

@IonicPage()
@Component({
  selector: 'page-journallist',
  templateUrl: 'journallist.html'
})
export class HealthJournalList {
  timeOfPregnancy: number;
  activeTrimester: any;
  @ViewChild('slides') slides: Slides;
  rightdate: any;
  leftdate: any;
  trimesterJournalList: any = [];
  date: number;
  lmp: any;
  healthJournalList: any = [];
  dateJournalList: any = [];
  healthjournaldates: any = [];
  consumerId: number = 0;
  healthPlanId: number = 0;
  isAvailable: boolean = true;
  tapOption: any = [];
  tabValue: string;
  sliderImageList: any = [];
  isJournalAvailable: boolean = true;
  healthJournalListGroupByDate: any = [];
  backUpHealthPlanList: any = [];
  selectedTrimester: number;
  testhealthJournal: any;

  constructor(public navParams: NavParams, private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, public navCtrl: NavController) {
    this.tapOption[0] = "Trimester1";
    this.tapOption[1] = "Trimester2";
    this.tapOption[2] = "Trimester3";
    this.healthPlanId = this.navParams.get("healthPlanId");
    this.lmp = this.navParams.get("lmp");
    this.timeOfPregnancy = this.navParams.get("timeOfPregnancy");
   
    this.activeTrimester=1;
     if (this.timeOfPregnancy>12 &&this.timeOfPregnancy<25) {
    this.activeTrimester=2;
    }
    else  if (this.timeOfPregnancy>=25){
      this.activeTrimester=3;
    }
    this.selectedTrimester = this.activeTrimester;
  }
  ionViewDidEnter() {
    this.getLoggedonUserDetails();
    // this.getHealthJournals();
    this.tabValue = "appo-";
    console.log(this.testhealthJournal);

  }
  getLoggedonUserDetails() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.consumerId = result.ConsumerID;
          this.changeTrimeester((this.selectedTrimester-1), []);
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  getTrimesterResponse(id) {
    this._dataContext.GetTrimesterResponse(id, this.healthPlanId, this.consumerId)
      .subscribe(response => {
        if (response && response.length > 0) {
          this.healthJournalList = response.reverse();
          this.healthJournalList.filter(item => {
            item["currentMonth"] = moment(item.EntryDate).format("MMM");
            item["currentDate"] = moment(item.EntryDate).format("DD");
            item["currentYear"] = moment(item.EntryDate).format("YYYY");
            item["date"] = moment(item.EntryDate).format("DD-MMM-YYYY");
            return item;
          });
          this.healthJournalListGroupByDate = _(this.healthJournalList)
            .groupBy('date')
            .map((value, key) => ({ 'EntryDate': value[0].EntryDate }))
            .value();
          this.isJournalAvailable = true;
          this.backUpHealthPlanList = this.healthJournalList;
          this.setDatesAndTrimester(id);

        }
        else {
          this.healthJournalList = [];
          this.isJournalAvailable = false;
        }
      },
      error => {
        console.log(error);
        this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
      });
  }
  setDatesAndTrimester(date) {
    this.healthjournaldates = [];
    let entrydate;
    this.healthJournalListGroupByDate.sort((left, right) => {    
      return moment(left.EntryDate).diff(moment(right.EntryDate)); // sorts the array by thye date
    })

    // changes the format and sets a date for the start and end point
    this.healthJournalListGroupByDate.forEach(journaldates => {
      let date = moment(journaldates.EntryDate).format("DD-MMM");
      let dateEntered = moment(journaldates.EntryDate).format("DD-MMM-YYYY");
      this.healthjournaldates.push(date);
      entrydate = date;
    });
     console.log(this.healthjournaldates);
    this.onDateSelection(1);
  }
  //Slider Change
  onSlideChangeStart(slider: Slides) {
    // this.showSkip = !slider.isEnd();
  }
  downloadFilePreSignedURL(data) {
    this._dataContext.DownloadHealthPlanUniqueToken(this.consumerId, data.FileName)
      .subscribe(response => {
        // data["fileUrlPath"] = response.result;
        this.sliderImageList.push({ imgPath: response.result });
      },
      error => {
        this.commonService.onMessageHandler("Failed to retrive. Please try againg.", 0);
      });
  }
  onDateSelection(indextest) {
    this.sliderImageList = [];
    let count = 0;
    let result = [];
    this.healthJournalList = this.backUpHealthPlanList;
    let entrydate;
    let backupDate;
    let index = indextest;

    this.healthJournalList.forEach(element => {
      if (moment(this.healthjournaldates[index > 0 ? (index - 1) : index]).format("DD-MMM") == moment(element.EntryDate).format("DD-MMM")) {
        result.push(element);
        entrydate = moment(element.EntryDate).format("DD-MMM-YYYY");
        console.log(moment(element.EntryDate).format("DD-MMM"));
        count++;
        backupDate = index;
      }
    });
    this.date = backupDate;
    // gets journal by date grouped
    this._dataContext.GetHealthPlanJournalsForConsumerByDate(this.consumerId, this.healthPlanId, entrydate)
      .subscribe(response => {
        this.sliderImageList = [];
        if (response) {
          this.testhealthJournal = response;
          this.testhealthJournal.EntryDate = moment(this.testhealthJournal.EntryDate).format("DD-MMM-YYYY");
          this.testhealthJournal.UpdatedDate = moment(this.testhealthJournal.UpdatedDate).format("DD-MMM-YYYY");
          if (response.Document.length > 0 && this.sliderImageList.length == 0) {
            response.Document.forEach(element => {
              this.downloadFilePreSignedURL(element);
            });
          }
          else {
            //if no documents are uploaded against the selected date, then it shows the default images.
            this.sliderImageList = [
              {
                imgPath: "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/journal/trime-1/tri1.jpg"
              },
              {
                imgPath: "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/journal/trime-1/tri2.jpg"
              },
              {
                imgPath: "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/journal/trime-1/tri3.jpg"
              }
            ]
          }
        }
      },
      error => {
        console.log(error);
        this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
      });
    if (count == 0)
      this.healthJournalList = [];
    else
      this.healthJournalList = result;
  }
  setCardAnimation() {
    let myCurrentForm = document.getElementsByClassName('actioncard');
    var formTimeline = new TimelineMax();
    formTimeline.to('#cardContainer', 0, { display: 'block' })
      .staggerFrom(myCurrentForm, 0.5, {
        y: 100, opacity: 0, delay: 0.2,
        ease: Linear.easeOut, force3D: true
      }, 0.3);

  }
  tabSelection(event, value) {
    if (value == 'Trimester1') {
      this.leftdate = moment(this.lmp).format("DD-MMM");
      this.rightdate = moment(this.leftdate, "DD-MMM").add("days", 90).format("DD-MMM");
      this.healthjournaldates.forEach(element => {
        if (element.trimester == 1) {
          this.healthJournalList.forEach(element1 => {
            if (element.Id == element1.Id) {
              this.trimesterJournalList.push(element1);
            }
          });
        } else {
          this.trimesterJournalList = [];
          this.dateJournalList = [];
        }
      });

    } else if (value == 'Trimester2') {
      this.leftdate = moment(this.lmp).format("DD-MMM");
      this.leftdate = moment(this.leftdate, "DD-MMM").add("days", 91).format("DD-MMM");
      this.rightdate = moment(this.leftdate, "DD-MMM").add("days", 180).format("DD-MMM");
      this.healthjournaldates.forEach(element => {
        if (element.trimester == 2) {
          this.healthJournalList.forEach(element1 => {
            if (element.Id == element1.Id) {
              this.trimesterJournalList.push(element1);
            }
          });
        } else {
          this.trimesterJournalList = [];
          this.dateJournalList = [];
        }
      });

    }
    else {
      this.leftdate = moment(this.lmp).format("DD-MMM");
      this.leftdate = moment(this.leftdate, "DD-MMM").add("days", 181).format("DD-MMM");
      this.rightdate = moment(this.leftdate, "DD-MMM").add("days", 270).format("DD-MMM");
      this.healthjournaldates.forEach(element => {
        if (element.trimester == 3) {
          this.healthJournalList.forEach(element1 => {
            if (element.Id == element1.Id) {
              this.trimesterJournalList.push(element1);
            }
          });
        } else {
          this.trimesterJournalList = [];
          this.dateJournalList = [];
        }
      });
    }
    // this.healthjournaldates.unshift(date);
  
  }


  selectedHealthJournal(Id) {
    //this.navCtrl.push("HealthJournalDetails", { healthPlanJournalId: Id });
    this.navCtrl.push("HealthJournal", { healthPlanJournalId: Id, status: true, healthPlanId: this.healthPlanId, consumerId: this.consumerId, lmp: this.lmp, trimester: this.selectedTrimester });
  }
  uploadNewJournal() {
    let addModal = this.modalCtrl.create("HealthJournal", { healthPlanId: this.healthPlanId, consumerId: this.consumerId, lmp: this.lmp, trimester: this.selectedTrimester });
    addModal.onDidDismiss(item => {
      if (item) {
        this.getTrimesterResponse(this.selectedTrimester);
      }
    })
    addModal.present();
  }
  changeTrimeester(index, item) {
    console.log(this.activeTrimester);
    if(index<this.activeTrimester){
      this.healthjournaldates = [];
      this.testhealthJournal={};
      this.selectedTrimester = index + 1;
      // this.sliderImageList = [
      //   {
      //     imgPath: "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/journal/trime-" + (index + 1) + "/" + "tri1.jpg"
      //   },
      //   {
      //     imgPath: "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/journal/trime-" + (index + 1) + "/" + "tri2.jpg"
      //   },
      //   {
      //     imgPath: "https://s3.amazonaws.com/kare4u.platform.cmscontent/HealthPro/media/KarePlan/PregnancyPlan/journal/trime-" + (index + 1) + "/" + "tri3.jpg"
      //   }
      // ]
      $(".trimester-btn").removeClass("active-trimester-btn pulse").addClass("trimester-btn-style");
      $(".trimester-btn-" + index).removeClass("trimester-btn-style").addClass("active-trimester-btn pulse");
      $(".trimester-text").removeClass("active-trimester-text");
      $(".trimester-text-" + index).addClass("active-trimester-text");
      this.getTrimesterResponse(index + 1);
    }else{
      this.commonService.onMessageHandler("You are currently in Trimester"+this.activeTrimester+"", 0);
    }
   
  }

  prevJournal() {
    if (this.date > 1)
      this.onDateSelection(this.date - 1);
      else
      this.commonService.onMessageHandler("Please add a journal for previous date", 0);
  }
  nextJournal() {
    if (this.date < this.healthjournaldates.length)
      this.onDateSelection(this.date + 1);
      else
      this.commonService.onMessageHandler("Please add a journal for next date", 0);
  }

  updateFavoutite(journal) {
    let favourite: boolean = journal.Favourite;
    if (favourite) {
      this.testhealthJournal.Favourite = false;
      this._dataContext.MakeFavouriteHealthPlanJournal(journal.Id, false)
        .subscribe(response => {
          // data["fileUrlPath"] = response.result;
          // this.sliderImageList.push({ imgPath: response.result });
        },
        error => {
          this.commonService.onMessageHandler("Failed to remove favourite.", 0);
        });
    } else {
      this.testhealthJournal.Favourite = true;
      this._dataContext.MakeFavouriteHealthPlanJournal(journal.Id, true)
        .subscribe(response => {
          // data["fileUrlPath"] = response.result;
          // this.sliderImageList.push({ imgPath: response.result });
        },
        error => {
          this.commonService.onMessageHandler("Failed to add to favourite.", 0);
        });
    }

  }
}
