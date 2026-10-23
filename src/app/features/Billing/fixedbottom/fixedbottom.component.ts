import { MasterService } from './../../../services/master/master.service';
import {
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { NotificationService } from '../../../services/notification/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { MobserachcontentsComponent } from '../mobserachcontents/mobserachcontents.component';
import { SearchByBillNumberComponent } from '../search-by-bill-number/search-by-bill-number.component';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { map, Observable, startWith, Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NumberToWordsPipe } from '../../../shared/pipe/number-to-words.pipe';
interface Gothram {
  GC_ID: string;
  GC_Code: string;
  GC_Name: string;
  GC_RegName: string;
  GC_Active: string;
}
@Component({
  selector: 'app-fixedbottom',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
  ],
  templateUrl: './fixedbottom.component.html',
  styleUrl: './fixedbottom.component.css',
  providers: [NumberToWordsPipe],
})
export class FixedbottomComponent implements OnInit {
  customerdetailsForBillingForm: FormGroup;
  totalAmount: number = 0;
  currentDate: string;
  mobileNumber: string = '';
  billNumber: string = '';
  lastBillnumber: number;
  LoggedInUserLastnumber: string;
  isDonationReceipt: boolean = false;
  currentBillNumber: string;
  todayCollection: string = '0';
  printerLayOut: string | null;
  filteredGothrams!: Observable<Gothram[]>;
  memberDevoteeCheck: boolean = false;
  trnsmodeSignal = signal<string>('CS');
  mobileSignal = signal<string>('');
  private checkingCredit = false;
  private mobileDebounceTimer: any;
  @ViewChild('payButton', { static: true }) payButton!: ElementRef;
  private subscription: Subscription = new Subscription();
  private totalService = inject(TotalAmountService);
  private notiication = inject(NotificationService);
  private masterService = inject(MasterService);
  private numbertowordpipe = inject(NumberToWordsPipe);
  private escPressed: boolean = false;
  theLastBillNo: string;
  loginId: string | null = '';
  counterId: string | null = '';
  templeName: string | null = '';
  templeAddress: string | null = '';
  billType: string;
  lang: string | null;
  logo: string | null;
  templeLogoUrl: string = '';
  name: string | null;
  nakshatham: any[];
  role: string | null;
  receivedBooleanValue: boolean;
  memberId: string | null;
  allvazhipad: any[] = [];
  gothramMaster: any[] = [];
  activeGothram: Gothram[] = [];
  private refreshSubscription!: Subscription;
  apisubscription!: Subscription;
  @ViewChild('phone') phoneInput!: ElementRef<HTMLInputElement>;
  @ViewChild('paymentDropdown', { static: true })
  paymentDropdown!: ElementRef<HTMLSelectElement>;
  @ViewChild('address1Input', { static: true }) address1Input!: ElementRef;
  @ViewChildren('address1, address2, address3, pincode, phone, email')
  inputs!: QueryList<ElementRef>;
  sameDateArray: any[];
  differentDateArray: any[];
  isLockedShow: boolean = false;
  groupedArray: any[] = [];
  balancecalculated: number;

  // inputs!: QueryList<ElementRef>;
  // 2D navigation grid
  navigationGrid = [
    [0, 3], // Address 1 -> Pincode
    [1, 4], // Address 2 -> Phone
    [2, 5], // Address 3 -> Email
  ];
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public receiptPrinrservice: ReceiptPrintService,
    private ts: TranslateService,
    private service: MasterService,
    private notification: NotificationService,
  ) {
    this.lang = localStorage.getItem('Language') || 'en';
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.printerLayOut = localStorage.getItem('Printer');
    this.loginId = localStorage.getItem('LoginId');
    this.counterId = localStorage.getItem('counterId');
    this.templeName = localStorage.getItem('TempleName');
    this.templeAddress = localStorage.getItem('Address');
    this.logo = localStorage.getItem('Logo');
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('Role');
    if (this.logo) {
      this.templeLogoUrl =
        window.location.origin + `/assets/images/${this.logo}`;
    }
    this.currentDate = this.getCurrentDateMMYY();
    this.getLastBillNumber();
    this.loggedInUserLastBillNumber();
    const today = this.getFormattedDate(new Date());
    this.customerdetailsForBillingForm = this.fb.group({
      BillNo: [''],
      Billdate: [today, [Validators.required]],
      Mobile: [
        '',
        [Validators.pattern('^[0-9]{10}$'), Validators.minLength(10)],
      ],
      Address1: [''],
      Address2: [''],
      Address3: [''],
      Givenamount: [''],
      Email: ['', [Validators.email]],
      Pincode: ['', [Validators.pattern('^[0-9]{6}$')]],
      Userid: [this.loginId],
      CounterId: [this.counterId],
      Trnsmode: ['CS'],
      Instno: [''],
      Instdate: [today],
      InstBank: [''],
      Memberid: ['0'],
      PaidStatus: ['Y'],
      isDonation: [false],
    });

    this.getStarData();
    this.subscribeToTrnsmodeChanges();
    this.subscribeToMobileChanges();
    this.givenamountChanges();
  }

  ngOnInit(): void {
    this.getTodayCollection();
    this.getAllVazhipad();
    this.loadLogoAsBase64();
    this.getGothramMaster();
    this.setGothramAutoComplete();
    this.totalService.totalAmount$.subscribe((amount) => {
      this.totalAmount = amount;
    });
    this.refreshSubscription = this.receiptPrinrservice.refreshData$.subscribe(
      () => {
        this.refreshData();
      },
    );
    this.receiptPrinrservice.memberId$.subscribe((id) => {
      this.memberId = id;
      if (Number(this.memberId) > 0) {
        this.customerdetailsForBillingForm.patchValue({
          Memberid: this.memberId,
        });
      } else {
        this.customerdetailsForBillingForm.patchValue({
          Memberid: '0',
        });
      }
    });
    this.subscription.add(
      this.totalService.dataSubmitted$.subscribe(() => {
        this.getLastBillNumber();
        this.loggedInUserLastBillNumber();
      }),
    );
    this.subscribeToTrnsmodeChanges();
    this.printReceipt();
    // this.resetForm();
    this.cancelPrintRecipt();
    this.apisubscription = this.receiptPrinrservice.apiFailed$.subscribe(() => {
      this.getLastBillNumber(); // Call your local method
    });
  }

  refreshData() {
    this.customerdetailsForBillingForm.patchValue({
      Mobile: '',
    });
    this.mobileNumber = '';
    this.memberDevoteeCheck = false;
    // Call your API or update logic here
  }

  cancelPrintRecipt() {
    this.receiptPrinrservice.booleanValue$.subscribe((value) => {
      this.receivedBooleanValue = value;
      if (this.receivedBooleanValue) {
        this.resetForm();
      }
    });
  }

  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }

  getLastBillNumber() {
    this.masterService.getLastBillNumber().subscribe({
      next: (data) => {
        // this.lastBillnumber = data[0].billno-1
        this.lastBillnumber = data[0].billno - 1;
        this.isLockedShow = this.lastBillnumber < 0;
        this.theLastBillNo =
          this.lastBillnumber.toString() + '/' + this.currentDate;
        this.currentBillNumber =
          this.lastBillnumber.toString() + '/' + this.currentDate;
        // this.customerdetailsForBillingForm.patchValue({
        //   BillNo: this.currentBillNumber,
        // });
      },
    });
  }

  loggedInUserLastBillNumber() {
    this.masterService.getloggedInUserLastBillNumber().subscribe({
      next: (data) => {
        this.LoggedInUserLastnumber = data[0].billno;
        this.billNumber = this.LoggedInUserLastnumber;
        // this.theLastBillNo =
        //   this.lastBillnumber.toString() + '/' + this.currentDate;
      },
    });
  }

  printReceipt() {
    this.receiptPrinrservice.receiptData$.subscribe((data: any) => {
      const isDonation =
        this.customerdetailsForBillingForm.get('isDonation')?.value;
      if (isDonation) {
        this.printDonationReceipt(data);
        return;
      }
      if (this.printerLayOut == 'u') {
        this.printReceipts(data);
      } else if (this.printerLayOut == 'inkJet') {
        this.printReceiptsinkJet(data);
      } else if (this.printerLayOut == 'thermal') {
        this.printReceiptsThermal(data);
      } else if (this.printerLayOut == 'dotMetrix') {
        this.printReceiptsDotmetrix(data);
      } else if (this.printerLayOut == 'laser') {
        this.printReceiptslaserA4_4(data);
      }
      this.getTodayCollection();
    });
  }

// dotmetrix print function
  printReceiptsDotmetrix(data: any) {
    // this.payInProgress=false;
    const { BillNo, Billdate, vazhipadinfo, Trnsmode } = data;
    this.differentDateArray = [];
    this.sameDateArray = [];
    vazhipadinfo.forEach((item: any) => {
      this.differentDateArray.push(item);
    });
    let allReceiptsContent = '';
    if (this.differentDateArray.length > 0) {
      const groupedData = this.differentDateArray.reduce(
        (acc: any, item: any) => {
          const key = `${item.Prethista}@${item.Vazhipad}@${item.FromDate}@${item.ToDate}`;
          if (!acc[key]) {
            acc[key] = {
              items: [],
              totalQty: 0,
              uniqueNames: new Set(),
              nalBy: '',
              mday: '',
              thithi: '',
              mmonth: '',
              Slno: '',
            };
          }
          acc[key].items.push(item);
          acc[key].totalQty += parseInt(item.Qty, 10);
          acc[key].uniqueNames.add(item.Vazhipad);
          if (item.NalBy) acc[key].nalBy = item.NalBy;
          if (item.Mday) acc[key].mday = item.Mday;
          if (item.SearchBy) acc[key].thithi = item.SearchBy;
          if (item.Mmonth) acc[key].mmonth = item.Mmonth;
          if (item.Slno) acc[key].Slno = item.Slno;
          return acc;
        },
        {},
      );

      const maxRowsPerPage = 5;
      Object.keys(groupedData).forEach((key) => {
        const group = groupedData[key];
        const [prathista, vazhipad, fromDate, toDate] = key.split('@');
        const items = group.items;
        let grandTotalAmount = 0;
        // Group items by Name to sum Qty and avoid repetition
        const nameGroupedItems = items.reduce((nameAcc: any, item: any) => {
          if (!nameAcc[item.Name]) {
            nameAcc[item.Name] = {
              ...item,
              Qty: 0,
            };
          }
          nameAcc[item.Name].Qty += parseInt(item.Qty, 10);
          return nameAcc;
        }, {});

        const uniqueNamesItems = Object.values(nameGroupedItems);

        // Split items into pages
        const pages = [];
        for (let i = 0; i < uniqueNamesItems.length; i += maxRowsPerPage) {
          pages.push(uniqueNamesItems.slice(i, i + maxRowsPerPage));
        }

        // Render each page
        pages.forEach((page, pageIndex) => {
          let receiptContent = `
       <div class="receipt-page" style="page-break-after: ${
         pageIndex < pages.length - 1 ? 'always' : 'avoid'
       };">
          <!-- Prathista -->
          <div style="position: absolute; left: 2.4cm; top:2.5cm; max-width: 8cm; font-size:9pt; white-space: pre-wrap; word-wrap: break-word;">${prathista}</div>
          <!-- Vazhipad -->
          <div style="position: absolute; left: 2.4cm; top: 3cm; max-width: 5cm;font-size:9pt; white-space: pre-wrap;">${vazhipad}</div>
          <!-- Bill date Date -->

          <div style="position: absolute; left:10.5cm; top: 2.5cm;font-size:9pt;"> ${Billdate}</div>
          <!-- bill Number -->
          <div style="position: absolute; left:10.5cm; top: 3cm;font-size:9pt;"> ${BillNo}</div>
           <!-- vazhipad date -->
         <div style="position: absolute; left: 4cm; top: 9cm;font-size:9pt;">
  ${
    fromDate != toDate
      ? `${this.convertDateFormat(fromDate)} to ${this.convertDateFormat(
          toDate,
        )}`
      : `${this.convertDateFormat(fromDate)}`
  }
</div>
${
  group.nalBy
    ? `<div style="position: absolute; left: 5.5cm; top: 8cm;font-size:6pt">- ${group.nalBy},</div>`
    : ''
}
${
  group.mday
    ? `<div style="position: absolute; left: 5.5cm; top: 8.3cm;font-size:6pt">- ${group.mday},</div>`
    : ''
}
${
  group.mmonth
    ? `<div style="position: absolute; left: 5.5cm; top:8.5cm;font-size:6pt">- ${group.mmonth}</div>`
    : ''
}
${
  group.thithi
    ? `<div style="position: absolute; left: 5.5cm; top: 7.8cm;font-size:6pt">- ${group.thithi}</div>`
    : ''
}
 <div style="position: absolute; left: 1cm; top: 8.3cm;font-size:8pt">User:${
   this.name
 }(${this.getTransactionType(Trnsmode)}) ${
   Trnsmode == 'CR' ? '(Not Paid)' : ''
 }(CNTR:${this.counterId})</div>
          `;
          page.forEach((item: any, rowIndex: number) => {
            let rowTop = 4.8 + rowIndex * 0.5;
            const amount = item.Qty * item.Rate;
            grandTotalAmount += amount;
            receiptContent += `
          <div style="position: absolute; left:1cm; font-size:9pt;font-weight:bold; top: ${rowTop}cm; max-width: 5.5cm; white-space: pre-wrap; word-wrap: break-word;"><div style="margin-top:0px;padding-top:0px;margin-bottom:0px;padding-bottom:0px;" >${
            item.Name
          }</div>${
            item.Name2
              ? `<div style="margin-top:0px;padding-top:0px;margin-bottom:0px;padding-bottom:5px;">Name2:(${item.Name2})</div>`
              : ''
          }

         ${
           item.Remarks && item.Remarks.toString().trim() !== ''
             ? `<div style="margin-top:0px;padding-top:0px;margin-bottom:0px;padding-bottom:5px;">Remark:${item.Remarks}</div>`
             : ''
         }
          </div>
          <div style="position: absolute; left: 6.9cm;font-size:9pt; top: ${rowTop}cm;">${this.getStarbyId(item.Star)}${item.Star2 ? `<div style="margin-top: 0.1mm;">${this.getStarbyId(item.Star2)}</div>` : ''}</div>
          <div style="position: absolute; left: 9.7cm; font-size:9pt; top: ${rowTop}cm;">${
            item.Qty
          }</div>
          <div style="position: absolute;left: 11cm;font-size:9pt; top: ${rowTop}cm;">${
            item.Rate
          }</div>
          <div style="position: absolute; left: 12cm; font-size:9pt;top: ${rowTop}cm;">${amount}</div>
           <div style="position: absolute; left: 7.5cm; top: 9.3cm; font-weight: bold; font-size: 10pt;">
        Grand Total: ${item.TotalAmt}
      </div>
        `;
          });
          receiptContent += `
      <div style="position: absolute; left: 10.5cm; top: 8.3cm; font-weight: bold; font-size: 12pt;">
         ${grandTotalAmount.toFixed(2)}
      </div>
${
  group.Slno && group.Slno.toString().trim() !== ''
    ? `<div style="position: absolute; left: 3cm; top: 8cm; font-weight: bolder; font-size: 12pt;">
         Token : ${group.Slno}
       </div>`
    : ''
}

    </div>`; // Close receipt page
          allReceiptsContent += receiptContent;
        });
      });

      const printContent = `
  <html>
    <head>

      <style>

          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 10pt;
            font-weight: bold;
          }
          .receipt-page {
            position: relative;
            width: 6in;
            height: 4in;
            margin: 0 auto;
            padding: 0;
            overflow: hidden;
            page-break-after: auto;
          }
        </style>
    </head>
    <body>
      ${allReceiptsContent}
    </body>
  </html>
`;
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        this.resetForm();
      }
    }
  }

  private printReceipts(data: any) {
    const { BillNo, Billdate, Trnsmode, vazhipadinfo } = data;

    // Group by Prathista and Vazhipad
    const groupedByPrathistaVazhipad = vazhipadinfo.reduce(
      (acc: { [key: string]: any[] }, item: any) => {
        const key = `${item.Prethista}-${item.Vazhipad}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {},
    );

    let allReceiptsContent = '';
    const prathistaVazhipadKeys = Object.keys(groupedByPrathistaVazhipad);

    // Loop through grouped data
    for (let i = 0; i < prathistaVazhipadKeys.length; i++) {
      const key = prathistaVazhipadKeys[i];
      const items = groupedByPrathistaVazhipad[key];
      const [prathista, vazhipad] = key.split('-');

      // Calculate the total amount for the group
      const totalAmount = items.reduce(
        (total: number, item: any) => total + parseFloat(item.Amount || '0'),
        0,
      );

      // Prepare the rows for each item in the group
      const vazhipadRows = items
        .map(
          (item: any) => `
        <tr>
          <td>${item.Name || 'N/A'}<br /><span>${item.Name2 || ' '}</span></td>
          <td>${this.getStarbyId(item.Star)}<br/><span>${this.getStarbyId(
            item.Star2,
          )}</span></td>
          <td>${item.VazhipadDate || 'N/A'}</td>
          <td>${item.Qty || '0'}</td>
          <td>${item.Rate || '0'}</td>
          <td>${item.Amount || '0'}</td>
        </tr>`,
        )
        .join('');

      const displayTrnsmode =
        Trnsmode.toLowerCase() === 'cr' ? 'Cash not paid' : Trnsmode;

      const receiptContent = `
      <div class="receipt-page">
        <div class="receipt-header">
          <!-- Temple Logo on the left -->
          <img src="${
            this.templeLogoUrl
          }" alt="Temple Logo" class="temple-logo" />

          <div class="header-text">
            <h1>${this.templeName}</h1>
            <p>${this.templeAddress}</p>
            <h2 class="receipt-heading">വഴിപാട് രസീത്</h2>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: red;">പ്രതിഷ്ഠ: ${prathista}</strong>
            <strong>തീയതി: ${Billdate || 'N/A'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: green;">വഴിപാട്: ${vazhipad}</strong>
            <strong>നമ്പർ: ${BillNo || 'N/A'}</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>പേര് </th>
                <th>നക്ഷത്രം </th>
                <th>തീയതി</th>
                <th>എണ്ണം</th>
                <th>നിരക്ക്</th>
                <th>തുക</th>
              </tr>
            </thead>
            <tbody>
              ${vazhipadRows}
              <tr>
                <td colspan="5" class="total-label"><strong>ആകെ തുക :</strong></td>
                <td class="total-amount"><strong>${totalAmount.toFixed(
                  2,
                )}</strong></td>
              </tr>
            </tbody>
          </table>
         <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <!-- Left side content (Counter ID and Duplicate stacked vertically) -->
            <div style="display: flex; flex-direction: column;">
                <strong style="margin-right: 15px;">Counter ID: ${
                  this.counterId
                }</strong>
                <strong>Secretory</strong>
            </div>
            <!-- Right side content (Login ID and Transaction Mode stacked vertically) -->
            <div style="display: flex; flex-direction: column;">
                <strong style="margin-right: 15px;">Login: ${this.name}</strong>
                <strong>Payment Mode: ${this.getTransactionType(
                  Trnsmode,
                )}</strong>
            </div>
        </div>

          </div>
        ${
          i < prathistaVazhipadKeys.length - 1
            ? '<div class="page-break"></div>'
            : ''
        }
      </div>`;

      allReceiptsContent += receiptContent;
    }

    // Print the receipt content
    const printContent = `
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
          .receipt-page { padding: 10px; page-break-inside: avoid; }
          .receipt-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
          .temple-logo { max-width: 150px; }
          .header-text { text-align: center; flex-grow: 1; }
          .receipt-heading { color: #4CAF50; margin: 10px 0; font-size: 1.5em; }
          .page-break { page-break-after: always; }
          h1 { text-align: center; color: #4CAF50; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 5px; text-align: left; }
          th { background-color: #3f51b5; color: white; }
          .total-label { text-align: right; }
          .total-amount { background-color: #e0f7fa; }
          td span { font-size: 0.85em; color: #666; }
          @media print {
            @page { margin: 0; size: A4; }
            body { margin: 10mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${allReceiptsContent}
      </body>
    </html>`;

    this.printContent(printContent);
  }

  private printContent(content: string) {
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close(); // Close the print window after printing
      };
      this.resetForm();
    } else {
      console.error('Failed to open the print window.');
    }
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

  private subscribeToTrnsmodeChanges() {
    this.customerdetailsForBillingForm
      .get('Trnsmode')
      ?.valueChanges.subscribe((mode) => {
        // 🟦 When CHEQUE selected
        if (mode === 'CH') {
          this.customerdetailsForBillingForm.patchValue({ PaidStatus: 'Y' });
          this.setChequeValidators();
          this.clearCreditValidators();
          this.removeNotRegisteredError();
          return;
        }

        // 🟥 When CREDIT selected
        if (mode === 'CR') {
          this.customerdetailsForBillingForm.patchValue({ PaidStatus: 'N' });
          this.setCreditValidators();
          this.clearChequeValidators();
          this.clearUpiValidators();

          // Check if already typed 10 digits
          this.checkMobileCreditEligibility();
          return;
        }

        // 🟩 When CASH / UPI / BANK / DEBIT selected
        this.customerdetailsForBillingForm.patchValue({ PaidStatus: 'Y' });
        this.clearChequeValidators();
        this.clearCreditValidators();
        this.clearUpiValidators();
        this.removeNotRegisteredError();
      });
  }

  private getFormattedDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en'); // Input type="date" expects format yyyy-MM-dd
  }

  onSubmit() {
    if (this.customerdetailsForBillingForm.invalid) {
      this.showValidationErrors();
      this.markAllFieldsAsTouched();
      return;
    }
    const formData = { ...this.customerdetailsForBillingForm.value };
    formData.Billdate = this.formatToDDMMYYYY(new Date(formData.Billdate));
    formData.Instdate = this.formatToDDMMYYYY(new Date(formData.Instdate));
    this.totalService.setFirstComponentData(formData);
    this.totalService.emitClickEvent();
  }

  private markAllFieldsAsTouched() {
    this.customerdetailsForBillingForm.markAllAsTouched();
  }

  private setChequeValidators() {
    this.customerdetailsForBillingForm
      .get('Instno')
      ?.setValidators([Validators.required, Validators.minLength(6)]);
    this.customerdetailsForBillingForm
      .get('InstBank')
      ?.setValidators([Validators.required]);
    this.customerdetailsForBillingForm
      .get('Instdate')
      ?.setValidators([Validators.required]);
    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('InstBank')
      ?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('Instdate')
      ?.updateValueAndValidity();
  }

  private clearChequeValidators() {
    this.customerdetailsForBillingForm.get('Instno')?.clearValidators();
    this.customerdetailsForBillingForm.get('InstBank')?.clearValidators();
    this.customerdetailsForBillingForm.get('Instdate')?.clearValidators();
    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('InstBank')
      ?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('Instdate')
      ?.updateValueAndValidity();
  }

  private showValidationErrors() {
    Object.keys(this.customerdetailsForBillingForm.controls).forEach((key) => {
      const controlErrors = this.customerdetailsForBillingForm.get(key)?.errors;
      if (controlErrors) {
        if (controlErrors['required']) {
          this.notiication.showError(`${key} is required`, 'Billing');
        }

        if (controlErrors['pattern']) {
          if (key === 'Mobile') {
            this.notiication.showError(
              'Invalid phone number. Must be 10 digits atleast.',
            );
          }
          if (key === 'Pincode') {
            this.notiication.showError('Invalid pincode. Must be 6 digits.');
          }
        }
        if (controlErrors['email']) {
          this.notiication.showError('Invalid email format.');
        }
        if (controlErrors['minLength']) {
          if (key === 'Mobile') {
            this.notiication.showError(
              'Invalid phone number. Must be 10 digits atleast.',
            );
          }
        }
        if (controlErrors['notRegistered']) {
          if (key === 'Mobile') {
            this.notiication.showError(
              'Only registered Devotee can pay by Credit',
            );
          }
        }
      }
    });
  }

  private setCreditValidators() {
    this.customerdetailsForBillingForm
      .get('Mobile')
      ?.setValidators([Validators.required, Validators.pattern('^[0-9]{10}$')]);
    this.customerdetailsForBillingForm.get('Mobile')?.updateValueAndValidity();
  }

  private clearCreditValidators() {
    this.customerdetailsForBillingForm.get('Mobile')?.clearValidators();
    this.customerdetailsForBillingForm.get('Mobile')?.updateValueAndValidity();
  }

  private setUpiValidators() {
    this.customerdetailsForBillingForm
      .get('Instno')
      ?.setValidators([Validators.required]);

    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
  }

  private clearUpiValidators() {
    this.customerdetailsForBillingForm.get('Instno')?.clearValidators();
    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
  }

  private formatToDDMMYYYY(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  openDialog(data: any) {
    this.dialog.open(MobserachcontentsComponent, {
      width: '80vw',
      data: data,
    });
  }

  onFind() {
    if (this.mobileNumber.length !== 10) {
      this.notiication.showError('Please enter Valid Mobile number');
      return;
    }
    // Call the API to get details by mobile number
    const payLoad = { Type: 'SearchMobile', Code: this.mobileNumber };
    this.masterService.SearchByMobileNo(payLoad).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.openDialog(data);
          this.mobileNumber = '';
        } else {
          this.notiication.showError('Devotees not exist in the mobile number');
        }
      },
      error: (error) => {
        // Handle error
        alert('Error fetching data. Please try again later.');
        console.error('Error fetching data:', error);
      },
    });
  }

  onFindBillNumber() {
    if (this.billNumber.length === 0) {
      // Display a toaster or any other form of error message
      this.notiication.showError('Please enter valid Bill Number');
      return;
    }
    // Call the API to get details by mobile number
    const payLoad = { Type: 'SearchBillno', Code: this.billNumber };
    this.masterService.SearchByBillNo(payLoad).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.openDialogBillNumber(data);
          this.billNumber = '';
        } else {
          this.notiication.showError('enter valid billnumber');
        }
      },
      error: (error) => {
        // Handle error
        alert('Error fetching data. Please try again later.');
        console.error('Error fetching data:', error);
      },
    });
  }

  openDialogBillNumber(data: any) {
    this.dialog.open(SearchByBillNumberComponent, {
      width: '90vw', // Set the width of the dialog
      data: data,
    });
  }

  resetForm() {
    this.customerdetailsForBillingForm.reset();
    const today = this.getFormattedDate(new Date());
    this.customerdetailsForBillingForm.patchValue({
      BillNo: this.lastBillnumber,
      Billdate: today,
      Userid: this.loginId,
      CounterId: this.counterId,
      Trnsmode: 'CS',
      Instno: '',
      Instdate: today,
      InstBank: '',
      Memberid: '0',
      PaidStatus: 'Y',
      Mobile: '',
      Address1: '',
      Address2: '',
      Address3: '',
      Email: '',
      Pincode: '',
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTodayCollection() {
    const fromDate = this.formatDate(new Date());
    const payLoad = {
      Type: 'TodayCollection',
      FromDate: fromDate,
      ToDate: fromDate,
      PMId: this.loginId,
      VazhId: this.counterId,
    };
    this.masterService.getVazhipadWiseReport(payLoad).subscribe({
      next: (todaycollection) => {
        this.todayCollection = todaycollection[0].Amount;
      },
    });
  }

  // function to pdf
  generatePDFAndSendToWhatsApp() {
    const data = document.getElementById('bill-content');

    // Check if the bill content element is found
    if (!data) {
      return;
    }

    // Proceed with PDF generation
    html2canvas(data).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let doc = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;

      let position = 0;
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF to a Blob
      const pdfBlob = doc.output('blob');

      // Use a server endpoint to upload the PDF and get a link (you need to implement this part)
      const formData = new FormData();
      formData.append('file', pdfBlob, 'bill.pdf');

      // Example: Upload the PDF to your server (adjust URL to your server's endpoint)
      fetch('https://your-server-endpoint/upload', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          const pdfUrl = data.fileUrl; // Get the URL from your server response
          this.sendWhatsAppMessage(pdfUrl);
        })
        .catch((error) => console.error('Error uploading PDF:', error));
    });
  }

  sendWhatsAppMessage(pdfUrl: string) {
    const whatsappMessage = `Hey, here is your bill: ${pdfUrl}`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(
      whatsappMessage,
    )}`;
    window.open(whatsappURL, '_blank');
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: Event): void {
    if (this.role != 'admin') {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Escape' || keyboardEvent.key === 'Esc') {
        this.escPressed = true;
        this.focusOnPayButton();
      }
    }
  }

  // Function to focus on the Pay button
  focusOnPayButton(): void {
    if (this.payButton) {
      this.payButton.nativeElement.focus();
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKeyPress(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.escPressed && keyboardEvent.key === 'Enter') {
      this.onSubmit();
      this.escPressed = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'F2') {
      event.preventDefault(); // Prevents the default browser refresh behavior
      this.focusOnAddress1();
    }
  }

  private focusOnAddress1() {
    if (this.address1Input) {
      this.address1Input.nativeElement.focus();
    }
  }

  handleKeyDowns(event: KeyboardEvent, row: number, col: number) {
    const keyMap = {
      ArrowRight: { row, col: col + 1 }, // Move right
      ArrowLeft: { row, col: col - 1 }, // Move left
      ArrowUp: { row: row - 1, col }, // Move up
      ArrowDown: { row: row + 1, col }, // Move down
    };

    const movement = keyMap[event.key as keyof typeof keyMap];
    if (movement) {
      event.preventDefault(); // Prevent default browser action
      this.focusInput(movement.row, movement.col);
    }
  }

  focusInput(row: number, col: number) {
    if (row >= 0 && row < this.navigationGrid.length && col >= 0 && col < 2) {
      const index = this.navigationGrid[row][col];
      const input = this.inputs.toArray()[index];
      input?.nativeElement.focus();
    }
  }

  getStarbyId(id: string) {
    if (this.lang == 'en') {
      const star = this.nakshatham.find((item) => item.SM_Id == id);
      return star ? star.SM_Name : '';
    } else if (this.lang == 'ml') {
      const star = this.nakshatham.find((item) => item.SM_Id == id);
      return star ? star.SM_RName : '';
    }
  }

  getStarData() {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.service.getStarData(payLoad).subscribe((res) => {
      this.nakshatham = res;
      this.nakshatham = res.map((item) => ({
        SM_Id: item.id,
        SM_Name: item.SM_NameEng,
        SM_Code: item.SM_Code,
        SM_RName: item.SM_Name,
      }));
    });
  }

  printReceiptsinkJet(data: any) {
    const { BillNo, Billdate, Trnsmode, vazhipadinfo } = data;

    // Group by Prathista, Vazhipad, and VazhipadDate
    const groupedByPrathistaVazhipadDate = vazhipadinfo.reduce(
      (acc: { [key: string]: any[] }, item: any) => {
        const key = `${item.Prethista}-${item.Vazhipad}-${item.VazhipadDate}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {},
    );

    let allReceiptsContent = '';
    const prathistaVazhipadDateKeys = Object.keys(
      groupedByPrathistaVazhipadDate,
    );

    // Loop through grouped data
    for (let i = 0; i < prathistaVazhipadDateKeys.length; i++) {
      const key = prathistaVazhipadDateKeys[i];
      const items = groupedByPrathistaVazhipadDate[key];
      const [prathista, vazhipad, vazhipadDate] = key.split('-');

      // Calculate the total amount for the group
      const totalAmount = items.reduce(
        (total: number, item: any) => total + parseFloat(item.Amount || '0'),
        0,
      );

      // Prepare the rows for each item in the group
      const vazhipadRows = items
        .map(
          (item: any) => `
        <tr>
          <td>${item.Name || 'N/A'}<br /><span>${item.Name2 || ' '}</span></td>
          <td>${this.getStarbyId(item.Star)}<br/><span>${this.getStarbyId(
            item.Star2,
          )}</span></td>
          <td>${item.Qty || '0'}</td>
          <td>${item.Rate || '0'}</td>
          <td>${item.Amount || '0'}</td>
        </tr>`,
        )
        .join('');

      const receiptContent = `
       <div class="receipt-page">
    <div class="receipt-header">
      <!-- Temple Logo on the left -->
      <img src="${this.templeLogoUrl}" alt="Temple Logo" class="temple-logo" />

      <div class="header-text">
        <h1>${this.templeName}</h1>
        <p>${this.templeAddress}</p>
        <h2 class="receipt-heading">വഴിപാട് രസീത്</h2>
      </div>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between;">
        <strong style="color: red;">പ്രതിഷ്ഠ: ${prathista}</strong>
        <strong>തീയതി: ${Billdate || 'N/A'}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <strong style="color: green;">വഴിപാട്: ${vazhipad}</strong>
        <strong>നമ്പർ: ${BillNo || 'N/A'}</strong>
      </div>
      <table>
        <thead>
          <tr>
            <th>പേര് </th>
            <th>നക്ഷത്രം </th>

            <th>എണ്ണം</th>
            <th>നിരക്ക്</th>
            <th>തുക</th>
          </tr>
        </thead>
        <tbody>
          ${vazhipadRows}
          <tr>
            <td colspan="4" class="total-label"><strong>ആകെ തുക :</strong></td>
            <td class="total-amount"><strong>${totalAmount.toFixed(
              2,
            )}</strong></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 20px;">
        <strong>വഴിപാട് തീയതികൾ:  ${Array.from(
          new Set(items.map((item: any) => item.VazhipadDate || 'N/A')),
        ).join(', ')}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 20px;">
        <!-- Left side content (Counter ID) -->
        <div style="display: flex; flex-direction: column;">
            <strong style="margin-right: 15px;">Counter ID: ${
              this.counterId
            }</strong>
        </div>
        <!-- Right side content (Login ID and Transaction Mode) -->
        <div style="display: flex; flex-direction: column;">
            <strong style="margin-right: 15px;">Login: ${this.name}</strong>
            <strong>Payment Mode: ${this.getTransactionType(Trnsmode)}</strong>
        </div>
      </div>
    </div>
        ${
          i < prathistaVazhipadDateKeys.length - 1
            ? '<div class="page-break"></div>'
            : ''
        }
      </div>`;

      allReceiptsContent += receiptContent;
    }

    // Print the receipt content
    const printContent = `
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
          .receipt-page { padding: 10px; page-break-inside: avoid; }
          .receipt-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
          .temple-logo { max-width: 150px; }
          .header-text { text-align: center; flex-grow: 1; }
          .receipt-heading { color: #4CAF50; margin: 10px 0; font-size: 1.5em; }
          .page-break { page-break-after: always; }
          h1 { text-align: center; color: #4CAF50; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 5px; text-align: left; }
          th { background-color: #3f51b5; color: white; }
          .total-label { text-align: right; }
          .total-amount { background-color: #e0f7fa; }
          td span { font-size: 0.85em; color: #666; }
          @media print {
            @page { margin: 0; size: A4; }
            body { margin: 10mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${allReceiptsContent}
      </body>
    </html>`;

    this.printContent(printContent);
  }

  convertDateFormat(dateString: string) {
    // Split the input date string by the '-' delimiter
    const [year, month, day] = dateString.split('-');
    // Return the date in 'dd-mm-yyyy' format
    return `${day}-${month}-${year}`;
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalKeyDown(event: KeyboardEvent): void {
    if (event.key === 'F5') {
      event.preventDefault();
      this.phoneInput.nativeElement.focus();
    } else if (event.key === 'F2') {
      event.preventDefault();
      this.focusPaymentDropdown();
    }
  }

  // Function to group data by VazhipadDate
  groupDataByVazhipadDate(vazhipadinfo: any[]) {
    const groupedData: { [key: string]: any[] } = {};

    vazhipadinfo.forEach((item) => {
      const key = item.VazhipadDate;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item);
    });

    return Object.values(groupedData);
  }

  printReceiptsThermal(data: any) {
    const imageUrl = window.location.origin + '/assets/images/temple-logo.jpeg';
    const { BillNo, Billdate, vazhipadinfo, Trnsmode, Address3, Mobile } = data;
    this.differentDateArray = [];
    vazhipadinfo.forEach((item: any) => {
      this.differentDateArray.push(item);
    });

    if (this.differentDateArray.length > 0) {
      const groupedData = this.differentDateArray.reduce(
        (acc: any, item: any) => {
          const key = `${item.Prethista}/${item.Vazhipad}/${item.FromDate}/${item.ToDate}`;
          if (!acc[key]) {
            acc[key] = {
              items: [],
              totalQty: 0,
              uniqueNames: new Set(),
              nalBy: '',
              mday: '',
              thithi: '',
              mmonth: '',
              Rate: '',
              VTime: '',
              TotalAmt: '',
            };
          }
          acc[key].items.push(item);
          acc[key].totalQty += parseInt(item.Qty, 10);
          acc[key].uniqueNames.add(item.Name);

          // Store additional details if available
          if (item.NalBy) acc[key].nalBy = item.NalBy;
          if (item.Mday) acc[key].mday = item.Mday;
          if (item.SearchBy) acc[key].thithi = item.SearchBy;
          if (item.Mmonth) acc[key].mmonth = item.Mmonth;
          if (item.Rate) acc[key].rate = item.Rate;
          if (item.VTime) acc[key].VTime = item.VTime;
          if (item.TotalAmt) acc[key].TotalAmt = item.TotalAmt;

          return acc;
        },
        {},
      );

      const maxRowsPerPage = 100; // Maximum rows per page
      let allReceiptsContent = '';

      Object.keys(groupedData).forEach((key) => {
        const group = groupedData[key];
        const [prathista, vazhipad, fromDate, toDate] = key.split('/');
        const items = group.items;
        let grandTotalAmount = 0;

        // Group items by Name to sum Qty and avoid repetition
        const nameGroupedItems = items.reduce((nameAcc: any, item: any) => {
          if (!nameAcc[item.Name]) {
            nameAcc[item.Name] = {
              ...item,
              Qty: 0,
            };
          }
          nameAcc[item.Name].Qty += parseInt(item.Qty, 10);
          return nameAcc;
        }, {});

        // Convert grouped by Name items into an array
        const uniqueNamesItems = Object.values(nameGroupedItems);

        // Split items into pages
        const pages = [];
        for (let i = 0; i < uniqueNamesItems.length; i += maxRowsPerPage) {
          pages.push(uniqueNamesItems.slice(i, i + maxRowsPerPage));
        }

        // Render each page
        pages.forEach((page, pageIndex) => {
          let receiptContent = `
          <div class="receipt-page">

            <div class="receipt-header" style="margin-top:0px;">${
              this.templeName
            }</div>


            <div style="border-top:1px solid black;border-bottom:1px solid black;margin-right:3px;">
                <table style="width:100%;">
                  <tr>
                    <td style="text-align:left;font-weight:700;">Date: ${Billdate}</td>
                    <td style="text-align:right;font-weight:700;">No. ${BillNo}</td>
                  </tr>
                </table>
            </div>
            <div style="margin-top:10px;margin-bottom:15px;">
                <table style="width:100%;">

      <tr>
       <td colspan="3" style="text-align:center;font-weight:800;width:70%;border:1px solid black;border-radius:5px 0px 0px 5px;padding:5px;">${prathista}</td>
         </td>
                </tr>

                  <tr>
                    <td style="text-align:center;font-weight:800;width:30%;border:1px solid black;border-radius:0px 5px 5px 0px;padding:5px;">Pooja</td>
                    <td style="text-align:center;font-weight:800;width:70%;border:1px solid black;border-radius:5px 0px 0px 5px;padding:5px;">${vazhipad}

                    </td>
                  </tr>
                </table>
                  <center><span style="text-align:center;font-weight:600;">Pooja Date: ${
                    fromDate !== toDate
                      ? `${this.convertDateFormat(
                          fromDate,
                        )} to ${this.convertDateFormat(toDate)}`
                      : `${this.convertDateFormat(fromDate)}`
                  }</span><center>
            </div>
            <table style="width:100%;">
                  <tr>
                      <th style="text-align:left;padding-left:5px;border-bottom:1px solid black;">Name</th>
                      <th style="text-align:right;padding-left:5px;border-bottom:1px solid black;">Star<th>
                  </tr>
                  </table>
          `;

          // Render rows in the current page

          page.forEach((item: any) => {
            const amount = item.Qty * item.Rate;
            grandTotalAmount += amount; // Add the amount to the grand total
            receiptContent += `
            <div style="margin-top:5px;">
              <table style="width:100%;">

                  <tr>
                      <td style="padding-left:5px;text-align:left;">${item.Name}
                      <br/> ${
                        item.Remarks
                          ? `<div>Remarks: ${item.Remarks}</div>`
                          : ''
                      }</td>
                      <td style="padding-left:5px;text-align:right;">${this.getStarbyId(
                        item.Star,
                      )}</td>
                  </tr>

                  ${
                    item.Name2
                      ? ` <tr>
                      <td style="padding-left:5px;text-align:left;">${
                        item.Name2
                      }</td>
                      <td style="padding-right:5px;text-align:right;">${this.getStarbyId(
                        item.Star2,
                      )}</td>
                  </tr>`
                      : ''
                  }
              </table>
            </div>




          `;
          });

          // Add grand total and other details
          receiptContent += `
         ${
           Address3
             ? `<div class="receipt-content">Gothram: ${Address3}</div>`
             : ''
         }
         ${Mobile ? `<div class="receipt-content">Mobile: ${Mobile}</div>` : ''}

            <table style="width:100%;">
                <tr>
                    <th style="border:1px solid black;">Amount</th>
                    <th style="border:1px solid black;">Qty</th>
                    <th style="border:1px solid black;">Total</th>
                </tr>
                <tr>
                    <th style="border:1px solid black;">${group.rate}</th>
                    <th style="border:1px solid black;">${group.totalQty}</th>
                    <th style="border:1px solid black;">${grandTotalAmount.toFixed(
                      2,
                    )}</th>
                </tr>
            </table>
            <p style="text-align:right;margin-bottom:10px;margin-top:0px;"><i>(Rupees ${this.numbertowordpipe.transform(
              grandTotalAmount,
            )} only)</i></p>
            <p style="padding:10px;font-size:12pt;font-weight:700;border:1px solid black;text-align:center;">Grand Total: <span style="font-size:18pt;font-weight:700;">${
              group.TotalAmt
            }</span></p>

            <div>

            ${
              group.thithi
                ? `<div class="receipt-footer">Thithi : ${group.thithi}</div>`
                : ''
            }
            ${
              group.nalBy
                ? `<div class="receipt-footer">Star: ${group.nalBy}</div>`
                : ''
            }
            ${
              group.mday
                ? `<div class="receipt-footer">Day: ${group.mday}</div>`
                : ''
            }
            ${
              group.mmonth
                ? `<div class="receipt-footer">Month: ${group.mmonth}</div>`
                : ''
            }</div>

            <div style="display:flex; align-items:center;justify-contents:space-between;width:100%;margin-bottom:0px;margin-top:0px;">
              <div style="width:50%;">
                  <p style="font-size:14px;text-align:left;font-weight:bold">User: ${
                    this.name
                  } </p>
              </div>
              <div style="width:50%;margin-bottom:0px;">
                  <p style="font-size:14px;text-align:center;margin:bottom:0px;font-weight:bold">Counter:${
                    this.counterId
                  }</p>
              </div>

            </div>
           <div style="display:flex; align-items:center;justify-contents:space-between;width:100%;margin-top:0px;margin-bottom:0px">
            <div style="width:1000%;margin-top:0px;margin-bottom:0px;font-weight:bold">
                  <p style="font-size:14px;text-align:left;margin-top:0px;margin-bottom:0px">Payment Mode:  ${this.getTransactionType(
                    Trnsmode,
                  )} ${Trnsmode == 'CR' ? 'Not Paid' : ''}</p>
            </div>
           </div>

            <div style="margin-top:14px;font-size:14px" >${this.formatBillDateTime()}</div>
          </div> <!-- Close receipt-pages -->
        `;
          allReceiptsContent += receiptContent;
        });
      });

      // Final print content with styling
      const printContent = `
      <html>
        <head>
          <style>
            body {
              margin: 10px;
              padding: 0;
              font-family:arial;
              text-align: left;
            }

            .receipt-page {
              position: relative;
              width: 80mm;;
              height: auto;

              margin: 0 auto;
              padding: 10px;
              overflow: hidden;
              page-break-after: always;
              font-family:arial;
              // border: 1px dashed #000;

            }
             .receipt-header {
              font-size: 13pt;
              font-weight: bold;
              text-align: center;
              margin-bottom: 2px;
              margin-top:0px;
              font-family:arial;
              white-space: normal;
              word-break: break-word;
            }

            .receipt-sub-header {
              font-size: 9pt;
              text-align: center;
              margin-bottom: 5px;
              font-family:arial;
              font-weight: bold;
            }

            hr {
              border: 0;
              border-top: 1px dashed black;
              margin: 8px 0px;
            }
              .receipt-contentbill{
              margin-top:10px;
              font-family:arial;
              }

            .receipt-content {
              text-align: left;
              font-size: 12pt;
              margin-bottom: 5px;
              margin-top:10px;
              margin-top:5px;
              font-family:arial;
              font-weight: bold;

            }
              .receipt-content-vd{
              text-align: left;
              font-size: 12pt;
              margin-bottom: 10px;
              margin-top:10px;

              font-family:arial;
              font-weight: bold;
              }
               .receipt-contents {
              text-align: left;
              font-size: 10pt;

              margin-top:10px;
              font-family:arial;
            }

            .receipt-total {
              margin-top: 10px 0px;
               margin-bottom: 10px 0px;
              font-weight: bold;
              font-size: 12pt;
              border-top: 1px solid #000;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              padding-top: 10px;
              text-align: left;
              font-family:arial;
            }
           .receipt-rq{
              margin-top: 10px;
              font-weight: bold;
              font-size: 11pt;

              // padding-top: 5px;
              text-align: left;
            }
              .receipt-footer-ut{
              font-size: 9pt;
              margin-top: 2px;
              font-style: italic;
              text-align: left;
              font-family:arial;
              font-weight:bold;
              }
            .receipt-footer {
              font-size: 9pt;
              margin-top: 3px;
              font-style: italic;
              text-align: left;
              font-family:arial;
            }
          </style>
        </head>
        <body>
          ${allReceiptsContent}
        </body>
      </html>
    `;

      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
            this.resetForm();
          }, 500); // small delay to ensure image is loaded
        };
      }
    }
  }

  formatBillDateTime(): string {
    const now = new Date(); // system date & time

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return new Intl.DateTimeFormat('en-GB', options).format(now);
  }

  focusPaymentDropdown(): void {
    if (this.paymentDropdown?.nativeElement) {
      this.paymentDropdown.nativeElement.focus();
    }
  }

  getNameAndStarByMobilenumber() {
    if (this.mobileNumber) {
      // this.masterService.getMaster
      this.customerdetailsForBillingForm.patchValue({
        Mobile: this.mobileNumber,
      });
      const data = {
        mobile: this.mobileNumber,
        member: this.memberDevoteeCheck,
      };
      this.receiptPrinrservice.setMobileNumber(data);
    } else {
      this.notiication.showError(
        'Please enter the valid mobile number and try again',
      );
    }
  }

  onPayFocus() {
    document.getElementById('paybutton')?.classList.add('paybuttonhg');
  }

  onPayBlur() {
    document.getElementById('paybutton')?.classList.remove('paybuttonhg');
  }

  getdevoteeDetailsforBiling() {}

  laserReciptPrinter(data: any) {
    const { BillNo, Billdate, vazhipadinfo, Trnsmode } = data;
    this.differentDateArray = [];
    vazhipadinfo.forEach((item: any) => {
      this.differentDateArray.push(item);
    });

    if (this.differentDateArray.length > 0) {
      // Group data by Prathista, Vazhipad, and From Date
      const groupedData = this.differentDateArray.reduce(
        (acc: any, item: any) => {
          const key = `${item.Prethista}/${item.Vazhipad}/${item.FromDate}/${item.ToDate}`;
          if (!acc[key]) {
            acc[key] = {
              items: [],
              totalQty: 0,
              uniqueNames: new Set(),
              nalBy: '',
              mday: '',
              thithi: '',
              mmonth: '',
            };
          }
          acc[key].items.push(item);
          acc[key].totalQty += parseInt(item.Qty, 10);
          acc[key].uniqueNames.add(item.Name);

          // Check if NalBy, Mday, or Thithi has data and store it
          if (item.NalBy) acc[key].nalBy = item.NalBy;
          if (item.Mday) acc[key].mday = item.Mday;
          if (item.SearchBy) acc[key].thithi = item.SearchBy;
          if (item.Mmonth) acc[key].mmonth = item.Mmonth;

          return acc;
        },
        {},
      );

      const maxRowsPerPage = 6; // Maximum rows per page
      let allReceiptsContent = '';
      // Variable to store the total amount of all pages

      Object.keys(groupedData).forEach((key) => {
        const group = groupedData[key];
        const [prathista, vazhipad, fromDate, toDate] = key.split('/');
        const items = group.items;
        let grandTotalAmount = 0;
        // Group items by Name to sum Qty and avoid repetition
        const nameGroupedItems = items.reduce((nameAcc: any, item: any) => {
          if (!nameAcc[item.Name]) {
            nameAcc[item.Name] = {
              ...item,
              Qty: 0, // Initialize Qty sum
            };
          }
          nameAcc[item.Name].Qty += parseInt(item.Qty, 10); // Sum Qty for the same Name
          return nameAcc;
        }, {});

        // Convert grouped by Name items into an array
        const uniqueNamesItems = Object.values(nameGroupedItems);

        // Split items into pages
        const pages = [];
        for (let i = 0; i < uniqueNamesItems.length; i += maxRowsPerPage) {
          pages.push(uniqueNamesItems.slice(i, i + maxRowsPerPage));
        }

        // Render each page
        pages.forEach((page, pageIndex) => {
          let grandTotalAmount = 0;

          let receiptContent = `
           <div class="receipt-page" style="${
             pageIndex < pages.length - 1 ? 'page-break-after: always;' : ''
           }">
              <!-- Header with logo and temple info -->
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <img src="${
                  this.templeLogoUrl
                }" alt="Temple Logo" style="height: 60px; margin-right: 10px;">
                <div style="font-size: 11pt;">
                  <div style="text-align:center;"><strong>${
                    this.templeName
                  }</strong></div>
                  <div style="text-align:center;">${this.templeAddress}</div>

                </div>
              </div>

              <!-- Receipt Header Info (Left/Right Split) -->
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 10pt;">
                <div>
                  <div><strong>Prathista:</strong> ${prathista}</div>
                  <div><strong>Vazhipad:</strong> ${vazhipad}</div>
                </div>
                <div style="text-align: right;">
                  <div><strong>Bill No:</strong> ${BillNo}</div>
                  <div><strong>Bill Date:</strong> ${Billdate}</div>
                </div>
              </div>

              <!-- Date Range -->
              <div style="margin-bottom: 10px; font-size: 10pt;">
                <strong>Vazhipad Date:</strong> ${
                  fromDate != toDate
                    ? `${this.convertDateFormat(
                        fromDate,
                      )} to ${this.convertDateFormat(toDate)}`
                    : `${this.convertDateFormat(fromDate)}`
                }<br>
                ${
                  group.nalBy
                    ? `<strong>Nal By:</strong> ${group.nalBy}<br>`
                    : ''
                }
                ${group.mday ? `<strong>Mday:</strong> ${group.mday}<br>` : ''}
                ${
                  group.mmonth
                    ? `<strong>Mmonth:</strong> ${group.mmonth}<br>`
                    : ''
                }
              </div>

              <!-- Table -->
              <table style="width: 100%; border-collapse: collapse; font-size: 10pt;" border="1">
                <thead>
                  <tr>
                    <th style="padding: 4px;">Name</th>
                    <th style="padding: 4px;">Star</th>
                    <th style="padding: 4px;">Qty</th>
                    <th style="padding: 4px;">Rate</th>
                    <th style="padding: 4px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
          `;

          page.forEach((item: any) => {
            const amount = item.Qty * item.Rate;
            grandTotalAmount += amount;

            receiptContent += `
              <tr>
                <td style="padding: 4px;">${item.Name}${
                  item.Name2 ? `<br>${item.Name2}` : ''
                }</td>
                <td style="padding: 4px;">${this.getStarbyId(item.Star)}${
                  item.Star2 ? `<br>${this.getStarbyId(item.Star2)}` : ''
                }</td>
                <td style="padding: 4px; text-align:center;">${item.Qty}</td>
                <td style="padding: 4px; text-align:right;">${item.Rate}</td>
                <td style="padding: 4px; text-align:right;">${amount.toFixed(
                  2,
                )}</td>
              </tr>
            `;
          });

          receiptContent += `
                </tbody>
              </table>

              <div style="margin-top: 5px; font-weight: bold; text-align: right;">
                Grand Total: ₹${grandTotalAmount.toFixed(2)}
              </div>
              <div style="margin-top: 5px; font-style: italic;">
                In Words: ${this.numbertowordpipe.transform(
                  grandTotalAmount,
                )} Rupees
              </div>
            </div> <!-- End of receipt-page -->
          `;

          allReceiptsContent += receiptContent;
        });
      });

      const printContent = `
      <html>
        <head>

          <style>
             body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 10pt;
            }
            .receipt-page {
              position: relative;
              width:210mm;
              height: 148mm;
              margin: 0 auto;
              padding:0 10mm;
              box-sizing: border-box;
              overflow: hidden;
              page-break-after: auto;
              border: 1px solid #ccc;
            }
            table, th, td {
              border: 1px solid black;
            }
          </style>
        </head>
        <body>
          ${allReceiptsContent}
        </body>
      </html>
    `;
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        this.resetForm();
      }
    }
  }

  loadLogoAsBase64() {
    fetch('assets/images/temple-logo.png') // this path is correct
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.templeLogoUrl = reader.result as string; // Base64 encoded string
        };
        reader.readAsDataURL(blob);
      });
  }

  getTimeForBill(time: string) {
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
        return ' ';
    }
  }

  getAllVazhipad() {
    this.masterService.getAllActiveVazhipad().subscribe((data) => {
      this.allvazhipad = data;
    });
  }

  getGothramMaster() {
    const payLoad = {
      Type: 'ActiveGothram',
      Code: '',
    };
    this.masterService.getMaster(payLoad).subscribe({
      next: (data) => {
        this.activeGothram = data.map((item: any) => ({
          GC_ID: item.GC_ID.toString(),
          GC_Code: item.GC_Code,
          GC_Name: item.GC_Name,
          GC_RegName: item.GC_RegName,
          GC_Active: item.GC_Active,
        }));
        // this.activeGothram = data.map((d: any) => d.GC_Name);

        this.setGothramAutoComplete();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  setGothramAutoComplete() {
    this.filteredGothrams = this.customerdetailsForBillingForm
      .get('Address3')!
      .valueChanges.pipe(
        startWith(''),
        map((value) => this._filterGothrams(value || '')),
      );
  }

  private _filterGothrams(value: string): Gothram[] {
    const filterValue = value.toLowerCase();
    return this.activeGothram.filter(
      (g: Gothram) =>
        g.GC_Name.toLowerCase().includes(filterValue) ||
        g.GC_Code.toLowerCase().includes(filterValue),
    );
  }

  vazhipadUnblocking() {
    // console.log('aaa');

    const payLoad = {
      Type: 'UnLockBooking',
      code: '',
    };
    this.masterService.getMaster(payLoad).subscribe({
      next: (data) => {
        if (data) {
          this.notification.showSuccess('Bill number unlocked successfully');
          this.getLastBillNumber();
        }
      },
      error: (err) => {
        this.notification.showError(
          'Check your Network connection and try again',
        );
      },
    });
  }

  onPaymentModeChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const mode = selectElement.value;
    this.trnsmodeSignal.set(mode);

    const mobileControl = this.customerdetailsForBillingForm.get('Mobile');
    const trnsmodeControl = this.customerdetailsForBillingForm.get('Trnsmode');
    const mobile = mobileControl?.value?.trim() ?? '';

    if (mode === 'CR') {
      if (!mobile) {
        mobileControl?.setErrors({ required: true });
        mobileControl?.markAsTouched();
        this.showMobileErrors();
        return;
      }

      if (!/^[0-9]{10}$/.test(mobile)) {
        mobileControl?.setErrors({ pattern: true });
        mobileControl?.markAsTouched();
        this.showMobileErrors();
        return;
      }

      const payLoad = { Type: 'DevoteeNameStar', Code: mobile };
      this.service.getMaster(payLoad).subscribe({
        next: (res: any) => {
          if (Array.isArray(res) && res.length > 0 && res[0].MID) {
            // console.log('Registered MID:', res[0].MID);
            this.customerdetailsForBillingForm.patchValue({
              Memberid: res[0].MID,
            });
            mobileControl?.setErrors(null);
          } else {
            mobileControl?.setErrors({ notRegistered: true });
            // mobileControl?.setErrors({ required: true });
            mobileControl?.markAsTouched();
            this.showMobileErrors();
            // trnsmodeControl?.setValue('CS');
          }
        },
        error: () => {
          mobileControl?.setErrors({ serverError: true });
          this.showMobileErrors();
          trnsmodeControl?.setValue('CS');
        },
      });
    }
  }

  showMobileErrors() {
    const mobileControl = this.customerdetailsForBillingForm.get('Mobile');
    const errors = mobileControl?.errors;

    if (errors) {
      if (errors['required']) {
        this.notification.showError('Mobile number is required.');
      }
      if (errors['pattern']) {
        this.notification.showError(
          'Invalid mobile number. It must be 10 digits.',
        );
      }
      if (errors['notRegistered']) {
        this.notification.showError(
          'Only registered Devotee can pay by Credit.',
        );
      }
      if (errors['serverError']) {
        this.notification.showError(
          'Error verifying mobile number. Please try again.',
        );
      }
    }
  }

  private subscribeToMobileChanges() {
    this.customerdetailsForBillingForm
      .get('Mobile')
      ?.valueChanges.subscribe(() => {
        this.removeNotRegisteredError(); // clear error as user types

        // If credit mode, check again after full 10 digits entered
        const mobile = this.customerdetailsForBillingForm.get('Mobile')?.value;
        if (
          mobile?.length === 10 &&
          this.customerdetailsForBillingForm.get('Trnsmode')?.value === 'CR'
        ) {
          this.checkMobileCreditEligibility();
        }
      });
  }
  private checkMobileCreditEligibility() {
    const mobile = this.customerdetailsForBillingForm.get('Mobile');
    const mobileValue = mobile?.value;

    if (!mobileValue || mobileValue.length !== 10) {
      return; // don't validate until full number entered
    }

    const payload = { Type: 'DevoteeNameStar', Code: mobileValue };

    this.service.getMaster(payload).subscribe({
      next: (res: any) => {
        if (Array.isArray(res) && res.length > 0 && res[0].MID) {
          // Registered
          this.customerdetailsForBillingForm.patchValue({
            Memberid: res[0].MID,
          });
          this.removeNotRegisteredError();
        } else {
          this.addNotRegisteredError();
        }
      },
      error: () => {
        this.addNotRegisteredError();
      },
    });
  }

  private addNotRegisteredError() {
    const mobile = this.customerdetailsForBillingForm.get('Mobile');
    const errors = mobile?.errors || {};

    errors['notRegistered'] = true;
    mobile?.setErrors(errors);
    mobile?.markAsTouched();

    this.notification.showError('Only registered Devotee can pay by Credit');
  }

  private removeNotRegisteredError() {
    const mobile = this.customerdetailsForBillingForm.get('Mobile');

    if (!mobile?.errors) return;

    const errors = { ...mobile.errors };
    delete errors['notRegistered'];

    if (Object.keys(errors).length === 0) {
      mobile.setErrors(null);
    } else {
      mobile.setErrors(errors);
    }
  }

  givenamountChanges() {
    this.customerdetailsForBillingForm
      .get('Givenamount')
      ?.valueChanges.subscribe((value) => {
        const totalAmount =
          this.customerdetailsForBillingForm.get('Totalamount')?.value || 0;
        const givenAmount = parseFloat(value) || 0;
        if (givenAmount > 0 && givenAmount > totalAmount) {
          this.balancecalculated = givenAmount - this.totalAmount;
        } else {
          this.balancecalculated = 0;
        }
      });
  }

  updateMobile(value: string) {
    this.customerdetailsForBillingForm.get('Mobile')?.setValue(value);
  }

  printReceiptslaserA4_4(data: any) {
    console.log('Printing receipt with data:', data);
    const { BillNo, Billdate, vazhipadinfo, Trnsmode, Address3 } = data;
    this.differentDateArray = [];
    this.sameDateArray = [];
    vazhipadinfo.forEach((item: any) => {
      this.differentDateArray.push(item);
    });
    let allReceiptsContent = '';
    if (this.differentDateArray.length > 0) {
      const groupedData = this.differentDateArray.reduce(
        (acc: any, item: any) => {
          const key = `${item.Prethista}@${item.Vazhipad}@${item.FromDate}@${item.ToDate}`;
          if (!acc[key]) {
            acc[key] = {
              items: [],
              totalQty: 0,
              uniqueNames: new Set(),
              nalBy: '',
              mday: '',
              thithi: '',
              mmonth: '',
              Slno: '',
              TotalAmt: '',
              Remarks: '',
              VTime: '',
            };
          }
          acc[key].items.push(item);
          acc[key].totalQty += parseInt(item.Qty, 10);
          acc[key].uniqueNames.add(item.Name);
          if (item.NalBy) acc[key].nalBy = item.NalBy;
          if (item.Mday) acc[key].mday = item.Mday;
          if (item.SearchBy) acc[key].thithi = item.SearchBy;
          if (item.Mmonth) acc[key].mmonth = item.Mmonth;
          if (item.Slno) acc[key].Slno = item.Slno;
          if (item.TotalAmt) acc[key].TotalAmt = item.TotalAmt;
          if (item.Remarks) acc[key].Remarks = item.Remarks;
          if (item.VTime) acc[key].VTime = item.VTime;
          return acc;
        },
        {},
      );
      const maxRowsPerPage = 5;
      Object.keys(groupedData).forEach((key) => {
        const group = groupedData[key];
        const [prathista, vazhipad, fromDate, toDate] = key.split('@');
        const items = group.items;
        let grandTotalAmount = 0;
        const nameGroupedItems = items.reduce((nameAcc: any, item: any) => {
          if (!nameAcc[item.Name]) {
            nameAcc[item.Name] = {
              ...item,
              Qty: 0,
            };
          }
          nameAcc[item.Name].Qty += parseInt(item.Qty, 10);
          return nameAcc;
        }, {});
        const uniqueNamesItems = Object.values(nameGroupedItems);
        const pages = [];
        for (let i = 0; i < uniqueNamesItems.length; i += maxRowsPerPage) {
          pages.push(uniqueNamesItems.slice(i, i + maxRowsPerPage));
        }
        pages.forEach((page, pageIndex) => {
          let receiptContent = `
       <div class="receipt-page" style="page-break-after: ${
         pageIndex < pages.length - 1 ? 'always' : 'avoid'
       };">
 <div>
<div class="header-area">
      <div class="title">
              <h3>AYYAPPA SEVA SANGHAM </h3>
              </div>
              <div class="address">
                <p>Regd. No - 1161/2010-2011, Sector V, Bokaro Steel City</p>
                <p>Ph: 923 430 0663, E-Mail: mail-ayyappatemple365@gmail.com,</p> <p>ayyappatemplebokaro.com</p>
              </div>
              </div>
          <div class="qr">
              <img src="${window.location.origin}/assets/images/qr.png">
              </div>
              <div class="clear">
                <h4 class="receipt">RECEIPT</h4>
              </div>

      </div>
           <div class="content-area">
              <center>
                <table>
                  <tr>
                    <td class="left">Bill No: ${BillNo}</td>
                    <td class="right">Bill Date:  ${Billdate}</td>
                  </tr>
              </table>
`;
          receiptContent += `
                <table class="records" padding="0" >
                  <tr >

                    <th class="border">Name</th>
                    <th class="border center">Star</th>

                    <th class="border center">Pooja Name</th>
                    <th class="border center">Diety</th>
                    <th class="border center">Qty</th>
                    <th class="border center">Rate</th>
                    <th class="border center">Amount</th>
                  </tr>
`;
          let rowCount = 0;
          page.forEach((item: any) => {
            const amount = item.Qty * item.Rate;
            grandTotalAmount += amount;
            rowCount++;
            receiptContent += `
            <tr >
            <td class="border"> ${item.Name}
           ${item.Name2 ? `<div>${item.Name2}</div>` : ''}</td>
           <td class="border center">${this.getStarbyId(item.Star)}${
             item.Star2 ? `<div>${this.getStarbyId(item.Star2)}</div>` : ''
           }</td>
                    <td class="border center"> ${item.Vazhipad}</td>
                    <td class="border center">${item.Prethista}</td>
                    <td class="border center">${item.Qty}</td>
                    <td class="border center">${item.Rate}</td>
                    <td class="border center">${amount}</td>
          </tr>
            <tr>
        <td colspan="6" ></td>
        <td class="righttotal">Total:${grandTotalAmount}</td>
      </tr>
      <tr>
  `;
          });
          for (let i = rowCount; i < 5; i++) {
            receiptContent += `
        <tr style="height: 0.5cm;">
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
       </tr>
    `;
          }
          const hasFooterInfo =
            group.nalBy ||
            group.mday ||
            group.mmonth ||
            group.thithi ||
            group.Remarks ||
            group.Slno;
          receiptContent += `
    <!-- Footer (Total Row) -->

     ${
       hasFooterInfo
         ? `<tr ">
            <td colspan="7">
              ${group.nalBy ? `Nal: ${group.nalBy}` : ''}
              ${group.mday ? `, Day: ${group.mday}` : ''}
              ${group.mmonth ? `, Month: ${group.mmonth}` : ''}
              ${group.thithi ? `, Thithi: ${group.thithi}` : ''}
              ${
                group.Remarks && group.Remarks.toString().trim() != ''
                  ? `, Remark: ${group.Remarks}`
                  : ''
              }
              ${group.Slno ? `, Token: ${group.Slno}` : ''}
            </td>
          </tr>`
         : ''
     }

       <td colspan="4" >Vazhipad Date:
  ${
    fromDate != toDate
      ? `${this.convertDateFormat(fromDate)} to ${this.convertDateFormat(
          toDate,
        )}`
      : `${this.convertDateFormat(fromDate)}`
  }</td>
  <td colspan="3"> ${Address3 ? `, Gothram: ${Address3}` : ''}</td>
      </tr>
      <tr>
      <td>Vazhipad Time:${this.getTimeForBill(group.VTime)}

      </td>
      </tr>

  </table>
  </center>
 </div>
</div>
</div>
`;
          receiptContent += `
    </div>`;
          allReceiptsContent += receiptContent;
        });
      });

      const printContent = `
  <html>
    <head>
      <style>
      @page {
     size: A4;
    margin: 0;
    }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 10pt;
            font-weight: bolder;
          }
          .receipt-page {
            position: relative;
            width: 100%;
             height: auto;
            padding-right: 0.5in;
            margin: 0;
            padding: 0;
            overflow: hidden;
            page-break-after: auto;
          }

           .print-area {
            width: 210mm;
            height: 99mm;
            border: 1px solid gray;
      		  }

        h3,p {
            font-family: arial;
        }
      .receipt{
      text-align:center;
      font-family:arial;
     	font-size:15pt;
      margin-top:5px;
      }

      .address {
     Text-align:left;
      line-height:2pt;
    Padding-left:25px;
    Font-size:10pt;
      }
      .title{
      height:.3cm;
      Text-align:left;
      font-size:18pt;
      margin-bottom:25px;
      margin-top:-15px;
      Padding-left:25px;
      }


      table {
      padding:0;
      margin:0;
      width:95%;
      margin-top:-15px;
      }


      .left{
      	text-align:left;
      }
      .right {
      text-align:right;
      }
      .records {
      margin-top:10px;
       border-collapse: collapse;
      border-spacing: 0;
      margin-bottom:20px
      }

      .border{
     	border:1px solid gray;
      padding:3px;
      margin:0px;
      Font-size:9pt;
      }

      .center{
      text-align:center;
      vertical-align:middle;
      }
      .righttotal{
      text-align:right;
      vertical-align:middle;
      font-size:12pt;
      font-weight:600;
      }
.clear {
Clear:both;
}

.header-area{
Float:left;
}

	.qr {width:2cm;height:2cm;margin-left:15px;float:right;padding-right:20px;}

.qr > img{

Width:100%;
}

td{font-size:10pt;}

        </style>
    </head>
    <body>
      ${allReceiptsContent}
    </body>
  </html>
`;
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);

        this.resetForm();
      }
    }
  }

  printDonationReceipt(data: any) {
    const { BillNo, Billdate, vazhipadinfo, Trnsmode, Address3 } = data;
    this.differentDateArray = [];
    this.sameDateArray = [];
    vazhipadinfo.forEach((item: any) => {
      this.differentDateArray.push(item);
    });
    let allReceiptsContent = '';
    if (this.differentDateArray.length > 0) {
      const groupedData = this.differentDateArray.reduce(
        (acc: any, item: any) => {
          const key = `${item.Prethista}@${item.Vazhipad}@${item.FromDate}@${item.ToDate}`;
          if (!acc[key]) {
            acc[key] = {
              items: [],
              totalQty: 0,
              uniqueNames: new Set(),
              nalBy: '',
              mday: '',
              thithi: '',
              mmonth: '',
              Slno: '',
              TotalAmt: '',
              Remarks: '',
              VTime: '',
            };
          }
          acc[key].items.push(item);
          acc[key].totalQty += parseInt(item.Qty, 10);
          acc[key].uniqueNames.add(item.Name);
          if (item.NalBy) acc[key].nalBy = item.NalBy;
          if (item.Mday) acc[key].mday = item.Mday;
          if (item.SearchBy) acc[key].thithi = item.SearchBy;
          if (item.Mmonth) acc[key].mmonth = item.Mmonth;
          if (item.Slno) acc[key].Slno = item.Slno;
          if (item.TotalAmt) acc[key].TotalAmt = item.TotalAmt;
          if (item.Remarks) acc[key].Remarks = item.Remarks;
          if (item.VTime) acc[key].VTime = item.VTime;
          return acc;
        },
        {},
      );
      const maxRowsPerPage = 5;
      Object.keys(groupedData).forEach((key) => {
        const group = groupedData[key];
        const [prathista, vazhipad, fromDate, toDate] = key.split('@');
        const items = group.items;
        let grandTotalAmount = 0;
        const nameGroupedItems = items.reduce((nameAcc: any, item: any) => {
          if (!nameAcc[item.Name]) {
            nameAcc[item.Name] = {
              ...item,
              Qty: 0,
            };
          }
          nameAcc[item.Name].Qty += parseInt(item.Qty, 10);
          return nameAcc;
        }, {});
        const uniqueNamesItems = Object.values(nameGroupedItems);
        const pages = [];
        for (let i = 0; i < uniqueNamesItems.length; i += maxRowsPerPage) {
          pages.push(uniqueNamesItems.slice(i, i + maxRowsPerPage));
        }
        pages.forEach((page, pageIndex) => {
          let receiptContent = `
       <div class="receipt-page" style="page-break-after: ${
         pageIndex < pages.length - 1 ? 'always' : 'avoid'
       };">
 <div>
<div class="header-area">
      <div class="title">
              <h3>${this.templeName}</h3>
              </div>
              <div class="address">
                <p>${this.templeAddress}</p>

              </div>
              </div>
          <div class="qr">
              <img src="${window.location.origin}/assets/images/temple_logo.png">
              </div>
              <div class="clear">
                <h4 class="receipt">RECEIPT</h4>
              </div>

      </div>
           <div class="content-area">
              <center>
                <table>
                  <tr>
                    <td class="left">Bill No: ${BillNo}</td>
                    <td class="right">Bill Date:  ${Billdate}</td>
                  </tr>
              </table>
`;

          let rowCount = 0;
          page.forEach((item: any) => {
            const amount = item.Qty * item.Rate;
            grandTotalAmount += amount;
            rowCount++;
            receiptContent = `
<div class="donation-page">

  <!-- HEADER -->
  <div class="header">
    <div class="logo">
      <img src="${this.templeLogoUrl}" />
    </div>

    <div class="temple-info">
      <h2>${this.templeName}</h2>
      <p>${this.templeAddress}</p>
    </div>
  </div>

  <div class="receipt-title">DONATION RECEIPT</div>

  <!-- BILL INFO -->
  <div class="bill-row">
    <span><b>Receipt No:</b> ${BillNo}</span>
    <span><b>Date:</b> ${Billdate}</span>
  </div>

  <!-- CONTENT -->
  <div class="donation-body">

    ${page
      .map((item: any) => {
        const amount = item.Qty * item.Rate;

        return `
      <div class="donation-block">

        <div class="row">
          <span class="label">Devotee</span>
          <span class="value">${item.Name}</span>
        </div>

        <div class="row">
          <span class="label">Vazhipad</span>
          <span class="value">${item.Vazhipad}</span>
        </div>



        <div class="row amount">
          <span class="label">Amount</span>
          <span class="value">₹ ${amount}</span>
        </div>

      </div>
      `;
      })
      .join('')}

  </div>

  <!-- THANK YOU -->
  <div class="footer">
    <p class="thanks">🙏 Thank You for Your Donation 🙏</p>
    <p>May divine blessings be with you and your family</p>
  </div>

  <!-- SIGN -->
  <div class="sign">
    <span>Authorized Signatory</span>
  </div>

</div>
`;
          });

          receiptContent += `
    </div>`;
          allReceiptsContent += receiptContent;
        });
      });

      const printContent = `
  <html>
    <head>
      <style>
      @page {
  size: A4;
  margin: 10mm;
}

body {
  font-family: Arial, sans-serif;
  margin: 0;
}

.donation-page {
  border: 2px solid #223d61;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  page-break-after: always;
}

/* HEADER */
.header {
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 2px solid #223d61;
  padding-bottom: 10px;
}

.logo img {
  width: 70px;
  height: 70px;
}

.temple-info h2 {
  margin: 0;
  color: #223d61;
}

.temple-info p {
  margin: 2px 0;
  font-size: 10pt;
}

/* TITLE */
.receipt-title {
  text-align: center;
  font-size: 18pt;
  font-weight: bold;
  margin: 15px 0;
  color: #223d61;
}

/* BILL */
.bill-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

/* BODY */
.donation-body {
  margin-top: 10px;
}

.donation-block {
  border: 1px dashed #ccc;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 6px;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.label {
  font-weight: bold;
  color: #444;
}

.value {
  font-weight: 500;
}

.amount {
  font-size: 14pt;
  color: green;
  font-weight: bold;
}

/* FOOTER */
.footer {
  text-align: center;
  margin-top: 20px;
}

.thanks {
  font-size: 14pt;
  font-weight: bold;
  color: #223d61;
}

/* SIGN */
.sign {
  margin-top: 40px;
  text-align: right;
  font-size: 10pt;
}

        </style>
    </head>
    <body>
      ${allReceiptsContent}
    </body>
  </html>
`;
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);

        this.resetForm();
      }
    }
  }
}
