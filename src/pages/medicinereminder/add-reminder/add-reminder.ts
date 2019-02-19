import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { AddremiderFormPage } from '../addremider-form/addremider-form'
import { CommonServices } from '../../../providers/common.service';
import { DataContext } from '../../../providers/dataContext.service';
import * as _ from "lodash";
/**
 * Generated class for the AddReminderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-reminder',
  templateUrl: 'add-reminder.html',
})
export class AddReminderPage {
  page: number = 0;
  medicinesearched: string;
  showMedicine: boolean = false;
  medicineList: any = [];
  searchTerm: string = '';
  mednotfound: boolean = false;
  backUpList = [];
  status:string="";
  constructor(public viewCtrl: ViewController,public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
  }

  ionViewDidEnter() {
    this.status = this.navParams.get('status');
    this.commonService.onEntryPageEvent("Search the reminder");
  }
  searchMedicine(ev: any) {
    this.medicineList = [];
    if (this.medicinesearched.length >= 2) {
      let query: any = {}
      query = this.commonService.getAllDrugListByKeyword();
      query.query.bool.must[0].match._all.query = this.medicinesearched;
      query.from = this.page;
      this._dataContext.GetMedications(query)
        .subscribe(response => {
          if (response.hits.total > 0) {
            let filterData = [];
            let searchedResult = response.hits.hits;
            searchedResult.filter(item => {
              if (item._id != "" && item._id != null && item._id != undefined) {
                filterData.push(item._source);
              }
            });
            this.medicineList = this.medicineList.concat(filterData);
            this.medicineList.filter(item => {
              item.Name = this.commonService.convert_case(item.Name);
            })
           // this.page = this.medicineList.length;
            this.mednotfound = false;
          }
          else {
            this.mednotfound = true;
            this.medicineList = [];
            this.page = 0;
          }
        });
    }
  }
  closeCurrentSection() {
    this.viewCtrl.dismiss(false);
  }
  selctedMedicine(selectedmedicine) {
    this.viewCtrl.dismiss(selectedmedicine.Name);
  //  this.navCtrl.push("AddremiderFormPage", { medicineName: selectedmedicine.Name ,pageFrom:"Search"});
  }

  // added by vinod
  UserCustomMedicine(){
    this.viewCtrl.dismiss(this.medicinesearched);
  }
  //added by vinod end

}
