import { Component, NgZone } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController, AlertController, ActionSheetController, Platform, LoadingController, ViewController, NavParams, Events } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { SocialSharing } from '@ionic-native/social-sharing';
import moment from 'moment';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { FileOpener } from '@ionic-native/file-opener';
import { Http, Headers, RequestOptions } from '@angular/http';

@IonicPage()
@Component({
  selector: 'page-uploadappostatus',
  templateUrl: 'uploadappostatus.html',
  providers: [File, FileChooser, Camera, FileTransfer, FileOpener, LocalNotifications, InAppBrowser]
})
export class UploadAppoStatus {
  healthplanbooked = false;
  uploadedDocument = [];
  uploadedFileData = {
    FileName: "",
    Extension: "",
    GroupEntityId: 0,
    ConsumerId: 0
  };
  vitals: any = [];
  userId: number;
  uploadedDocumentDetails: any = {};
  action: string;
  downloadProgress: any;
  isAndroidPlatform: boolean = false;
  totalUploadedDocList: any = [];
  appoId: number;
  openImagePath: any;
  isImageModalOpened: boolean = false;
  countProgress: number = 0;
  downloadStatus: boolean = false;
  pre_download_status: boolean = false;
  lineItemDetails: any = {};
  showSelectedDate: string;
  maxDate: string;
  minDate: string;
  healthPlanId: number = 0;
  pageStatus: string;
  isAdded: boolean = false;
  providerName: string;
  isValidateVital: boolean = false;
  userDetails: any;
  constructor(private iab: InAppBrowser,
    private viewCtrl: ViewController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    public _dataContext: DataContext,
    private commonService: CommonServices,
    public localNotifications: LocalNotifications,
    public socialSharing: SocialSharing,
    private fileOpener: FileOpener,
    public actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    public fileChooser: FileChooser,
    private transfer: FileTransfer,
    private file: File,
    public platform: Platform,
    public _zone: NgZone,
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events) {
    //  event subscribed

    this.minDate = moment().subtract(6, "months").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    this.showSelectedDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    this.appoId = this.navParams.get("appointmentId");
    this.action = this.navParams.get("action");
    this.maxDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    this.lineItemDetails = this.navParams.get("lineItemDetails");
    this.pageStatus = this.navParams.get("pageStatus");
    this.healthPlanId = this.navParams.get("healthPlanId");
    this.uploadedDocumentDetails.CompletionDate = moment(this.showSelectedDate).format("DD-MMM-YYYY");
    this.uploadedDocumentDetails.Completed = true;

    // even subscribed for line item status update
    this.events.subscribe('healthPlanAppontment:created', (user) => {
      this.userDetails = user;
      this.healthplanbooked = true;
      this.providerName = user.ProviderName;
      this.getUploadedPlanStatus(user.LineItemId, this.userId);
    });

    this.events.subscribe('healthPlanDiagnostic:created', (diagnosticUser) => {
      this.userDetails = diagnosticUser;
      this.healthplanbooked = true;
      this.getUploadedPlanStatus(diagnosticUser.ProviderHealthPlanLineItemId, this.userId);
    });
  }
  ionViewDidEnter() {

    this.checkPlatform();
    this.getLoggedonUserDetails();
  }
  checkPlatform() {
    if (this.platform.is('ios')) {
      this.isAndroidPlatform = false;
    } else if (this.platform.is('android')) {
      this.isAndroidPlatform = true;
    }
  }
  onChangeCompleteStatus() {
    if (this.showSelectedDate == "Invalid date")
      this.showSelectedDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  }
  getLoggedonUserDetails() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getUploadedPlanStatus(this.lineItemDetails.ProviderHealthPlanLineItemId, this.userId);
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  getUploadedPlanStatus(lineItemId, consumerId) {
    this._dataContext.GetUploadedAppointmentPlanStatus(lineItemId, consumerId)
      .subscribe(response => {
        this.uploadedDocumentDetails = response;
        this.vitals = (this.uploadedDocumentDetails.ConsumerResponse.Vitals && this.uploadedDocumentDetails.ConsumerResponse.Vitals.length > 0) ? this.uploadedDocumentDetails.ConsumerResponse.Vitals : [];
        if (this.vitals.length > 0) {
          this.vitals.forEach(element => {
            element["SelectedDate"] = moment(element.Date).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
          });
        }
        if (this.uploadedDocumentDetails.ConsumerResponse && this.uploadedDocumentDetails.ConsumerResponse.Document && this.uploadedDocumentDetails.ConsumerResponse.Document.length > 0) {
          this.isAdded = true;
          this.uploadedDocumentDetails.ConsumerResponse.Document.forEach(item => {
            this.downloadFilePreSignedURL(item, false);
          });
        }
        if (this.pageStatus == "pregnancyAppointment") {
          this.providerName = this.uploadedDocumentDetails.ConsumerResponse.DoctorName ? this.uploadedDocumentDetails.ConsumerResponse.DoctorName : this.uploadedDocumentDetails.ProviderName;
        }
        else if (this.pageStatus == "DCAppointment") {
          this.providerName = this.uploadedDocumentDetails.ConsumerResponse.DiagnosticCentreName ? this.uploadedDocumentDetails.ConsumerResponse.DiagnosticCentreName : this.uploadedDocumentDetails.ProviderName;
        }
        this.showSelectedDate = moment(this.uploadedDocumentDetails.CompletionDate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      },
        error => {
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
    //**************************************** */
    // intializes the data to save after event is firedḍḍ
    if (this.healthplanbooked && this.uploadedDocumentDetails && this.uploadedDocumentDetails.ConsumerResponse) {
      let user = this.userDetails;
      this.uploadedDocumentDetails.Completed = true;
      this.uploadedDocumentDetails.ConsumerResponse.Completed = true;
      this.uploadedDocumentDetails.HealthPlanId = user.HealthPlanId;
      // this.providerName = user.ProviderName;
      this.uploadedDocumentDetails.CompletionDate = user.SelectedDate;
      let document = this.uploadedDocumentDetails.ConsumerResponse.Document;
      this.SaveConsumerHealthPlanLineItemResponse(document);
    }
    //********************************** */

  }
  // submitUpdatedDetails() {
  //   this._dataContext.SaveConsumerHealthPlanLineItemResponse()
  //     .subscribe(response => {

  //     },
  //       error => {
  //         console.log(error);
  //         this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
  //       });
  // }
  chooseUploadOptionForIos() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose File',
      buttons: [
        {
          text: 'Camera',
          icon: "ios-camera-outline",
          cssClass: 'icon-btn-color',
          handler: () => {
            this.chooseDocFromCamera();
          }
        },
        {
          text: 'Gallery',
          icon: "ios-image-outline",
          handler: () => {
            this.chooseFromGallery();
          }
        }
      ]
    });
    actionSheet.present();
  }
  chooseUploadOptionForAndroid() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose File',
      buttons: [
        {
          text: 'Camera',
          icon: "ios-camera-outline",
          cssClass: 'icon-btn-color',
          handler: () => {
            this.chooseDocFromCamera();
          }
        },
        {
          text: 'Gallery',
          icon: "ios-image-outline",
          handler: () => {
            this.chooseFromGallery();
          }
        },
        {
          text: 'Document',
          icon: "ios-document-outline",
          handler: () => {
            this.chooseDocFromGallery();
          }
        },
      ]
    });
    actionSheet.present();
  }
  chooseDocFromGallery() {
    this.fileChooser.open().then((url) => {
      (<any>window).FilePath.resolveNativePath(url, (result) => {
        //this.nativepath = result;
        this.readimage(result);
      }
      )
    })
  }
  uploadFileWithOption() {
    if (this.platform.is('ios')) {
      this.chooseUploadOptionForIos();
    } else if (this.platform.is('android')) {
      this.chooseUploadOptionForAndroid();
    }
  }
  chooseDocFromCamera() {
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
      this.readimage(imageData);
    });
    //this.uploadedDocument.push({ 'File': "data:image/png;base64,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", DocumentType: value == "report" ? this.report : this.prescription, 'FileName': "user.jpg", 'FileExtension': ".jpg", "Size": "30KB" });
  }
  //Get picture from Gallery
  chooseFromGallery() {
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
      this.readimage(imageData);
    });
  }
  readimage(path) {
    (<any>window).resolveLocalFileSystemURL(path, (res) => {
      res.file((resFile) => {
        var reader = new FileReader();
        reader.readAsDataURL(resFile);
        // reader.onloadend = (evt: any) => {
        let file_name: string;
        if (resFile.type.indexOf("jpg") >= 0 || resFile.type.indexOf("jpeg") >= 0 || resFile.type.indexOf("png") >= 0 || resFile.type.indexOf("pdf") >= 0) {
          // let alert = this.alertCtrl.create({
          //   title: "File Name",
          //   message: 'Do you want to give a file name or it will take the default name?',
          //   inputs: [
          //     {
          //       name: 'fileName',
          //       placeholder: 'ex: my_document'
          //     },
          //   ],
          //   buttons: [
          //     {
          //       text: 'CANCEL',
          //       role: 'cancel',
          //       handler: data => {
          //         file_name = resFile.name;
          //         this.uploadedDocument.push({ 'File': reader.result, TempFile: path, fileUrlPath: reader.result, DocumentType: "document", 'FileName': file_name, FileUrl: path, 'FileExtension': resFile.type, "Status": "Add" });
          //         this.uploadedDocument.reverse();
          //       }
          //     },
          //     {
          //       text: 'OK',
          //       handler: data => {
          //         let extension = resFile.type.substring(resFile.type.indexOf("/") + 1, resFile.type.length);
          //         if (data.fileName != "" && data.fileName != undefined) {
          //           let currentTime = Math.floor(Math.random() * 899999 + 100000);
          //           file_name = data.fileName + "_" + currentTime + "." + extension;
          //         }
          //         else {
          //           file_name = resFile.name;
          //         }
          //         this.uploadedDocument.push({ 'File': reader.result, TempFile: path, fileUrlPath: reader.result, DocumentType: "document", 'FileName': file_name, 'FileExtension': resFile.type, "Status": "Add" });
          //         this.uploadedDocument.reverse();

          //       }
          //     }
          //   ]
          // });
          // alert.present();
          let extension = resFile.type.substring(resFile.type.indexOf("/") + 1, resFile.type.length);
          let currentTime = Math.floor(Math.random() * 899999 + 100000);
          file_name = resFile.name + "_" + currentTime + "." + extension;
          this.uploadedDocument.push({ 'File': reader.result, TempFile: path, fileUrlPath: reader.result, DocumentType: "document", 'FileName': file_name, 'FileExtension': resFile.type, "Status": "Add" });
          this.uploadedDocument.reverse();
        }
        else {
          this.commonService.onMessageHandler("Sorry! you can upload only .pdf, .png, .jpg, .jpeg files only.", 0);
        }
        // }
      })
    })
  }
  SaveHealthPlanAppointmentStatus() {
    if (this.isAdded) {
      if (this.providerName != "" && this.providerName != undefined) {
        if (this.uploadedDocumentDetails.Note != "" && this.uploadedDocumentDetails.Note != undefined) {
          this.SaveConsumerHealthPlanLineItemResponse(this.uploadedDocumentDetails.ConsumerResponse.Document);

        }
        else {
          this.commonService.onMessageHandler("Please leave a note.", 0);
        }
      }
      else {
        this.commonService.onMessageHandler("Please enter doctor name.", 0);
      }
    }
    else {
      if (this.providerName != "" && this.providerName != undefined) {
        if (this.uploadedDocumentDetails.Note != "" && this.uploadedDocumentDetails.Note != undefined) {
          this.uploadConsumerDocumentRecord();
        }
        else {
          this.commonService.onMessageHandler("Please leave a note.", 0);
        }
      }
      else {
        this.commonService.onMessageHandler("Please enter doctor name.", 0);
      }
    }
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
        this._dataContext.GetHealthPlanUniqueToken(this.uploadedFileData)
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
                  Description: "",
                  FileName: element.FileName,
                  FilePath: response.result,
                });
                if (i === this.uploadedDocument.length) {
                  loading.dismiss().catch(() => { });
                  this.SaveConsumerHealthPlanLineItemResponse(this.totalUploadedDocList);
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
      this.SaveConsumerHealthPlanLineItemResponse([]);
      // this.commonService.onMessageHandler("You haven't attach any file.", 0);
    }
  }
  SaveConsumerHealthPlanLineItemResponse(documents) {
    // if(from)
    if (this.addVital(false)) {
      this.uploadedDocumentDetails.Completed = true;
      if (this.uploadedDocumentDetails.CompletionDate == "Invalid date" || this.uploadedDocumentDetails.CompletionDate == null || this.uploadedDocumentDetails.CompletionDate == '')
        this.uploadedDocumentDetails.CompletionDate = moment().format("DD-MMM-YYYY");
      let updateDetails = {
        ProviderHealthPlanLineItemId: this.uploadedDocumentDetails.ProviderHealthPlanLineItemId,
        UserType: this.uploadedDocumentDetails.UserType,
        ConsumerId: this.userId,
        ConsumerResponse: {
          Completed: this.uploadedDocumentDetails.Completed,
          CompletionDate: this.uploadedDocumentDetails.CompletionDate,
          Note: this.uploadedDocumentDetails.Note,
          Document: documents,
          DoctorName: this.providerName,
          DiagnosticCentreName: this.providerName,
          Vitals: this.vitals
        }
      }
      this._dataContext.SaveConsumerHealthPlanLineItemResponse(updateDetails)
        .subscribe(response => {
          this.uploadedDocumentDetails = {};
          this.uploadedDocument = [];
          this.totalUploadedDocList = [];
          this.viewCtrl.dismiss(true);
          this.commonService.onEventSuccessOrFailure("Successfully uploaded appointment status");
        },
          error => {
            // this.viewCtrl.dismiss(false);
            this.commonService.onMessageHandler("Failed to submit. Please contact support.", 0);
            this.totalUploadedDocList = [];
            this.commonService.onEventSuccessOrFailure("Upload failed");
          });
    }
    // else {
    //   this.commonService.onMessageHandler("Vital fields can not be blank", 0);
    // }
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
        this.uploadedDocument.push({ fileUrlPath: response.result, DocumentTypeName: data.DocumentTypeName, DocumentType: data.DocumentType, 'FileName': data.FileName, FileUrl: data.DocumentPath, 'FileExtension': fileExtension, "Status": "Download" });
      },
        error => {
          this.commonService.onMessageHandler("Failed to retrive. Please try againg.", 0);
        });
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
        this.uploadedDocument.push({ fileUrlPath: response.result, DocumentTypeName: data.DocumentTypeName, DocumentType: data.DocumentType, 'FileName': data.FileName, FileUrl: data.DocumentPath, 'FileExtension': fileExtension, "Status": "Download" });
      },
        error => {
          this.commonService.onMessageHandler("Failed to retrive. Please try againg.", 0);
        });
  }
  getOptionToViewOrDelete(data, index) {
    if (data.Status == "Add") {
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
    // this.uploadedDocument.filter(item => {
    //   if (data.id == item.id) {
    var removedValue = this.uploadedDocument.splice(index, 1);
    //   }
    // })
  }
  closeModal() {
    let modal2 = document.getElementById('openEditImage');
    modal2.style.display = "none";
    this.isImageModalOpened = false;
  }
  openSelectedFile(item) {
    if (item.Status == 'Add') {
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
  onSelectedDate() {
    this.uploadedDocumentDetails.CompletionDate = moment(this.showSelectedDate).format('DD-MMM-YYYY');
  }
  closeUploadModal() {
    this.viewCtrl.dismiss(true);
  }
  addVital(status) {
    if (this.vitals.length > 0) {
      for (let item of this.vitals) {
        if (!item["VitalName"] || !item["Value"] || !item["Unit"] || !item["SelectedDate"]) {
          this.isValidateVital = false;
          this.commonService.onMessageHandler("Vital fields can not be blank", 0);
          break;
        }
        else {
          if (status)
            this.vitals.unshift({ VitalName: "", Value: "", Unit: "", Date: "", SelectedDate: "" });
          this.isValidateVital = true;
          break;
        }
      }
    }
    else {
      if (status) {
        this.vitals.unshift({ VitalName: "", Value: "", Unit: "", Date: "", SelectedDate: "" });
        this.isValidateVital = false;
      }
      else
        this.isValidateVital = true;
    }
    return this.isValidateVital;
  }
  removeVital(index) {
    this.vitals.splice(index, 1);
  }
  onSelectedVitalDate(item) {
    item.Date = moment(item.SelectedDate).format('DD-MMM-YYYY');
  }
  //validate only number
  onlyNumber(event) {
    return this.commonService.validateOnlyNumber(event);
  }
}
