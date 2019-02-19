import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, AlertController } from 'ionic-angular';
import { DataContext } from '../../../providers/dataContext.service';
import { CommonServices } from '../../../providers/common.service';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import moment from 'moment';
/**
 * Generated class for the CompleteVaccinationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-complete-vaccination',
  templateUrl: 'complete-vaccination.html',
})
export class CompleteVaccinationPage {
  skip:boolean=false;
  reset:boolean=false;
  hospital:any;
  doctor:any;
  vaccine_date:any;
  searchKeyword: string = "";
  doctorsList:any=[];
  hospitalList:any = [];
  hospitals = [];
  providers: any = [];
  searchedResult: any = [];
  isAvailableResult: boolean = true;
  isAutoCompleteSearched: boolean = false;
  specializations: any = [];
  isSelected: number = 1;
  page:number = 0;
  itemPerPage:number = 10;
  selectedCityAndLocation: any = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
  editedDate:any;
  vaccineData:any;
  maxDate:any;
  temp_vaccinedataList:any=[];
  VaccinationList:any=[];
  single_or_update:string;
  vaccinationDetailsIds=[];
  vaccineGroup:any=[];
  searchTerm:any;
    
  constructor(public navCtrl: NavController, public navParams: NavParams,private alertCtrl: AlertController, public viewCtrl: ViewController, private modalCtrl: ModalController, public _dataContext: DataContext, private commonService: CommonServices,
    private storage: Storage) {
  }

  ionViewDidEnter() {
    // setTimeout(() => {
    //   this.input.setFocus();
    // });
    this.getCurrentLocationFromCache();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CompleteVaccinationPage');
    this.maxDate = "2049-12-31";
    this.vaccineData = this.navParams.get("vaccine_data");//complete
    this.single_or_update = this.navParams.get("complete");
    if(this.single_or_update == "single"){
      this.temp_vaccinedataList.push(this.vaccineData);
      console.log(this.temp_vaccinedataList);
    }else{
      this.temp_vaccinedataList = this.vaccineData.VaccinationdetailList;
      this.temp_vaccinedataList.forEach((item)=>{
          this.VaccinationList.push(item.VaccinationDetailsID);
      });
    }
    this.vaccine_date = moment(this.vaccineData.Date).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

    this.hospital = this.vaccineData.VaccinationdetailList[0].GroupName;
    this.doctor = this.vaccineData.VaccinationdetailList[0].ProviderName;

    // let data = this.storage.get("Gethospital_doctor_dets").then((data)=>{
    //   console.log((data));
    //   if(data){
    //     this.hospital = data.hospitalName;
    //     this.doctor = data.doctorName;
    //   }
    // });
  }

  getCurrentLocationFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
      .then((result) => {
        if ((result.activeCity != "" && result.activeCity != undefined && result.activeCity != "Choose City") || (result.activeLocation != "" && result.activeLocation != undefined && result.activeLocation != "Choose Locality")) {
          this.selectedCityAndLocation.activeCity = result.activeCity;
          this.selectedCityAndLocation.activeLocation = result.activeLocation;
          this.selectedCityAndLocation.activeCityKey = result.activeCityKey;
          this.selectedCityAndLocation.activeLocationKey = result.activeLocationKey;
        }
        else {
          this.selectedCityAndLocation = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
          this.getLocation();
        }
      });
  }

  getLocation() {
    let addModal = this.modalCtrl.create("CityLocation");
    addModal.onDidDismiss(item => {
      if (item) {
        if (item.activeCityKey != 0 || item.activeLocationKey != 0) {
          this.selectedCityAndLocation = item;
          this.storeLocationResultInCache();
        }
        else {
          this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getActiveLocation"))
            .then((result) => {
              if ((result.activeCity != "" && result.activeCity != undefined) || (result.activeLocation != "" && result.activeLocation != undefined)) {
                this.selectedCityAndLocation.activeCity = result.activeCity;
                this.selectedCityAndLocation.activeLocation = result.activeLocation;
                this.selectedCityAndLocation.activeCityKey = result.activeCityKey;
                this.selectedCityAndLocation.activeLocationKey = result.activeLocationKey;
              }
              else {
                this.selectedCityAndLocation = { activeCity: "Choose City", activeLocation: "Choose Locality", activeCityKey: 0, activeLocationKey: 0 };
              }
              this.storeLocationResultInCache();
            });
        }
      }
    })
    addModal.present();
  }

  storeLocationResultInCache() {
    this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getActiveLocation"), { activeCity: this.selectedCityAndLocation.activeCity, activeLocation: this.selectedCityAndLocation.activeLocation, activeCityKey: this.selectedCityAndLocation.activeCityKey, activeLocationKey: this.selectedCityAndLocation.activeLocationKey })
      .then((result) => {
        this.hospitalList = [];
        this.page = 0;
        this.itemPerPage = 20;
        //this.getActiveSection();
      });
  }

  closeCurrentSection(){
    this.viewCtrl.dismiss({reset_status:this.reset,vaccine_status:"complete"});
  }

  search_DoctorOrHospital(ev){

  }


  searchResultByKeyword(ev,selected) {
    console.log(ev.target.value);
    this.searchTerm = selected;
    this.isSelected = 0;
    this.searchKeyword = ev.target.value;
    if (this.searchKeyword.length > 1) {
      let query: any = {}
      query = this.commonService.getAllSearchData();
      query.query.bool.must[0].match._all.query = this.searchKeyword;
      this.commonService.checkActiveCityAndLocality()
        .then((result) => {
          if (result.length > 0) {
            let activelocationDetails = result;
            query.query.bool.filter = query.query.bool.filter.concat(activelocationDetails[0]);
            let currentLocation = {};
            let currentLocalityLatLng: any = {};
            let locationlatlng: any = {};
            this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentLanLng"))
              .then((result) => {
                if (result) {
                  locationlatlng = result;
                  currentLocation = {
                    "_geo_distance": {
                      "Latlong": result.lat + "," + result.lng,
                      "order": "asc",
                      "unit": "km",
                      "distance_type": "plane"
                    }
                  }
                }
                this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentLocalityLatLng"))
                  .then((result) => {
                    if (result) {
                      currentLocalityLatLng =
                        {
                          "distance": {
                            "script": {
                              "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
                              "lang": "painless",
                              "params": {
                                "lat": result.lat,
                                "lon": result.lng
                              }
                            }
                          }
                        }
                    }
                    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getCurrentCityFromGPS"))
                      .then((response) => {
                        let cityFromGPSCache = response;
                        if (activelocationDetails[0].term.City == cityFromGPSCache) {
                          currentLocation = {
                            "_geo_distance": {
                              "Latlong": currentLocalityLatLng.distance.script.params.lat + "," + currentLocalityLatLng.distance.script.params.lon,
                              "order": "asc",
                              "unit": "km",
                              "distance_type": "plane"
                            }
                          }
                          currentLocalityLatLng =
                            {
                              "distance": {
                                "script": {
                                  "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
                                  "lang": "painless",
                                  "params": {
                                    "lat": locationlatlng.lat,
                                    "lon": locationlatlng.lng
                                  }
                                }
                              }
                            }
                          // if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined) {
                          //   query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                          //   query.aggs.by_type.aggs.tops.top_hits.script_fields = currentLocalityLatLng;
                          // }
                          // else {
                          query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                          query.aggs.by_type.aggs.tops.top_hits.script_fields = currentLocalityLatLng;
                          // }
                        }
                        else {
                          if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined) {
                            currentLocation = {
                              "_geo_distance": {
                                "Latlong": currentLocalityLatLng.distance.script.params.lat + "," + currentLocalityLatLng.distance.script.params.lon,
                                "order": "asc",
                                "unit": "km",
                                "distance_type": "plane"
                              }
                            }
                            query.aggs.by_type.aggs.tops.top_hits.sort = [currentLocation];
                            query.aggs.by_type.aggs.tops.top_hits.script_fields = {};
                          }
                          else {
                            // query.aggs.by_type.aggs.tops.top_hits.sort = [];
                            query.aggs.by_type.aggs.tops.top_hits.script_fields = {};
                            query.aggs.by_type.aggs.tops.top_hits.sort = [];
                          }
                        }
                        // if(this.isSelected == 1){
                        //   this.getdocctors();
                        // }
                        // else if(this.isSelected == 2){
                        //   this.gethospitals();
                        // }
                        this._dataContext.GetAutocompleteSearchedData(query)
                          .subscribe(response => {
                            if (response.hits.total > 0) {
                              this.searchedResult = response.aggregations.by_type.buckets;
                              this.hospitals = [];
                              let filterData = [];
                              let hos_filterData = [];
                              this.searchedResult.filter(item => {
                                if (item.key === "10") {
                                  if (activelocationDetails[0].term.City == cityFromGPSCache) {
                                    item.tops.hits.hits.filter(result => {
                                      result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                      filterData.push(result);
                                    });
                                  }
                                  else {
                                    // if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined && activelocationDetails[0].term.City == cityFromGPSCache) {
                                    //   item.tops.hits.hits.filter(result => {
                                    //     result.sort[0] = result.sort[0].toFixed("1");
                                    //     filterData.push(result);
                                    //   });
                                    // }
                                    // else {
                                    item.tops.hits.hits.filter(result => {
                                      // result.sort[0] = result.sort[0].toFixed("1");
                                      filterData.push(result);
                                    });
                                    //}
                                  }
                                  this.providers = filterData;
                                  // this.providers = _.map(_.uniqBy(this.providers, 'ProviderID'), function (item) {
                                  //   return item;
                                  // });
                                  this.providers.filter(item => {
                                    item._source.ProviderName = this.commonService.convert_case(item._source.ProviderName);
                                  })
                                }
                                else {
                                  if (activelocationDetails[0].term.City == cityFromGPSCache) {
                                    item.tops.hits.hits.filter(result => {
                                      result.fields.distance[0] = result.fields.distance[0].toFixed("1");
                                      hos_filterData.push(result);
                                    });
                                  }
                                  else {
                                    // if (activelocationDetails.length > 1 && activelocationDetails[1].term.CityAreaName != "" && activelocationDetails[1].term.CityAreaName != undefined && activelocationDetails[0].term.City == cityFromGPSCache) {
                                    //   item.tops.hits.hits.filter(result => {
                                    //     result.sort[0] = result.sort[0].toFixed("1");
                                    //     hos_filterData.push(result);
                                    //   });
                                    // }
                                    // else {
                                    item.tops.hits.hits.filter(result => {
                                      // result.sort[0] = result.sort[0].toFixed("1");
                                      hos_filterData.push(result);
                                    });
                                    // }
                                  }
                                  this.hospitals = hos_filterData;
                                  // this.hospitals = item.tops.hits.hits;
                                }
                              });

                              //this.providers = this.searchedResult.Providers;
                              this.isAutoCompleteSearched = true;
                              this.isSelected = 0;
                            }
                            else {
                              this.hospitals = [];
                              this.providers = [];
                              this.isAvailableResult = false;
                              this.isSelected = 0;
                              this.page = 0;
                            }
                            console.log(response.hits.hits);
                          },
                            error => {
                              console.log(error);
                              this.commonService.onMessageHandler("Failed to Retrieve.Please try again.", 0);
                            });
                      });
                  });
              });
          }
          else {
            this.getLocation();
          }
        });
    }
    else if (this.searchKeyword.length == 0) {
      this.hospitals = [];
      this.providers = [];
      this.isSelected = 1;
     
    }
    
  }

  SelectedHospital(hospital){
    console.log(hospital);
    this.hospital = hospital;
    this.providers = [];
    this.hospitals = [];
  }

  SelectedDoctor(doctor){
    console.log(doctor);
    this.doctor = doctor;
    this.providers = [];
    this.hospitals = [];
  }

  //Get data while scrolling for paggination.
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      if ((this.searchKeyword == "" || this.searchKeyword == null || this.searchKeyword == undefined) && this.isSelected != 2 && this.isSelected != 4) {
        //this.getActiveSection();
      }
      infiniteScroll.complete();
    }, 1000);
  }

  // selecting text in input field
  selectAllText(event) {
    if (event.target.value) {
      event.target.select();
    }
  }

  

  Complete(){
        console.log("group");
        let alert = this.alertCtrl.create({
          title: 'Do you want to change remaining vaccination chart dates according to this date ?',
          message: '',
          buttons: [
    
            {
              text: "Don't",
              
              handler: () => {
                this.reset=false;
                this.completVaccine();
              }
            },
            {
              text: 'Allow',
              handler: () => {
                this.reset=true;
                this.completVaccine();
              }
            }
          ]
        });
        alert.present(); 
    }
  completVaccine(){
    
    for(let i=0; i<this.temp_vaccinedataList.length; i++){
      this.vaccineGroup.push({
        VaccinationDetailsID:this.temp_vaccinedataList[i].VaccinationDetailsID,
        ConsumerID:this.temp_vaccinedataList[i].ConsumerID,
        VaccinationsID:0,
        VaccinationGivenOn:moment(this.vaccine_date).format("MM/DD/YYYY"),
        IdealVaccinationDate:moment(this.temp_vaccinedataList[i].IdealVaccinationDate).format("MM/DD/YYYY"),
        GroupEntityID:0,
        GroupName:this.hospital,
        ProviderID:0,
        ProviderName:this.doctor
      },)
    }
    
    console.log(this.vaccineGroup);
    this._dataContext.CompleteVaccineGroup(this.vaccineGroup,this.skip,this.reset)
        .subscribe(response => {
          console.log(response);
            if (response.Data.Success == true) {
              this.commonService.onMessageHandler("Vaccination completed successfully",1);
              this.vaccineGroup=[];
              this.viewCtrl.dismiss({reset_status:this.reset,vaccine_status:"complete"});  
            }else{
              this.commonService.onMessageHandler("Failed to complete the vaccination.Please try again.", 0);
            }   
        },
        error => {
            console.log(error);
            this.commonService.onMessageHandler("Failed to complete the vaccination.Please try again.", 0);
        });
  }

}


