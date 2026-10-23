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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NadavaravReport } from '../../../models/nadavarav.model';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-vihidham',
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
  templateUrl: './report-vihidham.component.html',
  styleUrls: [
    './report-vihidham.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportVihidhamComponent {
  data: NadavaravReport[] = [];
  groupedData: { [key: string]: NadavaravReport[] } = {};
  currentDate: string = '';

  fromDate: string;
  toDate: string;
  groupedDatas: { [key: string]: any[] } = {};
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  filtereddata: any[] = [];
  loading:boolean;
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http: HttpClient,
    private ts: TranslateService,
    private reportPrintservice: PrintreportService
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

  generatePDF() {
    this.reportPrintservice.generatePDF();
  }
  groupData() {
    this.groupedDatas = this.data.reduce((acc: any, curr: any) => {
      const { category, NM_Name, Qty, Rate } = curr;
      if (!acc[category]) {
        acc[category] = {};
      }
      if (!acc[category][NM_Name]) {
        acc[category][NM_Name] = { Qty: 0, Rate, Amount: 0 };
      }
      acc[category][NM_Name].Qty += Qty;
      acc[category][NM_Name].Amount =
        acc[category][NM_Name].Rate * acc[category][NM_Name].Qty;
      return acc;
    }, {});
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'VihidhamRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;

        const fromDate = new Date(this.fromDate);
        const toDate = new Date(this.toDate);
        // Reset time to 00:00:00 for comparison
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        data.forEach((item: any) => {
          const fDate = new Date(item.FDate);
          const tDate = new Date(item.ToDate);
          fDate.setHours(0, 0, 0, 0);
          tDate.setHours(23, 59, 59, 999);

          const isMatch = !(tDate < fromDate || fDate > toDate);
          console.log(
            `FDate=${fDate.toDateString()}, ToDate=${tDate.toDateString()}, Match=${isMatch}`
          );
        });
        this.filtereddata = this.data.filter((item: any) => {
          const fDate = new Date(item.FDate);
          const tDate = new Date(item.ToDate);

          // Reset their time to ignore mismatch due to hours
          fDate.setHours(0, 0, 0, 0);
          tDate.setHours(23, 59, 59, 999); // include full end date

          // Check if ranges overlap
          return !(tDate < fromDate || fDate > toDate);
        });
        console.log(this.filtereddata, 'filtered data');
        this.groupDataByTransactionMode(this.filtereddata); // Group the data
        // this.data = data.sort((a: any, b: any) => {
        //   const [numA, denomA] = a.BillNo.split('/').map(Number);
        //   const [numB, denomB] = b.BillNo.split('/').map(Number);

        //   // Compare the two parts: first compare the numerator, then the denominator
        //   return numA - numB || denomA - denomB;
        // });
        this.loading=false;
        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  // Grouping function
 groupDataByTransactionMode(data: any[]): void {
  this.groupedData = data.reduce((acc, item) => {
    // Convert date strings to Date objects for comparison
    const evazDate = new Date(item.Evazdate);
    const fromDate = new Date(item.FDate);
    const toDate = new Date(item.ToDate);

    // Filter: Only include item if Evazdate is within FDate and ToDate
    if (evazDate < fromDate || evazDate > toDate) {
      return acc; // Skip this item
    }

    const name = item.Name;

    if (!acc[name]) {
      acc[name] = [];
    }

    const existing = acc[name].find((i: any) => i.Vazhipad === item.Vazhipad && i.Rate === item.Rate);

    if (existing) {
      existing.Qty += item.Qty;
    } else {
      acc[name].push({ ...item }); // create a new entry
    }

    return acc;
  }, {});
}

  


  goBack(): void {
    console.log('Going back...');
    this.router.navigate(['/getReport']);

    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  }


  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }


  getOverallGrandTotal(): number {
    let grandTotal = 0;
    for (const category in this.groupedData) {
      if (this.groupedData.hasOwnProperty(category)) {
        grandTotal += this.getGrandTotalForTrnsMode(category);
      }
    }
    return grandTotal;
  }
  

  getGrandTotalForTrnsMode(item: string): any {
    const items = this.groupedData[item];
    if (!items || items.length === 0) {
      return 0;
    }
    const total = items.reduce((sum, item) => {
      return sum + item.Qty * item.Rate;
    }, 0);

    return total;
  }

exportToExcel(): void {
  const workbook = XLSX.utils.book_new();
  const excelData: any[] = [];

  // ==========================================
  // HEADER
  // ==========================================
  excelData.push([this.templeName]);
  excelData.push([this.templeAddress]);
  excelData.push(['VIHIDHAM REPORT']);
  excelData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelData.push([]);

  // ==========================================
  // GROUPED DATA
  // ==========================================
  const categories = Object.keys(this.groupedData);

  categories.forEach((category: string) => {
    const rows = this.groupedData[category];

    // Section Title
    excelData.push([category.toUpperCase()]);

    // Column Header
    excelData.push([
      'Vazhipad',
      'Quantity',
      'Rate',
      'Amount'
    ]);

    // Data Rows
    rows.forEach((item: any) => {
      excelData.push([
        item.Vazhipad,
        item.Qty,
        item.Rate,
        item.Qty * item.Rate
      ]);
    });

    // Category Total
    excelData.push([
      '',
      '',
      'Total',
      this.getGrandTotalForTrnsMode(category)
    ]);

    excelData.push([]);
  });

  // ==========================================
  // OVERALL GRAND TOTAL
  // ==========================================
  excelData.push([
    '',
    '',
    'Grand Total',
    this.getOverallGrandTotal()
  ]);

  // ==========================================
  // CREATE SHEET
  // ==========================================
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  worksheet['!cols'] = [
    { wch: 35 }, // Vazhipad
    { wch: 12 }, // Qty
    { wch: 15 }, // Rate
    { wch: 18 }  // Amount
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vihidham Report');

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
    `Vihidham_Report_${new Date().getTime()}.xlsx`
  );
}
}
