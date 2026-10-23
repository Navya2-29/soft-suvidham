import { Component} from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginatorModule,
} from '@angular/material/paginator';
import { ReportData } from '../../../models/poornam-report';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { ReportDailyStmt } from '../../../models/dailytrasaction.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MembersReport } from '../../../models/members.model';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';

import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-devotee-creditcollectio-report',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    TranslateModule,
    MatInputModule,
    SpinnerComponent,
    MatIconModule
  ],
  templateUrl: './devotee-creditcollectio-report.component.html',
  styleUrls: [
    './devotee-creditcollectio-report.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class DevoteeCreditcollectioReportComponent {
  displayedColumns: string[] = [
    'BillNo',
    'BillDate',
    'Counter',
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
  pageSizeOptions: number[] = [10, 50, 100, 200, 300, 500, 1000];
  pageIndex = 0;
  data: MembersReport[] = [];
  fromDate: string;
  toDate: string;
  loading: boolean;
  currentDate: string = '';
  allCreditdata: ReportData[] = [];
  counterId: string | null;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;

  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http: HttpClient,
    private ts: TranslateService,
    private reportPrintservice: PrintreportService
  ) {
    this.counterId = localStorage.getItem('Counter');
    this.lang = localStorage.getItem('Language');
    this.templeName =
      localStorage.getItem('TempleName') || 'Default Temple Name';
    this.templeAddress =
      localStorage.getItem('Address') || 'Default Temple Address';
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
      // this.fetchAllCreditReportData(this.fromDate, this.toDate);

      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: 'DevotteCreditCollect',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);

        this.data = data.sort((a: any, b: any) =>
          a.BillNo.localeCompare(b.BillNo, undefined, {
            numeric: true,
            sensitivity: 'base',
          })
        );

        this.loading = false;
        this.length = data.length;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }



  fetchmembercreitReportData(
    type: string,
    fromDate: string,
    toDate: string
  ): void {
    this.loading = true;
    const payLoad = {
      Type: 'DevottePendingCreditCollect',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        data = data.sort((a: any, b: any) =>
          b.BillNo.localeCompare(a.BillNo, undefined, {
            numeric: true,
            sensitivity: 'base',
          })
        );

        this.loading = false;
        this.length = data.length;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  getTotalAmount(): number {
    return this.allCreditdata.reduce((sum, item) => sum + item.Amount, 0);
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

  getTransactionType(transmode: any): string {
    switch (transmode) {
      case 'ON':
        return 'BANK';
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

  getGrandTotal(): number {
    return this.data.reduce((sum, item) => sum + Number(item.Amount), 0);
  }

  generatePDF() {
    this.reportPrintservice.generatePDF();

  }
exportToExcel(): void {

  const workbook = XLSX.utils.book_new();
  const sheetData: any[][] = [];

  // ===== HEADER =====
  sheetData.push([this.templeName]);
  sheetData.push([this.templeAddress]);
  sheetData.push(['CREDIT COLLECTION']);
  sheetData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  sheetData.push([]);

  // ===== TABLE HEADER =====
  sheetData.push([
    'Bill No',
    'Bill Date',
    'Vazhipad',
    'Name',
    'Mobile No',
    'Amount'
  ]);

  // ===== TABLE DATA =====
  this.data.forEach((item: any) => {
    sheetData.push([
      item.BillNo,
      item.BillDate,
      item.Vazhipad,
      item.Name,
      item.MobileNo,
      item.Amount
    ]);
  });

  // ===== GRAND TOTAL =====
  sheetData.push([]);
  sheetData.push([
    '',
    '',
    '',
    '',
    'Grand Total',
    this.getTotalAmount()
  ]);

  // ===== CREATE SHEET =====
  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

  // ===== MERGE HEADER =====
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } }
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

  for (let col = 0; col < 6; col++) {
    const addr = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
    if (worksheet[addr]) worksheet[addr].s = tableHeaderStyle;
  }

  // ===== AMOUNT ALIGN RIGHT =====
  Object.keys(worksheet).forEach(cell => {
    if (cell.startsWith('F') && cell !== 'F6') {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          alignment: { horizontal: 'right' }
        };
      }
    }
  });

  // ===== COLUMN WIDTH =====
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 25 },
    { wch: 18 },
    { wch: 15 }
  ];

  // ===== ADD SHEET =====
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Credit Collection');

  // ===== EXPORT =====
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(blob, `Credit_Collection_${new Date().getTime()}.xlsx`);
}
}
