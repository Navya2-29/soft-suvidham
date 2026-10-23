import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';

import { ReportData } from '../../../models/poornam-report';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-checquestmnt',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    TranslateModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    SpinnerComponent,
    MatIconModule
  ],
  templateUrl: './report-checquestmnt.component.html',
  styleUrls: [
    './report-checquestmnt.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportChecquestmntComponent implements OnInit {
  displayedColumns: string[] = [
    'BillNo',
    'Bank Name',
    'Vazhipad',
    'Cheq Date',
    'ChqueNo',
    'Amount',
  ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 50, 100, 200, 300, 500, 1000];
  pageIndex = 0;
  data: ReportData[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  filteredData: ReportData[] = [];
  fromDate: string;
  toDate: string;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  filteredFeecollection: any[] = [];
  loading: boolean;
  isPrinting: boolean = false;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  openTableDropdownKey: string | null = null;
  columns: { [key: string]: boolean } = {
    billNo: true,
    billDate: true,
    bank: true,
    cheqDate: true,
    cheqNo: true,
    counter: true,
    vazhipad: true,
    name: true,
    amount: true,
  };
  tableColumns: { [tableKey: string]: { [key: string]: boolean } } = {};

  columnList = [
    { key: 'billNo', label: 'Bill No' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'bank', label: 'Bank Name' },
    { key: 'cheqDate', label: 'Cheque Date' },
    { key: 'cheqNo', label: 'Cheque No' },
    { key: 'counter', label: 'Counter' },
    { key: 'vazhipad', label: 'Vazhipad' },
    { key: 'name', label: 'Name' },
    { key: 'amount', label: 'Amount' },
  ];

  // Pagination State per table key
  paginationState: { [key: string]: { currentPage: number; pageSize: number } } = {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.common-column-picker') && !target.closest('.column-menu-dropdown')) {
      this.showColumnDropdown = false;
    }
    if (!target.closest('.cheque-table-column-picker') && !target.closest('.cheque-dropdown-panel')) {
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
    const leadingKeys = ['billNo', 'billDate', 'bank', 'cheqDate', 'cheqNo', 'counter', 'vazhipad', 'name'];
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
    private service: ReportService,
    private router: Router,
    private http: HttpClient,
        private reportPrintservice:PrintreportService,
     

  ) {
    this.lang = localStorage.getItem('Language');
    this.templeName =
      localStorage.getItem('TempleName') || 'Default Temple Name';
    this.templeAddress =
      localStorage.getItem('Address') || 'Default Temple Address';
    // this.lang = localStorage.getItem('Language');
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
      this.fetchFeecollectionReportData(type,this. fromDate, this.toDate);

    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'Cheque',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
         this.data = this.data.sort((a: any, b: any) =>
        a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
        );
        this.filteredData = this.data.filter((item) => item.TrnsMode === 'CH');
        if (this.paginationState['vazhipad']) {
          this.paginationState['vazhipad'].currentPage = 1;
        }
        
        //    this.filteredData = this.filteredData.sort((a:any, b:any) => {
        //     const [numA, denomA] = a.BillNo.split('/').map(Number);
        //     const [numB, denomB] = b.BillNo.split('/').map(Number);

        //     // Compare the two parts: first compare the numerator, then the denominator
        //     return numA - numB || denomA - denomB;
        // });
        // console.log(this.filteredData, 'aaaaaaaaaaaaaaaaaaa');

        // this.dataSource.data = this.filteredData;
        // console.log(this.dataSource.data);
        // this.length = this.filteredData.length;
        // this.dataSource.paginator = this.paginator;

        // console.log(this.filteredData);
        this.loading=false;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  
  fetchFeecollectionReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'FeeCollectRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
       
        // this.data=data;
         this.filteredFeecollection = data.filter((item:any) => item.TrnMode === 'CH');   
         if (this.paginationState['feeCollection']) {
           this.paginationState['feeCollection'].currentPage = 1;
         }
      //    this.filteredData = this.filteredData.sort((a:any, b:any) => {
      //     const [numA, denomA] = a.BillNo.split('/').map(Number);
      //     const [numB, denomB] = b.BillNo.split('/').map(Number);
          
      //     // Compare the two parts: first compare the numerator, then the denominator
      //     return numA - numB || denomA - denomB;
      // });
      // console.log(this.filteredData,"aaaaaaaaaaaaaaaaaaa")  

      //   this.dataSource.data = this.filteredData
      //   console.log( this.dataSource.data)
      //   this.length =this.filteredData .length; 
      //   this.dataSource.paginator = this.paginator;
        
      //   console.log(this.filteredData);
      console.log('Fetched report data fee collect:', this.filteredFeecollection);
      this.loading=false;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }



  getTotalAmount(): number {
    const items = this.isPrinting ? this.filteredData : this.getPaginatedEntries('vazhipad', this.filteredData);
    return items.reduce((sum, item) => sum + (item.Amount || 0), 0);
  }

  getAllTotalAmount(): number {
    return this.filteredData.reduce((sum, item) => sum + (item.Amount || 0), 0);
  }

  getFeecollectionTotalAmount(): number {
    const items = this.isPrinting
      ? this.filteredFeecollection
      : this.getPaginatedEntries('feeCollection', this.filteredFeecollection);
    return items.reduce((sum, item) => sum + (item.Amount || 0), 0);
  }

  getAllFeecollectionTotalAmount(): number {
    return this.filteredFeecollection.reduce((sum, item) => sum + (item.Amount || 0), 0);
  }

  getTotalRecordsCount(): number {
    return (
      (this.filteredData ? this.filteredData.length : 0) +
      (this.filteredFeecollection ? this.filteredFeecollection.length : 0)
    );
  }

  hasAnyData(): boolean {
    return this.getTotalRecordsCount() > 0;
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

  // Helper method to format date as dd-mm-yyyy
  formatDate(dateString: string | undefined): string {
    if (!dateString) return ''; // Return empty string if undefined or empty string
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2); // Ensure two digits
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Ensure two digits
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
  const excelData: any[] = [];

  // ==========================================
  // HEADER
  // ==========================================
  excelData.push([this.templeName]);
  excelData.push([this.templeAddress]);
  excelData.push(['CHEQUE STATEMENT']);
  excelData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelData.push([]);

  // =====================================================
  // 1. VAZHIPAD COLLECTION
  // =====================================================
  if (this.filteredData.length > 0) {
    excelData.push(['VAZHIPAD']);
    excelData.push([
      'Bill No',
      'Bill Date',
      'Bank',
      'Cheque Date',
      'Cheque No',
      'Counter',
      'Vazhipad',
      'Name',
      'Amount'
    ]);

    this.filteredData.forEach((item: any) => {
      excelData.push([
        item.BillNo,
        item.BillDate,
        item.InstBank,
        item.InstDate,
        item.InstNo,
        `${item.CounterId} (${item.UName})`,
        item.Vazhipad,
        item.Name,
        item.Amount
      ]);
    });

    excelData.push([
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'Total',
      this.getAllTotalAmount()
    ]);

    excelData.push([]);
  }

  // =====================================================
  // 2. FEE COLLECTION
  // =====================================================
  if (this.filteredFeecollection.length > 0) {
    excelData.push(['FEE COLLECTION']);
    excelData.push([
      'Bill No',
      'Bill Date',
      'Bank',
      'Cheque Date',
      'Cheque No',
      'Counter',
      'Item',
      'Name',
      'Amount'
    ]);

    this.filteredFeecollection.forEach((item: any) => {
      excelData.push([
        item.BillNo,
        item.BillDate,
        item.InstBank,
        this.formatDateToDDMMYYYY(item.InstDate),
        item.InstNo,
        `${item.CounterId} (${item.UName})`,
        `${this.lang == 'en' ? item.NM_Name : item.NM_RName} (${item.Month})`,
        item.Name,
        item.Amount
      ]);
    });

    excelData.push([
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'Total',
      this.getAllFeecollectionTotalAmount()
    ]);

    excelData.push([]);
  }

  // =====================================================
  // GRAND TOTAL
  // =====================================================
  excelData.push([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Grand Total',
    this.getAllTotalAmount() + this.getAllFeecollectionTotalAmount()
  ]);

  // =====================================================
  // CREATE SHEET
  // =====================================================
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  worksheet['!cols'] = [
    { wch: 12 }, // Bill No
    { wch: 15 }, // Bill Date
    { wch: 20 }, // Bank
    { wch: 15 }, // Cheque Date
    { wch: 15 }, // Cheque No
    { wch: 18 }, // Counter
    { wch: 30 }, // Vazhipad
    { wch: 25 }, // Name
    { wch: 15 }  // Amount
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cheque Statement');

  // =====================================================
  // DOWNLOAD FILE
  // =====================================================
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
    `Cheque_Statement_${new Date().getTime()}.xlsx`
  );
}
}
