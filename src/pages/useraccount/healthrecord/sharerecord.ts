import { Component, NgZone } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CommonServices } from "../../../providers/common.service";
import { IonicPage, NavController, NavParams, AlertController, Platform } from "ionic-angular";
import { DataContext } from '../../../providers/dataContext.service';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-sharerecord',
  templateUrl: 'sharerecord.html',
  providers: [File, FileOpener, FileTransfer, SocialSharing, LocalNotifications, InAppBrowser]
})
export class ShareHealthRecord {
  record: any = [];
  message: string = "";
  prescription: number = 5193;
  report: number = 5194;
  userId: number;
  isReadyToShare: boolean = true;
  countProgress: number = 0;
  downloadStatus: boolean = false;
  pre_download_status: boolean = false;
  selectedFilePath: any = [];
  userName: string;
  appConfig: any = [];
  openImagePath: any;
  downloadProgress: any;
  section: string = "";
  isAndroidPlatform:boolean=false;
  constructor(private iab: InAppBrowser, public platform: Platform, private alertCtrl: AlertController, public localNotifications: LocalNotifications, public _zone: NgZone, private transfer: FileTransfer, private fileOpener: FileOpener, private file: File, public navParams: NavParams, public navCtrl: NavController, public _dataContext: DataContext, public socialSharing: SocialSharing, private commonService: CommonServices) {
    this.record = this.navParams.get("record");
    this.section = this.navParams.get("status");
  }
  ionViewDidEnter() {
    this.checkPlatform();
    this.getLoggedonUserDetails();
    this.getCurrentAppVersionFromCache();

  }
  getCurrentAppVersionFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getAppVersionConfig"))
      .then((result) => {
        if (result) {
          this.appConfig = result;
        }
        else {
          this.getCurrentAppVersion(0);
        }
      });
  }
  //Get Current App Version
  getCurrentAppVersion(value) {
    this._dataContext.GetAppVersion(value)
      .subscribe(response => {
        this.appConfig = response.Result;
      },
        error => {
        });
  }
  checkPlatform(){
    if (this.platform.is('ios')) {
     this.isAndroidPlatform = false;
    } else if (this.platform.is('android')) {
      this.isAndroidPlatform = true;
    }
  }
  getLoggedonUserDetails() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.userName = result.FirstName;
          let count = 0;
          if (this.record.length > 0) {
            this.record.filter(item => {
              if (this.section == "user") {
                this.downloadFilePreSignedURL(item, false);
              }
              else {
                item.FileName = item.FileName + item.FileExtenssion;
                this.downloadUniqueTokenForProviderUploadedFile(item, false);
              }
              item["isActive"] = false;
              item["id"] = count;
              count++;
            })
          }
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  openSeletedFile(data) {
    // this.pre_download_status = false;
    // let fileURL = "file:///storage/emulated/0/Download/" + this.commonService.getAppTitle() + "_" + this.userId + "/" + data.FileName; //this.file.externalDataDirectory + "testImage.png";
    // this.file.checkFile("file:///storage/emulated/0/Download/" + this.commonService.getAppTitle() + "_" + this.userId + "/", data.FileName)
    //   .then(result => {
    //     this.isReadyToShare = false;
    // let fileExtension = '';
    // if (data.FileName.indexOf("jpg") >= 0) {
    //   fileExtension = "image/jpeg";
    // }
    // else if (data.FileName.indexOf("jpeg") >= 0) {
    //   fileExtension = "image/jpeg";
    // }
    // else if (data.FileName.indexOf("png") >= 0) {
    //   fileExtension = "image/png";
    // }
    // else if (data.FileName.indexOf("pdf") >= 0) {
    //   fileExtension = "application/pdf";
    // }
    // this.fileOpener.open(data.fileUrlPath, fileExtension)
    //   .then(() => {
    //   })
    //   .catch(e => {
    //     this.commonService.onMessageHandler(e.message, 0);
    //   });

    // }).catch(err => {
    //   this.downloadFilePreSignedURL(data, true);
    // });
    if (data.FileName.indexOf("jpeg") >= 0 || data.FileName.indexOf("jpg") >= 0 || data.FileName.indexOf("png") >= 0) {
      this.openImagePath = data;
      let modal2 = document.getElementById('opensharedImage');
      modal2.style.display = "block";
    }
    else {
      // const browser = this.iab.create(data.fileUrlPath);
      // browser.show();
      window.open(data.fileUrlPath, '_system');
    }
  }
  downloadDocument(response, data, status) {
    let modal2 = document.getElementById('opensharedImage');
    modal2.style.display = "none";
    let fileURL = "";
    if (this.platform.is('ios')) {
      fileURL = this.file.documentsDirectory;
    } else if (this.platform.is('android')) {
      fileURL = "file:///storage/emulated/0/Download/";
    }
    this.pre_download_status = true;
    this.downloadStatus = true;
    this.downloadProgress = document.getElementById('downloadProgressBar');
    this.downloadProgress.style.display = "block";
    //this.isReadyToShare = true;
    // data["fileUrlPath"] = fileURL;
    this.file.checkDir(fileURL, this.commonService.getAppTitle())
      .then(_ => {
        this.downloadInSelectedDirectory(response, fileURL, data);
      })
      .catch(err => {
        this.file.createDir(fileURL, this.commonService.getAppTitle(), true)
          .then(_ => {
            this.downloadInSelectedDirectory(response, fileURL, data);
          })
          .catch(err => {
            console.log('Failed to create directory.');
          });
      });

  }
  downloadInSelectedDirectory(response, fileURL, data) {
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.download(response, fileURL + this.commonService.getAppTitle() + "/" + data.FileName)
      .then((entry) => {
        this.downloadProgress.style.display = "none";
        this.localNotifications.schedule({
          id: new Date().getMilliseconds(),
          title: 'Download Completed!',
          text: data.FileName,
          trigger: { at: new Date(new Date().getTime() + 10) },
          vibrate: true,
          // sound: "file://notification.mp3",
          icon: "file://logo.png",
          //every: "0"
        });
        this.pre_download_status = false;
        this.downloadStatus = false;
        let fileExtension = '';
        if (data.FileName.indexOf("jpg") >= 0) {
            fileExtension = "image/jpeg";
        }
        else if (data.FileName.indexOf("jpeg") >= 0) {
            fileExtension = "image/jpeg";
        }
        else if (data.FileName.indexOf("png") >= 0) {
            fileExtension = "image/png";
        }
        else if (data.FileName.indexOf("pdf") >= 0) {
            fileExtension = "application/pdf";
        }
        this.openDownloadedImage(fileURL + this.commonService.getAppTitle() + "/" + data.FileName,fileExtension);
      
      }, (error) => {
        if (error.http_status == 403) {
          this.commonService.onMessageHandler("Request has expaired to access the file", 0);
          this.pre_download_status = false;
          this.downloadStatus = false;
          //this.isReadyToShare = true;

        }
        else {
          this.commonService.onMessageHandler("Failed to Download.Plesae try again", 0);
        }
        this.pre_download_status = false;
        this.downloadStatus = false;
        this.downloadProgress.style.display = "none";
        // this.isReadyToShare = true;
        // this.loading.dismiss();
        //this.viewCtrl.dismiss();
      });
    fileTransfer.onProgress((e) => {
      this._zone.run(() => {
        this.countProgress = (e.lengthComputable) ? Math.floor(e.loaded / e.total * 100) : -1;
        this.pre_download_status = false;
        // this.loader.data.content = this.getProgressBar(this.countProgress);
        if (this.countProgress == 100) {
          this.downloadStatus = false;
          this.countProgress = 0;
          //this.loader.dismiss();
        }
      });
    });

  }
  openDownloadedImage(fileURL, fileExtension){
    this.fileOpener.open(fileURL, fileExtension)
    .then(() => {
    })
    .catch(e => {
       // this.commonService.onMessageHandler(e.message, 0);
    });
  }
  downloadUniqueTokenForProviderUploadedFile(data, status) {
    this._dataContext.DownloadUniqueTokenForProviderUploadedFile(data.DocumentPath)
      .subscribe(response => {
        data["fileUrlPath"] = response.result;
      },
        error => {
          this.commonService.onMessageHandler("Failed to retrive. Please try againg.", 0);
        });
  }
  //Download health record using Presigned url
  downloadFilePreSignedURL(data, status) {
    // this.pre_download_status = true;
    // this.isReadyToShare = true;
    this._dataContext.DownloadHealthRecord(this.userId, data.FileName)
      .subscribe(response => {
        data["fileUrlPath"] = response.result;
        //   let fileURL = "file:///storage/emulated/0/Download/" + this.commonService.getAppTitle() + "_" + this.userId + "/" + data.FileName; //this.file.externalDataDirectory + "testImage.png";
        //   this.file.checkDir("file:///storage/emulated/0/Download/", this.commonService.getAppTitle() + '_' + this.userId)
        //     .then(_ => {
        //       this.file.checkFile(fileURL, data.FileName).then(result => {
        //         data["fileUrlPath"] = fileURL;
        //         if (status) {
        //           this.openSeletedFile(data);
        //         }
        //         else {
        //           this.pre_download_status = false;
        //           this.isReadyToShare = false;
        //         }
        //       }).catch(error => {
        //         this.downloadDocument(response, data, status);
        //       })

        //     })
        //     .catch(err => {
        //       this.file.createDir("file:///storage/emulated/0/Download/", this.commonService.getAppTitle() + '_' + this.userId, true)
        //         .then(_ => {
        //           this.downloadDocument(response, data, status);
        //         })
        //         .catch(err => {
        //           console.log('Failed to create directory.');
        //         });
        //     });
        // },
      },
        error => {
          this.commonService.onMessageHandler("Failed to retrive. Please try againg.", 0);
        });
  }
  changeStatus(data, value) {
    let activeStatus = false;
    this.record.filter(item => {
      if (data.id == item.id) {
        item.isActive = !value ? true : false;
      }
      if (item.isActive) {
        activeStatus = true;
      }
    })
    // if (!value) {
    //   if (data.fileUrlPath == "" || data.fileUrlPath == null || data.fileUrlPath == undefined) {
    //     this.downloadFilePreSignedURL(data, false);
    //   }
    //   else {
    //     activeStatus = true;
    //     this.isReadyToShare = false;
    //   }
    // }
    if (!activeStatus) {
      this.isReadyToShare = true;
    }
    else {
      this.isReadyToShare = false;
    }
  }
  //Share Health Record
  shareRecord() {
    this.selectedFilePath = [];
    this.record.filter(item => {
      if (item.isActive) {
        this.selectedFilePath.push(item.fileUrlPath);
      }
    });
    this.socialSharing.share(this.message + "\n\n", "Shared health record by " + this.userName, this.selectedFilePath, this.appConfig.ReferralLink)
      .then(function (result) {
        console.log(result);
      }, function (err) {
        // An error occurred. Show a message to the user
      });
  }
  closeModal() {
    let modal2 = document.getElementById('opensharedImage');
    modal2.style.display = "none";
  }
  cancelDownload() {
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.abort();
    this.downloadProgress.style.display = "none";
    this.localNotifications.schedule({
      id: new Date().getMilliseconds(),
      title: 'Download Cancelled!',
      trigger: { at: new Date(new Date().getTime() + 10) },
      vibrate: true,
      // sound: "file://notification.mp3",
      icon: "file://logo.png",
      //every: "0"
    });
  }
}

