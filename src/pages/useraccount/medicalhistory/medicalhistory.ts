import { Component, ViewChild } from '@angular/core';
import { IonicPage, ViewController, ModalController, NavController, AlertController } from 'ionic-angular';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";
import * as _ from "lodash";

@IonicPage()
@Component({
  selector: 'page-medicalhistory',
  templateUrl: 'medicalhistory.html',
})
export class MedicalHistory {
  @ViewChild('myinput') input;
  allergies: any = [];
  medications: any = [];
  chronicDisease: any = [];
  userMedicalHistory: any = [];
  constructor(public alertCtrl: AlertController, public navCtrl: NavController, private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController) {

  }
  ionViewWillEnter() {
    // this.getMedicalHistoryFromCache();
    this.getUserMedicalHistory(1);
  }
  // getMedicalHistoryFromCache() {
  //   this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserMedicalStatus"))
  //     .then((response) => {
  //       if (response) {
  //         this.userMedicalHistory = response.Result;
  //         if (response.Result.ChronicDisease != null) {
  //           let chronicDisease = this.userMedicalHistory.ChronicDisease.ChronicDiseaseName.split(";");
  //           chronicDisease.filter(item => {
  //             if (item != " ") {
  //               this.chronicDisease.push({ DisplayText: item, Value: item });
  //             }
  //           })
  //         }
  //         else {
  //           this.chronicDisease = [];
  //         }
  //         if (response.Result.PatientAllergies != null) {
  //           let allergies = this.userMedicalHistory.PatientAllergies.Allergy.split(";");
  //           allergies.filter(item => {
  //             if (item != " ") {
  //               this.allergies.push({ DisplayText: item, Value: item });
  //             }
  //           })
  //         }
  //         else {
  //           this.allergies = [];
  //         }
  //         if (response.Result.PatientMedication != null) {
  //           let medications = this.userMedicalHistory.PatientMedication.MedicineName.split(";");
  //           medications.filter(item => {
  //             if (item != " ") {
  //               this.medications.push({ DisplayText: item, Value: item });
  //             }
  //           })

  //         }
  //         else {
  //           this.medications = [];
  //         }
  //         // this.getUserMedicalHistory(0);
  //       }
  //       else {
  //         this.userMedicalHistory = [];
  //         this.allergies = [];
  //         this.medications = [];
  //         this.chronicDisease = [];
  //         // this.getUserMedicalHistory(1);
  //       }
  //     });
  // }
  //Get user Medical history
  getUserMedicalHistory(value) {
    this._dataContext.GetUserMedicalHistory(value)
      .subscribe(response => {
        this.userMedicalHistory = response.Result;
        if (response.Result.ChronicDisease != null) {
          this.chronicDisease = [];
          let chronicDisease = this.userMedicalHistory.ChronicDisease.ChronicDiseaseName.split(";");
          chronicDisease.filter(item => {
            if (item != " ") {
              this.chronicDisease.push({ DisplayText: item, Value: item });
            }
          })
        }
        else {
          this.chronicDisease = [];
        }
        if (response.Result.PatientAllergies != null) {
          this.allergies = [];
          let allergies = this.userMedicalHistory.PatientAllergies.Allergy.split(";");
          allergies.filter(item => {
            if (item != " ") {
              this.allergies.push({ DisplayText: item, Value: item });
            }
          })
        }
        else {
          this.allergies = [];
        }
        if (response.Result.PatientMedication != null) {
          this.medications = [];
          let medications = this.userMedicalHistory.PatientMedication.MedicineName.split(";");
          medications.filter(item => {
            if (item != "") {
              this.medications.push({ DisplayText: item, Value: item });
            }
          })

        }
        else {
          this.medications = [];
        }
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getChronicDisease"), this.chronicDisease);
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getAllergies"), this.allergies);
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getMedications"), this.medications);
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to retrieve. Please try again.", 0);
        });
  }
  //Show all Allergies 
  openAllergies() {
    let addModal = this.modalCtrl.create("AddMedicalInfo", { medicalInfo: "Allergy", medicalInfoStatus: 0, medicalInfoList: this.allergies });
    addModal.onDidDismiss(item => {
      if (item) {
        //this.allergies = item;
        this.getUserMedicalHistory(1);
      }
      else {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getAllergies"))
          .then((response) => {
            if(response){
              this.allergies = response;
            }
            else{
              this.allergies = [];
            }
          });
      }
    })
    addModal.present();
  }
  openMedication() {
    let addModal = this.modalCtrl.create("AddMedicalInfo", { medicalInfo: "Medicine", medicalInfoStatus: 2, medicalInfoList: this.medications });
    addModal.onDidDismiss(item => {
      if (item) {
        //  this.medications = item;
        this.getUserMedicalHistory(1);
      }
      else {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getMedications"))
          .then((response) => {
            if(response){
              this.medications = response;
            }
            else{
              this.medications = [];
            }
          });
      }
    })
    addModal.present();
  }
  openDisease() {
    let addModal = this.modalCtrl.create("AddMedicalInfo", { medicalInfo: "Chronic Disease", medicalInfoStatus: 1, medicalInfoList: this.chronicDisease });
    addModal.onDidDismiss(item => {
      if (item) {
        //   this.chronicDisease = item;
        this.getUserMedicalHistory(1);
      }
      else {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getChronicDisease"))
          .then((response) => {
            if(response){
              this.chronicDisease = response;
            }
            else{
              this.chronicDisease = [];
            }
          });
      }
    })
    addModal.present();
  }
  //Update user EHR History
  updateUserMedicalHistory() {
    if (this.userMedicalHistory.length > 0) {
      this.commonService.onMessageHandler("Successfully saved", 1);
    }
    // this._dataContext.SavaEHRHistory("")
    //   .subscribe(response => {
    //     this.commonService.onMessageHandler(response.Message, 1);
    //     this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserAddedMedicalStatus"), false)
    //   },
    //     error => {
    //       console.log(error);
    //       //loading.dismiss().catch(() => { });
    //       this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
    //     });

  }
  redirectToMenu(value, event) {
    // $(".footer-image-sec").removeClass("active-section").addClass("footer-back");
    // $(event.currentTarget).removeClass("footer-back").addClass("active-section");
    if (value == "DashBoard") {
      this.navCtrl.setRoot("DashBoard");
    }
  }
  // ionViewDidLeave() {
  //   this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserAddedMedicalStatus"))
  //     .then((result) => {
  //       if (result) {
  //         let alert = this.alertCtrl.create({
  //           title:"Save",
  //           message: 'Do you want save your new added medical history?',
  //           buttons: [
  //             {
  //               text: 'LATER',
  //               role: 'No',
  //               handler: () => {
  //                 //this.viewCtrl.dismiss();
  //               }
  //             },
  //             {
  //               text: 'SAVE',
  //               handler: () => {
  //                 this.updateUserMedicalHistory();
  //               }
  //             }
  //           ]
  //         });
  //         alert.present();
  //       }
  //     });
  // }

}
