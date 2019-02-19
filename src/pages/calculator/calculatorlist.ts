import { Component } from '@angular/core';
import { PopoverController, IonicPage, NavController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-calculatorlist',
  templateUrl: 'calculatorlist.html'
})
export class CalculatorList {
  calulatorConfigList: any = [
    { Title: "BMI Calculator", Component: "BmicalculatorPage", SubTitle: "Find out your Body Mass Index", Image: "assets/img/calculator/body-mass-index.svg" },
    { Title: "Blood Pressure", Component: "BloodpressurePage", SubTitle: "Measure your Blood Pressure level", Image: "assets/img/calculator/Blood_Pressure.svg" },
    { Title: "Blood Sugar Conversion", Component: "BloodsugarconversionPage", SubTitle: "Verify your Blood glucose level", Image: "assets/img/calculator/blood_Sugar.svg" },
    { Title: "Body Fat", Component: "BodyfatPage", SubTitle: "Stay updated with Body fat", Image: "assets/img/calculator/Body_Fat.svg" },
    { Title: "Daily Water", Component: "DailywaterPage", SubTitle: "Find out your hydration level", Image: "assets/img/calculator/water.svg" },
    //{ Title: "Height Weight", Component: "HeightweightPage", SubTitle: "Measure your weight against height", Image: "assets/img/calculator/HeightWeight.svg" },
    { Title: "Pregnancy Due Date", Component: "PregnancyduedatePage", SubTitle: "Calculate pregnancy due date", Image: "assets/img/calculator/pregnancy-test.svg" },
    { Title: "Waist To Hip", Component: "WaisttohipPage", SubTitle: "Get WHR using Waist and Hip", Image: "assets/img/calculator/waistHip.svg" },
    { Title: "Blood Donation Due Date", Component: "BlooddonationduedatePage", SubTitle: "Get your next Blood donation date", Image: "assets/img/calculator/blood-donation.svg" },
    { Title: "Calorie Calculation", Component: "CaloriecalculationPage", SubTitle: "Estimate calorie consumption per day", Image: "assets/img/calculator/Calories calculator.svg" },
    { Title: "Creatinine Clearence", Component: "CreatinineclearencePage", SubTitle: "Be assured kidneys are functioning normally", Image: "assets/img/calculator/Creatinine clearance.svg" },
    { Title: "Lean Body Mass", Component: "LeanbodymassPage", SubTitle: "Calculate the ideal lean mass", Image: "assets/img/calculator/Lean Body Mass.svg" },
    { Title: "Blood Alcohol Level", Component: "BloodalcoholLevelPage", SubTitle: "Estimates your BAC level", Image: "assets/img/calculator/blood _alcohol.svg" },
    //{ Title: "Framesize", Component: "FramesizePage", SubTitle: "Measure your frame size", Image: "assets/img/calculator/frame.svg" },
    { Title: "Heartbeat", Component: "HeartbeatPage", SubTitle: "Track heart beat since your DOB", Image: "assets/img/calculator/heartbeat.svg" },
    //{ Title: "Ideal Weight", Component: "IdealweightPage", SubTitle: "Estimates ideal weight of the Individual", Image: "assets/img/calculator/IdealWeight.svg" },
    { Title: "Ovulation", Component: "OvulationPage", SubTitle: "Estimates your next fertile", Image: "assets/img/calculator/Ovulation.svg" },
    { Title: "Smoking Risk", Component: "SmokingriskPage", SubTitle: "Estimates days you have lost.", Image: "assets/img/calculator/Smoking Risk.svg" },
   // { Title: "Cholesterol", Component: "CholesterolPage", SubTitle: "Estimates your cholesterol level", Image: "assets/img/calculator/Cholesterol.svg" },
    //{ Title: "Breathe", Component: "BreathePage", SubTitle: "Estimating your Breathing / Respiration rate", Image: "assets/img/calculator/Breathe.svg" },
   // { Title: "Bodysurface Area", Component: "BodysurfaceareaPage", SubTitle: "Estimating BSA of your body ", Image: "assets/img/calculator/Body Surface Area.svg" },
  ];
  constructor(public navCtrl: NavController) { }

  redirectTo(value) {
    this.navCtrl.push(value);
  }
}
