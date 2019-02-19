import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController } from 'ionic-angular';
import { DataContext } from '../../providers/dataContext.service';
import { CommonServices } from '../../providers/common.service';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-userwallet',
  templateUrl: 'userwallet.html'
})
export class UserWallet {
  walletTransaction: any = {
    ConsumerWalletTransaction: []
  };
  isWalletEmpty: boolean = false;
  constructor(public navCtrl: NavController, public _dataContext: DataContext, private commonService: CommonServices, ) { }
  ionViewDidEnter() {
    this.getWalletTransactionDetails();
  }
  getWalletTransactionDetails() {
    this._dataContext.GetWalletTransactions()
      .subscribe(response => {
        if (response.Status) {
          this.walletTransaction = response.Result;
          if (this.walletTransaction != null) {
            this.walletTransaction.ConsumerWalletTransaction.filter(item => {
              item.TransactionDate = moment(item.TransactionDate).format("DD-MMM-YYYY");
              item.HealthProCashAmount = Math.floor(item.HealthProCashAmount);
            });
            this.isWalletEmpty=false;
            this.walletTransaction.ConsumerWalletTransaction.reverse();
          }
          else{
            this.isWalletEmpty=true;
          }
        }
        else {
          this.walletTransaction = {
            ConsumerWalletTransaction: []
          };
          this.isWalletEmpty=true;
          this.commonService.onMessageHandler(response.Message, 0);
        }
      },
        error => {
          this.walletTransaction = {
            ConsumerWalletTransaction: []
          };
          this.isWalletEmpty=true;
          //loading.dismiss().catch(() => { });
          //this.commonService.onMessageHandler("Failed. Please try again.", 0);
        });
  }
}
