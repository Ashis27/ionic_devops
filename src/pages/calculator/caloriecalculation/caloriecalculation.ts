import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from '../../../providers/common.service';

/**
 * Generated class for the CaloriecalculationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-caloriecalculation',
  templateUrl: 'caloriecalculation.html',
})
export class CaloriecalculationPage {
  foots = [1,2,3,4,5,6,7,8];
  inches = [0,1,2,3,4,5,6,7,8,9,10,11];
  obj = new CalorieCalculation();
  res:any = "";
  AllFiledsFil:boolean=false;
  max:number=100;
  current:number = 0;
  status:string="#45ccce";
  smiley_src:string=""
  userProfile: any = []; //added by vinod
  genderList: any = []; //added by vinod
  loggedInUser: any = { loginStatus: false, userName: "", contact: "", email: "", userDetails: [] }; //added by vinod
   constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController, public _dataContext: DataContext, private commonService: CommonServices) {
     //this.calculate();
     this.getUserProfile(); //by vinod
   }

    //Retrieving User Profile getUserProfileDetails
  getUserProfile() {
    this._dataContext.GetLoggedOnUserProfile(0)
      .subscribe(response => {
        if (response.Result == "OK") {
          this.userProfile = response.data;
          console.log(this.userProfile);
          this.obj.age = this.userProfile.Age;
          this.obj.sex = this.userProfile.SexDescription.toLowerCase();
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


   calculate(){
     if(this.obj.selectedInch >= 0 && this.obj.selectedInch < 11 && this.obj.selectedFoot > 0 && this.obj.weight > 0 && this.obj.age > 0){
      this.smiley_src = "assets/imgs/calculator/happy.png";
      this.current = 100;
      this.status = "#45ccce";
      this.AllFiledsFil = true;
      let c = this.obj.selectedInch;
      let height = ((this.obj.selectedFoot * 12) + Number(c));
      let heightInMeter = height * 2.54;
   //CreatClear = Sex * ((140 - Age) / (SerumCreat)) * (Weight / 72)
   let num = 0;
   if(this.obj.sex == 'male'){
     this.res = (10 * this.obj.weight) + (6.25 * heightInMeter) - (5* this.obj.age + 5);
     this.res = Math.round(this.res)
     console.log(Math.round(this.res));
   }else{
    this.res = (10 * this.obj.weight) + (6.25 * heightInMeter) - (5 * this.obj.age - 161);
    this.res = Math.round(this.res)
   }
   //this.res = num * ((140 - this.obj.age)/this.obj.Serum) * (this.obj.weight/72);
     }else{
      this.AllFiledsFil = false;
      this.presentToast('Enter valid  details');
     }
     
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CaloriecalculationPage');
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

  RestrictDecimels(event) {
    return this.commonService.ValidateDecimels(event);
  }
 

  getStyle(gender_sts){
    this.obj.sex = gender_sts;
    if(this.obj.selectedInch != undefined && this.obj.selectedInch != undefined && this.obj.selectedFoot != undefined && this.obj.weight != undefined && this.obj.age != undefined){
      this.calculate();
    }else{
      this.current = 0;
      this.res = '';
      this.AllFiledsFil = false;
    }
  }
  CheckAllFil(){
    if(this.obj.selectedInch != 0 && this.obj.selectedInch != 0 && this.obj.selectedFoot != 0 && this.obj.weight != 0 && this.obj.age != 0){
      //this.AllFieldsFil = true;
      console.log("still not undefined");
    }else{
      this.AllFiledsFil = false;
      this.res='';
      this.current=0;
      this.status = "#fff";
    }
  }
}
class CalorieCalculation{
  sex:any = 'male';
  weight:number;
  age:number;
  selectedFoot:number ;
  selectedInch:number;
}