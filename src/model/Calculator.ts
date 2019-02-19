export class BMICalculator {
  HeightInFoot: number;
  HeightInInch: number;
  Weight: number;
  getResult(weight, heightFoot, heightInch): string {
    let heightFootInmeter = heightFoot / 3.2808;
    let heightInchInmeter = heightInch / 39.370;
    let totalHeightInMeter = heightFootInmeter + heightInchInmeter;
    let res = weight / (totalHeightInMeter * totalHeightInMeter);
    return this.checkBMIStatus(res);
  }
  private checkBMIStatus(val): string {
    if (val < 18.5) {
      return val;//"Under Weight";
    } else if (val >= 18.5 && val <= 24.9) {
      // return "Normal Weight";
      return val;
    } else if (val >= 25 && val <= 29.9) {
      //return "Over Weight";
      return val;
    } else if (val >= 30 && val <= 34.9) {
      // return "Class I Obese";
      return val;
    } else if (val >= 35 && val <= 39.9) {
      //return "Class II Obese";
      return val;
    } else {
      // return "Class III obese";
      return val;
    }
  }





  //..............................note................................
  // Metric BMI Formula
  //   BMI = weight (kg) / height2 (m2)
  // Imperial BMI Formula
  //   BMI = ( weight (lb) / height2 (in2) ) x 703
  //    m=ft/3.2808
  //   m=in/39.370
  //..........................calculate....................................
  // less than 18.5:	underweight
  // 18.5 - 24.9:	normal weight
  // 25 - 29.9:	overweight
  // 30 - 34.9:	class I obese
  // 35 - 39.9:	class II obese
  // 40 upwards:	class III obese

}
//**************************** Blood Pressure *****************************
export class BloodPressure {
  age: number;
  systolic: number;
  dystolic: number;
  calulateBloodPressure(age, systolic, diastolic) {

    if (age <= 60) {
      if (systolic <= 90 && diastolic <= 60) {
        return Case.case1;
      } else if (systolic <= 120 && diastolic <= 80) {
        return Case.case2;
      } else if ((systolic < 130) && diastolic <= 80) {
        return Case.case3;
      } else if ((systolic < 140) && (diastolic < 90)) {
        return Case.case4;
      } else {
        return Case.case5;
      }
    } else if (age > 60) {
      if (systolic <= 90 && diastolic <= 60) {
        return Case.case1;
      } else if (systolic <= 120 && diastolic <= 80) {
        return Case.case2;
      } else if ((systolic <= 130) && diastolic <= 80) {
        return Case.case3;
      } else if ((systolic <= 140) && (diastolic <= 90)) {
        return Case.case4;
      } else {
        return Case.case5;
      }
    }
  }
}
export enum Case {
  case1 = "Hypotension(low blood pressure)",
  case2 = "Normal",
  case3 = "Elevated",
  case4 = "Hypertension (Stage1)",
  case5 = "Hypertension (Stage2)"
}
//...............................................
export class BloodSugarConerversion {
  type: any = "mg/dl";
  classification: any = "fasting";
  eAg: any;
  calculate(type, classification, eAg) {
    if (classification == 'fasting') {
      if (type == 'mg/dl') {
        if (eAg < 70) {
          return 'Low';
        }
        if (eAg <= 110) {
          return 'Normal';
        } if (eAg <= 125) {
          return "Prediabetes";
        } else {
          return 'Diabetes';
        }
      } else if (type == 'mmol/l') {
        if (eAg < 3.89) {
          return 'Low';
        }
        if (eAg <= 6.11) {
          return 'Normal';
        } if (eAg <= 6.94) {
          return "Prediabetes";
        } else {
          return 'Diabetes';
        }
      }
    } else if (classification == '2Hours after meal') {
      if (type == 'mg/dl') {
        if (eAg < 70) {
          return 'Low';
        }
        if (eAg <= 140) {
          return 'Normal';
        } if (eAg <= 160) {
          return "Prediabetes";
        } else {
          return 'Diabetes';
        }
      } else if (type == 'mmol/l') {
        if (eAg < 3.8) {
          return 'Low';
        }
        if (eAg < 7.7) {
          return 'Normal';
        } if (eAg <= 8.88) {
          return "Prediabetes";
        } else {
          return 'Diabetes';
        }
      }
    }
  }
}


//.....................................Waist To Hip........................................


export class WaistToHip {
  gender: string = "male";
  waist: number;
  hip: number;
  calculateWaistToHip(gender, waist, hip) {
    let ratio = waist / hip;
    switch (gender) {
      case 'male': {
        if (ratio <= 0.95) {
          return 'Normal';
        } else if (ratio <= 1.0) {
          return 'Moderate risk';
        } else {
          return 'High risk';
        }
      }
      case 'female': {
        if (ratio <= 0.80) {
          return 'Normal';
        } else if (ratio <= 0.84) {
          return 'Moderate risk';
        } else {
          return 'High risk';
        }
      }
    }
  }
}

//....................................Daily Water....................................

export class Dailywater {
  sex: string = "male";
  weight: number;
  calculatedailywater(weight) {
    let litWater = (weight / 0.024) / 1000;
    return Math.ceil(litWater) + 1;
  }
}