import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavParams, NavController, ModalController, Platform } from 'ionic-angular';
import { DataContext } from '../../providers/dataContext.service';
import { CommonServices } from '../../providers/common.service';
import { GroupEntity } from '../../interfaces/user-options';
import { CallNumber } from '@ionic-native/call-number';
import moment from 'moment';
import * as _ from "lodash";
import { DomSanitizer } from '@angular/platform-browser';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { MapPage } from '../map/map';
import { ConferenceData } from '../../providers/conference-data';
declare var google: any;

@IonicPage()
@Component({
  selector: 'page-hospitalprofile',
  templateUrl: 'hospitalprofile.html',
  providers: [CallNumber, InAppBrowser]
})
export class HospitalProfile {
  @ViewChild('mapCanvas') mapElement: ElementRef;
  hospitalInfo: any = [];
  hospitalDetails: any = [];
  isSelectedReview: boolean = false;
  isHospitalAvailable: boolean = false;
  submittedFeedbackList: any = [];
  userRating: number = 5;
  feedbackModuleType: string = "7";
  feedbackQuestionList: any = [];
  feedbackAns: any = [];
  answer: any = {};
  myRatingDetails: any = {};
  userMessage: string;
  lat: string;
  lng: string;
  googleApiKey: string;
  url: string;
  ambulanceNumber: string = "";
  isAmbulanceAvailable: boolean = false;
  isIosPlatform:boolean=false;
  groupEntity: GroupEntity = { GroupEntityID: 0, ProviderID: 0, Name: "" };
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };

  constructor(public platform: Platform,public confData: ConferenceData, private iab: InAppBrowser, private sanitizer: DomSanitizer, private modalCtrl: ModalController, public navCtrl: NavController, private callNumber: CallNumber, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
    this.hospitalInfo = this.navParams.get('providerInfo');
    this.lat = this.hospitalInfo.Latlong.split(",")[0];
    this.lng = this.hospitalInfo.Latlong.split(",")[1];
    this.url = "https://maps.google.com/maps?q=" + this.lat + "," + this.lng + "&hl=es;z=14&amp;output=embed";
    this.getHospitalDetails();
  }
  // getMapUrl() {
  //   return this.sanitizer.bypassSecurityTrustResourceUrl("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59882.61535194121!2d" + this.lng + "!3d" + this.lat + "!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1909c30a470d79%3A0x7c479906b430736!2sApollo+Hospital!5e0!3m2!1sen!2sin!4v1523601846808");
  // }
  ionViewDidEnter(){
    if (this.platform.is('ios')) {
      this.isIosPlatform = true;
    } else {
      this.isIosPlatform = false;
    }
  }
  getMap() {
    let mylocation = new google.maps.LatLng(this.lat, this.lng);
    let mapEle = this.mapElement.nativeElement;
    let map = new google.maps.Map(mapEle, {
      center: mylocation,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      fullscreenControl: false
    });
    let infoWindow = new google.maps.InfoWindow({
      content: '<div><h5>' + this.hospitalDetails.City + '</h5></div>' + '<div><p>' + '<span>' + this.hospitalDetails.Address + '<span>' + ", " + '<span>' + this.hospitalDetails.City + '<span>' + '</p></div>'
    });
    // let icon = {
    //   url: "assets/img/location.png", // url
    //   scaledSize: new google.maps.Size(50, 50), // size
    // };
    let marker = new google.maps.Marker({
      position: mylocation,
      map: map,
      //icon: icon,
      title: this.hospitalDetails.City
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    google.maps.event.addListenerOnce(map, 'idle', () => {
      mapEle.classList.add('show-map');
    });


  }
  getDirection() {
    const browser = this.iab.create(this.url,'_blank');
    browser.show();
    // window.open(this.url, '_blank');
  }
  _call(number) {
    this.callNumber.callNumber(number, true)
      .then(() => {
      })
      .catch(() => {

      });
  }
  _callAmbulance() {
    if (this.isAmbulanceAvailable) {
      this.callNumber.callNumber(this.ambulanceNumber, true)
        .then(() => {
        })
        .catch(() => {

        });
    }
    else{
      this.commonService.onMessageHandler("Ambulance service is not available.", 0);
    }
  }
  getHospitalDetails() {
    this._dataContext.GetHospitalDetails(this.hospitalInfo.ProviderID)
      .subscribe(response => {
        if (response.Status && response.result !=null) {
          this.hospitalDetails = response.result;
          this.hospitalDetails.HospitalEmergencyNumbers.filter(item => {
            if (item.EmergencyNumberType == 'Ambulance') {
              this.ambulanceNumber = item.Number;
              this.isAmbulanceAvailable = true;
            }
          })
          this.getMap();
          this.getProviderRating();
          this.isHospitalAvailable = true;
        }
        else {
          this.commonService.onMessageHandler("Failed to retrive hospital profile details.", 0);
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  getAllDoctors() {
    // let addModal = this.modalCtrl.create("SeeAllDoctors", { searchKeyword: this.hospitalInfo.ProviderName, cityId: this.selectedCityAndLocation.activeCityKey, localityId: this.selectedCityAndLocation.activeLocationKey, doctors: [], groupEntityId: this.hospitalInfo.ProviderID, searchStatus: true });
    // addModal.onDidDismiss(item => {
    //   if (item) {
    //     console.log(item);
    //   }
    // })
    // addModal.present();
    this.navCtrl.push("SeeAllDoctors", { searchKeyword: this.hospitalInfo.ProviderName, cityId: this.selectedCityAndLocation.activeCityKey, localityId: this.selectedCityAndLocation.activeLocationKey, doctors: [], groupEntityId: this.hospitalInfo.ProviderID, searchStatus: true });

  }
  getCurrentLocationFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
      .then((result) => {
        if ((result.activeCity != "" && result.activeCity != undefined) || (result.activeLocation != "" && result.activeLocation != undefined)) {
          this.selectedCityAndLocation.activeCity = result.activeCity;
          this.selectedCityAndLocation.activeLocation = result.activeLocation;
          this.selectedCityAndLocation.activeCityKey = result.activeCityKey;
          this.selectedCityAndLocation.activeLocationKey = result.activeLocationKey;
        }
        else {
          this.selectedCityAndLocation = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
        }
      });
  }
  getProviderRating() {
    this._dataContext.GetProviderRating(this.hospitalInfo.ProviderID)
      .subscribe(response => {
        if (response.result != null) {
          this.hospitalInfo.ProviderAverageRating = response.result.AverageRating;
          this.hospitalInfo.ProviderTotalRatingCount = response.result.TotalCount;
        }
      },
        error => {
          //this.commonService.onMessageHandler("Failed to Retrieve", 0);
        });
  }
  getReview() {
    this.isSelectedReview = true;
    this._dataContext.GetProviderFeedback(this.hospitalInfo.ProviderID)
      .subscribe(response => {
        this.submittedFeedbackList = response.result;
        this.submittedFeedbackList.filter(item => {
          item.CreatedDate = moment(item.CreatedDate).format('DD-MMM-YYYY');
        })
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  onRatingChange(event) {
    this.myRatingDetails.ProviderID = this.hospitalInfo.ProviderID;
    this.myRatingDetails.ProviderName = this.hospitalInfo.ProviderName;
    this.myRatingDetails.TotalRating = event;
    this._dataContext.SaveMyRating(this.myRatingDetails)
      .subscribe(response => {
        this.getProviderRating();
        //this.commonService.onMessageHandler("Successfully rated to this doctor.", 1);
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  submitFeedback() {
    this.feedbackAns = [];
    this.onRatingChange(this.userRating);
    this.answer = {
      PlatformFeedbackQuestionID: 13,
      QuestionType: 2,
      Value: this.userMessage,
      ProviderID: this.hospitalInfo.ProviderID, // added in order to send the providerID if feedback is given for any doctor
      FeedbackModuleType: this.feedbackModuleType   //added on 30-DEC-2015, in order to get the rating of doctors.
    };
    this.feedbackAns.push(this.answer);
    this.submitConsumerFeedbackForDoctor();
  }
  submitConsumerFeedbackForDoctor() {
    this._dataContext.SubmitConsumerFeedbackForDoctor(this.feedbackAns)
      .subscribe(response => {
        if (response.Result == 'Success') {
          this.feedbackAns = [];
          this.getReview();
          this.userRating = 5;
          this.userMessage = "";
          this.isSelectedReview = false;
          this.commonService.onMessageHandler("Thank you for your feedback.", 1);
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  hideFeedback() {
    this.isSelectedReview = !this.isSelectedReview;
    this.getMap();
  }
  closeCurrentPage() {
    this.navCtrl.pop();
    //this.appCtrl.getRootNav().pop();
  }
}
