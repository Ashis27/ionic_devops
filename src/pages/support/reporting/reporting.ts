import { Component, ViewChild } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CommonServices } from "../../../providers/common.service";
import { IonicPage, NavController } from "ionic-angular";
import { DataContext } from '../../../providers/dataContext.service';
import { NgForm } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-reporting',
  templateUrl: 'reporting.html'
})

export class Reporting {
  @ViewChild('myinput') input;
  uploaded_image = { "FileName": "", "File": "", GroupEntityId: "" }

  userProfile: any = [];
  ticketdec: any = {};
  countryCode: string;
  appVersionConfig: any = [];
  openImagePath: any;
  selectedType: string;
  ticketTypeDetails: any = [];
  ticketDetail: any = {
    ticketType: "",
    ticketDescription: ""
  };
  loggedInUser: any = { loginStatus: false, userName: "", contact: "", email: "", userDetails: [] };
  constructor(public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) {

  }

  ionViewWillEnter() {
    this.getLoggedInUserDetailsFromCache();
    this.commonService.onEntryPageEvent("Support page");
    this.getTicketType();
  }

  getCurrentAppVersion(value) {
    this._dataContext.GetAppVersion(value)
      .subscribe(response => {
        this.appVersionConfig = response.Result;
        this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getAppVersionConfig"), response.Result);
      },
        error => {
        });
  }
  //Get Logged-In User details from Cache
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {


        // this.getUserProfile(0);

      });
  }

  //Get Logged In user details from cache, if not available then get from server.
  getLoggedInUserDetailsFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
      .then((result) => {
        if (result.loginStatus) {
          this.loggedInUser = result;
          // if (result.contact != "" && result.contact != null && result.contact != undefined) {
          //   this.userProfile.CountryCode = this.commonService.splitCountryCode(result.contact);
          //   this.userProfile.Contact = this.commonService.splitMobileNumber(result.contact);
          // }
          // this.getUserInfo();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }


  closeCurrentPage() {
    //this.navCtrl.setRoot("DashBoard");
    this.navCtrl.pop();
  }
  redirectToMenu(value, event) {
    // $(".footer-image-sec").removeClass("active-section").addClass("footer-back");
    // $(event.currentTarget).removeClass("footer-back").addClass("active-section");
    if (value == "DashBoard") {
      this.navCtrl.setRoot("DashBoard");
    }
  }
  closeModal() {
    let modal2 = document.getElementById('openImage');
    modal2.style.display = "none";
  }



  getTicketType() {
    this._dataContext.GetTicketType()
      .subscribe(response => {
        if (response.length > 0) {
          this.ticketTypeDetails = response;
          this.ticketTypeDetails.reverse();
          this.ticketTypeDetails.push({Value:"",DisplayText:"Select Category"});
          this.ticketTypeDetails.reverse();
        }

      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });
  }
  // selectedTicketType(){
  //   this.ticketDetail.ticketType = this.selectedType;
  // }



  // setTicketkVar() {
  //   this.ticketDetail = [];

  //     this.ticketdec = {
  //       TicketType: this.ticketDetail.ticketType,
  //       TicketDescription: this.ticketDetail.ticketDescription,

  //   }
  //   this.ticketDetail.push(this.ticketdec);
  // }

  submitTicket(form: NgForm) {
    if (this.commonService.isValidateForm(form)) {
      this._dataContext.SubmitTicket(this.ticketDetail)
        .subscribe(response => {
          if (response.Result == 'OK') {
            this.commonService.onEventSuccessOrFailure("Ticked raised successfully.");
            this.commonService.onMessageHandler("Thank you! Your ticket has been submitted successfully.", 1);
            this.navCtrl.setRoot("DashBoard");
            this.ticketDetail.ticketType = 0;
            this.ticketDetail.ticketDescription = "";
          }
        },
          error => {
            this.commonService.onEventSuccessOrFailure("Failed to raise ticket.");
            this.commonService.onMessageHandler("Failed to Save.", 0);
          });
    }
  }
}

