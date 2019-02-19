import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ToastController } from 'ionic-angular';
import { Dailywater } from '../../../model/Calculator';
import { CommonServices } from '../../../providers/common.service';
/**
 * Generated class for the DailywaterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-dailywater',
  templateUrl: 'dailywater.html',
})
export class DailywaterPage {
  dailywater = new Dailywater();
  result:any = 0;
  AllFieldsFil:boolean=false;
  max:number=100;
  current:number = 0;
  status:string="#45ccce";
  smiley_src:string="";
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController,public commonService:CommonServices) {
    //this.calculate();
  }

  ionViewDidLoad() {
    this.smiley_src = "assets/imgs/calculator/happy.png"
    console.log('ionViewDidLoad DailywaterPage');
  }
  calculate(){
   if(this.dailywater.weight > 0){
    this.status = "#45ccce";
     this.current = 100;
     this.AllFieldsFil = true;
    this.result = this.dailywater.calculatedailywater(this.dailywater.weight);
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
    if(this.dailywater.weight !=0){
      //this.AllFieldsFil = true;
    }else{
      this.AllFieldsFil = false;
      this.result='';
      this.current=0;
      this.status = "#fff";
    }
  }
  RestrictDecimels(event) {
    return this.commonService.ValidateDecimels(event);
  }
}
