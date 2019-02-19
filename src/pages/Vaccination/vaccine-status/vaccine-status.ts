import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, Platform, Events } from 'ionic-angular';
import { CommonServices } from "../../../providers/common.service";
import { DataContext } from '../../../providers/dataContext.service';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Camera, CameraOptions } from '@ionic-native/camera';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Screenshot } from '@ionic-native/screenshot';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import moment from 'moment';
/**
 * Generated class for the VaccineStatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-vaccine-status',
  templateUrl: 'vaccine-status.html',
  providers: [Camera, File, FileOpener, FileTransfer, Screenshot]
})
export class VaccineStatusPage {
  past_vaccine_skipped: boolean = true;
  upcomingVaccines: any = [];
  pastVaccines: any = [];
  screen: any;
  Selectedchild: any;
  myIndex: number = 0;
  state: boolean = false;
  public base64Image: string;
  baby_prof_img: any;
  childDets: any = [];
  childAge: any;
  selectedTab: string = 'upcoming';
  present_month: any;
  present_day: any;
  present_day_text: any;
  present_year: any;
  VaccineList: any = [];
  maxDate: any;
  editedDate: any;
  temp_vaccines: any = [];
  VaccinePdf: any;
  options: CameraOptions;
  scheduleIndex: number;
  no_vaccinations: boolean = false;
  vaccination_status: string = 'completed';
  dateFormat: any = {};
  childrensFound: boolean = false;
  vaccineGroup: any = [];
  skip: boolean = false;
  reset: boolean = false;
  temp_vaccinedataList: any = [];
  past_skipped_vacccine_names: any = [];
  ChildAges: any = [];
  years: any;
  months: any;
  days: any
  hospitalname: string = "";
  doctorname: string = "";
  intervals: any = ['years', 'months', 'weeks', 'days'];
  colors: any = ["#2ecc71", "#34495e", "#e74c3c", "#e67e22", "#16a085", "#bdc3c7", "#39bebc", "#2ecc71", "#34495e", "#e74c3c", "#e67e22", "#16a085", "#bdc3c7", "#39bebc"];
  constructor(public file: File, public fileOpener: FileOpener, private el: ElementRef, private renderer: Renderer2, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public _dataContext: DataContext, public socialSharing: SocialSharing, private commonService: CommonServices,
    private alertCtrl: AlertController, private camera: Camera, private screenshot: Screenshot, private platform: Platform,
    private transfer: FileTransfer, public events: Events, private storage: Storage) {
  }

  ionViewDidEnter() {
    this.getChildrens();
  }

  //getting childres for dropdown(childrenlist)
  getChildrens() {
    this._dataContext.GetChildrenData()
      .subscribe(response => {
        if (response.Data.length > 0) {
          this.childrensFound = true;
          this.childDets = (response.Data).reverse();
          console.log(this.childDets);
          this.Selectedchild = this.childDets[0].value;
          this.childDets.forEach((child) => {
            if (child) {
              let temp_dob = moment(child.dob, "DD/MM/YYYY").format("MM/DD/YYYY");
              // console.log(`${new Date(moment(temp_dob).toISOString())}::${new Date()}`);
              //child["age"] = this.getFormattedDateDiff(new Date(moment(child.dob).toISOString()),new Date());
              let From_date: any = new Date(moment(temp_dob).toISOString());
              let To_date: any = new Date();
              let diff_date: any = To_date - From_date;
              let years = Math.floor(diff_date / 31536000000);
              let months = Math.floor((diff_date % 31536000000) / 2628000000);
              let days = Math.floor(((diff_date % 31536000000) % 2628000000) / 86400000);
              //child.push({"years":years,"months":months,"days":days});
              child["years"] = years;
              child["months"] = months;
              child["days"] = days;
            }
          });
          console.log(this.childDets);
          this.years = this.childDets[0].years;
          this.months = this.childDets[0].months;
          this.days = this.childDets[0].days;
          this.getVaccineList(this.childDets[0].value);
        } else {
          this.childrensFound = false;
        }
      },
        error => {
          console.log(error);
        });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VaccineStatusPage');
    this.baby_prof_img = "assets/img/vaccination/baby.jpg";
    this.maxDate = "2049-12-31";
    let date = moment(new Date()).format("DD/MM/YYYY");
    let tempdate = moment(date, 'DD/MM/YYYY');
    console.log(`tempdate::${tempdate}`);
    this.present_month = tempdate.format('MMMM');
    this.present_day = tempdate.format('DD');
    this.present_day_text = tempdate.format('dddd');
    this.present_year = tempdate.format('YYYY');
  }


  // checking vaccinelist is there for selected child if der show else show create button
  getVaccineList(child_dob) {
    this._dataContext.GetVaccinationData(child_dob)
      .subscribe(response => {
        console.log(this.childDets);
        console.log(response);
        if (response.Data.length > 0) {
          this.no_vaccinations = false;
          this.VaccineList = response.Data;

          response.Data.forEach((VaccineList) => {
            if (VaccineList.VaccinationGroupCompleted == true) {
              this.pastVaccines.push(VaccineList);
            }
          });
          //storing doctor&hospital det's for completing vaccination
          if (this.pastVaccines.length > 0) {
            let data = this.storage.get("hospital_doctor_dets").then((data) => {
              console.log((data));
              let hospital_doctor_dets = {
                hospitalName: this.pastVaccines[0].VaccinationdetailList[0].GroupName,
                doctorName: this.pastVaccines[0].VaccinationdetailList[0].ProviderName
              }
              if (data) {
                this.storage.remove("Gethospital_doctor_dets");
                this.storage.set("Gethospital_doctor_dets", hospital_doctor_dets);
              } else {
                this.storage.set("Gethospital_doctor_dets", hospital_doctor_dets);
              }
            });
          }
          //
          response.Data.forEach((VaccineList) => {
            if (VaccineList.VaccinationGroupCompleted == false) {
              this.upcomingVaccines.push(VaccineList);
            }
          });

          this.upcomingVaccines.forEach((upcomingvaccine, index) => {
            upcomingvaccine["date"] = moment(upcomingvaccine.Date).format('D');
            upcomingvaccine["month"] = moment(upcomingvaccine.Date).format('MMM');
            upcomingvaccine["year"] = moment(upcomingvaccine.Date).format('YYYY');
            upcomingvaccine["bgcolor"] = this.colors[index];
          })

          this.pastVaccines.forEach((pastvaccine, index) => {
            pastvaccine["date"] = moment(pastvaccine.Date).format('D');
            pastvaccine["month"] = moment(pastvaccine.Date).format('MMM');
            pastvaccine["year"] = moment(pastvaccine.Date).format('YYYY');
            pastvaccine["bgcolor"] = this.colors[index];
          })
          console.log(this.pastVaccines);

          // loop over pastvaccines for checking it's skipped or completed 
          for (let i = 0; i < this.pastVaccines.length; i++) {
            this.pastVaccines[i]['past_show_skipped'] = true;
            for (let j = 0; j < this.pastVaccines[i].VaccinationdetailList.length; j++) {
              if (this.pastVaccines[i].VaccinationdetailList[j].VaccinationSkipped == false) {
                this.pastVaccines[i]['past_show_skipped'] = false;
                break;
              }
            }
          }


        } else {
          this.no_vaccinations = true;
        }
      },
        error => {
          console.log(error);
          //this.commonService.onMessageHandler("Failed to Retrieve Notifications. Please try again.", 0);
        });

  }


  //addBabyVaccines(){
  askDets() {

    this.hospitalname = "";
    this.doctorname = "";
    var self = this;
    self.renderer.addClass(self.el.nativeElement.querySelector('.customPopUp'), 'customPopUp1');
    setTimeout(function () {
      self.renderer.setStyle(self.el.nativeElement.querySelector('.mainPopUp'), 'transform', 'scale(1)');
      self.renderer.setStyle(self.el.nativeElement.querySelector('.mainPopUp'), 'transition', 'all 0.3s');
    }, 120);
    console.log(this.Selectedchild);
  }

  //adding baby vaccines when vaccination chart not created
  addBabyVaccines() {

    if (this.hospitalname != "" && this.hospitalname != undefined) {
      if (this.doctorname != "" && this.doctorname != undefined) {
        let hospital_doctor_dets = {
          hospitalName: this.hospitalname,
          doctorName: this.doctorname
        }
        let data = this.storage.get("hospital_doctor_dets").then((data) => {
          console.log((data));
          if (data) {
            this.storage.remove("Gethospital_doctor_dets");
            this.storage.set("Gethospital_doctor_dets", hospital_doctor_dets);
          } else {
            this.storage.set("Gethospital_doctor_dets", hospital_doctor_dets);
          }
        });


        var self = this;
        setTimeout(function () {
          self.renderer.setStyle(self.el.nativeElement.querySelector('.mainPopUp'), 'transform', 'scale(0)');
          self.renderer.setStyle(self.el.nativeElement.querySelector('.mainPopUp'), 'transition', 'all 0.3s');
        }, 120);
        this.renderer.removeClass(this.el.nativeElement.querySelector('.customPopUp'), 'customPopUp1');
        this.createVaccinechart();
      } else {
        this.commonService.onMessageHandler("Please choose a doctor", 0);
      }
    } else {
      this.commonService.onMessageHandler("Please choose a hospital", 0);
    }


   
  }

  cancelBabyVaccines() {
    var self = this;
    setTimeout(function () {
      self.renderer.setStyle(self.el.nativeElement.querySelector('.mainPopUp'), 'transform', 'scale(0)');
      self.renderer.setStyle(self.el.nativeElement.querySelector('.mainPopUp'), 'transition', 'all 0.3s');
    }, 120);
    this.renderer.removeClass(this.el.nativeElement.querySelector('.customPopUp'), 'customPopUp1');

  }

  createVaccinechart() {
    this._dataContext.createVaccination(this.Selectedchild)
      .subscribe(response => {
        console.log(response);
        if (response.Data.Success) {
          this.getVaccineList(this.Selectedchild);
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Unable to create vaccination details. Please try again.", 0);
        });
  }


  selectedChild() {


    for (let index = 0; index < this.childDets.length; index++) {
      if (this.Selectedchild == this.childDets[index].value) {
        this.myIndex = index;
        console.log(this.myIndex);
        // this.childAge = this.childDets[this.myIndex].age;
        this.years = this.childDets[index].years;
        this.months = this.childDets[index].months;
        this.days = this.childDets[index].days;
        this.pastVaccines = [];
        this.upcomingVaccines = [];
        this.getVaccineList(this.childDets[index].value);
      }

    }

  }
  closeCurrentSection() {
    this.navCtrl.setRoot("DashBoard");
  }
  // traverse tabs
  VaccinationStatus(selected) {
    this.selectedTab = selected;
  }

  //showing individual vaccine when click on card
  getFullDes(vaccineData) {
    let Modal = this.modalCtrl.create("VaccinationDetsPage", { vaccinedata: vaccineData });
    Modal.onDidDismiss(data => {
      console.log(data);
      this.vaccineGroup = [];
      this.pastVaccines = [];
      this.upcomingVaccines = [];
      this.getVaccineList(this.Selectedchild);
    });
    Modal.present();
  }


  //showing modal for seraching hospital and medicines
  searchModal(ev, search_text) {
    let Modal = this.modalCtrl.create("ChooseHospitalDoctorNamesPage", { searchtext: search_text });
    Modal.onDidDismiss(data => {
      
      console.log(data);
      if (data != false && data != undefined) {
        if (search_text == "hospital") {
          this.hospitalname = data;
        } else {
          this.doctorname = data;
        }
      }else{
        this.hospitalname = "";
        this.doctorname = "";
      }

    });
    Modal.present();
  }

  //go back to the page
  gotoAddChild(sts: number) {
    this.navCtrl.push("AddVaccinationPage", { status: sts });
  }

  // popup for completing vaccine with respect to user dets's
  completeVaccination(vaccinedata) {
    //this.scheduleIndex = index;
    //console.log(this.VaccineList[index].fulldate);
    //this.editedDate = moment(this.VaccineList[index].fulldate,"DD-MM-YYYY").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    let Modal = this.modalCtrl.create("CompleteVaccinationPage", { vaccine_data: vaccinedata, complete: "group" });
    Modal.onDidDismiss(data => {
      if (data.vaccine_status == "complete") {
        this.vaccineGroup = [];
        this.pastVaccines = [];
        this.upcomingVaccines = [];
      //  this.selectedTab = "past";
        this.getVaccineList(this.Selectedchild);
      } else {
        this.vaccineGroup = [];
        this.pastVaccines = [];
        this.upcomingVaccines = [];
        this.getVaccineList(this.Selectedchild);
      }
    });
    Modal.present();
  }


  //Skip the vaccine start
  skipVaccination(vaccinedata) {
    this.temp_vaccinedataList = vaccinedata.VaccinationdetailList;
    console.log(vaccinedata);
    let alert = this.alertCtrl.create({
      title: 'Do you want to skip this vaccination ?',
      message: '',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'SKIP',
          handler: () => {
            this.skip = true;
            this.skipVaccianeGroup(this.temp_vaccinedataList);
          }
        }
      ]
    });
    alert.present();
  }


  skipVaccianeGroup(vaccinedataList) {
    for (let i = 0; i < vaccinedataList.length; i++) {
      this.vaccineGroup.push({
        VaccinationDetailsID: vaccinedataList[i].VaccinationDetailsID,
        ConsumerID: vaccinedataList[i].ConsumerID,
        VaccinationsID: 0,
        VaccinationGivenOn: "",
        IdealVaccinationDate: moment(vaccinedataList[i].IdealVaccinationDate).format("DD/MM/YYYY"),
        GroupEntityID: 0,
        GroupName: "",
        ProviderID: 0,
        ProviderName: ""
      }, )
    }

    console.log(this.vaccineGroup);
    this._dataContext.CompleteVaccineGroup(this.vaccineGroup, this.skip, this.reset)
      .subscribe(response => {
        console.log(response);
        if (response.Result == "OK") {
          this.commonService.onMessageHandler("Vaccination skipped successfully", 1);
          this.vaccineGroup = [];
          this.pastVaccines = [];
          this.upcomingVaccines = [];
          this.selectedTab = "past";
          this.getVaccineList(this.Selectedchild);
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to complete the vaccination.Please try again.", 0);
        });
  }

  // Undo Vaccine(It'll goes to Uncompleted tab)
  Undo_Vaccine(vaccinedata) {
    console.log(vaccinedata);
  }

  complete_vaccine(index) {
    this.scheduleIndex = index;
    console.log(this.VaccineList[index].fulldate);
    this.editedDate = moment(this.VaccineList[index].fulldate, "DD-MM-YYYY").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    console.log(this.editedDate);
    //this.editedDate = new Date(this.VaccineList[index].fulldate).toISOString();
    var self = this;
    //var  = el.getElementsByClassName('editbtn');
    //this.elemRef.nativeElement.querySelector('.doseVal').innerHTML = this.elemRef.nativeElement.querySelector('.dval').innerHTML
    this.renderer.setStyle(this.el.nativeElement.querySelector('.customPopUp'), 'display', 'block');
    setTimeout(function () {
      self.renderer.setStyle(self.el.nativeElement.querySelector('.mainPopUp'), 'transform', 'scale(1)');
      self.renderer.setStyle(self.el.nativeElement.querySelector('.mainPopUp'), 'transition', 'all 0.3s');
    }, 120);
  }


  //changing baby profile picture
  takePicture() {
    let alert = this.alertCtrl.create({
      title: 'Choose Baby Picture',
      message: '',
      buttons: [
        {
          text: 'CAMERA',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            ////camera 
            this.options = {
              sourceType: this.camera.PictureSourceType.CAMERA,
              destinationType: this.camera.DestinationType.DATA_URL,
              allowEdit: false,
              targetWidth: 100,
              targetHeight: 100
            }
            this.setBabyProfImg();
          }

        },
        {
          text: 'GALLERY',
          handler: () => {
            console.log('Yes clicked');
            this.options = {
              sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
              destinationType: this.camera.DestinationType.DATA_URL,
              allowEdit: false,
              targetWidth: 100,
              targetHeight: 100
            }
            this.setBabyProfImg();
          }
        }
      ]
    });
    alert.present();

  }

  setBabyProfImg() {
    this.camera.getPicture(this.options).then((imageData) => {
      // imageData is a base64 encoded string
      this.baby_prof_img = "data:image/jpeg;base64," + imageData;
      this.base64Image = "data:image/jpeg;base64," + imageData;
    }, (err) => {
      //alert(JSON.stringify(err));
    });
  }


  //screenshot and sharing vaccinedet's
  ShareVaccineInfo() {
    this.screenshot.URI(80).then((res) => {
      this.screen = res.URI;
      this.state = true;
      this.shareVaccineDets();
    })
  }
  shareVaccineDets() {
    var docDefinition = {
      header: {
        columns: [
          { text: 'HealthPro', alignment: 'center', style: 'mainheader' }
        ]
      },

      content: [
        {
          image: this.screen,
          width:"100%",
          height:"100%",
          // columns: [
          // [
          //   //{ text: 'HealthPro', style: 'header' },
          //   { text: 'THE BEST DIGITAL PLATFORM FOR HOSPITAL AND DIAGNOSTIC CENTER', style: 'sub_header' },
          //   { text: 'Download the app:', link:'https://play.google.com/store/apps/details?id=com.kare4u.healthproapp'}
          // ],
          //   {
          //     image: this.screen,
          //     fit: [100, 100]
          //   },
          // ],


        },
      ],
      styles: {
        mainheader: {
          margin: [0],
          color: "#39bebc",
          fontSize: 40,
        },
        header: {
          bold: true,
          fontSize: 20,
          margin: [30, 10],
          color: "#39bebc",
          width: 100,

        },
        sub_header: {
          fontSize: 15,
          //margin:[0,2],
          width: 100,

        },
        url: {
          fontSize: 16,
          margin: [0, 2],
          width: 100
        }
      },
      pageSize: 'A4',
      pageOrientation: 'portrait'
    };
    let pdfObj = pdfMake.createPdf(docDefinition);

    pdfObj.getBuffer((buffer) => {
      var blob = new Blob([buffer], { type: 'application/pdf' });
      //Save the PDF to the data Directory of our App
      this.file.writeFile(this.file.dataDirectory, 'VaccinationDetails.pdf', blob, { replace: true }).then(fileEntry => {
        //Open the PDf with the correct OS tools
        let url = fileEntry.toURL();
        this.socialSharing.share("HealthPro Book My Doctor & Health Package", "Care", this.file.dataDirectory + 'VaccinationDetails.pdf', "https://play.google.com/store/apps/details?id=com.kare4u.healthproapp")
          .then(function (result) {
            console.log(result);
            this.commonService.onEventSuccessOrFailure("click share referral");
          }, function (err) {

          });
      });

    });

  }



}
