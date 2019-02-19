import { Component, NgZone } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController, NavParams, ActionSheetController, AlertController, LoadingController, ViewController, Platform } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../../providers/dataContext.service';
import { CommonServices } from '../../../../providers/common.service';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { FileOpener } from '@ionic-native/file-opener';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SocialSharing } from '@ionic-native/social-sharing';
import moment from 'moment';


@IonicPage()
@Component({
  selector: 'page-journaldetails',
  templateUrl: 'journaldetails.html',
  providers: [File, FileChooser, Camera, FileTransfer, FileOpener, LocalNotifications, InAppBrowser]
})
export class HealthJournalDetails {
  healthJournalDetails = {
    Category: "",
    ProviderHealthPlanId: 0,
    Note: "",
    Name: "",
    ConsumerId: 0,
    CreatedDate: "",
    Document: []
  };;
  healthJournalId: number = 0;
  uploadedDocument: any = [];
  record: any = [];
  downloadProgress: any;
  isAndroidPlatform: boolean = false;
  totalUploadedDocList: any = [];
  appoId: number;
  openImagePath: any;
  isImageModalOpened: boolean = false;
  countProgress: number = 0;
  downloadStatus: boolean = false;
  pre_download_status: boolean = false;
  userId: number = 0;

  constructor(
    public navParams: NavParams,
    public localNotifications: LocalNotifications,
    private viewCtrl: ViewController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    public _dataContext: DataContext,
    private commonService: CommonServices,
    public navCtrl: NavController,
    public socialSharing: SocialSharing,
    private fileOpener: FileOpener,
    public actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    public fileChooser: FileChooser,
    private transfer: FileTransfer,
    private file: File,
    public platform: Platform,
    public _zone: NgZone,
    public iab: InAppBrowser
  ) {
    this.healthJournalId = this.navParams.get("healthPlanJournalId");
  }
  ionViewDidEnter() {
    this.checkPlatform();
    this.getLoggedonUserDetails();
  }
  getLoggedonUserDetails() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getHealthJournalDetails();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  getHealthJournalDetails() {
    this._dataContext.GetHealthJournalDetails(this.healthJournalId)
      .subscribe(response => {
        this.healthJournalDetails = response;
        this.healthJournalDetails["Date"] = moment(this.healthJournalDetails.CreatedDate).format("DD-MMM-YYYY");
        if (this.healthJournalDetails.Document.length > 0) {
          this.healthJournalDetails.Document.forEach(item => {
            this.downloadFilePreSignedURL(item, false);
          });
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }
  redirectTo(value) {
    this.navCtrl.push(value);
  }

  openSeletedFile(data, status) {
    if (data.FileName.indexOf("jpeg") >= 0 || data.FileName.indexOf("jpg") >= 0 || data.FileName.indexOf("png") >= 0) {
      this.openImagePath = data;
      let modal2 = document.getElementById('openEditImage');
      modal2.style.display = "block";
      this.isImageModalOpened = true;
    }
    else {
      this.isImageModalOpened = false;
      window.open(data.fileUrlPath, '_system');
    }
  }
  closeModal() {
    let modal2 = document.getElementById('openEditImage');
    modal2.style.display = "none";
    this.isImageModalOpened = false;
  }
  downloadFilePreSignedURL(data, status) {
    this._dataContext.DownloadHealthPlanUniqueToken(this.userId, data.FileName)
      .subscribe(response => {
        // data["fileUrlPath"] = response.result;
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
        this.uploadedDocument.push({ fileUrlPath: response.result, DocumentTypeName: data.DocumentTypeName, DocumentType: data.DocumentType, 'FileName': data.FileName, FileUrl: data.DocumentPath, 'FileExtension': fileExtension });
      },
        error => {
          this.commonService.onMessageHandler("Failed to retrive. Please try againg.", 0);
        });
  }
  checkPlatform() {
    if (this.platform.is('ios')) {
      this.isAndroidPlatform = false;
    } else if (this.platform.is('android')) {
      this.isAndroidPlatform = true;
    }
  }
  downloadDocument(response, data, status) {
    let modal2 = document.getElementById('openEditImage');
    modal2.style.display = "none";
    this.isImageModalOpened = false;
    const fileTransfer: FileTransferObject = this.transfer.create();
    let fileURL = "";
    if (this.platform.is('ios')) {
      fileURL = this.file.documentsDirectory;
    } else if (this.platform.is('android')) {
      fileURL = "file:///storage/emulated/0/Download/";
    }
    this.pre_download_status = true;
    this.downloadStatus = true;
    this.downloadProgress = document.getElementById('downloadProgress');
    this.downloadProgress.style.display = "block";
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
        // this.isReadyToShare = false;
        //this.commonService.onMessageHandler("Successfully downloaded", 1);
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
        this.openDownloadedImage(fileURL + this.commonService.getAppTitle() + "/" + data.FileName, fileExtension);
      }, (error) => {
        if (error.http_status == 403) {
          this.commonService.onMessageHandler("Request has expaired to access the file", 0);
          this.pre_download_status = false;
          this.downloadStatus = false;
          //this.isReadyToShare = true;
        }
        else if (error.http_status == 200) {
          //  this.commonService.onMessageHandler(error.exception, 0);
          //  this.pre_download_status = false;
          //  this.downloadStatus = false;
          this.file.removeRecursively(fileURL, this.commonService.getAppTitle())
            .then(_ => {
              this.downloadDocument(response, data, false);
            })
            .catch(err => {
              console.log('Failed to download.');
            });
          //this.isReadyToShare = true;
        }
        else {
          this.downloadProgress.style.display = "none";
          this.commonService.onMessageHandler("Failed to Download.Plesae try again", 0);
        }
        this.pre_download_status = false;
        this.downloadStatus = false;
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
  openDownloadedImage(fileURL, fileExtension) {
    this.fileOpener.open(fileURL, fileExtension)
      .then(() => {
      })
      .catch(e => {
        // this.commonService.onMessageHandler(e.message, 0);
      });
  }
}
