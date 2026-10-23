import {
  Component,
  inject,
  Inject,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CancelBillRemarkComponent } from '../cancel-bill-remark/cancel-bill-remark.component';
import { NotificationService } from '../../../services/notification/notification.service';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NumberToWordsPipe } from '../../../shared/pipe/number-to-words.pipe';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { Router } from '@angular/router';
export interface Data {
  vazhipad: string;
  name: string;
  rate: number;
  qty: number;
  amount: number;
  star: string;
  diety: string;
  time: string;
  position: number;
}

interface Entry {
  Name: string;
  Name2: string;
  Star: string;
  Star2: string;
  Rate: number;
  Amount: number;
  VazhipadDate: string;
  Qty: number;
  VTime: number;
  NalBy: string;
  MMonth: string;
  Thithi: string;
  MDay: string;
}

interface GroupedData {
  [prathista: string]: {
    [vazhipad: string]: Entry[];
  };
}

@Component({
  selector: 'app-search-by-bill-number',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatCheckboxModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './search-by-bill-number.component.html',
  styleUrl: './search-by-bill-number.component.css',
  providers: [NumberToWordsPipe],
})
export class SearchByBillNumberComponent {
  displayedColumns: string[] = [
    'Diety',
    'Vazhipad',
    'Name',
    'Star',
    'Date',
    'Qty',
    'Rate',
    'Amount',
    'Actions',
  ];
  dataSource: MatTableDataSource<Data>;
  lastBillNo: any;
  TrnStatus: string;
  starData: { [id: string]: string } = {};
  duplicatebilldata: any;
  billdata: any;
  activevazhipad: string;
  Address3: any;
  role: string | null;
  loginId: string | null;
  displayTrnsmode: string;
  counterId: string | null;
  templeName: string | null;
  nakshatham: any[];
  logo: string | null;
  name: string | null;
  updateTransMode: FormGroup;
  gropedData: GroupedData = {};
  multidayNal: string;
  multidayMonth: string;
  multidayDay: string;
  multidaySearch: string;
  templeLogoUrl: string = '';
  billTotalAmount: number;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  cancellationReason: string = '';
  templeAddress: string | null;
  lang: string | null;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  remarkDialogRef: MatDialogRef<any>;
  differentDateArray: any[];
  printerType: string | null;
  billDate: any;
  InstaNo: string;
  InstaDate: string;
  InstaBank: string;
  MobileNo: string;
  CounterId: String;
  userName: string;
  loginUserName: string | null;
  editTransmodevalue: string;
  changeByValue: string;

  private numbertowordpipe = inject(NumberToWordsPipe);
  constructor(
    public dialogRef: MatDialogRef<SearchByBillNumberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,

    private masterService: MasterService,
    private notification: NotificationService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private ts: TranslateService,
    private receiptService: ReceiptPrintService,
    private router: Router,
  ) {
    // console.log(this.data, 'all data of that bill');
    this.lastBillNo = data[0].BillNo;
    this.billDate = this.convertDateFormat(data[0].BillDate);
    // console.log(this.billDate, 'checking bill date');
    this.TrnStatus = data[0].TrnStatus;
    this.displayTrnsmode = data[0].TrnsMode;
    this.billTotalAmount = data[0].TotalAmt;
    this.billdata = data;
    this.duplicatebilldata = data;
    this.activevazhipad = this.duplicatebilldata[0].Bookingactive;
    if (this.duplicatebilldata && Array.isArray(this.duplicatebilldata)) {
      this.duplicatebilldata.forEach((item: any) => {
        if (item.EvazDate) {
          const date = new Date(item.EvazDate);
          const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000,
          );
          item.EvazDate = localDate.toISOString().split('T')[0];
        }
      });
    }
    this.InstaNo = data[0].InstNo;
    this.InstaDate = data[0].InstDate;
    this.InstaBank = data[0].InstBank;
    this.MobileNo = data[0].MobileNo;
    this.CounterId = data[0].CounterId;
    this.userName = data[0].UName;
    this.changeByValue = data[0].ChangeBy;
    this.Address3 = data[0].Address3;
    console.log(this.duplicatebilldata, 'dupicate bill data first');
    this.dataSource = new MatTableDataSource(this.duplicatebilldata);
    this.role = localStorage.getItem('Role');
    this.loginId = localStorage.getItem('LoginId');
    this.counterId = localStorage.getItem('counterId');
    this.templeName = localStorage.getItem('TempleName');
    this.logo = localStorage.getItem('Logo');
    this.templeAddress = localStorage.getItem('Address');
    this.lang = localStorage.getItem('Language');
    this.printerType = localStorage.getItem('Printer');
    this.name = localStorage.getItem('name');

    if (this.logo) {
      this.templeLogoUrl =
        window.location.origin + `/assets/images/${this.logo}`;
      // console.log(this.templeLogoUrl, 'url img');
    }

    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
  }

  ngOnInit() {
    this.loadStarData();
    this.groupDataByPrathistaAndVazhipad();
    console.log(this.TrnStatus, 'transmode');
    this.updateTransMode = this.fb.group({
      InstaNo: [this.InstaNo],
      InstaDate: [this.convertToDateFormatyyymmdd(this.InstaDate)],
      InstaBank: [this.InstaBank],
      Trnsmode: [this.displayTrnsmode],
      PaidStatus: ['Y'],
      MobileNo: [this.MobileNo],
    });

    this.subscribeToTrnsmodeChanges();
  }

  getNakshthram(id: string): string {
    return this.starData[id] || 'Unknown';
  }

  loadStarData(): void {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterService.getStarData(payLoad).subscribe({
      next: (data: any[]) => {
        console.log(data);
        this.nakshatham = data;
        this.starData = data.reduce(
          (acc: { [id: string]: string }, star: any) => {
            acc[star.id] = star.SM_NameEng;
            return acc;
          },
          {},
        );

        console.log('Star Data Loaded:', this.starData);
      },
      error: (err) => {
        console.error('Error loading star data:', err);
      },
    });
  }
  formatDateToInput(date: Date): string {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getTotalAmount(): number {
    const total = this.dataSource.data.reduce(
      (total, item) => total + (item.amount || 0),
      0,
    );
    console.log('Total Amount:', total);
    return total;
  }

  cancellTheBill() {
    this.openCancelRemarkDialog();
  }

  // cancel reason dialog

  openCancelRemarkDialog() {
    const remarkDialogRef = this.dialog.open(CancelBillRemarkComponent, {
      width: '400px',
      data: { reason: this.cancellationReason },
    });

    remarkDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cancellationReason = result;
        console.log('Updated Cancellation Reason:', this.cancellationReason);
        this.OnCancelSubmit();
      } else {
        console.log('Dialog was closed without submitting the reason.');
      }
    });
  }

  searchBillNumber() {
    const payLoad = { Type: 'SearchBillno', Code: this.lastBillNo };
    this.masterService.SearchByBillNo(payLoad).subscribe({
      next: (data) => {
        // console.log(data, 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
        if (data.length > 0) {
          this.billdata = data;
          this.duplicatebilldata = data;
          this.activevazhipad = this.duplicatebilldata[0].Bookingactive;

          console.log(this.billdata, 'billdatataa');
          this.TrnStatus = data[0].TrnStatus;
          this.dataSource = new MatTableDataSource(this.duplicatebilldata);
        } else {
          // this.notiication.showError('enter valid billnumber');
        }
      },
      error: (error) => {
        // Handle error
        alert('Error fetching data. Please try again later.');
        console.error('Error fetching data:', error);
      },
    });
  }

  OnCancelSubmit() {
    this.cancellationReason;
    console.log(this.cancellationReason, 'cancellarion reason');

    const payLoad = {
      Type: 'Booking',
      BillNo: this.lastBillNo,
      CancelBy: this.loginId,
      Remarks: this.cancellationReason,
    };
    console.log(payLoad, 'payload');
    this.masterService.cancellBill(payLoad).subscribe({
      next: (data: any) => {
        if (data.RespStatus === 'U') {
          console.log(data, 'cancel bill response');
          if (this.remarkDialogRef) {
            this.remarkDialogRef.close(); // This will close only the remark popup
          }
          this.searchBillNumber();
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
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
      case 'EN':
        if (this.lang == 'en') {
          return 'Endowment';
        } else {
          return 'എന്ഡോമെൻറ്';
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
  formatDate(date: string | Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0'); // Add leading zero if day is single digit
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if month is single digit
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // convertToDateFormat(dateString: string): any {
  //   const date = new Date(dateString); // Convert the string to a Date object
  //   return this.datePipe.transform(date, 'yyyy-MM-dd'); // Format to 'yyyy-MM-dd'
  // }

  editRow(row: any) {
    console.log(row);
    const date = new Date(row.EvazDate);

    row.isEditing = true;
    row.editName = row.Name;
    row.editStar = row.Star;

    row.EvazDate = date.toISOString().split('T')[0];
    row.editEvazDate = row.EvazDate;
  }

  saveRow(row: any) {
    // console.log(row, 'testing thr rows');
    row.isEditing = false;
    row.nameEdited = row.editName == row.Name ? true : false;
    row.starEdited = row.editStar == row.Star ? true : false;
    row.EvazDateEdited = row.editEvazDate == row.EvazDate ? true : false;

    if (!row.nameEdited && !row.starEdited && !row.EvazDateEdited) {
      row.nameStarEdited =
        row.editName +
        ',' +
        this.getStarbyId(row.editStar) +
        ',' +
        row.EvazDate +
        ',' +
        '(' +
        this.name +
        ',' +
        this.getTodayDate() +
        ')';
    }
    if (!row.nameEdited && !row.starEdited) {
      row.nameStarEdited =
        row.editName +
        ',' +
        this.getStarbyId(row.editStar) +
        ',' +
        '(' +
        this.name +
        ',' +
        this.getTodayDate() +
        ')';
    }
    if (!row.nameEdited && !row.EvazDateEdited) {
      row.nameStarEdited =
        row.editName +
        ',' +
        row.EvazDate +
        ',' +
        '(' +
        this.name +
        ',' +
        this.getTodayDate() +
        ')';
    }
    if (!row.starEdited && !row.EvazDateEdited) {
      row.nameStarEdited =
        this.getStarbyId(row.editStar) +
        ',' +
        row.EvazDate +
        ',' +
        '(' +
        this.name +
        ',' +
        this.getTodayDate() +
        ')';
    } else if (!row.nameEdited) {
      row.nameStarEdited =
        row.editName + ',' + '(' + this.name + ',' + this.getTodayDate() + ')';
    } else if (!row.starEdited) {
      row.nameStarEdited =
        this.getStarbyId(row.editStar) +
        '(' +
        this.name +
        ',' +
        this.getTodayDate() +
        ')';
    } else if (!row.EvazDateEdited) {
      row.nameStarEdited =
        row.EvazDate + '(' + this.name + ',' + this.getTodayDate() + ')';
    }
    // console.log('Row saved:', row);
    const payLoad = {
      BillId: row.BillId,
      Name: row.Name,
      Star: row.Star,
      Name2: row.Name2,
      Star2: row.Star2,
      ChangeBy: row.nameStarEdited,
      UserId: this.loginId,
      VazhipadDate: this.formatToDDMMYYYY(row.EvazDate),
      PMid: row.PMId,
      Prethista: row.Prathista,
    };
    // console.log(payLoad, 'checking uploaded vzhipd date');
    // Example: Update the backend API with new values
    this.masterService.editBilllingDetils(payLoad).subscribe({
      next: (response: any) => {
        if (response.RespStatus === 'U') {
          this.notification.showSuccess("'Row updated successfully");
        }
        console.log('Row updated successfully:', response);
      },
      error: (error) => {
        this.notification.showError('Error in updatinag row Please try again');

        console.error('Error updatinag row:', error);
      },
    });
  }

  formatToDDMMYYYY(dateStr: string): string {
    const date = new Date(dateStr);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getTodayDate() {
    const today = new Date();
    console.log(today, 'gggggg');
    const formattedDate = today
      .toLocaleDateString('en-GB')
      .split('/')
      .join('-');
    return formattedDate;
  }

  openReceipt() {
    //  send full bill data (recommended)
    this.receiptService.setBookingData(this.duplicatebilldata);

    // OR if you want grouped:
    // this.eventService.setReceiptData(this.gropedData);

    this.dialogRef.close(); // close popup

    this.router.navigate(['/dashboard']);
  }

  // getStarData() {
  //   const payLoad = { Type: 'ListStar', Code: '' };
  //   this.masterService.getStarData(payLoad).subscribe((res) => {
  //     this.nakshatham = res;
  // console.log(this.nakshatham,"sdsfsddss")
  //     this.nakshatham = res.map((item) => ({
  //       SM_Id: item.id,
  //       SM_Name: item.SM_NameEng,
  //       SM_Code: item.SM_Code,
  //       SM_RName: item.SM_Name,
  //     }));
  //     console.log(this.nakshatham,"stttttttttttttt")
  //   });
  // }

  getStarbyId(id: string) {
    console.log(id, 'star id');
    if (this.lang == 'en') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_NameEng : '';
    } else if (this.lang == 'ml') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_Name : '';
    }

    // console.log(star,"sssssssssssssssss")
  }

  // Helper function to add wrapped text
  addWrappedText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
  ) {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: any, index: any) => {
      doc.text(line, x, y + index * 6); // 6 is the line height
    });
    return y + lines.length * 6; // Return the new Y offset after wrapping
  }

  openWhatsAppWeb() {
    const whatsappUrl = 'https://web.whatsapp.com/'; // URL for WhatsApp Web
    window.open(whatsappUrl, '_blank'); // Open in a new tab
  }

  generatePDF() {
    const doc = new jsPDF();
    const columns = [
      'Vazhipad',
      'Prathishta',
      'Name',
      'Star',
      'Qty',
      'Rate',
      'Amount',
    ];
    const rows = this.data.map((item: any) => [
      item.Vazhipad,
      item.Prathista,
      item.Name,
      item.Star,
      item.Qty,
      item.Rate,
      item.Amount,
    ]);

    // Adding title
    doc.text('Vazhipad Details', 14, 10);

    // Adding table
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
    });

    // Save the PDF
    doc.save('Vazhipad-Details.pdf');
  }

  // const generateDateRange = (startDate: string, endDate: string): string[] => {
  //   const dates = [];
  //   let current = new Date(startDate);
  //   const end = new Date(endDate);

  //   while (current <= end) {
  //     dates.push(current.toISOString().split('T')[0]);
  //     current.setDate(current.getDate() + 1);
  //   }

  //   return dates;
  // };

  printReceiptsDotmetrix() {
    this.differentDateArray = [];
    this.duplicatebilldata.forEach((item: any) => {
    this.differentDateArray.push(item);
    });
    if (this.differentDateArray.length > 0) {
      const groupedData = this.differentDateArray.reduce(
        (acc: any, item: any) => {
          const key = `${item.Prathista}/${item.Vazhipad}/${item.Fdate}/${item.Tdate}`;
          if (!acc[key]) {
            acc[key] = {
              items: [],
              totalQty: 0,
              uniqueNames: new Set(),
              nalBy: '',
              mday: '',
              thithi: '',
              mmonth: '',
              SlNo: '',
            };
          }
          acc[key].items.push(item);
          acc[key].totalQty += parseInt(item.Qty, 10);
          acc[key].uniqueNames.add(item.Vazhipad);

          // Check if NalBy, Mday, or Thithi has data and store it
          if (item.NalBy) acc[key].nalBy = item.NalBy;
          if (item.MDay) acc[key].mday = item.MDay;
          if (item.SearchBy) acc[key].thithi = item.SearchBy;
          if (item.MMonth) acc[key].mmonth = item.MMonth;
          if (item.SlNo) acc[key].Slno = item.SlNo;
          return acc;
        },
        {},
      );

      const maxRowsPerPage = 5; // Maximum rows per page
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
          let receiptContent = `
          <div class="print-page">
         <div class="receipt-page" style="page-break-after: 'always'
         };">

            <!-- Prathista -->
            <div style="position: absolute; left: 2.4cm; top:2.5cm; max-width: 8cm;  white-space: pre-wrap; word-wrap: break-word;font-size:9pt;">${
              prathista
            }</div>
            <!-- Vazhipad -->
            <div style="position: absolute; left: 2.4cm; top: 3cm; max-width: 5cm; white-space: pre-wrap;font-size:9pt; white-space: pre-wrap;">${vazhipad}</div>
             <!-- Bill date Date -->
             <div style="position: absolute; left:10.5cm; top: 2.5cm;font-size:9pt;"> ${this.billDate}</div>
           <!-- bill Number -->
            <div style="position: absolute; left:10.5cm; top: 3cm;"> ${this.lastBillNo}</div>
             <!-- Vazhipad Date -->
           <div style="position: absolute; left: 5.5cm; top: 8cm;font-size:9pt;">
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
      ? `<div style="position: absolute; left: 5.5cm; top: 8cm;font-size:6pt">- ${group.thithi},</div>`
      : ''
  }
   <div style="position: absolute; left: 1cm; top: 8.1cm;font-size:8pt">User:${
     this.name
   },(${this.getTransactionType(this.displayTrnsmode)})  ${
     this.displayTrnsmode == 'CR' ? '(Not Paid)' : ''
   }(CNTR:${this.counterId})</div>
          <div style="position: absolute; left: 3.5cm; top: 8.5cm;font-size:7pt; ">
          Duplicate Bill
        </div>
            `;

          // Render rows in the current page
          page.forEach((item: any, rowIndex: number) => {
            let rowTop = 4.8 + rowIndex * 0.5; // Adjust row spacing
            const amount = item.Qty * item.Rate;
            grandTotalAmount += amount; // Add the amount to the grand total
            receiptContent += `
            <div style="position: absolute; left:1cm; font-size:9pt;font-weight:bold; top: ${rowTop}cm; max-width: 8cm; white-space: pre-wrap; word-wrap: break-word; line-height: 1.2em;">${
              item.Name
            }<br/>${
              item.Name2
                ? `<div style="margin-top: 0.1mm;">Name2:${item.Name2}</div>`
                : ''
            }
            </br>
               ${
                 item.Remarks && item.Remarks.toString().trim() !== ''
                   ? `<div style="margin-top:0px;padding-top:0px;margin-bottom:0px;padding-bottom:5px;">Remark:${item.Remarks}</div>`
                   : ''
               }
            </div>
            <div style="position: absolute; left: 6.9cm; font-size:9pt;font-weight:bold; top: ${rowTop}cm; max-width: 8cm; white-space: pre-wrap; word-wrap: break-word; line-height: 1.2em;">${this.getStarbyId(
              item.Star,
            )}<br/>${
              item.Star2
                ? `<div style="margin-top: 0.1mm;">Name2:${this.getStarbyId(item.Star)}</div>`
                : ''
            }

         }
            </div>
            <div style="position: absolute; left: 9.7cm;font-size:9pt; top: ${rowTop}cm;">${
              item.Qty
            }</div>
            <div style="position: absolute;  left: 11cm;font-size:9pt; top: ${rowTop}cm;">${
              item.Rate
            }</div>
            <div style="position: absolute;  left: 12cm;font-size:9pt; top: ${rowTop}cm;">${amount}</div>

           <div style="position: absolute; left: 7.5cm; top: 9.3cm; font-weight: bold; font-size: 10pt;">
        Grand Total: ${item.TotalAmt}
      </div>
            `;
          });
          receiptContent += `
        <div style="position: absolute; left: 10.5cm; top: 8.3cm; font-weight: bold; font-size: 12pt;">
          ${this.displayTrnsmode === 'EN' ? 0 : grandTotalAmount}
        </div>
     ${
       group.SlNo != 0
         ? `<div style="position: absolute; left: 3cm; top: 8cm; font-weight: bolder; font-size: 12pt;">
         Token : ${group.SlNo}
       </div>`
         : ''
     }   </div>
      </div>`;
          allReceiptsContent += receiptContent;
        });
      });

      //   });
      // });

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
        // this.resetForm()
      }
    }
  }

  convertDateFormat(dateString: string): string {
    console.log(dateString, 'dateString');
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    console.log();
    return `${day}-${month}-${year}`;
  }

  private showValidationErrors() {
    Object.keys(this.updateTransMode.controls).forEach((key) => {
      const controlErrors = this.updateTransMode.get(key)?.errors;
      if (controlErrors) {
        if (controlErrors['required']) {
          this.notification.showError(`${key} is required`, 'Billing');
        }
        if (controlErrors['pattern']) {
          if (key === 'MobileNo') {
            this.notification.showError(
              'Invalid phone number. Must be 10 digits atleast.',
            );
          }
        }

        if (controlErrors['minLength']) {
          if (key === 'MobileNo') {
            this.notification.showError(
              'Invalid phone number. Must be 10 digits atleast.',
            );
          }
        }
      }
    });
  }

  private markAllFieldsAsTouched() {
    this.updateTransMode.markAllAsTouched();
  }

  onEditTransmode() {
    if (this.updateTransMode.invalid) {
      this.showValidationErrors();
      this.markAllFieldsAsTouched();
      return;
    }
    const editedTransmodeValue = this.updateTransMode.get('Trnsmode')?.value;
    if (this.displayTrnsmode != editedTransmodeValue) {
      if (this.changeByValue) {
        this.changeByValue =
          this.changeByValue +
          ',' +
          this.displayTrnsmode +
          '(' +
          this.name +
          ',' +
          this.getTodayDate() +
          ')';
      } else {
        this.changeByValue =
          this.displayTrnsmode +
          '(' +
          this.name +
          ',' +
          this.getTodayDate() +
          ')';
      }
    }

    const formValue = this.updateTransMode.value;

    const payLoad = {
      Type: 'Booking',
      BillNo: this.lastBillNo,
      InstaNo: formValue.InstaNo,
      InstaDate: formValue.InstaDate,
      InstaBank: formValue.InstaBank,
      TransMode: formValue.Trnsmode,
      PaidStatus: formValue.Trnsmode == 'CR' ? 'N' : 'Y',
      MobileNo: formValue.MobileNo,
      ChangeBy: this.changeByValue,
    };
    console.log(payLoad, 'payLoad');
    this.masterService.updateBookingTransmode(payLoad).subscribe((data) => {
      // console.log(data, 'subscription data');
      this.notification.showSuccess(' Payment mode Updated successfully');
      this.searchBillNumber();
    });
  }

  private subscribeToTrnsmodeChanges() {
    this.updateTransMode.get('Trnsmode')?.valueChanges.subscribe((value) => {
      if (value == 'CH') {
        this.setChequeValidators();
        this.clearCreditValidators();
      } else if (value == 'CR') {
        this.updateTransMode.patchValue({ PaidStatus: 'N' });
        this.clearChequeValidators();
        this.setCreditValidators();
      } else {
        this.clearChequeValidators();
        this.clearCreditValidators();
        this.clearUpiValidators();
      }
    });
  }

  private setChequeValidators() {
    this.updateTransMode
      .get('InstaNo')
      ?.setValidators([Validators.required, Validators.minLength(6)]);
    this.updateTransMode.get('InstaBank')?.setValidators([Validators.required]);
    this.updateTransMode.get('InstaDate')?.setValidators([Validators.required]);
    this.updateTransMode.get('InstaNo')?.updateValueAndValidity();
    this.updateTransMode.get('InstaBank')?.updateValueAndValidity();
    this.updateTransMode.get('InstaDate')?.updateValueAndValidity();
  }

  private clearChequeValidators() {
    this.updateTransMode.get('InstaNo')?.clearValidators();
    this.updateTransMode.get('InstaBank')?.clearValidators();
    this.updateTransMode.get('InstaDate')?.clearValidators();
    this.updateTransMode.get('InstaNo')?.updateValueAndValidity();
    this.updateTransMode.get('InstaBank')?.updateValueAndValidity();
    this.updateTransMode.get('InstaDate')?.updateValueAndValidity();
  }

  private setCreditValidators() {
    this.updateTransMode
      .get('MobileNo')
      ?.setValidators([
        Validators.required,
        Validators.minLength(10),
        Validators.pattern('^[0-9]{10}$'),
      ]);
    this.updateTransMode.get('MobileNo')?.updateValueAndValidity();
  }

  private clearCreditValidators() {
    this.updateTransMode.get('MobileNo')?.clearValidators();
    this.updateTransMode.get('MobileNo')?.updateValueAndValidity();
  }

  private clearUpiValidators() {
    this.updateTransMode.get('InstaNo')?.clearValidators();
    this.updateTransMode.get('InstaNo')?.updateValueAndValidity();
  }

  convertToDateFormatyyymmdd(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  printPage(): void {
    const printContent = document.getElementById('print-section');

    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) return;

    const logoUrl = window.location.origin + '/assets/images/temple_logo.png';

    printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>

        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 10mm 20mm 10mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .group-container {
            page-break-before: always;
            padding: 10mm;
          }
          .print-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  border-bottom: 2px solid maroon;
  padding-bottom: 10px;
}
.header-left {
  flex: 0 0 auto;
}
.header-left img {
  height: 80px;
  width: auto;
}
.header-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.temple-name {
  font-size: 20pt;
  font-weight: bold;
  color: red;
  text-align: left;
  margin: 0;
}
.temple-address {
  font-size: 12pt;
  font-weight: bold;
  text-align: left;
  margin: 2px 0 0 0;
}
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            padding: 6px;
            font-size: 10pt;
          }
          img {
            display: block;
            max-width: 100%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>

      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();

    // ✅ WAIT FOR IMAGES TO LOAD BEFORE PRINT
    printWindow.onload = () => {
      const images = printWindow.document.images;

      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve(true);
        return new Promise((res) => {
          img.onload = img.onerror = () => res(true);
        });
      });

      Promise.all(imagePromises).then(() => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 300);
      });
    };
  }

  groupDataByPrathistaAndVazhipad(): void {
    this.gropedData = this.data.reduce((acc: GroupedData, item: any) => {
      const prathistaKey = item.Prathista;
      const vazhipadKey = item.Vazhipad;

      if (!acc[prathistaKey]) {
        acc[prathistaKey] = {};
      }

      if (!acc[prathistaKey][vazhipadKey]) {
        acc[prathistaKey][vazhipadKey] = [];
      }

      acc[prathistaKey][vazhipadKey].push({
        Name: item.Name,
        Name2: item.Name2,
        Star: item.Star,
        Star2: item.Star2,
        Rate: item.Rate,
        Amount: item.Amount,
        VazhipadDate: item.EvazDate,
        Qty: item.Qty,
        VTime: item.VTime,
        NalBy: item.NalBy,
        MMonth: item.MMonth,
        Thithi: item.SearchBy,
        MDay: item.MDay,
      });

      return acc;
    }, {} as GroupedData);

    console.log(this.gropedData, 'PDF making');
  }

  isPast(dateString: string | Date): boolean {
    const evazDate = new Date(dateString);
    const today = new Date();
    evazDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    console.log(dateString, today, 'dateString');
    return evazDate > today;
  }

  calculateTotalAmount(entries: any[]): number {
    return entries.reduce((total, entry) => total + entry.Amount, 0);
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
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
          return 'എൻഡോവ്മെന്റ്';
        }
      default:
        return 'OTHERS';
    }
  }

  deactivateVazhipad() {
    const payLoad = {
      Type: 'UpdateActive',
      BillNo: this.lastBillNo,
      InstaNo: '',
      InstaDate: '',
      InstaBank: '',
      TransMode: '',
      PaidStatus: this.activevazhipad == 'Y' ? 'N' : 'Y',
      MobileNo: '',
      ChangeBy: '',
    };
    this.masterService.updateBookingTransmode(payLoad).subscribe((data) => {
      // console.log(data, 'deactivate response');
      this.notification.showSuccess('Vazhipad Deactivated successfully');
      this.searchBillNumber();
    });
  }

  printReceiptslaserA4_4() {
    this.differentDateArray = [];
    console.log('Duplicate Bill Data print:', this.duplicatebilldata);
    this.duplicatebilldata.forEach((item: any) => {
      this.differentDateArray.push(item);
    });
    if (this.differentDateArray.length > 0) {
      const groupedData = this.differentDateArray.reduce(
        (acc: any, item: any) => {
          const key = `${item.Prathista}@${item.Vazhipad}@${item.Fdate}@${item.Tdate}`;
          console.log(key, 'group key');
          if (!acc[key]) {
            acc[key] = {
              items: [],
              totalQty: 0,
              uniqueNames: new Set(),
              nalBy: '',
              mday: '',
              thithi: '',
              mmonth: '',
              Address3: '',
              Remarks: '',
              SINo: '',
              TotalAmt: '',
              VTime: '',
            };
          }
          acc[key].items.push(item);
          acc[key].totalQty += parseInt(item.Qty, 10);
          acc[key].uniqueNames.add(item.Name);
          if (item.NalBy) acc[key].nalBy = item.NalBy;
          if (item.MDay) acc[key].mday = item.MDay;
          if (item.SearchBy) acc[key].thithi = item.SearchBy;
          if (item.MMonth) acc[key].mmonth = item.MMonth;
          if (item.Address3) acc[key].Address3 = item.Address3;
          if (item.Remarks) acc[key].Remarks = item.Remarks;
          if (item.SINo) acc[key].SINo = item.SINo;
          if (item.TotalAmt) acc[key].TotalAmt = item.TotalAmt;
          return acc;
        },
        {},
      );
      const maxRowsPerPage = 5;
      let allReceiptsContent = '';
      Object.keys(groupedData).forEach((key) => {
        const group = groupedData[key];
        const [prathista, vazhipad, fromDate, toDate] = key.split('@');
        console.log(group, fromDate, 'grouped items');
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
              <img src="/assets/images/qr.png">
              </div>
              <div class="clear">
                <h4 class="receipt">RECEIPT</h4>
              </div>

      </div>
<div class="content-area">
              <center>
                <table>
                  <tr>
                    <td class="left">Bill No:${this.lastBillNo}</td>
                    <td class="right">Bill Date:  ${this.billDate}</td>
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
          page.forEach((item: any, rowIndex: number) => {
            let rowTop = 5.6 + rowIndex * 0.5;
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
  <td colspan="3"> ${group.Address3 ? `<div><b>Gothram:${group.Address3}</div>` : ''}</td>
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

  . clear {
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
      }
    }
  }

  onProceed() {
    if (this.TrnStatus === 'S') {
      console.log(this.duplicatebilldata);

      const payLoad = {
        BillNo: this.lastBillNo,
        UserId: this.loginId,
        CounterId: this.counterId,
        Type: 'Booking',
      };

      console.log(payLoad);
      this.masterService.duplicateCount(payLoad).subscribe((data) => {
        console.log(data, 'dupi');
        this.printDuplicateBill();
      });
    } else {
      this.notification.showError(
        'This bill is cancell so you could not get duplicate bill',
      );
    }
  }

  printDuplicateBill() {
    if (this.printerType == 'dotMetrix') {
      this.printReceiptsDotmetrix();
    } else if (this.printerType == 'thermal') {
      this.printReceiptsThermal();
    } else if (this.printerType == 'laser') {
      this.printReceiptslaserA4_4();
    }
  }

  // print data
  printReceipts(data: any[]) {
    const groupedByPrathistaVazhipad = data.reduce((acc: any, item: any) => {
      const key = `${item.Prathista}-${item.Vazhipad}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    let allReceiptsContent = '';
    const prathistaVazhipadKeys = Object.keys(groupedByPrathistaVazhipad);

    for (let i = 0; i < prathistaVazhipadKeys.length; i++) {
      const key = prathistaVazhipadKeys[i];
      const items = groupedByPrathistaVazhipad[key];
      const [prathista, vazhipad] = key.split('-');

      const totalAmount = items.reduce(
        (total: number, item: any) => total + parseFloat(item.Amount || '0'),
        0,
      );
      const vazhipadRows = items
        .map(
          (item: any) => `
          <tr>
              <td>${item.Name || 'N/A'}<p>${item.Name2 || ' '}</p></td>
                       <td>${this.getStarbyId(
                         item.Star,
                       )}<br/><span>${this.getStarbyId(item.Star2)}</span></td>

              <td>${this.formatDate(item.EvazDate) || 'N/A'}</td>
              <td>${item.Qty || '0'}</td>
              <td style="text-align: right;">${item.Rate.toFixed(2) || '0'}</td>
              <td style="text-align: right;">${
                item.Amount.toFixed(2) || '0'
              }</td>
          </tr>
      `,
        )
        .join('');

      const receiptContent = `
          <div class="receipt-page">
              <h1>${this.templeName}</h1>
            <p>${this.templeAddress}</p>
            <h2 class="receipt-heading">വഴിപാട് രസീത്</h2>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: red;">പ്രതിഷ്ഠ: ${prathista}</strong>
            <strong>തീയതി: ${
              this.formatDate(items[0].BillDate) || 'N/A'
            }</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: green;">വഴിപാട്: ${vazhipad}</strong>
            <strong>നമ്പർ: ${items[0].BillNo || 'N/A'}</strong>
          </div>
              <table>
                  <thead>
                      <tr>
                          <th>Name</th>
                          <th>Star</th>
                          <th>Date</th>
                          <th>Qty</th>
                          <th>Rate</th>
                          <th>Amount</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${vazhipadRows}
                      <tr>
                          <td colspan="5" class="total-label"><strong>Total Amount:</strong></td>
                          <td class="total-amount" style="text-align: right;"><strong>${totalAmount.toFixed(
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
                <strong>Duplicate</strong>
            </div>
            <!-- Right side content (Login ID and Transaction Mode stacked vertically) -->
            <div style="display: flex; flex-direction: column;">
                <strong style="margin-right: 15px;">Login ID: ${
                  this.loginId
                }</strong>
                <strong>Transaction Mode: ${this.displayTrnsmode}</strong>
            </div>
        </div>

          </div>
          ${
            i < prathistaVazhipadKeys.length - 1
              ? '<div class="page-break"></div>'
              : ''
          }
      `;

      allReceiptsContent += receiptContent;
    }

    const printContent = `
      <html>
          <head>
              <title>Receipt</title>
              <style>
                  body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
                  .receipt-page { padding: 10px; page-break-inside: avoid; }
                  .page-break { page-break-after: always; }
                  h1 { text-align: center; color: #4CAF50; margin: 5px 0; }
                  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                  th, td { border: 1px solid #ddd; padding: 5px; text-align: left; }
                  th { background-color: #3f51b5; color: white; }
                  .total-label { text-align: right; }
                  .total-amount { background-color: #e0f7fa; }
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
        printWindow.close();
      };
    } else {
      console.error('Failed to open the print window.');
    }
  }

  printReceiptsThermal() {
    const imageUrl = window.location.origin + '/assets/images/temple-logo.jpeg';

    this.differentDateArray = [];

    this.duplicatebilldata.forEach((item: any) => {
      this.differentDateArray.push(item);
    });

    console.log('Different Date Array:', this.differentDateArray);

    if (this.differentDateArray.length > 0) {
      // Group data by Prathista, Vazhipad, and From Date
      const groupedData = this.differentDateArray.reduce(
        (acc: any, item: any) => {
          const key = `${item.Prathista}/${item.Vazhipad}/${item.Fdate}/${item.Tdate}`;
          if (!acc[key]) {
            acc[key] = {
              items: [],
              totalQty: 0,
              uniqueNames: new Set(),
              nalBy: '',
              mday: '',
              thithi: '',
              mmonth: '',
              VTime: '',
              Address3: '',
              TotalAmt: 0,
              Rate: '',
            };
          }
          acc[key].items.push(item);
          acc[key].totalQty += parseInt(item.Qty, 10);
          acc[key].uniqueNames.add(item.Name);

          // Check if NalBy, Mday, or Thithi has data and store it
          if (item.NalBy) acc[key].nalBy = item.NalBy;
          if (item.MDay) acc[key].mday = item.MDay;
          if (item.SearchBy) acc[key].thithi = item.SearchBy;
          if (item.MMonth) acc[key].mmonth = item.MMonth;
          if (item.VTime) acc[key].VTime = item.VTime;
          if (item.address3) acc[key].Address3 = item.Address3;
          if (item.TotalAmt) acc[key].TotalAmt = item.TotalAmt;
          if (item.Rate) acc[key].Rate = item.Rate;
          return acc;
        },
        {},
      );

      const maxRowsPerPage = 4; // Maximum rows per page
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
        // <div style="text-align: center;"><img src="${imageUrl}" alt="logo" style="width:50%;align-item:center;margin-top:0"/></div>

        // Render each page
        pages.forEach((page, pageIndex) => {
          let receiptContent = `
          <div class="receipt-page">

            <div class="receipt-header" ">${this.templeName}</div>


            <div style="border-top:1px solid black;border-bottom:1px solid black;">
                <table style="width:100%;">
                  <tr>
                    <td style="text-align:left;font-weight:700;">Date: ${
                      this.billDate
                    }</td>
                    <td style="text-align:right;font-weight:700;">No. ${
                      this.lastBillNo
                    }</td>
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
                    <td style="text-align:center;font-weight:800;width:70%;border:1px solid black;border-radius:5px 0px 0px 5px;padding:5px;">${vazhipad}</td>
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
              this.Address3
                ? `<div class="receipt-content">Gothram: ${this.Address3}</div>`
                : ''
            }
            ${
              this.MobileNo
                ? `<div class="receipt-content">MobileNo: ${this.MobileNo}</div>`
                : ''
            }
            <table style="width:100%;">
                <tr>
                    <th style="border:1px solid black;">Amount</th>
                    <th style="border:1px solid black;">Qty</th>
                    <th style="border:1px solid black;">Total</th>
                </tr>
                <tr>
                    <th style="border:1px solid black;">${group.Rate}</th>
                    <th style="border:1px solid black;">${group.totalQty}</th>
                    <th style="border:1px solid black;">${grandTotalAmount.toFixed(
                      2,
                    )}</th>
                </tr>
            </table>
            <p style="text-align:right;margin-bottom:10px;margin-top:0px;"><i>(Rupees ${this.numbertowordpipe.transform(
              grandTotalAmount,
            )} only)</i></p>
            <p style="padding:10px;font-size:12pt;font-weight:700;border:1px solid black;text-align:center;">Grand Total: <span style="font-size:18pt;font-weight:700;">${group.TotalAmt.toFixed(
              2,
            )}</span></p>

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
            <div style="display:flex; align-items:center;justify-contents:space-between;width:100%;">
              <div style="width:25%;">
                  <p style="font-size:14px;text-align:left"font-weight:bold">User: ${
                    this.name
                  } </p>
              </div>
              <div style="width:25%;">
                  <p style="font-size:14px;text-align:center;font-weight:bold"">Counter:${
                    this.counterId
                  }</p>
              </div>
              <div style="width:50%;">
                  <p style="font-size:14px;text-align:right;font-weight:bold"">Payment Mode: ${this.getTransactionType(
                    this.displayTrnsmode,
                  )} ${this.displayTrnsmode == 'CR' ? 'Not Paid' : ''}</p>
              </div>
            </div>
                      <p style="text-align:center;width:100%;border-top:1px solid black;padding-top:5px;margin-top:0px;margin-bottom:20px;">Duplicate Bill</p>
                     <div style="margin-top:14px;font-size:14px" >${this.formatBillDateTime()}</div>

                      </div> <!-- Close receipt-page -->

        `;
          allReceiptsContent += receiptContent;
        });
      });

      //   });
      // });

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
              page-break-after: auto;
              font-family:arial;
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
              font-size: 8pt;
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
              font-family:arial;
              // padding-top: 5px;
              text-align: left;
            }
              .receipt-footer-ut{
              font-size: 9pt;
              margin-top: 2px;
              font-style: italic;
              text-align: left;
              font-family:arial;
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
            // this.resetForm();
          }, 500); // small delay to ensure image is loaded
        };
        // this.resetForm()
      }
    }
  }
getLogo(){
return `${window.location.origin}/apis/TempleLogo/${this.logo}`;
}


}
