import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {ReportData} from '../../../models/poornam-report'
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
interface ConsolidatedData {
  Vazhipad: string;
  TotalQty: number; // Renamed for clarity
}


@Component({
  selector: 'app-report-vazhipadwise',
  standalone: true,
  imports: [CommonModule,
    SpinnerComponent,
HeaderComponent,TranslateModule,MatTooltipModule,MatFormFieldModule, MatInputModule],
  templateUrl: './report-vazhipadwise.component.html',
  styleUrls: ['./report-vazhipadwise.component.css','/src/assets/styles/report.style.css'],
})
export class ReportVazhipadwiseComponent {
 

  data:ReportData[]=[];
  groupedData: { [key: string]: ReportData[] } = {};
  loading:boolean;
fromDate:string;
toDate:string;
prathista:string;
vazhipad:string;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  constructor(private route: ActivatedRoute, private ts: TranslateService, 
    private reportPrintservice: PrintreportService
    ,
    private service: ReportService,private router: Router,  private http:HttpClient) {

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
      this. prathista = params['Prathishta'];
      this. vazhipad=params['Vazhipad'];
      this. fromDate = params['fromDate'];
      this. toDate = params['toDate'];
      this.fetchReportData( this.fromDate, this.toDate);
    });
  }



 // Call your API service to get the report data
  fetchReportData( fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: "vazhipad",
      FromDate: fromDate,
      ToDate:toDate,
      PMId:this.prathista,
      VazhId:this.vazhipad.trim()
    };
    
    this.service.getVazhipadWiseReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
       
    
      this.groupedData = this.groupByVazhipad(data);
        this.loading=false;
        
       
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  groupByVazhipad(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce((acc, current) => {
        const key = `${current.Vazhipad}-${current.Prathista}`; 
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(current);
        return acc;
    }, {} as { [key: string]: ReportData[] });
  }

  getTotalAmounts(entries: ReportData[]): number {
    return entries.reduce((total, entry) => total + (entry.Amount || 0), 0);
  }

 
  
  goBack(): void {
   
    this.router.navigate(['/getReport']);


    if (window.history.length > 1) {
      window.history.back(); 
    } else {
      window.close(); 
    }


  }

formatDateToDDMMYYYY(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}



getTotalAmount(): number {
  return this.data.reduce((sum, item) => sum + item.Amount, 0);
} 

generatePDF(){
 this.reportPrintservice.generatePDF()

}
  

exportToExcel(): void {

  const workbook = XLSX.utils.book_new();
  const excelData: any[] = [];

  /* ============== HEADER ============== */
  excelData.push([this.templeName]);
  excelData.push([this.templeAddress]);
  excelData.push(['VAZHIPAD WISE REPORT']);
  excelData.push([
    `${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`
  ]);
  excelData.push([]);

  /* ============== DATA ============== */
  Object.keys(this.groupedData).forEach((key: string) => {

    const group = this.groupedData[key];

    // GROUP TITLE (Vazhipad - Prathista)
    excelData.push([key]);

    // TABLE HEADER
    excelData.push([
      'SINO',
      'BILL NO',
      'BILL DATE',
      'VAZHIPAD DATE',
      'NAME',
      'STAR',
      'QTY',
      'RATE',
      'AMOUNT'
    ]);

    // ROWS
    group.forEach((entry: any, index: number) => {
      excelData.push([
        index + 1,
        entry.BillNo,
        entry.BillDate,
        entry.VazhiDate,
        entry.Name,
        entry.Star,
        entry.Qty,
        Number(entry.Rate || 0),
        Number(entry.Amount || 0)
      ]);
    });

    // GROUP TOTAL
    excelData.push([
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'TOTAL',
      this.getTotalAmounts(group)
    ]);

    excelData.push([]);
  });

  /* ============== GRAND TOTAL ============== */
  excelData.push([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'GRAND TOTAL',
    this.getTotalAmount()
  ]);

  /* ============== CREATE SHEET ============== */
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  /* ============== COLUMN WIDTH ============== */
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 }
  ];

  /* ============== MERGE HEADER ============== */
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vazhipad Report');

  /* ============== DOWNLOAD ============== */
  const buffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  saveAs(
    new Blob([buffer]),
    `Vazhipad_Report_${new Date().getTime()}.xlsx`
  );
}


}
