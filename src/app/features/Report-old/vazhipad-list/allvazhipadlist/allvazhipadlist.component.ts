import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../../shared/component/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { MasterService } from '../../../../services/master/master.service';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-allvazhipadlist',
  standalone: true,
  imports: [HeaderComponent, SpinnerComponent, CommonModule,TranslateModule],
  templateUrl: './allvazhipadlist.component.html',
  styleUrl: './allvazhipadlist.component.css',
})
export class AllvazhipadlistComponent implements OnInit {
  loading: boolean = false;

  groupedData: { [key: string]: any[] } = {};
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  
  constructor(private service: MasterService,private ts: TranslateService, private router:Router ) {

    this.lang=localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');

  }

  ngOnInit(): void {
    this.getAllVazhipadListWithPrathishta();
  }
 
  goBack(): void {
    // this.location.back();
    this.router.navigate(['/vazhipadReport']);
  }

  // Print the current page
  printPage(): void {
    const printContent = document.getElementById('print-section');
    if (printContent) {
      const WindowPrt = window.open('', '', 'width=900,height=650');
      WindowPrt?.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              @page {
                margin: 20mm;
              }
              body {
                font-family: Arial, sans-serif;
                margin: 30px 30px;
                padding: 0;
              }
              .responsive-table {
                border-collapse: collapse;
                width: 100%;
              }
              .responsive-table th, .responsive-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              .responsive-table th {
                background-color: #f4f4f4;
              }
              thead {
                display: table-header-group;
              }
              tr {
                page-break-inside: avoid; /* Prevents breaking rows within a page */
              }
              /* Force page break before each Prathista group */
              .group-container {
                page-break-before: always; /* Forces new page before each Prathista */
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      WindowPrt?.document.close();
      WindowPrt?.focus();
      WindowPrt?.print();
    }
  }

  getAllVazhipadListWithPrathishta() {
    const payLoad = {
      Type: 'AllVazhipadList',
      Code: '',
    };
    this.service.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data);
        this.groupedData = data.reduce((acc: any, item: any) => {
          if (!acc[item.PName]) {
            acc[item.PName] = [];
          }
          acc[item.PName].push(item);
          return acc;
        }, {});
      },
      error: (error) => {},
    });
  }
}
