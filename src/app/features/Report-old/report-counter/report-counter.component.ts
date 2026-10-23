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
  selector: 'app-report-counter',
  standalone: true,
  imports: [CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,MatFormFieldModule,TranslateModule, MatInputModule,SpinnerComponent,MatIconModule],
  templateUrl: './report-counter.component.html',
  styleUrls: ['./report-counter.component.css','/src/assets/styles/report.style.css'],
})
export class ReportCounterComponent {

  
  displayedColumns: string[] = [
    'BillNo',
    'BillDate',
    "Counter",
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
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data: ReportDailyStmt[] = [];
  fromDate:string;
  toDate:string;
  groupedDatas: { [key: string]: { [key: string]: { Qty: number, Rate: number, Amount: number } } } = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [counterId: string]: { [cuser: string]: { [trnsMode: string]: ReportData[] } } } = {};
  currentDate: string = '';
  currentPage: number = 1;
  counterId:string | null;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
loading:boolean;
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http:HttpClient,
    private ts: TranslateService,
    private reportPrintservice:PrintreportService
  ) {
    this.counterId=localStorage.getItem('Counter')
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
       this.fromDate = params['fromDate'];
       this.toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }
  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }
  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: "DailyStmt",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
      this.groupData() // Group the data
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
 groupData() {
  this.groupedData = this.data.reduce((acc: any, item: any) => {
    const counterKey = item.CounterId.toString();
    const cuserKey = item.Cuser;
    const trnsModeKey = item.TrnsMode;

    if (!acc[counterKey]) {
      acc[counterKey] = {};
    }
    if (!acc[counterKey][cuserKey]) {
      acc[counterKey][cuserKey] = {};
    }
    if (!acc[counterKey][cuserKey][trnsModeKey]) {
      acc[counterKey][cuserKey][trnsModeKey] = [];
    }

    // Find existing entry with the same vazhipad
    const existingItem = acc[counterKey][cuserKey][trnsModeKey].find((v: any) =>  v.vazhipad === item.vazhipad && v.Rate === item.Rate);

    if (existingItem) {
      // Merge values
      existingItem.Qty += item.Qty;
      existingItem.Amount += item.Amount;
    } else {
      // Add as a new entry
      acc[counterKey][cuserKey][trnsModeKey].push({ ...item });
    }

    return acc;
  }, {} as { [counterId: string]: { [cuser: string]: { [trnsMode: string]: any[] } } });

  console.log(this.groupedData, "grouping");
}


// Function to calculate Counter-wise total
getTotalForCounter(counterId: string): number {
  let total = 0;
  const cusers = this.groupedData[counterId] || {};
  Object.keys(cusers).forEach(cuserKey => {
    Object.keys(cusers[cuserKey]).forEach(trnsModeKey => {
      total += cusers[cuserKey][trnsModeKey].reduce((sum, item) => sum + item.Amount, 0);
    });
  });
  return total;
}

// Function to calculate Cuser & TrnsMode-wise total
getTotalForCuserTrnsMode(counterId: string, cuser: string, trnsMode: string): number {
  return this.groupedData[counterId]?.[cuser]?.[trnsMode]?.reduce((sum, item) => sum + item.Amount, 0) || 0;
}
getTotalForCuser(counterId: string, cuser: string): number {
  if (!this.groupedData[counterId] || !this.groupedData[counterId][cuser]) {
    return 0;
  }

  return Object.keys(this.groupedData[counterId][cuser]).reduce((sum, modeKey) => 
    sum + this.getTotalForCuserTrnsMode(counterId, cuser, modeKey), 0
  );
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


  

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        if (this.lang == 'en') {
          return 'BANK';
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
      default:
        return 'OTHERS';
    }
  }

  getGrandTotal(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }




  generatePDF(){
  this.reportPrintservice.generatePDF();
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
//            <style>
         
//           body {
//     font-size: 16px;
//     font-family: "Times New Roman", serif;
//   }
    
//           p,h4,h2{
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
//           background-color:gray;
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
//             p.counter{
// text-align: left !important;
// font-family: 'Times New Roman', Times, serif;
// margin-top: 10px;
// font-size: large;
// text-transform: uppercase;
// margin:0;
// }
// p.user{
//   text-align: left !important;
//   font-family: 'Times New Roman', Times, serif; 
//   font-size: larger;
//   color: maroon;
//   text-transform: uppercase;
//   margin:0;
// }
// p.transaction{
//   text-align: left !important;
//   font-family: 'Times New Roman', Times, serif; 
//   font-size: medium;
//   text-transform: uppercase;
//   margin:0;

// }
// .counterTable{
//   margin: 5px 0;

// }
// h5#totalamount{
// font-family: 'Times New Roman', Times, serif;
// font-weight: bolder;
// font-size: 20px;
// margin: 0px;

// }
// h5.totalcounter{
//   font-family: 'Times New Roman', Times, serif;
// font-weight: bolder;
// font-size: 20px;
// margin: 0px;
// }
// .templename{
// text-align:center;
// }
// .grandtotal{
// text-align:right;
// }
//             .number,.total{
//             text-align:right;
//             }
//           th, td {
//            padding-left:5px;
//             text-align: left;
//           }
//             #print-section{
// padding-bottom: 100px;
//   }
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
  //         const key = current.CounterId;
  //         if (!acc[key]) {
  //           acc[key] = {};
  //         }
  //         if (!acc[key][current.Vazhipad]) {
  //           acc[key][current.Vazhipad] = { Qty: 0, Rate: current.Rate, Total: 0 };
  //         }
  //         // Sum the Qty and calculate the Total for each Vazhipad
  //         acc[key][current.Vazhipad].Qty += current.Qty;
  //         acc[key][current.Vazhipad].Total += current.Qty * current.Rate;
  //         return acc;
  //       }, {} as { [key: string]: { [key: string]: { Qty: number; Rate: number; Total: number } } });

  //       // Draw Header
  //       const drawHeader = () => {
  //         doc.setFontSize(12);
  //         doc.setFont("NotoSansMalayalam", "bold");
  //         doc.text(templeName, pageWidth / 2, 12, { align: "center" });
  //         doc.setFont("NotoSansMalayalam", "normal");
  //         doc.setFontSize(10);
  //         doc.text(templeAddress, pageWidth / 2, 18, { align: "center" });

  //         doc.setFontSize(10);
  //         doc.setFont("NotoSansMalayalam", "bold");
  //         doc.text("Daily Statement Collection - Temple(counter)", pageWidth / 2, 27, { align: "center" });
  //         doc.text(`${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`, pageWidth / 2, 32, { align: "center" });
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
  //         doc.text(`Counter : ${group}`, 10, y);
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
  //         doc.text(`Total (Counter :${group}):`, 10, y + 5); // Label for the group total
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
  //       window.open(pdfUrl, '_blank');
  //     },
  //     (error: any) => {
  //       console.error('Error loading font:', error);
  //     }
  //   );
  // }

  
  
  // code for showing in html 

  // groupData() {
  //   this.groupedDatas = this.data.reduce((acc:any, curr:any) => {
  //     const { CounterId, vazhipad, Qty, Rate } = curr;
  //     if (!acc[CounterId]) {
  //       acc[CounterId] = {};
  //     }
  //     if (!acc[CounterId][vazhipad]) {
  //       acc[CounterId][vazhipad] = { Qty: 0, Rate, Amount: 0 };
  //     }
  //     acc[CounterId][vazhipad].Qty += Qty;
  //     acc[CounterId][vazhipad].Amount = acc[CounterId][vazhipad].Rate * acc[CounterId][vazhipad].Qty;
  //     return acc;
  //   }, {});
  // }

 // Calculate the grand total for each transaction mode
 
 // Calculate the grand total for each transaction mode
//  getGrandTotalForTrnsMode(CounterId: any): number {
//   const items = this.groupedData[CounterId]; // Get items for the transaction mode
//   if (!items || items.length === 0) {
//     return 0; // No items found, return 0
//   }

//   // Calculate the total
//   const total = items.reduce((sum, item) => {
    
//     return sum + item.Amount
//   }, 0);

//   return total;
// }




  
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
  
  
  
  // Helper function to wrap text for a given column width
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  exportToExcel(): void {

  const workbook = XLSX.utils.book_new();
  const sheetData: any[][] = [];

  /* ---------------- HEADER ---------------- */

  sheetData.push([this.templeName]);
  sheetData.push([this.templeAddress]);
  sheetData.push(['DAILY TEMPLE COLLECTION (COUNTER)']);
  sheetData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  sheetData.push([]);

  /* ---------------- REPORT DATA ---------------- */

  Object.keys(this.groupedData).forEach((counterKey) => {

    sheetData.push([`Counter : ${counterKey}`]);
    sheetData.push([]);

    Object.keys(this.groupedData[counterKey]).forEach((userKey) => {

      sheetData.push([`User : ${userKey}`]);
      sheetData.push([]);

      Object.keys(this.groupedData[counterKey][userKey]).forEach((modeKey) => {

        sheetData.push([this.getTransactionType(modeKey)]);
        sheetData.push([
          'Sl No',
          'Vazhipad',
          'Quantity',
          'Rate',
          'Amount'
        ]);

        let slNo = 1;

        this.groupedData[counterKey][userKey][modeKey]
          .forEach((item: any) => {

            sheetData.push([
              slNo++,
              item.vazhipad,
              item.Qty,
              item.Rate,
              item.Amount
            ]);
          });

        /* Transaction Total */

        sheetData.push([
          '',
          '',
          '',
          `Total ${this.getTransactionType(modeKey)}`,
          this.getTotalForCuserTrnsMode(
            counterKey,
            userKey,
            modeKey
          )
        ]);

        sheetData.push([]);
      });

      /* User Total */

      sheetData.push([
        '',
        '',
        '',
        `Total ${userKey}`,
        this.getTotalForCuser(counterKey, userKey)
      ]);

      sheetData.push([]);
      sheetData.push([]);
    });

    /* Counter Total */

    sheetData.push([
      '',
      '',
      '',
      `Total Counter ${counterKey}`,
      this.getTotalForCounter(counterKey)
    ]);

    sheetData.push([]);
    sheetData.push([]);
  });

  /* ---------------- GRAND TOTAL ---------------- */

  sheetData.push([
    '',
    '',
    '',
    'Grand Total',
    this.getGrandTotal()
  ]);

  /* ---------------- CREATE SHEET ---------------- */

  const worksheet: XLSX.WorkSheet =
    XLSX.utils.aoa_to_sheet(sheetData);

  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 35 },
    { wch: 12 },
    { wch: 18 },
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
    'Temple Collection'
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
    `Daily_Temple_Couter_wise_Collection_${new Date().getTime()}.xlsx`
  );
  }

}