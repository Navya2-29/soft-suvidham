import { SpinnerComponent } from './../../../shared/component/spinner/spinner.component';
import { Component, HostListener } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReportData } from '../../../models/poornam-report';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../../services/master/master.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
@Component({
  selector: 'app-report-dailystmt',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    TranslateModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    SpinnerComponent,
    MatIconModule
  ],
  templateUrl: './report-dailystmt.component.html',
  styleUrls: [
    './report-dailystmt.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportDailystmtComponent {
  data: ReportData[] = [];
  filteredData: ReportData[] = [];
  groupedData: { [key: string]: ReportData[] } = {};
  nakshatham: any[];
  lang: string | null;
  fromDate: string;
  toDate: string;
  templeName: string | null;
  templeAddress: string | null;
  loading: boolean;
  searchText: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  isPrinting: boolean = false;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  columns: { [key: string]: boolean } = {
    billDate: true,
    billNo: true,
    vazhiDate: true,
    vazhipad: true,
    name: true,
    star: true,
    qty: true,
    rate: true,
    amount: true,
    trnsMode: true,
  };

  columnList = [
    { key: 'billDate', label: 'Bill Date' },
    { key: 'billNo', label: 'Bill No' },
    { key: 'vazhiDate', label: 'Vazhipad Date' },
    { key: 'vazhipad', label: 'Vazhipad' },
    { key: 'name', label: 'Name' },
    { key: 'star', label: 'Star' },
    { key: 'qty', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
    { key: 'trnsMode', label: 'Transaction Mode' },
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showColumnDropdown) {
      const target = event.target as HTMLElement;
      if (!target.closest('.column-picker-wrapper')) {
        this.showColumnDropdown = false;
      }
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
  }

  toggleColumn(key: string): void {
    this.columns[key] = !this.columns[key];
  }

  getPaginatedEntries(entries: any[]): any[] {
    if (!entries || entries.length === 0) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return entries.slice(start, start + this.pageSize);
  }

  getTotalPages(entries: any[]): number {
    if (!entries || entries.length === 0) return 1;
    return Math.ceil(entries.length / this.pageSize) || 1;
  }

  getPages(entries: any[]): number[] {
    const total = this.getTotalPages(entries);
    const current = this.currentPage;
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

  goToPage(page: number): void {
    this.currentPage = page;
  }

  nextPage(entries: any[]): void {
    if (this.currentPage < this.getTotalPages(entries)) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onPageSizeChange(size: any): void {
    this.pageSize = Number(size) || 10;
    this.currentPage = 1;
  }

  getRangeStart(entries: any[]): number {
    if (!entries || entries.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getRangeEnd(entries: any[]): number {
    if (!entries || entries.length === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, entries.length);
  }

  getLeadingColspan(): number {
    let count = 0;
    if (this.columns['billDate']) count++;
    if (this.columns['billNo']) count++;
    if (this.columns['vazhiDate']) count++;
    if (this.columns['vazhipad']) count++;
    if (this.columns['name']) count++;
    if (this.columns['star']) count++;
    if (this.columns['qty']) count++;
    if (this.columns['rate']) count++;
    return Math.max(1, count);
  }

  constructor(
    private route: ActivatedRoute,
    private ts: TranslateService,
    private masterService: MasterService,
    private service: ReportService,
    private router: Router,
    private reportPrintservice: PrintreportService
  ) {
    this.loadStarData();
    this.lang = localStorage.getItem('Language');
    this.templeName =
      localStorage.getItem('TempleName') || '';
    this.templeAddress =
      localStorage.getItem('Address') || '';
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
      Type: type,
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);

        this.data = data;
        this.loading = false;
        this.filteredData = this.data;
        this.sortDataByBillDate();
        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }
  sortDataByBillDate() {
    this.filteredData.sort((a: any, b: any) => {
      // Parse BillDate (format: dd.mm.yyyy)
      const [aDay, aMonth, aYear] = a.BillDate.split('.').map(Number);
      const [bDay, bMonth, bYear] = b.BillDate.split('.').map(Number);

      const aDate = new Date(aYear, aMonth - 1, aDay);
      const bDate = new Date(bYear, bMonth - 1, bDay);

      // Compare dates first
      if (aDate < bDate) return -1;
      if (aDate > bDate) return 1;

      // If dates are equal, compare BillNo
      const [aMain, aSub] = a.BillNo.split('/').map(Number);
      const [bMain, bSub] = b.BillNo.split('/').map(Number);

      if (aMain !== bMain) return aMain - bMain;
      return aSub - bSub;
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

  getGrandTotal(): number {
    return this.filteredData
      .filter((item) => item.TrnsMode !== 'CR' && item.TrnStatus == 'S'  ) // exclude 'CR' entries
      .reduce((total, item) => total + item.Amount, 0);
  }

  isRedText(item: any): boolean {
    return item.TrnsMode === 'CR' || item.TrnStatus === 'C' || item.TrnStatus === 'F' || item.TrnStatus === 'N';
  }

  generatePDF() {
    this.isPrinting = true;
    setTimeout(() => {
      this.reportPrintservice.generatePDF();
      this.isPrinting = false;
    }, 50);
  }


  getStarbyId(id: string) {
    if (this.lang == 'en') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_NameEng : '';
    } else if (this.lang == 'ml') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_Name : '';
    }
  }

  loadStarData(): void {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterService.getStarData(payLoad).subscribe({
      next: (data: any[]) => {
        this.nakshatham = data;
      },
      error: (err) => {
        console.error('Error loading star data:', err);
      },
    });
  }

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        if (this.lang == 'en') {
          return 'BANK';
        } else {
          return 'ബാങ്ക്';
        }

      case 'CS':
        if (this.lang == 'en') {
          return 'CASH';
        } else {
          return 'ക്യാഷ്';
        }
      case 'MO':
        if (this.lang == 'en') {
          return 'MONEY ORDER';
        } else {
          return 'മണി ഓർഡർ';
        }
      case 'UP':
        if (this.lang == 'en') {
          return 'UPI';
        } else {
          return 'യുപിഐ';
        }

      case 'CH':
        if (this.lang == 'en') {
          return 'CHEQUE';
        } else {
          return 'ചെക്ക്';
        }
      case 'CR':
        if (this.lang == 'en') {
          return 'CREDIT';
        } else {
          return 'ക്രെഡിറ്റ്';
        }
      case 'DE':
        if (this.lang == 'en') {
          return 'DEBIT';
        } else {
          return 'ഡെബിറ്റ്';
        }
      case 'EN':
        if (this.lang == 'en') {
          return 'ENDOWMENT';
        } else {
          return 'എൻഡോമെന്റ്';
        }
      case 'OL':
        if (this.lang == 'en') {
          return 'Online';
        } else {
          return 'ഓൺലൈൻ';
        }
      default:
        return 'OTHERS';
    }
  }

  gettransactionstatus(status: string) {
    switch (status) {
      case 'C':
        if (this.lang == 'en') {
          return 'cancelled';
        } else {
          return 'ക്യാൻസെൽഡ്';
        }

      case 'S':
        if (this.lang == 'en') {
          return '';
        } else {
          return '';
        }
        case 'F':
        if (this.lang == 'en') {
          return 'Failed';
        } else {
          return '';
        }
        case 'N':
        if (this.lang == 'en') {
          return 'Pending';
        } else {
          return '';
        }

      default:
        return '';
    }
  }
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchText = value;
    this.currentPage = 1;

    this.filteredData = this.data.filter((item) =>
      (
        item.BillDate +
        ' ' +
        item.BillNo +
        ' ' +
        item.VazhiDate +
        ' ' +
        item.Type +
        '' +
        item.Vazhipad +
        ' ' +
        item.Name +
        ' ' +
        item.Star +
        ' ' +
        item.Qty +
        ' ' +
        item.MobileNo +
        '' +
        item.Address1 +
        '' +
        item.Rate +
        item.Address2 +
        ''
      )
        .toLowerCase()
        .includes(this.searchText)
    );
    this.sortDataByBillDate();
  }
 exportToExcel(): void {

  const workbook = XLSX.utils.book_new();

  const sheetData: any[][] = [];

  // Header
  sheetData.push([this.templeName]);
  sheetData.push([this.templeAddress]);
  sheetData.push(['DAILY STATEMENT (DETAILED) REPORT']);
  sheetData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  sheetData.push([]);

  // Table Header
  sheetData.push([
    'Sl No',
    'Bill Date',
    'Bill No',
    'Vazhipad Date',
    'Vazhipad',
    'Name',
    'Star',
    'Qty',
    'Rate',
    'Amount',
    'Transaction',
    'Status'
  ]);

  // Table Rows
  this.data.forEach((item: any, index: number) => {
    sheetData.push([
      index + 1,
      item.BillDate,
      item.BillNo,
      item.VazhiDate,
      item.Vazhipad,
      item.Name,
      this.getStarbyId(item.Star),
      item.Qty,
      item.Rate,
      item.Amount,
      this.getTransactionType(item.TrnsMode),
      this.gettransactionstatus(item.TrnStatus)
    ]);
  });

  // Grand Total
  sheetData.push([]);
  sheetData.push([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Grand Total',
    this.getGrandTotal(),
    '',
    ''
  ]);

  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Merge Header Rows
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 11 } }
  ];

  // Column Width
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 25 },
    { wch: 25 },
    { wch: 15 },
    { wch: 8 },
    { wch: 12 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Statement');

  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const fileData: Blob = new Blob(
    [excelBuffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    }
  );

  FileSaver.saveAs(
    fileData,
    `Daily_Detailed_Statement_${new Date().getTime()}.xlsx`
  );
}
}
