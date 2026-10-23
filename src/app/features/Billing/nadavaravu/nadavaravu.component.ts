import { ItemMaster } from '../../../models/item-master.model';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CancelBillRemarkComponent } from '../cancel-bill-remark/cancel-bill-remark.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { NumberToWordsPipe } from '../../../shared/pipe/number-to-words.pipe';

@Component({
  selector: 'app-nadavaravu',
  standalone: true,
  imports: [
    MatIconModule,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './nadavaravu.component.html',
  styleUrl: './nadavaravu.component.css',
  providers: [NumberToWordsPipe],
})
export class NadavaravuComponent implements OnInit {
  nadavaravForm: FormGroup;
  userId: string | null;
  role: string | null;
  CounterId: string | null;
  nakshatham: any[];
  itemMaster: ItemMaster[] = [];
  currentDate: string;
  theLastBillNo: string;
  nadavaravData: any[] = [];
  filteredData: any[] = [];
  searchForm: FormGroup;
  today: Date = new Date();
  cancellationReason: string;
  cancelBillNumber: string;
  nadavaravuDataPrint: any;
  templeName: string | null;
  templeAddress: string | null;
  logo: string | null;
  name: string | null;
  templeLogoUrl: string = '';
  starName: string;
  dupliacteBillData: any;
  itemName: string;
  lang: string | null;
  todayDate = new Date();
  duplicateBillFlag: boolean = false;
  printerLayOut: string | null;
  selectedAmount: number | null | undefined = null;
  imageUrls = window.location.origin + '/assets/images/temple-logo.jpeg';

  constructor(
    private fb: FormBuilder,
    private service: MasterService,
    private notification: ToastrService,
    private router: Router,
    private dialog: MatDialog,
    private ts: TranslateService
  ) {
    this.lang = localStorage.getItem('Language');
    this.printerLayOut = localStorage.getItem('Printer');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.userId = localStorage.getItem('LoginId');
    this.role = localStorage.getItem('Role');
    this.CounterId = localStorage.getItem('counterId');
    this.templeName = localStorage.getItem('TempleName');
    this.templeAddress = localStorage.getItem('Address');
    this.logo = localStorage.getItem('Logo');
    this.name = localStorage.getItem('name');

    if (this.logo) {
      this.templeLogoUrl = `assets/images/${this.logo}`;
    }
    this.nadavaravForm = this.fb.group({
      BillNo: [''],
      Name: ['', [Validators.required]],
      Star: [''],
      Address: [''],
      Description: [''],
      NMId: ['', [Validators.required]],
      Qty: ['1'],
      weight: [''],
      unit: [''],
      ItemValue: ['0'],
      ReceiptAmount: ['0'],
      Remarks: [''],
      TrnsMode: ['CS'],
      UserId: [this.userId],
      CounterId: [this.CounterId],
    });
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      searchDate: [''],
      searchBillNO: [''],
    });
    this.currentDate = this.getCurrentDateMMYY();
    // this.getBillNumber();
    this.getStar();
    this.getNadavaravuItem();
    this.setupConditionalValidationForItemValue();
    this.getNadavaravuData();
    // console.log(this.lang)
  }

  setupConditionalValidationForItemValue() {
    this.nadavaravForm
      .get('ItemValue')
      ?.valueChanges.subscribe((value: any) => {
        if (value) {
          this.nadavaravForm.get('weight')?.setValidators(Validators.required);
          this.nadavaravForm.get('unit')?.setValidators(Validators.required);
        } else {
          this.nadavaravForm.get('weight')?.clearValidators();
          this.nadavaravForm.get('unit')?.clearValidators();
        }
        this.nadavaravForm.get('weight')?.updateValueAndValidity();
        this.nadavaravForm.get('unit')?.updateValueAndValidity();
      });
  }

  onSubmit() {
    this.duplicateBillFlag = false;
    if (this.nadavaravForm.invalid) {
      this.notification.error(
        'Please fill the form before saving.',
        'Nadavarav'
      );
      this.markAllFieldsAsTouched();
      return;
    }

    const starId = this.nadavaravForm.get('Star')?.value;
    const starName = this.getStarNameById(starId);
    this.starName = this.getStarNameById(starId);

    const itemName = this.getItemById(this.nadavaravForm.value?.NMId);
    this.itemName = itemName;
    const formData = this.nadavaravForm.value;
    formData.Star = starName;

    const payLoad = {
      BillNo: '',
      Name: this.nadavaravForm.value?.Name,
      Star: starId,
      Address: this.nadavaravForm.value?.Address,
      Description: this.nadavaravForm.value?.Description,
      NMId: this.nadavaravForm.value?.NMId,
      Qty: this.nadavaravForm.value?.Qty,
      weight: this.nadavaravForm.value?.weight,
      unit: this.nadavaravForm.value?.unit,
      ItemValue: this.nadavaravForm.value?.ItemValue,
      ReceiptAmount: this.nadavaravForm.value?.ReceiptAmount,
      Remarks: this.nadavaravForm.value?.Remarks,
      TrnsMode: this.nadavaravForm.value?.TrnsMode,
      UserId: this.nadavaravForm.value?.UserId,
      CounterId: this.nadavaravForm.value?.CounterId,
    };
    this.service.nadavaravBooking(payLoad).subscribe({
      next: (data: any) => {
        if (data.RespStatus == 'I') {
          const billNo = data.BillNo;
          // this.nadavaravForm.patchValue({
          //   BillNo: billNo,
          // });
          // console.log(billNo, 'bill no');
          this.theLastBillNo = billNo;
          console.log(`the last bill no ${this.theLastBillNo}`);
          this.notification.success(data.RespMsg);

          setTimeout(() => {
            this.printNadavaravuData();
          }, 200);

          this.getNadavaravuData();
        }
      },
      error: (error: any) => {},
    });
  }

  markAllFieldsAsTouched() {
    Object.keys(this.nadavaravForm.controls).forEach((field) => {
      const control = this.nadavaravForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  resetForm() {
    this.nadavaravForm.reset({
      BillNo: '',
      Name: '',
      Star: '',
      Address: '',
      Description: '',
      NMId: '',
      Qty: '1',
      weight: '',
      unit: '',
      ItemValue: '0',
      ReceiptAmount: '0',
      Remarks: '',
      TrnsMode: 'CS',
      UserId: this.userId,
      CounterId: this.CounterId,
    });
    // this.getBillNumber();
    this.duplicateBillFlag = false;
  }

  getStar() {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.service.getStarData(payLoad).subscribe((res: any) => {
      this.nakshatham = res;
      // console.log(this.nakshatham);
    });
  }

  getNadavaravuItem() {
    const payLoad = {
      Type: 'NadavaravuItem',
      Code: '',
    };

    this.service.getItemMaster(payLoad).subscribe({
      next: (data: any) => {
        // console.log(data, 'bbbbbbbbbbbbbbbbbb');
        this.itemMaster = data;
        // console.log( this.itemMaster,"item master -data")
      },
    });
  }
  onItemSelected(event: Event) {
    const target = event.target as HTMLSelectElement;

    if (!target || !target.value) {
      // this.selectedAmount = null;
      // this.nadavaravForm.patchValue({ ReceiptAmount: null });
      return;
    }

    const selectedId = Number(target.value);
    const selectedItem = this.itemMaster.find(
      (item) => Number(item.NM_Id) === selectedId
    );

    if (selectedItem?.Amount !== undefined) {
      // this.selectedAmount = selectedItem.Amount;
      this.nadavaravForm.patchValue({ ReceiptAmount: selectedItem.Amount });
    } else {
      // this.selectedAmount = null;
      this.nadavaravForm.patchValue({ ReceiptAmount: '' });
    }
  }

  // getBillNumber() {
  //   const payLoad = {
  //     Type: 'MaxBillnoNadavaravu',
  //     code: '',
  //   };
  //   this.service.getNadavaravBillNumber(payLoad).subscribe({
  //     next: (data:any) => {
  //       this.lastBillnumber = data[0].billno;
  //       this.nadavaravForm.patchValue({
  //         BillNo: this.theLastBillNo,
  //       });
  //     },
  //   });
  // }

  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }

  getNadavaravuData() {
    const payLoad = { Type: 'NadavaravuBooking', Code: '' };
    this.service.getNadavaravBooking(payLoad).subscribe((data: any) => {
      this.nadavaravData = data;
      this.filteredData = this.nadavaravData;
    });
  }

  onSearch(): void {
    const searchBillNo = this.searchForm
      .get('searchBillNO')
      ?.value?.trim()
      .toLowerCase();
    if (!searchBillNo) {
      this.filteredData = this.nadavaravData;
      return;
    }

    this.filteredData = this.nadavaravData.filter((row) =>
      row.BillNo?.toLowerCase().includes(searchBillNo)
    );

    if (this.filteredData.length === 0) {
      // console.log('No records found for the entered bill number.');
    }
  }

  goBack() {
    this.router.navigate(['dashboard']);
  }

  openCancelRemarkDialog() {
    const remarkDialogRef = this.dialog.open(CancelBillRemarkComponent, {
      width: '400px',
      data: { reason: this.cancellationReason },
    });

    remarkDialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.cancellationReason = result;
        this.OnCancelSubmit();
      } else {
        // console.log('Dialog was closed without submitting the reason.');
      }
    });
  }

  cancellTheBill(billnumber: string) {
    this.cancelBillNumber = billnumber;
    this.openCancelRemarkDialog();
  }

  OnCancelSubmit() {
    this.cancellationReason;

    const payLoad = {
      Type: 'Nadavaravu',
      BillNo: this.cancelBillNumber,
      CancelBy: this.userId,
      Remarks: this.cancellationReason,
    };
    this.service.cancellBill(payLoad).subscribe({
      next: (data: any) => {
        if (data.RespStatus === 'U') {
          if (this.dialog) {
          }
          this.getNadavaravuData();
          this.notification.success('Successfully cancelled the Bill');
        }
      },
      error: (err: any) => {
        console.log(err);
        this.notification.error(err);
      },
    });
  }

  duplicateBill(item: any) {
    this.duplicateBillFlag = true;

    this.dupliacteBillData = item;
    const payLoad = {
      BillNo: item.BillNo,
      Userid: this.userId,
      CounterId: this.CounterId,
      Type: 'Nadavaravu',
    };

    this.service.duplicateCount(payLoad).subscribe((data: any) => {
      this.printDuplicateNadavaravu();
    });
  }

  printDuplicateNadavaravu() {
    if (this.printerLayOut == 'laser') {
      this.printDuplicateNadavaravuData();
    } else if (this.printerLayOut == 'inkJet') {
      this.printDuplicateNadavaravuData();
    } else if (this.printerLayOut == 'thermal') {
      this.printDuplicatethermalNadavaravuData();
    } else if (this.printerLayOut == 'dotMetrix') {
      this.printDuplicateNadavaravuData();
    } else if (this.printerLayOut == 'lasera5') {
      this.printDuplicateNadavaravuData();
    }
  }

  printNadavaravuData() {
    if (this.printerLayOut == 'laser') {
      this.printNadavaravuRecipt();
    } else if (this.printerLayOut == 'inkJet') {
      this.printNadavaravuRecipt();
      this.resetForm();
    } else if (this.printerLayOut == 'thermal') {
      this.printthermalNadavaravuRecipt();
      this.resetForm();
    } else if (this.printerLayOut == 'dotMetrix') {
      this.printNadavaravuRecipt();
    } else if (this.printerLayOut == 'lasera5') {
      this.printNadavaravuRecipt();
      this.resetForm();
    }
  }

  printNadavaravuRecipt() {
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
      this.resetForm();
    } else {
      console.error('Failed to open print window!');
    }
  }

  printthermalNadavaravuRecipt() {
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
            .address{
            margin-top:0;
            margin-bottom:0;
            padding-top:0;
            padding-bottom:0;
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

  printDuplicateNadavaravuData() {
    const printContents = document.getElementById('duplicateRecipt')?.innerHTML;
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
              font-weight:bold;
            }
            #receipt, #duplicateRecipt {
              width: 6in; /* Width in inches */
              height: 4in; /* Height in inches */
              position: relative;
               margin: 0 auto;
            padding: 0;
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

  printDuplicatethermalNadavaravuData() {
    const printContents = document.getElementById(
      'thermalduplicatereceipt'
    )?.innerHTML;
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
              font-family:arial;
              page-break-after: auto;
              // border: 1px dashed #000;
              
            }

            .receipt-header {
              font-size: 12pt;
              font-weight: bold;
              text-align: center;
              margin-bottom: 2px;
              font-family:arial;
            }

            .receipt-sub-header {
              font-size: 6pt;
              text-align: center;
              margin-bottom: 5px;
              font-family:arial;
              // font-weight: bold;
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
              font-size: 10pt;
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
        return 'ONLINE';
      case 'CS':
        return 'CASH';
      case 'MO':
        return 'MONEY ORDER';
      case 'UP':
        return 'UPI';
      case 'CH':
        return 'CHEQUE';
      case 'CR':
        return 'CREDIT';
      case 'DE':
        return 'DEBIT';

      default:
        return 'OTHERS';
    }
  }

  getStarNameById(starId: number): string {
    if (this.lang == 'en') {
      if (starId) {
        const star = this.nakshatham.find((s) => s.id == starId);
        return star ? star.SM_NameEng : '';
      } else {
        return '';
      }
    } else if (this.lang == 'ml') {
      if (starId) {
        const star = this.nakshatham.find((s) => s.id == starId);

        return star ? star.SM_Name : '';
      } else {
        return '';
      }
    } else return '';
  }

  getItemById(itemid: any): string {
    if (this.lang == 'en') {
      if (itemid) {
        const star = this.itemMaster.find((s) => s.NM_Id == itemid);

        return star ? star.NM_Name : '';
      } else {
        return '';
      }
    } else if (this.lang == 'ml') {
      if (itemid) {
        const star = this.itemMaster.find((s) => s.NM_Id == itemid);

        return star ? star.NM_RName : '';
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
}
