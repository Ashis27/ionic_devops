import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { KnowledgeCenter } from './knowledgecenter';

@NgModule({
  declarations: [KnowledgeCenter],
  imports: [IonicPageModule.forChild(KnowledgeCenter)],
    entryComponents: [KnowledgeCenter]
})
export class KnowledgeCenterModule { }