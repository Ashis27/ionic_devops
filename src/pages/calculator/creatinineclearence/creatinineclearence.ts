import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from '../../../providers/common.service';

/**
 * Generated class for the CreatinineclearencePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-creatinineclearence',
  templateUrl: 'creatinineclearence.html',
})
export class CreatinineclearencePage {
 obj = new CreatinineClearence();
 res:any = ""
 foots = [1,2,3,4,5,6,7,8];
  inches = [0,1,2,3,4,5,6,7,8,9,10,11];
  AllFiledsFil:boolean=false;
  max:number=100;
  current:number = 0;
  status:string="#45ccce";
  smiley_src:string="";
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
    if(this.obj.age > 0 && this.obj.Serum > 0 && this.obj.weight >0 ) {
      let num = 0;
      this.AllFiledsFil = true;
  if(this.obj.sex == 'male'){
    num = 1;
    this.res = num * ((140 - this.obj.age)/this.obj.Serum) * (this.obj.weight/72);
    this.res = Math.round(this.res);
    console.log(this.res);
    if(this.res >= "97" && this.res <= "137"){
      this.current = 100;
      this.status ="#45ccce";  //normal
      this.smiley_src = "assets/imgs/calculator/happy.png"
    }else{
      this.current = 100;
      this.status ="#ff0000"; // danger
      this.smiley_src = "assets/imgs/calculator/sad.png"
    }
  }else{
    num = 0.85;
    this.res = num * ((140 - this.obj.age)/this.obj.Serum) * (this.obj.weight/72);
    this.res = Math.round(this.res);
    console.log(this.res);
    if(this.res >= "88" && this.res <= "128"){
      this.current = 100;
      this.status ="#45ccce";  //normal
      this.smiley_src = "assets/imgs/calculator/happy.png"
    }else{
      this.current = 100; 
      this.status ="#ff0000"; // danger
      this.smiley_src = "assets/imgs/calculator/sad.png"
    }
  }
  
    }else{
      this.AllFiledsFil = false;
      this.presentToast('Enter valid  details');
    }
  //CreatClear = Sex * ((140 - Age) / (SerumCreat)) * (Weight / 72)
  
 }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CreatinineclearencePage');
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
    this.obj.sex = gender_sts;
    if(this.obj.age != undefined && this.obj.Serum != undefined && this.obj.weight !=undefined){
      this.calculate();
    }else{
      this.current = 0;
      this.res = '';
      this.AllFiledsFil = false;
    }
  }

  RestrictDecimels(event) {
    return this.commonService.ValidateDecimels(event);
  }
  
  CheckAllFil(){
    if(this.obj.age != 0 && this.obj.Serum != 0 && this.obj.weight !=0 ){
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
class CreatinineClearence{
  sex:any = 'male';
  weight:number ;
  age:number ;
  Serum:number ; 
  inch:number
}