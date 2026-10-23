import { Component, HostListener, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportDailyStmt } from '../../../models/dailytrasaction.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-time-slot',
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
  templateUrl: './report-time-slot.component.html',
  styleUrls: [
    './report-time-slot.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportTimeSlotComponent {
  data: ReportDailyStmt[] = [];
  fromDate: string;
  toDate: string;
  creditTransactionArray: any[];
  loading: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: {
  [vazhipad: string]: {
    [timeslot: string]: any[];
  };
} = {};

  currentDate: string = '';
  currentPage: number = 1;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  isPrinting: boolean = false;
  pageSize: number = 10;
  paginationState: { [tableKey: string]: { currentPage: number; pageSize: number } } = {};

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  openTableDropdownKey: string | null = null;
  columns: { [key: string]: boolean } = {
    billNo: true,
    name: true,
    star: true,
  };
  tableColumns: { [tableKey: string]: { [key: string]: boolean } } = {};

  columnList = [
    { key: 'billNo', label: 'Bill No' },
    { key: 'name', label: 'Name' },
    { key: 'star', label: 'Star' },
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.showColumnDropdown && !target.closest('.common-column-picker')) {
      this.showColumnDropdown = false;
    }
    if (this.openTableDropdownKey && !target.closest('.timeslot-column-picker')) {
      this.openTableDropdownKey = null;
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
    if (this.showColumnDropdown) {
      this.openTableDropdownKey = null;
    }
  }

  toggleColumn(key: string): void {
    if (this.columns[key] && this.visibleColumnCount <= 1) {
      return;
    }
    this.columns[key] = !this.columns[key];
    const updatedVal = this.columns[key];

    // Propagate to all initialized table overrides
    Object.keys(this.tableColumns).forEach((tKey) => {
      if (this.tableColumns[tKey]) {
        this.tableColumns[tKey][key] = updatedVal;
      }
    });
  }

  getVisibleColumnCount(): number {
    return this.visibleColumnCount || 1;
  }

  getTableColumns(tableKey: string): { [key: string]: boolean } {
    if (!this.tableColumns[tableKey]) {
      this.tableColumns[tableKey] = { ...this.columns };
    }
    return this.tableColumns[tableKey];
  }

  isColumnVisible(tableKey: string, colKey: string): boolean {
    const cols = this.getTableColumns(tableKey);
    return cols[colKey] ?? false;
  }

  getTableVisibleColumnCount(tableKey: string): number {
    const cols = this.getTableColumns(tableKey);
    return Object.values(cols).filter(Boolean).length || 1;
  }

  hasTableCustomOverrides(tableKey: string): boolean {
    if (!this.tableColumns[tableKey]) return false;
    return this.columnList.some((col) => this.tableColumns[tableKey][col.key] !== this.columns[col.key]);
  }

  toggleTableDropdown(tableKey: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.openTableDropdownKey === tableKey) {
      this.openTableDropdownKey = null;
    } else {
      this.openTableDropdownKey = tableKey;
      this.showColumnDropdown = false;
    }
  }

  toggleTableColumn(tableKey: string, colKey: string, event?: Event): void {
    if (event) event.stopPropagation();
    const cols = this.getTableColumns(tableKey);
    const visibleCount = Object.values(cols).filter(Boolean).length;
    if (cols[colKey] && visibleCount <= 1) {
      return;
    }
    cols[colKey] = !cols[colKey];
  }

  resetTableColumns(tableKey: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.tableColumns[tableKey] = { ...this.columns };
  }

  // --- Pagination Methods ---
  getTableKey(vazhipad: string, timeslot: string): string {
    const v = (vazhipad || 'default').replace(/\s+/g, '_');
    const t = (timeslot || 'default').replace(/\s+/g, '_');
    return `${v}_${t}`;
  }

  getPagination(tableKey: string): { currentPage: number; pageSize: number } {
    if (!this.paginationState[tableKey]) {
      this.paginationState[tableKey] = { currentPage: 1, pageSize: this.pageSize };
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

  nextPage(tableKey: string, entries: any[]): void {
    const totalPages = this.getTotalPages(tableKey, entries);
    if (this.getCurrentPage(tableKey) < totalPages) {
      this.getPagination(tableKey).currentPage++;
    }
  }

  prevPage(tableKey: string): void {
    if (this.getCurrentPage(tableKey) > 1) {
      this.getPagination(tableKey).currentPage--;
    }
  }

  onPageSizeChange(tableKey: string, size: any): void {
    const newSize = Number(size) || 10;
    this.pageSize = newSize;
    this.getPagination(tableKey).pageSize = newSize;
    this.getPagination(tableKey).currentPage = 1;
  }

  getRangeStart(tableKey: string, entries: any[]): number {
    if (!entries || entries.length === 0) return 0;
    const p = this.getPagination(tableKey);
    return (p.currentPage - 1) * p.pageSize + 1;
  }

  getRangeEnd(tableKey: string, entries: any[]): number {
    if (!entries || entries.length === 0) return 0;
    const p = this.getPagination(tableKey);
    return Math.min(p.currentPage * p.pageSize, entries.length);
  }

  getVisibleRowCount(tableKey: string, entries: any[]): number {
    if (!entries || entries.length === 0) return 0;
    if (this.isPrinting) return entries.length;
    return this.getPaginatedEntries(tableKey, entries).length;
  }
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
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

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = 'TimeSlotRpt';
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;

    const payLoad = {
      Type: 'TimeSlotRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };

    this.service.getReport(payLoad).subscribe({
      next: (filteredData) => {
        this.data = filteredData;
        this.groupedData = this.groupByVazhipadAndTimeslot(filteredData);
        console.log('Grouped Data:', this.groupedData);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
        this.loading = false;
      },
    });
  }

  groupByVazhipadAndTimeslot(data: any[]) {
  const grouped: any = {};

  data.forEach((item) => {
    const vazhipad = item.Vazhipad || 'Unknown Vazhipad';
    const timeslot = item.Timeslot || 'No Time Slot';

    if (!grouped[vazhipad]) grouped[vazhipad] = {};
    if (!grouped[vazhipad][timeslot]) grouped[vazhipad][timeslot] = [];

    grouped[vazhipad][timeslot].push(item);
  });

  return grouped;
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

  exportToExcel(): void {

  const workbook = XLSX.utils.book_new();
  const excelRows: any[] = [];

  /* ===============================
     REPORT HEADER
  =============================== */
  excelRows.push([this.templeName]);
  excelRows.push([this.templeAddress]);
  excelRows.push(['TIME-SLOT BASED REPORT']);
  excelRows.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelRows.push([]);

  /* ===============================
     GROUPED DATA
  =============================== */

  Object.keys(this.groupedData).forEach((slot: any) => {

    // Time Slot Heading
    excelRows.push([slot]);
    excelRows.push([]);

    const slotData = this.groupedData[slot];

    Object.keys(slotData).forEach((category: any) => {

      // Category Heading
      excelRows.push([category]);

      // Table Header
      excelRows.push([
        'Bill No',
        'Name',
        'Star'
      ]);

      const categoryItems = slotData[category];

      Object.keys(categoryItems).forEach((key: any) => {

        const item = categoryItems[key];

        excelRows.push([
          item.BillNo,
          item.Name,
          item.Star
        ]);

      });

      excelRows.push([]);
    });

    excelRows.push([]);
  });

  /* ===============================
     CREATE SHEET
  =============================== */

  const worksheet = XLSX.utils.aoa_to_sheet(excelRows);

  worksheet['!cols'] = [
    { wch: 18 }, // Bill No
    { wch: 30 }, // Name
    { wch: 20 }  // Star
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Time Slot Report');

  /* ===============================
     SAVE FILE
  =============================== */

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(
    blob,
    `Time_Slot_Report_${this.fromDate}_to_${this.toDate}.xlsx`
  );
}
}
