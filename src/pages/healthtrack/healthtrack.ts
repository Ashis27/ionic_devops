import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController } from 'ionic-angular';
import { DataContext } from '../../providers/dataContext.service';
import { CommonServices } from '../../providers/common.service';
import moment from 'moment';
// import { Health } from '@ionic-native/health';

@IonicPage()
@Component({
  selector: 'page-healthtrack',
  templateUrl: 'healthtrack.html',
  //providers:[Health]
})
export class HealthTrack {


  constructor(public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, ) { }
  ionViewDidEnter() {
   // this.getStepFromGoogleFit();
  }
  // getStepFromGoogleFit(){
  //   this.health.isAvailable()
  //   .then((available:boolean) => {
  //     console.log(available);
  //     this.health.requestAuthorization([
  //       'distance', 'nutrition',  //read and write permissions
  //       {
  //         read: ['steps'],       //read only permission
  //         write: ['height', 'weight']  //write only permission
  //       }
  //     ])
  //     .then(res => console.log(res))
  //     .catch(e => console.log(e));
  //   })
  //   .catch(e => console.log(e));
  // }
}
