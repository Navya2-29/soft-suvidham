import { CommonModule } from '@angular/common';
import { Component, HostListener, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportData } from '../../../models/poornam-report';
import { ActivatedRoute, Router } from '@angular/router';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { ReportService } from '../service/report.service';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report-endowment',
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
  templateUrl: './report-endowment.component.html',
  styleUrls: ['./report-endowment.component.css', '/src/assets/styles/report.style.css'],
})
export class ReportEndowmentComponent {
  displayedColumns: string[] = ['BillNo', 'BillDate', 'Vazhipad', 'Name', 'Star', 'Qty', 'Rate', 'Amount', 'VazhipadDate'];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 50, 100, 200, 300, 500, 1000];
  pageIndex = 0;
  data: ReportData[] = [];
  filteredData: ReportData[] = [];

  fromDate: string;
  toDate: string;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  loading: boolean;
  searchText: string = '';
  isPrinting: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  openTableDropdownKey: string | null = null;
  columns: { [key: string]: boolean } = {
    billDate: true,
    billNo: true,
    vazhiDate: true,
    vazhipad: true,
    name: true,
    star: true,
    qty: true,
    rate: true,
  };
  tableColumns: { [tableKey: string]: { [key: string]: boolean } } = {};

  columnList = [
    { key: 'billDate', label: 'Bill Date' },
    { key: 'billNo', label: 'Bill No' },
    { key: 'vazhiDate', label: 'Vazhipad Date' },
    { key: 'vazhipad', label: 'Vazhipad' },
    { key: 'name', label: 'Name' },
    { key: 'star', label: 'Star' },
    { key: 'qty', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
  ];

  // Pagination State per table key
  paginationState: { [key: string]: { currentPage: number; pageSize: number } } = {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.common-column-picker') && !target.closest('.column-menu-dropdown')) {
      this.showColumnDropdown = false;
    }
    if (!target.closest('.endowment-table-column-picker') && !target.closest('.endowment-dropdown-panel')) {
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

  constructor(
    private route: ActivatedRoute,
    private reportPrintservice: PrintreportService,
    private ts: TranslateService,
    private service: ReportService,
    private router: Router,
    private http: HttpClient
  ) {
    this.lang = localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this.templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
    this.lang = localStorage.getItem('Language');
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

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchText = value;

    this.filteredData = this.data.filter(item =>
      (item.BillDate + ' ' + item.BillNo + ' ' + item.VazhiDate + ' ' +
       item.Vazhipad + ' ' + item.Name + ' ' + item.Star + ' ' + item.Qty + ' ' + item.MobileNo + '' + item.Address1 + ''
        + item.Rate + item.Address2 + '').toLowerCase().includes(this.searchText)
    );
    if (this.paginationState['endowment']) {
      this.paginationState['endowment'].currentPage = 1;
    }
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: "EndownmentRpt",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data || [];
        this.data = this.data.sort((a: any, b: any) =>
          a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
        );
        this.filteredData = this.data;

        this.loading = false;
        this.dataSource.data = this.data;
        this.length = this.data.length;
        this.dataSource.paginator = this.paginator;
        if (this.paginationState['endowment']) {
          this.paginationState['endowment'].currentPage = 1;
        }

        console.log(this.groupedData);
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
    this.isPrinting = true;
    setTimeout(() => {
      this.reportPrintservice.generatePDF();
      setTimeout(() => {
        this.isPrinting = false;
      }, 1000);
    }, 100);
  }

  getGrandTotal(): number {
    return this.filteredData.reduce((sum, item) => sum + item.Qty * item.Rate, 0);
  }

  getTimeForBill(time: any) {
    switch (time.toString()) {
      case '0':
        if (this.lang == 'en') {
          return 'Any Time';
        } else {
          return 'എപ്പോൾ വേണമെങ്കിലും';
        }

      case '1':
        if (this.lang == 'en') {
          return 'Morning';
        } else {
          return 'രാവിലെ';
        }
      case '2':
        if (this.lang == 'en') {
          return 'Evening';
        } else {
          return 'വൈകുന്നേരം';
        }
      case '3':
        if (this.lang == 'en') {
          return 'Night';
        } else {
          return 'രാത്രി';
        }
      default:
        return 'OTHERS';
    }
  }

  exportToExcel(): void {
    const workbook = XLSX.utils.book_new();
    const excelData: any[] = [];

    // ==========================================
    // HEADER
    // ==========================================
    excelData.push([this.templeName]);
    excelData.push([this.templeAddress]);
    excelData.push(['ENDOWMENT REPORT']);
    excelData.push([
      `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
    ]);
    excelData.push([]);

    // ==========================================
    // TABLE HEADER
    // ==========================================
    excelData.push([
      'Bill Date',
      'Bill No',
      'Vazhipad Date',
      'Vazhipad',
      'Name',
      'Star',
      'Quantity',
      'Rate'
    ]);

    // ==========================================
    // TABLE DATA
    // ==========================================
    this.filteredData.forEach((item: any) => {
      excelData.push([
        item.BillDate,
        item.BillNo,
        item.VazhiDate,
        item.Vazhipad ? item.Vazhipad : '',
        item.Name,
        item.Star,
        item.Qty,
        item.Rate
      ]);
    });

    // ==========================================
    // CREATE SHEET
    // ==========================================
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    worksheet['!cols'] = [
      { wch: 15 }, // Bill Date
      { wch: 12 }, // Bill No
      { wch: 15 }, // Vazhipad Date
      { wch: 30 }, // Vazhipad
      { wch: 28 }, // Name
      { wch: 15 }, // Star
      { wch: 12 }, // Qty
      { wch: 15 }  // Rate
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Endowment Report');

    // ==========================================
    // DOWNLOAD FILE
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
      `Endowment_Report_${new Date().getTime()}.xlsx`
    );
  }
}
