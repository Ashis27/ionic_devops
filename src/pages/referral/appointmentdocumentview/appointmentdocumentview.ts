import { Component } from '@angular/core';

import { NavController,Platform, NavParams, ViewController, IonicPage } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';

@IonicPage()
@Component({
    templateUrl: 'appointmentdocumentview.html',
    selector: 'page-appointmentdocumentview'
})
export class AppointmentViewDocumentModalContentPage {

    documentInfo:any={};
    imagePath: string;
    path = "";
    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices
    ) {
        this.path = this.params.get('imagepath');
        this.documentInfo = this.params.get('documentInfo');
        
        this.view();
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    gotoHome(){
        this.navCtrl.setRoot("HomePage");
    }

    view() {
        this._dataContext.DownloadFileFromAWSForMobileForHospital(this.path)
            .subscribe(response => {
                console.log(response);
                if (response.status == "Success") {
                    this.imagePath = response.result;
                } else {
                    this.imagePath = "";
                }

            },
                error => {
                    console.log(error);

                    this.commonService.onMessageHandler("Error", 0);
                });
    }

}