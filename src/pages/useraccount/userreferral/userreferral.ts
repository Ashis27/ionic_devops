import { Component } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CommonServices } from "../../../providers/common.service";
import { IonicPage, NavController } from "ionic-angular";
import { DataContext } from '../../../providers/dataContext.service';

@IonicPage()
@Component({
  selector: 'page-userreferral',
  templateUrl: 'userreferral.html'
})
export class ReferralCode {
  referralCode: string;
  referrralConfig: any=[];
  constructor(public navCtrl: NavController,public _dataContext: DataContext, public socialSharing: SocialSharing, private commonService: CommonServices) {
    this.getReferralCode();
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getAppVersionConfig"))
      .then((result) => {
        if (result) {
          this.referrralConfig = result;
        }
        else {
          this.getCurrentAppVersion(0);
        }
      });
  }

  ionViewDidEnter() {
  
    this.commonService.onEntryPageEvent("User referral start");
    }
  //Get Current App Version
  getCurrentAppVersion(value) {
    this._dataContext.GetAppVersion(value)
      .subscribe(response => {
        this.referrralConfig = response.Result;
      },
        error => {
        });
  }
  getReferralCode() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getReferralCode"))
      .then((result) => {
        if (result) {
          this.referralCode = result;
        }
        else{
         // this.referralCode ="BYT6674CJ";
        }
      });
  }
  //Share referral code
  shareReferralCode() {
    this.socialSharing.share(this.referrralConfig.ReferralMessage,"Invitation","", this.referrralConfig.ReferralLink)
      .then(function (result) {
        console.log(result);
        this.commonService.onEventSuccessOrFailure("click share referral");
      }, function (err) {
        // An error occurred. Show a message to the user
      });
  }
  redirectToMenu(value,event) {
    // $(".footer-image-sec").removeClass("active-section").addClass("footer-back");
    // $(event.currentTarget).removeClass("footer-back").addClass("active-section");
    if (value == "DashBoard") {
      this.navCtrl.setRoot("DashBoard");
    }
  }
}

