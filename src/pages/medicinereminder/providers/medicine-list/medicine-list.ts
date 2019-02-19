import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the MedicineListProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MedicineListProvider {
  medicineList:any=[];
  constructor(public http: HttpClient) {
    console.log('Hello MedicineListProvider Provider');
    this.medicineList=[
      {
       medicinename:"Lipitor"
      },
      {
        medicinename:"Nexium"
      },
      {
        medicinename:"Plavix"
      },
      {
        medicinename:"Diskus"
      },
      {
        medicinename:"Hydrocodone"
      },
      {
        medicinename:"Generic Zocor"
      },
      {
        medicinename:"Generic Synthroid"
      },
      {
        medicinename:"Azithromycin "
      },
      {
        medicinename:"Generic Prilosec "
      },

   ]
  }

filterMedicine(searchTerm){
    return this.medicineList.filter((item) => {
        return item.medicinename.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });    

}

}
