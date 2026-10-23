import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,

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
import {saveAs} from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-feecollection',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    SpinnerComponent,
    MatIconModule
  ],
  templateUrl: './report-feecollection.component.html',
  styleUrls: [
    './report-feecollection.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportFeecollectionComponent {
  displayedColumns: string[] = [
    'BillNo',
    'BillDate',
    'NM_Name',
    'Name',
    'Star',
    'Qty',
    'ItemValue',
    'weight',
    'Receipt_Amt',
    'TrnMode',
    'Remarks',
  ];
  dataSource = new MatTableDataSource<FeeCollection>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 50, 100, 200, 300, 500, 1000];
  pageIndex = 0;
  data: FeeCollection[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: FeeCollection[] } = {};
  currentDate: string = '';
  currentPage: number = 1;
  fromDate: string;
  toDate: string;
  loading: boolean;
  groupedDatas: { [key: string]: any[] } = {};
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

  genearatePDF() {
    this.reportPrintservice.generatePDF();

  }

  groupDataByName(data: FeeCollection[]): { [key: string]: FeeCollection[] } {
    return data.reduce((acc: any, item: any) => {
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
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: 'FeeCollectRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data.sort((a: any, b: any) =>
        a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
      );
        this.groupedData = this.groupDataByName(this.data);
        this.dataSource.data = this.data;
        this.loading = false;
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

  generatePDF() {
    this.reportPrintservice.generatePDF();
    //
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
      return sum + item.Amount;
    }, 0);

    return total;
  }

exportToExcel(): void {

  const workbook = XLSX.utils.book_new();
  const sheetData: any[][] = [];

  // ===== HEADER =====
  sheetData.push([this.templeName]);
  sheetData.push([this.templeAddress]);
  sheetData.push(['FEE COLLECTION REPORT']);
  sheetData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  sheetData.push([]);

  // ===== LOOP GROUPS =====
  Object.keys(this.groupedData).forEach((key) => {

    const group = this.groupedData[key];

    // Group Title (Payment Type / Name)
    sheetData.push([key]);
    sheetData.push([]);

    // Table Header
    sheetData.push([
      'Bill No',
      'Bill Date',
      'Item',
      'Payment Method',
      'Amount'
    ]);

    // Table Rows
    group.forEach((item: any) => {
      sheetData.push([
        item.BillNo,
        item.BillDate,
        this.lang === 'en' ? item.NM_Name : item.NM_RName,
        this.getTransactionType(item.TrnMode),
        item.Amount
      ]);
    });

    // Group Total
    sheetData.push([
      '',
      '',
      '',
      'TOTAL',
      this.getGrandTotalForTrnsMode(key)
    ]);

    sheetData.push([]); // space between groups
  });

  // ===== GRAND TOTAL =====
  sheetData.push([
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

  Object.keys(worksheet).forEach(cell => {
    if (worksheet[cell]?.v === 'Bill No') {
      const rowIndex = XLSX.utils.decode_cell(cell).r;

      for (let col = 0; col < 5; col++) {
        const addr = XLSX.utils.encode_cell({ r: rowIndex, c: col });
        if (worksheet[addr]) worksheet[addr].s = tableHeaderStyle;
      }
    }
  });

  // ===== ALIGN AMOUNT RIGHT =====
  Object.keys(worksheet).forEach(cell => {
    if (cell.startsWith('E') && cell !== 'E6') {
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
    { wch: 20 },
    { wch: 15 }
  ];

  // ===== ADD SHEET =====
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Collection');

  // ===== EXPORT =====
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(blob, `Fee_Collection_${new Date().getTime()}.xlsx`);
}
}
