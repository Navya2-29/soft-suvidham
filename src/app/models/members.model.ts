export interface AdditionalDetails {
  Name: string;
  Star:string;
  Id:number;
  MID:number;
}


export interface MembersReport {
    MID:number;
    Name: string;
    Address:string;
    Qty: number ;
    email:string;
    mobile:string;
    Vazhipad?:String;
    Star?:string; 
    BillDate?:string;
    BillNo?:string;
    VazhiDate?:string;
    Amount?:number;
    CounterId?:number;
    MobileNo?:string;
    Rate?:number;
    TrnMode?:string;
    additionalData?: AdditionalDetails[];
    VazhId:number;
  }