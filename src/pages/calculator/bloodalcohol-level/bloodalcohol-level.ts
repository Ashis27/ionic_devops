import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from '../../../providers/common.service';
/**
 * Generated class for the BloodalcoholLevelPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bloodalcohol-level',
  templateUrl: 'bloodalcohol-level.html',
})
export class BloodalcoholLevelPage {
  sex:any = 'male';
  alcohol:number;
  weight:number;
  result:any = "";
  AllFieldsFil:boolean=false;
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad BloodalcoholLevelPage');
  }

  //Retrieving User Profile getUserProfileDetails
  getUserProfile() {
    this._dataContext.GetLoggedOnUserProfile(0)
      .subscribe(response => {
        if (response.Result == "OK") {
          this.userProfile = response.data;
          console.log(this.userProfile);
          //this.obj.age = this.userProfile.Age;
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

  calculate(){
    if(this.sex != "" && this.alcohol > 0 && this.weight >0){
      let r = 0;
    if(this.sex  == 'male'){
      r = 0.68;
    }else{
      r = 0.55 
    }

    this.AllFieldsFil = true;
    let gms = Number(this.weight) * 100;
    this.result =(this.alcohol / (gms * r))*100;
    this.result = this.result.toFixed(2);
      if(this.result > 0.00 && this.result <= 0.03){
        this.current=100;
        this.status="#45ccce";
        this.smiley_src = "assets/imgs/calculator/happy.png";
      }else{
        this.current=100;
        this.status="#ff0000";
        this.smiley_src = "assets/imgs/calculator/sad.png";
      }
    }else{
      this.AllFieldsFil = false;
      this.presentToast('Enter valid details');
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
    if(this.sex != undefined && this.alcohol != undefined && this.weight != undefined){
      this.calculate();
    }else{
      this.current = 0;
      this.result = 0;
      this.AllFieldsFil = false;
    }
  }

  RestrictDecimels(event) {
    return this.commonService.ValidateDecimels(event);
  }
  
  CheckAllFil(){ 
    if(this.sex != 0 && this.alcohol != 0 && this.weight != 0){
     // this.allFieldsFil = true;
    }else{
      this.current = 0;
      this.AllFieldsFil = false;
      this.status= "#fff";
    }
  }
}
