import { Component, ViewChild, HostListener } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeeCollection } from '../../../models/feecollection.model';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-salesitem',
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
  templateUrl: './report-salesitem.component.html',
  styleUrls: [
    './report-salesitem.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportSalesitemComponent {
  dataSource = new MatTableDataSource<FeeCollection>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 50, 100, 200, 300, 500, 1000];
  pageIndex = 0;
  data: FeeCollection[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: FeeCollection[] } = {};
  currentDate: string = '';
  currentPage: number = 1;
  fromDate: string;
  toDate: string;
  groupedDatas: { [key: string]: any[] } = {};
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  loading:boolean;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  openTableDropdownKey: string | null = null;
  columns: { [key: string]: boolean } = {
    sino: true,
    billNo: true,
    billDate: true,
    name: true,
    star: true,
    qty: true,
    rate: true,
    amount: true,
  };
  tableColumns: { [tableKey: string]: { [key: string]: boolean } } = {};

  columnList = [
    { key: 'sino', label: 'SI No' },
    { key: 'billNo', label: 'Bill No' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'name', label: 'Name' },
    { key: 'star', label: 'Star' },
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
    if (this.openTableDropdownKey && !target.closest('.salesitem-table-column-picker')) {
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
    const leadingKeys = ['sino', 'billNo', 'billDate', 'name', 'star', 'qty', 'rate'];
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
    return entries.reduce((sum: number, item: any) => sum + (Number(item.Amount) || 0), 0);
  }

  hasAnyData(): boolean {
    return (this.data && this.data.length > 0);
  }

  hasAnyGroupPaginated(): boolean {
    if (!this.groupedData) return false;
    return Object.keys(this.groupedData).some((key) => {
      const list = this.groupedData[key];
      return list && list.length > this.getPageSize(key);
    });
  }

  getCurrentPageGrandTotal(): number {
    if (this.isPrinting) return this.getTotalAmount();
    let total = 0;
    if (this.groupedData) {
      for (const key of Object.keys(this.groupedData)) {
        total += this.getGroupTotal(key, this.groupedData[key]);
      }
    }
    return total;
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

  groupDataByName(data: FeeCollection[]): { [key: string]: FeeCollection[] } {
    return data.reduce((acc: any, item: any) => {
      if (!acc[item.Vazhipad]) {
        acc[item.Vazhipad] = [];
      }
      acc[item.Vazhipad].push(item);
      return acc;
    }, {} as { [key: string]: FeeCollection[] });
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
    this.loading=true;
    const payLoad = {
      Type: 'SalesRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
         this.data  = this.data.sort((a: any, b: any) =>
        a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
        );
        // this.groupDataByTransactionMode(this.data); // Group the data
        this.paginationState = {};
        this.groupedData = this.groupDataByName(this.data);
        this.dataSource.data = this.data;
        this.loading=false;
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

  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        return 'ONLINE';
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

  getGrandTotalForTrnsMode(item: string): any {
    const items = this.groupedData[item]; 
    if (!items || items.length === 0) {
      return 0; 
    }
    const total = items.reduce((sum, item) => {
      return sum + item.Amount;
    }, 0);

    return total;
  }


  exportToExcel(): void {
    const workbook = XLSX.utils.book_new();
    const excelData: any[] = [];

    // ==========================================
    // HEADER
    // ==========================================
    if (this.templeName) excelData.push([this.templeName]);
    if (this.templeAddress) excelData.push([this.templeAddress]);
    excelData.push(['SALES ITEM REPORT']);
    excelData.push([
      `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
    ]);
    excelData.push([]);

    // ==========================================
    // GROUPED DATA
    // ==========================================
    const groups = Object.keys(this.groupedData);

    groups.forEach((groupName: string) => {
      const rows = this.groupedData[groupName];

      // Section Heading
      excelData.push([groupName]);

      // Dynamic Column Header based on visibility
      const headers: string[] = [];
      if (this.isColumnVisible(groupName, 'sino')) headers.push('SI No');
      if (this.isColumnVisible(groupName, 'billNo')) headers.push('Bill No');
      if (this.isColumnVisible(groupName, 'billDate')) headers.push('Bill Date');
      if (this.isColumnVisible(groupName, 'name')) headers.push('Name');
      if (this.isColumnVisible(groupName, 'star')) headers.push('Star');
      if (this.isColumnVisible(groupName, 'qty')) headers.push('Quantity');
      if (this.isColumnVisible(groupName, 'rate')) headers.push('Rate');
      if (this.isColumnVisible(groupName, 'amount')) headers.push('Amount');
      excelData.push(headers);

      // Rows
      rows.forEach((item: any, idx: number) => {
        const row: any[] = [];
        if (this.isColumnVisible(groupName, 'sino')) row.push(idx + 1);
        if (this.isColumnVisible(groupName, 'billNo')) row.push(item.BillNo || '');
        if (this.isColumnVisible(groupName, 'billDate')) row.push(this.formatDateToDDMMYYYY(item.BillDate));
        if (this.isColumnVisible(groupName, 'name')) row.push(item.Name || '');
        if (this.isColumnVisible(groupName, 'star')) row.push(item.Star || 'N/A');
        if (this.isColumnVisible(groupName, 'qty')) row.push(item.Qty ?? 0);
        if (this.isColumnVisible(groupName, 'rate')) row.push(item.Rate ?? 0);
        if (this.isColumnVisible(groupName, 'amount')) row.push(item.Amount ?? 0);
        excelData.push(row);
      });

      // Group Total
      if (this.isColumnVisible(groupName, 'amount')) {
        const totalRow: any[] = [];
        headers.forEach((h, index) => {
          if (h === 'Amount') {
            totalRow.push(this.getGrandTotalForTrnsMode(groupName));
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

    // ==========================================
    // GRAND TOTAL
    // ==========================================
    excelData.push(['Grand Total', this.getTotalAmount()]);

    // ==========================================
    // CREATE SHEET
    // ==========================================
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  worksheet['!cols'] = [
    { wch: 12 }, // Bill No
    { wch: 15 }, // Bill Date
    { wch: 28 }, // Name
    { wch: 15 }, // Star
    { wch: 12 }, // Qty
    { wch: 12 }, // Rate
    { wch: 15 }  // Amount
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Item Report');

  // ==========================================
  // SAVE FILE
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
    `Sales_Item_Report_${new Date().getTime()}.xlsx`
  );
}
}
