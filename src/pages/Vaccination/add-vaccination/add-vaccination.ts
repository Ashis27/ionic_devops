import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Events } from 'ionic-angular';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";
import { NgForm } from "@angular/forms";
import * as $ from 'jquery';
import moment from 'moment';
/**
 * Generated class for the AddVaccinationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-vaccination',
  templateUrl: 'add-vaccination.html',
})
export class AddVaccinationPage {
  relations = [];
  genders: any = [];
  activeCountry: any = [];
  activeState: any = [];
  maxDate:any;
  countryCode: string;
  genderList: any = [];
  contact: string;
  back_status:number;
  childDets = {
      Name: "",
      Contact: "",
      CountryCode: "",
      Relation: "",
      DisplayText: "",
      DateOfBirth: new Date().toISOString(),
      Sex: 0,
      ConsumerID: 0
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, public _toastCtrl: ToastController, private commonService: CommonServices,
    public events: Events) {
    this.back_status =  this.navParams.get("status");
  }

  ionViewDidEnter() {
    this.getActiveCountryAndStateFromCache();
    this.getRelationFromCache();
    this.getGenderFromCache();
    this.getUserContactFromCache();
}
  ionViewDidLoad() {
    console.log('ionViewDidLoad AddVaccinationPage');
    //this.maxDate = "2049-12-31";
    this.maxDate = moment().format("YYYY-MM-DD");
  }
 
  //Get Gender List from cache, if not available then get from server.
  getGenderFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getGender"))
      .then((result) => {
        if (result.length > 0) {
          this.genderList = result;
          this.childDets.Sex = this.genderList[1].Value;
          console.log(this.childDets.Sex);
          this.getGenderList(0);
        }
        else {
          this.getGenderList(1);
        }
      });
  }
  //Get gender based on network status.
  getGenderList(value) {
    this._dataContext.GetGenderList(value)
      .subscribe(response => {
        this.genderList = response;
        this.childDets.Sex = this.genderList[1].Value;
        console.log(this.childDets.Sex);
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getGender"), this.genders);
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed.Please try again.", 0);
        });
  }

// getting user contact from cache
  getUserContactFromCache(){
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
      .then((result) => {
        if (result) {
          console.log(result);
          let contact = result.contact;
          this.childDets.CountryCode = this.commonService.splitCountryCode(contact);
            if (contact.length > 10) {
                this.childDets.Contact = this.commonService.splitMobileNumber(contact);
            }
            else {
                this.childDets.Contact = "";
            }
        }
        else {
          //this.getUserContact(1);
        }
      });
  }
  
// getting user contact from api
  getUserContact(value) {
    this._dataContext.GetLoggedOnUserProfile(value)
        .subscribe(response => {
            // this.relations = response;
            // this.childDets.Relation = this.relations[this.relations.length - 1].Value;
        },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
}

  //Get Gender List from cache, if not available then get from server.
  getRelationFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getRelation"))
        .then((result) => {
            if (result) {
               // this.relations = result;
               let temp_relations:any=[];
                 temp_relations = result;
                this.relations = temp_relations.filter((relation)=>relation.Value==122 || relation.Value==123 || relation.Value==132);
                console.log(this.relations);
                this.childDets.Relation = this.relations[this.relations.length - 1].Value;
                this.getRelationList(0);
            }
            else {
                this.getRelationList(1);
            }
        });
 }
//Get Relationship List
getRelationList(value) {
    this._dataContext.GetRelation(value)
        .subscribe(response => {
           //this.relations = response;
           let temp_relations:any=[];
           temp_relations = response;
           this.relations = temp_relations.filter((relation)=>relation.Value==122 || relation.Value==123 || relation.Value==132);
            console.log(this.relations);
          this.childDets.Relation = this.relations[this.relations.length - 1].Value;
          console.log(this.childDets.Relation);
        },
        error => {
            console.log(error);
            this.commonService.onMessageHandler("Failed.Please try again.", 0);
        });
}

   //Get active countries and states from cache, if not available then get from server.
   getActiveCountryAndStateFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveCountryAndState"))
        .then((result) => {
            if (result) {
                this.countryCode = result.countriesAvailable[0].DemographyCode;
                this.childDets.CountryCode = result.countriesAvailable[0].DemographyCode;
                this.activeCountry = result.countriesAvailable;
                this.getActiveCountriesAndStates(0);
            }
            else {
                this.getActiveCountriesAndStates(1);
            }
        });
}
//Get Active Countries and States based on network status.
getActiveCountriesAndStates(value) {
    this._dataContext.GetActiveCountryAndState(value)
        .subscribe(response => {
            if (response.Result == "Success") {
                this.activeCountry = response.Data.countriesAvailable;
                this.childDets.CountryCode = response.Data.countriesAvailable[0].DemographyCode;
                this.countryCode = response.Data.countriesAvailable[0].DemographyCode;
                this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveCountryAndState"), response.Data);
            }
            else {
                this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
            }
        },
            error => {
                console.log(error);
                //loading.dismiss().catch(() => { });
                this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
            });
}
  addChildDets(){
    let temp1 = moment(moment(new Date())).format("DD-MMM-YYYY");
    let temp2 = moment(this.childDets.DateOfBirth).format("DD-MMM-YYYY");
     let a = moment(temp1,"DD-MMM-YYYY");
     let b = moment(temp2,"DD-MMM-YYYY");
     let duration = a.diff(b,'years');
    
    //this.navCtrl.push("VaccineStatusPage");
    this.childDets.DateOfBirth = this.childDets.DateOfBirth.toString();
    console.log(this.childDets);
    //this.onMessageHandler("Password doesn't match", 0);
    if(this.childDets.Name == "" || this.childDets.Name == undefined){
      this.commonService.onMessageHandler("Please enter valid name", 0);
    }
    else if(this.childDets.Relation == "" || this.childDets.Relation == undefined){
      this.commonService.onMessageHandler("Please choose relation", 0);
    }
    else if(this.childDets.DateOfBirth == "" || this.childDets.DateOfBirth == undefined){
      this.commonService.onMessageHandler("Please choose date of birth", 0);
    }
    else if(this.childDets.Sex == undefined || this.childDets.Sex == 0){
      this.commonService.onMessageHandler("Please choose gender", 0);
    }else if(duration > 5){
      this.commonService.onMessageHandler("Please add a baby less than 5 years", 0);
    }
    else{
      this._dataContext.AddFamilyMember(this.childDets)
          .subscribe(response => {
              if (response.Result == "OK") {
                  let memberObj = {
                      status: true,
                      data: this.childDets.Contact
                  }
                  this.contact = "";
                  this.childDets = {
                      Name: "",
                      Contact: "",
                      CountryCode: this.countryCode,
                      Relation: this.childDets.Relation,
                      DisplayText: "",
                      DateOfBirth: new Date().toISOString(),
                      Sex: this.childDets.Sex,
                      ConsumerID: 0
                  }
                  this.commonService.onMessageHandler("Child details added succesfully",1);
                  this.navCtrl.push("VaccineStatusPage");
              }
          },
          error => {
            console.log(error);
            this.commonService.onMessageHandler("Failed.Please try again.", 0);
          });
    }
    
  }
  
  onlyNumber(event) {
    return this.commonService.validateOnlyNumber(event);
  }
  getStyle(gender_sts){
      this.childDets.Sex = gender_sts;
  }
  
  closeCurrentSection(){
    if(this.back_status === 1){
      this.navCtrl.setRoot("DashBoard");
    }else{
      this.navCtrl.pop();
    }
  }

  // goto dashboard
  gotoDashboard(){
    this.navCtrl.setRoot("DashBoard");
  }

}

//http://kare4u-lb-bpms-ind-prod2-consume-2031991078.us-east-1.elb.amazonaws.com:8120/api/Kare4uRCWidget/GetChildren?






//Add new family member
// addNewMember(form: NgForm) {
//   if (this.commonService.isValidateForm(form)) {
//       this._dataContext.AddFamilyMember(this.newFamilyMember)
//           .subscribe(response => {
//               if (response.Result == "OK") {
//                   let memberObj = {
//                       status: true,
//                       data: this.newFamilyMember.Contact
//                   }
//                   this.contact = "";
//                   this.newFamilyMember = {
//                       Name: "",
//                       Contact: "",
//                       CountryCode: this.countryCode,
//                       Relation: this.newFamilyMember.Relation,
//                       DisplayText: "",
//                       DateOfBirth: new Date().toISOString(),
//                       Sex: this.newFamilyMember.Sex,
//                       ConsumerID: 0
//                   }

//                   this.viewCtrl.dismiss(memberObj);
//               }
//           },
//               error => {
//                   console.log(error);
//                   this.commonService.onMessageHandler("Failed.Please try again.", 0);
//               });
//   }
// }
