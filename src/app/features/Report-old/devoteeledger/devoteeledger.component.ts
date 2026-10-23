import { SpinnerComponent } from './../../../shared/component/spinner/spinner.component';
import { Component } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReportData } from '../../../models/poornam-report';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../../services/master/master.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import * as XLSX from 'xlsx';
import {saveAs}  from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-devoteeledger',
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
  templateUrl: './devoteeledger.component.html',
  styleUrls: [
    './devoteeledger.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class DevoteeledgerComponent {
  data: ReportData[] = [];

  bdata: any[] = [];
  fromDate: string;
  toDate: string;
  loading: boolean;
  previousBalances: { [mid: string]: number } = {};
  groupedData: { [mid: string]: ReportData[] } = {};

  currentDate: string = '';
  currentPage: number = 1;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;

  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private ts: TranslateService,
    private reportPrintservice: PrintreportService,
    private master: MasterService
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

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = 'DevoteeLedgerRpt';
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: type,
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
        this.bdata = data;
        this.loading = false;
        this.groupData();
        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  // code for showing in html
  groupData() {
    const grouped: { [mid: string]: ReportData[] } = {};

    this.data.forEach((item) => {
      if (!grouped[item.MID]) {
        grouped[item.MID] = [];
        this.fetchOpeningBalance(item.MID.toString());
      }
      grouped[item.MID].push(item);
    });

    this.groupedData = grouped;
  }

  generatePDF() {
    this.reportPrintservice.generatePDF();
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
      case 'EN':
        if (this.lang == 'en') {
          return 'ENDOWMENT';
        } else {
          return 'എൻഡോമെന്റ്';
        }
      default:
        return 'OTHERS';
    }
  }

  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }
  getTotalForBill(billNo: string): number {
    return this.data
      .filter((item) => item.BillNo === billNo)
      .reduce((sum, item) => sum + item.Amount, 0);
  }
  getName(mid: string): string {
    const entry = this.data.find((item) => item.MID.toString() === mid);
    return entry ? entry.Name1 : '';
  }
  getMobileNumber(mid: string): string {
    const entry = this.data.find((item) => item.MID.toString() === mid);
    return entry ? entry.Mobile || '' : '';
  }
  fetchOpeningBalance(mid: string) {
    const creditPayload = {
      Type: 'DevoteeCredit',
      FromDate: this.fromDate,
      ToDate: this.fromDate,
      PMId: mid.toString(),
      VazhId: mid.toString(),
    };

    const debitPayload = {
      Type: 'DevoteeDebit',
      FromDate: this.fromDate,
      ToDate: this.fromDate,
      PMId: mid.toString(),
      VazhId: mid.toString(),
    };

    let credit = 0;
    let debit = 0;

    this.master.getVazhipadWiseReport(creditPayload).subscribe((c) => {
      credit = c[0]?.Credit || 0;

      this.master.getVazhipadWiseReport(debitPayload).subscribe((d) => {
        debit = d[0]?.Debit || 0;

        this.previousBalances[mid] =  credit - debit;
        // console.log(this.previousBalances[mid], 'balance');
      });
    });
  }

  getwholeNumber(value:number){
return Math.abs(value)
  }
  getStatementRows(mid: string): any[] {
    let balance = this.previousBalances[mid] || 0;

    return (this.groupedData[mid] || []).map((item, index, arr) => {
      const isBillStart = index === 0 || item.BillNo !== arr[index - 1].BillNo;

      if (isBillStart) {
        const billTotal = this.getTotalForBill(item.BillNo);

        if (item.Vazhipad) {
          balance -= billTotal;
        } else {
          balance += billTotal;
        }
      }

      return {
        ...item,
        isBillStart,
        runningBalance: balance,
      };
    });
  }
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value.trim();

    if (!searchValue || searchValue == '') {
      this.data = this.bdata;
      this.groupData();
      return;
    }

    const filtered = this.bdata.filter(
      (item) =>
        item.Mobile?.includes(searchValue) ||
        item.Name1?.includes(searchValue) ||
        item.MID?.toString().includes(searchValue)
    );

    this.data = filtered;
    this.groupData();
  }
exportToExcel(): void {
  const workbook = XLSX.utils.book_new();
  const sheetData: any[][] = [];

  // ===== HEADER =====
  sheetData.push([this.templeName]);
  sheetData.push([this.templeAddress]);
  sheetData.push(['DEVOTEE LEDGER']);
  sheetData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  sheetData.push([]);

  // ===== LOOP DEVOTEES =====
  Object.keys(this.groupedData).forEach((mid) => {

    const rows = this.getStatementRows(mid);
    if (!rows || rows.length === 0) return;

    // Devotee Info
    sheetData.push([`${this.getName(mid)} (ID: ${mid})`]);
    sheetData.push([this.getMobileNumber(mid)]);
    sheetData.push([]);

    // ===== OPENING BALANCE =====
    const opening = this.previousBalances[mid] || 0;

    sheetData.push([
      'Opening Balance',
      '',
      '',
      '',
      '',
      '',
      opening < 0 ? 'Due Amount' : 'Amount at Temple',
      Math.abs(opening)
    ]);

    // ===== TABLE HEADER =====
    sheetData.push([
      'Bill No',
      'Bill Date',
      'Vazhipad',
      'Qty',
      'Rate',
      'Amount',
      'Total',
      'Balance'
    ]);

    // ===== TRANSACTIONS =====
    rows.forEach((row: any) => {
      sheetData.push([
        row.isBillStart ? row.BillNo : '',
        this.formatDateToDDMMYYYY(row.Billdate),
        row.Vazhipad ? row.Vazhipad : 'Devotee Collection',
        row.Qty === 0 ? '--' : row.Qty,
        row.Rate === 0 ? '--' : row.Rate,
        row.Amount === 0 ? '--' : row.Amount,
        row.isBillStart
          ? `${row.Vazhipad ? '-' : '+'}${this.getTotalForBill(row.BillNo)} (${row.Vazhipad ? 'Dr' : 'Cr'})`
          : '',
        row.isBillStart ? Math.abs(row.runningBalance) : ''
      ]);
    });

    // ===== CLOSING BALANCE =====
    const lastRow = rows[rows.length - 1];
    const closing = lastRow?.runningBalance || 0;

    sheetData.push([
      'Closing Balance',
      '',
      '',
      '',
      '',
      '',
      closing > 0 ? 'Amount at Temple' : 'Due Amount',
      Math.abs(closing)
    ]);

    sheetData.push([]);
    sheetData.push([]);
  });

  // ===== CREATE WORKSHEET =====
  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

  // ===== MERGE HEADER =====
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }
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

  // Apply style dynamically
  Object.keys(worksheet).forEach((cell) => {
    if (cell.startsWith('A') && worksheet[cell].v === 'Bill No') {
      const rowIndex = XLSX.utils.decode_cell(cell).r;

      for (let col = 0; col < 8; col++) {
        const addr = XLSX.utils.encode_cell({ r: rowIndex, c: col });
        if (worksheet[addr]) {
          worksheet[addr].s = tableHeaderStyle;
        }
      }
    }
  });

  // ===== COLUMN WIDTH =====
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 }
  ];

  // ===== ADD SHEET =====
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Devotee Ledger');

  // ===== EXPORT =====
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(blob, `Devotee_Ledger_${new Date().getTime()}.xlsx`);
}
}
