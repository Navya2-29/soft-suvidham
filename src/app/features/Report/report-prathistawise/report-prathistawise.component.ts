import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { jsPDF } from 'jspdf'; 
import {ReportData} from '../../../models/poornam-report'
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MasterService } from '../../../services/master/master.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatIconModule } from '@angular/material/icon';
interface ConsolidatedData {
  Vazhipad: string;
  TotalQty: number; // Renamed for clarity
}
@Component({
  selector: 'app-report-prathistawise',
  standalone: true,
  imports: [CommonModule,MatIconModule,
    SpinnerComponent,
HeaderComponent,TranslateModule,MatTooltipModule,MatFormFieldModule, MatInputModule],
  templateUrl: './report-prathistawise.component.html',
  styleUrls: ['./report-prathistawise.component.css','/src/assets/styles/report.style.css']
})
export class ReportPrathistawiseComponent {
 data:ReportData[]=[];
  groupedData: { [key: string]: ReportData[] } = {};
  loading:boolean;
fromDate:string;
toDate:string;
prathista:string;
vazhipad:string;
pmaster:any[]=[];
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  constructor(private route: ActivatedRoute, private ts: TranslateService, 
    private reportPrintservice: PrintreportService,private masterService:MasterService
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
      this. prathista = params['prathista'];
      this. vazhipad=params['Vazhipad'];
      this. fromDate = params['fromDate'];
      this. toDate = params['toDate'];
      this.fetchReportData( this.fromDate, this.toDate);
    });
    this.getPrathistaList()
  }
getPrathistaNameByCode(id: string): string {
  const prathista = this.pmaster.find(
    (item: any) => item.PM_ID == id
  );
  if (!prathista) {
    return ''; 
  }
   return prathista.PM_Name;  
}


 // Call your API service to get the report data
  fetchReportData( fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: "PrethistaOnly",
      FromDate: fromDate,
      ToDate:toDate,
      PMId:this.prathista,
      VazhId:""
    };
    console.log(payLoad,"ppp")
    this.service.getVazhipadWiseReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
       
      // this.consolidateData()
      this.groupedData = this.groupByVazhipad(data);
        this.loading=false;
        
        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  groupByVazhipad(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce((acc, current) => {
        const key = `${current.Vazhipad}`; 
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
  return `${day}/${month}/${year}`;
}



getTotalAmount(): number {
  return this.data.reduce((sum, item) => sum + item.Amount, 0);
} 

generatePDF(){
 this.reportPrintservice.generatePDF()

}
  
  
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

getPrathistaList(){
  this.masterService.getPmaster().subscribe({
    next: (data) => {
      if (data && data.length > 0) {
        this.pmaster = data;
        console.log(this.pmaster,"prathista");
      }
    },
    error: (error) => {
      console.log(error);
      // this.loading = true;
    },
  });
}
exportToExcel(): void {
  const workbook = XLSX.utils.book_new();
  const excelData: any[] = [];

  // ==========================================
  // HEADER
  // ==========================================
  excelData.push([this.templeName]);
  excelData.push([this.templeAddress]);
  excelData.push([
    `PRATHISTAWISE REPORT (${this.getPrathistaNameByCode(this.prathista)})`
  ]);
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

    // Group Heading
    excelData.push([groupName]);

    // Column Header
    excelData.push([
      'SI No',
      'Bill No',
      'Bill Date',
      'Vazhipad Date',
      'Name',
      'Star',
      'Quantity',
      'Rate',
      'Amount'
    ]);

    // Rows
    rows.forEach((entry: any, index: number) => {
      excelData.push([
        index + 1,
        entry.BillNo,
        entry.BillDate,
        entry.VazhiDate,
        entry.Name,
        entry.Star,
        entry.Qty,
        entry.Rate,
        entry.Amount
      ]);
    });

    // Group Total
    excelData.push([
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'Total',
      this.getTotalAmounts(rows)
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
    { wch: 8 },   // SI No
    { wch: 12 },  // Bill No
    { wch: 15 },  // Bill Date
    { wch: 15 },  // Vazhipad Date
    { wch: 28 },  // Name
    { wch: 15 },  // Star
    { wch: 10 },  // Qty
    { wch: 12 },  // Rate
    { wch: 15 }   // Amount
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Prathistawise Report');

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
    `Prathistawise_Report_${new Date().getTime()}.xlsx`
  );
}

}
