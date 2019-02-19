import { Injectable, ViewChild } from '@angular/core';
import { Events, ToastController, App, Navbar } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FormControl } from '@angular/forms';
import { Geolocation } from '@ionic-native/geolocation';
import { CacheService } from "ionic-cache";
import * as $ from 'jquery';
import { FlurryAnalytics, FlurryAnalyticsObject, FlurryAnalyticsOptions } from '@ionic-native/flurry-analytics';
@Injectable()
export class CommonServices {
  @ViewChild(Navbar) navBar: Navbar;
  HAS_LOGGED_IN = 'hasVisitRegisterPage';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
  private flurryAnalytics: FlurryAnalytics
  private apiServiceUrl: string;
  private _apiList: any = [];
  private groupEnitityId: number;
  private parentGroupEntityId: number;
  private defaulPassword: string;
  private apiServiceUrlForLogin: string;
  private google_api_key: string;
  private appTtitle: string;
  private _cacheKeyList: any = [];
  private websiteURL: string;
  private _appVersion: string;
  private awsSMSJsonFormat: any = {};
  private awsEmailJsonFormat: any = {};
  private getAllSearcheddata: any = {};
  private getSearchedHospitals = {};
  private getSearchedDoctors = {};
  private getHospitalList = {};
  private getSpecializationList = {};
  private getDoctorsBySpecId = {};
  private getDoctorsByHospitalId = {};
  private getDrugList = {};
  private getDiasesList = {};
  private getEmergencyHospitals = {};
  private getSurgeries = {};
  private surgeryList = {};
  private doctorsBySurgeryName = {};
  private getAllSearchedSymptomsdata = {};
  private getAllSearchedSurgerydata = {};
  private getDrugListBySearchedKeyword = {};
  private getAllDiasesByKeyword = {};
  private getSearchedEmergencyHospitals = {};
  private getDiagnosticCenters = {};
  private getDiagnosticPackages = {};
  private getDefaultPackages = {};
  private getDefaultCenters = {};
  private getEmergencyContact = {};
  private getEmergencyContactList = {};
  private termsAnsConditions: string;
  private paymentAPIURL: string;
  private appType: string;
  private getLabScanBysearchKeyword = {};
  private getLabTestBysearchKeyword = {};
  private getHealthPackages = {};
  private getLabScans = {};
  private getLabTests = {};
  private getDCResultBYSearchKeyword = {};
  private getDCSeeAllResultsByKeyword = {};
  private UAT_Elastic_search = "";
  private Stag_Elastic_search = "";
  private Prod_Elastic_search = "";
  private Elastic_search_URL = "";
  private flurry_key = "";
  private ios_flurry_key = "";
  private android_flurry_key = "";
  // ios flurry key
  // android flurry key
  constructor(
    public events: Events,
    public storage: Storage,
    public _toastCtrl: ToastController,
    private geolocation: Geolocation,
    private cache: CacheService,
    public appCtrl: App
  ) {
    this.groupEnitityId = 0;
    this.parentGroupEntityId = 0;
    this.defaulPassword = "K@re1234";
    this.ios_flurry_key = "M8Q8BSDFVF8R2VVT4XFR";
    this.android_flurry_key = "BKX4ZQR93ZVKQNS2YWGB";
    // this.apiServiceUrl = "http://54.84.255.41:8120/";
    this.apiServiceUrl = "http://kare4u-lb-bpms-ind-prod2-consume-2031991078.us-east-1.elb.amazonaws.com:8120/";
    this.termsAnsConditions = "http://www.kare4u.in/termsconditions";
    this.appType = "Consumer";
    // this.paymentAPIURL = "http://54.84.255.41:8174/"
    this.paymentAPIURL = "http://kare4u-lb-bpms-ind-prod2-consume-2031991078.us-east-1.elb.amazonaws.com:8122/"; //PG Api
    this.UAT_Elastic_search = "https://search-hkare-qqwadaq7jass4dxflai2aqjlwe.us-east-1.es.amazonaws.com"; // Pointing to UAT elastic search
    this.Stag_Elastic_search = "https://search-healthpro-bznc4g6aez4hpbvb5d4po23zxa.us-east-1.es.amazonaws.com"; // Pointing to Stag elastic search
    this.Prod_Elastic_search = "https://search-healthpro-bznc4g6aez4hpbvb5d4po23zxa.us-east-1.es.amazonaws.com"; // Pointing to Prod elastic search
    this.Elastic_search_URL = this.Prod_Elastic_search;
    this.flurry_key = this.android_flurry_key;
    //https://healthproapi.kare4u.com/         Prod
    //http://localhost:1873/                   Local
    //http://54.84.255.41:8120/                UAT
    //http://54.175.174.209:8120/              Stagging
    //http://54.84.255.41:8174/                UAT PG Api
    //http://localhost:63661/                  Local PG Api
    //http://54.175.174.209:8101/              Stagging PG Api
    //https://healthpropay.kare4u.com/         Prod PG Api
    //http://kare4u-lb-bpms-ind-prod2-consume-2031991078.us-east-1.elb.amazonaws.com:8120/     Load balancing
    //http://kare4u-lb-bpms-ind-prod2-consume-2031991078.us-east-1.elb.amazonaws.com:8122/       PG Load balancing 	96.	    //http://kare4u-lb-bpms-ind-prod2-consume-2031991078.us-east-1.elb.amazonaws.com:8122/  

    //////AWS SMS Json format///////////
    this.awsSMSJsonFormat = {
      "header":
        {
          "config_source": "inline",
          "tenantID": "healthpro",
        },
      "sms":
        [
          {
            "to_phone": "",
            "msg_body": ""
          }
        ]
    }
    ////////AWS Email json format////////////
    this.awsEmailJsonFormat = {
      "header":
        {
          "config_source": "db",
          "tenantID": "healthpro",
        },
      "email":
        [
          {
            "to_email": "",
            "from_email": "ashis.mahapatra@kare4u.in",
            "subject": "",
            "email_body": "",
            "from_name": "",
            "cc_emails": "",
            "attachments":
              [

              ]
          }
        ]
    }
    //Get all the hospitals and doctors by  searched keywords.
    this.getAllSearcheddata = {
      "size": 0,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [

          ]
        }
      },
      "aggs": {
        "by_type": {
          "terms": { "field": "ProviderType" },
          "aggs": {
            "tops": {
              "top_hits": {
                "size": 5
              }
            }
          }
        }
      }
    }
    // List Hospital
    this.getHospitalList = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "filter": [
            { "term": { "ProviderType": 11 } }
          ]
        }
      }
    }
    // List Hospital
    this.getDrugList = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "filter": [
          ]
        }
      }
    }
    //Get diases list
    this.getDiasesList = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "filter": [
          ]
        }
      }
    }
    // Get doctors based on specialization id 
    this.getDoctorsBySpecId = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "filter": [
            { "term": { "ProviderType": 10 } },
          ]
        }
      }
    }
    // Get doctors based on hospital id 
    this.getDoctorsByHospitalId = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "filter": [
            { "term": { "ProviderType": 10 } },
          ]
        }
      }
    }
    //Get all the docotrs list based on city and locality
    this.getSearchedDoctors = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [
            { "term": { "ProviderType": 10 } }
          ]
        }
      }
    }
    //Get all the hospitals list based on city and locality
    this.getSearchedHospitals = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [
            { "term": { "ProviderType": 11 } }
          ]
        }
      }
    }
    //Get all specializations 
    this.getSpecializationList = {
      "size": 1000,
      "from": 0,
      "query": {
        "bool": {
          "filter": [
          ]
        }
      },
      "aggs": {
        "by_type": {
          "terms": { "field": "SpecialisationDesc", "size": 1000, },

          "aggs": {
            "tops": {
              "top_hits": {
                "size": 1,
                "_source": {
                  "includes": ["SpecialisationCode", "SpecialisationDesc"]
                }
              }
            }
          }
        }
      }
    }
    this.getSurgeries = {
      "size": 4,
      "_source": ["SurgeryProviderID"],
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [
            { "term": { "_type": "Surgery" } }
          ]
        }
      },
    }
    this.surgeryList =
      {
        "size": 0,
        "aggs": {
          "by_type": {
            "terms": { "field": "Surgery", "size": 1000 },

            "aggs": {
              "tops": {
                "top_hits": {
                  "size": 1,
                  "_source": {
                    "includes": [""]
                  }
                }
              }
            }
          }
        }
      }
    this.doctorsBySurgeryName = {
      "query": {
        "bool": {
          "filter": {
            "terms": {
              "ProviderID": [
              ]
            }
          }
        }
      }
    }
    this.getAllSearchedSymptomsdata = {
      "size": 0,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [

          ]
        }
      },
      "aggs": {
        "by_type": {
          "terms": { "field": "PrimarySymptom" },
          "aggs": {
            "tops": {
              "top_hits": {
                "size": 4
              }
            }
          }
        }
      }
    };
    this.getLabScanBysearchKeyword = {
      "size": 5,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "multi_match": {
                "query": "",
                "fields": ["PackageName", "TestList"]
              }
            }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    };
    this.getLabTestBysearchKeyword = {
      "size": 5,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "multi_match": {
                "query": "",
                "fields": ["PackageName", "TestList"]
              }
            }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
    this.getLabTests = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match_all": {}
            }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
    this.getLabScans = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match_all": {}
            }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
    this.getDiagnosticCenters = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match_all": {}
            }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
    this.getHealthPackages = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match_all": {}
            }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
    this.getDCResultBYSearchKeyword = {
      "size": 0,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match_all": {

              }
            }
          ],
          "filter": [
          ]
        }
      },
      "aggs": {
        "by_type": {
          "terms": {
            "field": "_type"
          },
          "aggs": {
            "tops": {
              "top_hits": {
                "size": 5,
                "stored_fields": [
                  "_source"
                ],
                "script_fields": {
                  "distance": {
                    "script": {
                      "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
                      "lang": "painless",
                      "params": {
                        "lat": "",
                        "lon": ""
                      }
                    }
                  }
                },
                "sort": [
                  {
                    "_geo_distance": {
                      "Latlong": "",
                      "order": "asc",
                      "unit": "km",
                      "distance_type": "plane"
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }

    this.appTtitle = "HealthPro";
    this.websiteURL = "http://www.kare4u.in/";
    this._appVersion = "1.0.13";
    this.google_api_key = "AIzaSyCgElKETWoeCacEAcEqqQRxiVO-QNDniHg";
    //Cache Key URL. This is used to maintain all cach  e data using cache key url.
    this._cacheKeyList["getCities"] = this.apiServiceUrl + "cities";
    this._cacheKeyList["getCountries"] = this.apiServiceUrl + "countries";
    this._cacheKeyList["getStates"] = this.apiServiceUrl + "states";
    this._cacheKeyList["getCountryCode"] = this.apiServiceUrl + "countryCode";
    this._cacheKeyList["getGender"] = this.apiServiceUrl + "gender";
    this._cacheKeyList["getBloodGroup"] = this.apiServiceUrl + "bloodGroup";
    this._cacheKeyList["getDashboardSlider"] = this.apiServiceUrl + "dashboardSlider";
    this._cacheKeyList["getRelation"] = this.apiServiceUrl + "relation";
    this._cacheKeyList["getMaritalStatus"] = this.apiServiceUrl + "maritalStatus";
    this._cacheKeyList["getLoggedInUserDetails"] = this.apiServiceUrl + "userLoggedInStatus";
    this._cacheKeyList["getActiveLocation"] = this.apiServiceUrl + "activeLocation";
    this._cacheKeyList["getActiveCountryAndState"] = this.apiServiceUrl + "activeCountryAndState";
    this._cacheKeyList["getAppVersion"] = this.apiServiceUrl + "isSkipped";
    this._cacheKeyList["getAppVersionConfig"] = this.apiServiceUrl + "appVersionConfig";
    this._cacheKeyList["getReferralCode"] = this.apiServiceUrl + "userReferralCode";
    this._cacheKeyList["getDashboardSliders"] = this.apiServiceUrl + "dashBoardSliders";
    this._cacheKeyList["getProficPic"] = this.apiServiceUrl + "userProfilePic";
    this._cacheKeyList["getAppoConfig"] = this.apiServiceUrl + "appointmentConfiguration";
    this._cacheKeyList["getCurrentLanLng"] = this.apiServiceUrl + "userLocationLatLng";
    this._cacheKeyList["getHealthRecAnimationStatus"] = this.apiServiceUrl + "animationStatusForHealthRec";
    this._cacheKeyList["getAppoAnimationStatus"] = this.apiServiceUrl + "userAppoAnimationStatus";
    this._cacheKeyList["getConsumerUploadedDocSize"] = this.apiServiceUrl + "userDocSize";
    this._cacheKeyList["getFavDoctors"] = this.apiServiceUrl + "userFavDoctors";
    this._cacheKeyList["rateUs"] = this.apiServiceUrl + "rateUs";
    this._cacheKeyList["getUserNotificationCount"] = this.apiServiceUrl + "getUserNotificationCount";
    this._cacheKeyList["getUserAddedMedicalStatus"] = this.apiServiceUrl + "userAddedMedicalStatus";
    this._cacheKeyList["getConsumerLoggedInType"] = this.apiServiceUrl + "consumerLoggedInType";
    this._cacheKeyList["getUserDeviceToken"] = this.apiServiceUrl + "userDeviceToken";
    this._cacheKeyList["getChronicDisease"] = this.apiServiceUrl + "chronicDisease";
    this._cacheKeyList["getAllergies"] = this.apiServiceUrl + "allergies";
    this._cacheKeyList["getMedications"] = this.apiServiceUrl + "medications";
    //TODO This all caching service should move to SQLDb.
    this._cacheKeyList["getUploadedHealthRecordByUser"] = this.apiServiceUrl + "userHealthRecord";
    this._cacheKeyList["getUploadedHealthRecordByDoc"] = this.apiServiceUrl + "docHealthRecord";
    this._cacheKeyList["getUserInfo"] = this.apiServiceUrl + "userInformation";
    this._cacheKeyList["getUpcomingAppo"] = this.apiServiceUrl + "userUpcomingAppo";
    this._cacheKeyList["getPastAppo"] = this.apiServiceUrl + "userUPastAppo";
    this._cacheKeyList["getUserMedicalStatus"] = this.apiServiceUrl + "UserMedicalStatus";
    this._cacheKeyList["getUserFamily"] = this.apiServiceUrl + "userFamily";
    this._cacheKeyList["getNotification"] = this.apiServiceUrl + "appNotification";
    this._cacheKeyList["getUserNotification"] = this.apiServiceUrl + "userNotification";
    this._cacheKeyList["getPopularSymptomsSearch"] = this.apiServiceUrl + "popularSymptoms";
    this._cacheKeyList["getPopularSymptomsSurgery"] = this.apiServiceUrl + "popularSurgeries";
    this._cacheKeyList["getAddedReminderMedicineList"] = this.apiServiceUrl + "userReminderList";
    this._cacheKeyList["getAgeGroup"] = this.apiServiceUrl + "ageGroup";
    this._cacheKeyList["getHealthPackages"] = this.apiServiceUrl + "userHealthPackages";
    this._cacheKeyList["getPackageFromCart"] = this.apiServiceUrl + "addedPackage";
    this._cacheKeyList["getUserPremiumStatus"] = this.apiServiceUrl + "isPremium";
    this._cacheKeyList["getUserCurrentLatLng"] = this.apiServiceUrl + "userCurrentLatLng";
    this._cacheKeyList["getCurrentCityFromGPS"] = this.apiServiceUrl + "userCurrentCityFromGPS";
    this._cacheKeyList["getCurrentGPSLanLng"] = this.apiServiceUrl + "userCurrentGPSLanLng";
    this._cacheKeyList["getCurrentLocalityLatLng"] = this.apiServiceUrl + "userCurrentLocalityLatLng";
    this._cacheKeyList["getPackageGender"] = this.apiServiceUrl + "packageGender"; 732.
    this._cacheKeyList["getFilterData"] = this.apiServiceUrl + "flterData";

    //Health Plan cache module
    this._cacheKeyList["getPregnencyPageStatus"] = this.apiServiceUrl + "pregnencyPageStatus";
    this._cacheKeyList["getYogaAndExcerciseInfo"] = this.apiServiceUrl + "yogaAndExcerciseInfo";
    this._cacheKeyList["getTrackProgress"] = this.apiServiceUrl + "trackProgress";
    this._cacheKeyList["getPregnancyForm"] = this.apiServiceUrl + "pregnancyForm";
    this._cacheKeyList["getNotificationStatus"] = this.apiServiceUrl + "notificationStatus";

    //These API are used to get response from Elastic serach.
    ///////////////////////Elastic search enviroment/////////////////////////////////
    this._apiList["getMedication"] = { controller: this.Elastic_search_URL + "/docdb/Drugs/_search/", method: "Elastic", api: this.Elastic_search_URL + "/docdb/Drugs/_search/" };
    this._apiList["getDiases"] = { controller: this.Elastic_search_URL + "/docdb/Diseases/_search/", method: "Elastic", api: this.Elastic_search_URL + "/docdb/Diseases/_search/" };
    this._apiList["getSurgeries"] = { controller: this.Elastic_search_URL + "/docdb/Diseases/_search/", method: "Elastic", api: this.Elastic_search_URL + "/docdb/Surgery/_search/" };
    this._apiList["getDoctorsBySugeryName"] = { controller: this.Elastic_search_URL + "/docdb/Diseases/_search/", method: "Elastic", api: this.Elastic_search_URL + "/docdb/Surgery/_search/" };
    this._apiList["getElasticSearchQuery"] = { controller: this.Elastic_search_URL + "/docdb/Doctors/_search/", method: "Elastic", api: this.Elastic_search_URL + "/docdb/Doctors/_search/" };
    this._apiList["getSymptomsByKeyword"] = { controller: this.Elastic_search_URL + "/docdb/Symptoms/_search/", method: "Elastic", api: this.Elastic_search_URL + "/docdb/Symptoms/_search/" };
    this._apiList["getSpecializationBySymptomId"] = { controller: this.Elastic_search_URL + "/docdb/Symptoms/", method: "Elastic", api: this.Elastic_search_URL + "/docdb/Symptoms/" };
    this._apiList["getDiagnostics"] = { controller: this.Elastic_search_URL + "/docdb/Diagnostic/_search/", method: "Elastic", api: this.Elastic_search_URL + "/docdb/Diagnostic/_search/" };
    this._apiList["getPackage"] = { controller: this.Elastic_search_URL + "/docdb/Diagnostic/_search/", method: "Elastic", api: this.Elastic_search_URL + "/docdb/Diagnostic/_search/" };
    this._apiList["getHospitalEmergencyContact"] = { controller: this.Elastic_search_URL + "/docdb/EmergencyContact/_search", method: "Elastic", api: this.Elastic_search_URL + "/docdb/EmergencyContact/_search" };
    this._apiList["getHealthPackages"] = { controller: this.Elastic_search_URL + "/dcdb/DiagnosticPackages/_search", method: "Elastic", api: this.Elastic_search_URL + "/dcdb/DiagnosticPackages/_search" };
    this._apiList["getDiagnosticCenters"] = { controller: this.Elastic_search_URL + "/dcdb/DiagnosticCenters/_search", method: "Elastic", api: this.Elastic_search_URL + "/dcdb/DiagnosticCenters/_search" };
    this._apiList["getLabTests"] = { controller: this.Elastic_search_URL + "/dcdb/DiagnosticTest/_search", method: "Elastic", api: this.Elastic_search_URL + "/dcdb/DiagnosticTest/_search" };
    this._apiList["getLabProfile_es"] = { controller: this.Elastic_search_URL + "/dcdb/DiagnosticProfiles/_search", method: "Elastic", api: this.Elastic_search_URL + "/dcdb/DiagnosticProfiles/_search" };
    this._apiList["getResultForDCSearch"] = { controller: this.Elastic_search_URL + "/dcdb/_search", method: "Elastic", api: this.Elastic_search_URL + "/dcdb/_search" };
    this._apiList["getRadiologyScans"] = { controller: this.Elastic_search_URL + "/dcdb/DiagnosticScan/_search", method: "Elastic", api: this.Elastic_search_URL + "/dcdb/DiagnosticScan/_search" };
    ////////////////////////////////////////End Elastic search/////////////////////////////////////////



    this._apiList["userLogin"] = { controller: "Kare4uRCWidget", method: "token", api: "token" };
    this._apiList["userRegister"] = { controller: "Kare4uRCWidget", method: "RegisterConsumer", api: "api/Kare4uRCWidget/RegisterConsumer" };
    this._apiList["getDropdownValue"] = { controller: "Kare4uRCWidget", method: "GetDropDownValuesFor", api: "api/Kare4uRCWidget/GetDropDownValuesFor?standardCode=" };
    this._apiList["getSliderConfig"] = { controller: "Kare4uRCWidget", method: "GetMobileAppConfiguration", api: "api/Kare4uRCWidget/GetMobileAppConfiguration?module=" };
    this._apiList["getCityList"] = { controller: "Kare4uRCWidget", method: "GetActiveCity", api: "api/Kare4uRCWidget/GetActiveCity" };
    this._apiList["getLocation"] = { controller: "Kare4uRCWidget", method: "GetActiveLocation", api: "api/Kare4uRCWidget/GetActiveLocation?cityId=" };
    this._apiList["getVerifyOTP"] = { controller: "Kare4uRCWidget", method: "GetVerifyOTPForMobile", api: "api/Kare4uRCWidget/GetVerifyOTPForMobile" };
    this._apiList["getOTP"] = { controller: "Kare4uRCWidget", method: "GenerateOTPForMobile", api: "api/Kare4uRCWidget/GenerateOTPForMobile" };
    this._apiList["fbResigtration"] = { controller: "Kare4uRCWidget", method: "RegisterConsumerWithFBCredential", api: "api/Kare4uRCWidget/RegisterConsumerWithFBCredential" };
    this._apiList["gpResigtration"] = { controller: "Kare4uRCWidget", method: "RegisterConsumerWithGooglePlusCredential", api: "api/Kare4uRCWidget/RegisterConsumerWithGooglePlusCredential" };
    this._apiList["resetPassword"] = { controller: "Kare4uRCWidget", method: "ResetUserPassword", api: "api/Kare4uRCWidget/ResetUserPassword" };
    this._apiList["getAddress"] = { controller: "https://maps.googleapis.com/maps/api", method: "geocode", api: "https://maps.googleapis.com/maps/api/geocode/json" };
    this._apiList["updateUserContactInfo"] = { controller: "Kare4uRCWidget", method: "UpdateUserIDOrPassword", api: "api/Kare4uRCWidget/UpdateUserIDOrPassword" };
    this._apiList["getLoggedInUserProfile"] = { controller: "Kare4uRCWidget", method: "GetLoggedOnConsumerDetails", api: "api/Kare4uRCWidget/GetLoggedOnConsumerDetails" };
    this._apiList["updateUserProfile"] = { controller: "Kare4uRCWidget", method: "UpdateConsumerBasicProfileForMobile", api: "api/Kare4uRCWidget/UpdateConsumerBasicProfileForMobile" };
    this._apiList["updateUserProfilePic"] = { controller: "Kare4uRCWidget", method: "UploadProfilePicture", api: "api/Kare4uRCWidget/UploadProfilePicture" };
    this._apiList["userLogOut"] = { controller: "Kare4uRCWidget", method: "Logout", api: "api/Kare4uRCWidget/Logout" };
    this._apiList["getActiveCountryAndState"] = { controller: "Kare4uRCWidget", method: "GetActiveCountryAndState", api: "api/Kare4uRCWidget/GetActiveCountryAndState" };
    this._apiList["addUserShippingAddress"] = { controller: "Kare4uRCWidget", method: "StoreConsumerShippingAddress", api: "api/Kare4uRCWidget/StoreConsumerShippingAddress" };
    this._apiList["getUserShippingAddress"] = { controller: "Kare4uRCWidget", method: "GetConsumerShippingAddress", api: "api/Kare4uRCWidget/GetConsumerShippingAddress?groupEntityId=" };
    this._apiList["deleteAddress"] = { controller: "Kare4uRCWidget", method: "DeleteConsumerShippingAddress", api: "api/Kare4uRCWidget/DeleteConsumerShippingAddress" };
    this._apiList["updateAddress"] = { controller: "Kare4uRCWidget", method: "UpdateConsumerShippingAddress", api: "api/Kare4uRCWidget/UpdateConsumerShippingAddress" };
    this._apiList["getFamily"] = { controller: "Kare4uRCWidget", method: "GetFamilyList", api: "api/Kare4uRCWidget/GetFamilyList" };
    this._apiList["updateFamilyMember"] = { controller: "Kare4uRCWidget", method: "UpdateFamilyMember", api: "api/Kare4uRCWidget/UpdateFamilyMember" };
    this._apiList["addFamilyMember"] = { controller: "Kare4uRCWidget", method: "RegisterFamilyMember", api: "api/Kare4uRCWidget/RegisterFamilyMember" };
    //this._apiList["getMedication"] = { controller: "Kare4uRCWidget", method: "ListOfDrugsForAutocomplete", api: "api/Kare4uRCWidget/ListOfDrugsForAutocomplete?term=" };
    this._apiList["getAppVersion"] = { controller: "Kare4uRCWidget", method: "GetCurrentVersionOfApp", api: "api/Kare4uRCWidget/GetCurrentVersionOfApp" };
    this._apiList["getValidateEmailAndMobile"] = { controller: "Kare4uRCWidget", method: "ValidateEmailAndMobile", api: "api/Kare4uRCWidget/ValidateEmailAndMobile" };
    this._apiList["getConsumerDigitalDocuments"] = { controller: "Kare4uRCWidget", method: "RetriveConsumerDigitalDocumentsForMobile", api: "api/Kare4uRCWidget/RetriveConsumerDigitalDocumentsForMobile" };
    this._apiList["getConsumerDigitalDocumentsByDoc"] = { controller: "Kare4uRCWidget", method: "RetriveConsumerDigitalDocumentsByDocForMobile", api: "api/Kare4uRCWidget/RetriveConsumerDigitalDocumentsByDocForMobile" };
    this._apiList["getConsumerUploadedDocSize"] = { controller: "Kare4uRCWidget", method: "RetriveConsumerDigitalDocumentsByDocForMobile", api: "api/Kare4uRCWidget/RetriveConsumerDigitalDocumentsByDocForMobile" };
    this._apiList["deleteHealthRecordUploadedByConsumer"] = { controller: "Kare4uRCWidget", method: "DeleteConsumerDigitalDocumentsForMob", api: "api/Kare4uRCWidget/DeleteConsumerDigitalDocumentsForMob" };
    this._apiList["deleteHealthRecordUploadedByProvider"] = { controller: "Kare4uRCWidget", method: "DeleteConsumerDigitalDocumentsUploadedByProvider", api: "api/Kare4uRCWidget/DeleteConsumerDigitalDocumentsUploadedByProvider" };
    this._apiList["downloadHealthRecord"] = { controller: "Kare4uRCWidget", method: "DownloadFileFromAWSForMobile", api: "api/Kare4uRCWidget/DownloadFileFromAWSForMobile" };
    this._apiList["getFamilyListForDropDown"] = { controller: "Kare4uRCWidget", method: "GetFamilyListForDropDown", api: "api/Kare4uRCWidget/GetFamilyListForDropDown" };
    this._apiList["getAutoCompleteSearch"] = { controller: "Kare4uRCWidget", method: "GetAutoCompleteSearch", api: "api/Kare4uRCWidget/GetAutoCompleteSearch" };
    this._apiList["getUserUpcomingAppo"] = { controller: "Kare4uRCWidget", method: "RetrieveUpcomingAppointments", api: "api/Kare4uRCWidget/RetrieveUpcomingAppointments" };
    this._apiList["getUserPastAppo"] = { controller: "Kare4uRCWidget", method: "RetrievePastAppointments", api: "api/Kare4uRCWidget/RetrievePastAppointments" };
    this._apiList["getDoctorsByKeyword"] = { controller: "Kare4uRCWidget", method: "GetAllDoctors", api: "api/Kare4uRCWidget/GetAllDoctors" };
    this._apiList["getHospitalsByKeyword"] = { controller: "Kare4uRCWidget", method: "GetAllHospitals", api: "api/Kare4uRCWidget/GetAllHospitals" };
    this._apiList["getSpecializations"] = { controller: "Kare4uRCWidget", method: "GetAllSpecializationByCityId", api: "api/Kare4uRCWidget/GetAllSpecializationByCityId" };
    this._apiList["getDoctors"] = { controller: "Kare4uRCWidget", method: "GetAllDoctorsByCityId", api: "api/Kare4uRCWidget/GetAllDoctorsByCityId" };
    this._apiList["getDoctorDetails"] = { controller: "Kare4uRCWidget", method: "GetProviderProfileDetails", api: "api/Kare4uRCWidget/GetProviderProfileDetails" };
    this._apiList["getUniqueToken"] = { controller: "Kare4uRCWidget", method: "RetriveUniqueToken", api: "api/Kare4uRCWidget/RetriveUniqueToken" };
    this._apiList["uploadUserRecord"] = { controller: "Kare4uRCWidget", method: "UploadDigitalDocumentsForMobile", api: "api/Kare4uRCWidget/UploadDigitalDocumentsForMobile" };
    this._apiList["updateDigitalDocuments"] = { controller: "Kare4uRCWidget", method: "UpdateDigitalDocumentsForMobile", api: "api/Kare4uRCWidget/UpdateDigitalDocumentsForMobile" };
    this._apiList["saveDocRatingByUser"] = { controller: "Kare4uRCWidget", method: "UploadDigitalDocumentsForMobile", api: "api/Kare4uRCWidget/UploadDigitalDocumentsForMobile" };
    this._apiList["saveDocFavouriteByUser"] = { controller: "Kare4uRCWidget", method: "UploadDigitalDocumentsForMobile", api: "api/Kare4uRCWidget/UploadDigitalDocumentsForMobile" };
    this._apiList["getFeedbackQuestionsForDoctor"] = { controller: "Kare4uRCWidget", method: "GetFeedbackQuestions", api: "api/Kare4uRCWidget/GetFeedbackQuestions" };
    this._apiList["submitConsumerFeedbackForDoctor"] = { controller: "Kare4uRCWidget", method: "SubmitConsumerPlatformFeedback", api: "api/Kare4uRCWidget/SubmitConsumerPlatformFeedback" };
    this._apiList["getProviderFeedback"] = { controller: "Kare4uRCWidget", method: "GetProviderFeedback", api: "api/Kare4uRCWidget/GetProviderFeedback" };
    this._apiList["getMyFavDoctors"] = { controller: "Kare4uRCWidget", method: "GetMyFavouriteDoctors", api: "api/Kare4uRCWidget/GetMyFavouriteDoctors" };
    this._apiList["setMyFavDoctors"] = { controller: "Kare4uRCWidget", method: "AddMyFavouriteDoctor", api: "api/Kare4uRCWidget/AddMyFavouriteDoctor" };
    this._apiList["saveUserRating"] = { controller: "Kare4uRCWidget", method: "RateDoctorByUser", api: "api/Kare4uRCWidget/RateDoctorByUser" };
    this._apiList["getSevenDaysAvailability"] = { controller: "Kare4uRCWidget", method: "GetSevenDaysAvailability", api: "api/Kare4uRCWidget/GetSevenDaysAvailability" };
    this._apiList["getFreeScheduleForDayForSelectedDate"] = { controller: "Kare4uRCWidget", method: "GetFreeScheduleForDayForSelectedDate", api: "api/Kare4uRCWidget/GetFreeScheduleForDayForSelectedDate" };
    this._apiList["scheduleAppointmentForUser"] = { controller: "Kare4uRCWidget", method: "ScheduleAppointmentForSelf", api: "api/Kare4uRCWidget/ScheduleAppointmentForSelf" };
    this._apiList["scheduleAppointmentForFamily"] = { controller: "Kare4uRCWidget", method: "ScheduleAppointmentForFamily", api: "api/Kare4uRCWidget/ScheduleAppointmentForFamily" };
    this._apiList["getUserUpcomingAppointment"] = { controller: "Kare4uRCWidget", method: "GetListOfFutureAppointmentsForConsumer", api: "api/Kare4uRCWidget/GetListOfFutureAppointmentsForConsumer" };
    this._apiList["cancelAppointment"] = { controller: "Kare4uRCWidget", method: "CancelAppointment", api: "api/Kare4uRCWidget/CancelAppointment" };
    this._apiList["checkContactExistOrNot"] = { controller: "Kare4uRCWidget", method: "CheckContactExistOrNot", api: "api/Kare4uRCWidget/CheckContactExistOrNot" };
    this._apiList["sendSMSThroughSNS"] = { controller: "Kare4uRCWidget", method: "SendSMSThroughSNS", api: "api/Kare4uRCWidget/SendSMSThroughSNS" };
    this._apiList["sendEmailThroughSNS"] = { controller: "Kare4uRCWidget", method: "SendEmailThroughSNS", api: "api/Kare4uRCWidget/SendEmailThroughSNS" };
    this._apiList["getProviderRating"] = { controller: "Kare4uRCWidget", method: "GetDoctorRating", api: "api/Kare4uRCWidget/GetDoctorRating" };
    this._apiList["getHospitals"] = { controller: "Kare4uRCWidget", method: "GetHospitalListByProviderId", api: "api/Kare4uRCWidget/GetHospitalListByProviderId" };
    this._apiList["removeMyFavDoctors"] = { controller: "Kare4uRCWidget", method: "RemoveFavouriteDoctor", api: "api/Kare4uRCWidget/RemoveFavouriteDoctor" };
    this._apiList["getRecentAppointmentList"] = { controller: "Kare4uRCWidget", method: "GetRecentAppointmentList", api: "api/Kare4uRCWidget/GetRecentAppointmentList" };
    this._apiList["getSpecificProviderProfile"] = { controller: "Kare4uRCWidget", method: "GetSpecificProviderProfile", api: "api/Kare4uRCWidget/GetSpecificProviderProfile" };
    this._apiList["getDoctorsAndSpecsForHospital"] = { controller: "Kare4uRCWidget", method: "GetDoctorsAndSpecializationDetails", api: "api/Kare4uRCWidget/GetDoctorsAndSpecializationDetails" };
    this._apiList["getListOfSymptoms"] = { controller: "Kare4uRCWidget", method: "ListOfSymptoms", api: "api/Kare4uRCWidget/ListOfSymptoms" };
    this._apiList["getHospitalDetails"] = { controller: "Kare4uRCWidget", method: "GetHospitalDetails", api: "api/Kare4uRCWidget/GetHospitalDetails" };
    this._apiList["getUserEhrHistory"] = { controller: "Kare4uRCWidget", method: "SavaEHRHistory", api: "api/Kare4uRCWidget/SavaEHRHistory" };
    this._apiList["getConsumerDigitalDocumentList"] = { controller: "Kare4uRCWidget", method: "RetriveConsumerDigitalDocuments", api: "api/Kare4uRCWidget/RetriveConsumerDigitalDocuments" };
    this._apiList["getConsumerDigitalDocumentListByDoc"] = { controller: "Kare4uRCWidget", method: "RetriveConsumerDigitalDocumentsByDoctorByLab", api: "api/Kare4uRCWidget/RetriveConsumerDigitalDocumentsByDoctorByLab" };
    this._apiList["getConsumerDigitalDocumentListByDocByLab"] = { controller: "Kare4uRCWidget", method: "RetriveConsumerDigitalDocumentsByDoctorByLab", api: "api/Kare4uRCWidget/RetriveConsumerDigitalDocumentsByDoctorByLab" };
    this._apiList["getUserDetailsByContactNumber"] = { controller: "Kare4uRCWidget", method: "GetUserDetailsByContactNumber", api: "api/Kare4uRCWidget/GetUserDetailsByContactNumber" };
    this._apiList["generateTempOTPForMobile"] = { controller: "Kare4uRCWidget", method: "GenerateTempOTPForMobile", api: "api/Kare4uRCWidget/GenerateTempOTPForMobile" };
    this._apiList["getVarifyTempOTPForMobile"] = { controller: "Kare4uRCWidget", method: "GetVerifyTempOTPForMobile", api: "api/Kare4uRCWidget/GetVerifyTempOTPForMobile" };
    this._apiList["updateConsumerOTP"] = { controller: "Kare4uRCWidget", method: "UpdateConsumerOTP", api: "api/Kare4uRCWidget/UpdateConsumerOTP" };
    this._apiList["getNotifications"] = { controller: "Kare4uRCWidget", method: "GetNotificationCofiguration", api: "api/Kare4uRCWidget/GetNotificationCofiguration" };
    this._apiList["saveNotification"] = { controller: "Kare4uRCWidget", method: "SaveNotification", api: "api/Kare4uRCWidget/SaveNotification" };
    this._apiList["getUserNotification"] = { controller: "Kare4uRCWidget", method: "GetUserNotifications", api: "api/Kare4uRCWidget/GetUserNotifications" };
    this._apiList["removeUserNotification"] = { controller: "Kare4uRCWidget", method: "RemoveUserNotifications", api: "api/Kare4uRCWidget/RemoveUserNotifications" };
    this._apiList["resendOTP"] = { controller: "Kare4uRCWidget", method: "ResendOTP", api: "api/Kare4uRCWidget/ResendOTP" };
    this._apiList["resendTempOTP"] = { controller: "Kare4uRCWidget", method: "ResendTempOTP", api: "api/Kare4uRCWidget/ResendTempOTP" };
    this._apiList["getPopularSearch"] = { controller: "Kare4uRCWidget", method: "GetPopularSearchDetails", api: "api/Kare4uRCWidget/GetPopularSearchDetails" };
    this._apiList["getProviderAppointmentFees"] = { controller: "Kare4uRCWidget", method: "GetProviderAppointmentFees", api: "api/Kare4uRCWidget/GetProviderAppointmentFees" };

    this._apiList["addPatientAllergies"] = { controller: "Kare4uRCWidget", method: "AddPatientAllergies", api: "api/Kare4uRCWidget/AddPatientAllergies" };
    this._apiList["addPatientMedication"] = { controller: "Kare4uRCWidget", method: "AddPatientMedication", api: "api/Kare4uRCWidget/AddPatientMedication" };
    this._apiList["addPatientChronicDisease"] = { controller: "Kare4uRCWidget", method: "AddPatientChronicDisease", api: "api/Kare4uRCWidget/AddPatientChronicDisease" };
    this._apiList["getMedicaHistory"] = { controller: "Kare4uRCWidget", method: "GetMedicalInformation", api: "api/Kare4uRCWidget/GetMedicalInformation" };
    this._apiList["getNotificationStatus"] = { controller: "Kare4uRCWidget", method: "ChangeNotificationSeenStatus", api: "api/Kare4uRCWidget/ChangeNotificationSeenStatus" };
    this._apiList["getPackageAgeGroups"] = { controller: "HealthPackage", method: "GetPackageAgeGroups", api: "api/HealthPackage/GetPackageAgeGroups" };
    this._apiList["getHealthPackageList"] = { controller: "HealthPackage", method: "GetHealthPackages", api: "api/HealthPackage/GetHealthPackages" };
    this._apiList["addMedicineReminder"] = { controller: "Kare4uRCWidget", method: "AddMedicineReminder", api: "api/Kare4uRCWidget/AddMedicineReminder" };
    this._apiList["getMedicineReminder"] = { controller: "Kare4uRCWidget", method: "GetMedicineReminder", api: "api/Kare4uRCWidget/GetMedicineReminder" };
    this._apiList["deleteReminder"] = { controller: "Kare4uRCWidget", method: "DeleteReminder", api: "api/Kare4uRCWidget/DeleteReminder" };
    this._apiList["deleteAllReminder"] = { controller: "Kare4uRCWidget", method: "DeleteAllReminder", api: "api/Kare4uRCWidget/DeleteAllReminder" };
    this._apiList["getVideoBlog"] = { controller: "Kare4uRCWidget", method: "GetVideoBlogs", api: "api/Kare4uRCWidget/GetVideoBlogs" };
    this._apiList["getLabSettingsForGroupEntity"] = { controller: "DiagnosticCentre", method: "GetLabSettingsForGroupEntity", api: "api/DiagnosticCentre/GetLabSettingsForGroupEntity" };
    this._apiList["updateUserDeviceToken"] = { controller: "Kare4uRCWidget", method: "UpdateUserDeviceTokenId", api: "api/Kare4uRCWidget/UpdateUserDeviceTokenId" };
    this._apiList["downloadUniqueTokenForProviderUploadedFile"] = { controller: "ProviderGroup", method: "DownloadFileFromAWSForMobileForHospital", api: "api/ProviderGroup/DownloadFileFromAWSForMobileForHospital" };
    this._apiList["generateOTPForEmail"] = { controller: "Kare4uRCWidget", method: "GenerateOTPForEmail", api: "api/Kare4uRCWidget/GenerateOTPForEmail" };
    this._apiList["storeAppointmentDetailsBeforePGconfirmation"] = { controller: "Kare4uRCWidget", method: "StoreAppointmentDetailsBeforePGconfirmation", api: "api/Kare4uRCWidget/StoreAppointmentDetailsBeforePGconfirmation" };
    this._apiList["getAppointmentResponseAfterPG"] = { controller: "Kare4uRCWidget", method: "GetAppointmentDetailsAfterPG", api: "api/Kare4uRCWidget/GetAppointmentDetailsAfterPG" };
    this._apiList["getVarifyCouponCode"] = { controller: "Kare4uRCWidget", method: "ApplyCouponCode", api: "api/Kare4uRCWidget/ApplyCouponCode" };
    this._apiList["storePremiumSubscriptionDetailsBeforePG"] = { controller: "Kare4uRCWidget", method: "StorePremiumSubscriptionDetailsBeforePG", api: "api/Kare4uRCWidget/StorePremiumSubscriptionDetailsBeforePG" };
    this._apiList["getUpcomingBookedHealthPackagesForConsumer"] = { controller: "HealthPackage", method: "GetUpcomingBookedHealthPackagesForConsumer", api: "api/HealthPackage/GetUpcomingBookedHealthPackagesForConsumer" };
    this._apiList["getPastBookedHealthPackagesForConsumer"] = { controller: "HealthPackage", method: "GetPastBookedHealthPackagesForConsumer", api: "api/HealthPackage/GetPastBookedHealthPackagesForConsumer" };
    this._apiList["sendPharmacyFeedback"] = { controller: "Kare4uRCWidget", method: "SendPharmacyFeedback", api: "api/Kare4uRCWidget/SendPharmacyFeedback" };
    this._apiList["getWalletTransactions"] = { controller: "Kare4uRCWidget", method: "GetWalletTransactions", api: "api/Kare4uRCWidget/GetWalletTransactions" };
    this._apiList["getFeedBackQus"] = { controller: "Kare4uRCWidget", method: "GetFeedbackQuestions", api: "api/Kare4uRCWidget/GetFeedbackQuestions" };
    this._apiList["getTicketType"] = { controller: "Kare4uRCWidget", method: "GetDropDownValuesFor", api: "api/Kare4uRCWidget/GetDropDownValuesFor" };
    this._apiList["submitTicket"] = { controller: "ConsumerTicket", method: "CreateConsumerTicket", api: "api/ConsumerTicket/CreateConsumerTicket" };

    this._apiList["getReferralsByDoctorForConsumer"] = { controller: "MedicalRecord", method: "GetReferralsByDoctorForConsumer", api: "api/MedicalRecord/GetReferralsByDoctorForConsumer" };
    this._apiList["GetMedicalRecordShareRequestsForConsumerBasedOnReferral"] = { controller: "MedicalRecord", method: "GetMedicalRecordShareRequestsForConsumerBasedOnReferral", api: "api/MedicalRecord/GetMedicalRecordShareRequestsForConsumerBasedOnReferral" };
    this._apiList["downloadFileFromAWSForMobileForHospital"] = { controller: "ProviderGroup", method: "DownloadFileFromAWSForMobileForHospital", api: "api/ProviderGroup/DownloadFileFromAWSForMobileForHospital" };
    this._apiList["UpdateMedicalRecordShareRequests"] = { controller: "MedicalRecord", method: "UpdateMedicalRecordShareRequests", api: "api/MedicalRecord/UpdateMedicalRecordShareRequests" };
    this._apiList["GetChildrens"] = { controller: "Vaccination", method: "GetChildren", api: "api/Vaccination/GetChildren" };
    this._apiList["GetVaccinations"] = { controller: "Vaccination", method: "GetVaccinationDetailsGroup", api: "api/Vaccination/GetVaccinationDetailsGroup?consumerId=" };
    this._apiList["CreateVaccination"] = { controller: "Vaccination", method: "CreateVaccinationDetails", api: "api/Vaccination/CreateVaccinationDetails?consumerId=" };
    this._apiList["completevaccineGroup"] = { controller: "Vaccination", method: "UpdateVaccinationList", api: "api/Vaccination/UpdateVaccinationList" };
    this._apiList["getValidateEmailAndMobileBeforeLogin"] = { controller: "Kare4uRCWidget", method: "ValidateEmailAndMobileBeforeLogin", api: "api/Kare4uRCWidget/ValidateEmailAndMobileBeforeLogin" };
    // this._apiList["getVarifyOTPForLogin"] = { controller: "Kare4uRCWidget", method: "ValidateEmailAndMobileBeforeLogin", api: "api/Kare4uRCWidget/ValidateEmailAndMobileBeforeLogin" };
    // this._apiList["getLoginWithOTOP"] = { controller: "Kare4uRCWidget", method: "ValidateEmailAndMobileBeforeLogin", api: "api/Kare4uRCWidget/ValidateEmailAndMobileBeforeLogin" };

    //Diagnostic center Module
    this._apiList["getHealthPackageProfile"] = { controller: "DiagnosticCentre", method: "GetLabPackage", api: "api/DiagnosticCentre/GetLabPackage" };
    this._apiList["getLabTestProfile"] = { controller: "DiagnosticCentre", method: "GetLabTest", api: "api/DiagnosticCentre/GetLabTest" };
    this._apiList["getHealthPackageList"] = { controller: "DiagnosticCentre", method: "GetLabPackages", api: "api/DiagnosticCentre/GetLabPackages" };
    this._apiList["getLabTestList"] = { controller: "DiagnosticCentre", method: "GetLabTests", api: "api/DiagnosticCentre/GetLabTests" };
    this._apiList["scheduleHealthPackageThroughPayment"] = { controller: "DiagnosticCentre", method: "BookDiagnosticCenterOrder", api: "api/DiagnosticCentre/BookDiagnosticCenterOrder" };
    this._apiList["getLabProfileList"] = { controller: "DiagnosticCentre", method: "GetLabProfiles", api: "api/DiagnosticCentre/GetLabProfiles" };
    this._apiList["getLabProfile"] = { controller: "DiagnosticCentre", method: "GetLabProfile", api: "api/DiagnosticCentre/GetLabProfile" };
    this._apiList["getPackageGender"] = { controller: "DiagnosticCentre", method: "GetPackageGenders", api: "api/DiagnosticCentre/GetPackageGenders" };
    this._apiList["getwalletRedeemDetails"] = { controller: "DiagnosticCentre", method: "GetRedeemableConsumerWalletForCart", api: "api/DiagnosticCentre/GetRedeemableConsumerWalletForCart" };

    //Health plan Module
    this._apiList["getSubscribedPlan"] = { controller: "HealthPlan", method: "GetConsumerSubscribedHealthPlans", api: "api/HealthPlan/GetConsumerSubscribedHealthPlans" };
    this._apiList["getHealthPlan"] = { controller: "HealthPlan", method: "GetHealthProHealthPlans", api: "api/HealthPlan/GetHealthProHealthPlans" };
    this._apiList["getYogaAndExcerciseInfo"] = { controller: "DiagnosticCentre", method: "GetLabPackage", api: "api/DiagnosticCentre/GetLabPackage" };
    this._apiList["getTrackProgress"] = { controller: "DiagnosticCentre", method: "GetLabPackage", api: "api/DiagnosticCentre/GetLabPackage" };
    this._apiList["getKnowledgeTransfer"] = { controller: "DiagnosticCentre", method: "GetLabPackage", api: "api/DiagnosticCentre/GetLabPackage" };
    this._apiList["getNotificationSettingConfig"] = { controller: "HealthPlan", method: "GetConsumerNotificationPreference", api: "api/HealthPlan/GetConsumerNotificationPreference" };
    this._apiList["saveHealthPlanNotification"] = { controller: "HealthPlan", method: "SaveConsumerNotificationPreference", api: "api/HealthPlan/SaveConsumerNotificationPreference" };
    this._apiList["getHealthplanAppointmentHistory"] = { controller: "HealthPlan", method: "GetHealthPlanLineItems", api: "api/HealthPlan/GetHealthPlanLineItems" };
    this._apiList["savehealthPlanStatus"] = { controller: "HealthPlan", method: "SaveConsumerHealthPlanLineItemResponse", api: "api/HealthPlan/SaveConsumerHealthPlanLineItemResponse" };
    this._apiList["getAppoDetails"] = { controller: "HealthPlan", method: "GetHealthPlanLineItemDetails", api: "api/HealthPlan/GetHealthPlanLineItemDetails" };
    this._apiList["getHealthPlanUniqueToken"] = { controller: "HealthPlan", method: "RetriveUniqueToken", api: "api/HealthPlan/RetriveUniqueToken" };
    this._apiList["saveHealthPlanAppoDetails"] = { controller: "HealthPlan", method: "SaveConsumerHealthPlanLineItemResponse", api: "api/HealthPlan/SaveConsumerHealthPlanLineItemResponse" };
    this._apiList["getHealthPlanSubscriberDetails"] = { controller: "HealthPlan", method: "GetHealthPlanSubscriberDetails", api: "api/HealthPlan/GetHealthPlanSubscriberDetails" };

    this._apiList["getSpecialConditionsForHealthPlan"] = { controller: "HealthPlan", method: "GetSpecialConditionsForHealthPlan", api: "api/HealthPlan/GetSpecialConditionsForHealthPlan" };
    this._apiList["saveHealthPlanData"] = { controller: "HealthPlan", method: "SaveHealthPlanData", api: "api/HealthPlan/SaveHealthPlanData" };
    this._apiList["getHealthPlanLineItems"] = { controller: "HealthPlan", method: "GetHealthPlanLineItems", api: "api/HealthPlan/GetHealthPlanLineItems" };

    this._apiList["getHealthPlanActionItemsForDashboard"] = { controller: "HealthPlan", method: "GetHealthPlanActionItemsForDashboard", api: "api/HealthPlan/GetHealthPlanActionItemsForDashboard" };
    this._apiList["getConsumerHealthPlanData"] = { controller: "HealthPlan", method: "GetConsumerHealthPlanData", api: "api/HealthPlan/GetConsumerHealthPlanData" };
    this._apiList["saveHealthJournal"] = { controller: "HealthPlan", method: "SaveHealthPlanJournal", api: "api/HealthPlan/SaveHealthPlanJournal" };
    this._apiList["getHealthPlanJournals"] = { controller: "HealthPlan", method: "GetHealthPlanJournalsForConsumer", api: "api/HealthPlan/GetHealthPlanJournalsForConsumer" };
    this._apiList["getHealthPlanJournalDetails"] = { controller: "HealthPlan", method: "GetHealthPlanJournal", api: "api/HealthPlan/GetHealthPlanJournal" };
    this._apiList["downloadHealthPlanUniqueToken"] = { controller: "HealthPlan", method: "DownloadFileFromAWSForMobile", api: "api/HealthPlan/DownloadFileFromAWSForMobile" };

    //only one api with healthplanid=0 returns all diet plans.
    this._apiList["getPlan"] = { controller: "HealthPlan", method: "GetHealthPlanStaticRecords", api: "api/HealthPlan/GetHealthPlanStaticRecords" };
    this._apiList["getPendingAndApproachingHealthPlanLineItems"] = { controller: "HealthPlan", method: "GetPendingAndApproachingHealthPlanLineItems", api: "api/HealthPlan/GetPendingAndApproachingHealthPlanLineItems" };
    this._apiList["getTrimesterResponse"] = { controller: "HealthPlan", method: "GetConsumerHealthPlanJournalsForTrimester", api: "api/HealthPlan/GetConsumerHealthPlanJournalsForTrimester" };
    this._apiList["getHealthPlanJournalsForConsumerByDate"] = { controller: "HealthPlan", method: "GetHealthPlanJournalsForConsumerByDate", api: "api/HealthPlan/GetHealthPlanJournalForConsumerByDate" };
    this._apiList["makeFavouriteHealthPlanJournal"] = { controller: "HealthPlan", method: "MakeFavouriteHealthPlanJournal", api: "api/HealthPlan/MakeFavouriteHealthPlanJournal" };
    // this._apiList["getYogaAndExcerciseDetails"] = { controller: "HealthPlan", method: "GetHealthPlanStaticRecords", api: "api/HealthPlan/GetHealthPlanStaticRecords" };

  }
  getAppVersion() {
    return this._appVersion;
  }
  getAppTitle() {
    return this.appTtitle;
  }
  getGoogleApiKey() {
    return this.google_api_key;
  }
  getUserDefaultPassword() {
    return this.defaulPassword;
  }
  getAllSearchData() {
    return this.getAllSearcheddata = {
      "size": 0,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [

          ]
        }
      },
      "aggs": {
        "by_type": {
          "terms": { "field": "ProviderType" },
          "aggs": {
            "tops": {
              "top_hits": {
                "size": 5,
                "stored_fields": ["_source"],
                "script_fields": {
                  "distance": {
                    "script": {
                      "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
                      "lang": "painless",
                      "params": {
                        "lat": "",
                        "lon": ""
                      }
                    }
                  }
                },
                "sort": [
                  {
                    "_geo_distance": {
                      "Latlong": "",
                      "order": "asc",
                      "unit": "km",
                      "distance_type": "plane"
                    }
                  }
                ]
              }
            }
          }
        }
      }
    };
  }
  getSearchedHospitalList() {
    return this.getHospitalList = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "filter": [
            { "term": { "ProviderType": 11 } }
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    };
  }
  getEmergencyHospitalList() {
    return this.getEmergencyHospitals = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "filter": [
            { "term": { "ProviderType": 11 } }
          ]
        }
      }
    };
  }
  getAllDrugList() {
    return this.getDrugList = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "filter": [
          ]
        }
      }
    }
  }
  getAllDrugListByKeyword() {
    return this.getDrugListBySearchedKeyword = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [
          ]
        }
      }
    }
  }
  getAllDiasesList() {
    return this.getDiasesList = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "filter": [
          ]
        }
      }
    }
  }
  getAllDiasesListByKeyword() {
    return this.getAllDiasesByKeyword = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [
          ]
        }
      }
    }
  }
  getSearchedDoctorListByHospitalId() {
    return this.getSearchedDoctors = {
      "size": 20,
      "from": 0,
      "query": {
        "constant_score": {
          "filter": {
            "bool": {
              "must": [
                { "term": { "GroupEntityID": "" } },
                { "term": { "ProviderType": 10 } }
              ]
            }
          }

        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
  }
  getSearchedDoctorList() {
    return this.getSearchedDoctors = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [
            { "term": { "ProviderType": 10 } }
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    };
  }
  getSearchedHospitalsByKeyword() {
    return this.getSearchedHospitals = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [
            { "term": { "ProviderType": 11 } }
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    };
  }
  getSearchedSpecializationList() {
    return this.getSpecializationList = {
      "size": 0,
      "from": 0,
      "query": {
        "bool": {
          "filter": [
          ]
        }
      },
      "aggs": {
        "by_type": {
          "terms": { "field": "SpecialisationDesc", "size": 1000, },

          "aggs": {
            "tops": {
              "top_hits": {
                "size": 1,
                "_source": {
                  "includes": ["SpecialisationCode", "SpecialisationDesc"]
                }
              }
            }
          }
        }
      }
    };
  }
  getDoctorsBySlelectedSpecId() {
    return this.getDoctorsBySpecId = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "filter": [
            { "term": { "ProviderType": 10 } },
          ]
        }
      }
    };
  }
  getDoctorListByHospitalId() {
    return this.getDoctorsByHospitalId = {
      "size": 20,
      // "form":0,
      "query": {
        "bool": {
          "filter": [
            { "term": { "ProviderType": 10 } },
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    };
  }
  getSurgeryByGenericSearchKeyword() {
    return this.getSurgeries = {
      "size": 20,
      "_source": ["SurgeryProviderID", "Surgery", "SurgeryId"],
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [
            { "term": { "_type": "Surgery" } }
          ]
        }
      }
    }
  }
  getSurgeryByKeyword() {
    return this.getSurgeries = {
      "size": 20,
      "_source": ["SurgeryProviderID", "Surgery", "SurgeryId"],
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [
            { "term": { "_type": "Surgery" } }
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
  }
  getSurgeryList() {
    return this.surgeryList =
      {
        "size": 0,
        "aggs": {
          "by_type": {
            "terms": { "field": "Surgery", "size": 1000 },
            "aggs": {
              "tops": {
                "top_hits": {
                  "size": 1,
                  "_source": {
                    "includes": [""]
                  }
                }
              }
            }
          }
        }
      }
  }
  getDoctorsBySurgeryName() {
    return this.doctorsBySurgeryName = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "filter": [{
            "terms": {
              "ProviderID": [
              ]
            }
          }
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
  }
  getAllSearchSymptomList() {
    return this.getAllSearchedSymptomsdata = {
      "size": 0,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [

          ]
        }
      },
      "aggs": {
        "by_type": {
          "terms": { "field": "PrimarySymptom" },
          "aggs": {
            "tops": {
              "top_hits": {
                "size": 4
              }
            }
          }
        }
      }
    };
  }
  getSearchedEmergencyHospitalsByKeyword() {
    return this.getSearchedEmergencyHospitals = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [
            { "term": { "ProviderType": 12 } }
          ]
        }
      }
    };
  }
  getSearchedDiagnosticPackageByKeywords() {
    return this.getDiagnosticPackages = {
      "size": 5,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "multi_match": {
                "query": "",
                "fields": ["PackageName", "TestList"]
              }
            }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    };
  }
  getSearchedDiagnosticCenterByKeywords() {
    // return this.getDiagnosticCenters = {
    //   "size": 5,
    //   "from": 0,
    //   "query": {
    //     "bool": {
    //       "must": [
    //         {
    //           "multi_match": {
    //             "query": "",
    //             "fields": ["CenterName"]
    //           }
    //         }
    //       ],
    //       "filter": [
    //       ]
    //     }
    //   }
    // };
    return this.getDiagnosticCenters = {
      "size": 5,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "multi_match": {
                "query": "",
                "fields": [
                  "CenterName"
                ]
              }
            }
          ],
          "filter": [
          ]
        }
      },
      "aggs": {
        "by_Center": {
          "terms": {
            "field": "CenterID",
            "size": 10000
          },
          "aggs": {
            "tops": {
              "top_hits": {
                "size": 1,
                "_source": { "includes": ["CenterName", "City", "CenterID", "CityAreaName"] }
              }
            }
          }
        }
      }
    }
  }
  getLabScanList() {
    return this.getLabScans = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            // {
            //   "match_all": {}
            // }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
  }
  getHealthPackageList() {
    return this.getHealthPackages = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            // {
            //   "match_all": {}
            // }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
  }
  getDiagnosticCenterList() {
    return this.getDiagnosticCenters = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            // {
            //   "match_all": {}
            // }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
  }
  getLabTestList() {
    return this.getLabTests = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            // {
            //   "match_all": {}
            // }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    }
  }
  getHospitalEmergencyNumber() {
    return this.getEmergencyContact = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match_all": {}
            }
          ],
          "filter": [

          ]
        }
      }
    }
  }
  getHospitalEmergencyNumberByKeyword() {
    return this.getEmergencyContactList = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "multi_match": {
                "query": "",
                "fields": ["Hospital"]
              }
            }
          ],
          "filter": [
          ]
        }
      }
    }
  }
  getDCGenericSearchDataByKeyword() {
    return this.getDCResultBYSearchKeyword = {
      "size": 0,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [
          ]
        }
      },
      "aggs": {
        "by_type": {
          "terms": {
            "field": "_type"
          },
          "aggs": {
            "tops": {
              "top_hits": {
                "size": 5,
                "stored_fields": [
                  "_source"
                ],
                "script_fields": {
                  "distance": {
                    "script": {
                      "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
                      "lang": "painless",
                      "params": {
                        "lat": "",
                        "lon": ""
                      }
                    }
                  }
                },
                "sort": [
                  {
                    "_geo_distance": {
                      "Latlong": "",
                      "order": "asc",
                      "unit": "km",
                      "distance_type": "plane"
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  }
  getLabScanListBySearchKeyword() {
    return this.getLabScanBysearchKeyword = {
      "size": 5,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "multi_match": {
                "query": "",
                "fields": ["PackageName", "TestList"]
              }
            }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    };
  }
  getLabTestListBySearchKeyword() {
    return this.getLabTestBysearchKeyword = {
      "size": 5,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "multi_match": {
                "query": "",
                "fields": ["PackageName", "TestList"]
              }
            }
          ],
          "filter": [
          ]
        }
      },
      "stored_fields": ["_source"],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "plane"
          }
        }
      ]
    };
  }
  getDCSeeAllResultByKeyword() {
    return this.getDCSeeAllResultsByKeyword = {
      "size": 20,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "_all": {
                  "query": "",
                  "operator": "and"
                }
              }
            }
          ],
          "filter": [

          ]
        }
      },
      "stored_fields": [
        "_source"
      ],
      "script_fields": {
        "distance": {
          "script": {
            "inline": "doc['Latlong'].arcDistance(params.lat,params.lon) * 0.001",
            "lang": "painless",
            "params": {
              "lat": "",
              "lon": ""
            }
          }
        }
      },
      "sort": [
        {
          "_geo_distance": {
            "Latlong": "",
            "order": "asc",
            "unit": "km",
            "distance_type": "arc"
          }
        }
      ]
    }
  }
  // getDataFromStorage(key) {
  //   return this.storage.get(key).then((data) => {
  //     return data;
  //   });
  // };
  // setDataToStorage(key, value) {
  //   return this.storage.set(key, value).then((data) => {
  //     return data;
  //   });
  // };

  setStoreDataIncache(url, data) {
    let cacheKey = url;
    let uniqueKey = "Health-Pro-App-" + this.getParentGroupEntityId();
    let ttl = 60 * 60 * 24 * 7 * 30 * 12;
    //      let delayType="all";
    return this.cache.saveItem(cacheKey, data, uniqueKey, ttl);
  }
  getStoreDataFromCache(key) {
    return this.cache.getItem(key).catch((data) => {
      // fall here if item is expired or doesn't exist
      return false;
    }).then((data) => {
      return data;
    });
  }
  getPaymentApiURL() {
    return this.paymentAPIURL;
  }
  //Clear all cache
  clearAllCache() {
    return this.cache.clearAll();
  }
  closeCurrentPage() {
    this.appCtrl.getActiveNav().pop();
  }
  splitCountryCode(number) {
    return number.substring(0, number.length - 10);
  }
  splitMobileNumber(number) {
    return number.substring(number.length - 10, number.length);
  }
  getCacheKeyUrl(value) {
    return this._cacheKeyList[value];
  }
  getApiServiceUrl() {
    return this.apiServiceUrl;
  }
  getApiControllerName(value) {
    return this._apiList[value].api;
  }
  getGroupEntityId() {
    return this.groupEnitityId;
  }
  getParentGroupEntityId() {
    return this.parentGroupEntityId;
  }
  getTermsAndConditions() {
    return this.termsAnsConditions;
  }
  onEntryPageEvent(value) {
    this.flurryAnalytics = new FlurryAnalytics();
    const options = this.getFlurryAnalytics()
    let fa: FlurryAnalyticsObject = this.flurryAnalytics.create(options);
    fa.logEvent(value)
      .then(() => { })
      .catch(e => { });

  }
  onLoginSuccess() {
    this.flurryAnalytics = new FlurryAnalytics();
    const options = this.getFlurryAnalytics()
    let fa: FlurryAnalyticsObject = this.flurryAnalytics.create(options);
    let response = this.getCurrentLocation();
    this.geolocation.getCurrentPosition({ timeout: 20000, maximumAge: 10000 }).then((resp) => {
      let currentPosition: any = resp.coords;
      fa.setLocation(currentPosition, 'Logined from here')
        .then(() => { })
        .catch(e => { });
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    fa.logEvent('Login Clicked')
      .then(() => { })
      .catch(e => { });
  }
  onEventSuccessOrFailure(value) {
    this.flurryAnalytics = new FlurryAnalytics();
    const options = this.getFlurryAnalytics()
    let fa: FlurryAnalyticsObject = this.flurryAnalytics.create(options);
    fa.logEvent(value)
      .then(() => { })
      .catch(e => { });

  }
  getFlurryAnalytics() {
    //M8Q8BSDFVF8R2VVT4XFR ios flurry key
    //BKX4ZQR93ZVKQNS2YWGB android flurry key
    const options: FlurryAnalyticsOptions = {
      appKey: this.flurry_key,
      continueSessionSeconds: 3,
      gender: 'm',
      age: 38,
      logLevel: 'ERROR',
      enableLogging: true,
      enableEventLogging: false,
      enableCrashReporting: true,
      enableBackgroundSessions: true
    };
    return options;
  }
  validateEmail(email) {
    let email_reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email_reg.test(email);
  };
  validatePhone(phone) {
    let phone_reg = /^\d{10}$/
    return phone_reg.test(phone);
  }
  getWebsiteURL() {
    return this.websiteURL;
  }
  validateAlphanumeric(e) {
    var regex = /^[a-zA-Z0-9]+$/;
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
      return true;
    }
    e.preventDefault();
    return false;
  }
  validateOnlyNumber(event) {
    if (event.which == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 46)
      return true;

    else if ((event.which != 46 || $(this).val().toString().indexOf('.') != -1) && (event.which < 48 || event.which > 57))
      event.preventDefault();
  }
  isNumber(value) {
    let number_regx = /^\d+$/;
    return number_regx.test(value);
  }
  validatePassword(value) {
    //let passwordRegx = /^(?=([^\d]*\d){8})$/;
    return value.length >= 8 ? true : false;
  }
  validateOnlyNumbeAndText(evt, value) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (evt.which != 8 && evt.which != 0 && (evt.keyCode >= 48 && evt.keyCode <= 57) && (evt.keyCode >= 96 && evt.keyCode <= 105)) {
      return false;
    }
    if (this.isNumber(value)) {
      return true;
    }
    else {
      return false;
    }
  }
  checkActiveCityAndLocality() {
    let selectedLocalition = [];
    return this.getStoreDataFromCache(this._cacheKeyList["getActiveLocation"])
      .then((result) => {
        if ((result.activeCity != "" && result.activeCity != undefined) && (result.activeLocation != "" && result.activeLocation != undefined)) {
          selectedLocalition.push({ "term": { "City": result.activeCity } }, { "term": { "CityAreaName": result.activeLocation } });
        }
        else if ((result.activeCity != "" && result.activeCity != undefined) && (result.activeLocation == "" || result.activeLocation == undefined)) {
          selectedLocalition.push({ "term": { "City": result.activeCity } });
        }
        else {
          // this.onMessageHandler("Please select your location", 0);
        }
        return selectedLocalition;
      });
  }
  getCurrentLocation(): any {
    return this.geolocation.getCurrentPosition().then((resp) => {
      return resp;
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
  getAppType() {
    return this.appType;
  }
  getAWSEmailJsonFormat() {
    return this.awsEmailJsonFormat;
  }
  getAWSSMSJsonFormat() {
    return this.awsSMSJsonFormat;
  }
  isValidateForm(form): any {
    let status: boolean = true;
    for (let key in form.controls) {
      if (form.controls.hasOwnProperty(key)) {
        let control: FormControl = <FormControl>form.controls[key];
        if (!control.valid && !control.disabled) {
          if (key == "new_password") {
            return this.onMessageHandler("Password doesn't match", 0);
          }
          else if (key == "email_id") {
            status = this.validateEmail(control.value);
            if (!status) {
              return this.onMessageHandler("Please enter a valid email id", 0);
            }
          }
          else if (key == "mobile_number") {
            status = this.validatePhone(control.value);
            if (!status) {
              return this.onMessageHandler("Please enter a valid mobile number", 0);
            }
          }
          else {
            return this.onMessageHandler("Please enter " + key, 0);
          }
        }
        else {
          if (key == "email_id") {
            status = this.validateEmail(control.value);
            if (!status) {
              return this.onMessageHandler("Please enter a valid Email Id", 0);
            }
          }
          else if (key == "mobile_number") {
            status = this.validatePhone(control.value);
            if (!status) {
              return this.onMessageHandler("Please enter a valid mobile number", 0);
            }
          }
          else if (key == "password") {
            status = this.validatePassword(control.value);
            if (!status) {
              return this.onMessageHandler("Password must be at least 8 characters", 0);
            }
          }
          else if (key == "new_password") {
            status = this.validatePassword(control.value);
            if (!status) {
              return this.onMessageHandler("Password must be at least 8 characters", 0);
            }
          }
          else if (key == "tc") {
            if (!control.value) {
              return this.onMessageHandler("Please accept terms and conditions", 0);
            }
          }
          // else if (key == "new_password") {
          //   if (JSON.stringify(form.controls["new_password"].value) == JSON.stringify(control.value)) {
          //     status = true;
          //   }
          //   else {
          //     return this.onMessageHandler("Password doesn't match!", 0);
          //   }
          // }
          if (!status) {
            return this.onMessageHandler("Please enter a valid " + key, 0);
          }
          // this.dynamicFieldValidation(key, control.value);
        }
      }
    }
    return status;
  }
  // dynamicFieldValidation(key: string, value: string) {
  //   let status: boolean = true;
  //   switch (key) {
  //     case "email": {
  //       status = this.validateEmail(value);
  //       break;
  //     }
  //     case "mobile_number": {
  //       status = this.validatePhone(value);
  //       break;
  //     }
  //     default: {
  //       //statements; 
  //       break;
  //     }
  //   }
  //   if (!status) {
  //     return this.onMessageHandler("Please enter a valid " + key, 0);
  //   }
  // }
  ValidateDecimels(event) {
    let reg = /[0-9]?[0-9]?(\.[0-9][0-9])/;
    if (reg.test(event.target.value)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  convert_case(str) {
    return str.toLowerCase().replace(/\b./g, function (a) { return a.toUpperCase(); });
  }
  onMessageHandler(error_message, value) {
    let toast = this._toastCtrl.create({
      message: error_message,
      duration: 2000,
      cssClass: !value ? "error" : "success",
      showCloseButton: true
    });
    toast.present();
  }
}
