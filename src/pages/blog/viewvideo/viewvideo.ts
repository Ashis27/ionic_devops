import { Component, Pipe } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the ViewvideoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-viewvideo',
  templateUrl: 'viewvideo.html',
})
@Pipe({ name: 'safeUrl' })
export class ViewvideoPage implements OnInit {
  HeaderInfo:any= {};
  ngOnInit(): void {
    let vid = this.navParams.get('vid');
    this.HeaderInfo["VideoURL"] =this.transform(vid.VideoURL);
    this.HeaderInfo["VideoTitle"] = vid.VideoTitle;
    this.HeaderInfo["VideoShortDescription"] = vid.VideoShortDescription;
    this.HeaderInfo["VideoDescription"] = vid.VideoDescription;
    this.HeaderInfo["VideoTag"] = vid.VideoTag;
    this.HeaderInfo["days"] = vid.days;
    this.HeaderInfo["hrs"] = vid.hrs;
    this.HeaderInfo["mins"] = vid.mins;
    this.HeaderInfo["secs"] = vid.secs;
    this.HeaderInfo["Createddate"] = vid.Createddate;
    this.HeaderInfo["AssociatedActivity"] = vid.AssociatedActivity;
  }
  constructor(public navCtrl: NavController, public navParams: NavParams,private dom: DomSanitizer,) {
  }
  public transform(url):SafeUrl {
    return this.dom.bypassSecurityTrustResourceUrl(url);
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewvideoPage');
  }

}
