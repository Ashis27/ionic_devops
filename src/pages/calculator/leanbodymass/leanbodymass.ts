import { Component, OnInit, OnChanges } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from '../../../providers/common.service';

/**
 * Generated class for the LeanbodymassPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-leanbodymass',
  templateUrl: 'leanbodymass.html',
})
export class LeanbodymassPage implements OnInit  {
feets = [1,2,3,4,5,6,7,8];
inches = [0,1,2,3,4,5,6,7,8,9,10,11];
 obj = new LeanBodyMass();
 res:any ="";
 AllFieldsFil:boolean=false;
 max:number=100;
 current:number = 0;
 status:string="#45ccce";
 smiley_src:string="";
 userProfile: any = []; //added by vinod
 genderList: any = []; //added by vinod
 loggedInUser: any = { loginStatus: false, userName: "", contact: "", email: "", userDetails: [] }; //added by vinod
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController,public _dataContext: DataContext, private commonService: CommonServices) {
    this.getUserProfile(); //by vinod
  }

  //Retrieving User Profile getUserProfileDetails
  getUserProfile() {
    this._dataContext.GetLoggedOnUserProfile(0)
      .subscribe(response => {
        if (response.Result == "OK") {
          this.userProfile = response.data;
          console.log(this.userProfile);
          ///this.obj.age = this.userProfile.Age;
          this.obj.gender = this.userProfile.SexDescription.toLowerCase();
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
  if(this.obj.heightInInch >= 0 && this.obj.heightInInch <= 11 && this.obj.heightInFoot > 0 && this.obj.weight > 0 ){
      this.AllFieldsFil=true;
      console.log(`${this.AllFieldsFil}:${this.obj.heightInInch}:${this.obj.heightInFoot} : ${this.obj.weight} : ${this.obj.gender}`);
      let height = (Number(this.obj.heightInFoot * 12) + Number(this.obj.heightInInch));
      let heightCM = height * 2.54;
      heightCM = Math.round(heightCM);
  if(this.obj.gender == 'male'){
    //this.res =  0.407*this.obj.weight + 0.267*heightCM - 19.2;
    // changed by vinod
    //let height_weight = Math.sqrt(this.obj.weight/heightCM);
    let leanmass =  Math.round((1.1 * this.obj.weight) - (128) * Math.pow(this.obj.weight/heightCM,2));
    let leanmass_per = Math.round((leanmass/this.obj.weight) * 100);
    let fatmass = this.obj.weight-leanmass;
    this.res = 100-leanmass_per;
    console.log(typeof this.res);

     if((this.res >= '2' && this.res <= '5')){
      this.smiley_src = "assets/imgs/calculator/happy.png"
      this.current = 100;
      this.status = "#45ccce";
    }
    else if(this.res >= '6' && this.res <= '13'){
      this.current = 100;
      this.smiley_src = "assets/imgs/calculator/happy.png"
      this.status = "#45ccce";
    }
    else if(this.res >= '14' && this.res <= '17'){
      this.current = 100;
      this.smiley_src = "assets/imgs/calculator/happy.png"
      this.status = "#45ccce";
    }
    else if(this.res >= '18' && this.res <= '24'){
      this.current = 100;
      this.smiley_src = "assets/imgs/calculator/happy.png"
      this.status = "#45ccce";
    }
    else if(this.res >= "25"){
      this.current = 100;
      this.smiley_src = "assets/imgs/calculator/sad.png"
      this.status = "#ff0000";
    }
  }else{
    // this.res =  0.252*this.obj.weight +0.473*heightCM - 48.3;
    // this.res = this.res.toFixed(2);
    let leanmass =  Math.round((1.07 * this.obj.weight) - (148) * Math.pow(this.obj.weight/heightCM,2));
    let leanmass_per = Math.round((leanmass/this.obj.weight) * 100);
    let fatmass = this.obj.weight-leanmass;
    this.res = 100-leanmass_per;
    console.log(this.res);

    if((this.res >= '10' && this.res <= '13')){
      this.smiley_src = "assets/imgs/calculator/happy.png"
      this.current = 100;
      this.status = "#45ccce";
    }
    else if(this.res >= '14' && this.res <= '20'){
      this.current = 100;
      this.smiley_src = "assets/imgs/calculator/happy.png"
      this.status = "#45ccce";
    }
    else if(this.res >= '21' && this.res <= '24'){
      this.current = 100;
      this.smiley_src = "assets/imgs/calculator/happy.png"
      this.status = "#45ccce";
    }
    else if(this.res >= '25' && this.res <= '31'){
      this.current = 100;
      this.smiley_src = "assets/imgs/calculator/happy.png"
      this.status = "#45ccce";
    }
    else if(this.res >= "32"){
      this.current = 100;
      this.smiley_src = "assets/imgs/calculator/sad.png"
      this.status = "#ff0000";
    }
     
  }
    }else{
      this.AllFieldsFil=false;
      this.presentToast('Enter valid  details');
    }
//   For males:
// eLBM = 0.407×weight(kg) + 0.267×height(cm) - 19.2
// For females:
// eLBM = 0.252×weight(kg) + 0.473×height(cm) - 48.3

  
 }
  ngOnInit(){
    //this.calculate();
  }
  
  ionViewDidLoad() {
    this.smiley_src = "assets/imgs/calculator/happy.png"
    console.log('ionViewDidLoad LeanbodymassPage');
  }
   presentToast(msg) {
  //   let toast = this.toastController.create({
  //     message: msg,
  //     duration: 5000,
  //     position: 'top'
  //   });
  //   toast.present();
  this.commonService.onMessageHandler(msg,0);
  }
  bookAppointment(){
    this.navCtrl.push("BookAppointment");
  }

  RestrictDecimels(event) {
    return this.commonService.ValidateDecimels(event);
  }
  
  getStyle(gender_sts){
    this.obj.gender  = gender_sts;
    if(this.obj.heightInInch != undefined && this.obj.heightInInch !=undefined && this.obj.heightInFoot != undefined && this.obj.weight != undefined ){
      this.calculate();
    }else{
      this.current = 0;
      this.res = '';
      this.AllFieldsFil = false;
    }
  }
  CheckAllFil(){
    this.current=0;
    this.status = "#fff";
    if(this.obj.heightInInch != 0 && this.obj.heightInInch !=0 && this.obj.heightInFoot != 0 && this.obj.weight != 0){
      //this.AllFieldsFil = true;
      console.log("still not undefined");
    }else{
      this.AllFieldsFil = false;
      this.res='';
      this.current=0;
      this.status = "#fff";
    }
  }
}
class LeanBodyMass{
  heightInFoot:number ;
  heightInInch:number ;
  weight:number ;
  age:number ;
  gender:string = 'male'

}