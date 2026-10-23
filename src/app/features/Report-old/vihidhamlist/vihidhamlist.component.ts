import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { jsPDF } from 'jspdf';
import { ReportData } from '../../../models/poornam-report';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { VihidhamMaster } from '../../../models/vihidham-master.model';
import { MasterService } from '../../../services/master/master.service';
@Component({
  selector: 'app-vihidhamlist',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule ,
    SpinnerComponent
  ],
  templateUrl: './vihidhamlist.component.html',
  styleUrls: ['./vihidhamlist.component.css','/src/assets/styles/report.style.css']
})
export class VihidhamlistComponent {
  data: VihidhamMaster[] = [];
  // @ViewChild(MatPaginator) paginator!: MatPaginator;
  // groupedData: { [key: string]: ReportData[] } = {};
  // filteredData: ReportData[] = [];
  // fromDate:string;
  // toDate:string;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  filteredCreditCollection:any[]=[];
  filteredFeecollection:any[]=[];
  loading:boolean;
  checkBillingVazjipad:boolean=false;
  Vmaster:any[]=[];
  constructor(
    private router: Router,
    
     private ts: TranslateService,
    private reportPrintservice:PrintreportService,
    private masterService:MasterService
     
  ) {

    this.lang=localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address'; 
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
  }

  ngOnInit(): void {
    // this.route.queryParams.subscribe((params) => {
    //   const type = params['type'];
    //   this.fromDate = params['fromDate'];
    //   this.toDate = params['toDate'];
    this.getVazhipadmaster();
      this.fetchReportData();
    //   this.fetchCreditcollectionReportData(type,this. fromDate, this.toDate);
    //   this.fetchFeecollectionReportData(type,this. fromDate, this.toDate);
    // });
  }

  // Call your API service to get the report data
  fetchReportData(): void {
    this.loading=true;
    const payload = {
      Type: 'VihidhamRate',
      Code: '',
    };
    this.masterService.getMaster(payload).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
        // this.filteredData = this.data.filter((item) => item.TrnsMode === 'MO');
        this.loading=false;
        
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }


  

  getVazhipadNameById(id:any){
    const match = this.Vmaster.find((v: any) => v.VM_Id === id);
    return match ? match.VM_Name : 'N/A';
  }

  getVazhipadmaster(){
  
    this.masterService.getVmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          console.log(data);
          this.Vmaster = data;
          // console.log(this.Vmaster);
          // this.filteredVmaster = this.Vmaster;
          // this.sortByVMCode();
          // this.loading = false;
        }
      },
      error: (error) => {
        // this.notification.showSuccess('Try after some Time');
      },
    });
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

  // formatDateToDDMMYYYY(date: string): string {
  //   const [year, month, day] = date.split('-');
  //   return `${day}-${month}-${year}`;
  // }




 

generatePDF(){
  this.reportPrintservice.generatePDF()

}
}
