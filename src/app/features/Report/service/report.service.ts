import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from '../../../constants/constant';
@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http:HttpClient) { }


  getReport(payLoad:any){
    return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.GET_REPORT,payLoad)
  }

getVazhipadWiseReport(payLoad:any){
  return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.VAZHIPADWISEREPRT,payLoad)

}
  
}
