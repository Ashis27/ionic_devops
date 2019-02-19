import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddremiderFormPage } from './addremider-form';

@NgModule({
  declarations: [
    AddremiderFormPage,
  ],
  imports: [
    IonicPageModule.forChild(AddremiderFormPage),
  ],
})
export class AddremiderFormPageModule {}
