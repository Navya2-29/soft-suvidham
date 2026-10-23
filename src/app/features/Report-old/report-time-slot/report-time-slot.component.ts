import { Component, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportDailyStmt } from '../../../models/dailytrasaction.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-report-time-slot',
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
  templateUrl: './report-time-slot.component.html',
  styleUrls: [
    './report-time-slot.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportTimeSlotComponent {
  data: ReportDailyStmt[] = [];
  fromDate: string;
  toDate: string;
  creditTransactionArray: any[];
  loading: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: {
  [vazhipad: string]: {
    [timeslot: string]: any[];
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

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = 'TimeSlotRpt';
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;

    const payLoad = {
      Type: 'TimeSlotRpt',
      FromDate: fromDate,
      ToDate: toDate,
    };

    this.service.getReport(payLoad).subscribe({
      next: (filteredData) => {
        this.data = filteredData;
        this.groupedData = this.groupByVazhipadAndTimeslot(filteredData);
        console.log('Grouped Data:', this.groupedData);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
        this.loading = false;
      },
    });
  }

  groupByVazhipadAndTimeslot(data: any[]) {
  const grouped: any = {};

  data.forEach((item) => {
    const vazhipad = item.Vazhipad || 'Unknown Vazhipad';
    const timeslot = item.Timeslot || 'No Time Slot';

    if (!grouped[vazhipad]) grouped[vazhipad] = {};
    if (!grouped[vazhipad][timeslot]) grouped[vazhipad][timeslot] = [];

    grouped[vazhipad][timeslot].push(item);
  });

  return grouped;
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

  exportToExcel(): void {

  const workbook = XLSX.utils.book_new();
  const excelRows: any[] = [];

  /* ===============================
     REPORT HEADER
  =============================== */
  excelRows.push([this.templeName]);
  excelRows.push([this.templeAddress]);
  excelRows.push(['TIME-SLOT BASED REPORT']);
  excelRows.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelRows.push([]);

  /* ===============================
     GROUPED DATA
  =============================== */

  Object.keys(this.groupedData).forEach((slot: any) => {

    // Time Slot Heading
    excelRows.push([slot]);
    excelRows.push([]);

    const slotData = this.groupedData[slot];

    Object.keys(slotData).forEach((category: any) => {

      // Category Heading
      excelRows.push([category]);

      // Table Header
      excelRows.push([
        'Bill No',
        'Name',
        'Star'
      ]);

      const categoryItems = slotData[category];

      Object.keys(categoryItems).forEach((key: any) => {

        const item = categoryItems[key];

        excelRows.push([
          item.BillNo,
          item.Name,
          item.Star
        ]);

      });

      excelRows.push([]);
    });

    excelRows.push([]);
  });

  /* ===============================
     CREATE SHEET
  =============================== */

  const worksheet = XLSX.utils.aoa_to_sheet(excelRows);

  worksheet['!cols'] = [
    { wch: 18 }, // Bill No
    { wch: 30 }, // Name
    { wch: 20 }  // Star
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Time Slot Report');

  /* ===============================
     SAVE FILE
  =============================== */

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(
    blob,
    `Time_Slot_Report_${this.fromDate}_to_${this.toDate}.xlsx`
  );
}
}
