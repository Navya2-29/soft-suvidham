import { Component, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {ReportData} from '../../../models/poornam-report'
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-duplicate',
  standalone: true,
  imports: [CommonModule,TranslateModule, MatTableModule,MatIconModule, SpinnerComponent, MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,],
  templateUrl: './report-duplicate.component.html',
  styleUrls: ['./report-duplicate.component.css','/src/assets/styles/report.style.css'],
})
export class ReportDuplicateComponent {

  displayedColumns: string[] = ['BillNo','BillDate','Vazhipad', 'Name', 'Mobile','Qty','Rate','Amount', 'TransMode'  ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  filteredData:ReportData[]=[];
  fromDate:string;
  toDate:string;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  loading:boolean;
  constructor(private route: ActivatedRoute,
    private reportPrintservice:PrintreportService,
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
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'DuplicateCount',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        // this.data=data;
        this.data = data.sort((a: any, b: any) =>
  a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
);

        this.loading=false;
        this.length =this.data .length;

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


generatePDF() {
this.reportPrintservice.generatePDF();
//   const printContent = document.getElementById('print-section');
//   if (!printContent) {
//     console.error('No content found to print');
//     return;
//   }

//   const printWindow = window.open('', '', 'width=800,height=600');

//   if (!printWindow) {
//     console.error('Unable to open print window. Please check pop-up blockers.');
//     return;
//   }

//   printWindow.document.write(`
//     <html>
//       <head>
//         <title>Print</title>
//          <style>

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
//       </head>
//       <body>
//         ${printContent.innerHTML}
//       </body>
//     </html>
//   `);

//   printWindow.document.close();
//   printWindow.focus();

//   printWindow.print();

//   printWindow.close();
}

getTotalAmount(): number {
  return this.data.reduce((sum, item) => sum + item.Amount, 0);
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
exportToExcel(): void {

  const workbook = XLSX.utils.book_new();
  const sheetData: any[][] = [];

  // ===== HEADER =====
  sheetData.push([this.templeName]);
  sheetData.push([this.templeAddress]);
  sheetData.push(['DUPLICATE REPORT']);
  sheetData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  sheetData.push([]);

  // ===== TABLE HEADER =====
  sheetData.push([
    'Bill No',
    'Bill Date',
    'Counter Id',
    'User',
    'Quantity'
  ]);

  // ===== TABLE DATA =====
  this.data.forEach((item: any) => {
    sheetData.push([
      item.BillNo,
      item.BillDate,
      item.CounterId,
      item.Cuser,
      item.ct
    ]);
  });

  // ===== CREATE SHEET =====
  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

  // ===== MERGE HEADER =====
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }
  ];

  // ===== HEADER STYLE =====
  const headerStyle = {
    alignment: { horizontal: 'center', vertical: 'center' },
    font: { bold: true, sz: 14 }
  };

  ['A1', 'A2', 'A3', 'A4'].forEach(cell => {
    if (worksheet[cell]) worksheet[cell].s = headerStyle;
  });

  // ===== TABLE HEADER STYLE =====
  const tableHeaderStyle = {
    font: { bold: true },
    alignment: { horizontal: 'center' }
  };

  const headerRowIndex = 5;

  for (let col = 0; col < 5; col++) {
    const addr = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
    if (worksheet[addr]) worksheet[addr].s = tableHeaderStyle;
  }

  // ===== ALIGN NUMERIC COLUMNS =====
  Object.keys(worksheet).forEach(cell => {
    if (cell.startsWith('C') || cell.startsWith('E')) {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          alignment: { horizontal: 'center' }
        };
      }
    }
  });

  // ===== COLUMN WIDTH =====
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 10 }
  ];

  // ===== ADD SHEET =====
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Duplicate Report');

  // ===== EXPORT =====
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(blob, `Duplicate_Report_${new Date().getTime()}.xlsx`);
}
}
