import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
interface ReportData {
  VTime: number;
  Vazhipad: string;
  Prathista: string;
  Name: string;
  Star: string;
  Qty: number;
  Address1: string;
  Address2: string;
  MobileNo: string;
  Type: string;
  Address3: string;
  VazhiDate:string;
}
@Component({
  selector: 'app-report-view',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    MatTableModule,
    MatIconModule,
    TranslateModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './report-view.component.html',
  styleUrls: [
    './report-view.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportViewComponent implements OnInit {
  loading: boolean;
  data: ReportData[] = [];

  groupedData: {
    [vtime: string]: {
      [prathista: string]: { [vazhipad: string]: ReportData[] };
    };
  } = {};
  fromDate: string;
  toDate: string;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  constructor(
    private route: ActivatedRoute,
    private ts: TranslateService,
    private service: ReportService,
    private router: Router,

    private reportPrintservice: PrintreportService,
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
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading = true;
    const payLoad = {
      Type: type,
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;

        const groupedByVtime = this.groupByVtime(data);

        this.groupedData = this.groupByPrathistaThenVazhipad(groupedByVtime);

        this.loading = false;
        console.log(this.groupedData, 'grouped data');
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  groupByVazhipad(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce(
      (acc, current) => {
        const key = `${current.Vazhipad}-${current.Prathista}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(current);
        return acc;
      },
      {} as { [key: string]: ReportData[] },
    );
  }

  groupByVtime(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce(
      (acc, current) => {
        const key = current.VTime;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(current);
        return acc;
      },
      {} as { [key: string]: ReportData[] },
    );
  }

  groupByPrathistaThenVazhipad(groupedByVtime: {
    [vtime: string]: ReportData[];
  }): {
    [vtime: string]: {
      [prathista: string]: { [vazhipad: string]: ReportData[] };
    };
  } {
    const result: {
      [vtime: string]: {
        [prathista: string]: { [vazhipad: string]: ReportData[] };
      };
    } = {};

    for (const vtimeKey in groupedByVtime) {
      if (groupedByVtime.hasOwnProperty(vtimeKey)) {
        const items = groupedByVtime[vtimeKey];
        result[vtimeKey] = {};

        items.forEach((item) => {
          if (!result[vtimeKey][item.Prathista]) {
            result[vtimeKey][item.Prathista] = {};
          }
          if (!result[vtimeKey][item.Prathista][item.Vazhipad]) {
            result[vtimeKey][item.Prathista][item.Vazhipad] = [];
          }
          result[vtimeKey][item.Prathista][item.Vazhipad].push(item);
        });
      }
    }

    return result;
  }

  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
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

  getTimeForBill(time: any) {
    switch (time.toString()) {
      case '0':
        if (this.lang == 'en') {
          return 'Any Time';
        } else {
          return 'എപ്പോൾ വേണമെങ്കിലും';
        }

      case '1':
        if (this.lang == 'en') {
          return 'Morning';
        } else {
          return 'രാവിലെ';
        }
      case '2':
        if (this.lang == 'en') {
          return 'Evening';
        } else {
          return 'വൈകുന്നേരം';
        }
      case '3':
        if (this.lang == 'en') {
          return 'Night';
        } else {
          return 'രാത്രി';
        }
      default:
        return 'OTHERS';
    }
  }

  generatePDF() {
    this.reportPrintservice.generatePDF();
  }
exportToExcel(): void {
  const workbook = XLSX.utils.book_new();
  const sheetData: any[][] = [];

  // Header
  sheetData.push([this.templeName]);
  sheetData.push([this.templeAddress]);
  sheetData.push(['POORNAM REPORT']);
  sheetData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} - ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  sheetData.push([]);

  // LOOP: Time Groups
  Object.keys(this.groupedData).forEach((timeKey, i) => {
    const timeGroup = this.groupedData[timeKey];

    // Time Heading
    sheetData.push([`Time: ${this.getTimeForBill(timeKey)}`]);
    sheetData.push([]);

    // LOOP: Prathista
    Object.keys(timeGroup).forEach((prathistaKey) => {
      const prathistaGroup = timeGroup[prathistaKey];

      sheetData.push([`Prathista: ${prathistaKey}`]);
      sheetData.push([]);

      // LOOP: Vazhipad
      Object.keys(prathistaGroup).forEach((vazhipadKey) => {
        const vazhipadGroup = prathistaGroup[vazhipadKey];

        sheetData.push([`Vazhipad: ${vazhipadKey}`]);

        // Table Header
        sheetData.push([
          'Sl No',
          'Name',
          'Star',
          'Gothram',
          'Qty',
          'Address',
          'Type'
        ]);

        // Table Rows
        vazhipadGroup.forEach((entry: any, index: number) => {
          sheetData.push([
            index + 1,
            entry.Name,
            entry.Star,
            entry.Address3,
            entry.Qty,
            `${entry.Address1} ${entry.Address2} ${entry.MobileNo}`,
            entry.Type === 'Counter'
              ? 'CTR'
              : entry.Type === 'Online'
              ? 'OL'
              : entry.Type
          ]);
        });

        sheetData.push([]); // space after each vazhipad
      });

      sheetData.push([]); // space after each prathista
    });

    sheetData.push([]); // space after each time group
  });

  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Optional: column width
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 8 },
    { wch: 40 },
    { wch: 10 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Poornam Report');

  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const fileData: Blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(fileData, `Poornam_Report_${new Date().getTime()}.xlsx`);
}
downloadExcel(data: any[]): void {
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

  const workbook: XLSX.WorkBook = {
    Sheets: { 'Poornam Report': worksheet },
    SheetNames: ['Poornam Report'],
  };

  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob: Blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });

  saveAs(blob, `Poornam_Report_${new Date()}.xlsx`);
}
formatDate(date: string): string {
  if (!date) return '';

  const d = new Date(date); // converts ISO date properly

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}
}
