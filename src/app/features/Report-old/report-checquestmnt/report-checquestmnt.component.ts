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
  filteredFeecollection:any[]=[];
  loading:boolean;
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
    return this.filteredData.reduce((sum, item) => sum + item.Amount, 0);
  }

  getFeecollectionTotalAmount(): number {
    return this.filteredFeecollection.reduce((sum, item) => sum + item.Amount, 0);
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

  // generatePDF(): void {
  //   const filteredData = this.data.filter(item => item.TrnsMode === 'CH');

  //   const templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
  //   const templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
  //   const doc = new jsPDF();
  //   const pageWidth = doc.internal.pageSize.width;
  //   const pageHeight = doc.internal.pageSize.height;
  //   const headerHeight = 35;
  //   const footerHeight = 8;
  //   const lineHeight = 8;
  //   const tableHeaderFontSize = 11;
  //   const contentFontSize = 8;
  //   const currentDate = new Date().toLocaleDateString('en-GB'); // Format as dd-mm-yyyy

  //   const maxColumnWidths = [20, 40, 45, 25, 25, 20]; // Column widths for each column
  //   const headers = ["Bill No.", "Bank Name", "Vazhipad", "Cheque Date", "Cheque No", "Amount"];

  //   let y = headerHeight;
  //   let grandTotalAmount = 0;
  //   this.http
  //   .get('assets/fonts/malayalam/NotoSansMalayalam-Regular.ttf', {
  //     responseType: 'arraybuffer',
  //   })
  //   .subscribe(
  //     (fontData) => {
  //       const doc = new jsPDF();

  //       // Convert ArrayBuffer to Base64
  //       const fontBase64 = btoa(
  //         String.fromCharCode(...new Uint8Array(fontData))
  //       );

  //       // Add the font to jsPDF
  //       doc.addFileToVFS(
  //         'NotoSansMalayalam-Regular.ttf',
  //         fontBase64
  //       );
  //       doc.addFont(
  //         'NotoSansMalayalam-Regular.ttf',
  //         'NotoSansMalayalam',
  //         'normal'
  //       );

  //       // Set the custom font
  //       doc.setFont('NotoSansMalayalam');
  //   // Draw Header
  //   const drawHeader = () => {
  //     doc.setFontSize(12);
  //     doc.setFont("NotoSansMalayalam", "bold");
  //     doc.text(templeName, pageWidth / 2, 12, { align: "center" });
  //     doc.setFont("NotoSansMalayalam", "normal");
  //     doc.setFontSize(10);
  //     doc.text(templeAddress, pageWidth / 2, 18, { align: "center" });

  //     doc.setFontSize(10);
  //     doc.setFont("NotoSansMalayalam", "bold");
  //     doc.text("Cheque Transaction Report", pageWidth / 2, 27, { align: "center" });

  //     doc.setFontSize(10);
  //     doc.setFont("NotoSansMalayalam", "normal");
  //     // doc.text(`${this.formatDate(this.fromDate)} to ${this.formatDate(this.toDate)}`, pageWidth / 2, 32, { align: "center" });
  //  // Add current date below the report title but above the table header
  //  doc.setFontSize(10);
  //  doc.setFont("NotoSansMalayalam", "normal");
  //  doc.text(`${this.formatDate(this.fromDate)} to ${this.formatDate(this.toDate)}`, pageWidth / 2, 32, { align: "center" });
  //  doc.setLineWidth(0.5);
  //     doc.line(10, y, pageWidth - 10, y); // Line below header
  //     y += 3; // Space below the line
  //   };

  //   // Draw Footer
  //   const drawFooter = (pageNum: number) => {
  //     doc.setFontSize(10);
  //     doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - footerHeight / 2, { align: "center" });
  //   };

  //   // Add Table Header
  //   const drawTableHeader = () => {
  //     doc.setFontSize(tableHeaderFontSize);
  //     doc.setFont("NotoSansMalayalam", "bold");
  //     let x = 10;
  //     headers.forEach((header, index) => {
  //       doc.text(header, x, y + 5);
  //       x += maxColumnWidths[index];
  //     });
  //     y += lineHeight;
  //     doc.setLineWidth(0.3);
  //     doc.setDrawColor(200, 200, 200); // Light gray color for grid lines
  //     doc.line(10, y, pageWidth - 10, y); // Line below the table header
  //     y += 2;
  //   };

  //   // Helper to wrap text
  //   const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  //     return doc.splitTextToSize(text, maxWidth);
  //   };

  //   // Initialize PDF
  //   drawHeader();
  //   drawFooter(1);
  //   drawTableHeader();

  //   let pageNum = 1;

  //   // Iterate over data and draw rows
  //   filteredData.forEach((row: any) => {
  //     const instDateFormatted = new Date(row.InstDate).toLocaleDateString('en-GB'); // Format as dd-mm-yyyy

  //     const tableRow = [
  //       row.BillNo,
  //       wrapText(doc, row.InstBank, maxColumnWidths[1]), // Wrap Bank Name
  //       wrapText(doc, row.Vazhipad, maxColumnWidths[2]), // Wrap Vazhipad
  //       instDateFormatted,
  //       row.InstNo,
  //       row.Amount.toFixed(2),
  //     ];

  //     // Calculate the max height required for wrapped text in the row
  //     const rowHeight = Math.max(
  //       ...tableRow.map((cell, index) =>
  //         Array.isArray(cell) ? cell.length * contentFontSize : lineHeight
  //       )
  //     );

  //     // Check if a new page is needed
  //     if (y + rowHeight > pageHeight - footerHeight - 10) {
  //       doc.addPage();
  //       pageNum++;
  //       y = headerHeight + 5;
  //       drawHeader();
  //       drawFooter(pageNum);
  //       drawTableHeader();
  //     }

  //     let x = 10;
  //     // Draw each cell
  //     doc.setFont("NotoSansMalayalam", "normal");
  //     doc.setFontSize(contentFontSize);

  //     tableRow.forEach((cell, index) => {
  //       if (Array.isArray(cell)) {
  //         // Handle wrapped text
  //         cell.forEach((line, lineIndex) => {
  //           doc.text(line, x, y + 5 + lineIndex * contentFontSize);
  //         });
  //       } else {
  //         if (index === 5) {
  //           // Align Amount column to the right
  //           doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "right" });
  //         } else {
  //           // Left-align other columns
  //           doc.text(String(cell), x, y + 5);
  //         }
  //       }
  //       x += maxColumnWidths[index];
  //     });

  //     // Draw row grid lines
  //     doc.setLineWidth(0.3);
  //     doc.setDrawColor(200, 200, 200);
  //     doc.line(10, y, pageWidth - 10, y);

  //     grandTotalAmount += row.Amount;
  //     y += rowHeight; // Move y position for the next row
  //   });

  //   // Add Grand Total row
  //   const grandTotalRow = ["", "Grand Total", "", "", "", grandTotalAmount.toFixed(2)];
  //   let x = 10;
  //   doc.setFont("NotoSansMalayalam", "bold");
  //   doc.setFontSize(contentFontSize +2);
  //   grandTotalRow.forEach((cell, index) => {
  //     if (index === 5) {
  //       doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "right" });
  //     } else {
  //       doc.text(String(cell), x, y + 5);
  //     }
  //     x += maxColumnWidths[index];
  //   });

  //   // Draw grid line after Grand Total
  //   doc.setLineWidth(0.3);
  //   doc.setDrawColor(200, 200, 200);
  //   doc.line(10, y, pageWidth - 10, y);

  //   // Save PDF
  //   // doc.save('Cheque_Transaction_Report.pdf');
  //   const pdfBlob = doc.output('blob');
  //   const pdfUrl = URL.createObjectURL(pdfBlob);
  //   window.open(pdfUrl, '_blank');
  //   // doc.save('vazhipad_report_with_header_footer.pdf');
  // },
  // (error:any) => {
  //   console.error('Error loading font:', error);
  // }
  // );
  // }

  generatePDF() {

this.reportPrintservice.generatePDF();
//     const printContent = document.getElementById('print-section');
//     if (!printContent) {
//       console.error('No content found to print');
//       return;
//     }

//     const WindowPrt = window.open('', '', 'width=800,height=600');

//     // Check if the print window was successfully opened
//     if (!WindowPrt) {
//       console.error(
//         'Unable to open print window. Please check pop-up blockers.'
//       );
//       return;
//     }

//     WindowPrt.document.write(`
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
//           .number,.total{
//             text-align:right;
//             }
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
//             .total,number{
//             text-align:right;
//             }
//           th, td {
//            padding-left:5px;
//             text-align: left;
//           }
//             #print-section{
// padding-bottom: 100px;
//   }
       
    
//     .page-break {
//       page-break-before: always;
//     }
//           </style>
//       </head>
//       <body>${printContent.innerHTML}</body>
//     </html>
//   `);

//     WindowPrt.document.close();
//     WindowPrt.focus();

//     // Make sure that the window is still valid before calling print and close
//     if (WindowPrt) {
//       WindowPrt.print();
//       WindowPrt.close();
//     }
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
      this.getTotalAmount()
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
      this.getFeecollectionTotalAmount()
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
    this.getTotalAmount() + this.getFeecollectionTotalAmount()
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
