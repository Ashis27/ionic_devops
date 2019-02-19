import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController } from 'ionic-angular';
import { DataContext } from '../../providers/dataContext.service';
import { CommonServices } from '../../providers/common.service';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html'
})
export class UserNotification {
  userNotificationList: any = [];
  selectedNotification: any = [];
  isAvailable: boolean = true;
  userId: number = 0;
  constructor(public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices) { }
  ionViewDidEnter() {
    this.getUserInfo();
    this.changeNotificationStausToSeen();
    this.commonService.onEntryPageEvent("Come to notification");
  }
  getUserInfo() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserInfo"))
      .then((result) => {
        if (result) {
          this.userId = result.ConsumerID;
          this.getNotificationsFromCache();
        }
        else {
          this.navCtrl.setRoot("LoginPage");
        }
      });
  }
  getNotificationsFromCache() {
    this.commonService.getStoreDataFromCache(this.commonService.getCacheKeyUrl("getUserNotification") + "/" + this.userId)
      .then((result) => {
        if (result.length > 0) {
          this.userNotificationList = result;
          // this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserNotificationCount")+ "/" + this.userId, this.userNotificationList.length);
          this.userNotificationList.filter(item => {
            let currentDate = moment(moment(), "DD-MM-YYYY HH:mm:ss");
            let createdDate = moment(moment(item.CreatedDate), "DD-MM-YYYY HH:mm:ss");
            item["days"] = currentDate.diff(createdDate, 'days'); // calculate the difference in days
            item["hrs"] = currentDate.diff(createdDate, 'hours') % 24; // calculate the difference in hours
            item["mins"] = currentDate.diff(createdDate, 'minutes') % 60; // calculate the difference in mins
            item["secs"] = currentDate.diff(createdDate, 'seconds') % 60; // calculate the difference in secs
          });
          this.isAvailable = true;
        }
        // else {
        //   this.isAvailable = false;
        // }
        this.getUserNotification(0);
      });
  }
  changeNotificationStausToSeen() {
    this._dataContext.ChangeNotificationSeenStatus()
      .subscribe(response => {
        if (!response.Status) {
          this.changeNotificationStausToSeen();
        }
      },
        error => {
          this.changeNotificationStausToSeen();
          // this.commonService.onMessageHandler("Failed to Retrieve Notifications. Please try again.", 0);
        });
  }
  removeSelectedNotification(value, data) {
    this.selectedNotification = [];
    if (value) {
      this.removeNotifications(data);
    }
    else {
      this.selectedNotification.push(data);
      this.removeNotifications(this.selectedNotification);
    }
  }
  removeNotifications(data) {
    this._dataContext.RemoveUserNotifications(data)
      .subscribe(response => {
        console.log(response);
        if (response.Status) {
          this.userNotificationList=[];
          this.commonService.onMessageHandler(response.Message, 1);
        }
        else {
          this.commonService.onMessageHandler(response.Message, 0);
        }
        this.getUserNotification(1);
      },
        error => {
          console.log(error);
          //loading.dismiss().catch(() => { });
          this.commonService.onMessageHandler("Failed to Registered.Please try again.", 0);
        });
  }
  getUserNotification(value) {
    this._dataContext.GetUserNotifications(value)
      .subscribe(response => {
        if (response.Status && response.Data.length > 0) {
          this.userNotificationList = response.Data.reverse();
          this.userNotificationList.filter(item => {
            let currentDate = moment(moment(), "DD-MM-YYYY HH:mm:ss");
            let createdDate = moment(moment(item.CreatedDate), "DD-MM-YYYY HH:mm:ss");
            item["days"] = currentDate.diff(createdDate, 'days'); // calculate the difference in days
            item["hrs"] = currentDate.diff(createdDate, 'hours') % 24; // calculate the difference in hours
            item["mins"] = currentDate.diff(createdDate, 'minutes') % 60; // calculate the difference in mins
            item["secs"] = currentDate.diff(createdDate, 'seconds') % 60; // calculate the difference in secs
          });
          this.isAvailable = true;
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserNotification") + "/" + this.userId, response.Data);
        }
        else {
          this.isAvailable = false;
          this.commonService.setStoreDataIncache(this.commonService.getCacheKeyUrl("getUserNotification") + "/" + this.userId, []);
        }
      },
        error => {
          console.log(error);
          this.commonService.onMessageHandler("Failed to Retrieve Notifications. Please try again.", 0);
        });
  }
}

