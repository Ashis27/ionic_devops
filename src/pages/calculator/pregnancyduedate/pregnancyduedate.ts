import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import moment from 'moment';
import { ToastController } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
/**
 * Generated class for the PregnancyduedatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pregnancyduedate',
  templateUrl: 'pregnancyduedate.html',
})
export class PregnancyduedatePage {
  peroid:any = "";
  result:any = "";
  AllFiledsFil:boolean=false;
  max:number=100;
  current:number = 0;
  status:string="#45ccce";
  smiley_src:string=""
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController,public commonService:CommonServices) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PregnancyduedatePage');
    this.smiley_src = "assets/imgs/calculator/happy.png"
    this.status = "#45ccce";
  }
 calculate(){
  if(this.peroid != ""){
    this.current = 100;
    this.AllFiledsFil = true;
    this.result = moment(this.peroid).add(280, 'days').format("DD-MMM-YYYY");
  }else {
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
