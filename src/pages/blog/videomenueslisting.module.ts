import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VideomenueslistingPage } from './videomenueslisting';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
 
  declarations: [
    VideomenueslistingPage
  ],
  imports: [
    IonicPageModule.forChild(VideomenueslistingPage),
    
  ],
  providers:[
  
  ]
})
export class VideomenueslistingPageModule {}
