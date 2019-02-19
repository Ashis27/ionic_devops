import { Component, NgZone } from "@angular/core"
import { NavController, ActionSheetController, NavParams, ViewController, ModalController, LoadingController, ToastController, PopoverController, App, AlertController, IonicPage } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { FileChooser } from '@ionic-native/file-chooser';
import { Camera, CameraOptions } from '@ionic-native/camera';
// import { SocialSharing } from '@ionic-native/social-sharing';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import moment from 'moment';
import { FileOpener } from '@ionic-native/file-opener';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CacheService } from "ionic-cache";
import { RoundProgressModule } from 'angular-svg-round-progressbar';
//pages
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { CommonServices } from "../../../providers/common.service";
import { DataContext } from "../../../providers/dataContext.service";


@IonicPage()
@Component({
    selector: 'page-myhealthrecord',
    templateUrl: 'myhealthrecord.html',
    providers: [File, FileChooser, Camera, FileTransfer, FileOpener, SocialSharing]
})
export class MyHealthRecord {
    loading: any;
    tapOption = [];
    documentsBySelf = [];
    documentsBySelfList = [];
    optionObj: number = 0;
    healthRecordStatus: string;
    pageNum: number = 0;
    itemsPerPage: number = 10;
    healthrecordAvailableStatus: boolean = false;
    documentsFor = [];
    documentsType = [];
    imageData: any;
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
    uploadedFileData = {
        FileName: "",
        Extension: "",
        GroupEntityId: 0,
        ConsumerId: 0
    };
    formData: FormData = new FormData();
    fileList: FileList;
    base64Image: any;
    base64ImageStatus: boolean = false;
    uploadedDocument = [];
    userId: any;
    fileName: any;
    groupEntityId: number;
    parentGroupEntityId: number;
    imageExtension: any;
    totalUploadedDocList = [];
    viewStatus: boolean = false;
    totalFileCount: number = 0;
    nativepath: any;
    workoutProgress: string = '0 %';
    maxDate: string;
    showFromSelectedDate: string;
    showToSelectedDate: string;
    showFromDate: string;
    showToDate: string;
    downloadProgress: any;
    userDetails: any;
    uniqueKey: string;
    alert: any;
    pendingRequests: number = 0;
    interval_time: number = 300;
    countProgress: number = 0;
    loader: any;
    tabValue: string;
    masterLoginStatus: any = { loginStatus: false, userName: "", userDetails: [] };
    searchName: string;
    searchDate: string;
    uniqueKeyForPast: string;
    keyForPast: string;
    filterValue = [
        { "Value": "All", "Key": "All" },
        { "Value": "Last Week", "Key": "Week" },
        { "Value": "Last Month", "Key": "1" },
        { "Value": "Last 3 Months", "Key": "3" },
        { "Value": "Last 6 Months", "Key": "6" },
        { "Value": "Last 9 Months", "Key": "9" },
        { "Value": "Last 1 year", "Key": "12" },
    ];
    selectedDate: string = "";
    filterStatus: boolean = false;
    key: string;
    docKey: string;
    totalItem = 1000;
    loadStatus: boolean = true;
    max: number;
    current: number;
    show_color: string;
    docSizeKey: string;
    constructor(private modalCtrl: ModalController, public _zone: NgZone, public commonService: CommonServices, private cache: CacheService, public socialSharing: SocialSharing, private fileOpener: FileOpener, private transfer: FileTransfer, private file: File, private sanitizer: DomSanitizer, public actionSheetCtrl: ActionSheetController, private camera: Camera, public fileChooser: FileChooser, public appCtrl: App, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, public viewCtrl: ViewController, public loadingCtrl: LoadingController, public _dataContext: DataContext) {
        this.userDetails = navParams.get('userDetails');
        this.getLoggedInUserDetailsFromCache();
    }
    //Entry Point
    ionViewDidEnter() {
        this.max = 100;
        this.show_color = "rgb(124, 187, 131)";
        this.selectedDate = moment().format('DD-MMM-YYYY');
        this.searchDate = this.filterValue[0].Value;
        this.maxDate = new Date().toISOString();
        this.showFromSelectedDate = new Date().toISOString();
        this.showToSelectedDate = new Date().toISOString();
        this.showFromDate = moment(this.showFromSelectedDate).format('DD-MMM-YYYY');
        this.showToDate = moment(this.showToSelectedDate).format('DD-MMM-YYYY');
        this.tapOption[0] = "Uploded By Self";
        this.tapOption[1] = "Uploaded By Doc/Lab";
        this.tabValue = "uploadedRec-" + this.optionObj;
    }
    //Get Logged In user details from cache, if not available then get from server.
    getLoggedInUserDetailsFromCache() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getLoggedInUserDetails"))
            .then((result) => {
                if (result.loginStatus) {
                    this.userId = result.consumerId;
                    this.getHealthRecordUploadedByUserFromCache();
                    this.healthRecordStatus = 'recordDetails';
                }
                else {
                    this.navCtrl.setRoot("LoginPage");
                }
            });
    }
    //Get Records from cache uploaded by user
    getHealthRecordUploadedByUserFromCache() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUploadedHealthRecordByUser")).then(data => {
            if (data) {
                this.getAnimation();
                this.documentsBySelf = data;
                this.documentsBySelfList = data;
                this.totalItem = data.length;
                this.documentsBySelf.filter(item => {
                    item["file_extension"] = item.FileName.substring(item.FileName.lastIndexOf(".") + 1, item.FileName.length);
                    item["downloadStatus"] = false;
                    item["pre_download_status"] = false;
                });
                this.healthrecordAvailableStatus = false;
                this.retriveConsumerDigitalDocuments(0, false);
            }
            else {
                // fall here if item is expired or doesn't exist 
                this.retriveConsumerDigitalDocuments(1, false);
            }
        }).catch(error => {

        })
    }
    //Get User Health records
    retriveConsumerDigitalDocuments(value, refresher) {
        this.totalItem = 0;
        this._dataContext.GetConsumerDigitalDocuments(value, this.pageNum, this.itemsPerPage, this.tapOption[this.optionObj], this.userDetails.Value)
            .subscribe(response => {
                if (response.ConsumerDocuments.rows.length > 0) {
                    this.getAllDocSize();
                    this.documentsBySelf = response.ConsumerDocuments.rows;
                    this.documentsBySelfList = response.ConsumerDocuments.rows;
                    this.healthrecordAvailableStatus = false;
                    this.totalItem = response.ConsumerDocuments.TotalRows;
                    this.documentsBySelf.filter(item => {
                        item["file_extension"] = item.FileName.substring(item.FileName.lastIndexOf(".") + 1, item.FileName.length);
                        item["downloadStatus"] = false;
                        item["pre_download_status"] = false;
                    });
                }
                else {
                    this.healthrecordAvailableStatus = true;
                    this.documentsBySelf = [];
                    this.documentsBySelfList = [];
                }
                if (refresher) {
                    refresher.complete();
                }
                this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUploadedHealthRecordByUser"), response.ConsumerDocuments.rows);
            },
                error => {
                    this.commonService.onMessageHandler("Failed to retrive. Please try again.", 0);
                });

    }
    //Get User Health records from cache uploaded by doc/Lab
    getHealthRecordUploadedByDocFromCache() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUploadedHealthRecordByDoc")).then(data => {
            if (data != "" && data != undefined && data.length > 0) {
                this.documentsBySelf = data;
                this.documentsBySelfList = data;
                this.getAnimation();
                this.healthrecordAvailableStatus = false;
                this.totalItem = data.length;
                this.retriveConsumerDigitalDocumentsByDoc(0, false);
            }
            else {
                this.healthrecordAvailableStatus = false;
                this.retriveConsumerDigitalDocumentsByDoc(1, false);
            }

        }).catch(error => {

        })
    }
    //Get User Health records uploaded by doc/Lab
    retriveConsumerDigitalDocumentsByDoc(value, refresher) {
        this._dataContext.GetConsumerDigitalDocumentsUploadedByDoc(value, this.pageNum, this.itemsPerPage, this.tapOption[this.optionObj], this.userDetails.Value)
            .subscribe(response => {
                if (response.ConsumerDocuments.rows.length > 0) {
                    this.documentsBySelf = response.ConsumerDocuments.rows;
                    this.documentsBySelfList = response.ConsumerDocuments.rows;
                    this.healthrecordAvailableStatus = false;
                    this.documentsBySelf.filter(item => {
                        item["file_extension"] = item.FileName.substring(item.FileName.lastIndexOf(".") + 1, item.FileName.length);
                        item["downloadStatus"] = false;
                        item["pre_download_status"] = false;
                    });
                }
                else {
                    this.healthrecordAvailableStatus = true;
                    this.documentsBySelf = [];
                    this.documentsBySelfList = [];
                }
                if (refresher) {
                    refresher.complete();
                }
                this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUploadedHealthRecordByDoc"), response.ConsumerDocuments.rows);

            },
                error => {
                    this.commonService.onMessageHandler("Failed to retrive. Please try again.", 0);
                });
    }
    // //Get user All Uploaded document Size from cache
    getAllDocSize() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getConsumerUploadedDocSize")).then((data) => {
            if (data) {
                this.current = data;
                this.getCurrentUserFolderSize(0);
            }
            else {
                this.healthrecordAvailableStatus = false;
                this.getCurrentUserFolderSize(1);
            }
        });
    }
    //Get user All Uploaded document Size
    getCurrentUserFolderSize(value) {
        this._dataContext.GetCurrentFolderSize(value, this.userDetails.Valuee)
            .subscribe(response => {
                if (response.status) {
                    this.current = response.result;
                    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getConsumerUploadedDocSize"), response.result)
                }
                else {
                    this.commonService.onMessageHandler("Failed to retrive uploaded document size. Please try again.", 0);
                }
            },
                error => {
                    this.commonService.onMessageHandler("Failed to retrive uploaded document size. Please try again.", 0);
                });

    }
    //Get Animation for 1st time while entering the page
    getAnimation() {
        this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getHealthRecAnimationStatus")).then(result => {
            if (result) {
                $(".animated").removeClass("slideInUp");
            }
            else {
                this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getHealthRecAnimationStatus"), this.loadStatus);
                $(".animated").addClass("slideInUp");
            }
        }).catch(error => { })
    }


    //While Tab change
    tabSelection(event, value) {
        if (value == 'Uploded By Self') {
            this.optionObj = 0;
            this.tabValue = "uploadedRec-" + this.optionObj;
            this.getHealthRecordUploadedByUserFromCache();
        }
        else {
            this.optionObj = 1;
            this.tabValue = "uploadedRec-" + this.optionObj;
            this.getHealthRecordUploadedByDocFromCache();
        }
        this.healthRecordStatus = 'recordDetails';
    }

    closeUploadNewDocument() {
        this.healthRecordStatus = 'recordDetails';
    }
    dismiss() {
        this.viewCtrl.dismiss();
    }
    backToDashboard() {
        // this.viewCtrl.dismiss();
        this.appCtrl.getRootNav().push("DashBoard");
    }
    recordDetails(myEvent) {
        const actionSheet = this.actionSheetCtrl.create({
            title: myEvent.FileName,
            buttons: [
                {
                    icon: "open",
                    text: 'Open',
                    handler: () => {
                        this.openSeletedFile(myEvent, false);
                    }
                },
                {
                    icon: "download",
                    text: 'Download',
                    handler: () => {
                        this.downloadFilePreSignedURL(myEvent, false);
                    }
                },
                {
                    icon: "share",
                    text: 'Share',
                    handler: () => {
                        this.shareFile(myEvent);
                    }
                },
                {
                    icon: "trash",
                    text: 'Delete',
                    handler: () => {
                        this.deleteConsumerDocumentFile(myEvent);
                    }
                },
                {
                    icon: "close",
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });

        actionSheet.present();
    }
    openSeletedFile(data, status) {
        let fileURL = "file:///storage/emulated/0/Download/" + this.commonService.getAppTitle() + "_" + data.ConsumerId + "/" + data.FileName; //this.file.externalDataDirectory + "testImage.png";
        this.file.checkFile("file:///storage/emulated/0/Download/" + this.commonService.getAppTitle() + "_" + data.ConsumerId + "/", data.FileName)
            .then(result => {
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
                this.fileOpener.open(fileURL, fileExtension)
                    .then(() => {
                        // this.pendingRequests = 0;

                        //this.viewCtrl.dismiss();
                        //  this.loading.dismiss();
                    })
                    .catch(e => {
                        this.loading.dismiss();
                        this.commonService.onMessageHandler(e.message, 0);
                    });


            }).catch(err => {
                this.alert = this.alertCtrl.create({
                    title:"Download",
                    message: 'Do you want to Download and Open?',
                    buttons: [
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            handler: () => {
                                // this.viewCtrl.dismiss();
                                // console.log('Cancel clicked');
                            }
                        },
                        {
                            text: 'Download',
                            role: 'cancel',
                            handler: () => {
                                this.downloadFilePreSignedURL(data, false);
                            }
                        }
                    ]
                });
                this.alert.present();
                //this.viewCtrl.dismiss();
            });
    }
    getDocumentDetails(data) {
        let alert = this.alertCtrl.create({
            subTitle: 'File Details',
            message: 'Name: ' + data.FileName + '<br\>' + 'Date: ' + data.CreatedDate + '<br\>' + 'Message: ' + data.Description + '<br\>' + 'Size: ' + data.DocumentSize,
            buttons: [
                {
                    text: 'Ok',
                    role: 'cancel',
                    handler: () => {
                        //this.viewCtrl.dismiss();
                    }
                }
            ]
        });
        alert.present();
    }
    deleteConsumerDocumentFile(data) {
        this.alert = this.alertCtrl.create({
            title:"Delete",
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
                        this.deleteRecord(data);
                    }
                }
            ]
        });
        this.alert.present();
    }
    //Delete useer record
    deleteRecord(data) {
        this._dataContext.DeleteHealthRecordUploadedByConsumer(data)
            .subscribe(response => {
                if (response.status) {
                    // this.getCurrentFolderSize();
                    this.retriveConsumerDigitalDocuments(1, false);
                }
                this.commonService.onMessageHandler(response.message, 1);
            },
                error => {
                    this.commonService.onMessageHandler("Failed to delete document. Please try again.", 0);
                });
    }
    //Download health record using Presigned url
    downloadFilePreSignedURL(data, status) {
        if (this.countProgress == 0) {
            data.pre_download_status = true;
            this._dataContext.DownloadHealthRecord(data.ConsumerId, data.FileName)
                .subscribe(response => {
                    let fileURL = "file:///storage/emulated/0/Download/" + this.commonService.getAppTitle() + "_" + data.ConsumerId + "/" + data.FileName; //this.file.externalDataDirectory + "testImage.png";
                    this.file.checkDir("file:///storage/emulated/0/Download/", this.commonService.getAppTitle() + '_' + data.ConsumerId)
                        .then(_ => {
                            this.file.checkFile(fileURL, data.FileName).then(result => {
                                this.openSeletedFile(data, false);
                            }).catch(error => {
                                this.downloadDocument(response, data, status);
                            })
                        })
                        .catch(err => {
                            this.file.createDir("file:///storage/emulated/0/Download/", this.commonService.getAppTitle() + '_' + data.ConsumerId, true)
                                .then(_ => {
                                    this.downloadDocument(response, data, status);
                                })
                                .catch(err => {
                                    console.log('Failed to create directory.');
                                });
                        });
                },
                    error => {
                        this.commonService.onMessageHandler("Failed to retrive. Please try againg.", 0);
                    });
        }
        else {
            this.commonService.onMessageHandler("Download in progress. Please wait.", 0);
        }
    }
    getProgressBar(perc) {
        let html: string = '<div class="progress-outer"><div class="progress-inner" style="width:' + perc + '%">' + perc + '%' + '</div></div>';
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    startLoading() {
        this.loader = this.loadingCtrl.create({
            spinner: 'hide',
            cssClass: 'loader-change'
        });
        this.loader.present();
    }

    downloadDocument(response, data, status) {
        const fileTransfer: FileTransferObject = this.transfer.create();
        let fileURL = "file:///storage/emulated/0/Download/" + this.commonService.getAppTitle() + "_" + data.ConsumerId + "/" + data.FileName; //this.file.externalDataDirectory + "testImage.png";
        //this.startLoading();
        // this.pendingRequests++;
        // $(".download_" + data.Id).css({"display": "block"});
        data.pre_download_status = true;
        data.downloadStatus = true;
        fileTransfer.download(response.result, fileURL)
            .then((entry) => {
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
                this.fileOpener.open(fileURL, fileExtension)
                    .then(() => {
                        this.commonService.onMessageHandler('File downloaded successfully.' + '<br\>' + 'Download path: ' + fileURL, 1);
                        if (status) {
                            this.shareFile(data);
                        }
                        //this.viewCtrl.dismiss();
                        //  this.loading.dismiss();
                    })
                    .catch(e => {
                        this.commonService.onMessageHandler(e.message, 0);
                    });

            }, (error) => {
                if (error.http_status == 403) {
                    this.commonService.onMessageHandler("Request has expaired to access the file", 0);
                    data.pre_download_status = false;
                    data.downloadStatus = false;

                }
                else {
                    this.commonService.onMessageHandler("Failed to Download.Plesae try again", 0);
                }
                data.pre_download_status = false;
                data.downloadStatus = false;
                // this.loading.dismiss();
                //this.viewCtrl.dismiss();
            });
        fileTransfer.onProgress((e) => {
            this._zone.run(() => {
                this.countProgress = (e.lengthComputable) ? Math.floor(e.loaded / e.total * 100) : -1;
                data.pre_download_status = false;
                // this.loader.data.content = this.getProgressBar(this.countProgress);
                if (this.countProgress == 100) {
                    data.downloadStatus = false;
                    this.countProgress = 0;
                    //this.loader.dismiss();
                }
            });
        });

    }
    shareFile(data) {
        this.file.checkFile("file:///storage/emulated/0/Download/" + this.commonService.getAppTitle() + "_" + data.ConsumerId + "/", data.FileName).then(result => {
            this.socialSharing.share('', '', "file:///storage/emulated/0/Download/" + this.commonService.getAppTitle() + "_" + data.ConsumerId + "/" + data.FileName, null)
                .then(function (result) {
                    console.log(result);
                }, function (err) {
                    // An error occurred. Show a message to the user
                });
        })
            .catch(err => {
                this.alert = this.alertCtrl.create({
                    title:"Download",
                    message: 'Do you want to Download and Share ?',
                    buttons: [
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            handler: () => {
                                // this.viewCtrl.dismiss();
                                // console.log('Cancel clicked');
                            }
                        },
                        {
                            text: 'Download',
                            role: 'cancel',
                            handler: () => {
                                this.downloadFilePreSignedURL(data, true);
                            }
                        }
                    ]
                });
                this.alert.present();
                //this.viewCtrl.dismiss();
            });
        //this.viewCtrl.dismiss();

    }
    filterDateAppo(item) {
        this.selectedDate = "";
        if (item == "All") {
            this.selectedDate = moment().format('DD-MMM-YYYY');
        }
        else if (item == "Week") {
            this.selectedDate = moment().subtract(7, 'days').format('DD-MMM-YYYY');
        }
        else {
            this.selectedDate = moment().subtract(item, 'months').format('DD-MMM-YYYY');
        }
        this.getFilterDate();
    }
    getFilterDate() {
        let term = this.searchName;
        if (term && term.trim() != '') {
            this.documentsBySelf = this.documentsBySelfList.filter((item) => {
                if (moment(this.selectedDate).isSame(moment().format('DD-MMM-YYYY'))) {
                    return (item.ConsumerName.toLowerCase().indexOf(term.toLowerCase()) > -1);
                }
                else {
                    return (item.ConsumerName.toLowerCase().indexOf(term.toLowerCase()) > -1 && moment(item.CreatedDate).isSameOrAfter(this.selectedDate, 'day'));
                }
            })
            if (this.documentsBySelf.length == 0) {
                this.healthrecordAvailableStatus = true;
            }
            else {
                this.healthrecordAvailableStatus = false;
            }
        }
        else {
            this.healthrecordAvailableStatus = true;
            this.documentsBySelf = this.documentsBySelfList.filter((item) => {
                if (moment(this.selectedDate).isSame(moment().format('DD-MMM-YYYY'))) {
                    return item;
                }
                else {
                    return (moment(item.CreatedDate).isSameOrAfter(this.selectedDate, 'day'));
                }
            })
        }
    }
    getFilterAppoNameSearch(event) {
        let term = event.value;
        if (term && term.trim() != '') {
            this.documentsBySelf = this.documentsBySelfList.filter((item) => {
                if (moment(this.selectedDate).isSame(moment().format('DD-MMM-YYYY'))) {
                    return (item.FileName.toLowerCase().indexOf(term.toLowerCase()) > -1);
                }
                else {
                    return (item.FileName.toLowerCase().indexOf(term.toLowerCase()) > -1 && moment(item.CreatedDate).isSameOrAfter(this.selectedDate, 'day'));
                }
            })
            if (this.documentsBySelf.length == 0) {
                this.healthrecordAvailableStatus = true;
            }
            else {
                this.healthrecordAvailableStatus = false;
            }
        }
        else {
            this.healthrecordAvailableStatus = true;
            this.documentsBySelf = this.documentsBySelfList;
        }

    }
    getCurrentValue(event) {
        if (event >= 80) {
            this.show_color = "rgb(210, 117, 122)";
        }
    }
    filterAppointment() {
        this.filterStatus = !this.filterStatus;
    }
    viewAllRecords() {
        this.healthRecordStatus = 'recordDetails';
    }
    redirectToMenu(value, event) {
        // $(".footer-image-sec").removeClass("active-section").addClass("footer-back");
        // $(event.currentTarget).removeClass("footer-back").addClass("active-section");
        if (value == "DashBoard") {
            this.navCtrl.setRoot("DashBoard");
        }
    }
    uploadNewDocument() {
        let addModal = this.modalCtrl.create("UploadNewRecord", { selectedUser: this.userDetails });
        addModal.onDidDismiss(item => {
            if (item) {
                this.uploadConsumerDocumentRecord(item.userData, item.uploadedDoc);
            }
        })
        addModal.present();
    }
    uploadConsumerDocumentRecord(data, doc) {
        this.uploadedDocument = doc;
        this.documentsBySelf.reverse();
        this.uploadedDocument.forEach(file_details => {
            this.documentsBySelf.push({
                ConsumerId: this.userDetails.Value,
                FileName: file_details.FileName,
                DocumentSize: file_details.Size,
                CreatedDate: "Uploading...",
            });
        });
        this.documentsBySelf.reverse();
        this.healthRecordStatus = 'recordDetails';
        this.uploadedFileData.GroupEntityId = this.groupEntityId;
        this.uploadedFileData.ConsumerId = this.userDetails.Value;
        let i = 0;
        this.uploadedDocument.forEach(element => {
            let headers = new Headers({ 'Content-Type': element.FileExtension });
            let options = new RequestOptions({ headers: headers });
            this.uploadedFileData.Extension = element.FileExtension;
            this.uploadedFileData.FileName = element.FileName;
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
                    console.log(options);
                    console.log(element.FileName);
                    fileTransfer.upload(element.File, response.result, options)
                        .then((data) => {
                            i++;
                            this.totalUploadedDocList.push({
                                Description: this.uploadedDocumentDetails.Description,
                                DocumentFor: this.uploadedDocumentDetails.DocumentFor,
                                DocumentType: this.uploadedDocumentDetails.DocumentType,
                                ConsumerId: this.userDetails.Value,
                                FileName: element.FileName,
                                DocumentSize: element.Size,
                                DocumentPath: response.result
                            });
                            if (i === this.uploadedDocument.length) {
                                console.log(this.totalUploadedDocList);
                                this.uploadNewRecord(this.totalUploadedDocList);
                                // this.datacontext.post('/Kare4uRCWidget/UploadDigitalDocumentsForMobile', this.totalUploadedDocList)
                            }
                        }, (err) => {
                            this.retriveConsumerDigitalDocuments(0, false);
                            this.commonService.onMessageHandler("Failed to upload. Please contact support.", 0);
                        })
                },

                    error => {
                        // loading.dismiss().catch(() => { });
                        this.retriveConsumerDigitalDocuments(0, false);
                        this.commonService.onMessageHandler("Failed to upload. Please contact support.", 0);
                    })
        })
    }
    uploadNewRecord(data) {
        this._dataContext.UploadUserHealthRecord(data)
            .subscribe(response => {
                if (response.Success) {
                    this.totalItem = this.documentsBySelf.length;
                    this.healthRecordStatus = 'recordDetails';
                    this.uploadedDocumentDetails.DocumentFor = 0;
                    this.uploadedDocumentDetails.DocumentType = 0;
                    this.uploadedDocumentDetails.Description = "";
                    this.uploadedDocument = [];
                    this.totalUploadedDocList = [];
                    this.retriveConsumerDigitalDocuments(0, false);
                }
            },
                error => {
                    // loading.dismiss().catch(() => { });
                    this.retriveConsumerDigitalDocuments(0, false);
                    this.commonService.onMessageHandler("Failed to upload. Please contact support.", 0);
                    this.totalUploadedDocList = [];
                });
    }
}
