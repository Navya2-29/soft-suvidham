import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportData } from '../../../models/poornam-report';
import { ActivatedRoute, Router } from '@angular/router';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { ReportService } from '../service/report.service';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-endowment',
  standalone: true,
  imports: [
    CommonModule,MatTableModule,MatPaginatorModule,
        SpinnerComponent,
        TranslateModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,MatIconModule
  ],
  templateUrl: './report-endowment.component.html',
  styleUrls: ['./report-endowment.component.css','/src/assets/styles/report.style.css'],
})
export class ReportEndowmentComponent {
 displayedColumns: string[] = ['BillNo','BillDate','Vazhipad', 'Name', 'Star', 'Qty', 'Rate', 'Amount',  'VazhipadDate' ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  filteredData: ReportData[]=[];

  fromDate:string;
  toDate:string;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  loading:boolean;
  searchText: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  constructor(private route: ActivatedRoute,
        private reportPrintservice:PrintreportService,
    
    private ts: TranslateService, private service: ReportService,private router: Router, private http:HttpClient) {
    this.lang=localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
    this.lang = localStorage.getItem('Language');
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
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchText = value;
  
    this.filteredData = this.data.filter(item =>
      (item.BillDate + ' ' + item.BillNo + ' ' + item.VazhiDate + ' ' +
       item.Vazhipad + ' ' + item.Name + ' ' + item.Star + ' ' + item.Qty +' '+ item.MobileNo+''+item.Address1+''
        + item.Rate +item.Address2+'').toLowerCase().includes(this.searchText)
    );
  }



 // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: "EndownmentRpt",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
      this.data = this.data.sort((a: any, b: any) =>
        a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
      );
       this.filteredData=this.data;

      this.loading=false;
        this.dataSource.data = this.data
        this.length = data.length; 
        this.dataSource.paginator = this.paginator;
        
        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

generatePDF(){
  this.reportPrintservice.generatePDF();
}

getGrandTotal(): number {
  return this.filteredData.reduce((sum, item) => sum + item.Qty * item.Rate, 0);
}



  
getTimeForBill(time:any){    
  switch (time.toString()) {
    case '0':
      if (this.lang =='en') {
        return 'Any Time';
      } else {
        return 'എപ്പോൾ വേണമെങ്കിലും';
      }

    case '1':
      if (this.lang == 'en') {
        return 'Morning';
      } else {
        return 'രാവിലെ';
      }
    case '2':
      if (this.lang == 'en') {
        return 'Evening';
      } else {
        return 'വൈകുന്നേരം';
      }
    case '3':
      if (this.lang == 'en') {
        return 'Night';
      } else {
        return 'രാത്രി';
      }
    default:
      return 'OTHERS';
  }
    
}

exportToExcel(): void {
  const workbook = XLSX.utils.book_new();
  const excelData: any[] = [];

  // ==========================================
  // HEADER
  // ==========================================
  excelData.push([this.templeName]);
  excelData.push([this.templeAddress]);
  excelData.push(['ENDOWMENT REPORT']);
  excelData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelData.push([]);

  // ==========================================
  // TABLE HEADER
  // ==========================================
  excelData.push([
    'Bill Date',
    'Bill No',
    'Vazhipad Date',
    'Vazhipad',
    'Name',
    'Star',
    'Quantity',
    'Rate'
  ]);

  // ==========================================
  // TABLE DATA
  // ==========================================
  this.filteredData.forEach((item: any) => {
    excelData.push([
      item.BillDate,
      item.BillNo,
      item.VazhiDate,
      item.Vazhipad ? item.Vazhipad : '',
      item.Name,
      item.Star,
      item.Qty,
      item.Rate
    ]);
  });

  // ==========================================
  // CREATE SHEET
  // ==========================================
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  worksheet['!cols'] = [
    { wch: 15 }, // Bill Date
    { wch: 12 }, // Bill No
    { wch: 15 }, // Vazhipad Date
    { wch: 30 }, // Vazhipad
    { wch: 28 }, // Name
    { wch: 15 }, // Star
    { wch: 12 }, // Qty
    { wch: 15 }  // Rate
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Endowment Report');

  // ==========================================
  // DOWNLOAD FILE
  // ==========================================
  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const file = new Blob(
    [excelBuffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    }
  );

  saveAs(
    file,
    `Endowment_Report_${new Date().getTime()}.xlsx`
  );
}
}
