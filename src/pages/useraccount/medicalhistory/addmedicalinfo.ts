import { Component, ViewChild } from '@angular/core';
import { IonicPage, ViewController, NavParams, AlertController } from 'ionic-angular';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";
import * as _ from "lodash";

@IonicPage()
@Component({
  selector: 'page-addmedicalinfo',
  templateUrl: 'addmedicalinfo.html',
})
export class AddMedicalInfo {
  @ViewChild('myinput') input;
  medicalInfo: string;
  medicalInfoStatus: number = 0;
  searchKeyword: string;
  medicalInfoList: any = [];
  addedMedicalnfo: any = [];
  savedMedicalnfo: any = [];
  backUpList: any = [];
  page: number = 0;
  searchedMedication: string;
  medicalInfoShowStatus: boolean = false;
  addedNewData: any = [];
  userMedicalHistory: any = {
    PatientAllergies: {
      GroupEntityId: 0,
      ProviderId: 0,
      Allergy: ""
    },
    PatientMedication: {
      GroupEntityId: 0,
      ProviderId: 0,
      MedicineName: ""
    },
    ChronicDisease: {
      GroupEntityId: 0,
      ProviderId: 0,
      ChronicDiseaseName: ""
    }
  };

  constructor(public alertCtrl: AlertController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController) {
    this.medicalInfo = this.navParams.get('medicalInfo');
    this.medicalInfoStatus = this.navParams.get('medicalInfoStatus');
    this.addedMedicalnfo = this.navParams.get('medicalInfoList');
    this.savedMedicalnfo = this.addedMedicalnfo;
  }
  ionViewWillEnter() {
    // setTimeout(() => {
    //  this.input.setFocus();
    // }, 150);
    if (this.medicalInfoStatus == 0) {
      this.getAllergies();
    }
    else if (this.medicalInfoStatus == 1) {
      // this.getAllDiases();
    }
    else if (this.medicalInfoStatus == 2) {
      // this.getAllMedications();
    }
    else {

    }
  }
  getAllergies() {
    this._dataContext.GetAllergies()
      .subscribe(response => {
        if (response) {
          this.medicalInfoList = response;//this.medicalInfoList.concat(response);
          this.page = this.medicalInfoList.length;
          this.backUpList = this.medicalInfoList;
        }
        else {
          this.medicalInfoList = [];
          this.medicalInfoShowStatus = true;
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to retrieve allergies. Please try again.", 0);
        });
  }
  getAllMedications() {
    if (this.searchKeyword.length >= 2) {
      let query: any = {}
      query = this.commonService.getAllDrugListByKeyword();
      query.query.bool.must[0].match._all.query = this.searchKeyword;
      query.from = this.page;
      this._dataContext.GetMedications(query)
        .subscribe(response => {
          if (response.hits.hits.length > 0) {
            let filterData = [];
            let searchedResult = response.hits.hits;
            searchedResult.filter(item => {
              if (item._id != "" && item._id != null && item._id != undefined) {
                filterData.push(item._source);
              }
            });
            this.medicalInfoList = filterData;//this.medicalInfoList.concat(filterData);
            this.medicalInfoList = _.chain(this.medicalInfoList)
              .groupBy('Name')
              .map((value, key) => ({ Value: key, DisplayText: value[0].Name, DrugType: value[0].DrugType, Strength: value[0].Strength }))
              .value();
           // this.page = this.medicalInfoList.length;
            this.backUpList = this.medicalInfoList;
          }
          else {
            this.medicalInfoList = [];
            this.medicalInfoShowStatus = true;
          }
        },
          error => {
            console.log(error);
            this.commonService.onMessageHandler("Failed to retrieve medications. Please try again.", 0);
          });
    }
  }
  getAllDiases() {
    if (this.searchKeyword.length >= 2) {
      let query: any = {}
      query = this.commonService.getAllDiasesListByKeyword();
      query.query.bool.must[0].match._all.query = this.searchKeyword;
      query.from = this.page;
      this._dataContext.GetDiases(query)
        .subscribe(response => {
          if (response.hits.hits.length > 0) {
            let filterData = [];
            let searchedResult = response.hits.hits;
            searchedResult.filter(item => {
              if (item._id != "" && item._id != null && item._id != undefined) {
                filterData.push(item._source);
              }
            });
            this.medicalInfoList = filterData;//this.medicalInfoList.concat(filterData);
            this.medicalInfoList = _.chain(this.medicalInfoList)
              .groupBy('DiseasesICDCode')
              .map((value, key) => ({ Value: value[0].DiseasesICDCode, DisplayText: value[0].DiseasesICDDescription, DiseasesICDCode: value[0].DiseasesICDCode }))
              .value();
            //this.page = this.medicalInfoList.length;
            this.backUpList = this.medicalInfoList;
          }
          else {
            this.medicalInfoList = [];
            this.medicalInfoShowStatus = true;
          }

        },
          error => {
            console.log(error);
            this.commonService.onMessageHandler("Failed to retrieve medications. Please try again.", 0);
          });
    }

  }
  searchMedicalInfo(event) {
    let term = this.searchKeyword;
    if (term && term.trim() != '') {
      this.medicalInfoList = this.backUpList.filter((item) => {
        return (item.DisplayText.toLowerCase().indexOf(term.toLowerCase()) > -1);
      })
      if (this.medicalInfoList.length == 0) {
        this.medicalInfoShowStatus = true;
      }
      else {
        this.medicalInfoShowStatus = false;
      }
    }
    else {
      this.medicalInfoShowStatus = true;
      this.medicalInfoList = this.backUpList;
    }
  }
  addMedicalInfo(data) {
    let status = false;
    if (this.addedMedicalnfo.length > 0) {
      this.addedMedicalnfo.filter(item => {
        if (data.DisplayText == item.DisplayText) {
          status = true;
        }
      })
    }
    else {
      status = false;
    }
    if (!status) {
      this.addedMedicalnfo.push(data);
      this.addedNewData.push(data);
    }

  }
  customAlergyAddedByUser(){
    let customAllergy={
      DisplayText:this.searchKeyword
    }
    this.addedMedicalnfo.push(customAllergy);
    this.addedNewData.push(customAllergy);
  }
  deleteMedicalInfo(value, i, data) {
    let alert = this.alertCtrl.create({
      title: "Delete",
      message: 'Do you want to Delete ?',
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
            if (this.addedNewData.length > 0) {
              this.addedNewData.filter(item => {
                if (data.DisplayText == item.DisplayText) {
                  let index = this.addedNewData.indexOf(item);
                  this.addedNewData.splice(index, 1);
                }
              })
            }
            var removedValue = value.splice(i, 1);
          }
        }
      ]
    });
    alert.present();
  }
  //Close modal
  closeModal() {
    this.addedMedicalnfo=[];
    this.viewCtrl.dismiss(false);
    // this.addInfo();
  }
  //Checking new item is added or not
  // isNewItemAdded() {
  //   if (this.addedNewData.length > 0) {
  //     this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserAddedMedicalStatus"), true)
  //   }
  //   else {
  //     this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserAddedMedicalStatus"), false)
  //   }
  // }
  getAllAddedInformation() {
    let addedItem: string = "";
    this.addedMedicalnfo.filter(item => {
      addedItem += item.DisplayText + ";";
    })
    return addedItem.substring(0, addedItem.length - 1);
  }
  //Save user medical information.
  saveMedicalInfo() {
    if (this.medicalInfoStatus == 0) {
      this.userMedicalHistory.PatientAllergies.GroupEntityId = this.commonService.getGroupEntityId();
      this.userMedicalHistory.PatientAllergies.ProviderId = 0;
      this.userMedicalHistory.PatientAllergies.Allergy = this.getAllAddedInformation();
      this.saveAllergies();
    }
    else if (this.medicalInfoStatus == 2) {
      this.userMedicalHistory.PatientMedication.GroupEntityId = this.commonService.getGroupEntityId();
      this.userMedicalHistory.PatientMedication.ProviderId = 0;
      this.userMedicalHistory.PatientMedication.MedicineName = this.getAllAddedInformation();
      this.saveMedicines();
    }
    else {
      this.userMedicalHistory.ChronicDisease.GroupEntityId = this.commonService.getGroupEntityId();
      this.userMedicalHistory.ChronicDisease.ProviderId = 0;
      this.userMedicalHistory.ChronicDisease.ChronicDiseaseName = this.getAllAddedInformation();
      this.saveDisease();
    }
  }
  saveAllergies() {
    this._dataContext.SavePatientAllergies(this.userMedicalHistory.PatientAllergies)
      .subscribe(response => {
        if (response.Status) {
          this.commonService.onMessageHandler(response.Message, 1);
          this.viewCtrl.dismiss(this.userMedicalHistory.PatientAllergies);
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0)
        }

      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
  saveMedicines() {
    this._dataContext.SavePatientMedication(this.userMedicalHistory.PatientMedication)
      .subscribe(response => {
        if (response.Status) {
          this.commonService.onMessageHandler(response.Message, 1);
          this.viewCtrl.dismiss(this.userMedicalHistory.PatientMedication);
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0)
        }

      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
  saveDisease() {
    this._dataContext.SavePatientChronicDisease(this.userMedicalHistory.ChronicDisease)
      .subscribe(response => {
        if (response.Status) {
          this.commonService.onMessageHandler(response.Message, 1);
          this.viewCtrl.dismiss(this.userMedicalHistory.ChronicDisease);
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0)
        }

      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
}
