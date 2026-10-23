import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import { ReportData } from '../../../models/poornam-report'
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MasterService } from '../../../services/master/master.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
interface ConsolidatedData {
  Vazhipad: string;
  TotalQty: number;
}

@Component({
  selector: 'app-report-prathista-all',
  standalone: true,
  imports: [CommonModule,
    SpinnerComponent,
    HeaderComponent, TranslateModule, MatTooltipModule, MatFormFieldModule, MatInputModule,MatIconModule],
  templateUrl: './report-prathista-all.component.html',
  styleUrls: ['./report-prathista-all.component.css', '/src/assets/styles/report.style.css']
})
export class ReportPrathistaAllComponent {
  data: ReportData[] = [];
  groupedData: any[] = [];
  loading: boolean;
  fromDate: string;
  toDate: string;
  prathista: string;
  vazhipad: string;
  pmaster: any[] = [];
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  isPrinting: boolean = false;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  openTableDropdownKey: string | null = null;
  columns: { [key: string]: boolean } = {
    sino: true,
    billNo: true,
    billDate: true,
    vazhiDate: true,
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
    { key: 'vazhiDate', label: 'Vazhipad Date' },
    { key: 'name', label: 'Name' },
    { key: 'star', label: 'Star' },
    { key: 'qty', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
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
    if (!target.closest('.prathista-table-column-picker') && !target.closest('.prathista-dropdown-panel')) {
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

  getTableKey(pId: any, vKey: any): string {
    return `${pId}_${vKey}`;
  }

  getLeadingColspan(tableKey: string): number {
    let count = 0;
    const leadingKeys = ['sino', 'billNo', 'billDate', 'vazhiDate', 'name', 'star', 'qty', 'rate'];
    for (const k of leadingKeys) {
      if (this.isColumnVisible(tableKey, k)) {
        count++;
      }
    }
    return count > 0 ? count : 1;
  }

  getItemIndex(tableKey: string, index: number): number {
    if (this.isPrinting) return index + 1;
    const pg = this.getPagination(tableKey);
    return (pg.currentPage - 1) * pg.pageSize + index + 1;
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
    return this.data ? this.data.length : 0;
  }

  hasAnyData(): boolean {
    return this.getTotalRecordsCount() > 0;
  }

  getPaginatedTotal(tableKey: string, rows: any[]): number {
    if (!rows || rows.length === 0) return 0;
    const items = this.isPrinting ? rows : this.getPaginatedEntries(tableKey, rows);
    return items.reduce((sum: number, item: any) => sum + Number(item.Amount || 0), 0);
  }

  getOverallTotal(rows: any[]): number {
    if (!rows || rows.length === 0) return 0;
    return rows.reduce((sum: number, item: any) => sum + Number(item.Amount || 0), 0);
  }

  constructor(private route: ActivatedRoute, private ts: TranslateService,
    private reportPrintservice: PrintreportService, private masterService: MasterService
    ,
    private service: ReportService, private router: Router) {

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
      this.prathista = params['prathista'];
      this.vazhipad = params['Vazhipad'];
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.fetchReportData(this.fromDate, this.toDate);
    });
    this.getPrathistaList()
  }
  getPrathistaNameByCode(id: string): string {
    const prathista = this.pmaster.find(
      (item: any) => item.PM_ID == id
    );
    if (!prathista) {
      return '';
    }
    return prathista.PM_Name;
  }


  // Call your API service to get the report data
  fetchReportData(fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: "PrethistaAll",
      FromDate: fromDate,
      ToDate: toDate,
      PMId: "",
      VazhId: ""
    };
    console.log(payLoad, "ppp")
    this.service.getVazhipadWiseReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;

        // this.consolidateData()
        this.groupedData = this.groupByPrathistaAndVazhipad(data);
        this.loading = false;

        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }


  groupByPrathistaAndVazhipad(data: ReportData[]): any[] {

    const result: any = {};

    data.forEach((item) => {

      /* Use PMID as main grouping key */
      const pmId = item.PMId;

      /* Show Malayalam / Name in report heading */
      const prathistaName =
        item.Prathista?.trim() ||
        this.getPrathistaNameByCode(String(pmId)) ||
        'Unknown';

      const vazhipad =
        item.Vazhipad?.trim() || 'Unknown';

      const amount = Number(item.Amount || 0);

      /* Create Prathista Group */
      if (!result[pmId]) {
        result[pmId] = {
          PMId: pmId,
          prathista: prathistaName,
          total: 0,
          vazhipads: {}
        };
      }

      /* Create Vazhipad Group */
      if (!result[pmId].vazhipads[vazhipad]) {
        result[pmId].vazhipads[vazhipad] = {
          vazhipad: vazhipad,
          total: 0,
          rows: []
        };
      }

      /* Push Rows */
      result[pmId].vazhipads[vazhipad].rows.push(item);

      /* Totals */
      result[pmId].vazhipads[vazhipad].total += amount;
      result[pmId].total += amount;

    });

    return Object.values(result);
  }

  getTotalAmounts(entries: ReportData[]): number {
    return entries.reduce((total, entry) => total + (entry.Amount || 0), 0);
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
    return `${day}/${month}/${year}`;
  }



  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
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


  generatePDFs() {
    const element = document.getElementById('print-section');

    if (!element) {
      console.error("Element not found");
      return;
    }

    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
      pdf.save('Poornam_Report.pdf');
    }).catch(error => {
      console.error("Error generating PDF:", error);
    });
  }

  getPrathistaList() {
    this.masterService.getPmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.pmaster = data;
          console.log(this.pmaster, "prathista");
        }
      },
      error: (error) => {
        console.log(error);
        // this.loading = true;
      },
    });
  }
  exportToExcel(): void {

    const workbook = XLSX.utils.book_new();
    const excelData: any[] = [];

    /* ================= HEADER ================= */
    excelData.push([this.templeName]);
    excelData.push([this.templeAddress]);
    excelData.push(['PRATHISTAWISE REPORT']);
    excelData.push([
      `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
    ]);
    excelData.push([]);

    /* ================= DATA ================= */
    this.groupedData.forEach((p: any) => {

      // PRATHISTA NAME
      excelData.push([p.prathista]);
      excelData.push([]);

      Object.keys(p.vazhipads).forEach((key) => {

        const v = p.vazhipads[key];

        // VAZHIPAD NAME
        excelData.push([v.vazhipad]);

        // TABLE HEADER
        excelData.push([
          'SINO',
          'BILL NO',
          'BILL DATE',
          'VAZHIPAD DATE',
          'NAME',
          'STAR',
          'QTY',
          'RATE',
          'AMOUNT'
        ]);

        // ROW DATA
        v.rows.forEach((row: any, index: number) => {
          excelData.push([
            index + 1,
            row.BillNo,
            row.BillDate,
            row.VazhiDate,
            row.Name,
            row.Star,
            row.Qty,
            Number(row.Rate || 0),
            Number(row.Amount || 0)
          ]);
        });

        // VAZHIPAD TOTAL
        excelData.push([
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          'TOTAL',
          v.total
        ]);

        excelData.push([]);
      });

      // PRATHISTA TOTAL
      excelData.push([
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'PRATHISTA TOTAL',
        p.total
      ]);

      excelData.push([]);
    });

    /* ================= GRAND TOTAL ================= */
    excelData.push([
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'GRAND TOTAL',
      this.getTotalAmount()
    ]);

    /* ================= CREATE SHEET ================= */
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    /* ================= COLUMN WIDTH ================= */
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 }
    ];

    /* ================= MERGE HEADER ================= */
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prathista Report');

    /* ================= DOWNLOAD ================= */
    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    saveAs(
      new Blob([buffer]),
      `Prathista_Report_${new Date().getTime()}.xlsx`
    );
  }
}
