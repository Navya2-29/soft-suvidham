
import { SpinnerComponent } from './../../../shared/component/spinner/spinner.component';
import { Component, } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReportData } from '../../../models/poornam-report';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../../services/master/master.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-billing-register',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    TranslateModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    SpinnerComponent,
    MatIconModule
  ],
  templateUrl: './report-billing-register.component.html',
  styleUrls: [
    './report-billing-register.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportBillingRegisterComponent {
  data: ReportData[] = [];
  groupedData: ReportData[] = [];
  billRegisterData: ReportData[] = [];
  nakshatham: any[];
  lang: string | null;
  fromDate: string;
  toDate: string;
  templeName: string | null;
  templeAddress: string | null;
  loading: boolean;
  constructor(
    private route: ActivatedRoute,
    private ts: TranslateService,
    private masterService: MasterService,
    private service: ReportService,
    private router: Router,
    private reportPrintservice: PrintreportService,
  ) {
    this.loadStarData();
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
      const type = 'DailyStmtDetaild';
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: 'BillRegister',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);

        data.sort((a: any, b: any) => {
          const [aDay, aMonth, aYear] = a.BillDate.split('.').map(Number);
          const [bDay, bMonth, bYear] = b.BillDate.split('.').map(Number);

          const aDate = new Date(aYear, aMonth - 1, aDay);
          const bDate = new Date(bYear, bMonth - 1, bDay);

          if (aDate < bDate) return -1;
          if (aDate > bDate) return 1;

          const [aMain, aSub] = a.BillNo.split('/').map(Number);
          const [bMain, bSub] = b.BillNo.split('/').map(Number);

          if (aMain !== bMain) return aMain - bMain;
          return aSub - bSub;
        });

        this.data = data;
        this.billRegisterData = this.data;
        this.loading = false;
      },
    });
  }

  getDisplayAmount(item: any): number {
    if (item.Advance && item.Advance > 0) {
      return Number(item.Advance);
    } else {
      return Number(item.TotalAmt) || 0;
    }
  }

  getColumnTotal(mode: string): number {
    return this.billRegisterData
      .filter((item) => item.TrnsMode === mode && item.TrnStatus == 'S')
      .reduce((acc, item) => {
        return acc + item.TotalAmt;
      }, 0);
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

  getGrandTotal(): number {
    return (
      this.billRegisterData
        .filter((item) => !(item.TrnStatus !== 'S' || item.TrnsMode === 'CR'))
        // exclude 'CR' entries
        .reduce((acc, item) => {
          const valueToAdd =
            // item.Advance && item.Advance > 0
            //   ? item.Advance
            item.TotalAmt || 0;
          return acc + valueToAdd;
        }, 0)
    );
  }

  isRedText(item: any): boolean {
    return item.TrnStatus !== 'S';
  }

  generatePDF() {
    this.reportPrintservice.generatePDF();
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

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        if (this.lang == 'en') {
          return 'BANK';
        } else {
          return 'ബാങ്ക്';
        }

      case 'CS':
        if (this.lang == 'en') {
          return 'CASH';
        } else {
          return 'ക്യാഷ്';
        }
      case 'MO':
        if (this.lang == 'en') {
          return 'MONEY ORDER';
        } else {
          return 'മണി ഓർഡർ';
        }
      case 'UP':
        if (this.lang == 'en') {
          return 'UPI';
        } else {
          return 'യുപിഐ';
        }

      case 'CH':
        if (this.lang == 'en') {
          return 'CHEQUE';
        } else {
          return 'ചെക്ക്';
        }
      case 'CR':
        if (this.lang == 'en') {
          return 'CREDIT';
        } else {
          return 'ക്രെഡിറ്റ്';
        }
      case 'DE':
        if (this.lang == 'en') {
          return 'DEBIT';
        } else {
          return 'ഡെബിറ്റ്';
        }
      default:
        return 'OTHERS';
    }
  }

  gettransactionstatus(status: string) {
    switch (status) {
      case 'C':
        if (this.lang == 'en') {
          return 'cancelled';
        } else {
          return 'ക്യാൻസെൽഡ്';
        }

      case 'S':
        if (this.lang == 'en') {
          return 'Success';
        } else {
          return 'സക്‌സസ്';
        }

      default:
        return 'OTHERS';
    }
  }

 reportinexcelformat(): void {

  const workbook = XLSX.utils.book_new();
  const sheetData: any[][] = [];

  // ===== HEADER =====
  sheetData.push([this.templeName]);
  sheetData.push([this.templeAddress]);
  sheetData.push(['BILL REGISTER']);
  sheetData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  sheetData.push([]);

  // ===== TABLE HEADER =====
  sheetData.push([
    'Sl No',
    'Bill Date',
    'Bill No',
    'Cash',
    'UPI',
    'Cheque',
    'M.Order',
    'Debit',
    'Bank',
    'Online',
    'Due',
    'Total'
  ]);

  // ===== DATA ROWS =====
  this.billRegisterData.forEach((item: any, index: number) => {

    const isRed = item.TrnsMode === 'CR' || item.TrnStatus !== 'S';

    sheetData.push([
      index + 1,
      item.BillDate,
      item.BillNo,

      item.TrnsMode === 'CS' ? item.TotalAmt : 0,
      item.TrnsMode === 'UP' ? item.TotalAmt : 0,
      item.TrnsMode === 'CH' ? item.TotalAmt : 0,
      item.TrnsMode === 'MO' ? item.TotalAmt : 0,
      item.TrnsMode === 'DE' ? item.TotalAmt : 0,
      item.TrnsMode === 'ON' ? item.TotalAmt : 0,
      item.TrnsMode === 'OL' ? item.TotalAmt : 0,
      item.TrnsMode === 'CR' ? item.TotalAmt : 0,

      // TOTAL column
      isRed ? -item.TotalAmt : item.TotalAmt
    ]);
  });

  // ===== GRAND TOTAL ROW =====
  sheetData.push([
    '',
    '',
    'Grand Total',

    this.getColumnTotal('CS'),
    this.getColumnTotal('UP'),
    this.getColumnTotal('CH'),
    this.getColumnTotal('MO'),
    this.getColumnTotal('DE'),
    this.getColumnTotal('ON'),
    this.getColumnTotal('OL'),
    -this.getColumnTotal('CR'),
    this.getGrandTotal()
  ]);

  // ===== CREATE SHEET =====
  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

  // ===== MERGE HEADER =====
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 11 } }
  ];

  // ===== HEADER STYLE =====
  const headerStyle = {
    alignment: { horizontal: 'center' },
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

  for (let col = 0; col < 12; col++) {
    const addr = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
    if (worksheet[addr]) worksheet[addr].s = tableHeaderStyle;
  }

  // ===== ALIGN NUMBERS RIGHT =====
  Object.keys(worksheet).forEach(cell => {
    if (/[D-L]/.test(cell)) {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          alignment: { horizontal: 'right' }
        };
      }
    }
  });

  // ===== COLUMN WIDTH =====
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 }
  ];

  // ===== ADD SHEET =====
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bill Register');

  // ===== EXPORT =====
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(blob, `Bill_Register_${new Date().getTime()}.xlsx`);
}
}
