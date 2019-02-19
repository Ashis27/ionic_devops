import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, AlertController } from 'ionic-angular';
import { DataContext } from '../../providers/dataContext.service';
import { CommonServices } from '../../providers/common.service';
import moment from 'moment';

/**
 * Generated class for the VaccineRemindersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-vaccine',
  templateUrl: 'Vaccination.html',
})
export class Vaccine {
  VaccineReminders = [];
  isAvailable: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VaccineRemindersPage');
  }

  addBabyVaccination() {
    // let addModal = this.modalCtrl.create("AddVaccinationPage", { status: "Add" });
    // addModal.onDidDismiss(item => {
    //   if (item) {
    //     this.navCtrl.push("AddremiderFormPage", { medicineName: item, pageFrom: "Search" });
    //   }
    // })
    // addModal.present();
    this.navCtrl.push("AddVaccinationPage", { status: "Add" });
  }

  closeCurrentSection() {
    this.navCtrl.setRoot("DashBoard");
  }

}
