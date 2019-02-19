import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from '../../../providers/common.service';
/**
 * Generated class for the BodyfatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bodyfat',
  templateUrl: 'bodyfat.html',
})
export class BodyfatPage {
  sex:any = "male";
  selectedFoot:number;
  selectedInches:number;
  age:number ;
  weight:number;
  result:any = 0;
  allFieldsFil:boolean=false;
  foots = [1,2,3,4,5,6,7,8];
  inches = [0,1,2,3,4,5,6,7,8,9,10,11];
  max:number=40;
  current:number = 0;
  status:string="#45ccce";
  smiley_src:string="";
  userProfile: any = []; //added by vinod
  genderList: any = []; //added by vinod
  loggedInUser: any = { loginStatus: false, userName: "", contact: "", email: "", userDetails: [] }; //added by vinod
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController, public _dataContext: DataContext, private commonService: CommonServices) {
    //this.getResult();
    this.getUserProfile(); //by vinod
  }

  //Retrieving User Profile getUserProfileDetails
  getUserProfile() {
    this._dataContext.GetLoggedOnUserProfile(0)
      .subscribe(response => {
        if (response.Result == "OK") {
          this.userProfile = response.data;
          console.log(this.userProfile);
          this.age = this.userProfile.Age;
          this.sex = this.userProfile.SexDescription.toLowerCase();
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
    console.log('ionViewDidLoad BodyfatPage');
  }
calculate(){
  this.getResult();
}
getResult(){
  if(this.selectedFoot >0 && this.selectedInches >= 0 && this.age > 0 && this.weight > 0){
    this.allFieldsFil = true;
    let heightFootInmeter = this.selectedFoot/3.2808;
    let heightInchInmeter = this.selectedInches/39.370;
    let totalHeightInMeter =  heightFootInmeter + heightInchInmeter;
    let bmi = this.weight/(totalHeightInMeter * totalHeightInMeter);
    if(this.sex == 'male'){
      if(this.age > 17){
        //1.20 × BMI + 0.23 × Age - 5.4
        this.result = (1.20 * bmi) + ((0.23 * this.age) -5.4);
        console.log(this.result);
        this.result =  Math.floor(this.result);
        this.CheckMaleStatus();
      }else{
        //1.51 × BMI - 0.70 × Age - 2.2
        this.result = (1.51 * bmi) - ((0.70 * this.age) -2.2);
        console.log(this.result);
        this.result =  Math.floor(this.result);
        this.CheckMaleStatus();
      }  
    }else{
      if(this.age > 17){
        //BFP = 1.20 × BMI + 0.23 × Age - 16.2
        this.result = (1.20 * bmi) + ((0.23 * this.age) - 16.2);
        console.log(this.result);
        this.result =  Math.floor(this.result);
        this.CheckFemaleStatus();
      }else{
        //1.51 × BMI - 0.70 × Age + 1.4
        this.result = (1.51 * bmi) - ((0.70 * this.age)+ 1.4);
        console.log(this.result);
        this.result =  Math.floor(this.result);
        this.CheckFemaleStatus();
      }
      
    }
   
  }else{
    this.allFieldsFil = false;
    this.presentToast('Enter valid details');
  }
}
CheckMaleStatus(){
  if(this.result >= '2' && this.result <= '17'){
    this.status = "#45ccce";
    this.current=100;
    this.smiley_src = "assets/imgs/calculator/happy.png"
  }
  else if(this.result > '17' && this.result <= '24'){
    this.status = "#F8BC34";
    this.current=100;
    this.smiley_src = "assets/imgs/calculator/happy.png"
  }
 else if(this.result > '24'){
   this.status = "#ff0000";
   this.current=100;
   this.smiley_src = "assets/imgs/calculator/sad.png"
  }
}
CheckFemaleStatus(){
  if(this.result >= '10' && this.result <= '24'){
    this.status = "#45ccce"; //normal
    this.current=100;
    this.smiley_src = "assets/imgs/calculator/happy.png"
  }
  else if(this.result > '24' && this.result <= '31'){
    this.status = "#F8BC34"; //warning
    this.current=100;
    this.smiley_src = "assets/imgs/calculator/happy.png"
  }
 else if(this.result > '31'){
   this.status = "#ff0000"; //danger
   this.current=100;
   this.smiley_src = "assets/imgs/calculator/sad.png"
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

  getStyle(gender_sts){
    this.sex = gender_sts;
    if(this.selectedFoot !=undefined && this.selectedInches != undefined && this.age != undefined && this.weight != undefined){
      this.getResult();
    }else{
      this.current = 0;
      this.result = 0;
      this.allFieldsFil = false;
    }
  }

  CheckAllFil(){
    if(this.selectedFoot !=0 && this.selectedInches != 0 && this.age != 0 && this.weight != 0){
     // this.allFieldsFil = true;
    }else{
      this.current = 0;
      this.allFieldsFil = false;
      this.status= "#fff";
    }
  }
  RestrictDecimels(event) {
    return this.commonService.ValidateDecimels(event);
  }

}
