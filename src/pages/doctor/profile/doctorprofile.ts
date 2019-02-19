import { Component, ViewChild, ElementRef } from '@angular/core';
import { PopoverController, App, NavParams, IonicPage, NavController, Platform } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import { GroupEntity } from '../../../interfaces/user-options';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import moment from 'moment';
import * as _ from "lodash";
declare var google: any;

@IonicPage()
@Component({
  selector: 'page-doctorprofile',
  templateUrl: 'doctorprofile.html',
  providers: [CallNumber, InAppBrowser]
})
export class DoctorProfile {
  @ViewChild('mapCanvas') mapElement: ElementRef;
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
  doctorInfo: any = {};
  doctorDetails: any = {};
  isDocAvailable: boolean = false;
  feedbackModuleType: string = "6";
  feedbackQuestionList: any = [];
  feedbackAns: any = [];
  answer: any = {};
  isSelectedReview: boolean = false;
  allQuestionsAnswered: boolean = false;
  isDocInfoAvailable: boolean = true;
  myFavDoctorDetails: any = {};
  myRatingDetails: any = {};
  userRating: number = 5;
  isSelectedFav: boolean = false;
  submittedFeedbackList: any = [];
  userMessage: string;
  userId: number;
  hospitalList: any = [];
  myFavDoctorList: any = [];
  selectedFavDoctor: any = {};
  groupEntityId: number = 0;
  isIosPlatform: boolean = false;
  groupEntity: GroupEntity = { GroupEntityID: 0, ProviderID: 0, Name: "" };
  lat: string;
  lng: string;
  googleApiKey: string;
  url: string;
  constructor(private iab: InAppBrowser, public platform: Platform, private callNumber: CallNumber, public appCtrl: App, public navCtrl: NavController, public navParams: NavParams, public _dataContext: DataContext, private commonService: CommonServices) {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
      .then((result) => {
        if (result.loginStatus) {
          this.userId = result.loginStatus.consumerId;
          this.doctorInfo = this.navParams.get('providerInfo');
          this.getCurrentLocationFromCache();
          this.getMyFavourite();
          this.getHospitals();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });

    //this.retrieveFeedbackQuestionListForProvider();

  }
  ionViewDidEnter() {
    if (this.platform.is('ios')) {
      this.isIosPlatform = true;
    } else {
      this.isIosPlatform = false;
    }
    //this.lat = this.hospitalInfo.Latlong.split(",")[0];
    //this.lng = this.hospitalInfo.Latlong.split(",")[1];
    //this.url = "https://maps.google.com/maps?q=" + this.lat + "," + this.lng + "&hl=es;z=14&amp;output=embed";
  }
  getMap() {
    this.lat = this.hospitalList[0].Latitude;
    this.lng = this.hospitalList[0].Longitude;
    //this.url = "https://maps.google.com/maps?q=" + this.lat + "," + this.lng + "&hl=es;z=14&amp;output=embed";

    let mylocation = new google.maps.LatLng(this.lat, this.lng);
    let mapEle = this.mapElement.nativeElement;
    let map = new google.maps.Map(mapEle, {
      center: mylocation,
      zoom: 11,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      fullscreenControl: false
    });
    this.hospitalList.filter(item => {
      let infoWindow = new google.maps.InfoWindow({
        content: '<div><h5>' + item.Name + '</h5></div>' + '<div><p>' + '<span>' + item.Address + '<span>' + ", " + '<span>' + item.City + '<span>' + '</p></div>'
      });
      let marker = new google.maps.Marker({
        position: new google.maps.LatLng(item.Latitude, item.Longitude),
        map: map,
        //icon: icon,
        title: item.Name,
        url: item.Latitude
      });
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });

    google.maps.event.addListenerOnce(map, 'idle', () => {
      mapEle.classList.add('show-map');
    });

  }
  getDirection(lat, lng) {
    this.url = "https://maps.google.com/maps?q=" + lat + "," + lng + "&hl=es;z=14&amp;output=embed";
    const browser = this.iab.create(this.url, '_blank');
    browser.show();
    // window.open(this.url, '_blank');
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
  //Get indivual doctor details based on ID.
  getDoctorDetails() {
    this.groupEntity.Name = this.doctorInfo.ProviderName;
    this.groupEntity.ProviderID = this.doctorInfo.ProviderID;
    this._dataContext.GetDoctorDetails(this.groupEntity)
      .subscribe(response => {
        if (response.result.length > 0) {
          this.doctorDetails = response.result[0];
          this.isDocAvailable = true;
          this.isDocInfoAvailable = true;
          this.getMap();
          this.doctorDetails.provider.Name = this.commonService.convert_case(this.doctorDetails.provider.Name);
          this.doctorDetails.DoctorSpecialization.filter(spec => {
            if (this.doctorDetails["SpecializationText"] != undefined && this.doctorDetails["SpecializationText"] != null) {
              this.doctorDetails["SpecializationText"] = this.doctorDetails.SpecializationText + ", " + spec.SpecializationText;
            }
            else {
              this.doctorDetails["SpecializationText"] = spec.SpecializationText;
            }
            //this.doctorDetails["Specialization"] = this.doctorDetails.Specialization + (this.doctorDetails.Specialization != '' ? ", " : '') + spec.Specialization;
          });
        }
        else {
          this.isDocInfoAvailable = false;
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  //Get indivual doctor details based on ID.
  getHospitals() {
    this._dataContext.GetHospitals(this.doctorInfo.ProviderID)
      .subscribe(response => {
        if (response.Status && response.result != null) {
          this.hospitalList = response.result;
          let isHospitalAvailable = false;
          if (this.doctorInfo.GroupEntityId) {
            this.groupEntityId = this.doctorInfo.GroupEntityId;
            this.hospitalList.filter(item => {
              if (item.GroupEntityID == this.groupEntityId) {
                isHospitalAvailable = true;
              }
            })
            if (isHospitalAvailable) {
              this.getDoctorDetails();
              this.isDocInfoAvailable = true;
            }
            else {
              this.isDocInfoAvailable = false;
            }
          }
          else {
            this.getDoctorDetails();
          }

        }
        else{
          let isHospitalAvailable = false;
          this.isDocInfoAvailable = false;
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  _call(number) {
    this.callNumber.callNumber(number, true)
      .then(() => {
      })
      .catch(() => {

      });
  }
  retrieveFeedbackQuestionListForProvider() {
    this._dataContext.GetFeedbackQuestionsForDoctor(this.feedbackModuleType)
      .subscribe(response => {
        if (response.Data.length > 0) {
          this.feedbackQuestionList = response.Data;
          this.setFeedbackVar();
        }

      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  myFavourite() {
    if (!this.isSelectedFav) {
      this.setMyFavourite();
    }
    else {
      this.removeFavourite();
    }
  }
  getProviderRating() {
    this._dataContext.GetProviderRating(this.doctorInfo.ProviderID)
      .subscribe(response => {
        if (response.result != null) {
          this.doctorDetails.ProviderOverAllRating = response.result;
        }
      },
        error => {
          //this.commonService.onMessageHandler("Failed to Retrieve", 0);
        });
  }
  setFeedbackVar() {
    this.feedbackAns = [];
    for (var i = 0; i < this.feedbackQuestionList.length; i++) {
      this.answer = {
        PlatformFeedbackQuestionID: this.feedbackQuestionList[i].PlatformFeedbackQuestionID,
        QuestionType: this.feedbackQuestionList[i].Type,
        Value: this.feedbackQuestionList[i].Type == 2 ? "" : this.feedbackQuestionList[i].Type == 3 ? "" : 1,
        ProviderID: this.doctorInfo.ProviderID, // added in order to send the providerID if feedback is given for any doctor
        FeedbackModuleType: this.feedbackModuleType   //added on 30-DEC-2015, in order to get the rating of doctors.
      };
      this.feedbackAns.push(this.answer);
      this.answer = {};
    }
  }
  removeFavourite() {
    let doctorId = this.doctorInfo.ProviderID;
    this._dataContext.RemoveFavouriteDoctor(this.selectedFavDoctor)
      .subscribe(response => {
        if (response.Status) {
          console.log(this.groupEntity);
          console.log(doctorId);
          this.myFavDoctorList = _.filter(this.myFavDoctorList, function (item) { return item.ProviderID != doctorId });
          this.isSelectedFav = false;
          this.removeFavouriteDoctor(this.myFavDoctorList);
          this.getMyFavourite();
          this.commonService.onMessageHandler(response.Message, 1);
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0);
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  submitConsumerFeedbackForDoctor() {
    //this.allQuestionsAnswered = true;
    // this.feedbackAns.filter((item) => { if (item.Value === "") { this.allQuestionsAnswered = false } return this.allQuestionsAnswered });
    //if (this.allQuestionsAnswered) {
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
    //}
    //else {
    //  this.commonService.onMessageHandler("Please answer all the questions.", 0);
    //}
  }
  getReview() {
    this.isSelectedReview = true;
    this._dataContext.GetProviderFeedback(this.doctorInfo.ProviderID)
      .subscribe(response => {
        this.submittedFeedbackList = response.result;
        this.submittedFeedbackList.filter(item => {
          item.CreatedDate = moment(item.CreatedDate).format('DD-MMM-YYYY');
          // if (item.ConsumerID == this.userId) {
          //   this.userMessage = item.Value;
          // }
        })
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  getMyFavourite() {
    this._dataContext.GetMyFavouriteDoctors(0)
      .subscribe(response => {
        if (response.result.length > 0) {
          this.myFavDoctorList = response.result;
          this.removeFavouriteDoctor(response.result);
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  removeFavouriteDoctor(data) {
    let count = 0;
    if (data.length > 0) {
      data.filter(item => {
        if (item.ProviderID == this.doctorInfo.ProviderID) {
          this.isSelectedFav = true;
          this.selectedFavDoctor = item;
          count++;
        }
      });
      if (count == 0) {
        this.selectedFavDoctor = {};
        this.isSelectedFav = false;
      }
      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getFavDoctors"), data);
    }
  }
  setMyFavourite() {
    this.myFavDoctorDetails.ProviderID = this.doctorInfo.ProviderID;
    this.myFavDoctorDetails.ProviderName = this.doctorInfo.ProviderName;
    this.myFavDoctorDetails.SpecializationName = this.doctorDetails.SpecializationText;
    //this.myFavDoctorDetails.SpecializationID = this.doctorDetails.Specialization;
    this.myFavDoctorDetails.City = this.selectedCityAndLocation.activeCity;
    this.myFavDoctorDetails.CityCode = this.selectedCityAndLocation.activeCityKey;
    this.myFavDoctorDetails.CityAreaCode = this.selectedCityAndLocation.activeLocation;
    this.myFavDoctorDetails.CityArea = this.selectedCityAndLocation.activeLocationKey;
    this._dataContext.SetMyFavouriteDoctors(this.myFavDoctorDetails)
      .subscribe(response => {
        if (response.Status) {
          this.isSelectedFav = true;
          this.getMyFavourite();
          this.commonService.onMessageHandler(response.Message, 1);
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0);
        }
        // this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getFavDoctors"), response.Result);
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  onRatingChange(event) {
    this.myRatingDetails.ProviderID = this.doctorInfo.ProviderID;
    this.myRatingDetails.ProviderName = this.doctorInfo.ProviderName;
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
      ProviderID: this.doctorInfo.ProviderID, // added in order to send the providerID if feedback is given for any doctor
      FeedbackModuleType: this.feedbackModuleType   //added on 30-DEC-2015, in order to get the rating of doctors.
    };
    this.feedbackAns.push(this.answer);
    this.submitConsumerFeedbackForDoctor();
  }
  //Book appointment with selected doctor
  bookAppointment() {
    let doctorInformationDetails = {
      ProviderId: this.doctorInfo.ProviderID,
      ProviderName: this.doctorInfo.ProviderName,
      ProviderRating: this.doctorInfo.ProviderAverageRating != null && this.doctorInfo.ProviderAverageRating != "" && this.doctorInfo.ProviderAverageRating != undefined ? this.doctorInfo.ProviderAverageRating : 0,
      TotalRatedUser: this.doctorInfo.ProviderAverageRating != null && this.doctorInfo.ProviderAverageRating != "" && this.doctorInfo.ProviderAverageRating != undefined ? this.doctorInfo.ProviderTotalRatingCount : 0,
      SpecializationName: this.doctorDetails.SpecializationText,
      // SpecializationId: this.doctorDetails.Specialization,
      Contact: this.doctorInfo.Contact,
      ProviderImage: (this.doctorDetails.providerImage != null && this.doctorDetails.providerImage != '') ? this.doctorDetails.providerImage.ProviderImagePath : 'assets/img/bookAppointment/specialities_icon.svg',//(this.doctorDetails.providerImage != null && this.doctorDetails.providerImage != '') ? this.doctorDetails.providerImage.ProviderImagePath : 'assets/img/bookAppointment/specialities_icon.svg',
      City: this.selectedCityAndLocation.activeCity,
      Locality: this.selectedCityAndLocation.activeLocation,
      SelectedDocStatusFromProfile: true,
      GroupEntityId: this.doctorInfo.GroupEntityId
    }
    this.navCtrl.push("Appointment", { doctorDetails: doctorInformationDetails });
  }
  closeCurrentPage() {
    this.navCtrl.pop();
  }

}
