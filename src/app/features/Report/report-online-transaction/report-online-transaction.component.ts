import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ReportData } from '../../../models/poornam-report';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReportOnlineTransactionPopupComponent } from '../report-online-transaction-popup/report-online-transaction-popup.component';
import { MatIconModule } from '@angular/material/icon';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-report-online-transaction',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    SpinnerComponent,
    MatIconModule,
    MatDialogModule,
    TranslateModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './report-online-transaction.component.html',
  styleUrls: ['./report-online-transaction.component.css', '/src/assets/styles/report.style.css']
})
export class ReportOnlineTransactionComponent implements OnInit {
  displayedColumns: string[] = ['BillNo', 'BillDate', 'Vazhipad', 'NAME', 'STAR', 'QTY', 'RATE', 'Amount'];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 50, 100, 200, 300, 500, 1000];
  pageIndex = 0;
  data: ReportData[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  filteredData: ReportData[] = [];
  fromDate: string;
  toDate: string;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  loading: boolean;
  isPrinting: boolean = false;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  openTableDropdownKey: string | null = null;
  columns: { [key: string]: boolean } = {
    orderId: true,
    billDate: true,
    amount: true,
    refNo: true,
    vazhiDate: true,
    nameAddress: true,
    status: true,
    details: true,
  };
  tableColumns: { [tableKey: string]: { [key: string]: boolean } } = {};

  columnList = [
    { key: 'orderId', label: 'Order Id' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'refNo', label: 'Reference No' },
    { key: 'vazhiDate', label: 'Vazhipad Date' },
    { key: 'nameAddress', label: 'Name & Address' },
    { key: 'status', label: 'Status' },
    { key: 'details', label: 'Details' },
  ];

  // Pagination State per table key
  paginationState: { [key: string]: { currentPage: number; pageSize: number } } = {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.common-column-picker') && !target.closest('.column-menu-dropdown')) {
      this.showColumnDropdown = false;
    }
    if (!target.closest('.online-table-column-picker') && !target.closest('.online-dropdown-panel')) {
      this.openTableDropdownKey = null;
    }
  }

  toggleColumnDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showColumnDropdown = !this.showColumnDropdown;
    if (this.showColumnDropdown) {
      this.openTableDropdownKey = null;
    }
  }

  toggleTableDropdown(tableKey: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openTableDropdownKey = this.openTableDropdownKey === tableKey ? null : tableKey;
    if (this.openTableDropdownKey) {
      this.showColumnDropdown = false;
    }
  }

  isColumnVisible(tableKey: string, colKey: string): boolean {
    if (this.tableColumns[tableKey] && this.tableColumns[tableKey][colKey] !== undefined) {
      return this.tableColumns[tableKey][colKey];
    }
    return this.columns[colKey] !== false;
  }

  toggleColumn(colKey: string): void {
    this.columns[colKey] = !this.columns[colKey];
    for (const key of Object.keys(this.tableColumns)) {
      if (this.tableColumns[key] && this.tableColumns[key][colKey] !== undefined) {
        delete this.tableColumns[key][colKey];
      }
    }
  }

  toggleTableColumn(tableKey: string, colKey: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.tableColumns[tableKey]) {
      this.tableColumns[tableKey] = { ...this.columns };
    }
    this.tableColumns[tableKey][colKey] = !this.isColumnVisible(tableKey, colKey);
  }

  getTableColumns(tableKey: string): { [key: string]: boolean } {
    const res: { [key: string]: boolean } = {};
    for (const col of this.columnList) {
      res[col.key] = this.isColumnVisible(tableKey, col.key);
    }
    return res;
  }

  getTableVisibleColumnCount(tableKey: string): number {
    const count = this.columnList.filter(col => this.isColumnVisible(tableKey, col.key)).length;
    return count > 0 ? count : 1;
  }

  hasTableCustomOverrides(tableKey: string): boolean {
    return !!this.tableColumns[tableKey] && Object.keys(this.tableColumns[tableKey]).length > 0;
  }

  resetTableColumns(tableKey: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    delete this.tableColumns[tableKey];
  }

  get visibleColumnCount(): number {
    return Object.values(this.columns).filter((v) => v).length;
  }

  get totalColumnCount(): number {
    return this.columnList.length;
  }

  getLeadingColspan(tableKey: string): number {
    let count = 0;
    const leadingKeys = ['orderId', 'billDate'];
    for (const k of leadingKeys) {
      if (this.isColumnVisible(tableKey, k)) {
        count++;
      }
    }
    return count > 0 ? count : 1;
  }

  getTrailingColspan(tableKey: string): number {
    let count = 0;
    const trailingKeys = ['refNo', 'vazhiDate', 'nameAddress', 'status', 'details'];
    for (const k of trailingKeys) {
      if (this.isColumnVisible(tableKey, k)) {
        count++;
      }
    }
    return count;
  }

  // Pagination Helpers
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

  getPaginatedEntries(tableKey: string, list: any[]): any[] {
    if (!list || list.length === 0) return [];
    if (this.isPrinting) return list;
    const pg = this.getPagination(tableKey);
    const start = (pg.currentPage - 1) * pg.pageSize;
    return list.slice(start, start + pg.pageSize);
  }

  getTotalPages(tableKey: string, list: any[]): number {
    if (!list || list.length === 0) return 1;
    const pg = this.getPagination(tableKey);
    return Math.ceil(list.length / pg.pageSize) || 1;
  }

  getPages(tableKey: string, list: any[]): number[] {
    const total = this.getTotalPages(tableKey, list);
    const current = this.getCurrentPage(tableKey);
    const delta = 2;
    const pages: number[] = [];

    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(tableKey: string, page: number): void {
    const pg = this.getPagination(tableKey);
    pg.currentPage = page;
  }

  nextPage(tableKey: string, list: any[]): void {
    const pg = this.getPagination(tableKey);
    const total = this.getTotalPages(tableKey, list);
    if (pg.currentPage < total) {
      pg.currentPage++;
    }
  }

  prevPage(tableKey: string): void {
    const pg = this.getPagination(tableKey);
    if (pg.currentPage > 1) {
      pg.currentPage--;
    }
  }

  onPageSizeChange(tableKey: string, newSize: number | string): void {
    const pg = this.getPagination(tableKey);
    pg.pageSize = Number(newSize) || 10;
    pg.currentPage = 1;
  }

  getRangeStart(tableKey: string, list: any[]): number {
    if (!list || list.length === 0) return 0;
    const pg = this.getPagination(tableKey);
    return (pg.currentPage - 1) * pg.pageSize + 1;
  }

  getRangeEnd(tableKey: string, list: any[]): number {
    if (!list || list.length === 0) return 0;
    const pg = this.getPagination(tableKey);
    return Math.min(pg.currentPage * pg.pageSize, list.length);
  }

  getTotalRecordsCount(): number {
    return this.filteredData ? this.filteredData.length : 0;
  }

  hasAnyData(): boolean {
    return this.getTotalRecordsCount() > 0;
  }

  getTotalAmount(): number {
    const items = this.isPrinting ? this.filteredData : this.getPaginatedEntries('online', this.filteredData);
    return items.reduce((sum, item) => sum + Number(item.Amount || 0), 0);
  }

  getAllTotalAmount(): number {
    return this.filteredData.reduce((sum, item) => sum + Number(item.Amount || 0), 0);
  }

  constructor(
    private route: ActivatedRoute,
    private reportPrintservice: PrintreportService,
    private dialog: MatDialog,
    private ts: TranslateService,
    private service: ReportService,
    private router: Router,
    private http: HttpClient
  ) {
    this.lang = localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this.templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
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
      Type: 'OnlineBooking',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data || [];
        this.filteredData = this.data;
        this.loading = false;
        if (this.paginationState['online']) {
          this.paginationState['online'].currentPage = 1;
        }
        console.log(this.filteredData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
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

  generatePDF() {
    this.isPrinting = true;
    setTimeout(() => {
      this.reportPrintservice.generatePDF();
      setTimeout(() => {
        this.isPrinting = false;
      }, 1000);
    }, 100);
  }

  showViewMorePopUp(OrderId: string, status: string) {
    const dialogRef = this.dialog.open(ReportOnlineTransactionPopupComponent, {
      width: '900px',
      data: {
        title: OrderId,
        status: status
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
      // handle dialog result if needed
    });
  }

  getTransStatus(status: string) {
    if (status == "S") {
      return "Success";
    } else if (status == "F") {
      return "Failed";
    } else {
      return "Nil";
    }
  }

  exportToExcel(): void {
    const workbook = XLSX.utils.book_new();

    // ==========================================
    // Sheet Data Array
    // ==========================================
    const excelData: any[] = [];

    // Header
    excelData.push([this.templeName]);
    excelData.push([this.templeAddress]);
    excelData.push(['ONLINE REPORT']);
    excelData.push([
      `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
    ]);
    excelData.push([]);

    // ==========================================
    // Table Header
    // ==========================================
    excelData.push([
      'Order Id',
      'Bill Date',
      'Amount',
      'Reference No',
      'Vazhipad Date',
      'Name & Address',
      'Mobile No',
      'Status'
    ]);

    // ==========================================
    // Data Rows
    // ==========================================
    this.filteredData.forEach((item: any) => {
      excelData.push([
        item.OrderId,
        item.BillDate,
        item.Amount,
        item.TrnId ? item.TrnId : '--',
        item.VazhiDate,
        `${item.Address1 || ''}\n${item.Address2 || ''}\n${item.Address3 || ''}\n${item.Address4 || ''}`,
        item.MobileNo,
        this.getTransStatus(item.TrnStatus)
      ]);
    });

    // ==========================================
    // Grand Total
    // ==========================================
    excelData.push([]);
    excelData.push([
      '',
      '',
      'Grand Total',
      this.getAllTotalAmount()
    ]);

    // ==========================================
    // Create Worksheet
    // ==========================================
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 40 },
      { wch: 18 },
      { wch: 18 }
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Online Report'
    );

    // ==========================================
    // Save File
    // ==========================================
    const excelBuffer: any = XLSX.write(
      workbook,
      {
        bookType: 'xlsx',
        type: 'array'
      }
    );

    const file = new Blob(
      [excelBuffer],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      }
    );

    saveAs(
      file,
      `Online_Report_${new Date().getTime()}.xlsx`
    );
  }
}
