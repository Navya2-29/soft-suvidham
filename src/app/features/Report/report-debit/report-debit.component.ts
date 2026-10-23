import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { jsPDF } from 'jspdf'; 
import {ReportData} from '../../../models/poornam-report'
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
  selector: 'app-report-debit',
  standalone: true,
  imports: [CommonModule,SpinnerComponent,MatIconModule, MatTableModule,TranslateModule,MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,],
  templateUrl: './report-debit.component.html',
  styleUrls:[ './report-debit.component.css','/src/assets/styles/report.style.css'],
})
export class ReportDebitComponent {
  displayedColumns: string[] = ['BillNo','BillDate','Debit-ID','Vazhipad','NAME', 'STAR','QTY', 'RATE',  'Amount',   ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  filteredData:ReportData[]=[];
  fromDate:string;
  toDate:string;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  filteredNadavaravu:any[]=[];
  filteredCreditCollection:any[]=[];
  filteredFeecollection:any[]=[];
  loading:boolean;
  isPrinting: boolean = false;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  openTableDropdownKey: string | null = null;
  columns: { [key: string]: boolean } = {
    billNo: true,
    billDate: true,
    id: true,
    counter: true,
    vazhipad: true,
    name: true,
    qty: true,
    rate: true,
    amount: true,
  };
  tableColumns: { [tableKey: string]: { [key: string]: boolean } } = {};

  columnList = [
    { key: 'billNo', label: 'Bill No' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'id', label: 'ID' },
    { key: 'counter', label: 'Counter' },
    { key: 'vazhipad', label: 'Vazhipad' },
    { key: 'name', label: 'Name' },
    { key: 'qty', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
  ];

  // Pagination per Table
  paginationState: { [tableKey: string]: { currentPage: number; pageSize: number } } = {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.showColumnDropdown && !target.closest('.common-column-picker')) {
      this.showColumnDropdown = false;
    }
    if (this.openTableDropdownKey && !target.closest('.debit-table-column-picker')) {
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
    if (this.isColumnVisible(tableKey, 'billNo')) count++;
    if (this.isColumnVisible(tableKey, 'billDate')) count++;
    if (this.isColumnVisible(tableKey, 'id')) count++;
    if (this.isColumnVisible(tableKey, 'counter')) count++;
    if (this.isColumnVisible(tableKey, 'vazhipad')) count++;
    if (this.isColumnVisible(tableKey, 'name')) count++;
    if (this.isColumnVisible(tableKey, 'qty')) count++;
    if (this.isColumnVisible(tableKey, 'rate')) count++;
    if (!this.isColumnVisible(tableKey, 'amount')) count++;
    return Math.max(1, count);
  }

  // --- Pagination Methods ---
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

  getItemAmount(item: any): number {
    if (!item) return 0;
    const val = item.Amount != null && item.Amount !== '' ? item.Amount : item.Rate;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  }

  // Vazhipad Total
  getTotalAmount(): number {
    const entries = this.isPrinting ? this.filteredData : this.getPaginatedEntries('vazhipad', this.filteredData);
    return entries.reduce((sum, item) => sum + this.getItemAmount(item), 0);
  }

  getAllTotalAmount(): number {
    return this.filteredData.reduce((sum, item) => sum + this.getItemAmount(item), 0);
  }

  // Credit Collection Total
  getCreditCollectTotalAmount(): number {
    const entries = this.isPrinting ? this.filteredCreditCollection : this.getPaginatedEntries('creditCollection', this.filteredCreditCollection);
    return entries.reduce((sum, item) => sum + this.getItemAmount(item), 0);
  }

  getAllCreditCollectTotalAmount(): number {
    return this.filteredCreditCollection.reduce((sum, item) => sum + this.getItemAmount(item), 0);
  }

  // Fee Collection Total
  getFeecollectionTotalAmount(): number {
    const entries = this.isPrinting ? this.filteredFeecollection : this.getPaginatedEntries('feeCollection', this.filteredFeecollection);
    return entries.reduce((sum, item) => sum + this.getItemAmount(item), 0);
  }

  getAllFeecollectionTotalAmount(): number {
    return this.filteredFeecollection.reduce((sum, item) => sum + this.getItemAmount(item), 0);
  }

  getNadavaravuTotalAmount(): number {
    return this.filteredNadavaravu.reduce((sum, item) => sum + (Number(item.Receipt_Amt) || 0), 0);
  }

  // Overall records count & data presence
  getTotalRecordsCount(): number {
    return (this.filteredData?.length || 0) + (this.filteredCreditCollection?.length || 0) + (this.filteredFeecollection?.length || 0);
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
      this.fetchCreditcollectionReportData(type, this.fromDate, this.toDate);
      this.fetchFeecollectionReportData(type, this.fromDate, this.toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'Debit',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
        this.data = this.data.sort((a: any, b: any) =>
          a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
        );
        this.filteredData = this.data.filter(item => item.TrnsMode === 'DE'); 
        this.getPagination('vazhipad').currentPage = 1;
        this.loading=false;  
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
        this.loading=false;
      },
    });
  }


  fetchCreditcollectionReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'CreditCollect',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        data = data.sort((a: any, b: any) =>
          a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
        );
        this.filteredCreditCollection = data.filter((item:any) => item.TrnMode === 'DE');   
        console.log('Fetched report data: credit collect', this.filteredCreditCollection);
        this.getPagination('creditCollection').currentPage = 1;
        this.loading=false;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
        this.loading=false;
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
        const datas = data.sort((a: any, b: any) =>
          a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
        );
        this.filteredFeecollection = datas.filter((item:any) => item.TrnMode === 'DE'); 
        this.getPagination('feeCollection').currentPage = 1;
        this.loading=false;  
        console.log('Fetched report data fee collect:', this.filteredFeecollection);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
        this.loading=false;
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

//   generatePDF(): void {
//     // Filter data for entries with transmode 'ch'
//     const filteredData = this.data.filter(item => item.TrnsMode === 'DE');
  
//     const templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
//     const templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.width;
//     const pageHeight = doc.internal.pageSize.height;
//     const headerHeight = 35;
//     const footerHeight = 8;
//     const lineHeight = 8;
//     const tableHeaderFontSize = 11;
//     const contentFontSize = 8;
//     const currentDate = new Date().toLocaleDateString();
  
//     const maxColumnWidths = [20, 55, 40, 30, 15, 15, 15]; // Column widths for each column
//     const headers = ["Bill No.", "Vazhipad", "Name", "Debit-Id", "Ennam", "Rate", "Total"];
  
//     let y = headerHeight;
//     let grandTotalRate = 0;
//     let grandTotalAmount = 0;
//     this.http
//     .get('assets/fonts/malayalam/NotoSansMalayalam-Regular.ttf', {
//       responseType: 'arraybuffer',
//     })
//     .subscribe(
//       (fontData) => {
//         const doc = new jsPDF();

//         // Convert ArrayBuffer to Base64
//         const fontBase64 = btoa(
//           String.fromCharCode(...new Uint8Array(fontData))
//         );

//         // Add the font to jsPDF
//         doc.addFileToVFS(
//           'NotoSansMalayalam-Regular.ttf',
//           fontBase64
//         );
//         doc.addFont(
//           'NotoSansMalayalam-Regular.ttf',
//           'NotoSansMalayalam',
//           'normal'
//         );

//         // Set the custom font
//         doc.setFont('NotoSansMalayalam');
//     // Draw Header
//     const drawHeader = () => {
//       doc.setFontSize(12);
//       doc.setFont("NotoSansMalayalam", "bold");
//       doc.text(templeName, pageWidth / 2, 12, { align: "center" });
//       doc.setFont("NotoSansMalayalam", "normal");
//       doc.setFontSize(10);
//       doc.text(templeAddress, pageWidth / 2, 18, { align: "center" });
    
//       doc.setFontSize(10);
//       doc.setFont("NotoSansMalayalam", "bold");
//       doc.text("DEBIT Transaction Report", pageWidth / 2, 27, { align: "center" });
    
//       // Add current date below the report title but above the table header
//       doc.setFontSize(10);
//       doc.setFont("NotoSansMalayalam", "normal");
//       doc.text(`${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`, pageWidth / 2, 32, { align: "center" });
    
//       doc.setLineWidth(0.5);
//       doc.line(10, y, pageWidth - 10, y); // Line below header
//       y += 3; // Space below the line
//     };
  
//     // Draw Footer
//     const drawFooter = (pageNum: number) => {
//       doc.setFontSize(10);
//       doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - footerHeight / 2, { align: "center" });
//     };
  
//     // Add Table Header
//     const drawTableHeader = () => {
//       doc.setFontSize(tableHeaderFontSize);
//       doc.setFont("NotoSansMalayalam", "bold");
//       let x = 10;
//       headers.forEach((header, index) => {
//         doc.text(header, x, y + 5);
//         x += maxColumnWidths[index];
//       });
//       y += lineHeight;
//       doc.setLineWidth(0.3);
//       doc.setDrawColor(200, 200, 200); // Light gray color for grid lines
//       doc.line(10, y, pageWidth - 10, y); // Line below the table header
//       y += 2;
//     };
  
//     // Helper to Wrap Text
//     const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
//       const lines = doc.splitTextToSize(text, maxWidth);
//       return lines;
//     };
  
//     // Initialize PDF
//     drawHeader();
//     drawFooter(1);
//     drawTableHeader();
  
//     let pageNum = 1;
  
//     // Iterate over data and draw rows
//     this.filteredData.forEach((row: any) => {
//       const tableRow = [
//         row.BillNo,
//         wrapText(doc, row.Vazhipad, maxColumnWidths[1]), // Wrap Vazhipad
//         wrapText(doc, row.Name, maxColumnWidths[2]),     // Wrap Name
//         row.InstNo,
//         row.Qty,
//         row.Rate.toFixed(2),
//         row.Amount.toFixed(2),
//       ];
  
//       // Calculate the max height required for wrapped text in the row
//       const rowHeight = Math.max(...tableRow.map((cell, index) => {
//         return Array.isArray(cell) ? cell.length * contentFontSize : lineHeight;
//       }));
  
//       // Check if a new page is needed
//       if (y + rowHeight > pageHeight - footerHeight - 10) {
//         doc.addPage();
//         pageNum++;
//         y = headerHeight + 5;
//         drawHeader();
//         drawFooter(pageNum);
//         drawTableHeader();
//       }
  
//       let x = 10;
  
//       // Draw each cell with normal font
//       doc.setFont("NotoSansMalayalam", "normal");
//       doc.setFontSize(contentFontSize);
  
//       tableRow.forEach((cell, index) => {
//         if (Array.isArray(cell)) {
//           // Handle wrapped text
//           cell.forEach((line, lineIndex) => {
//             doc.text(line, x, y + 5 + (lineIndex * contentFontSize));
//           });
//         } else {
//           if (index === 5 || index === 6) {
//             // Align Rate and Total columns to the right
//             doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "right" });
//           } else {
//             // Left-align other columns
//             doc.text(String(cell), x, y + 5);
//           }
//         }
//         x += maxColumnWidths[index];
//       });
  
//       // Draw row grid lines
//       doc.setLineWidth(0.3); // Light line width for grid
//       doc.setDrawColor(200, 200, 200); // Light gray color
//       doc.line(10, y, pageWidth - 10, y); // Line at the bottom of the row
  
//       // Accumulate grand totals
//       grandTotalRate += row.Rate;
//       grandTotalAmount += row.Amount;
  
//       y += rowHeight; // Move y position for the next row
//     });
  
//     // Add Grand Total row
//     const grandTotalRow = [
//       "",
//       "Grand Total", 
//       "",
//       "", 
//       "", 
//       "", 
//       grandTotalAmount.toFixed(2)
//     ];
  
//     let x = 10;
//     doc.setFont("NotoSansMalayalam", "bold");
//     doc.setFontSize(contentFontSize +2);
//     grandTotalRow.forEach((cell, index) => {
//       if (index === 5 || index === 6) {
//         // Align Rate and Total columns to the right
//         doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "right" });
//       } else {
//         // Left-align other columns
//         doc.text(String(cell), x, y + 5);
//       }
//       x += maxColumnWidths[index];
//     });
  
//     // Draw grid line after Grand Total
//     doc.setLineWidth(0.3);
//     doc.setDrawColor(200, 200, 200);
//     doc.line(10, y, pageWidth - 10, y);
  
//     y += lineHeight; // Move y position for the Grand Total row
  
//     // Save PDF
//     const pdfBlob = doc.output('blob');
//     const pdfUrl = URL.createObjectURL(pdfBlob);
//     window.open(pdfUrl, '_blank');
//     // doc.save('vazhipad_report_with_header_footer.pdf');



//   },
//   (error:any) => {
//     console.error('Error loading font:', error);
//   }
// );

//     // doc.save('DEBIT_Transaction_Report.pdf');
//   }


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

  /* =====================================================
      SHEET 1 : VAZHIPAD
  ===================================================== */
  if (this.filteredData?.length > 0) {

    const rows: any[] = [];

    rows.push([this.templeName]);
    rows.push([this.templeAddress]);
    rows.push(['DEBIT REPORT - VAZHIPAD']);
    rows.push([
      `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
    ]);
    rows.push([]);

    rows.push([
      'Bill No',
      'Bill Date',
      'ID',
      'Counter',
      'Vazhipad',
      'Name',
      'Qty',
      'Rate',
      'Amount'
    ]);

    this.filteredData.forEach((item: any) => {
      rows.push([
        item.BillNo,
        item.BillDate,
        item.InstNo,
        `${item.CounterId} (${item.UName})`,
        item.Vazhipad,
        item.Name,
        item.Qty,
        item.Rate,
        item.Amount
      ]);
    });

    rows.push([]);
    rows.push([
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'TOTAL',
      this.getTotalAmount()
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 22 },
      { wch: 30 },
      { wch: 25 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Vazhipad');
  }


  /* =====================================================
      SHEET 2 : CREDIT COLLECTION
  ===================================================== */
  if (this.filteredCreditCollection?.length > 0) {

    const rows: any[] = [];

    rows.push([this.templeName]);
    rows.push([this.templeAddress]);
    rows.push(['DEBIT REPORT - CREDIT COLLECTION']);
    rows.push([]);

    rows.push([
      'Bill No',
      'Bill Date',
      'ID',
      'Counter',
      'Name',
      'Amount'
    ]);

    this.filteredCreditCollection.forEach((item: any) => {
      rows.push([
        item.BillNo,
        item.BillDate,
        item.Remarks,
        `${item.CounterId} (${item.UName})`,
        item.Name,
        item.Amount
      ]);
    });

    rows.push([]);
    rows.push(['', '', '', '', 'TOTAL', this.getCreditCollectTotalAmount()]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 22 },
      { wch: 30 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Credit Collection');
  }


  /* =====================================================
      SHEET 3 : FEE COLLECTION
  ===================================================== */
  if (this.filteredFeecollection?.length > 0) {

    const rows: any[] = [];

    rows.push([this.templeName]);
    rows.push([this.templeAddress]);
    rows.push(['DEBIT REPORT - FEE COLLECTION']);
    rows.push([]);

    rows.push([
      'Bill No',
      'Bill Date',
      'ID',
      'Counter',
      'Item',
      'Name',
      'Amount'
    ]);

    this.filteredFeecollection.forEach((item: any) => {
      rows.push([
        item.BillNo,
        item.BillDate,
        item.InstNo,
        `${item.CounterId} (${item.UName})`,
        `${item.NM_Name} (${item.Month})`,
        item.Name,
        item.Amount
      ]);
    });

    rows.push([]);
    rows.push(['', '', '', '', '', 'TOTAL', this.getFeecollectionTotalAmount()]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 22 },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Fee Collection');
  }


  /* =====================================================
      SHEET 4 : SUMMARY
  ===================================================== */

  const summaryRows = [
    [this.templeName],
    ['DEBIT REPORT SUMMARY'],
    [],
    ['Vazhipad Total', this.getAllTotalAmount()],
    ['Credit Collection Total', this.getAllCreditCollectTotalAmount()],
    ['Fee Collection Total', this.getAllFeecollectionTotalAmount()],
    ['Nadavaravu Total', this.getNadavaravuTotalAmount()],
    [],
    [
      'Grand Total',
      this.getAllTotalAmount()
      + this.getAllCreditCollectTotalAmount()
      + this.getAllFeecollectionTotalAmount()
      + this.getNadavaravuTotalAmount()
    ]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Summary');


  /* =====================================================
      SAVE FILE
  ===================================================== */

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
    `Debit_Report_${this.fromDate}_to_${this.toDate}.xlsx`
  );
}



}

