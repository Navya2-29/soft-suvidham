import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginatorModule,
} from '@angular/material/paginator';
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
  selector: 'app-donation-report',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule, MatFormFieldModule, TranslateModule, MatInputModule, MatIconModule,
    SpinnerComponent
  ],
  templateUrl: './donation-report.component.html',
  styleUrls: ['./donation-report.component.css', '/src/assets/styles/report.style.css'],
})
export class DonationReportComponent {
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
  pageSizeOptions: number[] = [10, 50, 100, 200, 300, 500, 1000];
  pageIndex = 0;
  data: ReportDailyStmt[] = [];
  fromDate: string;
  toDate: string;
  loading: boolean;
  currentDate: string = '';
  counterId: string | null;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  groupedData: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http: HttpClient,
    private ts: TranslateService,
    private reportPrintservice: PrintreportService
  ) {
    this.counterId = localStorage.getItem('Counter')
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
    });
  }
  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }
  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: "DonationRpt",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        this.data = data.sort((a: any, b: any) =>
          a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
        );
        this.groupedData = this.groupByVazhipad(this.data);
        this.data = this.data;
        this.dataSource.data = this.data;
        this.length = data.length;
        this.loading = false;

      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
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
        return 'Bank';
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

  getGrandTotal(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }




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
    //       console.error('Unable to open print window. Please check pop-up blockers.');
    //       return;
    //     }

    //     WindowPrt.document.write(`
    //       <html>
    //         <head>
    //           <title>Print</title>
    //           <style>

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

  exportToExcel(): void {

    const excelData: any[] = [];

    // Header
    excelData.push({
      A: this.templeName
    });

    excelData.push({
      A: this.templeAddress
    });

    excelData.push({
      A: 'DONATION REPORT'
    });

    excelData.push({
      A:
        this.formatDateToDDMMYYYY(this.fromDate) +
        ' to ' +
        this.formatDateToDDMMYYYY(this.toDate)
    });

    excelData.push({});

    // Data Rows
    this.data.forEach((item: any) => {
      excelData.push({
        BILLDATE: item.BillDate,
        BILLNO: item.BillNo,
        VAZHIPAD: item.Vazhipad,
        PRATHISTA: item.Prathista,
        NAME: item.Name,
        RATE: item.Rate,
        AMOUNT: item.Amount
      });
    });

    // Total Row
    excelData.push({
      BILLDATE: '',
      BILLNO: '',
      VAZHIPAD: '',
      PRATHISTA: '',
      NAME: '',
      RATE: 'TOTAL',
      AMOUNT: this.getTotalAmount()
    });

    // Worksheet
    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(excelData, {
        skipHeader: false
      });

    // Column Widths
    worksheet['!cols'] = [
      { wch: 16 },
      { wch: 18 },
      { wch: 28 },
      { wch: 22 },
      { wch: 28 },
      { wch: 14 },
      { wch: 16 }
    ];

    // Workbook
    const workbook: XLSX.WorkBook = {
      Sheets: { Report: worksheet },
      SheetNames: ['Report']
    };

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
      `Donation_Report_${this.fromDate}_to_${this.toDate}.xlsx`
    );
  }

 

groupByVazhipad(data: any[]): any[] {
  const vazhipadGroups: any = {};

  data.forEach((item: any) => {
    const vazhipadKey = item.Vazhipad?.trim();
    const transModeKey = this.getTransactionType(item.TrnsMode); // CASH, UPI etc.

    // Level 1 → Vazhipad
    if (!vazhipadGroups[vazhipadKey]) {
      vazhipadGroups[vazhipadKey] = {
        vazhipad: vazhipadKey,
        transModes: {},
        totalAmount: 0
      };
    }

    const vazhipadGroup = vazhipadGroups[vazhipadKey];

    // Level 2 → Transaction Mode
    if (!vazhipadGroup.transModes[transModeKey]) {
      vazhipadGroup.transModes[transModeKey] = {
        transMode: transModeKey,
        items: [],
        totalAmount: 0
      };
    }

    const transGroup = vazhipadGroup.transModes[transModeKey];

    transGroup.items.push(item);
    transGroup.totalAmount += item.Amount || 0;

    vazhipadGroup.totalAmount += item.Amount || 0;
  });

  // Convert object → array
  return Object.values(vazhipadGroups).map((v: any) => ({
    ...v,
    transModes: Object.values(v.transModes)
  }));
}

}
