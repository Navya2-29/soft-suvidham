import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeeCollection } from '../../../models/feecollection.model';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-mattinangal',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,MatFormFieldModule, MatInputModule,TranslateModule,SpinnerComponent,MatIconModule
  ],
  templateUrl: './report-mattinangal.component.html',
  styleUrls: ['./report-mattinangal.component.css','/src/assets/styles/report.style.css'],
})
export class ReportMattinangalComponent {


  displayedColumns: string[] = ['BillNo','BillDate','NM_Name', 'Name', 'Star', 'Qty', 'ItemValue','weight', 'Receipt_Amt',  'TrnMode','Remarks' ];
  dataSource = new MatTableDataSource<FeeCollection>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data: FeeCollection[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: FeeCollection[] } = {};
  currentDate: string = '';
  currentPage: number = 1;
  fromDate:string;
  toDate:string;
  loading:boolean
  groupedDatas: { [key: string]: any[] } = {};
lang:string|null;
templeName:string|null;
templeAddress:string|null;
  isPrinting: boolean = false;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  columns: { [key: string]: boolean } = {
    billNo: true,
    billDate: true,
    vazhipad: true,
    remarks: true,
    name: true,
    star: true,
    qty: true,
    rate: true,
    amount: true,
  };

  columnList = [
    { key: 'billNo', label: 'Bill No' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'vazhipad', label: 'Vazhipad' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'name', label: 'Name' },
    { key: 'star', label: 'Star' },
    { key: 'qty', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
  ];

  get visibleColumnCount(): number {
    return Object.values(this.columns).filter(v => v).length;
  }

  get totalColumnCount(): number {
    return this.columnList.length;
  }
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http:HttpClient,
    private ts: TranslateService,
    private reportPrintservice:PrintreportService,

  ) {
this.lang=localStorage.getItem('Language');
this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');

  }





  groupDataByName(data: FeeCollection[]): { [key: string]: FeeCollection[] } {
    return data.reduce((acc:any, item:any) => {
      if (!acc[item.Name]) {
        acc[item.Name] = [];
      }
      acc[item.Name].push(item);
      return acc;
    }, {} as { [key: string]: FeeCollection[] });
  }




  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      this. fromDate = params['fromDate'];
      this. toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: "MattinamRpt",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);

data.sort((a:any, b:any) => {
  // Parse BillDate (format: dd.mm.yyyy)
  const [aDay, aMonth, aYear] = a.BillDate.split('.').map(Number);
  const [bDay, bMonth, bYear] = b.BillDate.split('.').map(Number);

  const aDate = new Date(aYear, aMonth - 1, aDay);
  const bDate = new Date(bYear, bMonth - 1, bDay);

  // Compare dates first
  if (aDate < bDate) return -1;
  if (aDate > bDate) return 1;

  // If dates are equal, compare BillNo
  const [aMain, aSub] = a.BillNo.split('/').map(Number);
  const [bMain, bSub] = b.BillNo.split('/').map(Number);

  if (aMain !== bMain) return aMain - bMain;
  return aSub - bSub;
});

        this.data = data;






        // this.groupDataByTransactionMode(this.data); // Group the data
        this.groupedData = this.groupDataByName(this.data);
        this.dataSource.data = this.data;
        this.currentPage = 1;
        this.loading=false;

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

  generatePDF(){
    this.isPrinting = true;
    this.reportPrintservice.generatePDF();
    setTimeout(() => {
      this.isPrinting = false;
    }, 1000);
//     const printContent = document.getElementById('print-section');
//     if (!printContent) {
//       console.error('No content found to print');
//       return;
//     }

//     const WindowPrt = window.open('', '', 'width=800,height=600');

//     // Check if the print window was successfully opened
//     if (!WindowPrt) {
//       console.error('Unable to open print window. Please check pop-up blockers.');
//       return;
//     }

//     WindowPrt.document.write(`
//       <html>
//         <head>
//           <title>Print</title>
//           <style>

//           body {
//     font-size: 16px;
//     font-family: "Times New Roman", serif;
//   }
//           h3,p,h4,h2{
//           line-height:1;
//           margin-top:0;
//           text-align:center;
//           }
//           .templename{
//            line-height:1;
//           margin-top:0;
//           text-align:center;
//           }
//           hr{
//           height:2px;
//           }
//           .number,.total{
//             text-align:right;
//             }
//           .tabble-heading h3{
//   font-family: 'Times New Roman', Times, serif;
//   font-weight: bold;
//   font-size: 16px;
//   margin: 8px 0 0 0;
// }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//           }
//           table, th, td {
//             border: 1px solid black;
//             text-transform: uppercase;

//           }
//             .total,number{
//             text-align:right;
//             }
//           th, td {
//            padding-left:5px;
//             text-align: left;
//           }
//             #print-section{
// padding-bottom: 100px;
//   }


//     .page-break {
//       page-break-before: always;
//     }
//           </style>
//         </head>
//         <body>${printContent.innerHTML}</body>
//       </html>
//     `);

//     WindowPrt.document.close();
//     WindowPrt.focus();

//     // Make sure that the window is still valid before calling print and close
//     if (WindowPrt) {
//       WindowPrt.print();
//       WindowPrt.close();
//     }
}


getTotalAmount(): number {
  return this.data.reduce((sum, item) => sum + item.Amount, 0);
}









  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        return 'ONLINE';
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



 // Calculate the grand total for each transaction mode
 getGrandTotalForTrnsMode(item: string): any {
  const items = this.groupedData[item]; // Get items for the transaction mode
  if (!items || items.length === 0) {
    return 0; // No items found, return 0
  }
// Calculate the total
const total = items.reduce((sum, item) => {
 // Default to 0 if Rate is missing
  return sum +item. Amount;
}, 0);

return total;

}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.common-column-picker')) {
      this.showColumnDropdown = false;
    }
  }

  toggleColumnDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showColumnDropdown = !this.showColumnDropdown;
  }

  toggleColumn(key: string): void {
    this.columns[key] = !this.columns[key];
  }

  get paginatedData(): FeeCollection[] {
    if (this.isPrinting) {
      return this.data;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    return this.data.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    if (!this.data || this.data.length === 0) return 1;
    return Math.ceil(this.data.length / this.pageSize) || 1;
  }

  get pages(): number[] {
    const pages: number[] = [];
    const delta = 2;
    const start = Math.max(1, this.currentPage - delta);
    const end = Math.min(this.totalPages, this.currentPage + delta);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize) || 10;
    this.currentPage = 1;
  }

  get rangeStart(): number {
    if (!this.data || this.data.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    if (!this.data || this.data.length === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, this.data.length);
  }

  getPaginatedTotal(): number {
    const items = this.isPrinting ? this.data : this.paginatedData;
    return items.reduce((sum, item) => sum + (Number(item?.Amount) || 0), 0);
  }

  getLeadingColspan(): number {
    const leadingKeys = ['billNo', 'billDate', 'vazhipad', 'remarks', 'name', 'star', 'qty', 'rate'];
    const count = leadingKeys.filter(k => this.columns[k]).length;
    return count > 0 ? count : 1;
  }

  hasAnyData(): boolean {
    return !!(this.data && this.data.length > 0);
  }

exportToExcel(): void {
  const workbook = XLSX.utils.book_new();
  const excelData: any[] = [];

  // ==========================================
  // HEADER
  // ==========================================
  excelData.push([this.templeName]);
  excelData.push([this.templeAddress]);
  excelData.push(['MATTINAM REPORT']);
  excelData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelData.push([]);

  // ==========================================
  // TABLE HEADER
  // ==========================================
  excelData.push([
    'Bill No',
    'Bill Date',
    'Vazhipad',
    'Remarks',
    'Name',
    'Address',
    'Star',
    'Qty',
    'Rate',
    'Amount',
    'Mobile No',
    'Pin Code',
    'Email'
  ]);

  // ==========================================
  // DATA ROWS
  // ==========================================
  this.data.forEach((item: any) => {
    excelData.push([
      item.BillNo,
      item.BillDate,
      item.Vazhipad,
      item.Remarks,
      item.Name,
      `${item.Address1 || ''} ${item.Address2 || ''}`.trim(),
      item.Star || 'N/A',
      item.Qty,
      item.Rate,
      item.Amount,
      item.MobileNo || '',
      item.PinCode || '',
      item.EmailId || ''
    ]);
  });

  // ==========================================
  // TOTAL ROW
  // ==========================================
  excelData.push([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Total',
    this.getTotalAmount(),
    '',
    '',
    ''
  ]);

  // ==========================================
  // CREATE SHEET
  // ==========================================
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  worksheet['!cols'] = [
    { wch: 12 }, // Bill No
    { wch: 15 }, // Bill Date
    { wch: 28 }, // Vazhipad
    { wch: 25 }, // Remarks
    { wch: 25 }, // Name
    { wch: 35 }, // Address
    { wch: 15 }, // Star
    { wch: 10 }, // Qty
    { wch: 12 }, // Rate
    { wch: 15 }, // Amount
    { wch: 18 }, // Mobile
    { wch: 12 }, // PinCode
    { wch: 30 }  // Email
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mattinam Report');

  // ==========================================
  // SAVE FILE
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
    `Mattinam_Report_${new Date().getTime()}.xlsx`
  );
}




}
