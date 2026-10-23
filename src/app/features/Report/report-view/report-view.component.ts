import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { ReportData } from '../../../models/poornam-report';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-report-view',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    MatTableModule,
    MatIconModule,
    TranslateModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './report-view.component.html',
  styleUrls: ['./report-view.component.css'],
})
export class ReportViewComponent implements OnInit {
  loading: boolean = false;
  data: ReportData[] = [];

  groupedData: {
    [vtime: string]: {
      [prathista: string]: { [vazhipad: string]: ReportData[] };
    };
  } = {};
  fromDate: string = '';
  toDate: string = '';
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  isPrinting: boolean = false;
  paginationState: { [tableKey: string]: { currentPage: number; pageSize: number } } = {};

  // Column Visibility Management - Common & Per-Vazhipad
  showColumnDropdown: boolean = false;
  openVazhipadDropdownKey: string | null = null;

  // Master / Common columns
  columns: { [key: string]: boolean } = {
    sino: true,
    billNo: true,
    billDate: false,
    vazhiDate: false,
    name: true,
    star: true,
    gothram: true,
    quantity: true,
    rate: false,
    amount: false,
    address: true,
    type: true,
  };

  // Per-Vazhipad columns: keyed by `${timeKey}__${prathistaKey}__${vazhipadKey}`
  vazhipadColumns: { [tableKey: string]: { [colKey: string]: boolean } } = {};

  columnList = [
    { key: 'sino', label: 'SINO' },
    { key: 'billNo', label: 'BILL NO' },
    { key: 'billDate', label: 'BILL DATE' },
    { key: 'vazhiDate', label: 'VAZHIPAD DATE' },
    { key: 'name', label: 'NAME' },
    { key: 'star', label: 'STAR' },
    { key: 'gothram', label: 'GOTHRAM' },
    { key: 'quantity', label: 'QUANTITY' },
    { key: 'rate', label: 'RATE' },
    { key: 'amount', label: 'AMOUNT' },
    { key: 'address', label: 'ADDRESS / PHONE' },
    { key: 'type', label: 'TYPE' },
  ];

  constructor(
    private route: ActivatedRoute,
    private ts: TranslateService,
    private service: ReportService,
    private router: Router,
    private reportPrintservice: PrintreportService,
  ) {
    this.lang = localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || '';
    this.templeAddress = localStorage.getItem('Address') || '';

    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      this.fromDate = params['fromDate'] || '';
      this.toDate = params['toDate'] || '';

      if (type) {
        this.fetchReportData(type, this.fromDate, this.toDate);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.showColumnDropdown && !target.closest('.common-column-picker')) {
      this.showColumnDropdown = false;
    }
    if (this.openVazhipadDropdownKey && !target.closest('.vazhipad-column-picker')) {
      this.openVazhipadDropdownKey = null;
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
      this.openVazhipadDropdownKey = null;
    }
  }

  // Common Column Toggle: Updates master and propagates to ALL vazhipads
  toggleColumn(key: string): void {
    this.columns[key] = !this.columns[key];
    const updatedVal = this.columns[key];

    // Propagate to all initialized vazhipad tables
    Object.keys(this.vazhipadColumns).forEach((tKey) => {
      if (this.vazhipadColumns[tKey]) {
        this.vazhipadColumns[tKey][key] = updatedVal;
      }
    });
  }

  // Table Key Generator
  getTableKey(timeKey: any, prathistaKey: any, vazhipadKey: any): string {
    return `${timeKey}__${prathistaKey}__${vazhipadKey}`;
  }

  // Get specific column visibility for a vazhipad
  getColumnsForVazhipad(tableKey: string): { [key: string]: boolean } {
    if (!this.vazhipadColumns[tableKey]) {
      this.vazhipadColumns[tableKey] = { ...this.columns };
    }
    return this.vazhipadColumns[tableKey];
  }

  // Check if a specific column is visible for a vazhipad
  isColumnVisible(tableKey: string, colKey: string): boolean {
    const cols = this.getColumnsForVazhipad(tableKey);
    return cols[colKey] ?? false;
  }

  // Count visible columns for a specific vazhipad
  getVazhipadVisibleColumnCount(tableKey: string): number {
    const cols = this.getColumnsForVazhipad(tableKey);
    return Object.values(cols).filter(Boolean).length;
  }

  // Check if a vazhipad has custom column overrides different from common
  hasVazhipadCustomOverrides(tableKey: string): boolean {
    if (!this.vazhipadColumns[tableKey]) return false;
    return this.columnList.some((col) => this.vazhipadColumns[tableKey][col.key] !== this.columns[col.key]);
  }

  // Toggle per-vazhipad dropdown
  toggleVazhipadDropdown(tableKey: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.openVazhipadDropdownKey === tableKey) {
      this.openVazhipadDropdownKey = null;
    } else {
      this.openVazhipadDropdownKey = tableKey;
      this.showColumnDropdown = false;
    }
  }

  // Separate Column Toggle for a specific vazhipad only
  toggleVazhipadColumn(tableKey: string, colKey: string, event?: Event): void {
    if (event) event.stopPropagation();
    const cols = this.getColumnsForVazhipad(tableKey);
    cols[colKey] = !cols[colKey];
  }

  // Reset a specific vazhipad's columns back to common settings
  resetVazhipadColumns(tableKey: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.vazhipadColumns[tableKey] = { ...this.columns };
  }

  // Pagination helpers
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

  getPaginatedEntries(tableKey: string, entries: ReportData[]): ReportData[] {
    if (this.isPrinting) return entries || [];
    if (!entries || entries.length === 0) return [];
    const p = this.getPagination(tableKey);
    const start = (p.currentPage - 1) * p.pageSize;
    return entries.slice(start, start + p.pageSize);
  }

  getTotalPages(tableKey: string, entries: ReportData[]): number {
    if (!entries || entries.length === 0) return 1;
    const p = this.getPagination(tableKey);
    return Math.ceil(entries.length / p.pageSize) || 1;
  }

  getPages(tableKey: string, entries: ReportData[]): number[] {
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

  nextPage(tableKey: string, entries: ReportData[]): void {
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

  getRangeStart(tableKey: string, entries: ReportData[]): number {
    if (!entries || entries.length === 0) return 0;
    const p = this.getPagination(tableKey);
    return (p.currentPage - 1) * p.pageSize + 1;
  }

  getRangeEnd(tableKey: string, entries: ReportData[]): number {
    if (!entries || entries.length === 0) return 0;
    const p = this.getPagination(tableKey);
    return Math.min(p.currentPage * p.pageSize, entries.length);
  }

  getLeadingColspan(tableKey?: string): number {
    const cols = tableKey ? this.getColumnsForVazhipad(tableKey) : this.columns;
    let count = 0;
    if (cols['sino']) count++;
    if (cols['billNo']) count++;
    if (cols['billDate']) count++;
    if (cols['vazhiDate']) count++;
    if (cols['name']) count++;
    if (cols['star']) count++;
    if (cols['gothram']) count++;
    return count > 0 ? count : 1;
  }

  getTrailingColspan(tableKey?: string): number {
    const cols = tableKey ? this.getColumnsForVazhipad(tableKey) : this.columns;
    let count = 0;
    if (cols['rate']) count++;
    if (cols['amount']) count++;
    if (cols['address']) count++;
    if (cols['type']) count++;
    return count > 0 ? count : 1;
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
        this.loading = false;
        if (!data || data.length === 0) {
          this.data = [];
          this.groupedData = {};
          return;
        } else {
          this.populateData(data);
        }
      },
      error: (error) => {
        console.error('Error fetching report data, loading preview:', error);
        this.loading = false;
      },
    });
  }

  populateData(data: ReportData[]): void {
    this.data = data;
    const groupedByVtime = this.groupByVtime(data);
    this.groupedData = this.groupByPrathistaThenVazhipad(groupedByVtime);
  }

  groupByVazhipad(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce(
      (acc, current) => {
        const key = `${current.Vazhipad}-${current.Prathista}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(current);
        return acc;
      },
      {} as { [key: string]: ReportData[] },
    );
  }

  groupByVtime(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce(
      (acc, current) => {
        const key = current.VTime;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(current);
        return acc;
      },
      {} as { [key: string]: ReportData[] },
    );
  }

  groupByPrathistaThenVazhipad(groupedByVtime: {
    [vtime: string]: ReportData[];
  }): {
    [vtime: string]: {
      [prathista: string]: { [vazhipad: string]: ReportData[] };
    };
  } {
    const result: {
      [vtime: string]: {
        [prathista: string]: { [vazhipad: string]: ReportData[] };
      };
    } = {};

    for (const vtimeKey in groupedByVtime) {
      if (groupedByVtime.hasOwnProperty(vtimeKey)) {
        const items = groupedByVtime[vtimeKey];
        result[vtimeKey] = {};

        items.forEach((item) => {
          if (!result[vtimeKey][item.Prathista]) {
            result[vtimeKey][item.Prathista] = {};
          }
          if (!result[vtimeKey][item.Prathista][item.Vazhipad]) {
            result[vtimeKey][item.Prathista][item.Vazhipad] = [];
          }
          result[vtimeKey][item.Prathista][item.Vazhipad].push(item);
        });
      }
    }

    return result;
  }

  formatDateToDDMMYYYY(date: string): string {
    if (!date) return '';
    if (date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
    }
    return date;
  }

  getTotalQty(entries: ReportData[]): number {
    if (!entries) return 0;
    return entries.reduce((sum, item) => sum + (Number(item.Qty) || 0), 0);
  }

  getTypeBadgeClass(type: string): string {
    if (!type) return 'badge-ctr';
    const t = type.toLowerCase();
    if (t === 'online' || t === 'ol' || t === 'onl') return 'badge-onl';
    return 'badge-ctr';
  }

  getTypeLabel(type: string): string {
    if (!type) return 'CTR';
    const t = type.toLowerCase();
    if (t === 'online' || t === 'ol' || t === 'onl') return 'ONL';
    if (t === 'counter' || t === 'ctr') return 'CTR';
    return type.toUpperCase();
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

  generatePDF(): void {
    this.isPrinting = true;
    setTimeout(() => {
      this.reportPrintservice.generatePDF();
      this.isPrinting = false;
    }, 50);
  }
  exportToExcel(): void {
    const workbook = XLSX.utils.book_new();
    const sheetData: any[][] = [];

    // Header
    sheetData.push([this.templeName]);
    sheetData.push([this.templeAddress]);
    sheetData.push(['POORNAM REPORT']);
    sheetData.push([
      `${this.formatDateToDDMMYYYY(this.fromDate)} - ${this.formatDateToDDMMYYYY(this.toDate)}`
    ]);
    sheetData.push([]);

    // LOOP: Time Groups
    Object.keys(this.groupedData).forEach((timeKey, i) => {
      const timeGroup = this.groupedData[timeKey];

      // Time Heading
      sheetData.push([`Time: ${this.getTimeForBill(timeKey)}`]);
      sheetData.push([]);

      // LOOP: Prathista
      Object.keys(timeGroup).forEach((prathistaKey) => {
        const prathistaGroup = timeGroup[prathistaKey];

        sheetData.push([`Prathista: ${prathistaKey}`]);
        sheetData.push([]);

        // LOOP: Vazhipad
        Object.keys(prathistaGroup).forEach((vazhipadKey) => {
          const vazhipadGroup = prathistaGroup[vazhipadKey];
          const tableKey = this.getTableKey(timeKey, prathistaKey, vazhipadKey);
          const cols = this.getColumnsForVazhipad(tableKey);

          sheetData.push([`Vazhipad: ${vazhipadKey}`]);

          // Table Header
          const rowHeader: string[] = [];
          if (cols['sino']) rowHeader.push('Sl No');
          if (cols['billNo']) rowHeader.push('Bill No');
          if (cols['billDate']) rowHeader.push('Bill Date');
          if (cols['vazhiDate']) rowHeader.push('Vazhipad Date');
          if (cols['name']) rowHeader.push('Name');
          if (cols['star']) rowHeader.push('Star');
          if (cols['gothram']) rowHeader.push('Gothram');
          if (cols['quantity']) rowHeader.push('Qty');
          if (cols['rate']) rowHeader.push('Rate');
          if (cols['amount']) rowHeader.push('Amount');
          if (cols['address']) rowHeader.push('Address');
          if (cols['type']) rowHeader.push('Type');
          sheetData.push(rowHeader);

          // Table Rows
          vazhipadGroup.forEach((entry: any, index: number) => {
            const row: any[] = [];
            if (cols['sino']) row.push(index + 1);
            if (cols['billNo']) row.push(entry.BillNo || '');
            if (cols['billDate']) row.push(this.formatDate(entry.BillDate));
            if (cols['vazhiDate']) row.push(this.formatDate(entry.VazhiDate));
            if (cols['name']) row.push([entry.Name, entry.Name2, entry.Name3].filter(Boolean).join(', '));
            if (cols['star']) row.push([entry.Star, entry.Star2, entry.Star3].filter(Boolean).join(', '));
            if (cols['gothram']) row.push(entry.Address3 || '');
            if (cols['quantity']) row.push(entry.Qty || 0);
            if (cols['rate']) row.push(entry.Rate || 0);
            if (cols['amount']) row.push(entry.Amount || 0);
            if (cols['address']) row.push([entry.Address1, entry.Address2, entry.MobileNo].filter(Boolean).join(' '));
            if (cols['type']) row.push(entry.Type === 'Counter' ? 'CTR' : entry.Type === 'Online' ? 'OL' : (entry.Type || ''));
            sheetData.push(row);
          });

          sheetData.push([]); // space after each vazhipad
        });

        sheetData.push([]); // space after each prathista
      });

      sheetData.push([]); // space after each time group
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Poornam Report');

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const fileData: Blob = new Blob([excelBuffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    saveAs(fileData, `Poornam_Report_${new Date().getTime()}.xlsx`);
  }
  downloadExcel(data: any[]): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Poornam Report': worksheet },
      SheetNames: ['Poornam Report'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob: Blob = new Blob([excelBuffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    saveAs(blob, `Poornam_Report_${new Date()}.xlsx`);
  }
  formatDate(date: string): string {
    if (!date) return '';

    const d = new Date(date); // converts ISO date properly

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
