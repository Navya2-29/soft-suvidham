import { Component, HostListener } from '@angular/core';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MembersReport } from '../../../models/members.model';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report-credit',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './report-credit.component.html',
  styleUrls: [
    './report-credit.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportCreditComponent {
  data: ReportData[] = [];
  groupedData: { [key: string]: ReportData[] } = {};
  filteredData: ReportData[] = [];
  fromDate: string;
  toDate: string;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  nonmembercreditdata: MembersReport[] = [];
  membercreditdata: MembersReport[] = [];
  loading: boolean;
  isPrinting: boolean = false;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  openTableDropdownKey: string | null = null;
  columns: { [key: string]: boolean } = {
    name: true,
    mobile: true,
    due: true,
    paid: true,
    balance: true,
  };
  tableColumns: { [tableKey: string]: { [key: string]: boolean } } = {};

  columnList = [
    { key: 'name', label: 'Name' },
    { key: 'mobile', label: 'Mobile No' },
    { key: 'due', label: 'Due' },
    { key: 'paid', label: 'Paid' },
    { key: 'balance', label: 'Balance' },
  ];

  // Pagination State per table key
  paginationState: { [key: string]: { currentPage: number; pageSize: number } } = {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.common-column-picker') && !target.closest('.column-menu-dropdown')) {
      this.showColumnDropdown = false;
    }
    if (!target.closest('.credit-table-column-picker') && !target.closest('.credit-dropdown-panel')) {
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
    return this.columnList.filter(col => this.isColumnVisible(tableKey, col.key)).length;
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
    const leadingKeys = ['name', 'mobile'];
    for (const k of leadingKeys) {
      if (this.isColumnVisible(tableKey, k)) {
        count++;
      }
    }
    return count > 0 ? count : 1;
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

  constructor(
    private route: ActivatedRoute,
    private ts: TranslateService,
    private reportPrintservice: PrintreportService,
    private service: ReportService,
    private router: Router
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

  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: 'DevoteeDueRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:all', data);
        if (data && data.length > 0) {
          const filteredData = data.filter((item: any) => item.Due > item.Paid);

          this.data = filteredData.sort((a: any, b: any) =>
            a.BillNo?.toString().localeCompare(
              b.BillNo?.toString(),
              undefined,
              { numeric: true, sensitivity: 'base' }
            )
          );
        } else {
          this.data = [];
        }
        if (this.paginationState['credit']) {
          this.paginationState['credit'].currentPage = 1;
        }
        this.loading = false;
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

  generatePDF(): void {
    this.isPrinting = true;
    setTimeout(() => {
      this.reportPrintservice.generatePDF();
      setTimeout(() => {
        this.isPrinting = false;
      }, 1000);
    }, 100);
  }

  getTotalAmount(): number {
    const items = this.isPrinting ? this.data : this.getPaginatedEntries('credit', this.data);
    return items.reduce((sum, item) => {
      const balance = (item.Due || 0) - (item.Paid || 0);
      return sum + (balance < 0 ? 0 : balance);
    }, 0);
  }

  getAllTotalAmount(): number {
    return this.data.reduce((sum, item) => {
      const balance = (item.Due || 0) - (item.Paid || 0);
      return sum + (balance < 0 ? 0 : balance);
    }, 0);
  }

  getmemberTotalAmount(): number {
    return this.getTotalAmount();
  }

  getAllMemberTotalAmount(): number {
    return this.getAllTotalAmount();
  }

  getmemberPaidTotalAmount(): number {
    const items = this.isPrinting ? this.data : this.getPaginatedEntries('credit', this.data);
    return items.reduce((sum, item) => sum + Number(item.Paid || 0), 0);
  }

  getAllMemberPaidTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + Number(item.Paid || 0), 0);
  }

  getmemberDueTotalAmount(): number {
    const items = this.isPrinting ? this.data : this.getPaginatedEntries('credit', this.data);
    return items.reduce((sum, item) => sum + Number(item.Due || 0), 0);
  }

  getAllMemberDueTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + Number(item.Due || 0), 0);
  }

  getnonmemberTotalAmount(): number {
    return this.nonmembercreditdata.reduce(
      (sum, item) => sum + Number(item.Amount || 0),
      0
    );
  }

  getTotalRecordsCount(): number {
    return this.data ? this.data.length : 0;
  }

  hasAnyData(): boolean {
    return this.getTotalRecordsCount() > 0;
  }

  exportToExcel(): void {
    const workbook = XLSX.utils.book_new();
    const excelData: any[] = [];

    // ==========================================
    // HEADER
    // ==========================================
    excelData.push([this.templeName]);
    excelData.push([this.templeAddress]);
    excelData.push(['CREDIT REPORT']);
    excelData.push([
      `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
    ]);
    excelData.push([]);

    // ==========================================
    // MEMBER CREDIT DATA
    // ==========================================
    if (this.data.length > 0) {
      excelData.push(['MEMBER CREDIT / DUE REPORT']);
      excelData.push([
        'Name',
        'Mobile No',
        'Due',
        'Paid',
        'Balance'
      ]);

      this.data.forEach((member: any) => {
        const balance =
          (member.Due - member.Paid) < 0
            ? 0
            : (member.Due - member.Paid);

        excelData.push([
          member.Name,
          member.MobileNo,
          member.Due,
          member.Paid,
          balance
        ]);
      });

      // Totals Row
      excelData.push([
        'TOTAL',
        '',
        this.getAllMemberDueTotalAmount(),
        this.getAllMemberPaidTotalAmount(),
        this.getAllMemberTotalAmount()
      ]);

      excelData.push([]);
    }

    // ==========================================
    // GRAND TOTAL
    // ==========================================
    excelData.push([
      '',
      '',
      '',
      'Grand Total',
      this.getAllTotalAmount()
    ]);

    // ==========================================
    // CREATE SHEET
    // ==========================================
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    worksheet['!cols'] = [
      { wch: 30 }, // Name
      { wch: 18 }, // Mobile
      { wch: 15 }, // Due
      { wch: 15 }, // Paid
      { wch: 15 }  // Balance
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Credit Report');

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
      `Credit_Report_${new Date().getTime()}.xlsx`
    );
  }
}
