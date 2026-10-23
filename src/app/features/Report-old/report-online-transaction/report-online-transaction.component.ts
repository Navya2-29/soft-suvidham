import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
// import { jsPDF } from 'jspdf'; 
import {ReportData} from '../../../models/poornam-report'
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReportOnlineTransactionPopupComponent } from '../report-online-transaction-popup/report-online-transaction-popup.component';
import { MatIconModule } from '@angular/material/icon';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-report-online-transaction',
  standalone: true,
  imports: [
  CommonModule,MatTableModule,SpinnerComponent,MatIconModule, MatDialogModule, TranslateModule,MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,
  ],
  templateUrl: './report-online-transaction.component.html',
  styleUrls: ['./report-online-transaction.component.css','/src/assets/styles/report.style.css']
})
export class ReportOnlineTransactionComponent {
displayedColumns: string[] = ['BillNo','BillDate','Vazhipad','NAME', 'STAR','QTY', 'RATE',  'Amount',   ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  filteredData:ReportData[]=[];
  fromDate:string;
  toDate:string;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
 
  loading:boolean;
  constructor(private route: ActivatedRoute,
        private reportPrintservice:PrintreportService,
       private dialog: MatDialog,
     private ts: TranslateService, private service: ReportService,private router: Router, private http:HttpClient) {

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
      this. fromDate = params['fromDate'];
      this. toDate = params['toDate'];
      this.fetchReportData(type,this.fromDate,this.toDate);
     
    });
  }

 // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'OnlineBooking',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
         this.filteredData =this.data   
         this.loading=false;
     

      
        
        console.log(this.filteredData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }



 







 
  goBack(): void {
    console.log('Going back...'); 
    this.router.navigate(['/getReport']);


    if (window.history.length > 1) {
      window.history.back(); 
    } else {
      window.close(); 
    }


  }

  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  getTotalAmount(): number {
    return this.filteredData.reduce((sum, item) => sum + item.Amount, 0);
  }

 






    
generatePDF(){
  this.reportPrintservice.generatePDF();


}


showViewMorePopUp(OrderId:string,status:string){
 const dialogRef = this.dialog.open(ReportOnlineTransactionPopupComponent, {
    width: '900px',
    data: {
    title: OrderId,
    status:status
  }
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('Dialog closed');
    // handle dialog result if needed
  })
}
getTransStatus(status:string){
  if(status=="S"){
    return "Success"
  }
  else if(status=="F"){
    return "Failed"
  }
  else{
    return "Nil"
  }
}

exportToExcel(): void {
  const workbook = XLSX.utils.book_new();

  // ==========================================
  // Sheet Data Array
  // ==========================================
  const excelData: any[] = [];

  // Header
  excelData.push([this.templeName]);
  excelData.push([this.templeAddress]);
  excelData.push(['ONLINE REPORT']);
  excelData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelData.push([]);

  // ==========================================
  // Table Header
  // ==========================================
  excelData.push([
    'Order Id',
    'Bill Date',
    'Amount',
    'Reference No',
    'Vazhipad Date',
    'Name & Address',
    'Mobile No',
    'Status'
  ]);

  // ==========================================
  // Data Rows
  // ==========================================
  this.filteredData.forEach((item: any) => {
    excelData.push([
      item.OrderId,
      item.BillDate,
      item.Amount,
      item.TrnId ? item.TrnId : '--',
      item.VazhiDate,
      `${item.Address1 || ''}
${item.Address2 || ''}
${item.Address3 || ''}
${item.Address4 || ''}`,
      item.MobileNo,
      this.getTransStatus(item.TrnStatus)
    ]);
  });

  // ==========================================
  // Grand Total
  // ==========================================
  excelData.push([]);
  excelData.push([
    '',
    '',
    'Grand Total',
    this.filteredData.reduce(
      (sum: number, item: any) =>
        sum + Number(item.Amount || 0),
      0
    )
  ]);

  // ==========================================
  // Create Worksheet
  // ==========================================
  const worksheet =
    XLSX.utils.aoa_to_sheet(excelData);

  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
    { wch: 20 },
    { wch: 15 },
    { wch: 40 },
    { wch: 18 },
    { wch: 18 }
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Online Report'
  );

  // ==========================================
  // Save File
  // ==========================================
  const excelBuffer: any = XLSX.write(
    workbook,
    {
      bookType: 'xlsx',
      type: 'array'
    }
  );

  const file = new Blob(
    [excelBuffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    }
  );

  saveAs(
    file,
    `Online_Report_${new Date().getTime()}.xlsx`
  );
}

}
