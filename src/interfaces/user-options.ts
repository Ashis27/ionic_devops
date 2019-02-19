
export interface UserLogin {
  UserLogin: string,
  Password: string,
  rememberMe?: boolean,
  Contact: string,
  CountryCode:string,
  GroupEntityId: number,
  ParentGroupEntityId: number
}
export interface UserRegister extends UserLogin {
  FirstName: string,
  DateOfBirth: string,
  Sex: string,
  TC: boolean,
  City: string,
  Locality: string,
  ReferralCode: string,
  MobileDeviceId:string;
  MobileDeviceType:string;
}
export interface TutorialSlider {
  Module: string,
  Sequence: number,
  Image: string,
  Icon: string,
  Content: string
}
export interface FBInformation {
  FBName: string,
  FBFirstName: string,
  FBLastName: string,
  FBVerified: boolean,
  FBGender: string,
  FBBirthday: string,
  FBEmail: string,
  FBToken: string
}
export interface GPInformation {
  GPName: string,
  GPFirstName: number,
  GPLastName: string,
  GPVerified: boolean,
  GPGender: string,
  GPBirthday: string,
  GPEmail: string,
  GPToken: string
}
export interface ResetUserPassword {
  GroupEntityId: number;
  ParentGroupEntityId: number;
  Contact: string;
  Email:string;
  NewPassword: string;
}
export interface Array<DashBoardMenu>{
  Title:string;
  Image:string;
  Sequence?:number;
}
export interface GroupEntity{
  GroupEntityID:number,
  ProviderID:number,
  Name:string
}
export interface ConsumerNotification{
  ConsumerID:number,
  Contact:string,
  GroupEntityId:0,
  ModuleId:number,
  Message:string,
  Email:string
}


