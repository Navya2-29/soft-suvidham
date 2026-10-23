import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { jsPDF } from 'jspdf'; 
import {ReportData} from '../../../models/poornam-report'
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-advancedbooking',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,
    SpinnerComponent,
    TranslateModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,MatIconModule],
  templateUrl: './report-advancedbooking.component.html',
  styleUrls: ['./report-advancedbooking.component.css','/src/assets/styles/report.style.css'],
})
export class ReportAdvancedbookingComponent {
  displayedColumns: string[] = ['BillNo','BillDate','Vazhipad', 'Name', 'Star', 'Qty', 'Rate', 'Amount',  'VazhipadDate' ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  filteredData: ReportData[]=[];

  fromDate:string;
  toDate:string;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  loading:boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  searchText: string = '';

  // Pagination
  currentPage: number = 1;
  isPrinting: boolean = false;

  // Column Visibility Management
  showColumnDropdown: boolean = false;
  columns: { [key: string]: boolean } = {
    type: true,
    billDate: true,
    billNo: true,
    vazhiDate: true,
    vazhipad: true,
    name: true,
    star: true,
    qty: true,
    rate: true,
    amount: true,
  };

  columnList = [
    { key: 'type', label: 'Type' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'billNo', label: 'Bill No' },
    { key: 'vazhiDate', label: 'Vazhipad Date' },
    { key: 'vazhipad', label: 'Vazhipad' },
    { key: 'name', label: 'Name' },
    { key: 'star', label: 'Star' },
    { key: 'qty', label: 'Quantity' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
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
    if (this.columns['type']) count++;
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
  constructor(private route: ActivatedRoute,
        private reportPrintservice:PrintreportService,
    
    private ts: TranslateService, private service: ReportService,private router: Router, private http:HttpClient) {
    this.lang=localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || '';
    this. templeAddress = localStorage.getItem('Address') || '';
    this.lang = localStorage.getItem('Language');
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
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchText = value;
  
    this.filteredData = this.data.filter(item =>
      (item.BillDate + ' ' + item.BillNo + ' ' + item.VazhiDate + ' ' +item.Type+''+
       item.Vazhipad + ' ' + item.Name + ' ' + item.Star + ' ' + item.Qty +' '+ item.MobileNo+''+item.Address1+''
        + item.Rate +item.Address2+'').toLowerCase().includes(this.searchText)
    );
    this.currentPage = 1;
  }



 // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: type,
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
       
        this.data = data.sort((a:any, b:any) => {
          const [numA, denomA] = a.BillNo.split('/').map(Number);
          const [numB, denomB] = b.BillNo.split('/').map(Number);
          
          // Compare the two parts: first compare the numerator, then the denominator
          return numA - numB || denomA - denomB;
      });
       this.filteredData=this.data;
      this.loading=false;
        this.dataSource.data = this.data
        this.length = data.length; 
        this.dataSource.paginator = this.paginator;
        
        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
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

  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

//   generatePDF() {
//     const templeName = localStorage.getItem('TempleName') || '';
//     const templeAddress = localStorage.getItem('Address') || '';
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.width;
//     const pageHeight = doc.internal.pageSize.height;
//     const headerHeight = 35;
//     const footerHeight = 8;
//     const lineHeight = 8;
//     const tableHeaderFontSize = 11;
//     const contentFontSize = 8;
//     const currentDate = new Date().toLocaleDateString();
  
//     const maxColumnWidths = [20, 50, 40, 30, 17, 15, 15]; // Column widths for each column
//     const headers = ["Bill No.", "VAZHIPAD", "NAME", "STAR", "ENNAM", "RATE", "Amount"];
  
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
//       doc.text("Advance Booking Report", pageWidth / 2, 27, { align: "center" });
    
//       // Add current date below the report title but above the table header
//       doc.setFontSize(10);
//       doc.setFont("NotoSansMalayalam", "normal");
//       doc.text(`${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)} `, pageWidth / 2, 32, { align: "center" });
    
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
//     this.data.forEach((row: any) => {
//       const tableRow = [
//         row.BillNo,
//         this.wrapText(doc, row.Vazhipad, maxColumnWidths[1]), // Wrap Vazhipad
//         this.wrapText(doc, row.Name, maxColumnWidths[2]),     // Wrap Name
//         row.Star,
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
//           if (index === 4 ||  index === 5 || index === 6 ) {
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
//     doc.setFontSize(contentFontSize);
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
//     // doc.save("AdvancebookingReport.pdf");


//     const pdfBlob = doc.output('blob');
//     const pdfUrl = URL.createObjectURL(pdfBlob);
//     window.open(pdfUrl, '_blank');
//     // doc.save('vazhipad_report_with_header_footer.pdf');
  
  
  
//   },
//   (error:any) => {
//     console.error('Error loading font:', error);
//   }
//   );
// }
  
generatePDF(){
  this.isPrinting = true;
  setTimeout(() => {
    this.reportPrintservice.generatePDF();
    this.isPrinting = false;
  }, 50);
//   const printContent = document.getElementById('print-section');
//   if (!printContent) {
//     console.error('No content found to print');
//     return;
//   }

//   const WindowPrt = window.open('', '', 'width=800,height=600');
  
//   // Check if the print window was successfully opened
//   if (!WindowPrt) {
//     console.error('Unable to open print window. Please check pop-up blockers.');
//     return;
//   }

//   WindowPrt.document.write(`
//     <html>
//       <head>
//         <title>Print</title>
//         <style>
         
//           body {
//     font-size: 16px;
//     font-family: "Times New Roman", serif;
//   }
//           h3,p,h4,h2{
//           line-height:1;
//           margin-top:0;
//           text-align:center;
//           }
//           .templename{
//            line-height:1;
//           margin-top:0;
//           text-align:center;
//           }
//           hr{
//           height:2px;
//           }
//           .tabble-heading h3{
//   font-family: 'Times New Roman', Times, serif;
//   font-weight: bold;
//   font-size: 16px;
//   margin: 8px 0 0 0;
// }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//           }
//           table, th, td {
//             border: 1px solid black;
//             text-transform: uppercase;

//           }
//             .total,.number{
//             text-align:right;
//             }
//           th, td {
//            padding-left:5px;
//             text-align: left;
//           }
//             #print-section{
// padding-bottom: 100px;
//   }
//       .qty{
//       text-align:center;
//       } 
    
//     .page-break {
//       page-break-before: always;
//     }
//           </style>
//       </head>
//       <body>${printContent.innerHTML}</body>
//     </html>
//   `);

//   WindowPrt.document.close();
//   WindowPrt.focus();

//   // Make sure that the window is still valid before calling print and close
//   if (WindowPrt) {
//     WindowPrt.print();
//     WindowPrt.close();
//   } 
}


getGrandTotal(): number {
  return this.filteredData.reduce((sum, item) => sum + item.Qty * item.Rate, 0);
}

getTotalAmount(): number {
  return this.getGrandTotal();
}


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
  
getTimeForBill(time:any){    
  switch (time.toString()) {
    case '0':
      if (this.lang =='en') {
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
exportToExcel(): void {

  import('xlsx').then(XLSX => {
    import('file-saver').then(FileSaver => {

      const workbook = XLSX.utils.book_new();
      const sheetData: any[][] = [];

      /* ---------------- HEADER ---------------- */

      sheetData.push([this.templeName]);
      sheetData.push([this.templeAddress]);
      sheetData.push(['ADVANCE BOOKING REPORT']);
      sheetData.push([
        `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
      ]);
      sheetData.push([]);

      /* ---------------- TABLE HEADER ---------------- */

      sheetData.push([
        'Sl No',
        'Type',
        'Bill Date',
        'Bill No',
        'Vazhipad Date',
        'Vazhipad',
        'Name',
        'Star',
        'Qty',
        'Rate',
        'Amount'
      ]);

      /* ---------------- DATA ---------------- */

      this.filteredData.forEach((item: any, index: number) => {

        const type =
          item.Type === 'Counter'
            ? 'CTR'
            : item.Type === 'Online'
            ? 'OL'
            : item.Type;

        const fullName =
          `${item.Name || ''} ${
            item.Address1 ? ' - ' + item.Address1 : ''
          } ${
            item.Address2 ? ' - ' + item.Address2 : ''
          } ${
            item.MobileNo ? ' - ' + item.MobileNo : ''
          }`;

        sheetData.push([
          index + 1,
          type,
          item.BillDate,
          item.BillNo,
          item.VazhiDate,
          `${item.Vazhipad} (${this.getTimeForBill(item.VTime)})`,
          fullName.trim(),
          item.Star,
          item.Qty,
          item.Rate,
          item.Qty * item.Rate
        ]);
      });

      /* ---------------- TOTAL ---------------- */

      sheetData.push([
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Grand Total',
        this.getGrandTotal()
      ]);

      /* ---------------- CREATE SHEET ---------------- */

      const worksheet =
        XLSX.utils.aoa_to_sheet(sheetData);

      worksheet['!cols'] = [
        { wch: 8 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 35 },
        { wch: 45 },
        { wch: 15 },
        { wch: 8 },
        { wch: 12 },
        { wch: 15 }
      ];

      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 10 } }
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Advance Booking'
      );

      /* ---------------- DOWNLOAD ---------------- */

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

      const blob = new Blob(
        [excelBuffer],
        {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        }
      );

      FileSaver.saveAs(
        blob,
        `Advance_Booking_Report_${new Date().getTime()}.xlsx`
      );

    });
  });
}

}
