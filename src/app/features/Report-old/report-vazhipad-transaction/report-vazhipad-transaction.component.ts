import { Component, inject } from '@angular/core';
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
import { MasterService } from '../../../services/master/master.service';
import { Vmaster } from '../../../models/vmaster.model';
@Component({
  selector: 'app-report-vazhipad-transaction',
  standalone: true,
  imports: [CommonModule,
    SpinnerComponent,
    HeaderComponent,TranslateModule,MatTooltipModule,MatFormFieldModule, MatInputModule],
  templateUrl: './report-vazhipad-transaction.component.html',
  styleUrls: ['./report-vazhipad-transaction.component.css','/src/assets/styles/report.style.css'],
})
export class ReportVazhipadTransactionComponent {


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
  Vmaster: Vmaster[] = [];
  
   private masterService = inject(MasterService);
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
    this.getAllvazhipad()
  }



 // Call your API service to get the report data
  fetchReportData( fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: "vazhipadOnly",
      FromDate: fromDate,
      ToDate:toDate,
      PMId:'',
      VazhId:this.vazhipad.trim()
    };
    // console.log(payLoad,"ppp")
    this.service.getVazhipadWiseReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
       
      // this.consolidateData()
      this.groupedData = this.groupByVazhipad(data);
        this.loading=false;
        
        // console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  groupByVazhipad(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce((acc, current) => {
        const key = `${current.TrnsMode}`; 
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
  
  


getvazhipadbyid(){

// this.Vmaster.forEach(item => console.log(item.VM_Id, typeof item.VM_Id));
 const matchitem = this.Vmaster.find((item) => item.VM_Id.toString() == this.vazhipad.trim());
 return matchitem?matchitem.VM_Name:""
  
    
  
}
getAllvazhipad(){
 this.masterService.getVmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // console.log(data);
          this.Vmaster = data;
         
        }
      },
      error: (error) => {
        // this.notification.showError('Try after some Time');
      },
    });
  
}

 getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        if (this.lang == 'en') {
          return 'BANK';
        } else {
          return 'ബാങ്ക്';
        }

      case 'CS':
        if (this.lang == 'en') {
          return 'CASH';
        } else {
          return 'ക്യാഷ്';
        }
      case 'MO':
        if (this.lang == 'en') {
          return 'MONEY ORDER';
        } else {
          return 'മണി ഓർഡർ';
        }
      case 'UP':
        if (this.lang == 'en') {
          return 'UPI';
        } else {
          return 'യുപിഐ';
        }

      case 'CH':
        if (this.lang == 'en') {
          return 'CHEQUE';
        } else {
          return 'ചെക്ക്';
        }
      case 'CR':
        if (this.lang == 'en') {
          return 'CREDIT';
        } else {
          return 'ക്രെഡിറ്റ്';
        }
      case 'DE':
        if (this.lang == 'en') {
          return 'DEBIT';
        } else {
          return 'ഡെബിറ്റ്';
        }
         case 'EN':
        if (this.lang == 'en') {
          return 'ENDOWMENT';
        } else {
          return 'എൻഡോമെന്റ്';
        }
      default:
        return 'OTHERS';
    }
  }

}
