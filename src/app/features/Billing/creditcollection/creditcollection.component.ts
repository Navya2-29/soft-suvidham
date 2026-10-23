import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MasterService } from '../../../services/master/master.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime } from 'rxjs';
@Component({
  selector: 'app-creditcollection',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './creditcollection.component.html',
  styleUrl: './creditcollection.component.css',
})
export class CreditcollectionComponent {
  CreditForm: FormGroup;
  creditCollectionData: any[] = [];
  userId: string | null;
  role: string | null;
  CounterId: string | null;
  nakshatham: any[];
  currentDate: string;
  lastBillnumber: number;
  currentBillNumber: string;
  theLastBillNo: string;
  name: string | null;
  fnameCtrl = new FormControl('');
  totalAmount: number = 0;
  PaidMount: number = 0;
  Balanace: number = 0;
  filteredData: any[] = [];
  searchForm: FormGroup;
  today: Date = new Date();
  cancellationReason: string;
  cancelBillNumber: string;
  lang: string | null;
  printerLayOut: string | null;
  templeName: string | null = '';
  templeAddress: string | null = '';
  logo: string | null = '';
  isRegistered: boolean = false;
  isSubmitting: boolean = false;
  allData: any[] = [];
  hasFilteredData: boolean = false;
  constructor(
    private service: MasterService,
    private fb: FormBuilder,
    private notification: ToastrService,
    private ts: TranslateService
  ) {
    this.lang = localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName');
    this.templeAddress = localStorage.getItem('Address');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.userId = localStorage.getItem('LoginId');
    this.role = localStorage.getItem('Role');
    this.CounterId = localStorage.getItem('counterId');
    this.printerLayOut = localStorage.getItem('Printer');
    this.name = localStorage.getItem('name');
    this.logo = localStorage.getItem('Logo');
    this.CreditForm = this.fb.group({
      BillNo: ['',],
      Name: ['', [Validators.required]],
      Mobile: ['', Validators.required],
      Address: [''],
      MID: ['', Validators.required],
      TrnsMode: ['CS'],
      RefNo: ['0'],
      Amount: ['', [Validators.required]],
      Remarks: [''],
      UserId: [this.userId],
      CounterId: [this.CounterId],
    });
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      searchBillDate: [''],
      searchBillNo: [''],
    });
    this.currentDate = this.getCurrentDateMMYY();
    // this.getBillNumber();
    this.instanoValidation();

    // this.getCreditCollection();
    this.CreditForm.get('Mobile')
      ?.valueChanges.pipe(debounceTime(500))
      .subscribe(() => this.checkMobileRegistration());
  }

  onSearchByBillDate(): void {
    const searchBillDate = this.searchForm.value.searchBillDate;

    if (searchBillDate) {
      const formattedSearchDate = new Date(searchBillDate).toLocaleDateString(
        'en-GB'
      );

      this.filteredData = this.creditCollectionData.filter((item) => {
        const itemBillDate = new Date(item.BillDate).toLocaleDateString(
          'en-GB'
        );
        return itemBillDate === formattedSearchDate;
      });
    } else {
      this.filteredData = this.creditCollectionData;
    }
  }

  onSearchByBillNumber(): void {
    const searchValue = this.searchForm.value.searchBillNo?.trim();

    // If nothing is entered, show all data
    if (!searchValue) {
      this.filteredData = this.creditCollectionData;
      return;
    }

    const lowerSearch = searchValue.toLowerCase();

    this.filteredData = this.creditCollectionData.filter((item) => {
      const billNoMatch = item.BillNo?.toString()
        .toLowerCase()
        .includes(lowerSearch);
      const mobileMatch = item.MobileNo?.toString()
        .toLowerCase()
        .includes(lowerSearch);
      const namematch = item.Name?.toString()
        .toLowerCase()
        .includes(lowerSearch);
      return billNoMatch || mobileMatch || namematch;
    });
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.filteredData = [...this.creditCollectionData];
  }

  instanoValidation() {
    this.CreditForm.get('TrnsMode')?.valueChanges.subscribe((mode) => {
      const instNoControl = this.CreditForm.get('Remarks');
      if (mode === 'UP') {
        instNoControl?.setValidators([Validators.required]);
      } else {
        instNoControl?.clearValidators();
      }
      instNoControl?.updateValueAndValidity();
    });
  }

  getCreditCollection() {
    // const payLoad = { Type: 'ListCreditCollection', Code: '' };
    const searchValue = this.searchForm.get('searchBillNo')?.value?.trim();
    if (!searchValue && searchValue == '') {
      this.notification.warning('Please enter a mobile number to search');
      return;
    }
    const payLoad = { Type: 'DevoteeDue', Code: searchValue };
    this.service.getNadavaravBillNumber(payLoad).subscribe((data) => {
      this.allData = data;
      this.creditCollectionData = data.filter(
        (item: any) => item.TrnsMode?.toLowerCase() == 'due'
      );
      this.creditCollectionData = (this.creditCollectionData || []).sort(
        (a: any, b: any) => {
          const billA = Number(a.BillNo) || 0;
          const billB = Number(b.BillNo) || 0;
          return billA - billB;
        }
      );

      // console.log(this.creditCollectionData, 'dataas credu');

      this.filteredData = this.creditCollectionData.filter(
        (item: any) =>
          item.MobileNo?.toString().includes(searchValue) ||
          item.Mid?.toString() === searchValue
      );
      this.hasFilteredData = this.filteredData.length > 0;
      // if (this.filteredData.length === 0) {
      //   this.notification.info('No records found for this mobile number');
      // }
    });
  }

  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }
  // getBillNumber() {
  //   const payLoad = {
  //     Type: 'MaxBillnoCredit',
  //     code: '',
  //   };
  //   this.service.getNadavaravBillNumber(payLoad).subscribe({
  //     next: (data) => {
  //       this.lastBillnumber = data[0].billno;
  //       this.theLastBillNo =
  //         'CR' + this.lastBillnumber.toString() + '/' + this.currentDate;

  //       this.currentBillNumber =
  //         (this.lastBillnumber + 1).toString() + '/' + this.currentDate;

  //       this.CreditForm.patchValue({
  //         BillNo: this.theLastBillNo,
  //       });
  //     },
  //   });
  // }

  onSubmit() {
    // console.log(this.CreditForm.value, 'checking values hai');
    if (this.CreditForm.valid) {
      this.isSubmitting = true;
      const payLoad = {
        BillNo: this.CreditForm.value.BillNo,
        RefNo: this.CreditForm.value.RefNo,
        Amount: this.CreditForm.value.Amount,
        TrnsMode: this.CreditForm.value.TrnsMode,
        UserId: this.userId,
        CounterId: this.CounterId,
        Remarks: this.CreditForm.value.Remarks,
        MID: this.CreditForm.value.MID.toString(),
        MobileNo: this.CreditForm.value.Mobile,
      };

      this.service.createCreditCollection(payLoad).subscribe((data) => {
        if (data.RespStatus === 'I') {
          // this.getCreditCollection();
const billNo=data.BillNo;
this.lastBillnumber=billNo;
          this.notification.success(data.RespMsg);
          // const currentBillnumber = this.lastBillnumber + 1;

          // this.service.updatecreditBillNumber(currentBillnumber).subscribe({
          //   next: (data) => {
          setTimeout(() => {
              this.printCreditCollection();
            }, 200);

              this.isSubmitting = false;
              // this.getBillNumber();
              // this.getCreditCollection();
              
          //   },
          //   error: (err) => {
          //     this.isSubmitting = false;
          //     this.notification.error(
          //       'Something went wrong please try again',
          //       'Credit Collection'
          //     );
          //   },
          // });
        }
      });
    } else {
      this.notification.error(
        'Something went wrong please try again',
        'Credit Collection'
      );
      this.CreditForm.markAllAsTouched();
    }
  }

  Reset() {
    this.CreditForm.reset({
      BillNo: '',
      Name: '',
      Mobile: '',
      Address: '',
      MID: '',
      TrnsMode: 'CS',
      RefNo: '',
      Amount: '',
      Remarks: '',
      UserId: this.userId,
      CounterId: this.CounterId,
    });
    this.totalAmount = 0;
    this.Balanace = 0;
    this.PaidMount = 0;
  }

  // onEdit(data: any) {
  //   this.totalAmount = data.Amount;
  //    const fullAddress = [data.Address1, data.Address2]
  //   .filter(Boolean) // removes null/undefined/empty values
  //   .join(', ');
  //   this.CreditForm.patchValue({
  //     Name: data.Name,
  //     Mobile: data.MobileNo,
  //     Address: fullAddress,
  //     Amount: data.Amount,
  //     TrnsMode: 'CS',
  //     RefNo: data.BillNo,
  //   });
  // }

  // cancellTheBill(billnumber: string) {
  //   this.cancelBillNumber = billnumber;
  //   this.openCancelRemarkDialog();
  // }

  // OnCancelSubmit() {
  //   const payLoad = {
  //     Type: 'Nadavaravu',
  //     BillNo: this.cancelBillNumber,
  //     CancelBy: this.userId,
  //     Remarks: this.cancellationReason,
  //   };
  //   this.service.cancellBill(payLoad).subscribe((data) => {});
  // }

  // openCancelRemarkDialog() {
  //   const remarkDialogRef = this.dialog.open(CancelBillRemarkComponent, {
  //     width: '400px',
  //     data: { reason: this.cancellationReason },
  //   });

  //   remarkDialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       this.cancellationReason = result;
  //       this.OnCancelSubmit();
  //     } else {
  //     }
  //   });
  // }

  printCreditCollection() {
    if (this.printerLayOut == 'laser') {
      this.printReciept();
    } else if (this.printerLayOut == 'inkJet') {
      this.printReciept();
    } else if (this.printerLayOut == 'thermal') {
      this.printThermlRecipt();
    } else if (this.printerLayOut == 'dotMetrix') {
      this.printReciept();
    } else if (this.printerLayOut == 'lasera5') {
      this.printReciept();
    }
  }

  printReciept() {
    const printContents = document.getElementById('receipt')?.innerHTML;
    const printWindow = window.open('', '_blank', 'height=500, width=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 12pt;
              font-weight:bold;
            }
            #receipt, #duplicateRecipt {
              width: 6in; /* Width in inches */
              height: 4in; /* Height in inches */
              position: relative;
            }
            div {
              position: absolute;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      this.Reset();
    } else {
      console.error('Failed to open print window!');
    }
  }

  printThermlRecipt() {
    const printContents = document.getElementById('thermalreceipt')?.innerHTML;
    const printWindow = window.open('', '_blank', 'height=500, width=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
             body {
              margin: 10px;
              padding: 0;
              
             font-family:Manjari;
              
              text-align: left;
            }

            .receipt-page {
              position: relative;
              width: 80mm;;
              height: auto;
              margin: 0 auto;
              padding: 10px;
              overflow: hidden;
              page-break-after: auto;
              // border: 1px dashed #000;
              
            }

            .receipt-header {
              font-size: 12pt;
              font-weight: bold;
              text-align: center;
              margin-bottom: 2px;
              font-family:Manjari;
            }

            .receipt-sub-header {
              font-size: 6pt;
              text-align: center;
              margin-bottom: 5px;
              font-family:Manjari;
              // font-weight: bold;
            }

            hr {
              border: 0;
              border-top: 1px dashed black;
              margin: 8px 0px;
            }
              .receipt-contentbill{
              margin-top:10px;
              }

            .receipt-content {
              text-align: left;
              font-size: 10pt;
              margin-bottom: 5px;
              margin-top:10px;
              margin-top:5px;
              font-family:Manjari;
              font-weight: bold;
            }
              .receipt-content-vd{
              text-align: left;
              font-size: 12pt;
              margin-bottom: 10px;
              margin-top:10px;
              
              font-family:Manjari;
              font-weight: bold;
              }
              .receipt-contents {
              text-align: left;
              font-size: 10pt;
              
              margin-top:10px;
              font-family:Manjari;
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
              }
            .receipt-footer {
              font-size: 9pt;
              margin-top: 3px;
              font-style: italic;
              text-align: left;
            }
            .nd{
            font-size: 18pt;
            font-weight:bold;

            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      console.error('Failed to open print window!');
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
  checkMobileRegistration() {
    const mobile = this.CreditForm.get('Mobile')?.value?.trim();
    if (!mobile) return;
    const payLoad = {
      Type: 'DevoteeNameStar',
      Code: mobile,
    };
    this.service.getMaster(payLoad).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          // Mobile registered, fill form
          const devotee = data[0];
          this.totalAmount = devotee.Due;
          this.PaidMount = devotee.Paid;
          if (this.totalAmount > this.PaidMount) {
            this.Balanace = this.totalAmount - this.PaidMount;
          } else {
            this.Balanace = this.PaidMount - this.totalAmount;
          }

          this.CreditForm.patchValue({
            Name: devotee.Name,

            // Address: [devotee.Address1, devotee.Address2, devotee.Address3]
            //   .filter(Boolean)
            //   .join(', '),
            MID: devotee.MID,
          });
          this.isRegistered = true;
        } else {
          // Not registered
          this.isRegistered = false;
          this.CreditForm.patchValue({
            Name: '',
            Address: '',
            MID: '',
          });

          // Warning toaster
          this.notification.warning(
            'Mobile number not registered. Please register first.',
            'Mobile Check'
          );
        }
      },
      error: (err) => {
        this.isRegistered = false;
        this.notification.error('Error checking mobile number', 'Mobile Check');
        console.error(err);
      },
    });
  }
  
  getDuetotal(mode: string): number {
    if (!this.allData || this.allData.length === 0) return 0;

    return this.allData
      .filter((item) => item.TrnsMode?.toLowerCase() === mode.toLowerCase())
      .reduce((sum, item) => sum + (Number(item.Amount) || 0), 0);
  }
}
