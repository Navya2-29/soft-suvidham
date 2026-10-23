import { Component, OnInit, HostListener } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { ReportDailyStmt } from '../../../models/dailytrasaction.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-donation-report',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    TranslateModule,
    MatInputModule,
    MatIconModule,
    SpinnerComponent
  ],
  templateUrl: './donation-report.component.html',
  styleUrls: ['./donation-report.component.css', '/src/assets/styles/report.style.css'],
})
export class DonationReportComponent implements OnInit {
  displayedColumns: string[] = [
    'BillNo',
    'BillDate',
    'Counter',
    'Vazhipad',
    'Name',
    'Star',
    'Qty',
    'Rate',
    'Amount',
    'VazhiDate',
    'TrnsMode',
  ];
  dataSource = new MatTableDataSource<ReportDailyStmt>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100, 200, 300, 500];
  pageIndex = 0;
  data: ReportDailyStmt[] = [];
  filteredData: any[] = [];
  groupedData: any[] = [];
  fromDate: string;
  toDate: string;
  loading: boolean = false;
  currentDate: string = '';
  counterId: string | null;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  isPrinting: boolean = false;
  searchText: string = '';

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  columns: { [key: string]: boolean } = {
    billDate: true,
    billNo: true,
    vazhipad: true,
    prathista: true,
    name: true,
    rate: true,
    amount: true,
  };

  columnList = [
    { key: 'billDate', label: 'Bill Date' },
    { key: 'billNo', label: 'Bill No' },
    { key: 'vazhipad', label: 'Vazhipad' },
    { key: 'prathista', label: 'Prathista' },
    { key: 'name', label: 'Name' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
  ];

  // Pagination per Table
  paginationState: { [tableKey: string]: { currentPage: number; pageSize: number } } = {};

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showColumnDropdown) {
      const target = event.target as HTMLElement;
      if (!target.closest('.column-picker-wrapper')) {
        this.showColumnDropdown = false;
      }
    }
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

  getLeadingColspan(): number {
    let count = 0;
    if (this.columns['billDate']) count++;
    if (this.columns['billNo']) count++;
    if (this.columns['vazhipad']) count++;
    if (this.columns['prathista']) count++;
    if (this.columns['name']) count++;
    if (this.columns['rate']) count++;
    if (!this.columns['amount']) count++;
    return Math.max(1, count);
  }

  // --- Pagination Methods ---
  getTableKey(vazhipad: string, transMode: string): string {
    const v = (vazhipad || 'default').replace(/\s+/g, '_');
    const t = (transMode || 'default').replace(/\s+/g, '_');
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

  // --- Search Filter ---
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchText = value;
    this.paginationState = {};

    if (!value) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter((item: any) => {
        return (
          (item.BillDate || '').toLowerCase().includes(value) ||
          (item.BillNo || '').toLowerCase().includes(value) ||
          (item.Vazhipad || '').toLowerCase().includes(value) ||
          (item.Prathista || '').toLowerCase().includes(value) ||
          (item.Name || '').toLowerCase().includes(value) ||
          (this.getTransactionType(item.TrnsMode) || '').toLowerCase().includes(value) ||
          String(item.Rate || '').includes(value) ||
          String(item.Amount || '').includes(value)
        );
      });
    }
    this.groupedData = this.groupByVazhipad(this.filteredData);
  }

  getTotalAmount(): number {
    const source = this.filteredData && this.filteredData.length > 0 ? this.filteredData : this.data;
    return source.reduce((sum, item) => sum + (item.Amount || 0), 0);
  }

  // Call API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: 'DonationRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        this.data = (data || []).sort((a: any, b: any) =>
          (a.BillNo || '').localeCompare(b.BillNo || '', undefined, { numeric: true, sensitivity: 'base' })
        );
        this.filteredData = [...this.data];
        this.groupedData = this.groupByVazhipad(this.filteredData);
        this.dataSource.data = this.data;
        this.length = this.data.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
        this.loading = false;
      },
    });
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
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        return 'Bank';
      case 'CS':
        return 'CASH';
      case 'MO':
        return 'MONEY ORDER';
      case 'UP':
        return 'UPI';
      case 'CH':
        return 'CHEQUE';
      case 'CR':
        return 'CREDIT';
      case 'DE':
        return 'DEBIT';
      default:
        return 'OTHERS';
    }
  }

  getGrandTotal(): number {
    return this.getTotalAmount();
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
    const excelData: any[] = [];

    // Header
    excelData.push({
      A: this.templeName
    });

    excelData.push({
      A: this.templeAddress
    });

    excelData.push({
      A: 'DONATION REPORT'
    });

    excelData.push({
      A:
        this.formatDateToDDMMYYYY(this.fromDate) +
        ' to ' +
        this.formatDateToDDMMYYYY(this.toDate)
    });

    excelData.push({});

    // Data Rows
    const dataToExport = this.filteredData && this.filteredData.length > 0 ? this.filteredData : this.data;
    dataToExport.forEach((item: any) => {
      excelData.push({
        BILLDATE: item.BillDate,
        BILLNO: item.BillNo,
        VAZHIPAD: item.Vazhipad,
        PRATHISTA: item.Prathista,
        NAME: item.Name,
        RATE: item.Rate,
        AMOUNT: item.Amount
      });
    });

    // Total Row
    excelData.push({
      BILLDATE: '',
      BILLNO: '',
      VAZHIPAD: '',
      PRATHISTA: '',
      NAME: '',
      RATE: 'TOTAL',
      AMOUNT: this.getTotalAmount()
    });

    // Worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData, {
      skipHeader: false
    });

    // Column Widths
    worksheet['!cols'] = [
      { wch: 16 },
      { wch: 18 },
      { wch: 28 },
      { wch: 22 },
      { wch: 28 },
      { wch: 14 },
      { wch: 16 }
    ];

    // Workbook
    const workbook: XLSX.WorkBook = {
      Sheets: { Report: worksheet },
      SheetNames: ['Report']
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob(
      [excelBuffer],
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      }
    );

    FileSaver.saveAs(
      blob,
      `Donation_Report_${this.fromDate}_to_${this.toDate}.xlsx`
    );
  }

  groupByVazhipad(data: any[]): any[] {
    const vazhipadGroups: any = {};

    data.forEach((item: any) => {
      const vazhipadKey = item.Vazhipad?.trim() || 'General';
      const transModeKey = this.getTransactionType(item.TrnsMode);

      // Level 1 → Vazhipad
      if (!vazhipadGroups[vazhipadKey]) {
        vazhipadGroups[vazhipadKey] = {
          vazhipad: vazhipadKey,
          transModes: {},
          totalAmount: 0
        };
      }

      const vazhipadGroup = vazhipadGroups[vazhipadKey];

      // Level 2 → Transaction Mode
      if (!vazhipadGroup.transModes[transModeKey]) {
        vazhipadGroup.transModes[transModeKey] = {
          transMode: transModeKey,
          items: [],
          totalAmount: 0
        };
      }

      const transGroup = vazhipadGroup.transModes[transModeKey];

      transGroup.items.push(item);
      transGroup.totalAmount += item.Amount || 0;
      vazhipadGroup.totalAmount += item.Amount || 0;
    });

    // Convert object → array
    return Object.values(vazhipadGroups).map((v: any) => ({
      ...v,
      transModes: Object.values(v.transModes)
    }));
  }
}
