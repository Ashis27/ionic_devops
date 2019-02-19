import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController, ModalController} from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';
/**
 * Generated class for the SmokingriskPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-smokingrisk',
  templateUrl: 'smokingrisk.html',
})
export class SmokingriskPage {
  NoOfCigarettes:number;
  Gender:any="male";
  startSmokingDate:any="";
  endSmokingDate:any="";
  result:any ="";
  diff_days:any;
  maxDate:any;
  minDate:any;
  AllFieldsFil:boolean=false;
  max:number=100;
  current:number = 0;
  status:string="#45ccce";
  smiley_src:string="";
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController,public commonService:CommonServices) {
    //this.maxDate = moment(new Date()).format('YYYY-MM-DD');
    //this.minDate = moment(this.startSmokingDate,'DD-MMM-YYYY').add(1,"days");
    this.maxDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SmokingriskPage');
  }

  chooseMInDate(){
    //this.minDate = moment(this.startSmokingDate).add(1, 'days').format();
  }

  calculate(){
    //this.searchParams.StartDateAndTime = moment().format();
    

    if(this.NoOfCigarettes > 0  && this.startSmokingDate!="" ){
        
        if(this.endSmokingDate === ""){
          this.endSmokingDate = moment(new Date());
        }
        let now = moment(this.startSmokingDate); //todays date
        let end = moment(this.endSmokingDate); // DOB date
        let duration = moment.duration(end.diff(now));
        this.diff_days = duration.asDays();
        console.log(typeof this.diff_days);
        if(this.diff_days < 0){
          this.presentToast('End date should not be bigger than Start date');
          return false;
        }
        console.log(this.diff_days); 
        let Days_As_Mins = this.diff_days * this.NoOfCigarettes * 12;
        //let  tot_mins = 28983;
        let days = Math.floor(Days_As_Mins / 1440);
        let hours = Math.floor((Days_As_Mins % 1440)/60);
        let mins = Math.floor(Days_As_Mins % 60);
        this.result = days+"Days "+hours+"Hours "+ mins+"Mins";
        this.AllFieldsFil=true; 
        this.smiley_src = "assets/imgs/calculator/sad.png";
        this.current = 100;
        this.status = "#ff0000";
        
   }else{
      this.AllFieldsFil = false;
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
  CheckAllFil(){
    if(this.NoOfCigarettes !=0  && (this.startSmokingDate!=0 || this.startSmokingDate!="")){
      //this.AllFieldsFil = true;
      console.log("still not undefined");
    }else{
      this.AllFieldsFil = false;
      this.result='';
      this.current=0;
      this.status = "#fff";
    }
  }
  bookAppointment(){
    this.navCtrl.push("BookAppointment");
  }
  RestrictDecimels(event) {
    return this.commonService.ValidateDecimels(event);
  }

}

