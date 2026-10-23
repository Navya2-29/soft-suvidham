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
import { ReportDailyStmt } from '../../../models/dailytrasaction.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MembersReport } from '../../../models/members.model';
@Component({
  selector: 'app-report-non-member-pending-credit',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,MatFormFieldModule,TranslateModule, MatInputModule,
  ],
  templateUrl: './report-non-member-pending-credit.component.html',
  styleUrls: ['./report-non-member-pending-credit.component.css','/src/assets/styles/report.style.css'],
})
export class ReportNonMemberPendingCreditComponent {


  displayedColumns: string[] = [
    'BillNo',
    'BillDate',
    "Counter",
    'Vazhipad',
    'Name',
    'Star',
    'Qty',
    'Rate',
    'Amount',
    'VazhiDate',
    'TrnsMode',
  ];
  dataSource = new MatTableDataSource<ReportDailyStmt>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data: MembersReport[] = [];
  fromDate:string;
  toDate:string;

  currentDate: string = '';

  counterId:string | null;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;

  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http:HttpClient,
    private ts: TranslateService,
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
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
       this.fromDate = params['fromDate'];
       this.toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }
  // getTotalAmount(): number {
  //   return this.data.reduce((sum, item) => sum + item.Amount, 0);
  // }
  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    const payLoad = {
      Type: "PendingCreditCollect",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
       
        this.length = data.length;
       
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
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


  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
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

  // getGrandTotal(): number {
  //   return this.data.reduce((sum, item) => sum + item.Amount, 0);
  // }




  generatePDF(){
    const printContent = document.getElementById('print-section');
    if (!printContent) {
      console.error('No content found to print');
      return;
    }
  
    const WindowPrt = window.open('', '', 'width=800,height=600');
    
    // Check if the print window was successfully opened
    if (!WindowPrt) {
      console.error('Unable to open print window. Please check pop-up blockers.');
      return;
    }
  
    WindowPrt.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            /* Add custom styles for printing if needed */
            table {
              width: 100%;
              border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid black;
            }
            th, td {
              padding: 5px;
              text-align: left;
            }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
  
    WindowPrt.document.close();
    WindowPrt.focus();
  
    // Make sure that the window is still valid before calling print and close
    if (WindowPrt) {
      WindowPrt.print();
      WindowPrt.close();
    }

    }
    



}
