import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';
/**
 * Generated class for the OvulationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ovulation',
  templateUrl: 'ovulation.html',
})
export class OvulationPage {
  periodDays:number;
  periodDate:any="";
  result:any ="";
  menstrual_period:any;
  most_fertile:any;
  AllFieldsFil:boolean=false;
  max:number=100;
  current:number = 0;
  status:string="#45ccce";
  smiley_src:string="";
  constructor(public navCtrl: NavController, public navParams: NavParams, public toastController:ToastController,public commonService:CommonServices) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OvulationPage');
  }
  calculate(){
    if(this.periodDays > 0  && this.periodDate!=""){
        this.AllFieldsFil=true; 
        this.smiley_src = "assets/imgs/calculator/happy.png"
        this.current = 100;
        this.status = "#45ccce";
        this.menstrual_period = moment(this.periodDate).add(this.periodDays, 'days').format("DD-MMM-YYYY");
        this.most_fertile = moment(this.menstrual_period).subtract(12, 'days').format("DD-MMM-YYYY");
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
  bookAppointment(){
    this.navCtrl.push("BookAppointment");
  }
  CheckAllFil(){
    if(this.periodDays !=0  && (this.periodDate!=0 || this.periodDate!="")){
      //this.AllFieldsFil = true;
    }else{
      this.AllFieldsFil = false;
      this.result='';
      this.current=0;
      this.status = "#fff";
    }
  }

}




