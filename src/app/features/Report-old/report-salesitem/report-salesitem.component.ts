import { Component, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeeCollection } from '../../../models/feecollection.model';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-salesitem',
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
  templateUrl: './report-salesitem.component.html',
  styleUrls: [
    './report-salesitem.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportSalesitemComponent {
  dataSource = new MatTableDataSource<FeeCollection>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 50, 100, 200, 300, 500, 1000];
  pageIndex = 0;
  data: FeeCollection[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: FeeCollection[] } = {};
  currentDate: string = '';
  currentPage: number = 1;
  fromDate: string;
  toDate: string;
  groupedDatas: { [key: string]: any[] } = {};
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
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

  groupDataByName(data: FeeCollection[]): { [key: string]: FeeCollection[] } {
    return data.reduce((acc: any, item: any) => {
      if (!acc[item.Vazhipad]) {
        acc[item.Vazhipad] = [];
      }
      acc[item.Vazhipad].push(item);
      return acc;
    }, {} as { [key: string]: FeeCollection[] });
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
      Type: 'SalesRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
         this.data  = this.data.sort((a: any, b: any) =>
        a.BillNo.localeCompare(b.BillNo, undefined, { numeric: true, sensitivity: 'base' })
        );
        // this.groupDataByTransactionMode(this.data); // Group the data
        this.groupedData = this.groupDataByName(this.data);
        this.dataSource.data = this.data;
        this.loading=false;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
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

  generatePDF() {
    this.reportPrintservice.generatePDF();
  }

  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
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

  getGrandTotalForTrnsMode(item: string): any {
    const items = this.groupedData[item]; 
    if (!items || items.length === 0) {
      return 0; 
    }
    const total = items.reduce((sum, item) => {
      return sum + item.Amount;
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
  excelData.push(['SALES ITEM REPORT']);
  excelData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelData.push([]);

  // ==========================================
  // GROUPED DATA
  // ==========================================
  const groups = Object.keys(this.groupedData);

  groups.forEach((groupName: string) => {
    const rows = this.groupedData[groupName];

    // Section Heading
    excelData.push([groupName]);

    // Column Header
    excelData.push([
      'Bill No',
      'Bill Date',
      'Name',
      'Star',
      'Quantity',
      'Rate',
      'Amount'
    ]);

    // Rows
    rows.forEach((item: any) => {
      excelData.push([
        item.BillNo,
        item.BillDate,
        item.Name,
        item.Star || 'N/A',
        item.Qty,
        item.Rate,
        item.Amount
      ]);
    });

    // Group Total
    excelData.push([
      '',
      '',
      '',
      '',
      '',
      'Total',
      this.getGrandTotalForTrnsMode(groupName)
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
    { wch: 28 }, // Name
    { wch: 15 }, // Star
    { wch: 12 }, // Qty
    { wch: 12 }, // Rate
    { wch: 15 }  // Amount
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Item Report');

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
    `Sales_Item_Report_${new Date().getTime()}.xlsx`
  );
}
}
