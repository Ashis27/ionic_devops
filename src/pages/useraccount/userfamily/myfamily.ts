import { Component, ViewChild } from "@angular/core"
import { NavController, NavParams, ViewController, LoadingController, ToastController, PopoverController, App, AlertController, IonicPage, Slides } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { NgForm } from '@angular/forms';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { DatePickerDirective } from 'ion-datepicker'; // added by vinod
import { CommonServices } from "../../../providers/common.service";
import { DataContext } from "../../../providers/dataContext.service";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
//pages

@IonicPage()
@Component({
    selector: 'page-myfamily',
    templateUrl: 'myfamily.html',
})
export class MyFamily {

    sex: any =
        {
            "DisplayText": "Male",
            "Value": 100
        };
    @ViewChild(Slides) slides: Slides;
    @ViewChild('slider') slider: Slides;
    activeCountry: any = [];
    familyAvailableStatus: boolean = false;
    userFamilyStatus: string = 'edit';
    consumersFamilyList = [];
    genderList = [];
    relations = [];
    newFamilyMember = {
        Name: "",
        Contact: "",
        CountryCode: "",
        Relation: "",
        DisplayText: "",
        DateOfBirth: new Date().toISOString(),
        //DateOfBirth: moment().format("DD-MMM-YYYY"),
        Sex: 0,
        ConsumerID: 0
    }

    index : number;

    contact: string;
    //minDate: Date = new Date("1990-01-01");
    //maxDate: Date = new Date();
    maxDate: string = new Date().toISOString();
    countryCode: string;
    loginStatus: any = { status: false, name: "", data: [] };
   // reletionMap:Map<String,any> = new Map();
    constructor(public _dataContext: DataContext, private commonService: CommonServices, public appCtrl: App, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public http: Http, public popoverCtrl: PopoverController, public viewCtrl: ViewController, public loadingCtrl: LoadingController, public toastCtrl: ToastController) {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
            .then((result) => {
                if (result) {
                    this.getActiveCountryAndStateFromCache();
                    this.getGenderFromCache();
                    this.getFamilyList();
                    this.getRelationFromCache();

                }
                else {
                    this.navCtrl.setRoot("LoginPage");
                }
            });
    }
    //Initial entry point
    ionViewDidEnter() {
        this.getStyle(this.sex);
        this.commonService.onEntryPageEvent("Come to My Family");
        //this.datepicker.value = new Date(this.newFamilyMember.DateOfBirth);
    }

    //Get Gender List from cache, if not available then get from server.
    getGenderFromCache() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getGender"))
            .then((result) => {
                this.genderList = [];
                if (result && result.length > 0) {
                    result.forEach(element => {
                        if (String(element.DisplayText).toLowerCase() == 'male' || String(element.DisplayText).toLowerCase() == 'female') {
                            this.genderList.push(element);
                        }
                    });
                    this.newFamilyMember.Sex = this.genderList[1].Value;
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
                this.genderList = [];
                response.forEach(element => {
                    if (String(element.DisplayText).toLowerCase() == 'male' || String(element.DisplayText).toLowerCase() == 'female') {
                        this.genderList.push(element);
                    }
                });
                this.newFamilyMember.Sex = this.genderList[1].Value;
                this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getGender"), this.genderList);
            },
                error => {
                    console.log(error);
                    //loading.dismiss().catch(() => { });
                    this.commonService.onMessageHandler("Failed. Please try again.", 0);
                });
    }

    //Add new family member 
    addNewFamily(form: NgForm) {
        if (this.commonService.isValidateForm(form)) {
            this._dataContext.AddFamilyMember(this.newFamilyMember)
                .subscribe(response => {
                    if (response.Result == "OK") {
                        this.commonService.onEventSuccessOrFailure("Family member Added");
                        this.commonService.onMessageHandler(response.Message, 1);
                        this.userFamilyStatus = 'edit';
                        this.contact = "";
                        this.newFamilyMember = {
                            Name: "",
                            Contact: "",
                            CountryCode: this.countryCode,
                            Relation: this.newFamilyMember.Relation,
                            DisplayText: "",
                            DateOfBirth: new Date().toISOString(),
                            //DateOfBirth: moment().format("DD-MMM-YYYY"),
                            Sex: this.newFamilyMember.Sex,
                            ConsumerID: 0
                        }
                        this.getFamilyList();
                    }
                    else {
                        this.commonService.onMessageHandler(response.Message, 0);
                        this.userFamilyStatus = 'add';
                    }
                },
                    error => {
                        console.log(error);
                        //loading.dismiss().catch(() => { });
                        this.commonService.onMessageHandler("Failed. Please try again.", 0);
                        this.commonService.onEventSuccessOrFailure("Family member Add failed");
                    });
        }

    }
    onSelectedDate() {
        // this.datepicker.changed.subscribe((selectedDate) => {
        //     let pickerDate = moment(selectedDate).format("DD-MMM-YYYY");
        //     if (moment(pickerDate).isAfter(moment(new Date()).format("DD-MMM-YYYY"))) {
        //         return false;
        //     }
        //     // this.showSelectedDate = moment(selectedDate).format("DD-MMM-YYYY");
        //     this.newFamilyMember.DateOfBirth = moment(selectedDate).format('DD-MMM-YYYY');
        // });
        this.newFamilyMember.DateOfBirth = moment(this.newFamilyMember.DateOfBirth).format('DD-MMM-YYYY');
    }
    updateFamilyMember(form: NgForm) {
        if (this.commonService.isValidateForm(form)) {
            //this.newFamilyMember.Contact = this.countryCode + this.contact;
            this._dataContext.UpdateFamilyMember(this.newFamilyMember)
                .subscribe(response => {
                    if (response.Result == "OK") {
                        this.commonService.onMessageHandler(response.Message, 1);
                        this.userFamilyStatus = 'edit';
                        this.contact = "";
                        this.newFamilyMember = {
                            Name: "",
                            Contact: "",
                            CountryCode: this.countryCode,
                            Relation: this.newFamilyMember.Relation,
                            DisplayText: "",
                            DateOfBirth: new Date().toISOString(),
                            //DateOfBirth: moment().format("DD-MMM-YYYY"),
                            Sex: this.newFamilyMember.Sex,
                            ConsumerID: 0
                        }
                        this.getFamilyList();
                    }
                    else {
                        this.commonService.onMessageHandler(response.Message, 0);
                        this.userFamilyStatus = 'add';
                    }
                },
                    error => {
                        console.log(error);
                        //loading.dismiss().catch(() => { });
                        this.commonService.onMessageHandler("Failed. Please try again.", 0);
                    });
        }
    }
    addFamily() {
        this.userFamilyStatus = 'add';
        this.contact = "";
        this.newFamilyMember = {
            Name: "",
            Contact: "",
            CountryCode: this.countryCode,
            Relation: this.newFamilyMember.Relation,
            DisplayText: "",
            DateOfBirth: new Date().toISOString(),
            //DateOfBirth: moment().format("DD-MMM-YYYY"),
            Sex: this.newFamilyMember.Sex,
            ConsumerID: 0
        }
    }
    editFamilyDetails(data) {
        // this.countryCode = this.commonService.splitCountryCode(data.Contact);
        // this.contact = this.commonService.splitMobileNumber(data.Contact),
        this.userFamilyStatus = 'add';
        // let index = 0;
        // this.relations.forEach(res => {
        //     index++
        //     if (Number(res.Value) === Number(data.RelationValue)) {
        //         this.sliderInfo.slideTo(index);
        //     }
        // })
        this.newFamilyMember = {
            Name: data.Name,
            Contact: data.Contact,
            CountryCode: data.CountryCode,
            Relation: data.RelationValue,
            DisplayText: data.Relation,
            DateOfBirth: moment(data.DateOfBirth).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
            //DateOfBirth: moment(data.DateOfBirth).format("DD-MMM-YYYY"),
            Sex: data.Sex,
            ConsumerID: data.ConsumerId
        }
        //this.slides.slideTo(this.reletionMap.get(data.Relation));
       
        // setTimeout(() => {
        //     this.datepicker.value = new Date(this.newFamilyMember.DateOfBirth);
        // }, 1000);


    }
    //Get Gender List from cache, if not available then get from server.
    getRelationFromCache() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getRelation"))
            .then((result) => {
                if (result) {
                    this.relations = result;
                    // this.newFamilyMember.Relation = this.relations[this.relations.length - 1].Value;
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
                //this.reletionMap = new Map();
                this.relations = response;
                // for(let i = 0; i < response.length;i++){
                //     this.reletionMap.set(response[i].DisplayText,i);
                // }
                this.relations.push({});
                //this.newFamilyMember.Relation = this.relations[this.relations.length - 1].Value;
            },
                error => {
                    console.log(error);
                    this.commonService.onMessageHandler("Failed. Please try again.", 0);
                });
    }
    getFamilyList() {
        this._dataContext.GetFamilyList()
            .subscribe(response => {
                if (response.rows.length > 0) {
                    this.consumersFamilyList = response.rows;
                    for (var i = 0; i < response.rows.length; i++) {
                        for (var j = 0; j < response.rows.length; j++) {
                            if (this.consumersFamilyList[i].Sex == this.genderList[j].Value) {
                                this.consumersFamilyList[i]["SexDescription"] = this.genderList[j].DisplayText;
                                break;
                            }
                        }
                    }
                    this.familyAvailableStatus = false;
                }
                else {
                    this.familyAvailableStatus = true;
                }
            },
                error => {
                    //console.log(error);
                    // this.getFamilyList();
                    this.commonService.onMessageHandler("Failed to retrieve family details. Please try again.", 0);
                });
    }
    //Get active countries and states from cache, if not available then get from server.
    getActiveCountryAndStateFromCache() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveCountryAndState"))
            .then((result) => {
                if (result) {
                    this.newFamilyMember.CountryCode = result.countriesAvailable[0].DemographyCode;
                    this.activeCountry = result.countriesAvailable;
                    this.countryCode = this.newFamilyMember.CountryCode;
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
                    this.countryCode = this.newFamilyMember.CountryCode;
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
    closeFamily() {
        this.userFamilyStatus = 'edit';
    }
    closeCurrentPage() {
        this.commonService.closeCurrentPage();
    }
    //validate only number
    onlyNumber(event) {
        return this.commonService.validateOnlyNumber(event);
    }
    redirectToMenu(value, event) {
        // $(".footer-image-sec").removeClass("active-section").addClass("footer-back");
        // $(event.currentTarget).removeClass("footer-back").addClass("active-section");
        if (value == "DashBoard") {
            this.navCtrl.setRoot("DashBoard");
        }
    }

    getStyle(gender_sts) {
        this.sex = gender_sts
        this.newFamilyMember.Sex = gender_sts.Value;
    }


    relationButtion(value, index) {
        console.log(value);
        this.newFamilyMember.Relation = value;
    }

}
