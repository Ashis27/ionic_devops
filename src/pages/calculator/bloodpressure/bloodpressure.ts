import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ToastController } from 'ionic-angular';
import { BloodPressure, Case } from '../../../model/Calculator';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from '../../../providers/common.service';
import { CalculatorList } from '../calculatorlist';
/**
 * Generated class for the BloodpressurePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bloodpressure',
  templateUrl: 'bloodpressure.html',
})
export class BloodpressurePage {
bloodPressure = new BloodPressure();
result:any = "";
case:Case;
show:boolean = false;
allFieldsFil:boolean=false;
max:number = 40;
current:number = 0;
status:string="#45ccce";
smiley_src:string='';
userProfile: any = []; //added by vinod
genderList: any = []; //added by vinod
loggedInUser: any = { loginStatus: false, userName: "", contact: "", email: "", userDetails: [] }; //added by vinod
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController, public _dataContext: DataContext, private commonService: CommonServices) {
   // this.calculateBloodPressure();
   this.getUserProfile(); //by vinod
  }

  //Retrieving User Profile getUserProfileDetails
  getUserProfile() {
    this._dataContext.GetLoggedOnUserProfile(0)
      .subscribe(response => {
        if (response.Result == "OK") {
          this.userProfile = response.data;
          console.log(this.userProfile);
          this.bloodPressure.age = this.userProfile.Age;
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), this.loggedInUser);
          //this.loggedInUser = { loginStatus: true, userName: response.data.FirstName, email: response.data.UserLogin, contact: response.data.CountryCode + response.data.Contact, userDetails: [] };              
        }
        else {
          this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
            .then((result) => {
              if (result) {
                this.loggedInUser = result;
                console.log(this.loggedInUser);
                // let now = moment(new Date()); //todays date
                // let end = moment(this.userProfile.DateOfBirth); // another date
                // let duration = moment.duration(now.diff(end));
                // let years = duration.asYears();
                // console.log(years);
              }
             
            });
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          //this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BloodpressurePage');
  }
  calculateBloodPressure(){
   if( this.bloodPressure.age !=0 && this.bloodPressure.systolic > 0   && this.bloodPressure.dystolic > 0 ){
    this.allFieldsFil = true;
    this.result =  this.bloodPressure.calulateBloodPressure(this.bloodPressure.age,this.bloodPressure.systolic,this.bloodPressure.dystolic);
  //   case1 = "Hypotension(low blood pressure)",
  //   case2 = "Normal",
  // case3 = "Elevated",
  // case4 = "Hypertension (Stage1)",
  // case5 = "Hypertension (Stage2)"
      if(this.result === "Hypotension(low blood pressure)"){
        this.smiley_src = "assets/imgs/calculator/sad.png"
        this.current = 100;
        this.status = "#ff0000";
      }else if(this.result === "Normal"){
        this.smiley_src = "assets/imgs/calculator/happy.png";
        this.current = 100;
        this.status = "#45ccce";
      }else if(this.result === "Elevated"){
        this.current = 100;
        this.smiley_src = "assets/imgs/calculator/sad.png";
        this.status = "#F8BC34";
      }
      else if(this.result === "Hypertension (Stage1)" || this.result === "Hypertension (Stage2)"){
        this.current = 100;
        this.smiley_src = "assets/imgs/calculator/sad.png";
        this.status = "#ff0000";
      }
   }else{
    this.allFieldsFil = false;
    this.presentToast('Enter valid  details');
   }

  }
  presentToast(msg) {
    // let toast = this.toastController.create({
    //   message: msg,
    //   duration: 5000,
    //   position: 'top'
    // });
    // toast.present();
    this.commonService.onMessageHandler(msg,0);
  }
  bookAppointment(){
    this.navCtrl.push("BookAppointment");
  }

  CheckAllFil(){
    if(this.bloodPressure.age !>=0 && this.bloodPressure.systolic !> 0 && this.bloodPressure.dystolic !>0){
      this.current = 0;
      this.allFieldsFil = false;
    }else{
      this.current = 0;
      //this.allFieldsFil = true;
      //this.status= "#fff";
    }
  }

  RestrictDecimels(event) {
    return this.commonService.ValidateDecimels(event);
  }
}
