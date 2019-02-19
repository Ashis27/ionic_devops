import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ToastController } from 'ionic-angular';
import { BMICalculator } from '../../../model/Calculator';
import { CommonServices } from '../../../providers/common.service';
/**
 * Generated class for the BmicalculatorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bmicalculator',
  templateUrl: 'bmicalculator.html',
})
export class BmicalculatorPage {
calculate = new BMICalculator()
feets = [1,2,3,4,5,6,7,8];
inches = [0,1,2,3,4,5,6,7,8,9,10,11];
result:any = 0;
max:number=40;
current:number = 0;
status:string="#45ccce";
enteredAll:boolean=false;
gender:string='male';
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController,public commonService:CommonServices) {
    this.max = 40;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BmicalculatorPage');
  }
  calculateBMI(){
    
      if((this.calculate.Weight != 0 && this.calculate.HeightInFoot != 0) &&
         (this.calculate.Weight != undefined && this.calculate.HeightInFoot != undefined && this.calculate.HeightInInch != undefined))
      {
        this.enteredAll = true;
        let bmi =  this.calculate.getResult(this.calculate.Weight,this.calculate.HeightInFoot,this.calculate.HeightInInch);
        if(Number(bmi) < 15){
          this.result =  "severe";
          this.status = "#ff0000";
        }else if(Number(bmi) >= 15 &&  Number(bmi) <= 18.5){
          this.result =  "Under Weight";
          this.status = "#45ccce";
        }else if(Number(bmi) >= 18.5 && Number(bmi) <=  25){
          this.result =  "Normal";
          this.status = "#45ccce";
        }else if(Number(bmi) >= 25 && Number(bmi) <= 30){
          this.result =  "Over Weight";
          this.status = "#ff0000";
        }else if(Number(bmi) >= 30 && Number(bmi) <= 40){
          this.result =  "Obese";
          this.status = "#ff0000";
        }else if(Number(bmi) > 40){
          this.result =  "Class III Obese";
          this.status = "#ff0000";
        }
        this.current = Math.round(Number(bmi));
      }else{
        this.enteredAll = false;
        this.presentToast('Please fill all details');
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
    this.gender = gender_sts;
  }
  CheckAllFil(){
    this.current = 0;
    this.status = "#fff";
    //console.log(this.calculate.HeightInFoot,);
    if(this.calculate.Weight != 0 && this.calculate.HeightInFoot != 0){
      this.enteredAll = false;
    }else{
      this.current = 0;
      this.enteredAll = true;
      this.status= "#fff";
    }
  }

  RestrictDecimels(event) {
    return this.commonService.ValidateDecimels(event);
  }
}
