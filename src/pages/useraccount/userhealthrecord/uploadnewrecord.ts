import { Component, ViewChild } from '@angular/core';
import { NavController, IonicPage, NavParams, ViewController, AlertController, ActionSheetController } from 'ionic-angular';
import { FileChooser } from '@ionic-native/file-chooser';
import { Camera, CameraOptions } from '@ionic-native/camera';
// import { SocialSharing } from '@ionic-native/social-sharing';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
@IonicPage()
@Component({
  selector: 'page-uploadnewrecord',
  templateUrl: 'uploadnewrecord.html',
  providers: [File, FileChooser, Camera, FileTransfer]
})
export class UploadNewRecord {
  @ViewChild('myinput') input;
  uploadedDocumentDetails = {
    Description: "",
    DocumentFor: 0,
    DocumentType: 0,
    DocumentPath: "",
    ConsumerId: 0,
    FileName: "",
    DocumentSize: "",
    CreatedDate: ""
  };
  uploadedDocument = [];
  documentsFor: any = [];
  totalFileCount: number = 0;
  viewStatus: boolean = false;
  userId: string;
  userName: string;
  userDetails: any = [];
  constructor(public navParams: NavParams, public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, private camera: Camera, public fileChooser: FileChooser, private transfer: FileTransfer, private file: File, public _dataContext: DataContext, private commonService: CommonServices, private viewCtrl: ViewController) {
    this.userDetails = navParams.get('userDetails');
    this.getLoggedonUserDetails();
  }
  ionViewWillEnter() {
    this.uploadedDocumentDetails.DocumentFor = this.userDetails.Value;
  }
  getLoggedonUserDetails() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.getFamilyList();
          this.userId = result.ConsumerID;
          this.userName = result.FirstName;
          this.getFamilyList();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  chooseDocFromCamera() {
    this.viewStatus = false;
    var imageList: any = [];
    const cameraOptions: CameraOptions = {
      quality: 100, // picture quality
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      targetWidth: 2000,
      targetHeight: 2000
    }
    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.readimage(imageData);
    });

  }
  viewFiles() {
    this.viewStatus = !this.viewStatus;
  }
  readimage(path) {
    (<any>window).resolveLocalFileSystemURL(path, (res) => {
      res.file((resFile) => {
        var reader = new FileReader();
        reader.readAsDataURL(resFile);
        reader.onloadend = (evt: any) => {
          let selectedFile = this.dataURItoBlob(reader.result, resFile.type);
          let file_name: string;
          if (resFile.type.indexOf("jpg") >= 0 || resFile.type.indexOf("jpeg") >= 0 || resFile.type.indexOf("png") >= 0 || resFile.type.indexOf("pdf") >= 0) {
            let alert = this.alertCtrl.create({
              title:"File Name",
              message: 'Do you want to give a file name or it will take the default name?',
              inputs: [
                {
                  name: 'fileName',
                  placeholder: 'ex: my_document'
                },
              ],
              buttons: [
                {
                  text: 'Default',
                  role: 'cancel',
                  handler: data => {
                    file_name = resFile.name;
                    this.totalFileCount++;
                    this.uploadedDocument.push({ 'File': reader.result, 'FileName': file_name, 'FileExtension': resFile.type, "Size": (selectedFile.size / 1024).toFixed(2) + "KB" });
                    this.uploadedDocument.reverse();
                  }
                },
                {
                  text: 'Submit',
                  handler: data => {
                    let extension = resFile.type.substring(resFile.type.indexOf("/") + 1, resFile.type.length);
                    if (data) {
                      file_name = data.fileName + "." + extension;
                    }
                    else {
                      file_name = resFile.name;
                    }
                    this.totalFileCount++;
                    this.uploadedDocument.push({ 'File': reader.result, 'FileName': file_name, 'FileExtension': resFile.type, "Size": (selectedFile.size / 1024).toFixed(2) + "KB" });
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
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose File',
      buttons: [
        {
          text: 'Camera',
          icon: "camera",
          cssClass: 'icon-btn-color',
          handler: () => {
            this.chooseDocFromCamera();
          }
        },
        {
          text: 'Document',
          icon: "document",
          handler: () => {
            this.chooseDocFromGallery();
          }
        },
      ]
    });
    actionSheet.present();
  }
  deletePhoto(index) {
    let confirm = this.alertCtrl.create({
      title:"Delete",
      subTitle: 'Do you want to delete this photo?',
      message: '',
      buttons: [
        {
          text: 'No',
          handler: () => {

          }
        }, {
          text: 'Yes',
          handler: () => {
            this.uploadedDocument.splice(index, 1);
            this.totalFileCount = this.uploadedDocument.length;
          }
        }
      ]
    });
    confirm.present();
  }
  //Get Family list
  getFamilyList() {
    if (this.documentsFor.length == 0) {
      this._dataContext.GetFamilyListForDropDown()
        .subscribe(response => {
          if (response.length > 0) {
            this.documentsFor = response;
            this.documentsFor.filter((item) => { item.DisplayText = item.DisplayText.substr(0, item.DisplayText.indexOf('(')); })
          }
          this.documentsFor.push({ DisplayText: this.userName, Value: this.userId, Relation: "Self", RelationId: 0 });
          this.documentsFor.reverse();
        },
          error => {
            console.log(error);
            this.commonService.onMessageHandler("Failed to retrieve family details. Please try again.", 0);
          });
    }
  }
  //Close modal
  closeModal() {
    this.viewCtrl.dismiss(false);
  }
  uploadConsumerDocumentRecord() {
    if (this.uploadedDocument.length > 0) {
      let data={
        userData:this.uploadedDocumentDetails,
        uploadedDoc:this.uploadedDocument
      }
      this.viewCtrl.dismiss(data);
    }
    else {
      this.commonService.onMessageHandler("Please select your health record to upload.", 0);
    }
  }


}
