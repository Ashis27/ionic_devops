import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CalculatorList } from './calculatorlist';

@NgModule({
  declarations: [CalculatorList],
  imports: [IonicPageModule.forChild(CalculatorList)],
    entryComponents: [CalculatorList]
})
export class CalculatorListModule { }