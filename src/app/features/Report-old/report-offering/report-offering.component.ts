import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';import {ReportData} from '../../../models/poornam-report'
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
interface ConsolidatedData {
  Vazhipad: string;
  TotalQty: number;
}
@Component({
  selector: 'app-report-offering',
  standalone: true,
  imports: [CommonModule, MatTableModule,SpinnerComponent,MatIconModule, TranslateModule,MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule],
  templateUrl: './report-offering.component.html',
  styleUrls: ['./report-offering.component.css','/src/assets/styles/report.style.css'],
})
export class ReportOfferingComponent {
  displayedColumns: string[] = ['SINo','VAZHIPAD',  'QUANTITY', ];
  dataSource = new MatTableDataSource<ConsolidatedData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  loading:boolean;
fromDate:string;
toDate:string;
lang:string|null;
templeName:string|null;
templeAddress:string|null;
  consolidatedData: ConsolidatedData[] = [];
  constructor(private route: ActivatedRoute,private ts: TranslateService, 
            private reportPrintservice:PrintreportService,
     
    private service: ReportService,private router: Router,  private http:HttpClient) {
    this.lang=localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address'; 
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
  }

  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Qty, 0);
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
      Type: "Offering",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
       
      this.consolidateData()
      
        this.dataSource.data = this.consolidatedData
        this.length =this.consolidatedData.length; 
        this.dataSource.paginator = this.paginator;
        this.loading=false;
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

  




  consolidateData() {
    this.consolidatedData = this.data.reduce((acc: ConsolidatedData[], current: ReportData) => {
      // Convert Qty to a number if it's a string
      const qty = typeof current.Qty === 'string' ? parseFloat(current.Qty) : current.Qty;

      // Find if the Vazhipad already exists in the accumulator
      const existing = acc.find(item => item.Vazhipad === current.Vazhipad);

      if (existing) {
        // If it exists, add the quantity
        existing.TotalQty += qty; // Use the converted qty
      } else {
        // If it doesn't exist, push a new object with the current Vazhipad and Qty
        acc.push({ Vazhipad: current.Vazhipad, TotalQty: qty }); // Use the converted qty
      }

      return acc;
    }, []);
    this.consolidatedData.sort((a, b) => a.Vazhipad.localeCompare(b.Vazhipad));
    console.log(this.consolidatedData); // Corrected reference to consolidatedData
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
   
formatDateToDDMMYYYY(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
}


generatePDF(){
  this.reportPrintservice.generatePDF()
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

  
//   generatePDF() {
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
//     const headerHeight = 35; // Increased header height
//     const footerHeight = 8;
//     const lineHeight = 10;
//     const tableHeaderFontSize = 11;
//     const contentFontSize = 10;
//     const currentDate = new Date().toLocaleDateString();
  
//     const maxColumnWidths = [30, 100, 30]; // Column widths for each column (adjusted)
//     const headers = ["SINO", "VAZHIPAD", "QUANTITY"];
  
//     let y = headerHeight;
//     let grandTotalQty = 0;
  
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
//       doc.text("Vazhipad Report", pageWidth / 2, 27, { align: "center" });
  
//       // Add current date below the report title but above the table header
//       doc.setFontSize(10);
//       doc.setFont("NotoSansMalayalam", "normal");
//       doc.text(`${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`, pageWidth / 2, 32, { align: "center" });
  
//       doc.setLineWidth(0.5);
//       doc.line(10, y, pageWidth - 10, y); // Line below header
//       y += 3; // Space below the line
//     };
  
//     // Draw Footer (Centered page number)
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
  
//     // Initialize PDF
//     drawHeader();
//     drawFooter(1);
//     drawTableHeader();
  
//     let pageNum = 1;
//     let siNo = 1; // Initialize serial number
  
//     // Iterate over API data and draw rows
//     this.consolidatedData.forEach((row: any) => {
//       const tableRow = [
//         siNo.toString(), // Serial number as the first column
//         row.Vazhipad, // Vazhipad
//         row.TotalQty.toString(), // Total Quantity
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
//         if (index === 2) {
//           // Align "TOTAL QTY" column to the right
//           doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "center" });
//         } else {
//           // Left-align other columns
//           doc.text(String(cell), x, y + 5);
//         }
//         x += maxColumnWidths[index];
//       });
  
//       // Draw row grid lines
//       doc.setLineWidth(0.3); // Light line width for grid
//       doc.setDrawColor(200, 200, 200); // Light gray color
//       doc.line(10, y, pageWidth - 10, y); // Line at the bottom of the row
  
//       // Increment the serial number for the next row
//       siNo++;
  
//       // Accumulate total quantity
//       grandTotalQty += row.TotalQty;
  
//       y += rowHeight; // Move y position for the next row
//     });
  
//     // Add Grand Total row
//     const grandTotalRow = [
//       "",
//       "Grand Total", 
//       grandTotalQty.toString()
//     ];
  
//     let x = 10;
//     doc.setFont("NotoSansMalayalam", "bold");
//     doc.setFontSize(contentFontSize);
//     grandTotalRow.forEach((cell, index) => {
//       if (index === 2) {
//         // Align "TOTAL QTY" column to the right
//         doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "center" });
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
//     // doc.save("VazhipadReport.pdf");
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
exportToExcel(): void {

  const workbook = XLSX.utils.book_new();

  // ==========================================
  // Sheet Data Array
  // ==========================================
  const excelData: any[] = [];

  // Header
  excelData.push([this.templeName]);
  excelData.push([this.templeAddress]);
  excelData.push(['OFFERING REPORT']);
  excelData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelData.push([]);

  // ==========================================
  // Table Header
  // ==========================================
  excelData.push([
    'SI No',
    'Vazhipad',
    'Quantity'
  ]);

  // ==========================================
  // Rows
  // ==========================================
  this.data.forEach((item: any, index: number) => {
    excelData.push([
      index + 1,
      item.Vazhipad,
      item.Qty
    ]);
  });

  // ==========================================
  // Total
  // ==========================================
  const totalQty =
    this.data.reduce(
      (sum: number, item: any) =>
        sum + Number(item.Qty || 0),
      0
    );

  excelData.push([]);
  excelData.push([
    '',
    'Grand Total',
    totalQty
  ]);

  // ==========================================
  // Worksheet
  // ==========================================
  const worksheet =
    XLSX.utils.aoa_to_sheet(excelData);

  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 35 },
    { wch: 15 }
  ];

  // ==========================================
  // Add Sheet
  // ==========================================
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Offering Report'
  );

  // ==========================================
  // Save File
  // ==========================================
  const excelBuffer: any =
    XLSX.write(workbook, {
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
    `Offering_Report_${new Date().getTime()}.xlsx`
  );
}
}
