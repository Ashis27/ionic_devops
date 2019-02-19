import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController} from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
import moment from 'moment';

/**
 * Generated class for the HeartbeatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-heartbeat',
  templateUrl: 'heartbeat.html',
})
export class HeartbeatPage {
  dob:any = "";
  result:any = "";
  AllFiledsFil:boolean=false;
  max:number=100;
  current:number = 0;
  status:string="#45ccce";
  smiley_src:string="";
  maxDate:any;
  minDate:any;
  
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController,public commonService:CommonServices) {
    this.maxDate = moment().format("YYYY-MM-DD");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HeartbeatPage');
  }

  calculate(){
    if(this.dob != ""){
      this.smiley_src = "assets/imgs/calculator/happy.png";
      this.current = 100;
      this.status = "#45ccce";
      this.AllFiledsFil = true;
      let now = moment(new Date()); //todays date
      let end = moment(this.dob); // DOB date
      let duration = moment.duration(now.diff(end));
      let minutes = duration.asMinutes();
      this.result = Number(Math.round(minutes)) * Number(72);
    }
    else {
      this.AllFiledsFil = false;
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

}
