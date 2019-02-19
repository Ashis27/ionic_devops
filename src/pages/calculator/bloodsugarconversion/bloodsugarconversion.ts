import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ToastController } from 'ionic-angular';
import { BloodSugarConerversion } from '../../../model/Calculator';
import { CommonServices } from '../../../providers/common.service';
/**
 * Generated class for the BloodsularconversionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bloodsugarconversion',
  templateUrl: 'bloodsugarconversion.html',
})
export class BloodsugarconversionPage {
bloodSugarConerversion = new BloodSugarConerversion();
result:any = "";
allFieldsFil:boolean=false;
smiley_src:string="";
max:number = 40;
current:number = 0;
status:string="#45ccce";
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController,public commonService:CommonServices) {
    this.bloodSugarConerversion.type = "mg/dl";
    this.bloodSugarConerversion.classification = "fasting";
    //this.calculate();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BloodsularconversionPage');
  }
  calculate(){
   if(this.bloodSugarConerversion.type != "" && this.bloodSugarConerversion.classification != "" && this.bloodSugarConerversion.eAg > 0){
    this.allFieldsFil = true;
    this.result = this.bloodSugarConerversion.calculate( this.bloodSugarConerversion.type,this.bloodSugarConerversion.classification,this.bloodSugarConerversion.eAg);
    //Low,Prediabetes,Diabetes,Normal
    if(this.result === "Low"){
      this.smiley_src = "assets/imgs/calculator/sad.png";
      this.current = 100;
      this.status = "#ff0000";
    }else if(this.result === "Normal"){
      this.smiley_src = "assets/imgs/calculator/happy.png";
      this.current = 100;
      this.status = "#45ccce";
    }
    else if(this.result === "Prediabetes" || this.result === "Diabetes"){
      this.current = 100;
      this.smiley_src = "assets/imgs/calculator/sad.png";
      this.status = "#ff0000";
    }
   }else{
    this.allFieldsFil = false;
    this.presentToast('Please provide all the details');
   }
  }
  make(val2){
    this.bloodSugarConerversion.type = val2;
    
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
    if(this.bloodSugarConerversion.type != "" && this.bloodSugarConerversion.classification != "" && this.bloodSugarConerversion.eAg != 0){
      this.current = 0;
      this.allFieldsFil = false;
    }else{
      this.current = 0;
      this.allFieldsFil = true;
      this.status= "#fff";
    }
  }
  RestrictDecimels(event) {
    return this.commonService.ValidateDecimels(event);
  }
}

