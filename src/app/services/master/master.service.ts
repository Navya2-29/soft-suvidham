import { ChangePasswordComponent } from './../../core/auth/change-password/change-password.component';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Pmaster } from '../../models/pmaster.model';
import { Constant } from '../../constants/constant';
import { Cmaster, VCMRequestBody } from '../../models/cmaster.model';
import {
  AccountHead,
  AccountSubHead,
  Vmaster,
} from '../../models/vmaster.model';
import {
  SpecialDayMaster,
  SpecialDayMasterList,
} from '../../models/special-day-master.model';
import { SeasonalMaster } from '../../models/season-master.model';
import { DayMaster } from '../../models/day-master.model';
import { multiDayFilter } from '../../models/multidayFilter.model';
import { ItemMaster } from '../../models/item-master.model';
import { Settings } from 'jspdf-autotable';
import { UpdateStarRequest } from '../../models/starmaster.model';
@Injectable({
  providedIn: 'root',
})
export class MasterService {
  userId:string | null='';
  private readonly http = inject(HttpClient);

  constructor() {
this.userId=localStorage.getItem('LoginId');
  }

  // get all prathishta list
  getPmaster(): Observable<Pmaster[]> {
    const payLoad = {
      Type: 'PrethistaALL',
      Code: '',
    };
    return this.http
      .post<Pmaster[]>(Constant.BASE_URL + Constant.METHODS.GET_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  // getprathishta by code
  getPrathishtaByCode() {
    const payLoad = {
      Type: 'Prethista',
      Code: '12',
    };
    return this.http
      .post<any[]>(Constant.BASE_URL + Constant.METHODS.GET_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  // create prathishta
  createPmaster(obj: Pmaster): Observable<Pmaster> {
    const payload = {
      PMId: '',
      PMCode: obj.PM_Code,
      PMName: obj.PM_Name,
      PMRName: obj.PM_RegName,
      Active: obj.PM_Active ? 'Y' : 'N',
      Type: 'INSERT',
      UnitId: '1',
      Cuser: this.userId,
      PMImage: obj.PM_Image,
    };

    return this.http
      .post<Pmaster>(
        Constant.BASE_URL + Constant.METHODS.CREATE_PMASTER,
        payload
      )
      .pipe(catchError(this.errorHandler));
  }
  // update pmaster
  updatePmaster(obj: Pmaster, Id: string): Observable<Pmaster> {
    const id = `${Id}`;
    const payLoad = {
      PMId: id,
      PMCode: obj.PM_Code,
      PMName: obj.PM_Name,
      PMRName: obj.PM_RegName,
      Active: obj.PM_Active ? 'Y' : 'N',
      Type: 'UPDATE',
      UnitId: '1',
      Cuser: this.userId,
      PMImage: obj.PM_Image,
    };
    return this.http
      .post<Pmaster>(
        Constant.BASE_URL + Constant.METHODS.CREATE_PMASTER,
        payLoad
      )
      .pipe(catchError(this.errorHandler));
  }

  // delete pmaster
  deletePmaster(id: string): Observable<void> {
    const payLoad = {
      Type: 'Prethista',
      Id: id,
    };
    return this.http
      .post<void>(Constant.BASE_URL + Constant.METHODS.DELETE_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }


    // delete pmaster
    deleteAllPrethista(id: string): Observable<void> {
      const payLoad = {
        Type: 'PrethistaAll',
        Id: id,
      };
      return this.http
        .post<void>(Constant.BASE_URL + Constant.METHODS.DELETE_MASTER, payLoad)
        .pipe(catchError(this.errorHandler));
    }
  // get category
  getCmaster(): Observable<Cmaster[]> {
    const payLoad: VCMRequestBody = { Type: 'CategoryALL', Code: '' };
    return this.http
      .post<Cmaster[]>(Constant.BASE_URL + Constant.METHODS.GET_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }

   getGmaster(): Observable<any[]> {
    const payLoad: any = { Type: 'Gothram', Code: '' };
    return this.http
      .post<any[]>(Constant.BASE_URL + Constant.METHODS.GET_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }
  // create category
  createCmaster(obj: Cmaster): Observable<any> {
    const payLoad = {
      VCId: '1',
      VCCode: obj.VC_Code,
      VCName: obj.VC_Name,
      VCRName: obj.VC_RegName,
      Active: obj.VC_Active ? 'Y' : 'N',
      Type: 'INSERT',
      Cuser:this.userId,
    };
    return this.http
      .post<Cmaster>(
        Constant.BASE_URL + Constant.METHODS.CREATE_CMASTER,
        payLoad
      )
      .pipe(catchError(this.errorHandler));
  }

  // update category
  updateCmaster(id: string, obj: Cmaster): Observable<any> {
    const payLoad = {
      VCId: id.toString(),
      VCCode: obj.VC_Code,
      VCName: obj.VC_Name,
      VCRName: obj.VC_RegName,
      Active: obj.VC_Active ? 'Y' : 'N',
      Type: 'UPDATE',
      Cuser: this.userId,
    };
    return this.http
      .post<Cmaster>(
        Constant.BASE_URL + Constant.METHODS.CREATE_CMASTER,
        payLoad
      )
      .pipe(catchError(this.errorHandler));
  }

  // delete category
  deleteCmaster(id: string): Observable<any> {
    const payLoad = {
      Type: Constant.METHODS.Type,
      Id: id.toString(),
    };
    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.DELETE_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }
   deleteGothrammaster(id: string): Observable<any> {
    const payLoad = {
      Type: "Gothram",
      Id: id.toString(),
    };
    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.DELETE_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  // vamster service
  getVmaster(): Observable<Vmaster[]> {
    const payLoad = { Type: 'vazhipadALL', Code: '' };
    return this.http
      .post<Vmaster[]>(Constant.BASE_URL + Constant.METHODS.GET_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }
  getActiveVazhipadName(): Observable<Vmaster[]> {
    const payLoad = { Type: 'ActiveVazhipad', Code: '' };
    return this.http
      .post<Vmaster[]>(Constant.BASE_URL + Constant.METHODS.GET_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }
  getAllActiveVazhipad(): Observable<Vmaster[]> {
    const payLoad = { Type: 'ListVazhipad', Code: '' };
    return this.http
      .post<Vmaster[]>(Constant.BASE_URL + Constant.METHODS.GET_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  // create vamster
  createVmaster(id: string, obj: Vmaster): Observable<Vmaster> {

    const Id = `${id}`;
    const payLoad = {
      vazhId: '',
      VazhCode: obj.VM_Code,
      VazhName: obj.VM_Name,
      VazhRName: obj.VM_RName,
      VazhAmt: obj.VM_Amt,
      VazhMaxNo: obj.VM_MaxNo,
      VazhReceipt: obj.VM_Receipt ? 'Y' : 'N',
      VazhBooking: obj.VM_Booking ? 'Y' : 'N',
      VazhSeasonal: obj.VM_Seasonal ? 'Y' : 'N',
      VazhMultiName: obj.VM_MultiName ? 'Y' : 'N',
      VMDevice: obj.VM_Device ? 'Y' : 'N',
      VMapp: obj.VM_Mobileapp ? 'Y' : 'N',
      VMspecial: obj.VM_Special ? 'Y' : 'N',
      VMRatechange: obj.VM_Rate_Change ? 'Y' : 'N',
      VazhTime: obj.VM_Time,
      VazhTimeLimit: obj.VM_TimeLimit,
      VMDescription: obj.VM_Description,
      VMAlert: obj.VM_AlertMsg,
      Active: obj.VM_Active ? 'Y' : 'N',
      VCatId: Id,
      ACHeadCode: obj.ACHeadCode,
      ACSubCode: obj.ACSubCode,
      Cuser: this.userId,
      VM_Mattinam:obj.VM_Mattinam ? 'Y' : 'N',
      VazhBlocking: obj.VM_Blocking ? 'Y' : 'N',
      Type: 'INSERT',
      DisplayMode: obj.DisplayMode ? 'Y' : 'N',
      VM_SMS: obj.VM_SMS ? 'Y' : 'N',
      VM_Whatsapp: obj.VM_Whatsapp ? 'Y' : 'N',
      VM_Sales:obj.VM_Sales ? 'Y':'N',
      VM_Donation:obj.VM_Donation?'Y':"N",
      TimeSlot:obj.VM_TimeSlot?'Y':'N',
      VM_CurrentBooking:obj.VM_CurrentDay?'Y':'N',
      Token:obj.VM_Token?'Y':'N',
      VM_SingleReceipt:"N",
      LifeTime: obj.LifeTime ? 'Y' : 'N',
      prathistainfo: obj.prathistainfo,
    };
    return this.http
      .post<Vmaster>(
        Constant.BASE_URL + Constant.METHODS.CREATE_VMASTER,
        payLoad
      )
      .pipe(catchError(this.errorHandler));
  }

  // update vamster
  updateVmaster(VC_Id: string, obj: Vmaster, id: number): Observable<Vmaster> {

    // const userId=localStorage.getItem('LoginId');
    const Id = `${id}`;
    const payLoad = {
      vazhId: Id,
      VazhCode: obj.VM_Code,
      VazhName: obj.VM_Name,
      VazhRName: obj.VM_RName,
      VazhAmt: obj.VM_Amt.toString()!=""?`${obj.VM_Amt}`:"0",
      VazhMaxNo: `${obj.VM_MaxNo}`!="0"?`${obj.VM_MaxNo}`:"0",
      VazhReceipt: obj.VM_Receipt ? 'Y' : 'N',
      VazhBooking: obj.VM_Booking ? 'Y' : 'N',
      VazhSeasonal: obj.VM_Seasonal ? 'Y' : 'N',
      VazhMultiName: obj.VM_MultiName ? 'Y' : 'N',
      VM_Mattinam:obj.VM_Mattinam ? 'Y': 'N',
      VMDevice: obj.VM_Device ? 'Y' : 'N',
      VMapp: obj.VM_Mobileapp ? 'Y' : 'N',
      VMspecial: obj.VM_Special ? 'Y' : 'N',
      VMRatechange: obj.VM_Rate_Change ? 'Y' : 'N',
      VazhTime: obj.VM_Time,
      VazhTimeLimit: `${obj.VM_TimeLimit}`!=""?`${obj.VM_TimeLimit}`:"0",
      VMDescription: obj.VM_Description,
      VMAlert: obj.VM_AlertMsg,
      Active: obj.VM_Active ? 'Y' : 'N',
      VCatId: `${VC_Id}`,
      ACHeadCode: obj.ACHeadCode,
      ACSubCode: obj.ACSubCode,
      Cuser: this.userId,
      VazhBlocking: obj.VM_Blocking ? 'Y' : 'N',
      Type: 'UPDATE',
      DisplayMode: obj.DisplayMode ? 'Y' : 'N',
      VM_SMS: obj.VM_SMS ? 'Y' : 'N',
      VM_Whatsapp: obj.VM_Whatsapp ? 'Y' : 'N',
      VM_Sales:obj.VM_Sales ? 'Y':'N',
      VM_Donation:obj.VM_Donation?"Y":"N",
      TimeSlot:obj.VM_TimeSlot?'Y':'N',
      VM_CurrentBooking:obj.VM_CurrentDay?'Y':'N',
      Token:obj.VM_Token?'Y':'N',
      LifeTime: obj.LifeTime ? 'Y' : 'N',
      prathistainfo: obj.prathistainfo,
    };
    return this.http
      .post<Vmaster>(
        Constant.BASE_URL + Constant.METHODS.CREATE_VMASTER,
        payLoad
      )
      .pipe(catchError(this.errorHandler));
  }

  // delete vamster
  deleteVmaster(Id: string): Observable<void> {
    const payLoad = {
      Type: 'vazhipad',
      Id: Id,
    };
    return this.http
      .post<void>(Constant.BASE_URL + Constant.METHODS.DELETE_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  getVazhipadeByCode(code: any) {
    const payLoad = {
      Type: 'vazhipad',
      Code: code,
    };
    return this.http.post(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }

  getVazhipadByCodeForDiety(code: any) {
    const payLoad = {
      Type: 'VazhipadDiety',
      Code: code,
    };
    return this.http.post<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }

  // getseasonalised vazhipad
  getSeasonalisedVazhipad(): Observable<Vmaster[]> {
    const payLoad = {
      Type: 'VazhipadSeasonal',
      Code: '',
    };
    return this.http.post<Vmaster[]>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }

  getSeasonalVazhipadeByCode(code: any) {
    const payLoad = {
      Type: 'Seasonal',
      Code: code,
    };
    return this.http.post(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }

  // // seasonal  master
  // get list  seasonl master vazhipad
  getAllSeasonalMasterVazhipadList(): Observable<any[]> {
    return this.http.get<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_VSPECIAL
    );
  }

  // get list seasonl master
  getSeasonalMaster(): Observable<any[]> {
    const payLoad = { Type: 'SeasonalALL', Code: '12' };
    return this.http.post<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }

  // create  seasonl master
  createSeasonalMaster(id: number, data: SeasonalMaster): Observable<any> {
    const payLoad = {
      VazhId: `${id}`,
      Fdate: data.VS_FromDate,
      Tdate: data.VS_ToDate,
      reason: data.VS_Reasion,
      Cuser: this.userId,
      Type: 'INSERT',
    };

    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.CREATE_SEASONAL,
      payLoad
    );
  }

  // update  seasonal master
  updateSeasonalMaster(id: string, data: SeasonalMaster): Observable<any> {
    const payLoad = {
      VazhId: id.toString(),
      Fdate: data.VS_FromDate,
      Tdate: data.VS_ToDate,
      reason: data.VS_Reasion,
      Cuser: this.userId,
      Type: 'UPDATE',
    };

    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.CREATE_SEASONAL, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  // delete  seasonl master
  deleteSeasonalMaster(id: string): Observable<any> {
    const payLoad = { Type: 'Seasonal', Id: id };
    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.DELETE_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  // special day master
  // get list special vazhipad
  getAllSpecialVazhipadList(): Observable<SpecialDayMasterList[]> {
    return this.http.get<SpecialDayMasterList[]>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER
    );
  }

  //// get list special vazhipad
  getSpecialDayMaster(): Observable<SpecialDayMaster[]> {
    return this.http.get<SpecialDayMaster[]>(
      Constant.BASE_URL + Constant.METHODS.GET_ALL_SPECIAL
    );
  }

  // create special day
  createSpecialDayMaster(data: SpecialDayMaster): Observable<SpecialDayMaster> {
    return this.http.post<SpecialDayMaster>(
      Constant.BASE_URL + Constant.METHODS.CREATE_VSPECIAL,
      data
    );
  }

  // update special day
  updateSpecialDay(id: Number, obj: SpecialDayMaster): Observable<any> {
    return this.http
      .put<SpecialDayMaster>(
        Constant.BASE_URL + Constant.METHODS.UPDATE_VSPECIAL + id,
        obj
      )
      .pipe(catchError(this.errorHandler));
  }

  // delete special day
  deleteSpecialDay(id: string): Observable<any> {
    return this.http
      .delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_VSPECIAL + id)
      .pipe(catchError(this.errorHandler));
  }

  // vihidham master

  //// get list vihidham master
  getVihidhamMaster(payLoad:any): Observable<any[]> {
    return this.http.post<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,payLoad
    );
  }

  // create  vihidham master
  createrateVihidhamMaster(data: any): Observable<any> {
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.CREATE_VIHIDHAMRATE,
      data
    );
  }
  createVihidhamMaster(data: any): Observable<any> {
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.CREATE_VIHIDHAM,
      data
    );
  }

  // // update  vihidham master
  // updateVihidhamMaster(id: string, obj: any): Observable<any> {
  //   return this.http
  //     .put<any>(Constant.BASE_URL + Constant.METHODS.UPDATE_VIHIDHAM + id, obj)
  //     .pipe(catchError(this.errorHandler));
  // }

  // delete  vihidham master
  deleteVihidhamMaster(id: string): Observable<any> {
    return this.http
      .delete<any>(Constant.BASE_URL + Constant.METHODS.CREATE_VIHIDHAM + id)
      .pipe(catchError(this.errorHandler));
  }

  // item master

  //// get list item master
  getItemMaster(payLoad:any): Observable<any[]> {
    return this.http.post<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,payLoad
    );
  }

  // create  item master
  createItemMaster(data: any): Observable<any> {

    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.CREATE_ITEM,
      data
    );
  }

  // update  item master
  updateItemMaster( obj: any): Observable<any> {

    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.CREATE_ITEM , obj)
      .pipe(catchError(this.errorHandler));
  }

  // delete  item master
  deleteItemMaster(payLoad: any): Observable<any> {
    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.DELETE_MASTER,payLoad)
      .pipe(catchError(this.errorHandler));
  }

  // member details

  getMember(): Observable<any[]> {
    return this.http.get<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_ALL_MEMBER
    );
  }

  // create  member master
  createMember(data: any): Observable<any> {
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.CREATE_MEMBER,
      data
    );
  }

  // update  member master
  updateMember(id: string, obj: any): Observable<any> {
    return this.http
      .put<any>(Constant.BASE_URL + Constant.METHODS.UPDATE_MEMBER + id, obj)
      .pipe(catchError(this.errorHandler));
  }

  // delete  member master
  deleteMember(id: string): Observable<any> {
    return this.http
      .delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_MEMBER + id)
      .pipe(catchError(this.errorHandler));
  }

  // combo master
  getAllComoVazhipadList(): Observable<any[]> {
    return this.http.get<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_VCOMBO
    );
  }

  getComboVazhipad(id: string): Observable<any[]> {
    return this.http.get<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_VCOMBO_BYID
    );
  }

  // get list combo vazhipad
  getComboMaster(): Observable<any[]> {
    return this.http.get<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_ALL_VCOMBO
    );
  }
  // create combo
  createComboMaster(data: any): Observable<any> {
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.CREATE_VCOMBO,
      data
    );
  }

  // update combo
  updateCombo(id: string, obj: any): Observable<any> {
    return this.http
      .put<any>(Constant.BASE_URL + Constant.METHODS.UPDATE_VCOMBO + id, obj)
      .pipe(catchError(this.errorHandler));
  }

  // delete combo
  deleteCombo(id: string): Observable<any> {
    return this.http
      .delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_VCOMBO + id)
      .pipe(catchError(this.errorHandler));
  }

  // day master

  // get list day vazhipad
  getDayMaster(): Observable<any[]> {
    const payLoad = { Type: 'DayALL', Code: '12' };
    return this.http.post<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }

  // vazhipad date
  getDayMastervazhipaddateCheck(vid: string): Observable<any[]> {
    const payLoad = { Type: 'DayCheck', Code: vid };
    return this.http.post<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }

   updateStarMaster(payload: UpdateStarRequest): Observable<any> {
    return this.http.post(
      Constant.BASE_URL + Constant.METHODS.UPDATESTARMASTER,
      payload
    );
  }

  // create  day
  createDayMaster(payLoad: object): Observable<any> {
    // console.log(typeof(VMId));
    // console.log(data.Day)
    // const payLoad = { "VazhId": `${VMId}`, "Day": data.Day, "Cuser": "2", "Type": "INSERT" }
    // console.log(payLoad);
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.CREATE_VDAY,
      payLoad
    );
  }

  // update  day
  updateDay(): Observable<any> {
    const payLoad = { VazhId: '1', Day: '4', Cuser:this.userId, Type: 'UPDATE' };
    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.CREATE_VDAY, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  // delete  day
  deleteDay(id: number): Observable<any> {

    const payLoad = { Type: 'DayMaster', Id: `${id}` };
    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.DELETE_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  deleteDayByVazhipadId(id: number): Observable<any> {

    const payLoad = { Type: 'DayAll', Id: `${id}` };
    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.DELETE_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  // blocking master

  // get list block vazhipad
  getBlockingMaster(payLoad: object): Observable<any[]> {
    return this.http.post<any[]>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }
  // create block
  createBlockingMaster(data: any): Observable<any> {

    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.CREATE_VBLOCK,
      data
    );
  }

  // update block
  updateBlockingMaster(payLoad: any): Observable<any> {
    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.CREATE_VBLOCK, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  // delete block
  deleteBlockingMaster(payLoad: object): Observable<any> {
    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.DELETE_MASTER, payLoad)
      .pipe(catchError(this.errorHandler));
  }

  // get nakshthram
  getNakshthra(): Observable<string[]> {
    return this.http.get<string[]>('assets/data/nakshatras.json');
  }

  // get account heads
  getAccountHeads(): Observable<AccountHead[]> {
    return this.http.get<AccountHead[]>(
      Constant.BASE_URL + Constant.METHODS.GET_ACCOUNTHEAD
    );
  }

  // get account sub heads
  getSubAccountHeads(): Observable<AccountSubHead[]> {
    return this.http.get<AccountSubHead[]>(
      Constant.BASE_URL + Constant.METHODS.GET_SUBACCOUNTHEAD
    );
  }

  // vazhipad booking

  vazhipadBooking(data: any): Observable<any[]> {
    return this.http
      .post<any>(Constant.BASE_URL + Constant.METHODS.VAZHIPAD_BOOKING, data)
      .pipe(catchError(this.errorHandler));
  }

  SearchByMobileNo(payLoad: any): Observable<any[]> {
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.SEARCHBYMOBILENUMBER,
      payLoad
    );
  }

  updateonlinetrnsactionstatuspaymentmode(payLoad: any){
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.UPDATEONLINESTATUS,
      payLoad
    );
  }
  SearchByBillNo(payLoad: any): Observable<any[]> {
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }

  getStarData(payLoad: any): Observable<any[]> {
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.SEARCHBYMOBILENUMBER,
      payLoad
    );
  }
  getMalayalamMonthList(payLoad: any): Observable<any[]> {

    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }

// getting last locktable number

  getLastBillNumber(): Observable<any[]> {
    const payLoad = { Type: 'Maxbillno', Code: '' };
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.SEARCHBYMOBILENUMBER,
      payLoad
    );
  }



  getloggedInUserLastBillNumber(): Observable<any[]> {
    const loggedinUserId = localStorage.getItem('LoginId');
    const payLoad = { Type: 'UserBillno', Code: loggedinUserId };
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.SEARCHBYMOBILENUMBER,
      payLoad
    );
  }

  updateLastBillNumber(currentbillnumber: any): Observable<any[]> {
    const payLoad = { Type: 'UpdateBillNo', code: currentbillnumber };
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.SEARCHBYMOBILENUMBER,
      payLoad
    );
  }
    updateLastEndowmentBillNumber(currentbillnumber: any): Observable<any[]> {
    const payLoad = { Type: 'UpdateBillNoEndowment', code: currentbillnumber };
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.SEARCHBYMOBILENUMBER,
      payLoad
    );
  }

  getSeasonalVazhipadDateCheck(vid: string) {
    const payLoad = { Type: 'SeasonalCheck', Code: vid };
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }

  getTodaycollection(): Observable<any[]> {
    const payLoad = { Type: 'TodayCollection', Code: '' };
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.SEARCHBYMOBILENUMBER,
      payLoad
    );
  }

  getMultidyaFilterinddata(payLoad: any) {
    return this.http.post<multiDayFilter>(
      Constant.BASE_URL + Constant.METHODS.MULTIDAY_FILTER,
      payLoad
    );
  }

  getThithilist(payLoad: any) {
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }

  getVazhipadListBasedOnPrathistaList(payLoad: any) {
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );
  }
cancellBill(payLoad:any){
  return this.http.post<any>(
    Constant.BASE_URL + Constant.METHODS.CANCEL_BILL,
    payLoad
  );
}
nadavaravBooking(payLoad:any){
  return this.http.post<any>(
    Constant.BASE_URL + Constant.METHODS.NADAVARAV_BOOKING,
    payLoad
  );
}

getNadavaravBooking(payLoad:any){
  return this.http.post<any>(
    Constant.BASE_URL + Constant.METHODS.GET_MASTER,
    payLoad
  );
}


getNadavaravBillNumber(payLoad:any){
  return this.http.post<any>(
    Constant.BASE_URL + Constant.METHODS.GET_MASTER,
    payLoad
  );
}

settingsData(){
  const payLoad={
    "Type":"Setting","code":""
  }
  return this.http.post<any>(
    Constant.BASE_URL + Constant.METHODS.GET_MASTER,
    payLoad
  );
}
upDateSettings(payLoad:any){
  return this.http.post<any>(
    Constant.BASE_URL + Constant.METHODS.UPDATESETTING,
    payLoad
  );
}

getMaster(payLoad:any){
  return this.http.post<any>(
    Constant.BASE_URL + Constant.METHODS.GET_MASTER,
    payLoad
  );
}
deleteMaster(payLoad:any){
  return this.http.post<any>(
    Constant.BASE_URL + Constant.METHODS.DELETE_MASTER,
    payLoad
  );
}

updateNadavaravuBillNumber(currentbillnumber: any): Observable<any[]> {
  const payLoad = { Type: 'UpdateBillNoNadavaravu', code: currentbillnumber };
  return this.http.post<any>(
    Constant.BASE_URL + Constant.METHODS.SEARCHBYMOBILENUMBER,
    payLoad
  );
}
  createStaffmanagement(payLoad:any){
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.CREATE_STAFF,
      payLoad
    );
  }

  createCreditCollection(payLoad:any){
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.CREDITCOLLECT,
      payLoad
    );
  }

  updatecreditBillNumber(currentbillnumber: any): Observable<any[]> {
    const payLoad = { Type: 'UpdateBillNoCredit', code: currentbillnumber };
    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.SEARCHBYMOBILENUMBER,
      payLoad
    );
  }

  editBilllingDetils(payLoad: any): Observable<any[]> {

    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.UPDATEBILL,
      payLoad
    );
  }


  duplicateCount(payLoad: any): Observable<any[]> {

    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.DUPLICATECOUNT,
      payLoad
    );
  }
  ADDCOUNTER(payLoad: any): Observable<any[]> {

    return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.ADDCOUNTER,
      payLoad
    );
  }

    getBlockedListCheck(){
     const payLoad={Type:"BlockingAll",code:"" }
      return this.http.post<any>(
      Constant.BASE_URL + Constant.METHODS.GET_MASTER,
      payLoad
    );

  }

   createGothramMaster(obj: Cmaster): Observable<any> {
    const payLoad = {
      VCId: '1',
      VCCode: obj.VC_Code,
      VCName: obj.VC_Name,
      VCRName: obj.VC_RegName,
      Active: obj.VC_Active ? 'Y' : 'N',
      Type: 'INSERT',
      Cuser:this.userId,
    };
    return this.http
      .post<Cmaster>(
        Constant.BASE_URL + Constant.METHODS.GOTHRAMMASTER,
        payLoad
      )
      .pipe(catchError(this.errorHandler));
  }
    updateGothramMaster(id: string, obj: Cmaster): Observable<any> {
    const payLoad = {
      VCId: id.toString(),
      VCCode: obj.VC_Code,
      VCName: obj.VC_Name,
      VCRName: obj.VC_RegName,
      Active: obj.VC_Active ? 'Y' : 'N',
      Type: 'UPDATE',
      Cuser: this.userId,
    };
    return this.http
      .post<Cmaster>(
        Constant.BASE_URL + Constant.METHODS.GOTHRAMMASTER,
        payLoad
      )
      .pipe(catchError(this.errorHandler));
  }
  getVazhipadWiseReport(payLoad:any){
    return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.VAZHIPADWISEREPRT,payLoad)
  }

  updateBookingTransmode(payLoad:any){
    return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.UPDATEBILLMODE,payLoad)
  }

  getMultiBlockDayList(payLoad:any){
    return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.CHECKMULTIBLOCKS,payLoad)
  }

updatePanchangam(data: any) {
  return this.http.post(Constant.BASE_URL+Constant.METHODS.UPDATEUTIL, data);
}

AddDevoteeMaster(payLoad:any){
 return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.DEVOTEEMASTER,payLoad);
}

upLoadTransaction(payLoad:any){
  return this.http.post<any>('https://www.plutuscloudservice.in:8201/API/CloudBasedIntegration/V1/UploadBilledTransaction',payLoad)
}
gettransactionStatus(payLoad:any){
  return this.http.post<any>('https://www.plutuscloudservice.in:8201/API/CloudBasedIntegration/V1/GetCloudBasedTxnStatus',payLoad)

}
cancelTransaction(payLoad:any){
  return this.http.post<any>('https://www.plutuscloudservice.in:8201/API/CloudBasedIntegration/V1/CancelTransaction',payLoad)

}
addFeeCollection(payLoad:any){
  return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.FEECOLLECTION,payLoad);

}
changePassword(payLoad:any){
  return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.CHANGEPASSWORD,payLoad);
}

// getDayList(payLoad:any){
//   return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.DAY,payLoad)

// }

// getting ip address

// getIpDetails(): Observable<any> {
//   return this.http.get<any>(Constant.urlForIp);
// }

  // error handling
  private errorHandler(error: HttpErrorResponse) {
    //
    return throwError(() => new Error('Error occurred'));
  }
}
