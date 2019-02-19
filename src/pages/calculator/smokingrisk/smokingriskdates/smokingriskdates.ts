import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { DatePickerDirective } from 'ion-datepicker'; // added by vinod
/**
 * Generated class for the SmokingriskdatesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-smokingriskdates',
  templateUrl: 'smokingriskdates.html',
})
export class SmokingriskdatesPage {
  @ViewChild(DatePickerDirective) public datepicker: DatePickerDirective; //added by vinod
  minDate:Date=new Date("1900-01-01");
  maxDate:Date=new Date();
  newDate:any;
  isChanged:boolean=false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    let duration = this.navParams.get("status");
    console.log(new Date(duration.from));
    //this.minDate = new Date(duration.from);
    console.log(`${new Date()}::${this.minDate}`);
    //this.maxDate = new Date('2049-12-31');
  }

  ionViewDidLoad() {
    this.datepicker.open();  
  }

  onSelectedDate(){
    this.isChanged = true;
     this.datepicker.changed.subscribe((selectedDate) => {
      this.newDate = selectedDate;//newly added for datePicker
      //console.log(this.newDate);
      this.viewCtrl.dismiss(this.newDate);
    });
  }
  cancel(){
    if(!this.isChanged){
      this.viewCtrl.dismiss();
    }
  }

}
