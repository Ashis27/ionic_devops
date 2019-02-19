import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { UserLogin, UserRegister, FBInformation, GPInformation, ResetUserPassword, GroupEntity } from "../interfaces/user-options";
import { HttpService } from "./http.service";
import { Observable } from 'rxjs/Rx';
import { CommonServices } from "./common.service";

@Injectable()
export class DataContext {
    constructor(
        public events: Events,
        public storage: Storage,
        private _http: HttpService,
        private commonService: CommonServices
    ) { }

    //Login
    UserLogin = (userData: UserLogin): Observable<any> => {
        let loginData = 'grant_type=password&username=' + userData.UserLogin + '&password=' + userData.Password + '&loginType=LoginWithPassword&userType=Consumer&parentGroupEntityId=' + this.commonService.getGroupEntityId() + '&groupEntityID=' + this.commonService.getGroupEntityId() + '&contactNumber=' + userData.Contact.toString();
        return this._http.post(this.commonService.getApiControllerName("userLogin").toString(), loginData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Social Login
    onSocialLogin = (value: any, email: string): Observable<any> => {
        //userData.Password = this.commonService.getUserDefaultPassword();
        let loginData = 'grant_type=password&username=' + email + '&loginType=Social&userType=Consumer&tokenId=' + value + '&parentGroupEntityId=' + this.commonService.getGroupEntityId() + '&groupEntityID=' + this.commonService.getGroupEntityId();
        return this._http.post(this.commonService.getApiControllerName("userLogin").toString(), loginData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Register
    UserRegister = (userData: UserRegister): Observable<any> => {
        //userData.Password = this.commonService.getUserDefaultPassword();
        userData.GroupEntityId = this.commonService.getGroupEntityId();
        userData.ParentGroupEntityId = this.commonService.getParentGroupEntityId();
        return this._http.post(this.commonService.getApiControllerName("userRegister").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Get Gender
    GetGenderList = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getDropdownValue").toString() + "Sex")
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getDropdownValue").toString() + "Sex")
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }

    //Get Slider config userDetails
    GetSliderConfig = (moduleName: string, status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getSliderConfig").toString() + moduleName)
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getSliderConfig").toString() + moduleName)
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }

    //Get All city
    GetActiveCity = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getCityList").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getCityList").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }

    //Get Location based on the city
    GetActiveLocation = (cityId: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getLocation").toString() + cityId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //OTP verification
    GetOTPVerify = (contact: string, email: string, otp: number, isContact: boolean): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getVerifyOTP").toString() + "?contactNum=" + contact + "&email=" + email + "&otp=" + otp + "&groupEntityId=" + this.commonService.getGroupEntityId() + "&isContact=" + isContact)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //SendOTP
    GetOTP = (number: string, type: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getOTP").toString() + "?mobileNumber=" + number + "&groupEntityId=" + this.commonService.getGroupEntityId() + "&generateOTPType=" + type)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Facebook signup
    FacebookSignUp = (userData: FBInformation): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("fbResigtration").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Google plus signup
    GooglePlusSignUp = (userData: GPInformation): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("gpResigtration").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Reset password
    ResetPassword = (userData: ResetUserPassword): Observable<any> => {
        userData.GroupEntityId = this.commonService.getGroupEntityId();
        userData.ParentGroupEntityId = this.commonService.getParentGroupEntityId();
        return this._http.post(this.commonService.getApiControllerName("resetPassword").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Address from lat and lng
    GetAddress = (lat: string, lng: string): Observable<any> => {
        return this._http.getLocation(this.commonService.getApiControllerName("getAddress").toString() + "?latlng=" + lat + "," + lng + "&key=" + this.commonService.getGoogleApiKey())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Update User Contact Info
    UpdateUserContactInfo = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("updateUserContactInfo").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Mertital Status
    GetMeritalStatus = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getDropdownValue").toString() + "MaritalStatus")
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getDropdownValue").toString() + "MaritalStatus")
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //Get Blood Group
    GetBloodGroup = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getDropdownValue").toString() + "BloodGroup")
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getDropdownValue").toString() + "BloodGroup")
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //Get Looged in user details
    GetLoggedOnUserProfile = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getLoggedInUserProfile").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getLoggedInUserProfile").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }

    }

    //Update user profile 
    UpdateUserProfile = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("updateUserProfile").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Update user profile picture
    UpdateUserProfilePic = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("updateUserProfilePic").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Logout
    UserLogOut = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("userLogOut").toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Active Country and State List
    GetActiveCountryAndState = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getActiveCountryAndState").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getActiveCountryAndState").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //Add user new shipping address 
    AddUserShippingAddress = (userData: any): Observable<any> => {
        userData.GroupEntityId = this.commonService.getGroupEntityId();
        return this._http.post(this.commonService.getApiControllerName("addUserShippingAddress").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get User shipping address list
    GetUserShippingAddress = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getUserShippingAddress").toString() + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //delete user shipping Address 
    DeleteShippingAddress = (userData: any): Observable<any> => {
        userData.GroupEntityId = this.commonService.getGroupEntityId();
        return this._http.postOffline(this.commonService.getApiControllerName("deleteAddress").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Update user shipping Address 
    UpdateShippingAddress = (userData: any): Observable<any> => {
        //userData.GroupEntityId = this.commonService.getGroupEntityId();
        return this._http.post(this.commonService.getApiControllerName("updateAddress").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Get Relation List 
    GetRelation = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getDropdownValue").toString() + 'Family')
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getDropdownValue").toString() + 'Family')
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }

    //Get Family member List 
    GetFamilyList = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getFamily").toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Family member List for dropdown
    GetFamilyListForDropDown = (): Observable<any> => {
        // if (status) {
        return this._http.getOffline(this.commonService.getApiControllerName("getFamilyListForDropDown").toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
        // }
        // else {
        //     return this._http.getOffline(this.commonService.getApiControllerName("getFamilyListForDropDown").toString())
        //         .map((response: Response) => response.json())
        //          .catch((error) => this._http.handleError(error));
        // }
    }

    //Update Family Member 
    UpdateFamilyMember = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("updateFamilyMember").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Add New family member
    AddFamilyMember = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("addFamilyMember").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Get Allergies
    GetAllergies = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getDropdownValue").toString() + 'Allergy')
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Medications
    GetMedications = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getMedication").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Diases
    GetDiases = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getDiases").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Diases
    GetSurgeries = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getSurgeries").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Get Current App Version
    GetAppVersion = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getAppVersion").toString() + "?appType=" + this.commonService.getAppType())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getAppVersion").toString() + "?appType=" + this.commonService.getAppType())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //Validate Email and Mobile 
    getValidateEmailAndMobile = (userData: UserRegister): Observable<any> => {
        return this._http.getOffline(this.commonService.getApiControllerName("getValidateEmailAndMobile").toString() + "?email=" + userData.UserLogin + "&mobile=" + userData.CountryCode + userData.Contact + "&groupEntityId=" + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get user health records
    GetConsumerDigitalDocuments = (status: number, pageNum: number, itemsPerPage: number, tagging: string, relationId: string): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getConsumerDigitalDocuments").toString() + '?page=' + pageNum + '&pageSize=' + itemsPerPage + '&tagging=' + tagging + '&relationId=' + relationId)
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getConsumerDigitalDocuments").toString() + '?page=' + pageNum + '&pageSize=' + itemsPerPage + '&tagging=' + tagging + '&relationId=' + relationId)
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //Get user health records uploaded by doc
    GetConsumerDigitalDocumentsUploadedByDoc = (status: number, pageNum: number, itemsPerPage: number, tagging: string, relationId: string): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getConsumerDigitalDocuments").toString() + '?page=' + pageNum + '&pageSize=' + itemsPerPage + '&tagging=' + tagging + '&relationId=' + relationId)
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getConsumerDigitalDocuments").toString() + '?page=' + pageNum + '&pageSize=' + itemsPerPage + '&tagging=' + tagging + '&relationId=' + relationId)
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //User All uploaded doc Size
    GetCurrentFolderSize = (status: number, consumerId: string): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getConsumerUploadedDocSize").toString() + '?consumerId=' + consumerId + "&geId=" + this.commonService.getGroupEntityId())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getConsumerUploadedDocSize").toString() + '?consumerId=' + consumerId + "&geId=" + this.commonService.getGroupEntityId())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //Delete Health record by consumer
    DeleteHealthRecordUploadedByConsumer = (userData: any): Observable<any> => {
        return this._http.postOffline(this.commonService.getApiControllerName("deleteHealthRecordUploadedByConsumer").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Delete Health record uploaded by Provider
    DeleteHealthRecordUploadedByProvider = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("deleteHealthRecordUploadedByProvider").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Download Health record from AWS using Pre-signed URL
    DownloadHealthRecord = (consumerId: number, fileName: string): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("downloadHealthRecord").toString() + '?consumerId=' + consumerId + '&fileName=' + fileName + "&geId=" + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Get result by search keyword
    GetAutoCompleteSearch = (term: string, cityId: string, localityID: string): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getAutoCompleteSearch").toString() + '?term=' + term + '&cityID=' + cityId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get user upcoming appointments
    GetUserUpcomigAppointments = (status: number, pageNum: number, itemsPerPage: number, consumerId: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getUserUpcomingAppo").toString() + '?page=' + pageNum + '&pageSize=' + itemsPerPage + '&platformGroupEntityID=' + this.commonService.getGroupEntityId() + "&consumerId=" + consumerId)
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getUserUpcomingAppo").toString() + '?page=' + pageNum + '&pageSize=' + itemsPerPage + '&platformGroupEntityID=' + this.commonService.getGroupEntityId() + "&consumerId=" + consumerId)
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //Get user past appointments
    GetUserPastAppointments = (status: number, pageNum: number, itemsPerPage: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getUserPastAppo").toString() + '?page=' + pageNum + '&pageSize=' + itemsPerPage + '&platformGroupEntityID=' + this.commonService.getGroupEntityId())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getUserPastAppo").toString() + '?page=' + pageNum + '&pageSize=' + itemsPerPage + '&platformGroupEntityID=' + this.commonService.getGroupEntityId())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //Get all doctors by search keyword
    GetDoctorsByKeyword = (term: string, cityId: string, localityID: string, page: number, itemsPerPage: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getDoctorsByKeyword").toString() + '?term=' + term + '&cityID=' + cityId + '&localityID' + localityID + '&page=' + page + '&itemPerPage=' + itemsPerPage)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get all hospitals by search keyword
    GetHospitalsByKeyword = (term: string, cityId: string, localityID: string, page: number, itemsPerPage: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getHospitalsByKeyword").toString() + '?term=' + term + '&cityID=' + cityId + '&localityID' + localityID + '&page=' + page + '&itemPerPage=' + itemsPerPage)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get all Popular Specializations
    GetSpecializationList = (page: number, itemPerPage: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getSpecializations").toString() + '?page=' + page + '&pageSize=' + itemPerPage)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get all Popular Doctors
    GetDoctorList = (cityId: number, cityAreaId: number, cityName: string, cityAreaName: string, page: number, itemPerPage: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getDoctors").toString() + "?cityId=" + cityId + "&cityAreaId=" + cityAreaId + "&cityName=" + cityName + "&cityAreaName=" + cityAreaName + '&page=' + page + '&pageSize=' + itemPerPage)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get indivisula doctor details
    GetDoctorDetails = (userData: GroupEntity): Observable<any> => {
        userData.GroupEntityID = this.commonService.getGroupEntityId();
        return this._http.get(this.commonService.getApiControllerName("getDoctorDetails").toString() + '?providerID=' + userData.ProviderID)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get unique token to upload file in S3  
    GetUniqueToken = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("getUniqueToken").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Upload user health record in S3  
    UploadUserHealthRecord = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("uploadUserRecord").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Update user health record in S3  
    UpdateDigitalDocuments = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("updateDigitalDocuments").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Get feedback questions for doctor
    GetFeedbackQuestionsForDoctor = (feedbackModuleType: string): Observable<any> => {
        return this._http.getOffline(this.commonService.getApiControllerName("getFeedbackQuestionsForDoctor").toString() + '?feedbackModuleType=' + feedbackModuleType + '&platformGroupEntityID=' + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    SubmitConsumerFeedbackForDoctor = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("submitConsumerFeedbackForDoctor").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Provider Feedback submitted by user

    GetProviderFeedback = (providerId: string): Observable<any> => {
        return this._http.getOffline(this.commonService.getApiControllerName("getProviderFeedback").toString() + '?providerId=' + providerId + '&groupEntityId=' + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Favourite Doctors selected by user
    GetMyFavouriteDoctors = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getMyFavDoctors").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getMyFavDoctors").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //Set selected doctor as favourite
    SetMyFavouriteDoctors = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("setMyFavDoctors").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Remove Favourite doctor.
    RemoveFavouriteDoctor = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("removeMyFavDoctors").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Save user rating for selected doctor.
    SaveMyRating = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("saveUserRating").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get seven days availibility for indivisual doctor.
    GetSevenDaysAvailability = (providerID: number): Observable<any> => {
        return this._http.getOffline(this.commonService.getApiControllerName("getSevenDaysAvailability").toString() + '?ProviderID=' + providerID)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get all schedule for selected date
    GetFreeScheduleForDayForSelectedDate = (providerId: number, selectedDate: string, groupEntityId: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getFreeScheduleForDayForSelectedDate").toString() + '?providerID=' + providerId + '&date=' + selectedDate + '&groupEntityID=' + groupEntityId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Book appointment with out payment for self
    ScheduleAppointmentForUser = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("scheduleAppointmentForUser").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Book appointment with out payment for Family
    ScheduleAppointmentForFamily = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("scheduleAppointmentForFamily").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Cancel selected appointment.
    CancelAppointment = (consumerId: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("cancelAppointment").toString() + '?id=' + consumerId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //This is used to check whethere the contact number is exist or not.
    CheckContactExistOrNot = (mobileNum: string): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("checkContactExistOrNot").toString() + '?mobileNumber=' + mobileNum + '&groupEntityId=' + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Sending email to user through SNS
    SendEmailThroughSNS = (emailData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("sendEmailThroughSNS").toString(), JSON.stringify(emailData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Sending SMS to user through SNS
    SendSMSThroughSNS = (smsData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("sendSMSThroughSNS").toString(), JSON.stringify(smsData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //This is used to get provider rating.
    GetProviderRating = (providerId: number): Observable<any> => {
        return this._http.getOffline(this.commonService.getApiControllerName("getProviderRating").toString() + '?providerId=' + providerId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get hosptal list for indivisual doctors.
    GetHospitals = (providerId: number): Observable<any> => {
        return this._http.getOffline(this.commonService.getApiControllerName("getHospitals").toString() + '?providerId=' + providerId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get recent user appointment details.
    GetRecentAppointmentList = (pageSize: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getRecentAppointmentList").toString() + '?groupEntityId=' + this.commonService.getGroupEntityId() + '&pageSize=' + pageSize)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get provider details
    GetSpecificProviderProfile = (providerId: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getSpecificProviderProfile").toString() + '?groupEntityId=' + this.commonService.getGroupEntityId() + '&providerId=' + providerId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get search result from elastic search.
    GetAutocompleteSearchedData = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getElasticSearchQuery").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get all the doctors and specializations based on group entity id.
    GetDoctorsAndSpecsForHospital = (groupEntityId: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getDoctorsAndSpecsForHospital").toString() + '?groupEntityId=' + groupEntityId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //This is used to get all symptoms from solr
    GetListOfSymptoms = (start: number, rows: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getListOfSymptoms").toString() + '?start=' + start + "&rows=" + rows)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get hospital details
    GetHospitalDetails = (hospitalID: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getHospitalDetails").toString() + '?hospitalID=' + hospitalID)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Save uiser EHR History
    SavaEHRHistory = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getUserEhrHistory").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get user health record uploaded by user
    GetConsumerDigitalDocumentList = (page: number, itemPerPage: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getConsumerDigitalDocumentList").toString() + '?page=' + page + '&pageSize=' + itemPerPage)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get health record uploaded by doc/lab
    GetConsumerDigitalDocumentListUploadedByDoc = (page: number, itemPerPage: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getConsumerDigitalDocumentListByDoc").toString() + '?page=' + page + '&pageSize=' + itemPerPage)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get health record uploaded by doc/lab
    GetConsumerDigitalDocumentListUploadedByDocByLab = (page: number, itemPerPage: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getConsumerDigitalDocumentListByDocByLab").toString() + '?page=' + page + '&pageSize=' + itemPerPage)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get user details by contact number
    GetUserDetailsByContactNumber = (contact: string): Observable<any> => {
        return this._http.getOffline(this.commonService.getApiControllerName("getUserDetailsByContactNumber").toString() + '?contact=' + contact + '&groupEntityId=' + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Generate temp otp before registration
    GenerateTempOTPForMobile = (contact: string): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("generateTempOTPForMobile").toString() + '?mobileNumber=' + contact)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Verify otp
    GetVarifyTempOTPForMobile = (contact: string, otp: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getVarifyTempOTPForMobile").toString() + '?contactNum=' + contact + '&otp=' + otp)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Update OTP
    UpdateConsumerOTP = (contact: string): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("updateConsumerOTP").toString() + '?contactNum=' + contact)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Get Notification
    GetNotificationCofiguration = (moduleName: string): Observable<any> => {
        return this._http.getOffline(this.commonService.getApiControllerName("getNotifications").toString() + '?module=' + moduleName)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Save notification
    SaveNotification = (userData: any): Observable<any> => {
        userData.GroupEntityId = this.commonService.getGroupEntityId();
        return this._http.post(this.commonService.getApiControllerName("saveNotification").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get User Notification
    GetUserNotifications = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getUserNotification").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getUserNotification").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //Remove user notification.
    RemoveUserNotifications = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("removeUserNotification").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Notification
    ResendOTP = (contact: string, email: string, isContact: boolean): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("resendOTP").toString() + '?contactNum=' + contact + "&email=" + email + "&groupEntityId=" + this.commonService.getGroupEntityId() + "&isContact=" + isContact)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Notification
    ResendTempOTP = (contact: string): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("resendTempOTP").toString() + '?contactNum=' + contact)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Get symptoms list by searched key word.
    GetSymptomsByKeyword = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getSymptomsByKeyword").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Popular Search
    GetPopularSearch = (status: number, type: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getPopularSearch").toString() + '?searchType=' + type)
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getPopularSearch").toString() + '?searchType=' + type)
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }

    }
    //Get Specialization By Symptoms id
    GetSpecializationBySymptomsId = (id: number): Observable<any> => {
        return this._http.getSearchedData(this.commonService.getApiControllerName("getSpecializationBySymptomId").toString() + id)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Diagnostics center by search keywords
    GetDiagnosticsByKeyword = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getDiagnostics").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get packages by search keywords
    GetPackagesByKeyword = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getPackage").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get hospital emergency contact
    GetHospitalEmergencyContact = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getHospitalEmergencyContact").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Specialization By Symptoms id
    GetUserMedicalHistory = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getMedicaHistory").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getMedicaHistory").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }

    }
    //Get Provider Appointment Charges
    GetProviderAppointmentFees = (groupEntityId: number, providerId: number): Observable<any> => {
        return this._http.getSearchedData(this.commonService.getApiControllerName("getProviderAppointmentFees").toString() + "?groupEntityId=" + groupEntityId + "&providerId=" + providerId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Add Patient Allergies
    SavePatientAllergies = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("addPatientAllergies").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Add Patient Medicines
    SavePatientMedication = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("addPatientMedication").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Add Patient Chronic Disease
    SavePatientChronicDisease = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("addPatientChronicDisease").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Change user notification status.
    ChangeNotificationSeenStatus() {
        return this._http.getOffline(this.commonService.getApiControllerName("getNotificationStatus").toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get health package age group
    GetPackageAgeGroups = (status: number): Observable<any> => {
        if (status) {
            return this._http.get(this.commonService.getApiControllerName("getPackageAgeGroups").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
        else {
            return this._http.getOffline(this.commonService.getApiControllerName("getPackageAgeGroups").toString())
                .map((response: Response) => response.json())
                 .catch((error) => this._http.handleError(error));
        }
    }
    //Get health packages based on diagnostic center
    GetHealthPackages = (searchData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("getHealthPackageList").toString(), searchData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get medicine reminder
    GetMedicineReminder = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getMedicineReminder").toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get medicine reminder
    AddMedicineReminder = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("addMedicineReminder").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Delete indivisual reminder
    DeleteReminder = (id: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("deleteReminder").toString() + "?id=" + id)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Delete indivisual reminder
    DeleteAllReminder = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("deleteAllReminder").toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get uploaded video blog by doctors
    GetVideoBlogs = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getVideoBlog").toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get uploaded video blog by doctors
    GetLabSettingsByGroupEntityID = (centerId: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getLabSettingsForGroupEntity").toString() + "?groupEntityId=" + centerId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //This is used to update mobile device token for each login.
    UpdateUserDeviceTokenId = (deviceType: string, deviceToken: string): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("updateUserDeviceToken").toString() + "?deviceType=" + deviceType + "&deviceToken=" + deviceToken)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    DownloadUniqueTokenForProviderUploadedFile = (filePath: string): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("downloadUniqueTokenForProviderUploadedFile").toString() + "?fileName=" + filePath)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Send OTP using user's email email
    GenerateOTPForEmail = (email: string): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("generateOTPForEmail").toString() + "?email=" + email + "&groupEntityId=" + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    // This is used for schedule appointment using PG integrtaion
    ScheduleAppointmentThroughPayment = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("storeAppointmentDetailsBeforePGconfirmation").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get appointment PG details
    GetAppointmentResponseAfterPG = (id: string): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getAppointmentResponseAfterPG").toString() + "?refId=" + id)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Apply coupon code to access premium features
    GetVarifyCouponCode = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("getVarifyCouponCode").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Store premium subscription details before PG
    StorePremiumSubscriptionDetailsBeforePG = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("storePremiumSubscriptionDetailsBeforePG").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Schedule health package before PG
    ScheduleHealthPackageThroughPayment = (userData: any, isSelected): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("scheduleHealthPackageThroughPayment").toString() + "?redeemFromWallet=" + isSelected, userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get the booked health packages with and without payment for a consumer
    GetUpcomingBookedHealthPackagesForConsumer = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getUpcomingBookedHealthPackagesForConsumer").toString() + "?groupEntityId=" + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get the booked health packages with and without payment for a consumer
    GetPastBookedHealthPackagesForConsumer = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getPastBookedHealthPackagesForConsumer").toString() + "?groupEntityId=" + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //This is used for sending Pharmacy feedback taken by user
    SendPharmacyFeedback = (userData): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("sendPharmacyFeedback").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Download image
    DownloadImage = (url): Observable<any> => {
        return this._http.getLocation(url.toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get user wallet with all the transaction details
    GetWalletTransactions = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getWalletTransactions").toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Get feedback  question
    GetFeedbackQuestion = (moduleType: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getFeedBackQus").toString() + "?feedbackModuleType=" + moduleType + "&platformGroupEntityID=" + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //Get ticket type
    GetTicketType = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getTicketType").toString() + "?standardCode=Consumer Ticket Type")
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }


    SubmitTicket = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("submitTicket").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    GetReferralsByDoctorForConsumer = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getReferralsByDoctorForConsumer").toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    GetMedicalRecordShareRequestsForConsumerBasedOnReferral = (referralId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("GetMedicalRecordShareRequestsForConsumerBasedOnReferral").toString() + "?referralId=" + referralId + "&type=" + 2)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));

    }
    DownloadFileFromAWSForMobileForHospital(filename) {
        return this._http.get(this.commonService.getApiControllerName("downloadFileFromAWSForMobileForHospital").toString() + "?fileName=" + filename)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));

    }
    UpdateMedicalRecordShareRequests = (mrRequests): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("UpdateMedicalRecordShareRequests").toString(), mrRequests)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get DC Health Packages
    GetDCHealthPackages = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getHealthPackages").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Diagnostics center by search keywords
    GetDiagnosticsCenters = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getDiagnosticCenters").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get packages by search keywords
    GetLabTests = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getLabTests").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get lab profile by search keyword
    GetLabProfile = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getLabProfile_es").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get packages by search keywords
    GetLabScans = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getRadiologyScans").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    GetAutocompleteSearchedDataForDC = (userData: any): Observable<any> => {
        return this._http.postSearchedData(this.commonService.getApiControllerName("getResultForDCSearch").toString(), JSON.stringify(userData))
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Health Package profile details

    GetHealthPackageProfile = (packageId, groupEntityId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getHealthPackageProfile").toString() + "?labPackageId=" + packageId + "&groupEntityId=" + groupEntityId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Lab Test profile details
    GetLabTestProfile = (labTestId, groupEntityId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getLabTestProfile").toString() + "?labTestId=" + labTestId + "&groupEntityId=" + groupEntityId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get health package list based on center id
    GetHealthPackageList = (searchData): Observable<any> => {
        return this._http.postOffline(this.commonService.getApiControllerName("getHealthPackageList").toString(), searchData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get lab test list based on center id
    GetLabTestList = (searchData): Observable<any> => {
        return this._http.postOffline(this.commonService.getApiControllerName("getLabTestList").toString(), searchData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get lab profile list based on center id
    GetLabProfileList = (searchData): Observable<any> => {
        return this._http.postOffline(this.commonService.getApiControllerName("getLabProfileList").toString(), searchData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get lab profile based on profile id
    getLabProfile = (labProfileId, groupEntityId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getLabProfile").toString() + "?labProfileId=" + labProfileId + "&groupEntityId=" + groupEntityId)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get Package gender list 
    GetPackageGenderList = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getPackageGender").toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Consumer Wallet redeem details
    GetRedeemableConsumerWalletForCart = (userData): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("getwalletRedeemDetails").toString(), userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get childrenlist for vaccination by vinod   
    GetChildrenData = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("GetChildrens").toString())
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }
    //Get vaccinations by vinod   
    GetVaccinationData = (consumerid: number): Observable<any> => {
        console.log(this.commonService.getApiControllerName("GetVaccinations").toString() + consumerid);
        return this._http.get(this.commonService.getApiControllerName("GetVaccinations").toString() + consumerid)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //createVaccination for baby vinod
    createVaccination = (consumerid: number): Observable<any> => {
        console.log(this.commonService.getApiControllerName("CreateVaccination").toString() + consumerid);
        return this._http.get(this.commonService.getApiControllerName("CreateVaccination").toString() + consumerid)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //CompleteVaccine or SkipVaccine for baby vinod
    CompleteVaccineGroup = (userData: any, skip: boolean, reset: boolean): Observable<any> => {
        console.log(this.commonService.getApiControllerName("completevaccineGroup").toString() + "?skip=" + skip + "&resetDate=" + reset);
        return this._http.post(this.commonService.getApiControllerName("completevaccineGroup").toString() + "?skip=" + skip + "&resetDate=" + reset, userData)
            .map((response: Response) => response.json())
             .catch((error) => this._http.handleError(error));
    }

    //get health plan provided by HealthPro
    GetHealthPlan = (): Observable<any> => {
        return this._http.getOffline(this.commonService.getApiControllerName("getHealthPlan").toString())
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //get subscribed health plan activated by user/doctor
    GetSubscribedHealthPlan = (consumerId: number): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getSubscribedPlan").toString() + "?consumerId=" + consumerId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }

    //Get yoga and excercise content information
    GetYogaAndExcerciseInfo = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getYogaAndExcerciseInfo").toString())
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Get yoga and track progress content information
    GetTrackProgress = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getTrackProgress").toString())
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Get yoga and knowledge transfer content information
    GetKnowledgeTransfer = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getKnowledgeTransfer").toString())
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Get notification setting configuration set by user
    GetNotificationSettingConfig = (): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getNotificationSettingConfig").toString())
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Save user notification config
    SaveNotificationSettingConfig = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("saveHealthPlanNotification").toString(), userData)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Get health plan appointment details
    GetHealthPlanAppointmentHistory = (categoryId, healthPlanId, consumerId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getHealthplanAppointmentHistory").toString() + "?category=" + categoryId + "&healthPlanId=" + healthPlanId + "&consumerId=" + consumerId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Upload user health plan status
    UploadUserHealthPlanStatus = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("savehealthPlanStatus").toString(), userData)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Retrieve all the uploaded appointment related details
    GetUploadedAppointmentPlanStatus = (lineItemId, consumerId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getAppoDetails").toString() + "?providerHealthPlanLineItemId=" + lineItemId + "&consumerId=" + consumerId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Health plam unique token to upload file in s3
    GetHealthPlanUniqueToken = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("getHealthPlanUniqueToken").toString(), userData)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Download Health record from AWS using Pre-signed URL
    DownloadHealthPlanUniqueToken = (consumerId: number, fileName: string): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("downloadHealthPlanUniqueToken").toString() + '?consumerId=' + consumerId + '&fileName=' + fileName + "&geId=" + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Save User appointment details update status
    SaveConsumerHealthPlanLineItemResponse = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("saveHealthPlanAppoDetails").toString(), userData)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }

    // Get Special conditions for healplan form
    GetSpecialConditionsForHealthPlan = (healthPlanId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getSpecialConditionsForHealthPlan").toString() + "?healthPlanId=" + healthPlanId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }

    // Save health plan user iofo with special condition
    SaveHealthPlanData = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("saveHealthPlanData").toString(), userData)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }

    // Get the line items in user profile for haealthplan
    GetHealthPlanLineItems = (categoryId, healthPlanId, consumerId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getHealthPlanLineItems").toString() + "?category=" + categoryId + "&healthPlanId=" + healthPlanId + "&consumerId=" + consumerId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }

    GetHealthPlanActionItems = (healthPlanId, consumerId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getHealthPlanActionItemsForDashboard").toString() + "?healthPlanId=" + healthPlanId + "&consumerId=" + consumerId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    // Get healthplan user data for profile
    GetConsumerHealthPlanData = (consumerId, healthPlanId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getConsumerHealthPlanData").toString() + "?consumerId=" + consumerId + "&healthPlanId=" + healthPlanId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Get Health plan details
    GetHealthPlanSubscriberDetails = (consumerId, healthPlanId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getHealthPlanSubscriberDetails").toString() + "?consumerId=" + consumerId + "&healthPlanId=" + healthPlanId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Save health journal details
    SaveHealthJournal = (userData: any): Observable<any> => {
        return this._http.post(this.commonService.getApiControllerName("saveHealthJournal").toString(), userData)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Get health journal list
    GetHealthJournals = (consumerId, healthPlanId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getHealthPlanJournals").toString() + "?consumerId=" + consumerId + "&healthPlanId=" + healthPlanId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Get health journal details
    GetHealthJournalDetails = (healthPlanJournalId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getHealthPlanJournalDetails").toString() + "?healthPlanJournalId=" + healthPlanJournalId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    // //Get Diet Plan 
    // GetDietPlans = (): Observable<any> => {
    //     return this._http.get(this.commonService.getApiControllerName("getDietPlan").toString())
    //         .map((response: Response) => response.json())
    //         .catch(this._http.handleError);
    // }
    // //Get Diet Plan details by id 
    // GetDietPlanDetails = (id): Observable<any> => {
    //     return this._http.get(this.commonService.getApiControllerName("getDietPlanDetails").toString() + "?Id=" + id)
    //         .map((response: Response) => response.json())
    //         .catch(this._http.handleError);
    // }
    // //Get yoga and excercise 
    // GetYogaAndExcercise = (): Observable<any> => {
    //     return this._http.get(this.commonService.getApiControllerName("getYogaAndExcercise").toString())
    //         .map((response: Response) => response.json())
    //         .catch(this._http.handleError);
    // }
    // //Get Diet Plan details by id 
    // GetYogaAndExcerciseDetails = (id): Observable<any> => {
    //     return this._http.get(this.commonService.getApiControllerName("getYogaAndExcerciseDetails").toString() + "?Id=" + id)
    //         .map((response: Response) => response.json())
    //         .catch(this._http.handleError);
    // }

    //Get Plan List
    GetPlans = (id): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getPlan").toString() + "?healthPlanId=" + id)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    // GetPendingAndApproachingHealthPlanLineItems
    GetPendingAndApproachingHealthPlanLineItems = (healthPlanId, consumerId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getPendingAndApproachingHealthPlanLineItems").toString() + "?healthPlanId=" + healthPlanId + "&consumerId=" + consumerId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Get trimester response by id 
    GetTrimesterResponse = (id, healthPlanId, consumerId): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getTrimesterResponse").toString() + "?trimester=" + id + "&healthPlanId=" + healthPlanId + "&consumerId=" + consumerId)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    GetHealthPlanJournalsForConsumerByDate = (consumerId, healthPlanId, date): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("getHealthPlanJournalsForConsumerByDate").toString() + "?consumerId=" + consumerId + "&healthPlanId=" + healthPlanId + "&entryDate=" + date)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }

    MakeFavouriteHealthPlanJournal = (healthPlanJournalId, Favourite): Observable<any> => {
        return this._http.get(this.commonService.getApiControllerName("makeFavouriteHealthPlanJournal").toString() + "?healthPlanJournalId=" + healthPlanJournalId + "&makeFavourite=" + Favourite)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    //Validate Email and Mobile before login 
    GetValidateEmailAndMobileBeforeLogin = (userData: any): Observable<any> => {
        return this._http.getOffline(this.commonService.getApiControllerName("getValidateEmailAndMobileBeforeLogin").toString() + "?email=" + userData.UserLogin + "&mobile=" + userData.CountryCode + userData.Contact + "&groupEntityId=" + this.commonService.getGroupEntityId())
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
    // //Get Varify OTP For Login
    // GetVarifyOTPForLogin = (userData: any, otp: string): Observable<any> => {
    //     return this._http.get(this.commonService.getApiControllerName("getVarifyOTPForLogin").toString() + "?contactNum=" + userData.Contact + "&email=" + userData.UserLogin + "&otp=" + otp + "&groupEntityId=" + this.commonService.getGroupEntityId())
    //         .map((response: Response) => response.json())
    //         .catch(this._http.handleError);
    // }
    //Login with OTP
    UserLoginWithOTP = (userData: any): Observable<any> => {
        let loginData = 'grant_type=password&username=' + userData.UserLogin  + '&loginType=LoginWithOTP&userType=Consumer&parentGroupEntityId=' + this.commonService.getGroupEntityId() + '&groupEntityID=' + this.commonService.getGroupEntityId() + '&contactNumber=' + userData.Contact.toString();
        return this._http.post(this.commonService.getApiControllerName("userLogin").toString(), loginData)
            .map((response: Response) => response.json())
            .catch(this._http.handleError);
    }
}