import { MembersReport } from './../../../models/members.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginatorModule,
} from '@angular/material/paginator';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MasterService } from '../../../services/master/master.service';
import { forkJoin } from 'rxjs';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { PrintreportService } from '../../../shared/service/printreport.service';
@Component({
  selector: 'app-report-endowmnet-register',
  standalone: true,
  imports: [CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    SpinnerComponent,
    MatTooltipModule,MatFormFieldModule,TranslateModule, MatInputModule,],
  templateUrl: './report-endowmnet-register.component.html',
  styleUrls: ['./report-endowmnet-register.component.css','/src/assets/styles/report.style.css'],
})
export class ReportEndowmnetRegisterComponent {

  data: MembersReport[] = [];
loading:boolean=false; 

  currentDate: string = '';

  counterId:string | null;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  nakshatham: any[];
  VMList: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http:HttpClient,
    private ts: TranslateService,
    private masterService:MasterService,
    private reportPrintservice:PrintreportService
  ) {
    this.counterId=localStorage.getItem('Counter')
    this.lang=localStorage.getItem('Language');
this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
const userLang = navigator.language || 'en';
const languageCode = userLang.split('-')[0];
this.ts.setDefaultLang(languageCode);
this.ts.use(this.lang || 'en');
  }

  ngOnInit(): void { 
      this.fetchReportData();
     this. loadStarData();
     this.getAllvazhipad()
  }
  
  // Call your API service to get the report data
  fetchReportData(): void {
    this.loading=true;
    const payLoad = {
      Type: "DevoteeMaster",
     Code:""
    };
    this.masterService.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data.filter((item:any) => item.Amount!=0);;
        this.fetchAdditionalData();
       
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }


  fetchAdditionalData(): void {
    if (!this.data || this.data.length === 0) return;
  
    // Create an array of API calls for each 'mid'
    const apiCalls = this.data.map((item) =>
      this.masterService.getMaster({ Type:"EditDevoteeMaster",Code: item.MID }) // Adjust payload as needed
    );
  
    forkJoin(apiCalls).subscribe({
      next: (responses) => {
        // Merge additional data into the existing dataset
        this.data = this.data.map((item, index) => ({
          ...item,
          additionalData: responses[index] || [], // Ensuring it's always an array
        }));
  
        console.log('Merged Data:', this.data);
        this.loading=false;
      },
      error: (error) => {
        console.error('Error fetching additional data:', error);
      },
    });
  }




  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }



  

  goBack(): void {
    console.log('Going back...'); // Log to verify method execution
    this.router.navigate(['/getReport']);

    if (window.history.length > 1) {
      window.history.back(); // Goes back to the previous page in history
    } else {
      window.close(); // Closes the tab if it's the only page open
    }



  }


 


  

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        return 'Bank';
      case 'CS':
        return 'CASH';
      case 'MO':
        return 'MONEY ORDER';
      case 'UP':
        return 'UPI';
      case 'CH':
        return 'CHEQUE';
      case 'CR':
        return 'CREDIT';
      case 'DE':
        return 'DEBIT';

      default:
        return 'OTHERS';
    }
  }

  
  loadStarData(): void {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterService.getStarData(payLoad).subscribe({
      next: (data: any[]) => {
        console.log(data);
        this.nakshatham = data; 

      },
      error: (err) => {
        console.error('Error loading star data:', err);
      },
    });
  }
  getStarbyId(id: string) {
    console.log(id, 'star id');
    if (this.lang == 'en') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_NameEng : '';
    } else if (this.lang == 'ml') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_Name : '';
    }
  }
 



  generatePDF(){
   this.reportPrintservice.generatePDF();
}

 getAllvazhipad() {
    this.masterService.getAllActiveVazhipad().subscribe((data) => {
      this.VMList = data.map((item) => ({
        VM_Id: item.VM_Id,
        VM_Name: item.VM_Name,
        VM_Code: item.VM_Code,
        VM_RName: item.VM_RName,
      }));
    });
  }
getVazhipadNAmeById(vazhipadId:any){
   if(this.lang=='en'){
  let matchedVm = this.VMList.find(item => item.VM_Id ==vazhipadId);
  
  return matchedVm?matchedVm.VM_Name:""
  
 
  }else if(this.lang=='ml'){
   let matchedVm = this.VMList.find(item => item.VM_Id ==vazhipadId);
  
   return matchedVm?matchedVm.VM_RName:""
  
}
}

}
