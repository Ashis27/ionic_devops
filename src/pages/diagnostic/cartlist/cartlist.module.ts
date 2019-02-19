import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CartList } from './cartlist';

@NgModule({
  declarations: [CartList],
  imports: [IonicPageModule.forChild(CartList)],
    entryComponents: [CartList]
})
export class CartListModule {}
