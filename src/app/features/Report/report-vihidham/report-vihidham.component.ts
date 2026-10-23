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
import { jsPDF } from 'jspdf';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NadavaravReport } from '../../../models/nadavarav.model';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report-vihidham',
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
  templateUrl: './report-vihidham.component.html',
  styleUrls: [
    './report-vihidham.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportVihidhamComponent implements OnInit {
  data: NadavaravReport[] = [];
  groupedData: { [key: string]: NadavaravReport[] } = {};
  currentDate: string = '';

  fromDate: string;
  toDate: string;
  groupedDatas: { [key: string]: any[] } = {};
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  filtereddata: any[] = [];
  loading: boolean = false;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  openTableDropdownKey: string | null = null;
  columns: { [key: string]: boolean } = {
    sino: true,
    vazhipad: true,
    qty: true,
    rate: true,
    amount: true,
  };
  tableColumns: { [tableKey: string]: { [key: string]: boolean } } = {};

  columnList = [
    { key: 'sino', label: 'SI No' },
    { key: 'vazhipad', label: 'Vazhipad' },
    { key: 'qty', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
  ];

  // Pagination per Table (Group)
  paginationState: { [tableKey: string]: { currentPage: number; pageSize: number } } = {};
  isPrinting: boolean = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.showColumnDropdown && !target.closest('.common-column-picker')) {
      this.showColumnDropdown = false;
    }
    if (this.openTableDropdownKey && !target.closest('.vihidham-table-column-picker')) {
      this.openTableDropdownKey = null;
    }
  }

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

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
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

  getLeadingColspan(tableKey: string): number {
    let count = 0;
    const leadingKeys = ['sino', 'vazhipad', 'qty', 'rate'];
    for (const k of leadingKeys) {
      if (this.isColumnVisible(tableKey, k)) {
        count++;
      }
    }
    if (!this.isColumnVisible(tableKey, 'amount')) count++;
    return Math.max(1, count);
  }

  // --- Pagination Methods ---
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

  getTotalPages(tableKey: string, entries: any[]): number {
    if (!entries || entries.length === 0) return 1;
    const p = this.getPagination(tableKey);
    return Math.ceil(entries.length / p.pageSize) || 1;
  }

  getPages(tableKey: string, entries: any[]): number[] {
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

  getGroupTotal(tableKey: string, list: any[]): number {
    const entries = this.isPrinting ? list : this.getPaginatedEntries(tableKey, list);
    return entries.reduce((sum: number, item: any) => sum + (Number(item.Qty * item.Rate) || 0), 0);
  }

  hasAnyData(): boolean {
    if (!this.groupedData) return false;
    return Object.keys(this.groupedData).some((key) => this.groupedData[key] && this.groupedData[key].length > 0);
  }

  getTotalRecordsCount(): number {
    if (!this.groupedData) return 0;
    return Object.keys(this.groupedData).reduce((sum, key) => sum + (this.groupedData[key] ? this.groupedData[key].length : 0), 0);
  }

  hasAnyGroupPaginated(): boolean {
    if (!this.groupedData) return false;
    return Object.keys(this.groupedData).some((key) => {
      const list = this.groupedData[key];
      return list && list.length > this.getPageSize(key);
    });
  }

  getCurrentPageGrandTotal(): number {
    if (this.isPrinting) return this.getOverallGrandTotal();
    let total = 0;
    if (this.groupedData) {
      for (const key of Object.keys(this.groupedData)) {
        total += this.getGroupTotal(key, this.groupedData[key]);
      }
    }
    return total;
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

  groupData() {
    this.groupedDatas = this.data.reduce((acc: any, curr: any) => {
      const { category, NM_Name, Qty, Rate } = curr;
      if (!acc[category]) {
        acc[category] = {};
      }
      if (!acc[category][NM_Name]) {
        acc[category][NM_Name] = { Qty: 0, Rate, Amount: 0 };
      }
      acc[category][NM_Name].Qty += Qty;
      acc[category][NM_Name].Amount =
        acc[category][NM_Name].Rate * acc[category][NM_Name].Qty;
      return acc;
    }, {});
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: 'VihidhamRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        this.data = data || [];

        const fromDate = new Date(this.fromDate);
        const toDate = new Date(this.toDate);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        this.filtereddata = this.data.filter((item: any) => {
          const fDate = new Date(item.FDate);
          const tDate = new Date(item.ToDate);
          fDate.setHours(0, 0, 0, 0);
          tDate.setHours(23, 59, 59, 999);
          return !(tDate < fromDate || fDate > toDate);
        });

        this.paginationState = {};
        this.groupDataByTransactionMode(this.filtereddata);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
        this.loading = false;
      },
    });
  }

  // Grouping function
  groupDataByTransactionMode(data: any[]): void {
    this.groupedData = (data || []).reduce((acc, item) => {
      const evazDate = new Date(item.Evazdate);
      const fromDate = new Date(item.FDate);
      const toDate = new Date(item.ToDate);

      if (evazDate < fromDate || evazDate > toDate) {
        return acc;
      }

      const name = item.Name || 'General';

      if (!acc[name]) {
        acc[name] = [];
      }

      const existing = acc[name].find((i: any) => i.Vazhipad === item.Vazhipad && i.Rate === item.Rate);

      if (existing) {
        existing.Qty += item.Qty;
      } else {
        acc[name].push({ ...item });
      }

      return acc;
    }, {});
  }

  goBack(): void {
    this.router.navigate(['/getReport']);

    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  }

  formatDateToDDMMYYYY(date: string): string {
    if (!date) return '';
    if (date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}-${month}-${year}`;
      }
    }
    return date;
  }

  getOverallGrandTotal(): number {
    let grandTotal = 0;
    for (const category in this.groupedData) {
      if (this.groupedData.hasOwnProperty(category)) {
        grandTotal += this.getGrandTotalForTrnsMode(category);
      }
    }
    return grandTotal;
  }

  getGrandTotalForTrnsMode(item: string): any {
    const items = this.groupedData[item];
    if (!items || items.length === 0) {
      return 0;
    }
    const total = items.reduce((sum, item) => {
      return sum + item.Qty * item.Rate;
    }, 0);

    return total;
  }

  exportToExcel(): void {
    const workbook = XLSX.utils.book_new();
    const excelData: any[] = [];

    // Header
    if (this.templeName) excelData.push([this.templeName]);
    if (this.templeAddress) excelData.push([this.templeAddress]);
    excelData.push(['VIHIDHAM REPORT']);
    excelData.push([
      `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
    ]);
    excelData.push([]);

    const categories = Object.keys(this.groupedData);

    categories.forEach((category: string) => {
      const rows = this.groupedData[category];

      // Section Title
      excelData.push([category.toUpperCase()]);

      // Dynamic Column Header
      const headers: string[] = [];
      if (this.isColumnVisible(category, 'sino')) headers.push('SI No');
      if (this.isColumnVisible(category, 'vazhipad')) headers.push('Vazhipad');
      if (this.isColumnVisible(category, 'qty')) headers.push('Quantity');
      if (this.isColumnVisible(category, 'rate')) headers.push('Rate');
      if (this.isColumnVisible(category, 'amount')) headers.push('Amount');
      excelData.push(headers);

      // Data Rows
      rows.forEach((item: any, idx: number) => {
        const row: any[] = [];
        if (this.isColumnVisible(category, 'sino')) row.push(idx + 1);
        if (this.isColumnVisible(category, 'vazhipad')) row.push(item.Vazhipad || '');
        if (this.isColumnVisible(category, 'qty')) row.push(item.Qty ?? 0);
        if (this.isColumnVisible(category, 'rate')) row.push(item.Rate ?? 0);
        if (this.isColumnVisible(category, 'amount')) row.push((item.Qty * item.Rate) ?? 0);
        excelData.push(row);
      });

      // Category Total
      if (this.isColumnVisible(category, 'amount')) {
        const totalRow: any[] = [];
        headers.forEach((h, index) => {
          if (h === 'Amount') {
            totalRow.push(this.getGrandTotalForTrnsMode(category));
          } else if (index === 0) {
            totalRow.push('Total');
          } else {
            totalRow.push('');
          }
        });
        excelData.push(totalRow);
      }

      excelData.push([]);
    });

    // Grand Total
    excelData.push(['Grand Total', this.getOverallGrandTotal()]);

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    worksheet['!cols'] = [
      { wch: 10 }, // SI No
      { wch: 35 }, // Vazhipad
      { wch: 12 }, // Qty
      { wch: 15 }, // Rate
      { wch: 18 }  // Amount
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vihidham Report');

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
      `Vihidham_Report_${new Date().getTime()}.xlsx`
    );
  }
}
