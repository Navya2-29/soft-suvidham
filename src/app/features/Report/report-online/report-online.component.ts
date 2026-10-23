import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
// import { jsPDF } from 'jspdf'; 
import {ReportData} from '../../../models/poornam-report'
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-report-online',
  standalone: true,
  imports: [CommonModule,MatTableModule,SpinnerComponent,MatIconModule, TranslateModule,MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,],
  templateUrl: './report-online.component.html',
  styleUrls: ['./report-online.component.css','/src/assets/styles/report.style.css'],
})
export class ReportOnlineComponent {

  displayedColumns: string[] = ['BillNo','BillDate','Vazhipad','NAME', 'STAR','QTY', 'RATE',  'Amount',   ];
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

  // Pagination State per table key
  paginationState: { [key: string]: { currentPage: number; pageSize: number } } = {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.common-column-picker') && !target.closest('.column-menu-dropdown')) {
      this.showColumnDropdown = false;
    }
    if (!target.closest('.online-table-column-picker') && !target.closest('.online-dropdown-panel')) {
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
    const leadingKeys = ['billNo', 'billDate', 'id', 'counter', 'vazhipad', 'name', 'qty', 'rate'];
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
  constructor(private route: ActivatedRoute,
        private reportPrintservice:PrintreportService,
     private ts: TranslateService, private service: ReportService,private router: Router, private http:HttpClient) {

    this.lang=localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address'; 
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      this. fromDate = params['fromDate'];
      this. toDate = params['toDate'];
      this.fetchReportData(type,this.fromDate,this.toDate);
      this.fetchNadavaravuReportData(type,this. fromDate, this.toDate);
      this.fetchCreditcollectionReportData(type,this. fromDate, this.toDate);
      this.fetchFeecollectionReportData(type,this. fromDate, this.toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'Online',
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
      // 
         this.filteredData = this.data.filter(item => item.TrnsMode === 'ON');   
         if (this.paginationState['vazhipad']) {
           this.paginationState['vazhipad'].currentPage = 1;
         }
         this.loading=false;
       console.log(this.filteredData,"aaaaaaaaaaaaaaaaaaa")  

        // this.dataSource.data = this.filteredData
        // console.log( this.dataSource.data)
        // this.length =this.filteredData .length; 
        // this.dataSource.paginator = this.paginator;
        
        console.log(this.filteredData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }


  fetchNadavaravuReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'NadavaravuRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data:any) => {
       
        // this.data=data;
         this.filteredNadavaravu = data.filter((item:any) => item.TrnMode === 'ON');   
      this.filteredNadavaravu = this.filteredNadavaravu.sort((a: any, b: any) =>
  a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
);
         console.log('Fetched report data:nadavaravu',  this.filteredNadavaravu);
        // this.length =this.filteredData .length; 
       this.loading=false;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
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
        // this.data=data;
         this.filteredCreditCollection = data.sort((a: any, b: any) =>
  a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
);
    
         this.filteredCreditCollection = data.filter((item:any) => item.TrnMode === 'ON');   
         if (this.paginationState['creditCollection']) {
           this.paginationState['creditCollection'].currentPage = 1;
         }
         console.log('Fetched report data: credit collect', this.filteredCreditCollection);
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
     
         this.filteredFeecollection = data.filter((item:any) => item.TrnMode === 'ON');   
            this.filteredFeecollection = this.filteredFeecollection.sort((a: any, b: any) =>
  a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
);

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

  getTotalAmount(): number {
    const items = this.isPrinting ? this.data : this.getPaginatedEntries('vazhipad', this.data);
    return items.reduce((sum, item) => sum + (item.Amount || 0), 0);
  }

  getAllTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + (item.Amount || 0), 0);
  }

  getNadavaravuTotalAmount(): number {
    return this.filteredNadavaravu.reduce((sum, item) => sum + (item.Receipt_Amt || 0), 0);
  }

  getCreditCollectTotalAmount(): number {
    const items = this.isPrinting
      ? this.filteredCreditCollection
      : this.getPaginatedEntries('creditCollection', this.filteredCreditCollection);
    return items.reduce((sum, item) => sum + (item.Amount || 0), 0);
  }

  getAllCreditCollectTotalAmount(): number {
    return this.filteredCreditCollection.reduce((sum, item) => sum + (item.Amount || 0), 0);
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
      (this.data ? this.data.length : 0) +
      (this.filteredCreditCollection ? this.filteredCreditCollection.length : 0) +
      (this.filteredFeecollection ? this.filteredFeecollection.length : 0)
    );
  }

  hasAnyData(): boolean {
    return this.getTotalRecordsCount() > 0;
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




//   generatePDF(): void {
//     // Filter data for entries with transmode 'ch'
//     const filteredData = this.data.filter(item => item.TrnsMode === 'ON');
  
//     const templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
//     const templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.width;
//     const pageHeight = doc.internal.pageSize.height;


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

//     const headerHeight = 35;
//     const footerHeight = 8;
//     const lineHeight = 8;
//     const tableHeaderFontSize = 11;
//     const contentFontSize = 8;
//     const currentDate = new Date().toLocaleDateString();
  
//     const maxColumnWidths = [20, 55, 40, 30, 18, 15, 15]; // Column widths for each column
//     const headers = ["BILLNO.", "VAZHIPAD", "NAME", "STAR", "ENNAM", "RATE", "TOTAL"];
  
//     let y = headerHeight;
//     let grandTotalRate = 0;
//     let grandTotalAmount = 0;
  
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
//       doc.text("Online Transaction Report", pageWidth / 2, 27, { align: "center" });
    
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
//         wrapText(doc,row.Star,maxColumnWidths[3]), 
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
   
//     // doc.save('Online_Transaction_Report.pdf');
//   }




exportToExcel(): void {
  const workbook = XLSX.utils.book_new();

  // ==========================================
  // Sheet Data Array
  // ==========================================
  const excelData: any[] = [];

  // Header
  excelData.push([this.templeName]);
  excelData.push([this.templeAddress]);
  excelData.push(['BANK REPORT']);
  excelData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelData.push([]);

  // ======================================================
  // 1. VAZHIPAD DATA
  // ======================================================
  if (this.data.length > 0) {
    excelData.push(['VAZHIPAD']);
    excelData.push([
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

    this.data.forEach((item: any) => {
      excelData.push([
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

  // ======================================================
  // 2. CREDIT COLLECTION
  // ======================================================
  if (this.filteredCreditCollection.length > 0) {
    excelData.push(['Credit Collection']);
    excelData.push([
      'Bill No',
      'Bill Date',
      'ID',
      'Counter',
      'Name',
      'Amount'
    ]);

    this.filteredCreditCollection.forEach((item: any) => {
      excelData.push([
        item.BillNo,
        item.BillDate,
        item.Remarks,
        `${item.CounterId} (${item.UName})`,
        item.Name,
        item.Amount
      ]);
    });

    excelData.push([
      '',
      '',
      '',
      '',
      'Total',
      this.getAllCreditCollectTotalAmount()
    ]);

    excelData.push([]);
  }

  // ======================================================
  // 3. FEE COLLECTION
  // ======================================================
  if (this.filteredFeecollection.length > 0) {
    excelData.push(['Fee Collection']);
    excelData.push([
      'Bill No',
      'Bill Date',
      'ID',
      'Counter',
      'Item',
      'Name',
      'Amount'
    ]);

    this.filteredFeecollection.forEach((item: any) => {
      excelData.push([
        item.BillNo,
        item.BillDate,
        item.InstNo,
        `${item.CounterId} (${item.UName})`,
        this.lang == 'en'
          ? item.NM_Name
          : item.NM_RName,
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
      'Total',
      this.getAllFeecollectionTotalAmount()
    ]);

    excelData.push([]);
  }

  // ======================================================
  // GRAND TOTAL
  // ======================================================
  excelData.push([
    '',
    '',
    '',
    '',
    '',
    'Grand Total',
    this.getAllTotalAmount()
      + this.getAllCreditCollectTotalAmount()
      + this.getAllFeecollectionTotalAmount()
  ]);

  // ==========================================
  // Create Sheet
  // ==========================================
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 25 },
    { wch: 25 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Report');

  // Save File
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
    `Bank_Report_${new Date().getTime()}.xlsx`
  );
}

}


