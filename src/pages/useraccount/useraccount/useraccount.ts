import { Component, ViewChild } from '@angular/core';
import { IonicPage, Platform, Slides, App, ViewController, AlertController, ActionSheetController, NavController, ModalController } from 'ionic-angular';
import { DataContext } from "../../../providers/dataContext.service";
import { CommonServices } from "../../../providers/common.service";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileOpener } from '@ionic-native/file-opener';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-useraccount',
  templateUrl: 'useraccount.html',
  providers: [Camera, FileOpener, InAppBrowser]
})
export class UserAccount {
  @ViewChild('myinput') input;
  uploaded_image = { "FileName": "", "File": "", GroupEntityId: "" }
  userProfile: any = [];
  countryCode: string;
  appVersionConfig: any = [];
  openImagePath: any;
  loggedInUser: any = { loginStatus: false, userName: "", contact: "", email: "", userDetails: [], consumerId: 0 }
  constructor(private iab: InAppBrowser, private fileOpener: FileOpener, public appCtrl: App, public platform: Platform, public alertCtrl: AlertController, private camera: Camera, public actionSheetCtrl: ActionSheetController, private modalCtrl: ModalController, public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController) {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getAppVersionConfig"))
      .then((result) => {
        if (result) {
          this.appVersionConfig = result;
        }
        else {
          this.getCurrentAppVersion(0);
        }
      });
  }
  //Entry Point
  ionViewWillEnter() {
    //this.getLoggedInUserProfilePicFromCache();
    this.getLoggedInUserDetailsFromCache();
    this.commonService.onEntryPageEvent("Come to user profile");
  }
  //Get Profile Pic from cache
  // getLoggedInUserProfilePicFromCache() {
  //   this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getProficPic"))
  //     .then((result) => {
  //       if (result) {
  //         this.uploaded_image.File = result;
  //       }
  //     });
  // }
  //Get Current App Version
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
        if (result) {
          this.uploaded_image.File = result.ProfilePicUrl;
        }
        //else {
        this.getUserProfile(0);
        //this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserInfo"))
        //}
      });
  }
  //Get LoggedIn user details
  getUserProfile(value) {
    this._dataContext.GetLoggedOnUserProfile(value)
      .subscribe(response => {
        if (response.Result == "OK") {
          this.userProfile = response.data;
          this.uploaded_image.File = this.userProfile.ProfilePicUrl;
          //this.countryCode = this.userProfile.CountryCode;
          // this.countryCode = this.userProfile.Contact != null ? this.commonService.splitCountryCode(this.userProfile.Contact) : this.countryCode;
          //this.userProfile.Contact = this.userProfile.Contact != null ? this.commonService.splitMobileNumber(this.userProfile.Contact) : this.userProfile.Contact;
          this.loggedInUser = { loginStatus: true, userName: response.data.FirstName, contact: response.data.CountryCode + response.data.Contact, email: response.data.UserLogin, userDetails: [], consumerId: response.data.ConsumerID };
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), this.loggedInUser);
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserInfo"), response.data);
        }
        else {
          this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
            .then((result) => {
              if (result) {
                this.loggedInUser = result;
              }
              this.loggedInUser.loginStatus = false;
              this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), this.loggedInUser);
              this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserInfo"), false)
              this.navCtrl.setRoot("LoginPage");
            });
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }
  //Get Logged In user details from cache, if not available then get from server.
  getLoggedInUserDetailsFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
      .then((result) => {
        if (result.loginStatus) {
          this.loggedInUser = result;
          if (result.contact != "" && result.contact != null && result.contact != undefined) {
            this.userProfile.CountryCode = this.commonService.splitCountryCode(result.contact);
            this.userProfile.Contact = this.commonService.splitMobileNumber(result.contact);
          }
          this.getUserInfo();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }

  //Upload Profile Picture
  uploadProfilePicture() {
    this.viewOption();
  }
  // withOutViewOtion(){
  //   let actionSheet = this.actionSheetCtrl.create({
  //     title: 'Choose File',
  //     buttons: [
  //       {
  //         text: 'Camera',
  //         icon: "ios-camera-outline",
  //         cssClass: "iconColor",
  //         handler: () => {
  //           this.chooseFromCamera();
  //         }
  //       },
  //       {
  //         text: 'Gallery',
  //         icon: "ios-image-outline",
  //         cssClass: "iconColor",
  //         handler: () => {
  //           this.chooseFromGallery();
  //         }
  //       },
  //     ]
  //   });
  //   actionSheet.present();
  // }
  viewOption() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose File',
      buttons: [
        {
          text: 'View',
          icon: "ios-eye-outline",
          cssClass: "iconColor",
          handler: () => {
            this.viewImage();
          }
        },
        {
          text: 'Camera',
          icon: "ios-camera-outline",
          cssClass: "iconColor",
          handler: () => {
            this.chooseFromCamera();
          }
        },
        {
          text: 'Gallery',
          icon: "ios-image-outline",
          cssClass: "iconColor",
          handler: () => {
            this.chooseFromGallery();
          }
        },
      ]
    });
    actionSheet.present();
  }
  viewImage() {
    let modal2 = document.getElementById('openImage');
    modal2.style.display = "block";
  }
  //Logout 
  logOut() {
    let alert = this.alertCtrl.create({
      title: "Logout",
      message: 'Do you want to Logout ?',
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: () => {
            //this.viewCtrl.dismiss();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this._dataContext.UserLogOut()
              .subscribe(response => {
                if (response.Result) {
                  localStorage.setItem("userToken", "");
                  this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
                    .then((result) => {
                      if (result) {
                        this.loggedInUser = result;
                      }
                      this.loggedInUser.loginStatus = false;
                      this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"), this.loggedInUser);
                      this.navCtrl.setRoot("DashBoard");
                    });
                }
              },
                error => {
                  console.log(error);
                  this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
                });

          }
        }
      ]
    });
    alert.present();
  }
  //Get picture from camera
  chooseFromCamera() {
    var imageList: any = [];
    const cameraOptions: CameraOptions = {
      quality: 50, // picture quality
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true,
      // allowEdit: true,
      // targetWidth: 500,
      // targetHeight: 500
    }
    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.readimage(imageData);
    });

  }
  //Get picture from Gallery
  chooseFromGallery() {
    const cameraOptions: CameraOptions = {
      quality: 50, // picture quality
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true,
      // targetWidth: 500,
      // targetHeight: 500
    }
    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.readimage(imageData);
    });
  }
  //Convert to base64
  readimage(data) {
    this.uploaded_image.File = "data:image/jpeg;base64," + data
    this.uploaded_image.FileName = (Math.floor(Math.random() * (1000 - 1 + 1)) + 1) + ".jpg";
    this.uploaded_image.GroupEntityId = this.commonService.getGroupEntityId().toString();
    this._dataContext.UpdateUserProfilePic(this.uploaded_image)
      .subscribe(response => {
        if (response.Message == "SUCCESS") {
          this.commonService.onMessageHandler("Successfully uploaded profile picture.", 1);
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl('getProficPic'), this.uploaded_image.File);
        }
        else {
          this.uploaded_image.File = this.loggedInUser.userDetails.ProfilePicUrl;
          this.commonService.onMessageHandler("Failed to Upload Profile Picture. Please try again.", 0);
        }
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Upload Profile Picture.Please try again.", 0);
        });
  }
  //Redirect To indivisual page 
  redirectTo(value) {
    if (value == "doctor") {
      if (this.platform.is('ios')) {
        //const browser = this.iab.create(this.appVersionConfig.ProviderIosAppUrl,'_system');
        //browser.show();
        window.open(this.appVersionConfig.ProviderIosAppUrl, '_system');
      
      } else if (this.platform.is('android')) {
        //const browser = this.iab.create(this.appVersionConfig.ProviderAndroidAppUrl,'_system');
       // browser.show();
       window.open(this.appVersionConfig.ProviderAndroidAppUrl, '_system');
      }
    }
    else {
      this.navCtrl.push(value);
    }
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

}
