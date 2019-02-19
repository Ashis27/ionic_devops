import { Component } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CommonServices } from "../../../providers/common.service";
import { IonicPage, NavController } from "ionic-angular";
import { DataContext } from '../../../providers/dataContext.service';

@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html'
})
export class Feedback {

  referralCode: string;
  referrralConfig: any = [];
  feedbackAns: any = [];
  answer: any = {};
  doctorInfo: any = {};
  feedbackQus: any;
  moduleType: number = 9;
  isSelectedReview: boolean = false;
  userMessage: string;
  feedbackModuleType: string = "9";
  doctorDetails: any = {};
  myRatingDetails: any = {};
  userRating: number = 5;
  feedbackQuestionList: any=[];
  question: any;
  constructor(public navCtrl: NavController, public _dataContext: DataContext, public socialSharing: SocialSharing, private commonService: CommonServices) {

  }

  ionViewDidEnter() {
    this.getFeedbackQuestion();
    this.commonService.onEntryPageEvent("Feedback Page");
  }

  getFeedbackQuestion() {
    this._dataContext.GetFeedbackQuestion(this.moduleType)
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

  setFeedbackVar() {
    this.feedbackAns = [];
    for (var i = 0; i < this.feedbackQuestionList.length; i++) {
      this.answer = {
        PlatformFeedbackQuestionID: this.feedbackQuestionList[i].PlatformFeedbackQuestionID,
        QuestionType: this.feedbackQuestionList[i].Type,
        Value: this.feedbackQuestionList[i].Type == 2 ? "" : this.feedbackQuestionList[i].Type == 3 ? "" : 1,

      };
      this.feedbackAns.push(this.answer);
      this.answer = {};
    }
  }

  submitFeedback() {
    // this.feedbackAns = [];
    //this.feedbackAns.push(this.answer);
    this.submitConsumerFeedbackForDoctor();
  }


  submitConsumerFeedbackForDoctor() {
    this._dataContext.SubmitConsumerFeedbackForDoctor(this.feedbackAns)
      .subscribe(response => {
        if (response.Result == 'Success') {
          //this.feedbackAns = [];
          //this.getReview();
          this.commonService.onEventSuccessOrFailure("Feedback submitted successfully.");
          this.userRating = 5;
          this.userMessage = "";
          this.isSelectedReview = false;
          this.commonService.onMessageHandler("Thank you for your feedback.", 1);
          this.navCtrl.setRoot("DashBoard");
          //this.getFeedbackQuestion();
        }
      },
        error => {
          this.commonService.onEventSuccessOrFailure("Feedback submission failed.");
          this.commonService.onMessageHandler("Failed to Retrieve.", 0);
        });

  }

}

