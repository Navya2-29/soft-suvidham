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
import { jsPDF } from 'jspdf';
import { ReportData } from '../../../models/poornam-report';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NadavaravReport } from '../../../models/nadavarav.model';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-nadavarav',
  standalone: true,
  imports: [CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,MatFormFieldModule, MatInputModule,TranslateModule,SpinnerComponent ,MatIconModule ],
  templateUrl: './report-nadavarav.component.html',
  styleUrls: ['./report-nadavarav.component.css','/src/assets/styles/report.style.css'],
})
export class ReportNadavaravComponent implements  OnInit {
  
  displayedColumns: string[] = ['BillNo','BillDate','NM_Name', 'Name', 'Star', 'Qty', 'ItemValue','weight', 'Receipt_Amt',  'TrnMode','Remarks' ];
  dataSource = new MatTableDataSource<NadavaravReport>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data: NadavaravReport[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: NadavaravReport[] } = {};
  currentDate: string = '';
  currentPage: number = 1;
  fromDate:string;
  toDate:string;
  loading:boolean;
  groupedDatas: { [key: string]: any[] } = {};
lang:string|null;
templeName:string|null;
templeAddress:string|null;
  isPrinting: boolean = false;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  openTableDropdownKey: string | null = null;
  columns: { [key: string]: boolean } = {
    billNo: true,
    billDate: true,
    counter: true,
    vazhipad: true,
    name: true,
    star: true,
    qty: true,
    amount: true,
  };
  tableColumns: { [tableKey: string]: { [colKey: string]: boolean } } = {};

  columnList = [
    { key: 'billNo', label: 'Bill No' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'counter', label: 'Counter' },
    { key: 'vazhipad', label: 'Vazhipad' },
    { key: 'name', label: 'Name' },
    { key: 'star', label: 'Star' },
    { key: 'qty', label: 'Quantity' },
    { key: 'amount', label: 'Amount' }
  ];

  get visibleColumnCount(): number {
    return Object.values(this.columns).filter(v => v).length;
  }

  get totalColumnCount(): number {
    return this.columnList.length;
  }

  // Pagination State per Category
  paginationState: { [key: string]: { currentPage: number; pageSize: number } } = {};
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http:HttpClient,
    private ts: TranslateService,
                private reportPrintservice:PrintreportService,
    
  ) {
this.lang=localStorage.getItem('Language');
this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');

  }

  genearatePDF(){
    this.reportPrintservice.generatePDF();
  //   const printContent = document.getElementById('print-section');
  // if (!printContent) {
  //   console.error('No content found to print');
  //   return;
  // }

  // const WindowPrt = window.open('', '', 'width=800,height=600');
  
  // // Check if the print window was successfully opened
  // if (!WindowPrt) {
  //   console.error('Unable to open print window. Please check pop-up blockers.');
  //   return;
  // }

  // WindowPrt.document.write(`
  //   <html>
  //     <head>
  //       <title>Print</title>
  //       <style>
  //         /* Add custom styles for printing if needed */
  //         table {
  //           width: 100%;
  //           border-collapse: collapse;
  //         }
  //         table, th, td {
  //           border: 1px solid black;
  //         }
  //         th, td {
  //           padding: 5px;
  //           text-align: left;
  //         }
  //       </style>
  //     </head>
  //     <body>${printContent.innerHTML}</body>
  //   </html>
  // `);

  // WindowPrt.document.close();
  // WindowPrt.focus();

  // // Make sure that the window is still valid before calling print and close
  // if (WindowPrt) {
  //   WindowPrt.print();
  //   WindowPrt.close();
  // } 
  }
  groupData() {
    this.groupedDatas = this.data.reduce((acc:any, curr:any) => {
      const { category, NM_Name, Qty, Rate } = curr;
      if (!acc[category]) {
        acc[category] = {};
      }
      if (!acc[category][NM_Name]) {
        acc[category][NM_Name] = { Qty: 0, Rate, Amount: 0 };
      }
      acc[category][NM_Name].Qty += Qty;
      acc[category][NM_Name].Amount = acc[category][NM_Name].Rate * acc[category][NM_Name].Qty;
      return acc;
    }, {});
  }



  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      this. fromDate = params['fromDate'];
      this. toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: "NadavaravuRpt",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data.sort((a: any, b: any) =>
  a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
);

        // this.data = data;
        this.paginationState = {};
        this.groupDataByTransactionMode(this.data); // Group the data
        this.loading=false;
        // this.data = data.sort((a: any, b: any) => {
        //   const [numA, denomA] = a.BillNo.split('/').map(Number);
        //   const [numB, denomB] = b.BillNo.split('/').map(Number);

        //   // Compare the two parts: first compare the numerator, then the denominator
        //   return numA - numB || denomA - denomB;
        // });
        this.dataSource.data = this.data;
        this.length = data.length;
        this.dataSource.paginator = this.paginator;

        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }


  // Grouping function
  groupDataByTransactionMode(data: any[]): void {
 // Initialize groupedData as an empty object
 this.groupedData = data.reduce((result, item) => {
  const category = item.category;

  // If category doesn't exist, initialize it as an array
  if (!result[category]) {
    result[category] = [];
  }

  // Push the item into the respective category array
  result[category].push(item);

  return result;
}, {}); 
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

  generatePDF(){
    this.isPrinting = true;
    this.reportPrintservice.generatePDF();
    setTimeout(() => {
      this.isPrinting = false;
    }, 1000);
//     const printContent = document.getElementById('print-section');
//     if (!printContent) {
//       console.error('No content found to print');
//       return;
//     }
  
//     const WindowPrt = window.open('', '', 'width=800,height=600');
    
//     // Check if the print window was successfully opened
//     if (!WindowPrt) {
//       console.error('Unable to open print window. Please check pop-up blockers.');
//       return;
//     }
  
//     WindowPrt.document.write(`
//       <html>
//         <head>
//           <title>Print</title>
//          <style>
//           .header-print h2 h3 h4 {
//           margin:0;
//           padding:0;
//            }  
//           h3,h4,h2{
//           margin-top:0px;
//           margin-botton:0px;
//           text-align:center;

//           }
//         .tabble-heading{
//   margin-top: 10px;
//   margin-bottom: 0;
//   text-transform: uppercase;
//   font-family: 'Times New Roman', Times, serif;
//   font-weight: bold;
//   text-align: left;

// }
//   .date{
//    line-height:1;
//           margin-top:0;
//   text-align:center;
//   }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//           }
//           table, th, td {
//             border: 1px solid black;
//             text-transform: uppercase;

//           }
//           th, td {
//            padding-left:5px;
//             text-align: left;
//           }
//             #print-section{
// padding-bottom: 100px;
//   }


// .number{
//     text-align: right;
//     /* font-weight: bold; */
// }
// .total{

//     text-align: right;
//     font-weight: bold;
//     font-size: 14px;
// }

// .grandtotal{
//     text-align: right;
//     font-family: 'Times New Roman', Times, serif;
//     font-weight:bolder;
//     color: red;
//     font-size: 20px;
//     margin: 10px 0;


// }


//         </style>
//         </head>
//         <body>${printContent.innerHTML}</body>
//       </html>
//     `);
  
//     WindowPrt.document.close();
//     WindowPrt.focus();
  
//     // Make sure that the window is still valid before calling print and close
//     if (WindowPrt) {
//       WindowPrt.print();
//       WindowPrt.close();
//     } 
}

  
//   generatePDF() {
//     const templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
//     const templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.width;
//     const pageHeight = doc.internal.pageSize.height;
  
//     const headerHeight = 33;
//     const footerHeight = 20;
//     const lineHeight = 8;
//     const tableHeaderFontSize = 10;
//     const contentFontSize = 8;
//     const currentDate = new Date().toLocaleDateString();

//     // Adjusted column widths for BillNo, Name, Vazhipad, Star, Ennam (Qty), Rate, and Amount
//     const maxColumnWidths = [20, 40, 35, 25, 25, 25, 25]; // BillNo, Name, Vazhipad, Star, Ennam (Qty), Rate, Amount
    
//     let y = headerHeight; // Initial Y position after header
//     let grandTotal = 0; // Initialize grand total
  
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



//     // Data grouped by TransactionMode (example grouping key)
//     const groupedData = this.data.reduce((acc, current) => {
//       const key = current.category; // Change this key if grouping by something else
//       if (!acc[key]) {
//         acc[key] = [];
//       }
//       acc[key].push(current);
//       return acc;
//     }, {} as { [key: string]: NadavaravReport[] });
  
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
//       doc.text("Nadavaravu Booking Report", pageWidth / 2, 27, { align: "center" });
//   // Add current date below the report title but above the table header
//   doc.setFontSize(10);
//   doc.setFont("NotoSansMalayalam", "normal");
//   doc.text(`${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`, pageWidth / 2, 32, { align: "center" });
//   doc.setLineWidth(0.5);
//       doc.line(10, y, pageWidth - 10, y); // Line below header
//       y += 3; // Space below the line
//     };
  
//     // Draw Footer
//     const drawFooter = (pageNum: number) => {
//       doc.setFontSize(10);
//       const footerText = `Page ${pageNum}`;
//       doc.text(footerText, pageWidth / 2, pageHeight - footerHeight / 2, { align: "center" });
//     };
  
//     // Add Table Header
//     const drawTableHeader = () => {
//       doc.setFontSize(tableHeaderFontSize);
//       doc.setFont("NotoSansMalayalam", "bold");
//       const headers = ["BillNo.", "Vazhpad", "Name", "Star", "Qty", "Price", "Amount"];
//       let x = 10;
//       headers.forEach((header, index) => {
//         doc.text(header, x, y + 5);
//         x += maxColumnWidths[index];
//       });
  
//       y += lineHeight;
//       doc.setLineWidth(0.5);
//       doc.line(10, y, pageWidth - 10, y); // Line below the header
//       y += 2; // Space below the line
//     };
  
//     // Initialize PDF
//     drawHeader();
//     drawFooter(1);
//     drawTableHeader();
  
//     let pageNum = 1;
  
//     // Render Grouped Data
//     for (const [group, entries] of Object.entries(groupedData)) {
//       // Check if enough space for group header, add page if not
//       if (y + lineHeight > pageHeight - footerHeight - 20) {
//         doc.addPage();
//         pageNum++;
//         y = headerHeight + 5; // Reset y position after new page
//         drawHeader();
//         drawFooter(pageNum);
//         drawTableHeader();
//       }
  
//       // Draw Group Header with extra spacing to avoid overlap with the table header line
//       doc.setFontSize(12);
//       doc.setFont("NotoSansMalayalam", "bold");
  
//       y += lineHeight; // Increase spacing between the group name and table header
//       doc.text(` ${group}`, 10, y);
//       y += lineHeight; // Additional space below group header
  
//       let groupTotal = 0; // Initialize group total
  
//       // Draw Entries in Table Format
//       for (const entry of entries) {
//         // Ensure Rate and Amount are numbers
//         const rate = Number(entry.ItemValue);  // Convert Rate to number
//         const amount = Number(entry.Receipt_Amt);  // Convert Amount to number
  
//         // Apply .toFixed() only after conversion to number
//         const rateFormatted = isNaN(rate) ? '0.00' : rate.toFixed(2);  // Check if Rate is a valid number
//         const amountFormatted = isNaN(amount) ? '0.00' : amount.toFixed(2);  // Check if Amount is a valid number
  
//         // Check if enough space for the row, add page if not
//         if (y + lineHeight > pageHeight - footerHeight - 10) {
//           doc.addPage();
//           pageNum++;
//           y = headerHeight + 5; // Reset y position after new page
//           drawHeader();
//           drawFooter(pageNum);
//           drawTableHeader();
//         }
  
//         doc.setFontSize(contentFontSize);
//         doc.setFont("NotoSansMalayalam", "normal");
  
//         const row = [
//           entry.BillNo,
//           this.wrapText(doc, entry.NM_Name, maxColumnWidths[1] - 5), // Wrap Name text
//           this.wrapText(doc, entry.Name, maxColumnWidths[2] - 5), // Wrap Vazhipad text
//           entry.Star,
//           entry.Qty,  // Ennam (Qty) data goes under Qty column
//           rateFormatted,  // Use formatted Rate
//           amountFormatted,  // Use formatted Amount
//         ];
//         let x = 10;
  
//         row.forEach((cell, index) => {
//           if (index === 4 || index === 5 || index === 6) {
//             // Right-align for Qty (Ennam), Rate, and Amount
//             doc.text(String(cell), x + maxColumnWidths[index] - 10, y + 5, { align: "right" });
//           } else {
//             doc.text(String(cell), x, y + 5);  // Left-align the others
//           }
//           x += maxColumnWidths[index];
//         });
  
//         groupTotal += amount; // Add to group total
//         grandTotal += amount; // Add to grand total
//         y += lineHeight;
//       }
  
//       // Draw Group Total
//       if (y + lineHeight > pageHeight - footerHeight - 10) {
//         doc.addPage();
//         pageNum++;
//         y = headerHeight + 5; // Reset y position after new page
//         drawHeader();
//         drawFooter(pageNum);
//         drawTableHeader();
//       }
  
//       // Add group total at the end
//       doc.setFontSize(12);
//       doc.setFont("NotoSansMalayalam", "bold");
//       doc.text(` Total: ${group}`, 10, y + 5); // Label for the group total
//       doc.text(groupTotal.toFixed(2), pageWidth - 20, y + 5, { align: "right" }); // Total amount aligned to the right
  
//       y += lineHeight + 5; // Add space after the total for the next group or footer
//     }
  
//     // Add Grand Total below the last Group Total
//     doc.setFontSize(12);
//     doc.setFont("NotoSansMalayalam", "bold");
//     doc.text("Grand Total:", 10, y + 5); // Label for the grand total
//     doc.text(grandTotal.toFixed(2), pageWidth - 20, y + 5, { align: "right" }); // Grand total aligned to the right
  
//     y += lineHeight + 10; // Space after the grand total
  
//     // Save PDF
//     // doc.save("Nadavaravu_Report.pdf");
//     const pdfBlob = doc.output('blob');
//     const pdfUrl = URL.createObjectURL(pdfBlob);
//     window.open(pdfUrl, '_blank');
//     // doc.save('vazhipad_report_with_header_footer.pdf');



//   },
//   (error:any) => {
//     console.error('Error loading font:', error);
//   }
// );


//   }
  


getTotalAmount(): number {
  return this.data.reduce((sum, item) => sum + item.Receipt_Amt, 0);
}
  
  // Helper function to wrap text for a given column width
  wrapText(doc: jsPDF, text: string, maxWidth: number): string {
    const words = text.split(' ');
    let currentLine = '';
    let wrappedText = '';
  
    words.forEach(word => {
      if (doc.getTextWidth(currentLine + word) < maxWidth) {
        currentLine += word + ' ';
      } else {
        wrappedText += currentLine.trim() + '\n';
        currentLine = word + ' ';
      }
    });
  
    wrappedText += currentLine.trim();
    return wrappedText;
  }
  
  
  
  
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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


  
 // Calculate the grand total for each transaction mode
 getGrandTotalForTrnsMode(item: string): any {
  const items = this.groupedData[item]; // Get items for the transaction mode
  if (!items || items.length === 0) {
    return 0; // No items found, return 0
  }
// Calculate the total
const total = items.reduce((sum, item) => {
 // Default to 0 if Rate is missing
  return sum +item. Receipt_Amt;
}, 0);

return total;


}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.common-column-picker') && !target.closest('.nadavarav-table-column-picker')) {
      this.showColumnDropdown = false;
      this.openTableDropdownKey = null;
    }
  }

  toggleColumnDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showColumnDropdown = !this.showColumnDropdown;
    this.openTableDropdownKey = null;
  }

  toggleTableDropdown(key: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openTableDropdownKey === key) {
      this.openTableDropdownKey = null;
    } else {
      this.openTableDropdownKey = key;
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
  }

  toggleTableColumn(tableKey: string, colKey: string, event: Event): void {
    event.stopPropagation();
    if (!this.tableColumns[tableKey]) {
      this.tableColumns[tableKey] = { ...this.columns };
    }
    this.tableColumns[tableKey][colKey] = !this.tableColumns[tableKey][colKey];
  }

  getTableColumns(tableKey: string): { [key: string]: boolean } {
    if (!this.tableColumns[tableKey]) {
      return this.columns;
    }
    return this.tableColumns[tableKey];
  }

  getTableVisibleColumnCount(tableKey: string): number {
    return this.columnList.filter(col => this.isColumnVisible(tableKey, col.key)).length;
  }

  hasTableCustomOverrides(tableKey: string): boolean {
    return !!this.tableColumns[tableKey];
  }

  resetTableColumns(tableKey: string, event: MouseEvent): void {
    event.stopPropagation();
    delete this.tableColumns[tableKey];
  }

  getLeadingColspan(catKey: string): number {
    const leadingKeys = ['billNo', 'billDate', 'counter', 'vazhipad', 'name', 'star', 'qty'];
    const count = leadingKeys.filter(k => this.isColumnVisible(catKey, k)).length;
    return count > 0 ? count : 1;
  }

  // Pagination helpers
  getPagination(key: string) {
    if (!this.paginationState[key]) {
      this.paginationState[key] = { currentPage: 1, pageSize: 10 };
    }
    return this.paginationState[key];
  }

  getCurrentPage(key: string): number {
    return this.getPagination(key).currentPage;
  }

  getPageSize(key: string): number {
    return this.getPagination(key).pageSize;
  }

  getPaginatedEntries(key: string, items: any[]): any[] {
    if (!items || items.length === 0) return [];
    const state = this.getPagination(key);
    const start = (state.currentPage - 1) * state.pageSize;
    return items.slice(start, start + state.pageSize);
  }

  getTotalPages(key: string, items: any[]): number {
    if (!items || items.length === 0) return 1;
    return Math.ceil(items.length / this.getPageSize(key)) || 1;
  }

  getPages(key: string, items: any[]): number[] {
    const totalPages = this.getTotalPages(key, items);
    const current = this.getCurrentPage(key);
    const delta = 2;
    const start = Math.max(1, current - delta);
    const end = Math.min(totalPages, current + delta);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(key: string, page: number): void {
    this.getPagination(key).currentPage = page;
  }

  nextPage(key: string, items: any[]): void {
    const max = this.getTotalPages(key, items);
    const state = this.getPagination(key);
    if (state.currentPage < max) {
      state.currentPage++;
    }
  }

  prevPage(key: string): void {
    const state = this.getPagination(key);
    if (state.currentPage > 1) {
      state.currentPage--;
    }
  }

  onPageSizeChange(key: string, newSize: any): void {
    const state = this.getPagination(key);
    state.pageSize = Number(newSize) || 10;
    state.currentPage = 1;
  }

  getRangeStart(key: string, items: any[]): number {
    if (!items || items.length === 0) return 0;
    const state = this.getPagination(key);
    return (state.currentPage - 1) * state.pageSize + 1;
  }

  getRangeEnd(key: string, items: any[]): number {
    if (!items || items.length === 0) return 0;
    const state = this.getPagination(key);
    const end = state.currentPage * state.pageSize;
    return Math.min(end, items.length);
  }

  getTotalRecordsCount(): number {
    if (this.data && this.data.length > 0) {
      return this.data.length;
    }
    return 0;
  }

  hasAnyData(): boolean {
    return !!(this.data && this.data.length > 0);
  }

  getPaginatedCategoryTotal(catKey: string, items: any[]): number {
    const currentItems = this.isPrinting ? (items || []) : this.getPaginatedEntries(catKey, items);
    return currentItems.reduce((sum: number, item: any) => sum + (Number(item?.Receipt_Amt) || 0), 0);
  }

exportToExcel(): void {
  const workbook = XLSX.utils.book_new();
  const excelData: any[] = [];

  // ==========================================
  // HEADER
  // ==========================================
  excelData.push([this.templeName]);
  excelData.push([this.templeAddress]);
  excelData.push(['NADAVARAVU BOOKING REPORT']);
  excelData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelData.push([]);

  // ==========================================
  // GROUPED CATEGORY DATA
  // ==========================================
  const categories = Object.keys(this.groupedData);

  categories.forEach((category: string) => {
    const rows = this.groupedData[category];

    // Section Title
    excelData.push([category.toUpperCase()]);
    excelData.push([
      'Bill No',
      'Bill Date',
      'Counter',
      'Vazhipad',
      'Name',
      'Star',
      'Qty',
      'Amount'
    ]);

    rows.forEach((item: any) => {
      excelData.push([
        item.BillNo,
        item.BillDate,
        `${item.CounterId} (${item.UName})`,
        this.lang === 'en' ? item.NM_Name : item.NM_RName,
        item.Name,
        item.Star || 'N/A',
        item.Qty,
        item.Receipt_Amt
      ]);
    });

    // Category Total
    excelData.push([
      '',
      '',
      '',
      '',
      '',
      '',
      'Total',
      this.getGrandTotalForTrnsMode(category)
    ]);

    excelData.push([]);
  });

  // ==========================================
  // GRAND TOTAL
  // ==========================================
  excelData.push([
    '',
    '',
    '',
    '',
    '',
    '',
    'Grand Total',
    this.getTotalAmount()
  ]);

  // ==========================================
  // CREATE SHEET
  // ==========================================
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  worksheet['!cols'] = [
    { wch: 12 }, // Bill No
    { wch: 15 }, // Bill Date
    { wch: 20 }, // Counter
    { wch: 30 }, // Vazhipad
    { wch: 28 }, // Name
    { wch: 15 }, // Star
    { wch: 10 }, // Qty
    { wch: 15 }  // Amount
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nadavaravu Report');

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
    `Nadavaravu_Booking_Report_${new Date().getTime()}.xlsx`
  );
}
  
}
