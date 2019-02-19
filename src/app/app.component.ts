import { Component, ViewChild } from '@angular/core';
import { Events, MenuController, Nav, Platform, AlertController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';;
import { ConferenceData } from '../providers/conference-data';
import { CommonServices } from "../providers/common.service";
import { StatusBar } from '@ionic-native/status-bar';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

// export interface PageInterface {
//   title: string;
//   name: string;
//   component: any;
//   icon: string;
//   logsOut?: boolean;
//   index?: number;
//   tabName?: string;
//   tabComponent?: any;
// }

@Component({
  templateUrl: 'app.template.html',
  providers: [StatusBar, Push]
})
export class HealthProApp {
  url: string;
  key: string;
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  // appPages: PageInterface[] = [
  //   { title: 'Schedule', name: 'TabsPage', component: TabsPage, tabComponent: SchedulePage, index: 0, icon: 'calendar' },
  //   { title: 'Speakers', name: 'TabsPage', component: TabsPage, tabComponent: SpeakerListPage, index: 1, icon: 'contacts' },
  //   { title: 'Map', name: 'TabsPage', component: TabsPage, tabComponent: MapPage, index: 2, icon: 'map' },
  //   { title: 'About', name: 'TabsPage', component: TabsPage, tabComponent: AboutPage, index: 3, icon: 'information-circle' }
  // ];
  // loggedInPages: PageInterface[] = [
  //   { title: 'Account', name: 'AccountPage', component: AccountPage, icon: 'person' },
  //   { title: 'Support', name: 'SupportPage', component: SupportPage, icon: 'help' },
  //   { title: 'Logout', name: 'TabsPage', component: TabsPage, icon: 'log-out', logsOut: true }
  // ];
  // loggedOutPages: PageInterface[] = [
  //   { title: 'Login', name: 'LoginPage', component: LoginPage, icon: 'log-in' },
  //   { title: 'Support', name: 'SupportPage', component: SupportPage, icon: 'help' },
  //   { title: 'Signup', name: 'SignupPage', component: SignupPage, icon: 'person-add' }
  // ];
  rootPage: any;
  constructor(
    public events: Events,
    public commonServices: CommonServices,
    public menu: MenuController,
    public platform: Platform,
    public confData: ConferenceData,
    public storage: Storage,
    public splashScreen: SplashScreen,
    public statusBar: StatusBar,
    public alertCtrl: AlertController,
    private push: Push
  ) {
    this.key = this.commonServices.getApiServiceUrl() + "/deviceId";
    this.url = this.commonServices.getApiServiceUrl() + "/hasSeenTutorial";
    // Check if the user has already seen the tutorial
    this.commonServices.getStoreDataFromCache(this.url)
      .then((hasSeenTutorial) => {
        if (!hasSeenTutorial) {
          this.rootPage = "TutorialPage";
          this.commonServices.setStoreDataIncache(this.url, true);
        } else {
          this.rootPage = "ApplicationStartUpPage";
        }
        this.platformReady()
      });

  }

  // openPage(page: PageInterface) {
  //   let params = {};

  //   // the nav component was found using @ViewChild(Nav)
  //   // setRoot on the nav to remove previous pages and only have this page
  //   // we wouldn't want the back button to show in this scenario
  //   if (page.index) {
  //     params = { tabIndex: page.index };
  //   }

  //   // If we are already on tabs just change the selected tab
  //   // don't setRoot again, this maintains the history stack of the
  //   // tabs even if changing them from the menu
  //   if (this.nav.getActiveChildNavs().length && page.index != undefined) {
  //     this.nav.getActiveChildNavs()[0].select(page.index);
  //   } else {
  //     // Set the root of the nav with params if it's a tab index
  //     this.nav.setRoot(page.name, params).catch((err: any) => {
  //       console.log(`Didn't set nav root: ${err}`);
  //     });
  //   }

  //   if (page.logsOut === true) {
  //     // Give the menu time to close before changing to logged out
  //     this.userData.logout();
  //   }
  // }

  // listenToLoginEvents() {
  //   this.events.subscribe('user:login', () => {
  //     this.enableMenu(true);
  //   });

  //   this.events.subscribe('user:signup', () => {
  //     this.enableMenu(true);
  //   });

  //   this.events.subscribe('user:logout', () => {
  //     this.enableMenu(false);
  //   });
  // }

  // enableMenu(loggedIn: boolean) {
  //   this.menu.enable(loggedIn, 'loggedInMenu');
  //   this.menu.enable(!loggedIn, 'loggedOutMenu');
  // }

  platformReady() {
    // Call any initial plugins when ready
    this.commonServices.onEntryPageEvent("App Installed");
    this.platform.ready().then(() => {
      this.splashScreen.hide();
      this.statusBar.backgroundColorByHexString("#047c92");
      this.statusBar.styleBlackOpaque();
      let key = this.commonServices.getApiServiceUrl();
      // let installedStatus = this.cache.getItem(key).catch((data) => {
      //   // fall here if item is expired or doesn't exist 
      //   this.appRootPage = "ApplicationStartUpPage";
      // }).then((data) => {
      //  if (data) {

      // Added by Ashis
      // Note: Please see the below link to get the Typescript code for phonegap-plugin-push
      // https://github.com/phonegap/phonegap-plugin-push/blob/master/docs/TYPESCRIPT.md
      const options: PushOptions = {
        android: {
          senderID: "1073663429783",
          vibrate: true,
          sound: false,
        },
        ios: {
          alert: 'true',
          badge: true,
          sound: 'false'
        }
      };

      this.notificationPermission();
      const pushObject: PushObject = this.push.init(options);
      pushObject.on('notification').subscribe((notification: any) =>
         this.showAlert(notification.subject, notification.message)
      );
      pushObject.on('registration').subscribe((registration: any) =>{
        //this.storage.set(this.key, registration.registrationId)
        //alert(registration.registrationId),
        this.storeUniqueToken(registration.registrationId);
      }
        // this.commonServices.setStoreDataIncache(this.commonServices.getCacheKeyUrl("getUserDeviceToken"),registration.registrationId)
      );
      pushObject.on('error').subscribe(error =>{
       // this.showAlert('Error', error)
       }
      );
      // }
    });
  }
  storeUniqueToken(token) {
    this.commonServices.setStoreDataIncache(this.commonServices.getCacheKeyUrl("getUserDeviceToken"), token);
  }
  showAlert(Title, Message) {
    if(Title == undefined || Title =="" || Title ==""){
      Title="HealthPro Notification";
    }
    let notification_alert = this.alertCtrl.create({
      subTitle: Title,
      message: Message,
      buttons: ['OK']
    });
    notification_alert.present();
  }
  notificationPermission() {
    // to check if we have permission
    this.push.hasPermission()
      .then((res: any) => {
        if (res.isEnabled) {
          // console.log('We have permission to send push notifications');
        } else {
          // console.log('We do not have permission to send push notifications');
        }
      });
  }
  // isActive(page: PageInterface) {
  //   let childNav = this.nav.getActiveChildNavs()[0];

  //   // Tabs are a special case because they have their own navigation
  //   if (childNav) {
  //     if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
  //       return 'primary';
  //     }
  //     return;
  //   }

  //   if (this.nav.getActive() && this.nav.getActive().name === page.name) {
  //     return 'primary';
  //   }
  //   return;
  // }
}
