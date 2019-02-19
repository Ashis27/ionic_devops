import { Component } from '@angular/core';
import { CommonServices } from "../../providers/common.service";
import { IonicPage, NavController, ModalController } from "ionic-angular";
import { DataContext } from '../../providers/dataContext.service';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-referral',
  templateUrl: 'referral.html'
})
export class Referral {
  referrals: any = [];
  medicalRecords: any;
  mrShareRequestOb = { MedicalRecordShareRequestId: 0, Status: 0 };
  constructor(public modalCtrl: ModalController, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {
    this.GetReferralsByDoctorForConsumer();
  }

  ionViewDidEnter() {

    //this.commonService.onEntryPageEvent("Feedback Page");
  }

  GetReferralsByDoctorForConsumer() {
    this._dataContext.GetReferralsByDoctorForConsumer()
      .subscribe(response => {
        this.referrals = response.Data;

        for (let index = 0; index < this.referrals.length; index++) {

          this.referrals[index]["MedicalRecords"] = [];
          this.referrals[index]["IsOpen"] = false;
          // let dt = new Date(this.referrals[index].ReferredDate);
          this.referrals[index].ReferredDate = moment(this.referrals[index].ReferredDate, 'MM/DD/YYYY').format("DD-MMM-YYYY");

        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });

    //this.referrals = [{"ProviderReferralConsumerId":7,"ProviderId":1134,"ConsumerId":5567,"ProviderReferred":"Afran","PatientName":"Susanta Patra","PatientContact":"9439421021","ProviderType":10,"ReferredProviderId":1514,"ProviderName":"Bibhu","ReferredDate":"27-08-2018 16:11:13","IsActive":true},{"ProviderReferralConsumerId":8,"ProviderId":1134,"ConsumerId":5567,"ProviderReferred":"Afran","PatientName":"Susanta Patra","PatientContact":"9439421021","ProviderType":10,"ReferredProviderId":1514,"ProviderName":"Bibhu","ReferredDate":"27-08-2018 17:59:43","IsActive":true},{"ProviderReferralConsumerId":9,"ProviderId":1134,"ConsumerId":5567,"ProviderReferred":"Afran","PatientName":"Susanta Patra","PatientContact":"9439421021","ProviderType":10,"ReferredProviderId":1514,"ProviderName":"Bibhu","ReferredDate":"27-08-2018 18:19:18","IsActive":true},{"ProviderReferralConsumerId":10,"ProviderId":1134,"ConsumerId":5567,"ProviderReferred":"Afran","PatientName":"Susanta Patra","PatientContact":"9439421021","ProviderType":10,"ReferredProviderId":1514,"ProviderName":"Bibhu","ReferredDate":"27-08-2018 18:28:41","IsActive":true}];


  }

  GetMedicalRecordShareRequestsForConsumerBasedOnReferral(referral, referralId) {

    if (!referral.IsOpen) {
      this._dataContext.GetMedicalRecordShareRequestsForConsumerBasedOnReferral(referralId)
        .subscribe(response => {
          this.medicalRecords = response.Data;
          console.log(response);

          referral.MedicalRecords = response.Data;
          // for (let index = 0; index < this.referrals.length; index++) {
          //   if (this.referrals[index].Status == 2) {
          //     this.referrals["IsSelected"] = true;
          //   } else {
          //     this.referrals["IsSelected"] = false;
          //   }

          // }
          for (let j = 0; j < referral.MedicalRecords.length; j++) {
            console.log(referral.MedicalRecords[j]);
            if (referral.MedicalRecords[j].Status == 2) {
              referral.MedicalRecords[j].MedicalRecord["IsSelected"] = true;
            } else {
              referral.MedicalRecords[j].MedicalRecord["IsSelected"] = false;
            }
            if (referral.MedicalRecords[j].MedicalRecord.DigitalDocumentPath.indexOf("jpg") >= 0) {

              referral.MedicalRecords[j].MedicalRecord["FileTypeExtention"] = "image/jpeg";

            }

            else if (referral.MedicalRecords[j].MedicalRecord.DigitalDocumentPath.indexOf("jpeg") >= 0) {

              referral.MedicalRecords[j].MedicalRecord["FileTypeExtention"] = "image/jpeg";

            }

            else if (referral.MedicalRecords[j].MedicalRecord.DigitalDocumentPath.indexOf("png") >= 0) {

              referral.MedicalRecords[j].MedicalRecord["FileTypeExtention"] = "image/png";

            }

            else if (referral.MedicalRecords[j].MedicalRecord.DigitalDocumentPath.indexOf("pdf") >= 0) {

              referral.MedicalRecords[j].MedicalRecord["FileTypeExtention"] = "application/pdf";

            } else {
              referral.MedicalRecords[j].MedicalRecord["FileTypeExtention"] = "";
            }

          }

        },
          error => {
            console.log(error);

          });
    }
    referral.IsOpen = !referral.IsOpen;
    referral.MedicalRecords = [];
  }

  GetMedicalRecordShareRequestsForConsumerBasedOnReferralAfterDeny(referral, referralId) {

    
      this._dataContext.GetMedicalRecordShareRequestsForConsumerBasedOnReferral(referralId)
        .subscribe(response => {
          this.medicalRecords = response.Data;
          console.log(response);

          referral.MedicalRecords = response.Data;
          // for (let index = 0; index < this.referrals.length; index++) {
          //   if (this.referrals[index].Status == 2) {
          //     this.referrals["IsSelected"] = true;
          //   } else {
          //     this.referrals["IsSelected"] = false;
          //   }

          // }
          for (let j = 0; j < referral.MedicalRecords.length; j++) {
            console.log(referral.MedicalRecords[j]);
            if (referral.MedicalRecords[j].Status == 2) {
              referral.MedicalRecords[j].MedicalRecord["IsSelected"] = true;
            } else {
              referral.MedicalRecords[j].MedicalRecord["IsSelected"] = false;
            }
            if (referral.MedicalRecords[j].MedicalRecord.DigitalDocumentPath.indexOf("jpg") >= 0) {

              referral.MedicalRecords[j].MedicalRecord["FileTypeExtention"] = "image/jpeg";

            }

            else if (referral.MedicalRecords[j].MedicalRecord.DigitalDocumentPath.indexOf("jpeg") >= 0) {

              referral.MedicalRecords[j].MedicalRecord["FileTypeExtention"] = "image/jpeg";

            }

            else if (referral.MedicalRecords[j].MedicalRecord.DigitalDocumentPath.indexOf("png") >= 0) {

              referral.MedicalRecords[j].MedicalRecord["FileTypeExtention"] = "image/png";

            }

            else if (referral.MedicalRecords[j].MedicalRecord.DigitalDocumentPath.indexOf("pdf") >= 0) {

              referral.MedicalRecords[j].MedicalRecord["FileTypeExtention"] = "application/pdf";

            } else {
              referral.MedicalRecords[j].MedicalRecord["FileTypeExtention"] = "";
            }

          }

        },
          error => {
            console.log(error);

          });
   
  }

  viewIamge(path, doc) {
    if (doc.FileTypeExtention != "application/pdf") {
      let modal = this.modalCtrl.create("AppointmentViewDocumentModalContentPage", { imagepath: path, documentInfo: doc });
      modal.onDidDismiss(item => {

      })

      modal.present();
    } else {
      this._dataContext.DownloadFileFromAWSForMobileForHospital(path)
        .subscribe(response => {
          console.log(response);
          if (response.status == "Success") {
            window.open(response.result, '_system');
            //this.imagePath = response.result;
          }
        },
          error => {
            console.log(error);

            // this.commonService.onMessageHandler("Error", 0);
          });

    }

  }
  viewPublicIamge(path) {

  }
  shareDocuments(referral) {
    let isSelected = false;
    let mrShareRequest = [];
    for (let j = 0; j < referral.MedicalRecords.length; j++) {
      if (referral.MedicalRecords[j].MedicalRecord.IsSelected) {
        isSelected = true;
        mrShareRequest.push({
          ConsumerId: referral.MedicalRecords[j].ConsumerId,
          DigitalDocumentsID: referral.MedicalRecords[j].DigitalDocumentsID,
          ProviderReferralConsumerId: referral.MedicalRecords[j].ProviderReferralConsumerId,
          RequestedBy: referral.MedicalRecords[j].RequestedBy,
          ShareWith: referral.MedicalRecords[j].ShareWith,
          MedicalRecordShareRequestId: referral.MedicalRecords[j].MedicalRecordShareRequestId,
          Status: 2
        });
      } else {
        mrShareRequest.push({
          ConsumerId: referral.MedicalRecords[j].ConsumerId,
          DigitalDocumentsID: referral.MedicalRecords[j].DigitalDocumentsID,
          ProviderReferralConsumerId: referral.MedicalRecords[j].ProviderReferralConsumerId,
          RequestedBy: referral.MedicalRecords[j].RequestedBy,
          ShareWith: referral.MedicalRecords[j].ShareWith,
          MedicalRecordShareRequestId: referral.MedicalRecords[j].MedicalRecordShareRequestId,
          Status: 3
        });
      }
      console.log(mrShareRequest);

    }
    if (isSelected) {
      this._dataContext.UpdateMedicalRecordShareRequests(mrShareRequest)
        .subscribe(response => {
          if (response.Result == "OK") {
            this.commonService.onMessageHandler(response.Message, 1);

          } else {
            this.commonService.onMessageHandler(response.Message, 0);
          }

        },
          error => {
            console.log(error);

          });
    } else {
      this.commonService.onMessageHandler("No document selected", 0);
    }

  }

  rejectDocuments(referral) {

    let mrShareRequest = [];
    for (let j = 0; j < referral.MedicalRecords.length; j++) {


      mrShareRequest.push({
        ConsumerId: referral.MedicalRecords[j].ConsumerId,
        DigitalDocumentsID: referral.MedicalRecords[j].DigitalDocumentsID,
        ProviderReferralConsumerId: referral.MedicalRecords[j].ProviderReferralConsumerId,
        RequestedBy: referral.MedicalRecords[j].RequestedBy,
        ShareWith: referral.MedicalRecords[j].ShareWith,
        MedicalRecordShareRequestId: referral.MedicalRecords[j].MedicalRecordShareRequestId,
        Status: 3
      });

      console.log(mrShareRequest);

    }
    this._dataContext.UpdateMedicalRecordShareRequests(mrShareRequest)
      .subscribe(response => {
        if (response.Result == "OK") {
          this.commonService.onMessageHandler("You have successfully denied", 1);
          this.GetMedicalRecordShareRequestsForConsumerBasedOnReferralAfterDeny(referral, referral.ProviderReferralConsumerId)

        } else {
          this.commonService.onMessageHandler(response.Message, 0);
        }

      },
        error => {
          console.log(error);

        });

  }



}

