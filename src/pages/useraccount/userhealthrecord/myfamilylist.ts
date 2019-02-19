import { Component } from "@angular/core"
import { NavController, NavParams, ViewController, LoadingController, ModalController, ToastController, PopoverController, App, IonicPage } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";


//pages

@IonicPage()
@Component({
    selector: 'page-myfamilylist',
    templateUrl: 'myfamilylist.html'
})
export class MyFamilyList {

    tapOption = [];
    groupEntityId: string;
    parentGroupEntityId: string;
    optionObj: number = 0;
    uploadedDocuments = [];
    notificationStatus: boolean = true;
    userId: string;
    healthRecordStatus: string;
    healthrecordAvailableStatus: boolean = false;
    documentsFor = [];
    userName:string;
    color_list = [
        // "3px solid #4cb2ff",
        // "3px solid #4cf7ff",
        // "3px solid #4cff73",
        // "3px solid #c2ff4c",
        // "3px solid #e3ff4c",
        // "3px solid #ffe94c",
        // "3px solid #ffaf4c",
        // "3px solid #4c83ff",
        // "3px solid #ff6d4c",
        // "3px solid #4c6aff",
        // "3px solid #db4cff",
        // "3px solid #ff4cd0",
        // "3px solid #4cb2ff",
        // "3px solid #4cf7ff",
        // "3px solid #4cff73",
        // "3px solid #c2ff4c",
        // "3px solid #e3ff4c",
        // "3px solid #ffe94c",
        // "3px solid #ffaf4c",
        // "3px solid #4c83ff",
        // "3px solid #ff6d4c",
        // "3px solid #4c6aff",
        // "3px solid #db4cff",
        // "3px solid #ff4cd0",
    ];
    constructor(public commonService: CommonServices, public _dataContext: DataContext, public appCtrl: App, public navCtrl: NavController, public navParams: NavParams, public http: Http, public popoverCtrl: PopoverController, public viewCtrl: ViewController, public loadingCtrl: LoadingController, public toastCtrl: ToastController, public modalCtrl: ModalController) {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
            .then((result) => {
                if (result) {
                    this.userId = result.ConsumerID;
                    this.userName=result.FirstName;
                    this.getFamilyList();
                }
                else {
                    this.getUserProfile(0);
                }
            });
    }
    //Get LoggedIn user details
    getUserProfile(value) {
        this._dataContext.GetLoggedOnUserProfile(value)
            .subscribe(response => {
                if (response.Result == "OK") {
                    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), { loginStatus: true, userName: response.data.FirstName, contact: response.data.Contact, email: response.data.UserLogin, userDetails: [], consumerId: response.data.ConsumerID });
                    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserInfo"), response.data);
                }
                this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
                    .then((result) => {
                        let loggedInUser: any = [];
                        if (result) {
                            loggedInUser = result;
                        }
                        loggedInUser.loginStatus = false;
                        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), loggedInUser);
                        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserInfo"), null);
                        this.navCtrl.setRoot("LoginPage");
                    });
            },
                error => {
                    console.log(error);
                    //loading.dismiss().catch(() => { });
                    this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
                });
    }
    //Get Family list
    getFamilyList() {
        this._dataContext.GetFamilyListForDropDown()
            .subscribe(response => {
                if (response.length > 0) {
                    this.documentsFor = response;
                    this.documentsFor.filter((item) => { item.DisplayText = item.DisplayText.substr(0, item.DisplayText.indexOf('(')); })
                }
                this.documentsFor.push({ DisplayText: this.userName, Value: this.userId, Relation: "Self", RelationId: 0 });
                this.documentsFor.reverse();
            },
                error => {
                    console.log(error);
                    this.commonService.onMessageHandler("Failed to retrieve family details. Please try again.", 0);
                });
    }
    retriveDigitalDocuments(item) {
        this.navCtrl.push("MyHealthRecord", { "userDetails": item });
    }
    redirectToMenu(value, event) {
        if (value == "DashBoard") {
          this.navCtrl.setRoot("DashBoard");
        }
      }
}
