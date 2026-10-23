import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { jsPDF } from 'jspdf'; 
import {ReportData} from '../../../models/poornam-report'
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report-cancel',
  standalone: true,
  imports: [CommonModule,MatTableModule,SpinnerComponent,MatIconModule, TranslateModule,MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,],
  templateUrl: './report-cancel.component.html',
  styleUrls: ['./report-cancel.component.css','/src/assets/styles/report.style.css' ]
})
export class ReportCancelComponent {
  displayedColumns: string[] = ['BillNo','BillDate','CounterId', 'VazhiDate', 'Vazhipad',  'Name','Star','Qty','Rate','Amount','Canceldt','Remarks'];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  nadavaravuDatat:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  filteredData:ReportData[]=[];
  fromDate:string;
  toDate:string;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  loading:boolean;
  constructor(private route: ActivatedRoute,
    private reportPrintservice:PrintreportService,
    
    private ts: TranslateService, private service: ReportService,private router: Router,private http:HttpClient) {
    this.lang=localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');

  }

ngOnInit() {
  this.route.queryParams.subscribe((params) => {
    const type = params['type'];
    this. fromDate = params['fromDate'];
    this. toDate = params['toDate'];
    this.fetchReportData(type, this.fromDate, this.toDate);
    this.fetchNadavaravuCancelReportData(this.fromDate, this.toDate);
  });
}

// getTotalAmount(): number {
//   return this.data.reduce((sum, item) => sum + item.Amount, 0);
// }
// / Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'CancelRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:vazhipad', data);
        this.data=data;
             this.data = this.data.sort((a: any, b: any) =>
        a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
        ); 
      //    this.data = this.data.sort((a:any, b:any) => {
      //     const [numA, denomA] = a.BillNo.split('/').map(Number);
      //     const [numB, denomB] = b.BillNo.split('/').map(Number);
          
      //     // Compare the two parts: first compare the numerator, then the denominator
      //     return numA - numB || denomA - denomB;
      // });
      console.log(this.filteredData,"aaaaaaaaaaaaaaaaaaa")  

        this.dataSource.data = this.data
        console.log( this.dataSource.data)
        this.length =this.filteredData .length; 
        this.dataSource.paginator = this.paginator;
        this.loading=false;
        console.log(this.data);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }



  fetchNadavaravuCancelReportData( fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'CancelRptNadavaravu',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:nadavararvu', data);
          this.nadavaravuDatat = data.sort((a: any, b: any) =>
        a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
        );
        this.nadavaravuDatat=this.nadavaravuDatat;
            
      //    this.data = this.data.sort((a:any, b:any) => {
      //     const [numA, denomA] = a.BillNo.split('/').map(Number);
      //     const [numB, denomB] = b.BillNo.split('/').map(Number);
          
      //     // Compare the two parts: first compare the numerator, then the denominator
      //     return numA - numB || denomA - denomB;
      // });
      // console.log(this.filteredData,"aaaaaaaaaaaaaaaaaaa")  
this.loading=false;
        this.dataSource.data = this.data
        // console.log( this.dataSource.data)
        this.length =this.filteredData .length; 
        this.dataSource.paginator = this.paginator;
        
        console.log(this.data);
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

// Helper method to format date as dd-mm-yyyy
formatDate(dateString: string | undefined): string {
    if (!dateString) return ''; // Return empty string if undefined or empty string
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2);  // Ensure two digits
    const month = ("0" + (date.getMonth() + 1)).slice(-2);  // Ensure two digits
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}
  

formatDateToDDMMYYYY(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
}


// generatePDF() {
//   const templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
//   const templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.width;
//   const pageHeight = doc.internal.pageSize.height;
//   const headerHeight = 35;
//   const footerHeight = 8;
//   const lineHeight = 8;
//   const tableHeaderFontSize = 10;
//   const contentFontSize = 8;
//   const currentDate = new Date().toLocaleDateString();

//   const maxColumnWidths = [20, 20, 40,20,10, 15, 20, 25]; // Column widths for each column
//   const headers = ["Bill No.", "BillDate", "Vazhipad","Date", "Qty", "Amount",'Cancel-Date','Remarks'];

//   let y = headerHeight;
//   let grandTotalRate = 0;
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
//     doc.text("Canceled Booking Report", pageWidth / 2, 27, { align: "center" });
  
//     // Add current date below the report title but above the table header
//     doc.setFontSize(10);
//     doc.setFont("NotoSansMalayalam", "normal");
//     doc.text(`${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`, pageWidth / 2, 32, { align: "center" });
  
//     doc.setLineWidth(0.5);
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

//   // Helper to Wrap Text
//   const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
//     const lines = doc.splitTextToSize(text, maxWidth);
//     return lines;
//   };

//   // Initialize PDF
//   drawHeader();
//   drawFooter(1);
//   drawTableHeader();

//   let pageNum = 1;

//   // Iterate over data and draw rows
//   this.data.forEach((row: any) => {
//     const tableRow = [
//       row.BillNo,
//       row.BillDate,
      
//       wrapText(doc, row.Vazhipad, maxColumnWidths[2]), 
//            // Wrap Name
//           row. VazhiDate,
//       row.Qty,
     
     
//       row.Amount.toFixed(2),
//       row.Canceldt,
//       wrapText(doc, row.Remarks, maxColumnWidths[7]),
//     ];

//     // Calculate the max height required for wrapped text in the row
//     const rowHeight = Math.max(...tableRow.map((cell, index) => {
//       return Array.isArray(cell) ? cell.length * contentFontSize : lineHeight;
//     }));

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

//     // Draw each cell with normal font
//     doc.setFont("NotoSansMalayalam", "normal");
//     doc.setFontSize(contentFontSize );

//     tableRow.forEach((cell, index) => {
//       if (Array.isArray(cell)) {
//         // Handle wrapped text
//         cell.forEach((line, lineIndex) => {
//           doc.text(line, x, y + 5 + (lineIndex * contentFontSize));
//         });
//       } else {
//         if (index===4 || index === 5 ) {
//           // Align Rate and Total columns to the right
//           doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "right" });
//         } else {
//           // Left-align other columns
//           doc.text(String(cell), x, y + 5);
//         }
//       }
//       x += maxColumnWidths[index];
//     });

//     // Draw row grid lines
//     doc.setLineWidth(0.3); // Light line width for grid
//     doc.setDrawColor(200, 200, 200); // Light gray color
//     doc.line(10, y, pageWidth - 10, y); // Line at the bottom of the row

//     // Accumulate grand totals
//     grandTotalRate += row.Rate;
//     grandTotalAmount += row.Amount;

//     y += rowHeight; // Move y position for the next row
//   });
  
//   // Add Grand Total row
//   const grandTotalRow = [
    
//     "Grand Total", 
//     "",
//     "", 
//     "", 
//     "", 
   
//     grandTotalAmount.toFixed(2),
//     "",
//     ""
   
//   ];

//   let x = 10;
//   doc.setFont("NotoSansMalayalam", "bold");
//   doc.setFontSize(contentFontSize +2);
//   grandTotalRow.forEach((cell, index) => {
//     if (index === 5 || index === 6) {
//       // Align Rate and Total columns to the right
//       doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "right" });
//     } else {
//       // Left-align other columns
//       doc.text(String(cell), x, y + 5);
//     }
//     x += maxColumnWidths[index];
//   });

//   // Draw grid line after Grand Total
//   doc.setLineWidth(0.3);
//   doc.setDrawColor(200, 200, 200);
//   doc.line(10, y, pageWidth - 10, y);

//   y += lineHeight; // Move y position for the Grand Total row

//   // Save PDF
//   // doc.save("bookinbCancelReport.pdf");
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



generatePDF(){
this.reportPrintservice.generatePDF();

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
//           .tabble-heading{
//   margin-top: 10px;
//   font-size: 18px;
//   font-weight: bold;
//   font-family: 'Times New Roman', Times, serif;
//   text-transform: uppercase;
//   color: rgb(8, 8, 49);
//   text-align:left;
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

//   WindowPrt.document.close();
//   WindowPrt.focus();

//   // Make sure that the window is still valid before calling print and close
//   if (WindowPrt) {
//     WindowPrt.print();
//     WindowPrt.close();
//   } 
}

getTotalAmount(): number {
  return this.data.reduce((sum, item) => sum + item.Amount, 0);
}
getNadavaravuTotalAmount(): number {
  return this.nadavaravuDatat.reduce((sum, item) => sum + item.Receipt_Amt, 0);
}
exportToExcel(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1 - Vazhipad Cancel
  if (this.data?.length > 0) {
    const vazhipadRows: any[] = [];

    // Title
    vazhipadRows.push([this.templeName]);
    vazhipadRows.push([this.templeAddress]);
    vazhipadRows.push(['VAZHIPAD BOOKING CANCEL REPORT']);
    vazhipadRows.push([
      `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
    ]);
    vazhipadRows.push([]);

    // Header
    vazhipadRows.push([
      'Bill No',
      'Bill Date',
      'Vazhipad',
      'Name',
      'Qty',
      'Amount',
      'Cancel Date',
      'Remarks'
    ]);

    // Data
    this.data.forEach((item: any) => {
      vazhipadRows.push([
        item.BillNo,
        item.BillDate,
        item.Vazhipad,
        item.Name,
        item.Qty,
        item.Rate,
        item.Canceldt,
        item.Remarks
      ]);
    });

    // Total
    vazhipadRows.push([]);
    vazhipadRows.push([
      '',
      '',
      '',
      '',
      '',
      'TOTAL',
      '',
      this.getTotalAmount()
    ]);

    const ws1 = XLSX.utils.aoa_to_sheet(vazhipadRows);
    ws1['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 10 },
      { wch: 15 },
      { wch: 18 },
      { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(wb, ws1, 'Vazhipad Cancel');
  }

  // Sheet 2 - Nadavaravu Cancel
  if (this.nadavaravuDatat?.length > 0) {
    const nadRows: any[] = [];

    nadRows.push([this.templeName]);
    nadRows.push([this.templeAddress]);
    nadRows.push(['NADAVARAVU CANCEL REPORT']);
    nadRows.push([
      `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
    ]);
    nadRows.push([]);

    nadRows.push([
      'Bill No',
      'Bill Date',
      'Item',
      'Name',
      'Qty',
      'Amount',
      'Cancel Date',
      'Remarks'
    ]);

    this.nadavaravuDatat.forEach((item: any) => {
      nadRows.push([
        item.BillNo,
        item.BillDate,
        this.lang == 'en' ? item.NM_Name : item.NM_RName,
        item.Name,
        item.Qty,
        item.Receipt_Amt,
        item.Canceldt,
        item.Reason
      ]);
    });

    nadRows.push([]);
    nadRows.push([
      '',
      '',
      '',
      '',
      '',
      'TOTAL',
      '',
      this.getNadavaravuTotalAmount()
    ]);

    const ws2 = XLSX.utils.aoa_to_sheet(nadRows);

    ws2['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 10 },
      { wch: 15 },
      { wch: 18 },
      { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(wb, ws2, 'Nadavaravu Cancel');
  }

  // Sheet 3 - Grand Total
  const summary = [
    ['Temple Name', this.templeName],
    ['Report', 'Booking Cancel Report'],
    ['From', this.formatDateToDDMMYYYY(this.fromDate)],
    ['To', this.formatDateToDDMMYYYY(this.toDate)],
    [],
    ['Vazhipad Total', this.getTotalAmount()],
    ['Nadavaravu Total', this.getNadavaravuTotalAmount()],
    ['Grand Total', this.getTotalAmount() + this.getNadavaravuTotalAmount()]
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(summary);
  ws3['!cols'] = [{ wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Summary');

  // Save file
  const excelBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(
    blob,
    `Booking_Cancel_Report_${this.fromDate}_to_${this.toDate}.xlsx`
  );
}

}

