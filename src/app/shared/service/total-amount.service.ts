import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MasterService } from '../../services/master/master.service';

@Injectable({
  providedIn: 'root'
})
export class TotalAmountService {
  private multidayDataSubject = new BehaviorSubject<any>(null);
  private totalAmountSubject = new BehaviorSubject<number>(0);
  private clickSubject = new Subject<void>();
  private firstComponentData: any;
  private secondComponentData: any;
  lastBillNumber:number=0;
  constructor(private masterService:MasterService) { }
  
  multidayData$ = this.multidayDataSubject.asObservable();

  setMultidayData(data: any) {
    this.multidayDataSubject.next(data);
  }


 
  totalAmount$ = this.totalAmountSubject.asObservable();

  setTotalAmount(amount: number) {
    this.totalAmountSubject.next(amount);
  }

 

  clickEvent$ = this.clickSubject.asObservable();

  emitClickEvent() {
    this.clickSubject.next();
  }

  setFirstComponentData(data: any) {
    this.firstComponentData = data;
  }

  getFirstComponentData(): any {
    return this.firstComponentData;
  }

  setSecondComponentData(data: any) {
    this.secondComponentData = data;
  }

  getSecondComponentData(): any {
    return this.secondComponentData;
  }

  getAllData(): any {
    return {
      ...this.firstComponentData,
      ...this.secondComponentData
    };
  }

  private updateLastBillNumber = new Subject<void>();
  dataSubmitted$ = this.updateLastBillNumber.asObservable();


  notifytheupdateLastbillnumber() {
    this.updateLastBillNumber.next();
  }

}
