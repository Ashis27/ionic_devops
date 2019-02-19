import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import moment from 'moment';
import { CommonServices } from '../../../providers/common.service';
/**
 * Generated class for the BlooddonationduedatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-blooddonationduedate',
  templateUrl: 'blooddonationduedate.html',
})
export class BlooddonationduedatePage {
  obj = new BlooodDueDate();
  res:any = "";
  AllFieldsFil:boolean=false;
  max:number=100;
  current:number = 0;
  status:string="#45ccce";
  smiley_src:string=""
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastController:ToastController,public commonService:CommonServices) {
  }
  calculate(){
    if(this.obj.date != ""){
      this.smiley_src = "assets/imgs/calculator/happy.png"
      this.current = 100;
      this.status = "#45ccce";
      if(this.obj.sex == 'male'){
        this.AllFieldsFil=true;
        this.res = moment(this.obj.date).add(90, 'days').format("DD-MMM-YYYY");
        
      }else{
        this.AllFieldsFil=true;
        this.res = moment(this.obj.date).add(120, 'days').format("DD-MMM-YYYY");
      }
    }else{
      this.AllFieldsFil=false;
      this.presentToast('Enter valid  details');
    }
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad BlooddonationduedatePage');
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
    this.obj.sex  = gender_sts;
    this.calculate();
  }
}
class BlooodDueDate{
  sex:any = "male";
  date:any="";
}