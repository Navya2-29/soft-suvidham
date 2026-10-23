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

import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportDailyStmt } from '../../../models/dailytrasaction.model';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
interface GroupedData {
  [key: number]: {  // CounterId level
    counterTotalAmount: number;  // Store total amount per CounterId
    users: {
      [key: string]: {  // Cuser level
        transactions: ReportDailyStmt[];
        totalAmount: number;  // Store total amount per user
      };
    };
  };
}
@Component({
  selector: 'app-report-counter-transaction',
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
  
  ],
  templateUrl: './report-counter-transaction.component.html',
  styleUrl: './report-counter-transaction.component.css'
})
export class ReportCounterTransactionComponent {
 
  data: ReportDailyStmt[] = [];
  fromDate: string;
  toDate: string;
  groupedData: GroupedData = {};
  currentDate: string = '';
  currentPage: number = 1;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http: HttpClient,
    private ts: TranslateService
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
    const payLoad = {
      Type: "DailyStmt",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
        // this.groupDataByTransactionMode(this.data); // Group the data
        // const groupedData =this. groupByCounterAndUser(data);
        this.groupData();
        

        // console.log(groupedData,"dattata");
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }



  groupData() {
    this.groupedData = this.data.reduce((acc: any, item: any) => {
      // Initialize CounterId if not exists
      if (!acc[item.CounterId]) {
        acc[item.CounterId] = {
          counterTotalAmount: 0, // Initialize counter-wise total
          users: {}
        };
      }
  
      // Initialize Cuser if not exists
      if (!acc[item.CounterId].users[item.Cuser]) {
        acc[item.CounterId].users[item.Cuser] = {
          transactions: [],
          totalAmount: 0
        };
      }
  
      // Add transaction to user's transaction list
      acc[item.CounterId].users[item.Cuser].transactions.push(item);
  
      // Update user's total amount
      acc[item.CounterId].users[item.Cuser].totalAmount += item.Amount;
  
      // Update counter-wise total amount
      acc[item.CounterId].counterTotalAmount += item.Amount;
  
      return acc;
    }, {});
  }
 
  generatePDF() {
    const printContent = document.getElementById('print-section');
    if (!printContent) {
      console.error('No content found to print');
      return;
    }

    const WindowPrt = window.open('', '', 'width=800,height=600');

    // Check if the print window was successfully opened
    if (!WindowPrt) {
      console.error(
        'Unable to open print window. Please check pop-up blockers.'
      );
      return;
    }

    WindowPrt.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          /* Add custom styles for printing if needed */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 5px;
            text-align: left;
          }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
    </html>
  `);

    WindowPrt.document.close();
    WindowPrt.focus();

    // Make sure that the window is still valid before calling print and close
    if (WindowPrt) {
      WindowPrt.print();
      WindowPrt.close();
    }
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

 
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
  }

  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        if (this.lang == 'en') {
          return 'ONLINE';
        } else {
          return 'ഓൺലൈൻ';
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
      default:
        return 'OTHERS';
    }
  }

  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }
}

