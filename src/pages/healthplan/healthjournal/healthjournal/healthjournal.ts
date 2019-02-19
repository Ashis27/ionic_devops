import { Component, NgZone } from '@angular/core';
import { PopoverController, IonicPage, NavController, ModalController, ActionSheetController, Platform, ViewController, LoadingController, AlertController, NavParams } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { DataContext } from '../../../../providers/dataContext.service';
import { CommonServices } from '../../../../providers/common.service';
import { SocialSharing } from '@ionic-native/social-sharing';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { FileOpener } from '@ionic-native/file-opener';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import moment, { months } from 'moment';

@IonicPage()
@Component({
  selector: 'page-healthjournal',
  templateUrl: 'healthjournal.html',
  providers: [File, FileChooser, Camera, FileTransfer, FileOpener, LocalNotifications, InAppBrowser]
})
export class HealthJournal {
  healthJournal = {
    Category: "",
    ProviderHealthPlanId: 0,
    Note: "",
    Name: "",
    DoctorQuery: "",
    ConsumerId: 0,
    Document: [],
    EntryDate: ""
  };
  planCategory = [
    { Value: "Health", Key: "1" },
    { Value: "Nutritition", Key: "2" },
    { Value: "Activity", Key: "3" },
    { Value: "Personal", Key: "4" },
    { Value: "Doctor Query", Key: "5" }
  ];
  uploadedDocument = [];
  uploadedFileData = {
    FileName: "",
    Extension: "",
    GroupEntityId: 0,
    ConsumerId: 0
  };
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
  lmp: string;
  selectedTrimester: number;
  minDate: string;
  maxDate: string;
  showSelectedDate: string;
  isJournalEdit: boolean = false;
  healthJournalId: number;
  totalUploadedDocLength: number = 0;
  constructor(
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
    public navParams: NavParams,
    public iab: InAppBrowser
  ) {
    this.healthJournal.ProviderHealthPlanId = this.navParams.get("healthPlanId");
    this.healthJournal.ConsumerId = this.navParams.get("consumerId");
    this.isJournalEdit = this.navParams.get("status");
    this.healthJournalId = this.navParams.get("healthPlanJournalId");
    this.selectedTrimester = this.navParams.get("trimester");
    this.lmp = this.navParams.get("lmp");
    this.healthJournal.Category = this.planCategory[0].Key;
    this.calculateTrimesterDate();
   
  }
  ionViewDidEnter() {
    this.getLoggedonUserDetails();
  }
  getLoggedonUserDetails() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.healthJournal.ConsumerId = this.userId;
          if (this.isJournalEdit) {
            this.getHealthJournalDetails();
          }
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  getHealthJournalDetails() {
    this._dataContext.GetHealthJournalDetails(this.healthJournalId)
      .subscribe(response => {
        if (response) {
          this.healthJournal = response;
          this.showSelectedDate = moment(response.EntryDate).format('DD-MMM-YYYY');
          if (this.healthJournal.Document && this.healthJournal.Document.length > 0) {
            //It will store the uploaded  doc length, so that in furute any new doc to be added then it will skip to upload the existing one.
            this.totalUploadedDocLength = this.healthJournal.Document.length;
            this.healthJournal.Document.forEach(item => {
              this.downloadFilePreSignedURL(item, false);
            });
          }
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve. Please try again.", 0);
        });
  }
  calculateTrimesterDate() {
    if(!this.isJournalEdit){
      this.showSelectedDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      this.maxDate= moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      this.healthJournal.EntryDate=  moment().format('DD-MMM-YYYY');
    }
    if (this.selectedTrimester == 1) {
      this.minDate = moment(this.lmp).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      // this.maxDate = moment(this.lmp).add(3, "months").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }
    else if (this.selectedTrimester == 2) {
      this.minDate = moment(this.lmp).add(3, "months").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      // this.maxDate = moment(this.lmp).add(6, "months").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }
    else if (this.selectedTrimester == 3) {
      this.minDate = moment(this.lmp).add(6, "months").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      // this.maxDate = moment(this.lmp).add(9, "months").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }
  }
  saveHealthJournal() {
    this._dataContext.SaveHealthJournal(this.healthJournal)
      .subscribe(response => {
        if (response.Result.length > 0) {

        }
        else {

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
    //this.uploadedDocument.push({ 'File': "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADdcAAA3XAUIom3gAAAAHdElNRQfiBAUNKjuDvvCEAAAI0UlEQVRo3rWZf3BU1RXHP3d3k90QlACykR9awWEqIWCrAopNVVAWiThjKVJbKf6oUdREULJ5G8bhMWp2N1ARHRX8UUHGiTaiKGq7lSrIAI6UKjKAP0ZASAkEnaAmsCH73ukfuzH7M/s24vlr77nnnO/3nfPufefeVeQs1SMd02U0buUWN26gRbVICy1qd2T9ki9zjaZyMfZeqm5Q13NBnEqSYnwmb8rr9R/+DAR8JbKUawE4wjuySZpVi70l/xicGmS4xa0GqyuYxtkA/EMt8O85jQQeOCtvMRU4+EY9Zayv34Fkiua92D5d7uYsIjzTueiv35wWAjUXqhDFnOIJeSj4nQX7fupBKsnnqHiCO38ygZqJvK2K+Jdx95KvrCUVoPp8+1NMkeOUB7f2bGnreVqbot5VRaxxlecCD0u+cpWzRhWpd7UpPyEDtWPN7eTzeGBexqoniPea/e81Gt2xtceo4pRtQt0nvcrATLs8Tz7LA/dZg9fm20Ij6uIUEriP5eSbqyryekXg/PvlEj5vr7ECXpFX8xyPopS35sZ4fXsNn3PhgIWZPTOWoHqkfScudYV/s4VnP48XKeN7WatupV0uC+7qnvOVySYiMi7TesiUAWV/jgK1Ijt8RZ7mYzdlbLKPDd7GMxSqdVr/7nn/ZrWCPLV6pj0nAjXX81uanFrP4LpNu2HATuqwq2rXpEe+Blcl2xihGvS4uE6NJi4ckWE1ZCCgbgWp07/vAbyvryr8Ja8xik9lnH+pbgLop2wzaBZPxyNxlt9LHajbMyClU/oGyf8wGRxoTe+08ByjUu5QRcButcy5Rj+V4H2ZbCSfGwONXRqtP82ozqHptua0GTD/SJ6sTwev9/Fd72sw9lGtilRIpgZK/c8nwoN/m7oXeKG2tEsTaJX15OfNtlwCNQdsq5Ofumau9nb4W3lD/oAhz0upf2owlD5D/mfVSgol7mW0rQZus1iC2lJzF0ddw/QIgJ7fcbGUM52xABhsU290vri0hR5Fzw+/z0T+6SqPvRuOcBPF8qvUxZgmA+aVoNZF4SFcK1tZyFjaWCtzOs8OlPmXZoMH/ZQxg8NMPXlnbBxR60CVWSvBBJDEnuY9mdp+VuD3wRetfOGjsuSIPAmquGssH4K6LNXOkcZ3PMj2eIW8m6naPYqZEGO7wkxDICUDWn9G0lawtxeAPUrBXtrU8OqzsxKQ8Sh26Ka1sNZFN9kBjvFZCaixwH9PNzxEo5rDs2dgCKiDVmNqV2pXWrVVB4EhydqUl1ANBvOI5ad6H8utvXlEoVIIpC7DwWBrjstIK9gKLBOKD10Q9f5x3Awy1BIBIz4DXwCDekOAQTHvmBhHsJIBNRA6j8Ul7gsQd2/wxR317pLOY6BSHiX1JTShX6R7fOAAnYzqCUgLa8+mnRhF54ED3cN+kWj0LAQw4ERcF9xosI+S2mLSyzuAM91+WltMCfvimvRoVCPZLtU1An0S2/DP+KU5iYZ0+IHyTHkxJwGfxWv6SBgiyXapGYhAWwIB9TeQDA1VZpHbo57d0iZYImCAkVAp/3p2qsm1F+UCX3uRmsxO//qEwCZpSpA2A/0SSyDqYTAX50LAXAzq4cQTVT+LGYhAR2Giyvkae7lOq7AKr1VwHXudryVqOwotEzBS1/2rwDLvJVbgvZewLOaRIIY7HYHUVfAd2N3E+gHvELtHPOGrGQj0sW323eVfTY/imyMrcAEPhu/WNqiQEao/HJ2xuwVSLjhSCTSBWVzpLCwTj/IwJlbGPYQYwixZ5ZvgnJfciHeJnt/xmMwFXuEwHkqYJbNsaLskpELtm8UdjW6BgHqk8AX6KIBWok/RBFCzTS2VueGLah4qCOlJydQdJz3hB5lARBYElwN4h9k94uFqxqgxLCg8weF0BFI+pTWV6nHA4CNCZmj/9saEheMrk0aKgWO8wsccVAdBzuVcfs0sBgFH1czEA+1M+/BxNg8exmMHqQo+kYWAr8ycrUKuf+vHM9R4hdxJB840Ux041Ur/XRnKUxSeLB7bmuTzdkoJ/JvJfiMwz7bV9HCxuJUbpEW1sMMWMifydGYX/ThrWZuqd9ArqfuUT5N12sTeRLLlZq5NlenAzQtSdooFbm4Gme6bllvEHO6K5w9wLuPPscEhdZN/S/ec73Jp4JzY4KXOedZPUJYJaDN4kmKgQ26gWl0FbKBR9oC6gJlMAXmfJep1nMAxqQq+fBoJ1JaaOjNig/sDy1Da/Swm/ovRzqLAo4g2n0djmrdsi+osnC+yEFhQ6JjFHVwKnCAfB+8Fro5+47xn2G+UiYwA9qmtxt/rf4jG0zYwiQgdFAI71Epng97WSwJ6346Fcg9nAMdktdrPk3JcxtQ30aN4h6ldqoi5jIhd4vwgT8vDMXq5ENBuYglDEbVBnnW9ccJp28MwdUu2TxGAb46sosksMU3HbKoYBRyl1rUq/XkzLQH9zHAD04APzAfq/wOgPcZ96iP/pZYubZXvQxnP8sA8AO81tvlcC3ygfuf/1hKBhb8w3qKUb7kj8HpXWm37ccjl2a7eu6RmotpCxBzeVS5tplohA9RXRnn958m2KRuRd4ixhVKa5YoueLDfg4MGq/AQ3EoDDvs9XeNAoyplo5xv26KNyEJAd9nWMZSvjbLg7i7d/AIqOClZbk0TRTROUjH/xzNlXbOrnC0M5E3vGT0S6PAxji/M38T/PeGcLQPk5aDlIztA8KC8LAOccTeD+gkpl08YbVvUAwG9r1SCuiVpqVWBfU0u8BDzqEog9Z3tTwh3xl9lJxHouIv+vO3fFq+rncxoDtVtzJVA3UYOMbp2crzOv4dX6cu9GQnIX0A9lBjIvArUS9b+M0kQUS9FvRPgAiC3ZiBQ6WQk7c7tSYFKQDblDE/MqyQpLx/Tps6rjOun4ggMLMBGW/J+JWeCaqUXolqj3onhaEcNjLtxydqQqEMg43qVgXFR7yzxu3/qReFWoCPJwoEdI/VEY0HSezrB1b+75U3tCdP1u3Yy/OOTVbJ6/h/4UjmAATiFSAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOC0wNC0wNVQxMzo0Mjo1OSswMjowMLOTBAAAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTgtMDQtMDVUMTM6NDI6NTkrMDI6MDDCzry8AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg==", DocumentType: value == "report" ? this.report : this.prescription, 'FileName': "user.jpg", 'FileExtension': ".jpg", "Size": "30KB" });
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
                  this.uploadedDocument.push({ 'File': reader.result, TempFile: path, fileUrlPath: reader.result, DocumentType: "document", 'FileName': file_name, FileUrl: path, 'FileExtension': resFile.type });
                 // this.uploadedDocument.reverse();
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
                  this.uploadedDocument.push({ 'File': reader.result, TempFile: path, fileUrlPath: reader.result, DocumentType: "document", 'FileName': file_name, 'FileExtension': resFile.type });
                 // this.uploadedDocument.reverse();

                }
              }
            ]
          });
          alert.present();
        }
        else {
          this.commonService.onMessageHandler("Sorry! you can upload only .pdf, .png, .jpg, .jpeg files only.", 0);
        }
        //  }
      })
    })
  }
  saveHealthJournalDetails() {
    // if (this.healthJournal.Name != "" && this.healthJournal.Name != undefined) {
    if (this.healthJournal.EntryDate != "" && this.healthJournal.EntryDate != undefined) {
      // if (this.healthJournal.Note != "" && this.healthJournal.Note != undefined) {
      this.uploadConsumerDocumentRecord();
      // }
      // else {
      //   this.commonService.onMessageHandler("Please leave a message", 0);
      // }
    }
    else {
      this.commonService.onMessageHandler("Please selecte a date", 0);
    }
    // }
    // else {
    //   this.commonService.onMessageHandler("Please enter journal title", 0);
    // }
  }
  uploadConsumerDocumentRecord() {
    if (this.uploadedDocument.length > this.totalUploadedDocLength) {
      let i = 0;
      let loading = this.loadingCtrl.create({
        content: 'Uploading...'
      });
      loading.present();
     this.uploadedDocument.forEach((element,index) => {
       if(index >= this.totalUploadedDocLength){
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
                this.healthJournal.Document.push(
                  {
                    Description: "",
                    FileName: element.FileName,
                    FilePath: response.result
                  });
                
                if (i === (this.uploadedDocument.length-this.totalUploadedDocLength)) {
                  loading.dismiss().catch(() => { });
                  this.saveConsumerHealthPlanLineItemResponse();
                  // this.datacontext.post('/Kare4uRCWidget/UploadDigitalDocumentsForMobile', this.totalUploadedDocList)
                }
              }, (err) => {
                loading.dismiss().catch(() => { });
                this.commonService.onMessageHandler("Failed to upload. Please contact support.", 0);
              })
          },

            error => {
              this.commonService.onMessageHandler("Failed to upload. Please contact support.", 0);
            });
  
      }
    });
    }
    else {
      // this.commonService.onMessageHandler("You haven't attach any file.", 0);
      this.saveConsumerHealthPlanLineItemResponse();
    }
  }
  saveConsumerHealthPlanLineItemResponse() {
    this._dataContext.SaveHealthJournal(this.healthJournal)
      .subscribe(response => {
        this.healthJournal.Note = "";
        this.healthJournal.DoctorQuery = "";
        this.healthJournal.Name = "";
        this.healthJournal.ConsumerId = 0;
        this.healthJournal.Document = [];
        this.healthJournal.Category = this.planCategory[0].Key;
        this.viewCtrl.dismiss(true);
        this.commonService.onEventSuccessOrFailure("Successfully uploaded health journal details");
      },
        error => {
          // this.viewCtrl.dismiss(false);
          this.commonService.onMessageHandler("Failed to save. Please contact support.", 0);
          this.commonService.onEventSuccessOrFailure("Upload failed");
        });
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
        this.uploadedDocument.push({ fileUrlPath: response.result, DocumentTypeName: data.DocumentTypeName, DocumentType: data.DocumentType, 'FileName': data.FileName, FileUrl: data.DocumentPath, 'FileExtension': fileExtension });
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
        this.uploadedDocument.push({ fileUrlPath: response.result, DocumentTypeName: data.DocumentTypeName, DocumentType: data.DocumentType, 'FileName': data.FileName, FileUrl: data.DocumentPath, 'FileExtension': fileExtension });
      },
        error => {
          this.commonService.onMessageHandler("Failed to retrive. Please try againg.", 0);
        });
  }
  getOptionToViewOrDelete(data, index) {
    //   if (this.action == "Add") {
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
    // }
    // else {
    //   this.openSeletedFile(data, false);
    // }
  }
  deleteSelectedFile(data, index) {
    //It will check, if the uploaded doc will delete, then it will decrease the length of that list
    if (index < this.totalUploadedDocLength)
      this.totalUploadedDocLength--;
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
    // if (this.action == 'Add') {
    let imageFile = "";
    //This will show images on modal if it will be edited by user, otherwise it will show device gallery
    if (this.isJournalEdit && !item.TempFile) {
      if (item.FileName.indexOf("jpeg") >= 0 || item.FileName.indexOf("jpg") >= 0 || item.FileName.indexOf("png") >= 0) {
        this.openImagePath = item;
        let modal2 = document.getElementById('openEditImage');
        modal2.style.display = "block";
        this.isImageModalOpened = true;
      }
      else {
        this.isImageModalOpened = false;
        window.open(item.fileUrlPath, '_system');
      }
    }
    else {
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
    // }
    // else {
    //   this.openSeletedFile(item, false);
    // }

  }
  closeUploadModal() {
    this.viewCtrl.dismiss(true);
  }
  onSelectedDate() {
    this.healthJournal.EntryDate = moment(this.showSelectedDate).format('DD-MMM-YYYY');
  }
}
