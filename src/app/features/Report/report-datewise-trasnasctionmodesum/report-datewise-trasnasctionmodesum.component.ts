import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

import { TranslateModule } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { ReportDailyStmt } from '../../../models/dailytrasaction.model';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
export interface Bill {
  BillDate: string;
  CounterId: number;
  Staff: string;
  TrnsMode: string;
  TotalAmt: number;
  TrnStatus: string;
}
@Component({
  selector: 'app-report-datewise-trasnasctionmodesum',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    SpinnerComponent,
    TranslateModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './report-datewise-trasnasctionmodesum.component.html',
  styleUrls: [
    './report-datewise-trasnasctionmodesum.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportDatewiseTrasnasctionmodesumComponent {
  dataSource = new MatTableDataSource<ReportDailyStmt>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 50, 100, 200, 300, 500, 1000];
  pageIndex = 0;
  data: ReportDailyStmt[] = [];
  onlinedata: ReportDailyStmt[] = [];
  Alldata: ReportDailyStmt[] = [];
  fromDate: string;
  toDate: string;
  groupedDatas: {
    [key: string]: {
      [key: string]: { Qty: number; Rate: number; Amount: number };
    };
  } = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  //  groupedData: { [BillDate: string]: { [Counter: string]: ReportData[] }  } = {};
  currentDate: string = '';
  currentPage: number = 1;
  counterId: string | null;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  loading: boolean;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  columns: { [key: string]: boolean } = {
    user: true,
    cash: true,
    upi: true,
    cheque: true,
    mo: true,
    bank: true,
    debit: true,
    due: true,
    total: true,
  };

  columnList = [
    { key: 'user', label: 'User' },
    { key: 'cash', label: 'Cash' },
    { key: 'upi', label: 'UPI' },
    { key: 'cheque', label: 'Cheque' },
    { key: 'mo', label: 'MO' },
    { key: 'bank', label: 'Bank' },
    { key: 'debit', label: 'Debit' },
    { key: 'due', label: 'Due' },
    { key: 'total', label: 'Total' },
  ];

  vazhipadColumns: { [tableKey: string]: { [colKey: string]: boolean } } = {};
  openVazhipadDropdownKey: string | null = null;
  isPrinting: boolean = false;
  paginationState: { [tableKey: string]: { currentPage: number; pageSize: number } } = {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent | Event): void {
    const target = event.target as HTMLElement;
    if (this.showColumnDropdown && !target.closest('.common-column-picker')) {
      this.showColumnDropdown = false;
    }
  }

  get visibleColumnCount(): number {
    return Object.values(this.columns).filter(Boolean).length;
  }

  get totalColumnCount(): number {
    return this.columnList.length;
  }

  toggleColumnDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.showColumnDropdown = !this.showColumnDropdown;
  }

  toggleColumn(key: string): void {
    this.columns[key] = !this.columns[key];
    const updatedVal = this.columns[key];
    Object.keys(this.vazhipadColumns).forEach((tKey) => {
      if (this.vazhipadColumns[tKey]) {
        this.vazhipadColumns[tKey][key] = updatedVal;
      }
    });
  }

  getTableKey(dateKey: any, counterKey: any): string {
    return `${dateKey}__${counterKey}`;
  }

  getColumnsForTable(tableKey: string): { [key: string]: boolean } {
    if (!this.vazhipadColumns[tableKey]) {
      this.vazhipadColumns[tableKey] = { ...this.columns };
    }
    return this.vazhipadColumns[tableKey];
  }

  isColumnVisible(tableKeyOrCol: string, maybeCol?: string): boolean {
    if (maybeCol) {
      const cols = this.getColumnsForTable(tableKeyOrCol);
      return cols[maybeCol] ?? false;
    }
    return this.columns[tableKeyOrCol] ?? false;
  }

  getPagination(tableKey: string): { currentPage: number; pageSize: number } {
    if (!this.paginationState[tableKey]) {
      this.paginationState[tableKey] = { currentPage: 1, pageSize: 10 };
    }
    return this.paginationState[tableKey];
  }

  getCurrentPage(tableKey: string): number {
    return this.getPagination(tableKey).currentPage;
  }

  getPageSize(tableKey: string): number {
    return this.getPagination(tableKey).pageSize;
  }

  getUserList(counterValue: any): { key: string; value: any }[] {
    if (!counterValue) return [];
    return Object.keys(counterValue).map((k) => ({ key: k, value: counterValue[k] }));
  }

  getPaginatedUserList(tableKey: string, counterValue: any): { key: string; value: any }[] {
    const list = this.getUserList(counterValue);
    return this.getPaginatedEntries(tableKey, list);
  }

  getPaginatedEntries(tableKey: string, entries: any[]): any[] {
    if (this.isPrinting) return entries || [];
    if (!entries || entries.length === 0) return [];
    const p = this.getPagination(tableKey);
    const start = (p.currentPage - 1) * p.pageSize;
    return entries.slice(start, start + p.pageSize);
  }

  getTotalPages(tableKey: string, entries: any[] | number): number {
    const total = typeof entries === 'number' ? entries : (entries ? entries.length : 0);
    if (total === 0) return 1;
    const p = this.getPagination(tableKey);
    return Math.ceil(total / p.pageSize) || 1;
  }

  getPages(tableKey: string, entries: any[] | number): number[] {
    const total = this.getTotalPages(tableKey, entries);
    const current = this.getCurrentPage(tableKey);
    const range: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  goToPage(tableKey: string, page: number): void {
    this.getPagination(tableKey).currentPage = page;
  }

  nextPage(tableKey: string, entries: any[] | number): void {
    const p = this.getPagination(tableKey);
    if (p.currentPage < this.getTotalPages(tableKey, entries)) {
      p.currentPage++;
    }
  }

  prevPage(tableKey: string): void {
    const p = this.getPagination(tableKey);
    if (p.currentPage > 1) {
      p.currentPage--;
    }
  }

  onPageSizeChange(tableKey: string, size: any): void {
    const p = this.getPagination(tableKey);
    p.pageSize = Number(size) || 10;
    p.currentPage = 1;
  }

  getRangeStart(tableKey: string, entries: any[] | number): number {
    const total = typeof entries === 'number' ? entries : (entries ? entries.length : 0);
    if (total === 0) return 0;
    const p = this.getPagination(tableKey);
    return (p.currentPage - 1) * p.pageSize + 1;
  }

  getRangeEnd(tableKey: string, entries: any[] | number): number {
    const total = typeof entries === 'number' ? entries : (entries ? entries.length : 0);
    if (total === 0) return 0;
    const p = this.getPagination(tableKey);
    return Math.min(p.currentPage * p.pageSize, total);
  }

  trackByItem(index: number, item: any): any {
    return item ? (item.key || item.Staff || index) : index;
  }

  getCounterUserCount(counterValue: any): number {
    return counterValue ? Object.keys(counterValue).length : 0;
  }

  getRowCount(items: any[] | any): number {
    if (!items) return 0;
    if (Array.isArray(items)) return items.length;
    return Object.keys(items).length;
  }
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
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }
  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }
  // Call your API service to get the report data
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
        this.Alldata = data;
        this.data = data.filter((item: any) => item.TrnStatus=="S");
        this.onlinedata = data.filter((item: any) => item.TrnsMode == "OL");
        this.groupData(); // Group the data
        this.loading = false;
        console.log(this.onlinedata,"online");
        console.log(this.groupedData, 'grouping');
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  // Grouping function
  groupedData: {
    [BillDate: string]: {
      [CounterId: string]: {
        [Staff: string]: {
          [TrnsMode: string]: ReportDailyStmt[];
        };
      };
    };
  };

  groupData() {
    this.groupedData = this.data.reduce((acc: any, item: any) => {
      const dateKey = item.BillDate;
      const counterKey = item.CounterId.toString();
      const userKey = item.Staff;
      const modeKey = item.TrnsMode;

      if (!acc[dateKey]) acc[dateKey] = {};
      if (!acc[dateKey][counterKey]) acc[dateKey][counterKey] = {};
      if (!acc[dateKey][counterKey][userKey])
        acc[dateKey][counterKey][userKey] = {};
      if (!acc[dateKey][counterKey][userKey][modeKey])
        acc[dateKey][counterKey][userKey][modeKey] = [];

      acc[dateKey][counterKey][userKey][modeKey].push({ ...item });
      return acc;
    }, {});
  }
  getUserModeTotal(userData: any, mode: string): number {
    // console.log(userData,mode);
    if (!userData[mode]) return 0;
    return userData[mode].reduce(
      (sum: number, item: any) => sum + (item.TotalAmt || 0),
      0
    );
  }

  getTotalForUser(date: any, counter: string, user: string): number {
    const userData = this.groupedData[date][counter][user];
    return Object.keys(userData).reduce((sum, mode) => {
      return sum + this.getUserModeTotal(userData, mode);
    }, 0);
  }

  getCounterModeTotal(counterData: any, mode: string): number {
    return Object.values(counterData).reduce((sum: number, userData: any) => {
      return sum + this.getUserModeTotal(userData, mode);
    }, 0);
  }

  // getTotalForCounter(){

  // }
  getTotalForCounter(date: string, counter: string): number {
    const counterData = this.groupedData[date][counter];
    return Object.keys(counterData).reduce((total, userKey) => {
      const userData = counterData[userKey];
      const userTotal = Object.keys(userData).reduce((sum, mode) => {
        return sum + this.getUserModeTotal(userData, mode);
      }, 0);
      return total + userTotal;
    }, 0);
  }

  getOnlineDataTotal(date: string): number {
    return this.onlinedata
      .filter(
        (item) =>
          item.BillDate === date &&
          item.TrnsMode !== 'CR' &&
          item.TrnStatus == 'S'
      )
      .reduce((sum, item) => sum + (item.TotalAmt || 0), 0);
  }

  getDateTotal(date: string): number {
    let total = 0;

    // 1. Sum from groupedData (non-online)
    const counters = this.groupedData[date];
    if (counters) {
      Object.values(counters).forEach((counter) => {
        Object.values(counter).forEach((user) => {
          Object.entries(user).forEach(([mode, items]) => {
            if (mode !== 'CR') {
              total += items.reduce((sum, item: any) => {
                return item.TrnStatus === 'S'
                  ? sum + (item.TotalAmt || 0)
                  : sum;
              }, 0);
            }
          });
        });
      });
    }

    // 2. Sum from onlineData (CounterId === 0 and matching date)
    const onlineSum = this.onlinedata
      .filter(
        (item) =>
          item.BillDate === date &&
          item.TrnsMode !== 'CR' &&
          item.TrnStatus === 'S'
      )
      .reduce((sum, item) => sum + (item.TotalAmt || 0), 0);

    return total + onlineSum;
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

  formatDateToDDMMYYYY(date: string): string {
    if (!date) return '';
    try {
      const cleanDate = String(date).split('T')[0];
      const parts = cleanDate.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}-${month}-${year}`;
      }
      return String(date);
    } catch (e) {
      return String(date || '');
    }
  }

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        if (this.lang == 'en') {
          return 'BANK';
        } else {
          return 'ഓൺലൈൻ';
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

  getGrandTotal(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }

  generatePDF(): void {
    this.isPrinting = true;
    setTimeout(() => {
      this.reportPrintservice.generatePDF();
      setTimeout(() => {
        this.isPrinting = false;
      }, 1000);
    }, 150);
  }
  getGrandTotalByMode(mode: string): number {
    return this.Alldata.filter(
      (item) => item.TrnsMode === mode && item.TrnStatus === 'S'
    ).reduce((sum, item) => sum + (item.TotalAmt || 0), 0);
  }
  getGrandTotalOfAllModes(): number {
    return this.Alldata.filter((item) => item.TrnStatus === 'S').reduce(
      (sum, item) => sum + (item.TotalAmt || 0),
      0
    );
  }

hasOnlineDataForDate(date: string): boolean {
  return this.onlinedata.some(
    (item) =>
      item.BillDate === date &&
      item.TrnsMode !== 'CR' &&
      item.TrnStatus === 'S'
  );
}

exportToExcel(): void {

  const workbook = XLSX.utils.book_new();
  const sheetData: any[][] = [];

  /* ---------------- HEADER ---------------- */

  sheetData.push([this.templeName]);
  sheetData.push([this.templeAddress]);
  sheetData.push(['DAILY TEMPLE COLLECTION']);
  sheetData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  sheetData.push([]);

  /* ---------------- DATE WISE DATA ---------------- */

  Object.keys(this.groupedData).forEach((dateKey) => {

    sheetData.push([`Bill Date : ${dateKey}`]);
    sheetData.push([]);

    Object.keys(this.groupedData[dateKey]).forEach((counterKey) => {

      sheetData.push([`Counter : ${counterKey}`]);

      sheetData.push([
        'User',
        'Cash',
        'UPI',
        'Cheque',
        'MO',
        'Bank',
        'Debit',
        'Due',
        'Total'
      ]);

      Object.keys(this.groupedData[dateKey][counterKey])
        .forEach((userKey) => {

          const userValue =
            this.groupedData[dateKey][counterKey][userKey];

          sheetData.push([
            userKey,
            this.getUserModeTotal(userValue, 'CS'),
            this.getUserModeTotal(userValue, 'UP'),
            this.getUserModeTotal(userValue, 'CH'),
            this.getUserModeTotal(userValue, 'MO'),
            this.getUserModeTotal(userValue, 'ON'),
            this.getUserModeTotal(userValue, 'DE'),
            this.getUserModeTotal(userValue, 'CR'),
            this.getTotalForUser(
              dateKey,
              counterKey,
              userKey
            )
          ]);
        });

      /* Counter Total */

      sheetData.push([
        'Total',
        this.getCounterModeTotal(
          this.groupedData[dateKey][counterKey],
          'CS'
        ),
        this.getCounterModeTotal(
          this.groupedData[dateKey][counterKey],
          'UP'
        ),
        this.getCounterModeTotal(
          this.groupedData[dateKey][counterKey],
          'CH'
        ),
        this.getCounterModeTotal(
          this.groupedData[dateKey][counterKey],
          'MO'
        ),
        this.getCounterModeTotal(
          this.groupedData[dateKey][counterKey],
          'ON'
        ),
        this.getCounterModeTotal(
          this.groupedData[dateKey][counterKey],
          'DE'
        ),
        this.getCounterModeTotal(
          this.groupedData[dateKey][counterKey],
          'CR'
        ),
        this.getTotalForCounter(
          dateKey,
          counterKey
        )
      ]);

      sheetData.push([]);
    });

    /* Online Total */

    if (this.hasOnlineDataForDate(dateKey)) {

      sheetData.push([
        'Online',
        this.getOnlineDataTotal(dateKey)
      ]);

      sheetData.push([]);
    }

    /* Date Total */

    sheetData.push([
      `Total for ${dateKey} (excluding Due)`,
      this.getDateTotal(dateKey)
    ]);

    sheetData.push([]);
    sheetData.push([]);
  });

  /* ---------------- GRAND TOTALS ---------------- */

  sheetData.push(['Grand Totals By Transaction Mode']);

  sheetData.push(['Cash', this.getGrandTotalByMode('CS')]);
  sheetData.push(['UPI', this.getGrandTotalByMode('UP')]);
  sheetData.push(['Cheque', this.getGrandTotalByMode('CH')]);
  sheetData.push(['MO', this.getGrandTotalByMode('MO')]);
  sheetData.push(['Bank', this.getGrandTotalByMode('ON')]);
  sheetData.push(['Debit', this.getGrandTotalByMode('DE')]);
  sheetData.push(['Online', this.getGrandTotalByMode('OL')]);
  sheetData.push(['Due', this.getGrandTotalByMode('CR')]);

  sheetData.push([
    'Grand Total',
    this.getGrandTotalOfAllModes()
  ]);

  /* ---------------- SHEET CREATE ---------------- */

  const worksheet: XLSX.WorkSheet =
    XLSX.utils.aoa_to_sheet(sheetData);

  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 }
  ];

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } }
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Temple Collection'
  );

  /* ---------------- DOWNLOAD ---------------- */

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob(
    [excelBuffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    }
  );

  if (FileSaver && (FileSaver as any).saveAs) {
    FileSaver.saveAs(
      blob,
      `Daily_Temple_Collection_${new Date().getTime()}.xlsx`
    );
  } else {
    XLSX.writeFile(workbook, `Daily_Temple_Collection_${new Date().getTime()}.xlsx`);
  }
}

}
