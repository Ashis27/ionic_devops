import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddtoCart } from './addtocart';

@NgModule({
  declarations: [AddtoCart],
  imports: [IonicPageModule.forChild(AddtoCart)],
    entryComponents: [AddtoCart]
})
export class AddtoCartModule {}
