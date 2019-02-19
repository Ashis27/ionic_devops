import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
/**
 * Generated class for the HeightweightPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-heightweight',
  templateUrl: 'heightweight.html',
})
export class HeightweightPage {
  selectedFoot:number;
  selectedInches:number;
  sex:any = "male";
  result:any = 0;
  AllFieldsFil:boolean = false;
  foots = [1,2,3,4,5,6,7,8];
  inches = [0,1,2,3,4,5,6,7,8,9,10,11];
  max:number=100;
  current:number = 0;
  status:string="#45ccce";
  smiley_src:string="";
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController,public commonService:CommonServices) {
    //this.calculate();
  }

  ionViewDidLoad() {
    this.smiley_src = "assets/imgs/calculator/happy.png"
    console.log('ionViewDidLoad HeightweightPage');
  }
  resetInches(){
    if(this.selectedFoot == 4){
      this.inches = [6,7,8,9,10,11];
    }else{
      this.inches = [1,2,3,4,5,6,7,8,9,10,11];
    }
    //this.calculate();
  }

  calculate(){
    if(this.sex != "" && this.selectedFoot != 0 && this.selectedInches != 0){
      this.AllFieldsFil = true;
      this.result = this.getResult();
    }
   }
   getResult(){
    if(this.selectedFoot > 0 && this.selectedInches > 0  ){
      if(this.sex == 'male'){
        if(this.selectedFoot == 4 ){
          //this.current = 50;
          let num = Number(this.selectedInches);
          switch (num){
            case 6:
              return '28 - 35 Kg';
            case 7:
              return '30 - 39 Kg';
            case 8:
              return '33 - 40 Kg.';
            case 9:
              return '35 - 44 Kg';
            case 10:
              return '38 - 46 Kg';
            case 11:
              return '40 - 50 Kg';
          }
         }else {
           let chk = this.selectedFoot - 5;
           let x = Math.floor(50 + ((chk+this.selectedInches)*2.3));
           this.current = 100;
           return x+" - "+(x+4)+" Kg";
           //50 kg + 2.3 kg for each inch over 5 feet. 
         }
        }else {
          if(this.selectedFoot == 4 ){
            let num = Number(this.selectedInches);
            //this.current = 40;
            switch (num){
              case 6:
                return '28 - 35 Kg';
              case 7:
                return '30 - 37 Kg';
              case 8:
                return '32 - 40 Kg.';
              case 9:
                return '35 - 42 Kg';
              case 10:
                return '36 - 45  Kg';
              case 11:
                return '39 - 47 Kg';
            }
           }else {
             let chk = this.selectedFoot - 5;
             let x = Math.floor(45.5 + ((chk+this.selectedInches)*2.3));
             this.current = 100;
             return x+" - "+(x+4) +" Kg";
             //50 kg + 2.3 kg for each inch over 5 feet. 
           }
        }
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

  
  getStyle(gender_sts){
    this.sex = gender_sts;
    if(this.selectedFoot != undefined && this.selectedInches != undefined){
      this.getResult();
    }else{
      this.current = 0;
      this.result = 0;
      this.AllFieldsFil = false;
    }
  }
  CheckAllFil(){
    if(this.selectedFoot != undefined && this.selectedInches != undefined){
      //this.AllFieldsFil = true;
    }else{
      this.AllFieldsFil = false;
      this.result=0;
      this.current=0;
    }
  }
}