import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { MasterService } from '../../../services/master/master.service';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-devotee-fee-collection',
  standalone: true,
  imports: [
    MatIconModule,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
  ],
  templateUrl: './devotee-fee-collection.component.html',
  styleUrl: './devotee-fee-collection.component.css',
})
export class DevoteeFeeCollectionComponent implements OnInit {
  lang: string | null;
  toppings = new FormControl([]);
  feeCollctionForm: FormGroup;
  loginId: string | null;
  counterId: string | null;
  name: string | null;
  itemList: any[];
  formattedDate: any;
  lockTableLastbillNumber: number;
  billNumberFormatDate: string;
  generatedCurrentBillnumber: string;
  DevoteemobileNumber: string;
  devoteeFeeeCollectiondetails: any[];
  yearList: number[] = [];
  role: string | null;

  monthList: { Month: string }[] = [];
  monthString = '';
  toppingList: string[] = [
    'Jan',
    'Feb',
    'March',
    'April',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ];
  today: Date;
  todayDate: any;
  templeName: string | null = '';
  templeAddress: string | null = '';
  printerLayOut: string | null;
  receiptMonthYear: string = '';
  CounterId: string | null = '';
  logo: string | null = '';
noDataFound: boolean = false;

  constructor(
    private ts: TranslateService,
    private masterService: MasterService,
    private fb: FormBuilder,
    private notification: NotificationService
  ) {
    this.lang = localStorage.getItem('Language');
    this.printerLayOut = localStorage.getItem('Printer');

    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.counterId = localStorage.getItem('counterId');
    this.templeName = localStorage.getItem('TempleName');
    this.templeAddress = localStorage.getItem('Address');
    this.loginId = localStorage.getItem('LoginId');
    this.name = localStorage.getItem('name');
    this.CounterId = localStorage.getItem('counterId');
    this.role = localStorage.getItem('Role');

    this.billNumberFormatDate = this.getCurrentDateMMYY();
    this.logo = localStorage.getItem('Logo');

    this.today = new Date();
    this.todayDate = this.today.toISOString().split('T')[0];
    this.feeCollctionForm = this.fb.group({
      Mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      MemberId: ['', Validators.required],
      BillNo: ["", Validators.required],
      ItemType: ['', Validators.required],
      TransMode: ['CS', Validators.required],
      UserId: [this.loginId, Validators.required],
      CounterId: [this.counterId, Validators.required],
      Instano: [''],
      Instdate: [this.formattedDate],
      InstBank: [''],
      TranStatus: ['S'],
      fdate: [this.formattedDate, Validators.required],
      tdate: [this.formattedDate, Validators.required],
      Name: ['', Validators.required],
      Address: ['', Validators.required],
      Amount: ['', Validators.required],
      totalAmount: ['', Validators.required],
    })
  }
  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.yearList = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  }

  getDevteeMasteItem() {
    const payLoad = {
      Type: 'SubscriptionItem',
      Code: '',
    };
    this.masterService.getMaster(payLoad).subscribe((data) => {
      this.itemList = data;
    });
  }

  formatDateToDDMMYYYY(dates: any): string {
    const date = new Date(dates);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
    ngOnInit(): void {
    this.getDevteeMasteItem();
    this.getBillNumberforFeecollection()
    this.feeCollctionForm.get('ItemType')?.valueChanges.subscribe((value) => {
      this.onItemTypeChange(value);
    });

    this.feeCollctionForm.get('fdate')?.valueChanges.subscribe(() => {
      this.calculateTotalAmount();
    });

    this.feeCollctionForm.get('tdate')?.valueChanges.subscribe(() => {
      this.calculateTotalAmount();
    });
    this.feeCollctionForm.get('TransMode')?.valueChanges.subscribe(value => {
      if (value === 'CH') {
        this.feeCollctionForm.get('instBank')?.setValidators([]);
        this.feeCollctionForm.get('instDate')?.setValidators([]);
      } else {
        this.feeCollctionForm.get('instBank')?.setValue('');
        this.feeCollctionForm.get('instDate')?.setValue('');
        this.feeCollctionForm.get('instBank')?.setValidators(null);
        this.feeCollctionForm.get('instDate')?.setValidators(null);
      }
      this.feeCollctionForm.get('instBank')?.updateValueAndValidity();
      this.feeCollctionForm.get('instDate')?.updateValueAndValidity();
    });
  }

  updateVazhipadInfo(selectedMonths: string[]) {
    const vazhipadArray = this.feeCollctionForm.get(
      'vazhipadInfo'
    ) as FormArray;
    vazhipadArray.clear();

    selectedMonths.forEach((Month) => {
      vazhipadArray.push(this.fb.group({ Month }));
    });

    const totalAmount =
      selectedMonths.length *
      Number(this.feeCollctionForm.get('Amount')?.value);
    this.feeCollctionForm.patchValue({ totalAmount: totalAmount });
  }

  search() {
    const mobileNumber = this.feeCollctionForm.get('Mobile')?.value;
    if (mobileNumber?.invalid) {
      this.notification.showError(
        'Invalid mobile number please enter a valid mobile number'
      );
      return;
    }
    // console.log(mobileNumber)
    if (mobileNumber) {
      console.log('Searching for:', mobileNumber);
      const payload = {
        Type: 'MemberID',
        Code: mobileNumber,
      };
      this.masterService.getMaster(payload).subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.feeCollctionForm.patchValue({
              MemberId: data[0].MID,
              Name: data[0].Name,
              Address: data[0].Address,
            });
          } else {
            this.notification.showError(
              'No member is found in the Mobile number please check'
            );
          }
        },
      });
    } else {
      console.log('Please enter a mobile number');
    }
  }

  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }

  onItemTypeChange(value: any) {

    const selectedId = Number(value);

    const selectedItem = this.itemList.find(
      (item: any) => item.NM_Id === selectedId
    );

    if (!selectedItem) return;

    const amount = Number(selectedItem.Amount || 0);

    const category = selectedItem.NM_Category
      ?.toLowerCase()
      .replace(/\s/g, '')
      .trim();

    if (category === 'lifetime') {



      this.feeCollctionForm.patchValue({
        Amount: amount,
        totalAmount: amount
      });

      return;
    }
    this.feeCollctionForm.patchValue({
      Amount: amount
    });

    this.calculateTotalAmount();
  }


  onSubmit() {
    if (this.feeCollctionForm.valid) {
      const formData = this.feeCollctionForm.value
      const totalAmount = formData.totalAmount;
      const amount = formData.Amount;
      // const updatedVazhipadInfo = formData.vazhipadInfo.map((item: any) => {
      //   return {
      //     ...item,
      //     Amount: amount,
      //     TotalAmt: totalAmount,
      //   };
      // });

      this.getBillNumber()
      const payLoad = {
        Memberid: formData.MemberId.toString(),
        BillNo: formData.BillNo,
        ItemType: formData.ItemType,
        Trnsmode: formData.TransMode,
        Userid: formData.UserId,
        CounterId: formData.CounterId,
        Instno: formData.Instano,
        Instdate: this.formatDateToDDMMYYYY(formData.Instdate),
        InstBank: formData.InstBank,
        TranStatus: formData.TranStatus,
        Fdate: this.formatDateToDDMMYYYY(formData.fdate),
        Tdate: this.formatDateToDDMMYYYY(formData.tdate),
        TotalAmt: formData.totalAmount,
        Amount: formData.Amount
      }

      this.masterService.addFeeCollection(payLoad).subscribe((data) => {
        if (data.RespStatus == "I") {
          const payLoad = {
            Type: "UpdateBillNoFeeCollection",
            Code: this.lockTableLastbillNumber + 1
          }
          this.masterService.getMaster(payLoad).subscribe((data) => {
            this.printFeeCollection();
            this.getBillNumberforFeecollection();
            this.Reset()
          })
        }
      })
    } else {
      this.notification.showError('Please fill all required fields!')
    }
  }

  Reset() {
    this.feeCollctionForm.reset({
      Mobile: "",
      MemberId: "",
      BillNo: "",
      ItemType: "",
      TransMode: "CS",
      UserId: this.loginId,
      CounterId: this.counterId,
      Instano: "",
      Instdate: this.formattedDate,
      InstBank: "",
      TranStatus: 'S',
      fdate: '',
      tdate: '',
      Name: '',
      Address: '',
      Amount: '',
      totalAmount: '',

    });
  }

  getBillNumberforFeecollection() {
    const payLoad = {
      Type: 'MaxBillnoFeeCollection',
      Code: '',
    };
    this.masterService.getMaster(payLoad).subscribe((data) => {
      const billnumber =
        'FC' + data[0].billno.toString() + '/' + this.billNumberFormatDate;
      this.feeCollctionForm.patchValue({
        BillNo: billnumber,
      });
    });
  }

  prepareReceiptData() {
    let selectedMonths = this.toppings.value;
    const selectedYear = this.feeCollctionForm.get('Year')?.value;
    // If only one month is selected, convert it to array
    if (typeof selectedMonths === 'string') {
      selectedMonths = [selectedMonths];
    }
    if (selectedMonths && selectedMonths.length > 0 && selectedYear) {
      this.receiptMonthYear = selectedMonths
        .map((month: string) => `${month} ${selectedYear}`)
        .join(', ');
    } else {
      this.receiptMonthYear = 'No months selected';
    }
  }

  printFeeCollection() {
    if (this.printerLayOut == 'laser') {
      // this.printReciept();
    } else if (this.printerLayOut == 'inkJet') {
      // this.printReciept();
    } else if (this.printerLayOut == 'thermal') {
      // this.prepareReceiptData();
      this.printThermlRecipt();
    } else if (this.printerLayOut == 'dotMetrix') {
      this.printRecieptDotmetrix();
    } else if (this.printerLayOut == 'lasera5') {
      // this.printReciept()
    }
  }

  printRecieptDotmetrix() {
    const printContents = document.getElementById('receipt')?.innerHTML;
    if (!printContents) {
      console.error('No content found to print!');
      return;
    }
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
                font-size: 12px;
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
    } else {
      console.error('Failed to open print window!');
    }
  }


  printThermlRecipt() {
    const printContents = document.getElementById('thermalreceipt')?.innerHTML;
    if (!printContents) {
      console.error('No content found to print!');
      return;
    }
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

  getBillNumber() {
    const payLoad = {
      Type: 'MaxBillnoFeeCollection',
      Code: '',
    };
    this.masterService.getMaster(payLoad).subscribe((data) => {
      // console.log(data, "bill");
      if (data[0].billno) {
        this.lockTableLastbillNumber = data[0].billno;
        // console.log(this.lockTableLastbillNumber);
        // console.log(this.billNumberFormatDate);
        this.generatedCurrentBillnumber =
          'FC' +
          this.lockTableLastbillNumber.toString() +
          '/' +
          this.billNumberFormatDate;
        // console.log(this.generatedCurrentBillnumber, "fc bill");
        // updatedData.BillNo = this.generatedCurrentBillnumber;
        // console.log(updatedData, 'after add bill number');

        // const payLoad = {
        //   Type: 'FeeCollectionBillLock',
        //   Code: this.counterId + 'Lock',
        // };
        // console.log(payLoad);
        // this.masterService.getMaster(payLoad).subscribe((data) => {
        //   console.log(data, 'locked billapi reposnse');
        //   // this.onSubmitBookingDetailsApiCall(updatedData);
        // });
      } else {
        // this.retryFetchBillNumber(updatedData);
      }
    });
  }

searchByDevoteeByMobileNumber() {
  const searchValue = this.DevoteemobileNumber?.trim();
  if (!searchValue) {
    this.devoteeFeeeCollectiondetails = [];
    this.noDataFound = true;
    return;
  }

  const payLoad = {
    Type: 'DevoteeFeeCollect',
    Code: searchValue,
  };

  this.masterService.getMaster(payLoad).subscribe({
    next: (data) => {
      if (data && data.length > 0) {
        this.devoteeFeeeCollectiondetails = data;
        this.noDataFound = false;
      } else {
        this.devoteeFeeeCollectiondetails = [];
        this.noDataFound = true;
      }
    },
    error: () => {
      this.devoteeFeeeCollectiondetails = [];
      this.noDataFound = true;
    },
  });
}


  getItemNameById(starId: number): string {
    if (this.lang == 'en') {
      if (starId) {
        const star = this.itemList.find((s) => s.NM_Id == starId);

        return star ? star.NM_Name : '';
      } else {
        return '';
      }
    } else if (this.lang == 'ml') {
      if (starId) {
        const star = this.itemList.find((s) => s.NM_Id == starId);

        return star ? star.NM_RName : '';
      } else {
        return '';
      }
    } else return '';
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

  resetSearch() {
  this.DevoteemobileNumber = '';
  this.devoteeFeeeCollectiondetails = [];
  this.noDataFound = false;
}

 calculateTotalAmount() {
    const itemId = this.feeCollctionForm.get('ItemType')?.value;
    const amount = Number(this.feeCollctionForm.get('Amount')?.value || 0);
    const fromDate = this.feeCollctionForm.get('fdate')?.value;
    const toDate = this.feeCollctionForm.get('tdate')?.value;
    const selectedItem = this.itemList.find(
      (item: any) => item.NM_Id == itemId
    );

    if (!selectedItem) return;
    const category = selectedItem.NM_Category
      ?.toLowerCase()
      .replace(/\s/g, '')
      .trim();

    /* Lifetime */
    if (category === 'lifeTime') {
      this.feeCollctionForm.patchValue({
        totalAmount: amount
      });
      return;
    }

    if (!fromDate || !toDate) return;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (end < start) {
      this.feeCollctionForm.patchValue({
        totalAmount: amount
      });
      return;
    }

    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    if (end.getDate() >= start.getDate()) {
      months += 1;
    }

    if (months <= 0) {
      months = 1;
    }

    /* Monthly */
    if (category === 'monthly') {
      const total = months * amount;
      this.feeCollctionForm.patchValue({
        totalAmount: total
      });
      return;
    }

    /* Yearly */
    if (category === 'yearly') {
      const years = Math.ceil(months / 12);
      const total = years * amount;
      this.feeCollctionForm.patchValue({
        totalAmount: total
      });
      return;
    }
  }
}
