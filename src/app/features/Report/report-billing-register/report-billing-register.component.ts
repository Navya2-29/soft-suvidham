import { SpinnerComponent } from './../../../shared/component/spinner/spinner.component';
import { Component, OnInit, HostListener } from '@angular/core';
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
export class ReportBillingRegisterComponent implements OnInit {
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

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  isPrinting: boolean = false;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  columns: { [key: string]: boolean } = {
    sino: true,
    billDate: true,
    billNo: true,
    cash: true,
    upi: true,
    cheque: true,
    mOrder: true,
    debit: true,
    bank: true,
    online: true,
    due: true,
    total: true,
  };

  columnList = [
    { key: 'sino', label: 'SI No' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'billNo', label: 'Bill No' },
    { key: 'cash', label: 'Cash' },
    { key: 'upi', label: 'UPI' },
    { key: 'cheque', label: 'Cheque' },
    { key: 'mOrder', label: 'M.Order' },
    { key: 'debit', label: 'Debit' },
    { key: 'bank', label: 'Bank' },
    { key: 'online', label: 'Online' },
    { key: 'due', label: 'Due' },
    { key: 'total', label: 'Total' },
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.showColumnDropdown && !target.closest('.common-column-picker')) {
      this.showColumnDropdown = false;
    }
  }

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

        (data || []).sort((a: any, b: any) => {
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

        this.data = data || [];
        this.billRegisterData = this.data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
        this.loading = false;
      }
    });
  }

  // --- Column Visibility Methods ---
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
    if (this.columns[key] && this.visibleColumnCount <= 1) {
      return;
    }
    this.columns[key] = !this.columns[key];
  }

  isColumnVisible(colKey: string): boolean {
    return this.columns[colKey] ?? false;
  }

  getTableVisibleColumnCount(): number {
    return Object.values(this.columns).filter(Boolean).length || 1;
  }

  hasAnyLeadingColumnVisible(): boolean {
    return this.isColumnVisible('sino') || this.isColumnVisible('billDate') || this.isColumnVisible('billNo');
  }

  getLeadingColspan(): number {
    let count = 0;
    if (this.isColumnVisible('sino')) count++;
    if (this.isColumnVisible('billDate')) count++;
    if (this.isColumnVisible('billNo')) count++;
    return Math.max(1, count);
  }

  // --- Pagination Methods ---
  getPaginatedEntries(entries: ReportData[]): ReportData[] {
    if (this.isPrinting) return entries || [];
    if (!entries || entries.length === 0) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return entries.slice(start, start + this.pageSize);
  }

  getTotalPages(entries: ReportData[]): number {
    if (!entries || entries.length === 0) return 1;
    return Math.ceil(entries.length / this.pageSize) || 1;
  }

  getPages(entries: ReportData[]): number[] {
    const total = this.getTotalPages(entries);
    const current = this.currentPage;
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

  goToPage(page: number): void {
    this.currentPage = page;
  }

  nextPage(entries: ReportData[]): void {
    const totalPages = this.getTotalPages(entries);
    if (this.currentPage < totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onPageSizeChange(size: any): void {
    const newSize = Number(size) || 10;
    this.pageSize = newSize;
    this.currentPage = 1;
  }

  getRangeStart(): number {
    if (!this.billRegisterData || this.billRegisterData.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getRangeEnd(): number {
    if (!this.billRegisterData || this.billRegisterData.length === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, this.billRegisterData.length);
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
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  getGrandTotal(): number {
    return (
      this.billRegisterData
        .filter((item) => !(item.TrnStatus !== 'S' || item.TrnsMode === 'CR'))
        .reduce((acc, item) => {
          const valueToAdd = item.TotalAmt || 0;
          return acc + valueToAdd;
        }, 0)
    );
  }

  isRedText(item: any): boolean {
    return item.TrnStatus !== 'S';
  }

  generatePDF() {
    this.isPrinting = true;
    setTimeout(() => {
      this.reportPrintservice.generatePDF();
      setTimeout(() => {
        this.isPrinting = false;
      }, 1000);
    }, 100);
  }

  getStarbyId(id: string) {
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
        return this.lang == 'en' ? 'BANK' : 'ബാങ്ക്';
      case 'CS':
        return this.lang == 'en' ? 'CASH' : 'ക്യാഷ്';
      case 'MO':
        return this.lang == 'en' ? 'MONEY ORDER' : 'മണി ഓർഡർ';
      case 'UP':
        return this.lang == 'en' ? 'UPI' : 'യുപിഐ';
      case 'CH':
        return this.lang == 'en' ? 'CHEQUE' : 'ചെക്ക്';
      case 'CR':
        return this.lang == 'en' ? 'CREDIT' : 'ക്രെഡിറ്റ്';
      case 'DE':
        return this.lang == 'en' ? 'DEBIT' : 'ഡെബിറ്റ്';
      default:
        return 'OTHERS';
    }
  }

  gettransactionstatus(status: string) {
    switch (status) {
      case 'C':
        return this.lang == 'en' ? 'cancelled' : 'ക്യാൻസെൽഡ്';
      case 'S':
        return this.lang == 'en' ? 'Success' : 'സക്‌സസ്';
      default:
        return 'OTHERS';
    }
  }

  reportinexcelformat(): void {
    const workbook = XLSX.utils.book_new();
    const sheetData: any[][] = [];

    // ===== HEADER =====
    if (this.templeName) sheetData.push([this.templeName]);
    if (this.templeAddress) sheetData.push([this.templeAddress]);
    sheetData.push(['BILL REGISTER']);
    sheetData.push([
      `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
    ]);
    sheetData.push([]);

    // ===== DYNAMIC TABLE HEADER =====
    const headers: string[] = [];
    if (this.isColumnVisible('sino')) headers.push('Sl No');
    if (this.isColumnVisible('billDate')) headers.push('Bill Date');
    if (this.isColumnVisible('billNo')) headers.push('Bill No');
    if (this.isColumnVisible('cash')) headers.push('Cash');
    if (this.isColumnVisible('upi')) headers.push('UPI');
    if (this.isColumnVisible('cheque')) headers.push('Cheque');
    if (this.isColumnVisible('mOrder')) headers.push('M.Order');
    if (this.isColumnVisible('debit')) headers.push('Debit');
    if (this.isColumnVisible('bank')) headers.push('Bank');
    if (this.isColumnVisible('online')) headers.push('Online');
    if (this.isColumnVisible('due')) headers.push('Due');
    if (this.isColumnVisible('total')) headers.push('Total');
    sheetData.push(headers);

    // ===== DATA ROWS =====
    this.billRegisterData.forEach((item: any, index: number) => {
      const isRed = item.TrnsMode === 'CR' || item.TrnStatus !== 'S';
      const row: any[] = [];
      if (this.isColumnVisible('sino')) row.push(index + 1);
      if (this.isColumnVisible('billDate')) row.push(item.BillDate);
      if (this.isColumnVisible('billNo')) row.push(item.BillNo);
      if (this.isColumnVisible('cash')) row.push(item.TrnsMode === 'CS' ? item.TotalAmt : 0);
      if (this.isColumnVisible('upi')) row.push(item.TrnsMode === 'UP' ? item.TotalAmt : 0);
      if (this.isColumnVisible('cheque')) row.push(item.TrnsMode === 'CH' ? item.TotalAmt : 0);
      if (this.isColumnVisible('mOrder')) row.push(item.TrnsMode === 'MO' ? item.TotalAmt : 0);
      if (this.isColumnVisible('debit')) row.push(item.TrnsMode === 'DE' ? item.TotalAmt : 0);
      if (this.isColumnVisible('bank')) row.push(item.TrnsMode === 'ON' ? item.TotalAmt : 0);
      if (this.isColumnVisible('online')) row.push(item.TrnsMode === 'OL' ? item.TotalAmt : 0);
      if (this.isColumnVisible('due')) row.push(item.TrnsMode === 'CR' ? item.TotalAmt : 0);
      if (this.isColumnVisible('total')) row.push(isRed ? -item.TotalAmt : item.TotalAmt);
      sheetData.push(row);
    });

    // ===== GRAND TOTAL ROW =====
    const totalRow: any[] = [];
    headers.forEach((h, index) => {
      if (h === 'Sl No' || h === 'Bill Date' || h === 'Bill No') {
        if (totalRow.length === 0 || !totalRow.includes('Grand Total')) {
          totalRow.push('Grand Total');
        } else {
          totalRow.push('');
        }
      } else if (h === 'Cash') {
        totalRow.push(this.getColumnTotal('CS'));
      } else if (h === 'UPI') {
        totalRow.push(this.getColumnTotal('UP'));
      } else if (h === 'Cheque') {
        totalRow.push(this.getColumnTotal('CH'));
      } else if (h === 'M.Order') {
        totalRow.push(this.getColumnTotal('MO'));
      } else if (h === 'Debit') {
        totalRow.push(this.getColumnTotal('DE'));
      } else if (h === 'Bank') {
        totalRow.push(this.getColumnTotal('ON'));
      } else if (h === 'Online') {
        totalRow.push(this.getColumnTotal('OL'));
      } else if (h === 'Due') {
        totalRow.push(-this.getColumnTotal('CR'));
      } else if (h === 'Total') {
        totalRow.push(this.getGrandTotal());
      } else {
        totalRow.push('');
      }
    });
    sheetData.push(totalRow);

    // ===== CREATE SHEET =====
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Column widths
    worksheet['!cols'] = headers.map((h) => {
      if (h === 'Sl No') return { wch: 8 };
      if (h === 'Bill Date' || h === 'Bill No') return { wch: 15 };
      if (h === 'Total') return { wch: 15 };
      return { wch: 12 };
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bill Register');

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
