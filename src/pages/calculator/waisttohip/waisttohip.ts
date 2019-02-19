import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ToastController } from 'ionic-angular';
import { WaistToHip } from '../../../model/Calculator';
import { CommonServices } from '../../../providers/common.service';
/**
 * Generated class for the WaisttohipPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-waisttohip',
  templateUrl: 'waisttohip.html',
})
export class WaisttohipPage {
  waistToHip = new WaistToHip();
  result:any = "";
  AllFieldsFil:boolean=false;
  max:number=100;
  current:number = 0;
  status:string="#45ccce";
  smiley_src:string="";
  gender:string="male";
  waist:number;
  hip:number ;
  res_sts:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController,public commonService:CommonServices) {
   //this.calculate();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WaisttohipPage');
  }
  calculate(){
    let num1 = Number(this.waistToHip.waist);
    let num2 = Number(this.waistToHip.hip);
   if( this.waistToHip.gender != "" && this.waistToHip.waist != 0 && this.waistToHip.hip != 0 && num1 > 0 && num2 > 0 ){
    this.AllFieldsFil = true;
    this.result = this.calculateWaistToHip(this.waistToHip.gender,this.waistToHip.waist,this.waistToHip.hip);
    console.log(this.result);
    if(this.result === "Moderate Risk"){
      this.smiley_src = "assets/imgs/calculator/sad.png"
      this.current = 100;
      this.status = "#ff0000";
    }else if(this.result === "Normal"){
      this.smiley_src = "assets/imgs/calculator/happy.png"
      this.current = 100;
      this.status = "#45ccce";
    }
    else if(this.result === "High Risk"){
      this.current = 100;
      this.smiley_src = "assets/imgs/calculator/sad.png"
      this.status = "#ff0000";
    }
   }else{
    this.AllFieldsFil = false;;
    this.presentToast('Enter valid  details');
   }
  }


  presentToast(msg) {
    // let toast = this.toastController.create({
    //   message: msg,
    //   duration: 5000,
    //   position: 'top'
    // });
    // toast.present();]
    this.commonService.onMessageHandler(msg,0);
  }
  bookAppointment(){
    this.navCtrl.push("BookAppointment");
  }
  // getStyle(gender_sts){
  //   this.waistToHip.gender = gender_sts;
  //   this.calculate();
  // }
  getStyle(gender_sts){
    this.waistToHip.gender = gender_sts;
    if(this.waistToHip.waist != undefined && this.waistToHip.hip != undefined){
      this.calculate();
    }else{
      this.current = 0;
      this.result = 0;
      this.AllFieldsFil = false;
    }
  }
  CheckAllFil(){
    if(this.waistToHip.waist != 0 && this.waistToHip.hip != 0){
      //this.AllFieldsFil = true;
      console.log("still not undefined");
    }else{
      this.AllFieldsFil = false;
      this.result=0;
      this.current=0;
      this.status = "#fff";
    }
  }

  RestrictDecimels(event) {
    return this.commonService.ValidateDecimels(event);
  }

  calculateWaistToHip(gender,waist,hip){
    let ratio = waist/hip;
    this.res_sts = ratio.toFixed(1);
    console.log(this.res_sts);
    switch(gender){
      case 'male':{
        if(ratio <= 0.95){
          return 'Normal';
        }else if(ratio <= 1.0){
          return 'Moderate Risk';
        }else{
          return 'High Risk';
        }
      }
      case 'female':{
        if(ratio <= 0.80){
          return 'Normal';
        }else if(ratio <= 0.84){
          return 'Moderate Risk';
        }else{
          return 'High Risk';
        }
      }
    }
  
  }
}
