import { Component } from "@angular/core"
import { NavController, NavParams, ViewController, AlertController, LoadingController, ToastController, PopoverController, App, IonicPage } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";
import { NgForm } from "@angular/forms";
//pages

@IonicPage()
@Component({
    selector: 'page-addnewmember',
    templateUrl: 'addnewmember.html',
})
export class AddNewMember {
    relations = [];
    newFamilyMember = {
        Name: "",
        Contact: "",
        CountryCode: "",
        Relation: "",
        DisplayText: "",
        DateOfBirth: new Date().toISOString(),
        Sex: 0,
        ConsumerID: 0
    }
    countryCode: string;
    genderList: any = [];
    contact: string;
    activeCountry: any = [];
    constructor(public viewCtrl: ViewController, public _dataContext: DataContext, private commonService: CommonServices, public alertCtrl: AlertController, public appCtrl: App, public navCtrl: NavController, public navParams: NavParams) {
        let contact = this.navParams.get('contact');
        this.newFamilyMember.CountryCode = this.commonService.splitCountryCode(contact);
        if (contact.length > 10) {
            this.newFamilyMember.Contact = this.commonService.splitMobileNumber(contact);
        }
        else {
            this.newFamilyMember.Contact = "";
        }
        // this.newFamilyMember.CountryCode = contact != null ? this.commonService.splitCountryCode(contact) : this.countryCode;
        //this.newFamilyMember.Contact = contact != null ? this.commonService.splitMobileNumber(contact) : this.newFamilyMember.Contact;

    }
    ionViewDidEnter() {
        this.getActiveCountryAndStateFromCache();
        this.getRelationFromCache();
        this.getGenderFromCache();
    }
    //Get Gender List from cache, if not available then get from server.
    getGenderFromCache() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getGender"))
            .then((result) => {
                if (result) {
                    this.genderList = result;
                    this.newFamilyMember.Sex = this.genderList[1].Value;
                }

            });
    }
    //Get Gender List from cache, if not available then get from server.
    getRelationFromCache() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getRelation"))
            .then((result) => {
                if (result) {
                    this.relations = result;
                    this.newFamilyMember.Relation = this.relations[this.relations.length - 1].Value;
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
                this.relations = response;
                this.newFamilyMember.Relation = this.relations[this.relations.length - 1].Value;
            },
                error => {
                    console.log(error);
                    this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
                });
    }
    //Get active countries and states from cache, if not available then get from server.
    getActiveCountryAndStateFromCache() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveCountryAndState"))
            .then((result) => {
                if (result) {
                    this.countryCode = result.countriesAvailable[0].DemographyCode;
                    this.newFamilyMember.CountryCode = result.countriesAvailable[0].DemographyCode;
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
                    this.newFamilyMember.CountryCode = response.Data.countriesAvailable[0].DemographyCode;
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

    closeCurrentSection() {
        let memberObj = {
            status: false
        }
        this.viewCtrl.dismiss(memberObj);
    }
    //validate only number
    onlyNumber(event) {
        return this.commonService.validateOnlyNumber(event);
    }
    //Add new family member
    addNewMember(form: NgForm) {
        if (this.commonService.isValidateForm(form)) {
            //this.newFamilyMember.Contact = this.countryCode + this.contact;
            this._dataContext.AddFamilyMember(this.newFamilyMember)
                .subscribe(response => {
                    if (response.Result == "OK") {
                        let memberObj = {
                            status: true,
                            data: this.newFamilyMember.Contact
                        }
                        this.contact = "";
                        this.newFamilyMember = {
                            Name: "",
                            Contact: "",
                            CountryCode: this.countryCode,
                            Relation: this.newFamilyMember.Relation,
                            DisplayText: "",
                            DateOfBirth: new Date().toISOString(),
                            Sex: this.newFamilyMember.Sex,
                            ConsumerID: 0
                        }

                        this.viewCtrl.dismiss(memberObj);
                    }
                },
                    error => {
                        console.log(error);
                        //loading.dismiss().catch(() => { });
                        this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
                    });
        }
    }
}
