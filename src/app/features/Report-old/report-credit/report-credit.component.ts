import { Component } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReportData } from '../../../models/poornam-report';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MembersReport } from '../../../models/members.model';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-credit',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './report-credit.component.html',
  styleUrls: [
    './report-credit.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportCreditComponent {
  data: ReportData[] = [];
  groupedData: { [key: string]: ReportData[] } = {};
  filteredData: ReportData[] = [];
  fromDate: string;
  toDate: string;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  nonmembercreditdata: MembersReport[] = [];
  membercreditdata: MembersReport[] = [];
  loading: boolean;
  constructor(
    private route: ActivatedRoute,
    private ts: TranslateService,
    private reportPrintservice: PrintreportService,
    private service: ReportService,
    private router: Router
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
      // this.fetchmembercreitReportData(type, this.fromDate, this.toDate);
      // this.fetchnonmembercreditReportData(type, this.fromDate, this.toDate);
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: 'DevoteeDueRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:all', data);
        if (data && data.length > 0) {

       
        const filteredData = data.filter((item:any) => item.Due > item.Paid);

      
        this.data = filteredData.sort((a: any, b: any) =>
          a.BillNo?.toString().localeCompare(
            b.BillNo?.toString(),
            undefined,
            { numeric: true, sensitivity: 'base' }
          )
        );

      } else {
        this.data = [];
      }
        this.loading = false;
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
    return this.data.reduce((sum, item) => {
      const balance = item.Due-item.Paid ;
      return sum + (balance < 0 ? 0 : balance);
    }, 0);
  }

  getmemberTotalAmount(): number {
    return this.data.reduce((sum, item) => {
      const balance = item.Due - item.Paid;
      return sum + (balance < 0 ? 0 : balance);
    }, 0);
  }

  getmemberPaidTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + Number(item.Paid), 0);
  }
  getmemberDueTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + Number(item.Due), 0);
  }

  getnonmemberTotalAmount(): number {
    return this.nonmembercreditdata.reduce(
      (sum, item) => sum + Number(item.Amount),
      0
    );
  }

  exportToExcel(): void {
  const workbook = XLSX.utils.book_new();
  const excelData: any[] = [];

  // ==========================================
  // HEADER
  // ==========================================
  excelData.push([this.templeName]);
  excelData.push([this.templeAddress]);
  excelData.push(['CREDIT REPORT']);
  excelData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} To ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelData.push([]);

  // ==========================================
  // MEMBER CREDIT DATA
  // ==========================================
  if (this.data.length > 0) {
    excelData.push(['MEMBER CREDIT / DUE REPORT']);
    excelData.push([
      'Name',
      'Mobile No',
      'Due',
      'Paid',
      'Balance'
    ]);

    this.data.forEach((member: any) => {
      const balance =
        (member.Due - member.Paid) < 0
          ? 0
          : (member.Due - member.Paid);

      excelData.push([
        member.Name,
        member.MobileNo,
        member.Due,
        member.Paid,
        balance
      ]);
    });

    // Totals Row
    excelData.push([
      'TOTAL',
      '',
      this.getmemberDueTotalAmount(),
      this.getmemberPaidTotalAmount(),
      this.getmemberTotalAmount()
    ]);

    excelData.push([]);
  }

  // ==========================================
  // GRAND TOTAL
  // ==========================================
  excelData.push([
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
    { wch: 30 }, // Name
    { wch: 18 }, // Mobile
    { wch: 15 }, // Due
    { wch: 15 }, // Paid
    { wch: 15 }  // Balance
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Credit Report');

  // ==========================================
  // DOWNLOAD FILE
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
    `Credit_Report_${new Date().getTime()}.xlsx`
  );
}

}
