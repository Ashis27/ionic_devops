import { Component, ViewChild } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ActionSheetController, ViewController, Content } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SocialSharing } from '@ionic-native/social-sharing';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Video } from './VideoSection';
import { Slides } from 'ionic-angular';
import moment from 'moment';
import { DataContext } from '../../providers/dataContext.service';
import { CommonServices } from '../../providers/common.service';
import { DomSanitizerImpl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import $ from "jquery";
@IonicPage()
@Component({
  selector: 'page-videomenueslisting',
  templateUrl: 'videomenueslisting.html',
})
@Pipe({ name: 'safeUrl' })
export class VideomenueslistingPage implements PipeTransform{
  @ViewChild(Content) content: Content;
  @ViewChild(Slides) slides: Slides;
  showFrame:boolean = false;
  showHadder:boolean = false;
  selectedTab: any = "list";
  shareInfo: any = "";
  videoObj = new Video();
  activityList: any = [];
  VideoMenuList: any = [];
  selectedActivity: any = "";
  HeaderInfo: any = {};
  HeaderInfoTemp: any = {};
  VideoMenuListTemp = [];
  headerURL: any = null;
  URL: SafeUrl = "";
  test: string;
  timeInterval: any = "";
  VideoType: any = "";
  videoType: any = {};
  tempKey: any = "";
  map = new Map();
  msg = "Check out the latest video from ";
  counterFilter: number = 0;
  filterStatus: boolean = false;
  headerUrl: any = "";
  searchKeyword: string = "";
  backUpBlogList: any = [];
  isAvailable: boolean = true;
  isVideoModalOpen:boolean=false;
vedioIndex=-1;
click = 0;
  constructor(public _dataContext: DataContext, private commonService: CommonServices, public socialSharing: SocialSharing, private dom: DomSanitizer, public toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController, public navCtrl: NavController, public navParams: NavParams,public viewCtrl:ViewController) {

  }

  // ionViewDidEnter() {
  //   this.getVideoBlogs();
  // }
  //Get doctor uploaded video blogs
  getVideoBlogs() {
    this._dataContext.GetVideoBlogs()
      .subscribe(response => {
        if (response.Status && response.Result.length > 0) {
          this.VideoMenuList = response.Result;
          this.backUpBlogList = this.VideoMenuList;
          this.isAvailable = true;
          this.VideoMenuList.reverse();
          this.VideoMenuList.filter(item => {
            let currentDate = moment(moment(), "DD-MM-YYYY HH:mm:ss");
            let createdDate = moment(moment(item.CreatedDate), "DD-MM-YYYY HH:mm:ss");
            item.CreatedDate = moment(moment(item.CreatedDate), "DD-MM-YYYY")
            item["days"] = currentDate.diff(createdDate, 'days'); // calculate the difference in days
            item["hrs"] = currentDate.diff(createdDate, 'hours') % 24; // calculate the difference in hours
            item["mins"] = currentDate.diff(createdDate, 'minutes') % 60; // calculate the difference in mins
            item["secs"] = currentDate.diff(createdDate, 'seconds') % 60; // calculate the difference in secs
          });
        }
        else {
          this.backUpBlogList = [];
          this.VideoMenuList = [];
          this.isAvailable = false;
        }
        for(let i = 0  ; i < this.VideoMenuList.length ;i++){
          this.VideoMenuList[i].VideoURL = this.transformImage(this.VideoMenuList[i].VideoURL);
        }
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
        });
  }
  ionViewDidLoad() {
    this.getVideoBlogs();
  }

  transformImage(url) {
    // copy video url = uhttps://youtu.be/8-XTJ23QKzA
    //  copy video at current time = https://youtu.be/8-XTJ23QKzA?t=12
    // https://www.youtube.com/embed/8-XTJ23QKzA

    //........................................

    // facebook  = 'https://www.facebook.com/AmazingThingsAnimal/videos/638367449833824/?t=5'
    // facebook embeded = 'http://www.facebook.com/video/embed?video_id=10152463995718183'

    //..........................................
    this.VideoType = "";
    let checkURL = url.split('//');
    let checkPlatformList = checkURL[1].split('/');
    if (checkPlatformList[0] == "www.facebook.com") {

      let spliID = url.split("/");
      let ID = spliID[spliID.length - 2];
      this.map.set("http://www.facebook.com/video/embed?video_id=" + ID, "facebook");
      return "http://www.facebook.com/video/embed?video_id=" + ID
    } else if (checkPlatformList[0] == "youtu.be") {
      console.log('it is youtube video')

      let tempURL = "https://www.youtube.com/embed/";
      let splitURL = url.split('/');
      let splitURL2 = url.split('?');
      if (splitURL2.length > 1) {
        let splitURL3 = splitURL2[0].split('/');
        tempURL = tempURL + splitURL3[splitURL.length - 1];
        this.map.set(tempURL, "youtube");
        return tempURL;
      } else {
        tempURL = tempURL + splitURL[splitURL.length - 1];
        this.map.set(tempURL, "youtube");
        return tempURL;
      }
    } else {
      return url;
    }
  }
  searchBlogByKeyword(event) {
    if (this.counterFilter % 2 == 0) {
      this.filterStatus = true;
    }
    else {
      this.filterStatus = false;
    }
    this.counterFilter++;
  }
  searchBlogText(event) {
    let term = event.target.value;
    if (term && term.trim() != '') {
      this.VideoMenuList = this.backUpBlogList.filter((item) => {
        return (item.VideoTitle.toLowerCase().indexOf(term.toLowerCase()) > -1);
      })
      if (this.VideoMenuList.length == 0) {
        this.isAvailable = false;
      }
      else {
        this.isAvailable = true;
      }
    }
    else {
      this.isAvailable = true;
      this.VideoMenuList = this.backUpBlogList;
    }
  }
  getTime(value) {
    this.timeInterval = "";
    let time = 0;
    let totalTimeInMiliSec = new Date().getTime() - new Date(value).getTime();
    if (totalTimeInMiliSec >= 0 && totalTimeInMiliSec < 60000) {

      time = totalTimeInMiliSec / 1000;
      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " sec";
      } else {
        this.timeInterval = Math.floor(time) + " secs";
      }
    }
    else if (totalTimeInMiliSec >= 60000 && totalTimeInMiliSec < 3600000) {
      time = totalTimeInMiliSec / 60000;
      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " min";
      } else {
        this.timeInterval = Math.floor(time) + " mins";
      }
    }
    else if (totalTimeInMiliSec >= 3600000 && totalTimeInMiliSec < 86400000) {

      time = totalTimeInMiliSec / 3600000;

      if (Math.floor(time) <= 1) {

        this.timeInterval = Math.floor(time) + " hr";
      } else {
        this.timeInterval = Math.floor(time) + " hrs";
      }
    }
    else if (totalTimeInMiliSec >= 86400000 && totalTimeInMiliSec < 2678400000) {
      time = totalTimeInMiliSec / 86400000;
      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " day";
      } else {
        this.timeInterval = Math.floor(time) + " days";
      }
    }
    else if (totalTimeInMiliSec >= 2678400000 && totalTimeInMiliSec < 31536000000) {
      time = totalTimeInMiliSec / 2678400000;
      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " month";
      } else {
        this.timeInterval = Math.floor(time) + " months";
      }
    } else if (totalTimeInMiliSec >= 31536000000) {
      time = totalTimeInMiliSec / 31536000000;
      if (Math.floor(time) <= 1) {
        this.timeInterval = Math.floor(time) + " yr";
      } else {
        this.timeInterval = Math.floor(time) + " yrs";
      }
    }
    return this.timeInterval;

  }
  getThumbnail(vidURL) {
    let k = vidURL.$key
    // vidURL : https://www.youtube.com/embed/8-XTJ23QKzA
    // need   :"http://img.youtube.com/vi/" + videoID +"/0.jpg";

    // facebook need = ''"https://graph.facebook.com/VIDEO_ID/picture" 
    // facebook URL = 'http://www.facebook.com/video/embed?video_id=10152463995718183'


    if (this.map.get(vidURL) == "youtube") {
      let splitURL = vidURL.split("/");
      let ID = splitURL[splitURL.length - 1];
      return "http://img.youtube.com/vi/" + ID + "/0.jpg"

    } else if (this.map.get(vidURL) == "facebook") {
      let splitURL = vidURL.split("=");
      let ID = splitURL[splitURL.length - 1];
      return "https://graph.facebook.com/" + ID + "/picture"
    } else {
      return "https://multimedia.europarl.europa.eu/o/europarltv-theme/images/europarltv/media-default-thumbnail-url-video.png";
    }

  }
  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
  play(vid,index) {
    this.navCtrl.push('ViewvideoPage',{
      vid:vid
    });

  }
  public transform(url):SafeUrl {
    return this.dom.bypassSecurityTrustResourceUrl(url);
  }
  ionViewDidLeave(){
   // window.stop();
   
  }
  

  
}



