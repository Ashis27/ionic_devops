import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, PopoverController, AlertController, IonicPage, App, ViewController, ActionSheetController, Platform, LoadingController } from 'ionic-angular';
import { CommonServices } from '../../../providers/common.service';
import { DataContext } from '../../../providers/dataContext.service';
import moment from 'moment';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { FileOpener } from '@ionic-native/file-opener';
import { SocialSharing } from '@ionic-native/social-sharing';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-addnewrecord',
  templateUrl: 'addnewrecord.html',
  providers: [File, FileChooser, Camera, FileTransfer, FileOpener, SocialSharing, LocalNotifications, InAppBrowser]

})
export class AddNewRecord {
  record: any = [];
  section: string;
  totalUploadedDocList: any = [];
  familyList: any = [];
  documentsFor: any = [];
  userId: number;
  userName: string;
  showCurrentDate: string;
  currentMonth: string;
  currentDate: string;
  uploadedDocument = [];
  currentYear: string;
  action: string;
  prescription: number = 5193;
  report: number = 5194;
  uploadedDocumentDetails = {
    Description: "",
    DocumentFor: 0,
    DocumentType: 0,
    DocumentPath: "",
    ConsumerId: 0,
    FileName: "",
    DocumentSize: "",
    CreatedDate: "",
    MRN: "",
    DoctorName: ""
  };
  uploadedFileData = {
    FileName: "",
    Extension: "",
    GroupEntityId: 0,
    ConsumerId: 0
  };
  openImagePath: any;
  isImageModalOpened: boolean = false;
  countProgress: number = 0;
  downloadStatus: boolean = false;
  pre_download_status: boolean = false;
  isReportAvailable: boolean = false;
  isPresAvailable: boolean = false;
  downloadProgress: any;
  isAndroidPlatform: boolean = false;
  selectedMmemberRelation: string = "";
  isOpenFromPopover: boolean = false;
  constructor(private loadingCtrl: LoadingController,
    private iab: InAppBrowser,
    public platform: Platform,
    public _zone: NgZone,
    public localNotifications: LocalNotifications,
    public socialSharing: SocialSharing,
    private fileOpener: FileOpener,
    public actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    public fileChooser: FileChooser,
    private transfer: FileTransfer,
    private file: File,
    public popoverCtrl: PopoverController,
    public commonService: CommonServices,
    public _dataContext: DataContext,
    public navParams: NavParams,
    public appCtrl: App,
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    private alertCtrl: AlertController) {

    this.record = this.navParams.get("record");
    this.section = this.navParams.get("status");
    this.action = this.navParams.get("action");
    this.isOpenFromPopover = this.navParams.get("isOpenFromPopover");
    if (this.action == 'Add') {
      this.showCurrentDate = moment().format('DD-MMM-YYYY');
      this.currentMonth = moment(this.showCurrentDate).format("MMM");
      this.currentDate = moment(this.showCurrentDate).format("DD");
      this.currentYear = moment(this.showCurrentDate).format("YYYY");
    }
    else {
      this.currentMonth = this.record[0].currentMonth;
      this.currentDate = this.record[0].currentDate;
      this.currentYear = this.record[0].currentYear;
    }
    this.getLoggedonUserDetails();
  }
  ionViewDidEnter() {
    this.checkPlatform();
    this.commonService.onEntryPageEvent("Come to upload record");
    this.uploadedDocument = [];
    if (this.record.length > 0) {
      let count = 0;
      this.uploadedDocumentDetails.Description = this.record[0].Description;
      this.record.filter(item => {
        if (item.DocumentType == this.report) {
          this.isReportAvailable = true;
        }
        else if (item.DocumentType == this.prescription) {
          this.isPresAvailable = true;
        }
        if (this.section == "user") {
          this.downloadFilePreSignedURL(item, false);
        }
        else {
          item.FileName = item.FileName + item.FileExtenssion;
          // this.downloadFilePreSignedURL(item, false);
          this.downloadUniqueTokenForProviderUploadedFile(item, false);
        }
        item["id"] = count;
        count++;
      })
    }
    else {
      this.isReportAvailable = true;
      this.isPresAvailable = true;
    }
  }
  checkPlatform() {
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
          if (this.section == "user") {
            this.uploadedDocumentDetails.DocumentFor = this.action == 'Add' ? this.userId : this.record[0].DocumentForId;
          }
          else {
            this.uploadedDocumentDetails.DocumentFor = this.action == 'Add' ? this.userId : this.record[0].DocumentOwnerID;
          }
          this.getFamilyList();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }

  //Get Family list
  getFamilyList() {
    if (this.documentsFor.length == 0) {
      this._dataContext.GetFamilyListForDropDown()
        .subscribe(response => {
          if (response.length > 0) {
            this.documentsFor = response;
            this.documentsFor.filter((item) => {
              item.DisplayText = item.DisplayText.substr(0, item.DisplayText.indexOf('('));
            })
          }
          this.documentsFor.push({ DisplayText: this.userName, Value: this.userId, Relation: "Self", RelationId: 0 });
          this.documentsFor.reverse();
          if (this.action == 'Add') {
            this.selectedMmemberRelation = this.documentsFor[0].Relation;
          }
          else {
            this.documentsFor.filter(item => {
              if (item.Value == this.record[0].DocumentForId || item.Value == this.record[0].DocumentOwnerID) {
                this.selectedMmemberRelation = item.Relation;
              }
            })
          }
        },
          error => {
            console.log(error);
            this.commonService.onMessageHandler("Failed to retrieve family details. Please try again.", 0);
          });
    }
  }
  chooseUploadOptionForIos(value) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose File',
      buttons: [
        {
          text: 'Camera',
          icon: "ios-camera-outline",
          cssClass: 'icon-btn-color',
          handler: () => {
            this.chooseDocFromCamera(value);
          }
        },
        {
          text: 'Gallery',
          icon: "ios-image-outline",
          handler: () => {
            this.chooseFromGallery(value);
          }
        }
      ]
    });
    actionSheet.present();
  }
  chooseUploadOptionForAndroid(value) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose File',
      buttons: [
        {
          text: 'Camera',
          icon: "ios-camera-outline",
          cssClass: 'icon-btn-color',
          handler: () => {
            this.chooseDocFromCamera(value);
          }
        },
        {
          text: 'Gallery',
          icon: "ios-image-outline",
          handler: () => {
            this.chooseFromGallery(value);
          }
        },
        {
          text: 'Document',
          icon: "ios-document-outline",
          handler: () => {
            this.chooseDocFromGallery(value);
          }
        },
      ]
    });
    actionSheet.present();
  }
  uploadFileWithOption(value) {
    if (this.platform.is('ios')) {
      this.chooseUploadOptionForIos(value);
    } else if (this.platform.is('android')) {
      this.chooseUploadOptionForAndroid(value);
    }
  }
  chooseDocFromCamera(value) {
    var imageList: any = [];
    const cameraOptions: CameraOptions = {
      quality: 50, // picture quality
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true,
      //targetWidth: 500,
      // targetHeight: 500
    }
    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.readimage(imageData, value);
    });
    //this.uploadedDocument.push({ 'File': "data:image/png;base64,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", DocumentType: value == "report" ? this.report : this.prescription, 'FileName': "user.jpg", 'FileExtension': ".jpg", "Size": "30KB" });
  }
  //Get picture from Gallery
  chooseFromGallery(value) {
    const cameraOptions: CameraOptions = {
      quality: 50, // picture quality
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true,
      // targetWidth: 1000,
      // targetHeight: 1000
    }
    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.readimage(imageData, value);
    });
  }
  readimage(path, value) {
    (<any>window).resolveLocalFileSystemURL(path, (res) => {
      res.file((resFile) => {
        var reader = new FileReader();
        reader.readAsDataURL(resFile);
        reader.onloadend = (evt: any) => {
          let selectedFile = this.dataURItoBlob(reader.result, resFile.type);
          let file_name: string;
          if (resFile.type.indexOf("jpg") >= 0 || resFile.type.indexOf("jpeg") >= 0 || resFile.type.indexOf("png") >= 0 || resFile.type.indexOf("pdf") >= 0) {
            let alert = this.alertCtrl.create({
              title: "File Name",
              message: 'Do you want to give a file name or it will take the default name?',
              inputs: [
                {
                  name: 'fileName',
                  placeholder: 'ex: my_document'
                },
              ],
              buttons: [
                {
                  text: 'CANCEL',
                  role: 'cancel',
                  handler: data => {
                    file_name = resFile.name;
                    this.uploadedDocument.push({ 'File': reader.result, TempFile: path, fileUrlPath: reader.result, DocumentType: value == "report" ? this.report : this.prescription, 'FileName': file_name, FileUrl: path, 'FileExtension': resFile.type, "Size": (selectedFile.size / 1024).toFixed(2) + "KB" });
                    this.uploadedDocument.reverse();
                  }
                },
                {
                  text: 'OK',
                  handler: data => {
                    let extension = resFile.type.substring(resFile.type.indexOf("/") + 1, resFile.type.length);
                    if (data.fileName != "" && data.fileName != undefined) {
                      let currentTime = Math.floor(Math.random() * 899999 + 100000);
                      file_name = data.fileName + "_" + currentTime + "." + extension;
                    }
                    else {
                      file_name = resFile.name;
                    }
                    this.uploadedDocument.push({ 'File': reader.result, TempFile: path, fileUrlPath: reader.result, DocumentType: value == "report" ? this.report : this.prescription, 'FileName': file_name, 'FileExtension': resFile.type, "Size": (selectedFile.size / 1024).toFixed(2) + "KB" });
                    this.uploadedDocument.reverse();

                  }
                }
              ]
            });
            alert.present();
          }
          else {
            this.commonService.onMessageHandler("Sorry! you can upload only .pdf, .png, .jpg, .jpeg files only.", 0);
          }
        }
      })
    })
  }

  dataURItoBlob(dataURI, extension) {
    // code adapted from: http://stackoverflow.com/questions/33486352/cant-upload-image-to-aws-s3-from-ionic-camera
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: extension });
  };
  chooseDocFromGallery(value) {
    this.fileChooser.open().then((url) => {
      (<any>window).FilePath.resolveNativePath(url, (result) => {
        //this.nativepath = result;
        this.readimage(result, value);
      }
      )
    })
  }
  updateRecordDetails() {
    this.record.filter(item => {
      item.DocumentFor = this.uploadedDocumentDetails.DocumentFor;
      item.Description = this.uploadedDocumentDetails.Description;
    })
    this.updateDigitalRecord(this.record);
  }
  uploadConsumerDocumentRecord() {
    if (this.uploadedDocument.length > 0) {
      let i = 0;
      let loading = this.loadingCtrl.create({
        content: 'Uploading...'
      });
      loading.present();
      this.uploadedDocument.forEach(element => {
        let headers = new Headers({ 'Content-Type': element.FileExtension });
        let options = new RequestOptions({ headers: headers });
        this.uploadedFileData.Extension = element.FileExtension;
        this.uploadedFileData.FileName = element.FileName;
        this.uploadedFileData.ConsumerId = this.userId;
        this.uploadedFileData.GroupEntityId = this.commonService.getGroupEntityId();
        this._dataContext.GetUniqueToken(this.uploadedFileData)
          .subscribe(response => {
            const fileTransfer: FileTransferObject = this.transfer.create();
            var options = {
              fileKey: 'file',
              fileName: element.FileName,
              mimeType: element.FileExtension,
              chunkedMode: false,
              //  timeout: 300000,
              httpMethod: 'PUT',
              encodeURI: false,
              headers: {
                'Content-Type': element.FileExtension
              },
              params: { 'directory': 'upload', 'fileName': element.FileName }
            }
            fileTransfer.upload(element.File, response.result, options)
              .then((data) => {
                i++;
                this.totalUploadedDocList.push({
                  Description: this.uploadedDocumentDetails.Description,
                  DocumentFor: this.uploadedDocumentDetails.DocumentFor,
                  DocumentType: element.DocumentType,
                  ConsumerId: this.userId,
                  FileName: element.FileName,
                  DocumentSize: element.Size,
                  DocumentPath: response.result
                });
                if (i === this.uploadedDocument.length) {
                  loading.dismiss().catch(() => { });
                  this.uploadNewRecord(this.totalUploadedDocList);
                  // this.datacontext.post('/Kare4uRCWidget/UploadDigitalDocumentsForMobile', this.totalUploadedDocList)
                }
              }, (err) => {
                loading.dismiss().catch(() => { });
                this.commonService.onMessageHandler("Failed to upload. Please contact support.", 0);
              })
          },

            error => {
              this.commonService.onMessageHandler("Failed to upload. Please contact support.", 0);
            })
      })
    }
    else {
      this.commonService.onMessageHandler("You haven't attach any file.", 0);
    }
  }
  uploadNewRecord(data) {
    this._dataContext.UploadUserHealthRecord(data)
      .subscribe(response => {
        if (response.Success) {
          this.uploadedDocumentDetails.DocumentFor = 0;
          this.uploadedDocumentDetails.DocumentType = 0;
          this.uploadedDocumentDetails.Description = "";
          this.uploadedDocument = [];
          this.totalUploadedDocList = [];
          // this.viewCtrl.dismiss(true);
          this.navCtrl.pop();
          this.commonService.onEventSuccessOrFailure("Click upload record");
        }
      },
        error => {
          // this.viewCtrl.dismiss(false);
          this.commonService.onMessageHandler("Failed to upload. Please contact support.", 0);
          this.totalUploadedDocList = [];
          this.commonService.onEventSuccessOrFailure("Upload record failed");
        });
  }
  updateDigitalRecord(data) {
    this._dataContext.UpdateDigitalDocuments(data)
      .subscribe(response => {
        if (response.Success) {
          // this.viewCtrl.dismiss(true);
          this.navCtrl.pop();
          this.commonService.onEventSuccessOrFailure("Click upload record");
        }
      },
        error => {
          // this.viewCtrl.dismiss(false);
          this.commonService.onMessageHandler("Failed to update. Please contact support.", 0);
          this.commonService.onEventSuccessOrFailure("Upload record failed");
        });
  }
  closeCurrentSection() {
    //this.viewCtrl.dismiss(true);
  }
  openSelectedFile(item) {
    if (this.action == 'Add') {
      let imageFile = "";
      if (item.TempFile.indexOf('?') >= 0) {
        imageFile = item.TempFile.substring(0, item.TempFile.lastIndexOf('?'));
      }
      else {
        imageFile = item.TempFile;
      }
      this.fileOpener.open(imageFile, item.FileExtension)
        .then(() => {
        })
        .catch(e => {
          this.commonService.onMessageHandler(e.message, 0);
        });
    }
    else {
      this.openSeletedFile(item, false);
    }

  }
  deleteConsumerDocumentFile(data) {
    let alert = this.alertCtrl.create({
      title: "Delete",
      message: 'Do you want to delete this document?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            // this.viewCtrl.dismiss();
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          role: 'cancel',
          handler: () => {
            if (this.section == "user") {
              this.deleteHealthRecordUploadByUser(data);
            }
            else {
              this.deleteHealthRecordUploadedByProvider(data);
            }
          }
        }
      ]
    });
    alert.present();
  }
  //Delete health record uploaded by user
  deleteHealthRecordUploadByUser(data) {
    this._dataContext.DeleteHealthRecordUploadedByConsumer(data)
      .subscribe(response => {
        if (response.status) {
          //this.viewCtrl.dismiss(true);
          this.navCtrl.pop();
        }
        this.commonService.onMessageHandler(response.message, 1);
      },
        error => {
          this.commonService.onMessageHandler("Failed to delete document. Please try again.", 0);
        });
  }
  //Delete health record uploaded by provider
  deleteHealthRecordUploadedByProvider(data) {
    this._dataContext.DeleteHealthRecordUploadedByProvider(data)
      .subscribe(response => {
        if (response.status) {
          // this.viewCtrl.dismiss(true);
          this.navCtrl.pop();
        }
        this.commonService.onMessageHandler(response.message, 1);
      },
        error => {
          this.commonService.onMessageHandler("Failed to delete document. Please try again.", 0);
        });
  }
  openSeletedFileForProviderUploadedFile(data, status) {
    if (data.FileExtension.indexOf("jpeg") >= 0 || data.FileExtension.indexOf("jpg") >= 0 || data.FileExtension.indexOf("png") >= 0) {
      this.openImagePath = data;
      let modal2 = document.getElementById('openEditImage');
      modal2.style.display = "block";
      this.isImageModalOpened = true;
    }
    else {
      // const browser = this.iab.create(data.fileUrlPath);
      // browser.show();
      this.isImageModalOpened = false;
      window.open(data.fileUrlPath, '_system');
    }
  }
  openSeletedFile(data, status) {
    if (data.FileName.indexOf("jpeg") >= 0 || data.FileName.indexOf("jpg") >= 0 || data.FileName.indexOf("png") >= 0) {
      this.openImagePath = data;
      let modal2 = document.getElementById('openEditImage');
      modal2.style.display = "block";
      this.isImageModalOpened = true;
    }
    else {
      // const browser = this.iab.create(data.fileUrlPath);
      // browser.show();
      this.isImageModalOpened = false;
      window.open(data.fileUrlPath, '_system');
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
  downloadUniqueTokenForProviderUploadedFile(data, status) {
    this._dataContext.DownloadUniqueTokenForProviderUploadedFile(data.DocumentPath)
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
  downloadFilePreSignedURL(data, status) {
    this._dataContext.DownloadHealthRecord(this.userId, data.FileName)
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
  // downloadDocument(response, data, status) {
  //   const fileTransfer: FileTransferObject = this.transfer.create();
  //   let fileURL = "file:///storage/emulated/0/Download/" + this.commonService.getAppTitle() + "_" + this.userId + "/" + data.FileName; //this.file.externalDataDirectory + "testImage.png";
  //   data.pre_download_status = true;
  //   data.downloadStatus = true;
  //   fileTransfer.download(response.result, fileURL)
  //     .then((entry) => {
  //       let fileExtension = '';
  //       if (data.FileName.indexOf("jpg") >= 0) {
  //         fileExtension = "image/jpeg";
  //       }
  //       else if (data.FileName.indexOf("jpeg") >= 0) {
  //         fileExtension = "image/jpeg";
  //       }
  //       else if (data.FileName.indexOf("png") >= 0) {
  //         fileExtension = "image/png";
  //       }
  //       else if (data.FileName.indexOf("pdf") >= 0) {
  //         fileExtension = "application/pdf";
  //       }
  //       this.fileOpener.open(fileURL, fileExtension)
  //         .then(() => {
  //           if (status) {

  //           }
  //         })
  //         .catch(e => {
  //           this.commonService.onMessageHandler(e.message, 0);
  //         });

  //     }, (error) => {
  //       if (error.http_status == 403) {
  //         this.commonService.onMessageHandler("Request has expaired to access the file", 0);
  //         data.pre_download_status = false;
  //         data.downloadStatus = false;

  //       }
  //       else {
  //         this.commonService.onMessageHandler("Failed to Download.Plesae try again", 0);
  //       }
  //       data.pre_download_status = false;
  //       data.downloadStatus = false;
  //       // this.loading.dismiss();
  //       //this.viewCtrl.dismiss();
  //     });
  //   // fileTransfer.onProgress((e) => {
  //   //   this._zone.run(() => {
  //   //     this.countProgress = (e.lengthComputable) ? Math.floor(e.loaded / e.total * 100) : -1;
  //   //     data.pre_download_status = false;
  //   //     // this.loader.data.content = this.getProgressBar(this.countProgress);
  //   //     if (this.countProgress == 100) {
  //   //       data.downloadStatus = false;
  //   //       this.countProgress = 0;
  //   //       //this.loader.dismiss();
  //   //     }
  //   //   });
  //   // });

  // }
  //Download health record using Presigned url
  // downloadFilePreSignedURL(data, status) {
  //   data.pre_download_status = true;
  //   this._dataContext.DownloadHealthRecord(this.userId, data.FileName)
  //     .subscribe(response => {
  //       let fileURL = "file:///storage/emulated/0/Download/" + this.commonService.getAppTitle() + "_" + this.userId + "/" + data.FileName; //this.file.externalDataDirectory + "testImage.png";
  //       this.file.checkDir("file:///storage/emulated/0/Download/", this.commonService.getAppTitle() + '_' + this.userId)
  //         .then(_ => {
  //           this.file.checkFile(fileURL, data.FileName).then(result => {
  //             this.openSeletedFile(data, false);
  //           }).catch(error => {
  //             this.downloadDocument(response, data, status);
  //           })
  //         })
  //         .catch(err => {
  //           this.file.createDir("file:///storage/emulated/0/Download/", this.commonService.getAppTitle() + '_' + this.userId, true)
  //             .then(_ => {
  //               this.downloadDocument(response, data, status);
  //             })
  //             .catch(err => {
  //               console.log('Failed to create directory.');
  //             });
  //         });
  //     },
  //       error => {
  //         this.commonService.onMessageHandler("Failed to retrive. Please try againg.", 0);
  //       });
  // }
  doPrompt() {
    let prompt = this.alertCtrl.create({
      message: "Do You Want To Remove It.",
      buttons: ['OK']

    });
    prompt.present();
  }
  presentPopover(myEvent, value) {
    let popover = this.popoverCtrl.create("PopoverPage", { record: this.record, section: value, status: true });
    popover.present({
      ev: myEvent
    });
    popover.onDidDismiss(item => {
      if (item) {
        //this.viewCtrl.dismiss(true);
        this.navCtrl.pop();
      }
    });
  }
  getOptionToViewOrDelete(data, index) {
    if (this.action == "Add") {
      let actionSheet = this.actionSheetCtrl.create({
        title: 'Choose Option',
        buttons: [
          {
            text: 'View',
            icon: "ios-eye-outline",
            cssClass: 'icon-btn-color',
            handler: () => {
              this.openSelectedFile(data);
            }
          },
          {
            text: 'Remove',
            icon: "ios-trash-outline",
            handler: () => {
              this.deleteSelectedFile(data, index);
            }
          },
        ]
      });
      actionSheet.present();
    }
    else {
      this.openSeletedFile(data, false);
    }
  }
  deleteSelectedFile(data, index) {
    this.uploadedDocument.filter(item => {
      if (data.id == item.id) {
        var removedValue = this.uploadedDocument.splice(index, 1);
      }
    })
  }
  closeModal() {
    let modal2 = document.getElementById('openEditImage');
    modal2.style.display = "none";
    this.isImageModalOpened = false;
  }
  changeMember() {
    this.documentsFor.filter(item => {
      if (item.Value == this.uploadedDocumentDetails.DocumentFor) {
        this.selectedMmemberRelation = item.Relation;
      }
    })
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







