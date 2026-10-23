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
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportDailyStmt } from '../../../models/dailytrasaction.model';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
interface GroupedData {
  [key: number]: {  // CounterId level
    counterTotalAmount: number;  // Store total amount per CounterId
    users: {
      [key: string]: {  // Cuser level
        transactions: ReportDailyStmt[];
        totalAmount: number;  // Store total amount per user
      };
    };
  };
}
@Component({
  selector: 'app-report-counter-transaction',
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
  ],
  templateUrl: './report-counter-transaction.component.html',
  styleUrl: './report-counter-transaction.component.css'
})
export class ReportCounterTransactionComponent {
 
  data: ReportDailyStmt[] = [];
  fromDate: string;
  toDate: string;
  groupedData: GroupedData = {};
  currentDate: string = '';
  currentPage: number = 1;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  loading: boolean = false;

  // Pagination & Column Visibility Additions
  isPrinting: boolean = false;
  paginationState: { [tableKey: string]: { currentPage: number; pageSize: number } } = {};
  showColumnDropdown: boolean = false;
  openVazhipadDropdownKey: string | null = null;

  columns: { [key: string]: boolean } = {
    vazhipad: true,
    qty: true,
    rate: true,
    amount: true,
    billDate: true,
  };

  columnList = [
    { key: 'vazhipad', label: 'Vazhipad' },
    { key: 'qty', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
    { key: 'billDate', label: 'Bill Date' },
  ];

  vazhipadColumns: { [tableKey: string]: { [colKey: string]: boolean } } = {};
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http: HttpClient,
    private ts: TranslateService
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
      Type: "DailyStmt",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        this.loading = false;
        console.log('Fetched report data:', data);
        this.data = data;
        // this.groupDataByTransactionMode(this.data); // Group the data
        // const groupedData =this. groupByCounterAndUser(data);
        this.groupData();
        

        // console.log(groupedData,"dattata");
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching report data:', error);
      },
    });
  }



  groupData() {
    this.groupedData = this.data.reduce((acc: any, item: any) => {
      // Initialize CounterId if not exists
      if (!acc[item.CounterId]) {
        acc[item.CounterId] = {
          counterTotalAmount: 0, // Initialize counter-wise total
          users: {}
        };
      }
  
      // Initialize Cuser if not exists
      if (!acc[item.CounterId].users[item.Cuser]) {
        acc[item.CounterId].users[item.Cuser] = {
          transactions: [],
          totalAmount: 0
        };
      }
  
      // Add transaction to user's transaction list
      acc[item.CounterId].users[item.Cuser].transactions.push(item);
  
      // Update user's total amount
      acc[item.CounterId].users[item.Cuser].totalAmount += item.Amount;
  
      // Update counter-wise total amount
      acc[item.CounterId].counterTotalAmount += item.Amount;
  
      return acc;
    }, {});
  }
 
  generatePDF() {
    const printContent = document.getElementById('print-section');
    if (!printContent) {
      console.error('No content found to print');
      return;
    }

    const WindowPrt = window.open('', '', 'width=800,height=600');

    // Check if the print window was successfully opened
    if (!WindowPrt) {
      console.error(
        'Unable to open print window. Please check pop-up blockers.'
      );
      return;
    }

    WindowPrt.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          /* Add custom styles for printing if needed */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 5px;
            text-align: left;
          }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
    </html>
  `);

    WindowPrt.document.close();
    WindowPrt.focus();

    // Make sure that the window is still valid before calling print and close
    if (WindowPrt) {
      WindowPrt.print();
      WindowPrt.close();
    }
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
  }

  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        if (this.lang == 'en') {
          return 'ONLINE';
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

  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }

  // --- UI Look, Column Visibility, Pagination & Row Count Additions ---

  getTableKey(counterKey: string | number, userKey: string): string {
    return `${counterKey}__${userKey}`;
  }

  toggleColumnDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.showColumnDropdown = !this.showColumnDropdown;
  }

  toggleColumn(key: string): void {
    this.columns[key] = !this.columns[key];
    for (const tKey of Object.keys(this.vazhipadColumns)) {
      this.vazhipadColumns[tKey][key] = this.columns[key];
    }
  }

  isColumnVisible(tableKey: string, colKey: string): boolean {
    if (this.vazhipadColumns[tableKey] && this.vazhipadColumns[tableKey][colKey] !== undefined) {
      return this.vazhipadColumns[tableKey][colKey];
    }
    return !!this.columns[colKey];
  }

  getColumnsForVazhipad(tableKey: string): { [key: string]: boolean } {
    if (!this.vazhipadColumns[tableKey]) {
      this.vazhipadColumns[tableKey] = { ...this.columns };
    }
    return this.vazhipadColumns[tableKey];
  }

  toggleVazhipadDropdown(tableKey: string, event: Event): void {
    event.stopPropagation();
    this.openVazhipadDropdownKey = this.openVazhipadDropdownKey === tableKey ? null : tableKey;
  }

  toggleVazhipadColumn(tableKey: string, colKey: string, event?: Event): void {
    if (event) event.stopPropagation();
    const cols = this.getColumnsForVazhipad(tableKey);
    cols[colKey] = !cols[colKey];
  }

  resetVazhipadColumns(tableKey: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.vazhipadColumns[tableKey] = { ...this.columns };
  }

  hasVazhipadCustomOverrides(tableKey: string): boolean {
    if (!this.vazhipadColumns[tableKey]) return false;
    const current = this.vazhipadColumns[tableKey];
    return Object.keys(this.columns).some((k) => current[k] !== this.columns[k]);
  }

  get visibleColumnCount(): number {
    return Object.values(this.columns).filter(Boolean).length;
  }

  get totalColumnCount(): number {
    return this.columnList.length;
  }

  getVazhipadVisibleColumnCount(tableKey: string): number {
    const cols = this.getColumnsForVazhipad(tableKey);
    return Object.values(cols).filter(Boolean).length;
  }

  getLeadingColspan(tableKey?: string): number {
    let span = 0;
    if (tableKey) {
      if (this.isColumnVisible(tableKey, 'vazhipad')) span++;
      if (this.isColumnVisible(tableKey, 'qty')) span++;
      if (this.isColumnVisible(tableKey, 'rate')) span++;
    } else {
      if (this.columns['vazhipad']) span++;
      if (this.columns['qty']) span++;
      if (this.columns['rate']) span++;
    }
    return Math.max(span, 1);
  }

  // Pagination Methods
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
    return item ? (item.key || item.BillNo || item.vazhipad || index) : index;
  }

  // Row Count Helpers
  getCounterRowCount(counterKey: any): number {
    const counterObj = (this.groupedData as any)[counterKey];
    if (!counterObj || !counterObj.users) return 0;
    let total = 0;
    Object.keys(counterObj.users).forEach((u) => {
      total += counterObj.users[u].transactions ? counterObj.users[u].transactions.length : 0;
    });
    return total;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(): void {
    this.showColumnDropdown = false;
    this.openVazhipadDropdownKey = null;
  }

  exportToExcel(): void {
    const sheetData: any[] = [];
    sheetData.push([this.templeName || '']);
    sheetData.push([this.templeAddress || '']);
    sheetData.push(['DAILY STATEMENT REPORT']);
    sheetData.push([`Date: ${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`]);
    sheetData.push([]);

    Object.keys(this.groupedData).forEach((counterKey: any) => {
      sheetData.push([`Counter ID: ${counterKey}`]);
      const users = (this.groupedData as any)[counterKey].users;

      Object.keys(users).forEach((userKey: string) => {
        sheetData.push([`User: ${userKey}`]);
        const tKey = this.getTableKey(counterKey, userKey);
        const headers: string[] = [];
        if (this.isColumnVisible(tKey, 'vazhipad')) headers.push('Vazhipad');
        if (this.isColumnVisible(tKey, 'qty')) headers.push('Quantity');
        if (this.isColumnVisible(tKey, 'rate')) headers.push('Rate');
        if (this.isColumnVisible(tKey, 'amount')) headers.push('Amount');
        if (this.isColumnVisible(tKey, 'billDate')) headers.push('Bill Date');
        sheetData.push(headers);

        const transactions = users[userKey].transactions || [];
        transactions.forEach((item: any) => {
          const row: any[] = [];
          if (this.isColumnVisible(tKey, 'vazhipad')) row.push(item.vazhipad);
          if (this.isColumnVisible(tKey, 'qty')) row.push(item.Qty);
          if (this.isColumnVisible(tKey, 'rate')) row.push(item.Rate);
          if (this.isColumnVisible(tKey, 'amount')) row.push(item.Amount);
          if (this.isColumnVisible(tKey, 'billDate')) row.push(item.BillDate);
          sheetData.push(row);
        });

        sheetData.push([`Total Amount for ${userKey}:`, '', '', users[userKey].totalAmount || 0]);
        sheetData.push([]);
      });

      sheetData.push([
        `Total Amount for Counter ${counterKey}:`,
        '',
        '',
        (this.groupedData as any)[counterKey].counterTotalAmount || 0,
      ]);
      sheetData.push([]);
    });

    sheetData.push(['Grand Total:', '', '', this.getTotalAmount()]);

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Counter Statement': worksheet },
      SheetNames: ['Counter Statement'],
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    FileSaver.saveAs(fileData, `Counter_Transaction_Report_${new Date().getTime()}.xlsx`);
  }
}

