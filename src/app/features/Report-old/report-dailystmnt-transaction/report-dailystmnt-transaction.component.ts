import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import html2pdf from 'html2pdf.js';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportDailyStmt } from '../../../models/dailytrasaction.model';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatIconModule } from '@angular/material/icon';

// Fix TypeScript issues with `vfs`
// (pdfMake as any).setVfs(pdfFonts.pdfMake.vfs);
@Component({
  selector: 'app-report-dailystmnt-transaction',
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
  templateUrl: './report-dailystmnt-transaction.component.html',
  styleUrls: ['./report-dailystmnt-transaction.component.css','/src/assets/styles/report.style.css']
})
export class ReportDailystmntTransactionComponent {
  
  data: ReportDailyStmt[] = [];
  fromDate: string;
  toDate: string;
  creditTransactionArray:any[];
  loading:boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { 
    [trnsMode: string]: { 
      [category: string]: { 
        [vazhipad: string]: { 
          vazhipad: string;
          Qty: number;
          Rate: number;
          Amount: number;
        } 
      } 
    } 
  } = {};
  
  groupedDatas: {
    [key: string]: {
      [key: string]: { Qty: number; Rate: number; Amount: number };
    };
  } = {};
  currentDate: string = '';
  currentPage: number = 1;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http: HttpClient,
    private ts: TranslateService,
    private reportPrintservice:PrintreportService
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

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
      this.getCreditReport(this.fromDate, this.toDate);
    });
  }
  getCreditReport(fromdate:string,toDate:string){
    const meberpayLoad ={
      Type: "CreditPending",
      FromDate: fromdate,
      ToDate: toDate,
    }

    this.service.getReport(meberpayLoad).subscribe((data1:any) => {
    this.creditTransactionArray=data1
        console.log(this.creditTransactionArray,"crediiiii");
   
    });
  }

  getCrediTransactionTotal(){
    if(this.creditTransactionArray.length>0){
      return this.creditTransactionArray.reduce((sum, item) => sum + item.Amount, 0);
    }
 
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true
    const payLoad = {
      Type: type,
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data upi:', data);
        this.data = data;
        this.groupDataByTransactionModeAndCategory()
        this.loading=false
        // this.data = data.sort((a: any, b: any) => {
        //   const [numA, denomA] = a.BillNo.split('/').map(Number);
        //   const [numB, denomB] = b.BillNo.split('/').map(Number);

        // Compare the two parts: first compare the numerator, then the denominator
        // return numA - numB || denomA - denomB;
        // });
       

        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  // code for showing in html

  groupData() {
    this.groupedDatas = this.data.reduce((acc: any, curr: any) => {
      const { TrnsMode, vazhipad, Qty, Rate } = curr;
      if (!acc[TrnsMode]) {
        acc[TrnsMode] = {};
      }
      if (!acc[TrnsMode][vazhipad]) {
        acc[TrnsMode][vazhipad] = { Qty: 0, Rate, Amount: 0 };
      }
      acc[TrnsMode][vazhipad].Qty += Qty;
      acc[TrnsMode][vazhipad].Amount =
        acc[TrnsMode][vazhipad].Rate * acc[TrnsMode][vazhipad].Qty;
      return acc;
    }, {});
  }

  // Calculate the grand total for each transaction mode
  // getGrandTotalForTrnsMode(transactionMode: string): number {
  //   const items = this.groupedData[transactionMode]; // Get items for the transaction mode
  //   if (!items || items.length === 0) {
  //     return 0; // No items found, return 0
  //   }

  //   // Calculate the total
  //   const total = items.reduce((sum, item) => {
  //     const qty = item.Qty || 0; // Default to 0 if Qty is missing
  //     const rate = item.Rate || 0; // Default to 0 if Rate is missing
  //     return sum + item.Amount;
  //   }, 0);

  //   return total;
  // }
  getTotalForTransactionMode(trnsMode: string): number {
    if (!this.groupedData[trnsMode]) {
      return 0;
    }
  
    return Object.keys(this.groupedData[trnsMode]).reduce((total, category) => {
      return total + this.getTotalForCategory(trnsMode, category);
    }, 0);
  }
  
  getGrandTotal(): number {
    return Object.keys(this.groupedData).reduce((grandTotal, trnsMode) => {
      return grandTotal + this.getTotalForTransactionMode(trnsMode);
    }, 0);
  }
  

  getTotalForCategory(trnsMode: string, category: string): number {
    if (!this.groupedData[trnsMode] || !this.groupedData[trnsMode][category]) {
      return 0;
    }
  
    return Object.values(this.groupedData[trnsMode][category]).reduce((sum, item) => sum + item.Amount, 0);
  }
  // Grouping function
  groupDataByTransactionModeAndCategory(): void {
    this.groupedData = this.data.reduce((acc: any, item: any) => {
      const mode = item.TrnsMode;         // Transaction Mode
      const category = item.Category;     // Category
      const vazhipad = item.vazhipad;     // Vazhipad Name
      const rate = item.Rate;             // Rate
      const uniqueKey = `${vazhipad}_${rate}`; // Unique vazhipad per rate
  
      if (!acc[mode]) {
        acc[mode] = {}; // Initialize Transaction Mode group
      }
      if (!acc[mode][category]) {
        acc[mode][category] = {}; // Initialize Category group
      }
      if (!acc[mode][category][uniqueKey]) {
        acc[mode][category][uniqueKey] = { 
          vazhipad: vazhipad,
          Rate: rate,
          Qty: 0,
          Amount: 0 
        };
      }
  
      // Aggregate Qty and Amount only if rate is same (since key includes rate)
      acc[mode][category][uniqueKey].Qty += item.Qty;
      acc[mode][category][uniqueKey].Amount += item.Amount;
  
      return acc;
    }, {} as {
      [trnsMode: string]: {
        [category: string]: {
          [vazhipad_rate_key: string]: {
            vazhipad: string,
            Rate: number,
            Qty: number,
            Amount: number
          }
        }
      }
    });
  }
  
  generatePDF() {
  this.reportPrintservice.generatePDF();
  }

  // onPageChange(event: PageEvent) {
  //   this.pageIndex = event.pageIndex;
  //   this.pageSize = event.pageSize;
  // }

  goBack(): void {
    console.log('Going back...'); // Log to verify method execution
    this.router.navigate(['/getReport']);

    if (window.history.length > 1) {
      window.history.back(); // Goes back to the previous page in history
    } else {
      window.close(); // Closes the tab if it's the only page open
    }
  }

  // generatePDF() {
  //   const templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
  //   const templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
  //   const doc = new jsPDF();
  //   const pageWidth = doc.internal.pageSize.width;
  //   const pageHeight = doc.internal.pageSize.height;
  //   const headerHeight = 35;
  //   const footerHeight = 20;
  //   const lineHeight = 5;
  //   const tableHeaderFontSize = 10;
  //   const contentFontSize = 9;
  //   const maxColumnWidths = [20, 60, 25, 25, 25]; // BillNo, Name, Vazhipad, Star, Ennam (Qty), Rate, Amount
  //   let y = headerHeight;
  //   let grandTotal = 0;
  //   this.http.get('assets/fonts/malayalam/NotoSansMalayalam-Regular.ttf', { responseType: 'arraybuffer' }).subscribe(
  //     (fontData) => {
  //       const doc = new jsPDF();
  //       const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(fontData)));
  //       doc.addFileToVFS('NotoSansMalayalam-Regular.ttf', fontBase64);
  //       doc.addFont('NotoSansMalayalam-Regular.ttf', 'NotoSansMalayalam', 'normal');
  //       doc.setFont('NotoSansMalayalam');

  //       // Group data by TransactionMode and then by Vazhipad
  //       const groupedData = this.data.reduce((acc, current) => {
  //         const key = current.TrnsMode;
  //         if (!acc[key]) {
  //           acc[key] = {};
  //         }
  //         if (!acc[key][current.vazhipad]) {
  //           acc[key][current.vazhipad] = { Qty: 0, Rate: current.Rate, Total: 0 };
  //         }
  //         // Sum the Qty and calculate the Total for each Vazhipad
  //         acc[key][current.vazhipad].Qty += current.Qty;
  //         acc[key][current.vazhipad].Total += current.Qty * current.Rate;
  //         return acc;
  //       }, {} as { [key: string]: { [key: string]: { Qty: number; Rate: number; Total: number } } });

  //       // Draw Header
  //       const drawHeader = () => {

  //         doc.setFont("NotoSansMalayalam", "normal");
  //         doc.setFontSize(12);
  //         doc.text(templeName, pageWidth / 2, 12, { align: "center" });
  //         doc.setFont("NotoSansMalayalam", "normal");
  //         doc.setFontSize(10);
  //         doc.text(templeAddress, pageWidth / 2, 18, { align: "center" });

  //         doc.setFontSize(10);
  //         doc.setFont("NotoSansMalayalam", "bold");
  //         doc.text("Daily Statement Collection - Temple", pageWidth / 2, 27, { align: "center" });
  //         doc.text(`${this.formatDateToDDMMYYYY(this.fromDate)} -${this.formatDateToDDMMYYYY(this.toDate)}`, pageWidth / 2, 32, { align: "center" });
  //         doc.setLineWidth(0.5);
  //         doc.line(10, y, pageWidth - 10, y); // Line below header
  //         y += 3;
  //       };

  //       // Draw Footer
  //       const drawFooter = (pageNum: number) => {
  //         doc.setFontSize(10);
  //         const footerText = `Page ${pageNum}`;
  //         doc.text(footerText, pageWidth / 2, pageHeight - footerHeight / 2, { align: "center" });
  //       };

  //       // Add Table Header
  //       const drawTableHeader = () => {
  //         doc.setFontSize(tableHeaderFontSize);
  //         doc.setFont("NotoSansMalayalam", "bold");
  //         const headers = ["SINO.", "VAZHIPAD", "QTY", "RATE", "AMOUNT"];
  //         let x = 10;
  //         headers.forEach((header, index) => {
  //           doc.text(header, x, y + 5);
  //           x += maxColumnWidths[index];
  //         });

  //         y += lineHeight+5;
  //         doc.setLineWidth(0.5);
  //         doc.line(10, y, pageWidth - 10, y); // Line below the header
  //         y += 2;
  //       };

  //       // Initialize PDF
  //       drawHeader();
  //       drawFooter(1);
  //       drawTableHeader();

  //       let pageNum = 1;

  //       // Render Grouped Data
  //       for (const [group, entries] of Object.entries(groupedData)) {
  //         // Check if enough space for group header, add page if not
  //         if (y + lineHeight > pageHeight - footerHeight - 20) {
  //           doc.addPage();
  //           pageNum++;
  //           y = headerHeight + 5; // Reset y position after new page
  //           drawHeader();
  //           drawFooter(pageNum);
  //           drawTableHeader();
  //         }

  //         // Draw Group Header with extra spacing to avoid overlap with the table header line
  //         doc.setFontSize(12);
  //         doc.setFont("NotoSansMalayalam", "bold");

  //         y += lineHeight; // Increase spacing between the group name and table header
  //         doc.text(`${this.getTransactionType(group)}`, 10, y);
  //         y += lineHeight; // Additional space below group header

  //         let groupTotal = 0; // Initialize group total

  //         // Draw Entries in Table Format
  //         let serialNumber = 1; // Initialize serial number for the group
  //         for (const [vazhipad, values] of Object.entries(entries)) {
  //           // Ensure Rate and Total are numbers
  //           const rate = Number(values.Rate);
  //           const total = Number(values.Total);

  //           // Check if enough space for the row, add page if not
  //           if (y + lineHeight > pageHeight - footerHeight - 10) {
  //             doc.addPage();
  //             pageNum++;
  //             y = headerHeight + 5; // Reset y position after new page
  //             drawHeader();
  //             drawFooter(pageNum);
  //             drawTableHeader();
  //           }

  //           doc.setFontSize(contentFontSize);
  //           doc.setFont("NotoSansMalayalam", "normal");

  //           const row = [
  //             serialNumber.toString(),
  //             vazhipad, // Vazhipad text
  //             values.Qty.toString(), // Sum of Qty for each Vazhipad
  //             rate.toFixed(2), // Rate for each Vazhipad
  //             total.toFixed(2), // Total = Rate * Qty
  //           ];
  //           let x = 10;

  //           row.forEach((cell, index) => {
  //             if (index === 2 || index === 3 || index === 4) {
  //               // Right-align for Qty, Rate, and Amount
  //               doc.text(String(cell), x + maxColumnWidths[index] - 10, y + 5, { align: "right" });
  //             } else {
  //               doc.text(String(cell), x, y + 5);  // Left-align the others
  //             }
  //             x += maxColumnWidths[index];
  //           });

  //           groupTotal += total; // Add to group total
  //           grandTotal += total; // Add to grand total
  //           y += lineHeight;
  //           serialNumber++; // Increment serial number
  //         }

  //         // Draw Group Total
  //         if (y + lineHeight > pageHeight - footerHeight - 10) {
  //           doc.addPage();
  //           pageNum++;
  //           y = headerHeight + 5; // Reset y position after new page
  //           drawHeader();
  //           drawFooter(pageNum);
  //           drawTableHeader();
  //         }

  //         // Add group total at the end
  //         const groupTotalX = 10 + maxColumnWidths[0] + maxColumnWidths[1] + maxColumnWidths[2] + maxColumnWidths[3]+maxColumnWidths[3];
  //         doc.setFontSize(12);
  //         doc.setFont("NotoSansMalayalam", "bold");
  //         doc.text(`Total (${this.getTransactionType(group)}):`, 10, y + 5); // Label for the group total
  //         doc.text(`${groupTotal.toFixed(2)}`,groupTotalX - 10, y + 5, { align: "right" }); // Total with transaction mode

  //         y += lineHeight + 5; // Add space after the total for the next group or footer
  //       }
  //       const groupTotalX = 10 + maxColumnWidths[0] + maxColumnWidths[1] + maxColumnWidths[2] + maxColumnWidths[3]+maxColumnWidths[3];

  //       // Add Grand Total below the last Group Total
  //       doc.setFontSize(12);
  //       doc.setFont("NotoSansMalayalam", "bold");
  //       doc.text("Grand Total:", 10, y + 5); // Label for the grand total
  //       doc.text(`${grandTotal.toFixed(2)}`, groupTotalX - 10, y + 5, { align: "right" }); // Grand total with text

  //       y += lineHeight + 10; // Space after the grand total

  //       // Save PDF
  //       const pdfBlob = doc.output('blob');
  //       const pdfUrl = URL.createObjectURL(pdfBlob);
  // //       const iframe = document.getElementById('pdfIframe') as HTMLIFrameElement;
  // // if (iframe) {
  // //   iframe.src = pdfUrl;
  // // }
  //       window.open(pdfUrl, '_blank');
  //     },
  //     (error: any) => {
  //       console.error('Error loading font:', error);
  //     }
  //   );
  // }

  // Helper function to wrap text for a given column width
  wrapText(doc: jsPDF, text: string, maxWidth: number): string {
    const words = text.split(' ');
    let currentLine = '';
    let wrappedText = '';

    words.forEach((word) => {
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

  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();
  // }

  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        if (this.lang == 'en') {
          return 'BANK';
        } else {
          return 'ബാങ്ക്';
        }
        case 'OL':
        if (this.lang == 'en') {
          return 'Online';
        } else {
          return 'ഓൺലൈൻ';
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
      default:
        return 'OTHERS';
    }
  }

  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }



  formatDate(date: any, format: string = 'dd-MM-yyyy'): string {
    if (!date) return '';
  
    let newDate: Date;
  
    if (typeof date === 'string' && date.includes('T')) {
      // Handle ISO format (e.g., 2025-03-20T00:00:00)
      newDate = new Date(date);
    } else if (typeof date === 'string' && date.includes('.')) {
      // Handle dd.mm.yyyy format
      const parts = date.split('.');
      if (parts.length === 3) {
        newDate = new Date(+parts[2], +parts[1] - 1, +parts[0]); // YYYY, MM, DD
      } else {
        return ''; // Invalid date
      }
    } else {
      return ''; // Unknown format
    }
  
    const day = ('0' + newDate.getDate()).slice(-2);
    const month = ('0' + (newDate.getMonth() + 1)).slice(-2);
    const year = newDate.getFullYear();
  
    return format === 'dd.MM.yyyy' ? `${day}.${month}.${year}` : `${day}-${month}-${year}`;
  }
  exportToExcel(): void {

  const workbook = XLSX.utils.book_new();
  const sheetData: any[][] = [];

  /* ---------------- HEADER ---------------- */
  sheetData.push([this.templeName]);
  sheetData.push([this.templeAddress]);
  sheetData.push(['DAILY STATEMENT REPORT']);
  sheetData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  sheetData.push([]);

  /* ------------ TRANSACTION DATA ---------- */

  Object.keys(this.groupedData).forEach((modeKey) => {

    // Transaction Heading
    sheetData.push([this.getTransactionType(modeKey)]);
    sheetData.push([]);

    Object.keys(this.groupedData[modeKey]).forEach((categoryKey) => {

      // Category Heading
      sheetData.push([categoryKey]);

      // Table Header
      sheetData.push([
        'Sl No',
        'Vazhipad',
        'Quantity',
        'Rate',
        'Amount'
      ]);

      let slNo = 1;

      Object.keys(this.groupedData[modeKey][categoryKey]).forEach((itemKey) => {

        const item = this.groupedData[modeKey][categoryKey][itemKey];

        sheetData.push([
          slNo++,
          item.vazhipad,
          item.Qty,
          item.Rate,
          item.Amount
        ]);
      });

      // Category Total
      sheetData.push([
        '',
        '',
        '',
        'TOTAL',
        this.getTotalForCategory(modeKey, categoryKey)
      ]);

      sheetData.push([]);
    });

    // Transaction Total
    sheetData.push([
      '',
      '',
      '',
      `Total ${this.getTransactionType(modeKey)}`,
      this.getTotalForTransactionMode(modeKey)
    ]);

    sheetData.push([]);
    sheetData.push([]);
  });

  /* ------------ CREDIT SECTION ------------ */

  if (this.creditTransactionArray?.length > 0) {

    sheetData.push(['CREDIT']);
    sheetData.push([
      'Sl No',
      'Vazhipad',
      'Quantity',
      'Rate',
      'Amount'
    ]);

    this.creditTransactionArray.forEach((item: any, index: number) => {
      sheetData.push([
        index + 1,
        item.Vazhipad,
        item.Qty,
        item.Rate,
        item.Amount
      ]);
    });

    sheetData.push([
      '',
      '',
      '',
      'Credit Total',
      this.getCrediTransactionTotal()
    ]);

    sheetData.push([]);
  }

  /* ------------ GRAND TOTAL ------------ */

  sheetData.push([
    '',
    '',
    '',
    'Grand Total',
    this.getGrandTotal()
  ]);

  /* ------------ CREATE SHEET ------------ */

  const worksheet: XLSX.WorkSheet =
    XLSX.utils.aoa_to_sheet(sheetData);

  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 35 },
    { wch: 12 },
    { wch: 15 },
    { wch: 18 }
  ];

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Daily Statement'
  );

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
    `Daily_Statement_Report_${new Date().getTime()}.xlsx`
  );
}

}
