import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, PopoverController, ModalController, IonicPage } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
import { DataContext } from '../../../providers/dataContext.service';
import * as _ from "lodash";
import moment from 'moment';
import { PopoverPage } from '../../popover/popover';

@IonicPage()
@Component({
  selector: 'page-healthrecordlist',
  templateUrl: 'healthrecordlist.html'

})
export class HealthRecordList {
  upload: string = "byMe";
  userId: string;
  documentsBySelf: any = [];
  documentsBySelfList: any = [];
  totalItem: number = 10;
  pageNum: number = 0;
  itemsPerPage: number = 50;
  userName: string;
  familyList: any = [];
  healthrecordAvailableStatus: boolean = true;
  pagginationStatus: boolean = false;
  constructor(public _dataContext: DataContext, public popoverCtrl: PopoverController, public navCtrl: NavController, private modalCtrl: ModalController, public _zone: NgZone, public commonService: CommonServices) {
  }
  ionViewDidEnter() {
    this.pageNum = 0;
    this.documentsBySelf = [];
    this.getLoggedInUserDetailsFromCache();
    this.getFamilyFromCache();
    this.commonService.onEntryPageEvent("Come to health record page");
  }
  //Get family list of user from cache.
  getFamilyFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserFamily"))
      .then((result) => {
        if (result) {
          this.familyList = result;
          // this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserFamily"), this.familyList);
        }
      });
  }
  //Get Logged In user details from cache, if not available then get from server.
  getLoggedInUserDetailsFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
      .then((result) => {
        if (result.loginStatus) {
          this.userId = result.consumerId;
          this.userName = result.userName;
          // this.getHealthRecordUploadedByUserFromCache();
          if (this.upload == "byMe") {
            this.retriveConsumerDigitalDocuments(1, false);
          }
          else {
            this.retriveConsumerDigitalDocumentsByDoc(1, false);
            //this.RetriveConsumerDigitalDocumentsByDoctorByLab(0, false);
          }
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  //Get Records from cache uploaded by user
  getHealthRecordUploadedByUserFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUploadedHealthRecordByUser")).then(data => {
      if (data && data.length > 0) {
        this.documentsBySelf = data;
        this.documentsBySelfList = data;
        this.totalItem = data.length;
        this.documentsBySelf.filter(item => {
          item["currentMonth"] = moment(item.Date).format("MMM");
          item["currentDate"] = moment(item.Date).format("DD");
          item["currentYear"] = moment(item.Date).format("YYYY");
          return item;
        });
        this.healthrecordAvailableStatus = false;
        // this.pageNum = Math.floor(this.documentsBySelf.length / this.itemsPerPage);
        this.retriveConsumerDigitalDocuments(0, false);
      }
      else {
        this.documentsBySelf = [];
        this.documentsBySelfList = [];
        // fall here if item is expired or doesn't exist 
        this.retriveConsumerDigitalDocuments(1, false);
      }
    }).catch(error => {

    })
  }
  //Get User Health records
  retriveConsumerDigitalDocuments(value, refresher) {
    this.totalItem = 0;
    this._dataContext.GetConsumerDigitalDocumentList(this.pageNum, this.itemsPerPage)
      .subscribe(response => {
        if (response.ConsumerDocuments.rows.length > 0) {
          this.healthrecordAvailableStatus = true;
          this.familyList = response.FamilyList;
          this.totalItem = response.ConsumerDocuments.TotalRows;
          this.documentsBySelf = response.ConsumerDocuments.rows;// this.documentsBySelf.concat(response.ConsumerDocuments.rows);
          this.documentsBySelfList = this.documentsBySelf;
          this.documentsBySelf.filter(item => {
            item["currentMonth"] = moment(item.Date).format("MMM");
            item["currentDate"] = moment(item.Date).format("DD");
            item["currentYear"] = moment(item.Date).format("YYYY");
            item["ConsumerDigitalDocumentsID"] = item.id;
            return item;
          });
          //this.pageNum++;
          this.documentsBySelf = _.chain(this.documentsBySelf)
            .groupBy('CreatedDate')
            .map((value, key) => ({ TotalRecord: value, DocumentType: value[0].DocumentType, DocumentFor: value[0].DocumentFor, DocumentTypeName: value[0].DocumentTypeName, Relation: value[0].Relation, currentMonth: value[0].currentMonth, currentDate: value[0].currentDate, currentYear: value[0].currentYear, CountRecord: value.length }))
            .value();
        }
        else {
          this.healthrecordAvailableStatus = false;
          this.documentsBySelf = [];
          this.documentsBySelfList = [];
        }
        if (refresher) {
          refresher.complete();
        }
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserFamily"), this.familyList);
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUploadedHealthRecordByUser"), this.documentsBySelfList);
      },
        error => {
          this.commonService.onMessageHandler("Failed to retrive. Please try again.", 0);
        });
  }
  //Get User Health records from cache uploaded by doc/Lab
  getHealthRecordUploadedByDocFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUploadedHealthRecordByDoc")).then(data => {
      if (data && data.length > 0) {
        this.documentsBySelf = data;
        this.documentsBySelfList = data;
        this.healthrecordAvailableStatus = true;
        this.totalItem = data.length;
        this.documentsBySelf.filter(item => {
          item["currentMonth"] = moment(item.Date).format("MMM");
          item["currentDate"] = moment(item.Date).format("DD");
          item["currentYear"] = moment(item.Date).format("YYYY");
          return item;
        });
        this.pageNum = Math.floor(this.documentsBySelf.length / this.itemsPerPage);
      this.retriveConsumerDigitalDocumentsByDoc(0, false);
      // this.RetriveConsumerDigitalDocumentsByDoctorByLab(0, false);
      }
      else {
        this.documentsBySelf = [];
        this.documentsBySelfList = [];
        this.healthrecordAvailableStatus = false;
        this.retriveConsumerDigitalDocumentsByDoc(1, false);
      // this.RetriveConsumerDigitalDocumentsByDoctorByLab(1, false);
      }

    }).catch(error => {

    })
  }
   //Get User Health records uploaded by doc/hospital
   retriveConsumerDigitalDocumentsByDoc(value, refresher) {
    this._dataContext.GetConsumerDigitalDocumentListUploadedByDoc(this.pageNum, this.itemsPerPage)
      .subscribe(response => {
        if (response.DigitalDocuments.rows.length > 0) {
          this.healthrecordAvailableStatus = true;
          this.documentsBySelf = response.DigitalDocuments.rows;//this.documentsBySelf.concat(response.DigitalDocuments.rows);
          this.documentsBySelfList = this.documentsBySelf;
          this.documentsBySelf.filter(item => {
            item["currentMonth"] = moment(item.Date).format("MMM");
            item["currentDate"] = moment(item.Date).format("DD");
            item["currentYear"] = moment(item.Date).format("YYYY");
            item["DigitalDocumentsID"] = item.id;
            return item;
          });
       //   this.pageNum++;
          this.documentsBySelf = _.chain(this.documentsBySelf)
            .groupBy('CreatedDate')
            .map((value, key) => ({ TotalRecord: value, DocumentType: value[0].DocumentType, DocumentFor: value[0].DocumentFor, DocumentTypeName: value[0].DocumentTypeName, Relation: value[0].Relation, currentMonth: value[0].currentMonth, currentDate: value[0].currentDate, currentYear: value[0].currentYear, CountRecord: value.length,ReportType:value[0].ReportType,UploadedBy:value[0].UploadedBy }))
            .value();
        }
        else {
          this.healthrecordAvailableStatus = false;
          this.documentsBySelf = [];
          this.documentsBySelfList = [];
        }
        if (refresher) {
          refresher.complete();
        }
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUploadedHealthRecordByDoc"), this.documentsBySelfList);

      },
        error => {
          this.commonService.onMessageHandler("Failed to retrive. Please try again.", 0);
        });
  }
  //Get User Health records uploaded by doc/Lab
  RetriveConsumerDigitalDocumentsByDoctorByLab(value, refresher) {
    this._dataContext.GetConsumerDigitalDocumentListUploadedByDocByLab(this.pageNum, this.itemsPerPage)
      .subscribe(response => {
        if (response.DigitalDocuments.rows.length > 0) {
          this.healthrecordAvailableStatus = true;
          this.documentsBySelf = response.DigitalDocuments.rows;//this.documentsBySelf.concat(response.DigitalDocuments.rows);
          this.documentsBySelfList = this.documentsBySelf;
          this.documentsBySelf.filter(item => {
            item["currentMonth"] = moment(item.Date).format("MMM");
            item["currentDate"] = moment(item.Date).format("DD");
            item["currentYear"] = moment(item.Date).format("YYYY");
            item["DigitalDocumentsID"] = item.id;
            return item;
          });
       //   this.pageNum++;
          this.documentsBySelf = _.chain(this.documentsBySelf)
            .groupBy('CreatedDate')
            .map((value, key) => ({ TotalRecord: value, DocumentType: value[0].DocumentType, DocumentFor: value[0].DocumentFor, DocumentTypeName: value[0].DocumentTypeName, Relation: value[0].Relation, currentMonth: value[0].currentMonth, currentDate: value[0].currentDate, currentYear: value[0].currentYear, CountRecord: value.length,ReportType:value[0].ReportType,UploadedBy:value[0].UploadedBy }))
            .value();
        }
        else {
          this.healthrecordAvailableStatus = false;
          this.documentsBySelf = [];
          this.documentsBySelfList = [];
        }
        if (refresher) {
          refresher.complete();
        }
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUploadedHealthRecordByDoc"), this.documentsBySelfList);

      },
        error => {
          this.commonService.onMessageHandler("Failed to retrive. Please try again.", 0);
        });
  }
  presentPopover(myEvent, data, value) {
    let popover = this.popoverCtrl.create("PopoverPage", { record: data, section: value, status: false });
    popover.present({
      ev: myEvent
    });
    popover.onDidDismiss(item => {
      if (item) {
       // this.pageNum = 0;
       // this.documentsBySelf = [];
        if (this.upload == "byMe") {
          this.retriveConsumerDigitalDocuments(0, false);
        }
        else {
          this.retriveConsumerDigitalDocumentsByDoc(1, false);
        //  this.RetriveConsumerDigitalDocumentsByDoctorByLab(1, false);
          
        }
      }
    });
  }
  tabSelection(value) {
    this.documentsBySelf = [];
    this.pageNum = 0;
    if (value == 'user') {
      this.upload == "byMe";
      this.retriveConsumerDigitalDocuments(1, false);
    }
    else {
      this.upload == "byProv"
      this.retriveConsumerDigitalDocumentsByDoc(1, false);
      //this.RetriveConsumerDigitalDocumentsByDoctorByLab(1, false);
    }
  }
  //Get data while scrolling for paggination.
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.pagginationStatus = true;
      if (this.upload == "byMe") {
        this.retriveConsumerDigitalDocuments(0, false);
      }
      else {
        this.retriveConsumerDigitalDocumentsByDoc(0, false);
        //this.RetriveConsumerDigitalDocumentsByDoctorByLab(0, false);
      }
      infiniteScroll.complete();
    }, 500);
  }
  goToUpload() {
    this.navCtrl.push("AddNewRecord", { record: [], status: "user", action: "Add",isOpenFromPopover:false });
   
    // let addModal = this.modalCtrl.create("AddNewRecord", { record: [], status: "user", action: "Add",isOpenFromPopover:false });
    // addModal.onDidDismiss(item => {
    //   //this.documentsBySelf = [];
    //   if (item) {
    //    // this.pageNum = 0;
    //     this.retriveConsumerDigitalDocuments(1, false);
    //   }
    //   else {
    //     // this.getHealthRecordUploadedByUserFromCache();
    //     this.retriveConsumerDigitalDocuments(1, false);
    //   }
    // })
    // addModal.present();
  }
  selectedRecord(data) {
    let section = "";
    if (this.upload == "byMe") {
      section = "user";
    }
    else {
      section = "provider";
    }
    this.navCtrl.push("AddNewRecord", { record: data.TotalRecord, status: section, action: "Edit",isOpenFromPopover:false });
   
    // let addModal = this.modalCtrl.create("AddNewRecord", { record: data.TotalRecord, status: section, action: "Edit",isOpenFromPopover:false });
    // addModal.onDidDismiss(item => {
    //   //this.documentsBySelf = [];
    //  // if (item) {
    //   //  this.pageNum = 0;
    //   //}
    //   if (this.upload == "byMe") {
    //     this.retriveConsumerDigitalDocuments(1, false);
    //   }
    //   else {
    //     this.retriveConsumerDigitalDocumentsByDoc(1, false);
    //   }
    // })
    // addModal.present();
  }
  // filterPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(FilterPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

}







