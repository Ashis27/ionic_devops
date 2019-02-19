import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, AlertController } from 'ionic-angular';
import { CommonServices } from "../../../providers/common.service";
import { DataContext } from '../../../providers/dataContext.service';
import * as $ from 'jquery';
import moment from 'moment';
/**
 * Generated class for the VaccinationDetsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-vaccination-dets',
  templateUrl: 'vaccination-dets.html',
})
export class VaccinationDetsPage {
  skip:boolean=false;
  reset:boolean=false;
  Vaccines:any=[];
  skip_sts:boolean=false;
  complete_sts:boolean=false;
  vaccine_sts:boolean=false;
  vaccineSingle=[];

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    public modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices, private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    let Temp_Vaccines = this.navParams.get('vaccinedata');
    this.Vaccines = Temp_Vaccines.VaccinationdetailList;  
    console.log(this.Vaccines);  
  }
  closeCurrentSection(){
    this.viewCtrl.dismiss();
  }
  gotoDashboard(){
    this.navCtrl.setRoot("DashBoard");
  }
//  vaccine_status(status,index){
//    if(status == "complete"){
//      this.Vaccines[index].status='completed';
//      console.log(this.Vaccines);
//    }else{
//     this.Vaccines[index].status='skipped';
//    }
    
//  }


skip_vaccine(vaccine,index){
  console.log(vaccine);
  this.skip = true;
  this.vaccineSingle.push({
    VaccinationDetailsID:vaccine.VaccinationDetailsID,
    ConsumerID:vaccine.ConsumerID,
    VaccinationsID:0,
    VaccinationGivenOn:"",
    IdealVaccinationDate:moment(vaccine.IdealVaccinationDate).format("MM/DD/YYYY"),
    GroupEntityID:0,
    GroupName:"",
    ProviderID:0,
    ProviderName:""
  })

  this._dataContext.CompleteVaccineGroup(this.vaccineSingle,this.skip,this.reset)
      .subscribe(response => {
        console.log(response);
          if (response.Result == "OK") {
            this.commonService.onMessageHandler("Vaccine skipped successfully",1);
            this.Vaccines[index].VaccinationSkipped = true;
            this.Vaccines[index].VaccinationAlreadyGiven = 0;
            this.vaccineSingle = [];
            this.skip = false
            console.log(vaccine);
          }
      },
      error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to complete the vaccination.Please try again.", 0);
      });
}

complete_status(vaccine,index){


    // //this.scheduleIndex = index;
    // //console.log(this.VaccineList[index].fulldate);
    // //this.editedDate = moment(this.VaccineList[index].fulldate,"DD-MM-YYYY").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    // let Modal = this.modalCtrl.create("CompleteVaccinationPage", { vaccine_data: vaccine, complete: "single" });
    // Modal.onDidDismiss(data => {
    //   if (data.vaccine_status == "complete") {

    //     this.commonService.onMessageHandler("Vaccination completed successfully",1);
    //     this.vaccineSingle = [];
    //     this.Vaccines[index].VaccinationAlreadyGiven = 1;
    //     this.Vaccines[index].VaccinationSkipped = false;
    //   } else {

      
    //   }
    // });
    // Modal.present();



    this.vaccineSingle.push({
      VaccinationDetailsID:vaccine.VaccinationDetailsID,
      ConsumerID:vaccine.ConsumerID,
      VaccinationsID:0,
      VaccinationGivenOn:moment(vaccine.IdealVaccinationDate).format("MM/DD/YYYY"),
      IdealVaccinationDate:moment(vaccine.IdealVaccinationDate).format("MM/DD/YYYY"),
      GroupEntityID:0,
      GroupName:"",
      ProviderID:0,
      ProviderName:""
    },)
    this._dataContext.CompleteVaccineGroup(this.vaccineSingle,this.skip,this.reset)
      .subscribe(response => {
        console.log(response);
          if (response.Data.Success == true) {
            this.commonService.onMessageHandler("Vaccination completed successfully",1);
            this.vaccineSingle = [];
            this.Vaccines[index].VaccinationAlreadyGiven = 1;
            this.Vaccines[index].VaccinationSkipped = false;
          }else{
            this.commonService.onMessageHandler("Failed to complete the vaccination.Please try again.", 0);
          }   
      },
      error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to complete the vaccination.Please try again.", 0);
      });
}

//showing information of individual vaccine
  showDetail(index){
    let alert = this.alertCtrl.create({
      title: 'Vaccine Info',
      subTitle: '',
      message: this.Vaccines[index].VaccinationInfo,
      buttons: ['Close']
    });
    alert.present();
  }
 
  

}
