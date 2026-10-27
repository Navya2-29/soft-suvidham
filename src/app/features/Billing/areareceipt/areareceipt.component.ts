import { ReportService } from './../../Report/service/report.service';
import { TranslateService } from '@ngx-translate/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, formatDate } from '@angular/common';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';

import { MasterService } from '../../../services/master/master.service';
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import {
  Observable,
  Subscription,
  catchError,
  forkJoin,
  map,
  of,
  startWith,
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MultidayitemsComponent } from '../multidayitems/multidayitems.component';
import { MultidaybookeddetailsComponent } from '../multidaybookeddetails/multidaybookeddetails.component';
import { NumberDirective } from '../../../shared/directives/number/number.directive';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { ConfirmationDialogComponent } from '../../../shared/component/confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BillingViaMobilenumberComponent } from '../billing-via-mobilenumber/billing-via-mobilenumber.component';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'app-areareceipt',
  standalone: true,
  imports: [
    MatTableModule,
    MatCheckboxModule,
    CommonModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatRadioModule,
    UpperCaseDirective,
    TranslateModule,
    NumberDirective,
  ],
  templateUrl: './areareceipt.component.html',
  styleUrl: './areareceipt.component.css',
  providers: [DatePipe],
})
export class AreareceiptComponent implements OnInit {
  form: FormGroup;
  row: FormArray;
  filteredOptions: any[] = [];
  starFilteredOption: any[] = [];
  prathistaFilteredOption: any[] = [];
  devoteeNameFilteredOption: any[][] = [];
  devoteeList: any[] = [];
  nakshatham: any[] = [];
  VMList: any[] = [];
  totalAmount: number = 0;
  autoCompleteFields: MatAutocomplete[] = [];
  clickReceived = false;
  today: Date;
  currentDate = new Date();
  prathishtaOptions: any[] = [];
  tomorrowDate: Date;
  dateToSet: string | null;
  singleMultiSelection: string[] = []; // To hold the radio button values
  multidayBooking: any[] = [];
  isDataSaved: boolean = false;
  indexForAutoComplete: number;
  printData: any;
  translatedVazhipad: string;
  seasonalDates: { fromDate: any; toDate: any } | null = null;
  allowedDays: number[] = [];
  filteredVazhipadTimeOptions: any[][] = [];
  readonlyDate: boolean = false;
  nearestAllowedDate: any;
  filteredStarOptions: Observable<string[]>;
  billNumberFormatDate: string;
  lockTableLastbillNumber: number;
  generatedCurrentBillnumber: string;
  selectedVazhipadItem: any;
  CounterId: string | null;
  cancelFlag: boolean = false;
  nameStarArray: any[];
  singleorMultiDay: boolean;
  input1 = '';
  input2 = '';
  input3 = '';
  timeSlots: string[] = [];
  @ViewChildren('nameInput') nameInputs!: QueryList<ElementRef>;
  @ViewChild('firstInput') firstInputElement!: ElementRef;
  @ViewChildren('inputRef') inputRefs: QueryList<ElementRef>;
  lang: string | null;
  role: string | null;
  selectedStarData: any;
  lastEnterTime = 0; // Variable to track the time of the last Enter press
  doubleEnterThreshold = 500; // Time threshold in milliseconds to consider as double press
  @ViewChild('vTimeSelect', { static: false }) vTimeSelect!: ElementRef;
  private mobileSubscription: Subscription = new Subscription();

  devoteeSearchMobileNumber: string | null;
  private subscription: Subscription;
  private masterservice = inject(MasterService);
  private eventService = inject(TotalAmountService);
  // Compact SweetAlert2 messages; existing notification call sites are unchanged.
  private notification = {
    success: (message: unknown, title?: string) => {
      const messageText = String(message ?? '');
      const validationMessage = /^(please|invalid|enter |rate cannot|rate cant|should |.* is required\.)/i.test(messageText);
      this.showSmallAlert(validationMessage ? 'warning' : 'success', messageText, title);
    },
    error: (message: unknown, title?: string) => {
      this.showSmallAlert('error', String(message ?? ''), title);
    },
  };

  private showSmallAlert(icon: SweetAlertIcon, message: string, title?: string): void {
    void Swal.fire({
      icon,
      title: title || (icon === 'error' ? 'Error' : icon === 'warning' ? 'Attention' : 'Success'),
      text: message,
      width: 350,
      padding: '1rem',
      confirmButtonText: 'OK',
      confirmButtonColor: '#135796',
      buttonsStyling: true,
      heightAuto: false,
      scrollbarPadding: false,
      backdrop: 'rgba(14, 30, 53, 0.35)',
      showClass: { popup: 'swal2-show' },
      hideClass: { popup: 'swal2-hide' },
    });
  }
  private receiptPrintService = inject(ReceiptPrintService);
  private reportService = inject(ReportService);

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private router: Router,
    private ts: TranslateService,
  ) {
    this.CounterId = localStorage.getItem('counterId');
    this.role = localStorage.getItem('Role');
    this.billNumberFormatDate = this.getCurrentDateMMYY();
    this.lang = localStorage.getItem('Language') || 'en';
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.form = this.fb.group({
      vazhipadinfo: this.fb.array([]),
    });
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.getAllvazhipad();
    this.getNakshthram();
    this.getDevoteeMaster();
    // this.addRow(0);
    this.dateToSet = this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd');
    this.subscription = this.eventService.clickEvent$.subscribe(() => {
      this.clickReceived = true;
      // Handle the event here
      this.eventService.setSecondComponentData(this.form.value);
      const combinedData = this.eventService.getAllData();
      // this.sendDataToApi(combinedData);
      this.sendDataToApi(combinedData);
    });

    // this.receiptPrintService.mobileNumber$.subscribe((data: any) => {
    //   this.devoteeSearchMobileNumber = data?.mobile;
    //   if (this.devoteeSearchMobileNumber) {
    //     this.openBillingDialog(data);
    //   }
    //   // else{
    //   //   this.notification.error("Please enter valid Mobile number and try again")
    //   // }
    // });

    this.mobileSubscription = this.receiptPrintService.mobileNumber$.subscribe(
      (data: any) => {
        this.devoteeSearchMobileNumber = data?.mobile;
        if (this.devoteeSearchMobileNumber) {
          // console.log(data, 'check data movbile number values 456');
          this.openBillingDialog(data);

          this.receiptPrintService.clearMobileNumber();
        }
        // else{
        //   this.notification.error("Please enter valid Mobile number and try again")
        // }
      },
    );

    this.loadRebillData()
  }

  ngOnDestroy() {
    // Prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onBack() {
    this.router.navigate(['/front']);
  }

  createRow(): FormGroup {
    const row = this.fb.group({
      Slno: [''],
      Vazhipad: ['', [Validators.required, this.vazhipadValidator.bind(this)]],
      Vazhid: [''],
      Name: ['', [Validators.required]],
      Star: ['28', [Validators.required]],
      Prethista: ['', [Validators.required]],
      Qty: [1, [Validators.required]],
      Rate: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          this.zeroRateValidator,
        ],
      ],
      Amount: [''],
      VazhipadDate: ['', [Validators.required, this.minDateValidator()]],
      TotalAmt: [this.totalAmount],
      VTime: ['0', [Validators.required]],
      Name2: [''],
      Star2: [''],
      Postal: ['0'],
      PMid: ['1'],
      Mday: [''],
      NalBy: [''],
      Mmonth: [''],
      starName: ['OM'],
      FromDate: [''],
      ToDate: [''],
      SearchBy: [''],
      toDate: [{ disabled: true, value: '' }],
      multiname: [{ disabled: true, value: '' }],
      booking: [{ disabled: true, value: '' }],
      ratechange: [{ disabled: true, value: '' }],
      allowedDays: this.fb.array([]),
      VM_Receipt: [{ disabled: true, value: '' }],
      Mattinagal: [{ disabled: true, value: '' }],
      VM_TimeSlot: [{ disabled: true, value: '' }],
      VM_Token: [{ disabled: true, value: '' }],
      dateToSet: [''],
      noOfLimit: [''],
      maxLimit: [0],
      alreadyBooked: [0],
      errorMessage: [''],
      Remarks: [''],
      seasonalDates: this.fb.group({
        fromDate: [''],
        toDate: [''],
      }),
      blockingDates: this.fb.group({
        dates: this.fb.array([]),
      }),
    });
    row.get('Qty')?.valueChanges.subscribe(() => this.updateAmount(row));
    row.get('Rate')?.valueChanges.subscribe(() => this.updateAmount(row));
    row.get('VazhipadDate')?.valueChanges.subscribe(() => {
      this.checkVazhipadDate(row);
      // this.validateAllVazhipadQty();
    });
    return row;
  }

  get vazhipadinfo(): FormArray {
    return this.form.get('vazhipadinfo') as FormArray;
  }

  checkVazhipadDate(row: FormGroup) {
    // Retrieve values from the form
    const vazhipadDateStr = row.get('VazhipadDate')?.value;
    const fromDateStr = row.get('seasonalDates.fromDate')?.value;
    const toDateStr = row.get('seasonalDates.toDate')?.value;
    const blockingDatesArray = row.get('blockingDates.dates')?.value || [];
    const allowedDaysArray: string[] = row.get('allowedDays')?.value || [];
    if (fromDateStr && toDateStr) {
      // Convert string dates to Date objects
      const vazhipadDate = vazhipadDateStr ? new Date(vazhipadDateStr) : null;
      const fromDate = fromDateStr ? new Date(fromDateStr) : null;
      const toDate = toDateStr ? new Date(toDateStr) : null;

      // Validate date ranges
      if (vazhipadDate && fromDate && toDate) {
        if (vazhipadDate < fromDate || vazhipadDate > toDate) {
          row.get('VazhipadDate')?.setErrors({ invalidDateRange: true });
          this.notification.error(
            `Vazhipad date must be within ${fromDate.toISOString().split('T')[0]
            } - ${toDate.toISOString().split('T')[0]}`,
          );
        } else {
          row.get('VazhipadDate')?.setErrors(null);
        }
      } else {
        row.get('VazhipadDate')?.setErrors({ invalidDateRange: true });
      }
    } else if (vazhipadDateStr && blockingDatesArray.length > 0) {
      const vazhipadDate = vazhipadDateStr ? new Date(vazhipadDateStr) : null;
      const formattedVazhipadDate = this.datePipe.transform(
        vazhipadDateStr,
        'yyyy-MM-dd',
      );

      if (blockingDatesArray.includes(formattedVazhipadDate)) {
        row.get('VazhipadDate')?.setErrors({ invalidBlockedDate: true });
        this.notification.error(
          `The selected Vazhipad date (${formattedVazhipadDate}) is blocked.`,
        );
      } else {
        row.get('VazhipadDate')?.setErrors(null);
      }
    } else if (vazhipadDateStr && allowedDaysArray.length > 0) {
      const vazhipadDate = new Date(vazhipadDateStr);

      // Get the day name of the selected date
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const selectedDayName = dayNames[vazhipadDate.getDay()];

      // Check if selected day is in allowedDaysArray
      if (allowedDaysArray.includes(selectedDayName)) {
        row.get('VazhipadDate')?.setErrors(null);
      } else {
        row.get('VazhipadDate')?.setErrors({ invalidDay: true });
        this.notification.error(
          `The selected Vazhipad date (${vazhipadDateStr}) falls on ${selectedDayName}, which is not allowed.`,
        );
      }
    }
  }

  zeroRateValidator(control: AbstractControl): ValidationErrors | null {
    const rate = control.value;
    if (rate === 0) {
      return { zeroRate: true };
    }
    return null;
  }

  selectText(event: FocusEvent): void {
    const inputField = event.target as HTMLInputElement;
    if (inputField.value.trim().length > 0) {
      setTimeout(() => {
        inputField.select();
      }, 0);
    }
  }

  addRow(index: number): void {
    if (index === -1 && this.vazhipadinfo.length === 0) {
      this.vazhipadinfo.push(this.createRow());
      this.setupAutocomplete(0);
      this.setupStarAutocomplete(0);
      this.setupDevoteeNameAutocomplete(0);
      this.updateTotalAmount();
      return;
    }
    this.indexForAutoComplete = index;
    if (
      this.vazhipadinfo.length > 0 &&
      !this.vazhipadinfo.at(this.vazhipadinfo.length - 1).valid
    ) {
      for (let i = 0; i < this.vazhipadinfo.length; i++) {
        const row = this.vazhipadinfo.at(i) as FormGroup;
        // const row = this.vazhipadinfo.at(index) as FormGroup;

        if (row.invalid) {
          if (row.get('Vazhipad')?.errors?.['required']) {
            this.notification.success('Please select a vazhipad');
          } else if (row.get('Vazhipad')?.errors?.['invalidVazhipad']) {
            this.notification.success('Please select a Valid vazhipad');
          } else if (row.get('Name')?.errors?.['required']) {
            this.notification.success('Please enter the Name');
          } else if (row.get('Star')?.errors?.['required']) {
            this.notification.success('Please select a Star');
          } else if (row.get('Prethista')?.errors?.['required']) {
            this.notification.success('Please select a Prethista');
          } else if (row.get('Qty')?.errors?.['required']) {
            this.notification.success('Please select a Qty');
          } else if (row.get('Rate')?.errors?.['required']) {
            this.notification.success('Please select a Rate');
          } else if (row.get('Rate')?.errors?.['pattern']) {
            this.notification.success('Enter a valid rate');
          } else if (row.get('Rate')?.errors?.['zeroRate']) {
            this.notification.success('Rate cannot be zero');
          } else if (row.get('VazhipadDate')?.errors?.['required']) {
            this.notification.success('Please select a VazhipadDate');
          } else if (row.get('VazhipadDate')?.errors?.['minDate']) {
            this.notification.success('Vazhipad date cannot be in the past');
          }

          return; // Stop adding new row if current row is invalid
        }
      }
    }

    const currentRow = this.vazhipadinfo.at(index) as FormGroup;
    const currentName = currentRow.get('Name')?.value;
    const currentStar = currentRow.get('Star')?.value;
    const newRow = this.createRow();
    // newRow.patchValue({
    //   Name: currentName,
    //   Star: currentStar,
    //   starName: this.getStarbyId(currentStar),
    // });

    this.vazhipadinfo.insert(index + 1, newRow);
    this.setupAutocomplete(index + 1);
    this.setupStarAutocomplete(index + 1);
    this.setupDevoteeNameAutocomplete(index + 1);
    this.updateTotalAmount();
    setTimeout(() => {
      this.focusOnNewRow(); // Focus on the newly created row's text box
    }, 0);
  }

  focusOnNewRow(): void {
    const lastInput = this.nameInputs.last;
    if (lastInput) {
      lastInput.nativeElement.select(); // Focus and select the text in the input field
    }
  }

  removeRow(index: number) {
    if (this.vazhipadinfo.length > 1) {
      this.vazhipadinfo.removeAt(index);
      if (this.devoteeNameFilteredOption.length > index) {
        this.devoteeNameFilteredOption.splice(index, 1);
      }
      this.updateTotalAmount();
      // this.updateSlno();
      this.notification.success('Data deleted successfully');
      this.setupAutocomplete(this.indexForAutoComplete);
      this.setupStarAutocomplete(this.indexForAutoComplete);
      this.setupDevoteeNameAutocomplete(this.indexForAutoComplete);
      this.removeMultidayData(index);
    } else {
      this.resetForm();
      this.removeMultidayData(index);
    }
  }

  removeMultidayData(index: number): void {
    if (index >= 0 && index < this.multidayBooking.length) {
      this.multidayBooking.splice(index, 1);
      // this.notification.success("Multiday booking data deleted successfully");
    }
  }

  // formatting date in dd-mm-yyyy
  dateFormat(date: Date): any {
    return this.datePipe.transform(date, 'dd-MM-yyyy') || '';
  }

  minDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const enteredDate = new Date(control.value);
      const today = new Date();

      // Reset time for accurate date-only comparison
      today.setHours(0, 0, 0, 0);
      enteredDate.setHours(0, 0, 0, 0);

      return enteredDate >= today ? null : { minDate: true };
    };
  }

  setupAutocomplete(index: number): void {
    const row = this.vazhipadinfo.at(index) as FormGroup;
    const control = row.get('Vazhipad');
    control?.valueChanges
      .pipe(
        startWith(''),
        map((value) => this._filter(value)),
      )
      .subscribe((filteredOptions) => {
        this.filteredOptions[index] = filteredOptions;
      });
  }

  private _filter(value: string | null | undefined): any[] {
    if (value === null || value === undefined) {
      return [];
    }

    const filterValue = value.toLowerCase();
    const normalizedValue = value.normalize('NFC');

    // Check if the entered value is a number
    const isNumber = !isNaN(Number(value));

    let filteredList = this.VMList.filter((option) => {
      const vmName = option.VM_Name ? option.VM_Name.toLowerCase() : '';
      const vmCode = option.VM_Code ? option.VM_Code.toLowerCase() : '';
      const vmRName = option.VM_RName ? option.VM_RName.normalize('NFC') : '';

      return (
        vmName.includes(filterValue) ||
        vmCode.includes(filterValue) ||
        vmRName.includes(normalizedValue)
      );
    });

    // If the entered value is a number, sort the filtered list by VM_Code in ascending order
    if (isNumber) {
      filteredList = filteredList.sort((a, b) => {
        const aCode = Number(a.VM_Code); // Convert VM_Code to a number for comparison
        const bCode = Number(b.VM_Code);
        return aCode - bCode;
      });
    }

    return filteredList;
  }

  setupStarAutocomplete(index: number): void {
    const row = this.vazhipadinfo.at(index) as FormGroup;
    const control = row.get('starName');
    control?.valueChanges
      .pipe(
        startWith(''),
        map((value) => this._filterStar(value)),
      )
      .subscribe((filteredOptions) => {
        this.starFilteredOption[index] = filteredOptions;
      });
  }

  private _filterStar(value: string | null | undefined): any[] {
    if (value === null || value === undefined) {
      return [];
    }

    const filterValue = value.toLowerCase();
    const normalizedValue = value.normalize('NFC');

    // Check if the entered value is a number
    const isNumber = !isNaN(Number(value));

    let filteredList = this.nakshatham.filter((option) => {
      const name = option.SM_Name ? option.SM_Name.toLowerCase() : '';
      const starCode = option.SM_Id
        ? option.SM_Id.toString().toLowerCase()
        : '';
      const starRName = option.SM_RName ? option.SM_RName.normalize('NFC') : '';

      return (
        name.includes(filterValue) ||
        starCode.includes(filterValue) ||
        starRName.includes(normalizedValue)
        // vmRName.includes(normalizedValue)
      );
    });

    // If the entered value is a number, sort the filtered list by VM_Code in ascending order
    if (isNumber) {
      filteredList = filteredList.sort((a, b) => {
        const aCode = Number(a.starCode); // Convert VM_Code to a number for comparison
        const bCode = Number(b.starCode);
        return aCode - bCode;
      });
    }

    return filteredList;
  }

  setupPrathistaAutocomplete(index: number): void {
    const row = this.vazhipadinfo.at(index) as FormGroup;
    const control = row.get('Prethista');
    control?.valueChanges
      .pipe(
        startWith(''),
        map((value) => this._filterPrathista(value, index)),
      )
      .subscribe((filteredOptions) => {
        this.prathistaFilteredOption[index] = filteredOptions;
      });
  }

  private _filterPrathista(
    value: string | null | undefined,
    index: number,
  ): any[] {
    if (value === null || value === undefined) {
      return [];
    }

    const filterValue = value.toLowerCase();
    const normalizedValue = value.normalize('NFC');

    // Check if the entered value is a number
    const isNumber = !isNaN(Number(value));

    let filteredList = this.prathishtaOptions[index].filter((option: any) => {
      const name = option.name ? option.name.toLowerCase() : '';
      const starCode = option.code ? option.code.toString().toLowerCase() : '';
      const starRName = option.rname ? option.rname.normalize('NFC') : '';

      return (
        name.includes(filterValue) ||
        starCode.includes(filterValue) ||
        starRName.includes(normalizedValue)
        // vmRName.includes(normalizedValue)
      );
    });

    // If the entered value is a number, sort the filtered list by VM_Code in ascending order
    if (isNumber) {
      filteredList = filteredList.sort((a: any, b: any) => {
        const aCode = Number(a.starCode); // Convert VM_Code to a number for comparison
        const bCode = Number(b.starCode);
        return aCode - bCode;
      });
    }

    return filteredList;
  }

  setupDevoteeNameAutocomplete(index: number): void {
    const row = this.vazhipadinfo.at(index) as FormGroup;
    if (!row) {
      return;
    }
    const control = row.get('Name');
    control?.valueChanges
      .pipe(
        startWith(control.value || ''),
        map((value) => this._filterDevoteeName(value)),
      )
      .subscribe((filteredOptions) => {
        this.devoteeNameFilteredOption[index] = filteredOptions;
      });
  }

  private _filterDevoteeName(value: string | null | undefined): any[] {
    if (!value || typeof value !== 'string') {
      return [];
    }

    const trimmed = value.trim();
    if (trimmed.length < 1) {
      return [];
    }

    const filterValue = trimmed.toLowerCase();
    const normalizedFilterValue = trimmed.normalize('NFC').toLowerCase();

    return this.devoteeList.filter((option) => {
      const name = (option.Name || '').trim().toLowerCase();
      const normalizedName = (option.Name || '').trim().normalize('NFC').toLowerCase();
      return (
        name.startsWith(filterValue) ||
        normalizedName.startsWith(normalizedFilterValue)
      );
    });
  }

  onDevoteeNameSelect(event: MatAutocompleteSelectedEvent, index: number): void {
    const selectedName = event.option.value;
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    if (!selectedRow) return;

    selectedRow.get('Name')?.setValue(selectedName);

    const match = this.devoteeList.find(
      (item) => (item.Name || '').trim().toLowerCase() === (selectedName || '').trim().toLowerCase(),
    );

    if (match) {
      const starIdentifier = (match.StarName || match.Star || '').toString().trim().toLowerCase();
      if (starIdentifier) {
        const starMatch = this.nakshatham.find(
          (s) =>
            s.SM_Id?.toString() === match.Star?.toString() ||
            (s.SM_Name || '').trim().toLowerCase() === starIdentifier ||
            (s.SM_RName || '').trim().toLowerCase() === starIdentifier,
        );
        if (starMatch) {
          selectedRow.patchValue({
            Star: starMatch.SM_Id.toString(),
            starName: this.lang === 'ml' ? starMatch.SM_RName : starMatch.SM_Name,
          });
        }
      }
    }
  }

  getAllvazhipad() {
    this.masterservice.getAllActiveVazhipad().subscribe((data) => {
      this.VMList = data.map((item) => ({
        VM_Id: item.VM_Id,
        VM_Name: item.VM_Name,
        VM_Code: item.VM_Code,
        VM_RName: item.VM_RName,
      }));
    });
    this.addRow(-1);
  }

  getNakshthram() {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterservice.getStarData(payLoad).subscribe((res) => {
      // this.nakshatham = res;

      this.nakshatham = res.map((item) => ({
        SM_Id: item.id,
        SM_Name: item.SM_NameEng,
        SM_Code: item.SM_Code,
        SM_RName: item.SM_Name,
      }));
    });
  }

  getDevoteeMaster(): void {
    const payLoad = { Type: 'DevoteeMaster', Code: '' };
    this.masterservice.getMaster(payLoad).subscribe({
      next: (data: any[]) => {
        if (Array.isArray(data)) {
          const seen = new Set<string>();
          const list: any[] = [];
          data.forEach((item: any) => {
            const rawName = (item.Name || item.name || item.DevoteeName || '').trim();
            if (rawName) {
              const key = rawName.toLowerCase();
              if (!seen.has(key)) {
                seen.add(key);
                list.push({
                  Name: rawName,
                  Star: item.Star || item.star || '',
                  StarName: item.StarName || item.starName || '',
                  MID: item.MID || item.Mid || '',
                });
              }
            }
            if (Array.isArray(item.relativesDetails)) {
              item.relativesDetails.forEach((r: any) => {
                const rName = (r.Name || r.name || '').trim();
                if (rName) {
                  const rKey = rName.toLowerCase();
                  if (!seen.has(rKey)) {
                    seen.add(rKey);
                    list.push({
                      Name: rName,
                      Star: r.Star || r.star || '',
                      StarName: r.StarName || r.starName || '',
                      MID: item.MID || item.Mid || '',
                    });
                  }
                }
              });
            }
          });
          this.devoteeList = list;
        }
      },
      error: (err) => {
        console.error('Error fetching devotee master:', err);
      },
    });
  }

  vazhipadValidator(control: AbstractControl): ValidationErrors | null {
    const vazhipad = control.value;
    var vmExists;
    if (this.lang === 'en') {
      vmExists = this.VMList.some((vm) => vm.VM_Name === vazhipad);
    } else if (this.lang != 'en') {
      vmExists = this.VMList.some((vm) => vm.VM_RName === vazhipad);
    }
    // const vmExists = this.VMList.some((vm) => vm.VM_RName === vazhipad);
    if (!vmExists) {
      return { invalidVazhipad: true };
    }
    return null;
  }

  updateSlno(): void {
    this.vazhipadinfo.controls.forEach((row, index) => {
      row.get('Slno')?.setValue(index + 1);
    });
  }

  vazhipadtime = [
    // { id: '0', key: 'TIME1' },
    { id: '1', key: 'TIME2' },
    { id: '2', key: 'TIME3' },
    { id: '3', key: 'TIME4' },
  ];

  onSelect(event: MatAutocompleteSelectedEvent, index: number): void {
    const selectedVazhipad = event.option.value;

    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    selectedRow.get('Vazhipad')?.setValue(selectedVazhipad);

    // Fetch vazhipad details
    if (this.lang === 'en') {
      this.selectedVazhipadItem = this.VMList.find(
        (item) => item.VM_Name === selectedVazhipad,
      );
    } else if (this.lang != 'en') {
      this.selectedVazhipadItem = this.VMList.find(
        (item) => item.VM_RName === selectedVazhipad,
      );
    }

    if (this.selectedVazhipadItem) {
      selectedRow.get('Vazhid')?.setValue(this.selectedVazhipadItem.VM_Id);
      const vazhid = this.selectedVazhipadItem.VM_Id;
      // Fetch vazhipad details using VM_Code
      this.getSeasnalalVazhipadData(this.selectedVazhipadItem.VM_Id, index);
      this.getBlockingvazipadDate(this.selectedVazhipadItem.VM_Id, index);
      this.getDatamasterdateCheck(this.selectedVazhipadItem.VM_Id, index);
      const vazhipadCode = this.selectedVazhipadItem.VM_Code;

      this.fetchVazhipadDetails(vazhipadCode, index, vazhid);
    } else {
      // Handle error or feedback if needed
    }
  }

  onStarSelect(event: MatAutocompleteSelectedEvent, index: number): void {
    const selectedStar = event.option.value;
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    selectedRow.get('Star')?.setValue(selectedStar);
    if (this.lang == 'en') {
      this.selectedStarData = this.nakshatham.find(
        (item) => item.SM_Name == selectedStar,
      );
    } else if (this.lang != 'en') {
      this.selectedStarData = this.nakshatham.find(
        (item) => item.SM_RName === selectedStar,
      );
    }
    if (this.selectedStarData) {
      selectedRow.get('Star')?.setValue(this.selectedStarData.SM_Id.toString());
    } else {
      console.error('Selected star item not found in VMList');
      // Handle error or feedback if needed
    }
  }

  onPrathistaSelect(event: MatAutocompleteSelectedEvent, index: number): void {
    const selectedStar = event.option.value;
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    selectedRow.get('Star')?.setValue(selectedStar);

    if (this.lang == 'en') {
      this.selectedStarData = this.nakshatham.find(
        (item) => item.SM_Name == selectedStar,
      );
    } else if (this.lang != 'en') {
      this.selectedStarData = this.nakshatham.find(
        (item) => item.SM_RName === selectedStar,
      );
    }

    if (this.selectedStarData) {
      selectedRow.get('Star')?.setValue(this.selectedStarData.SM_Id.toString());
    } else {
      console.error('Selected star item not found in VMList');
      // Handle error or feedback if needed
    }
  }

  fetchVazhipadDetails(
    vazhipadcode: string,
    index: number,
    vazhid: number,
  ): void {
    this.masterservice
      .getVazhipadeByCode(vazhipadcode)
      .subscribe((res: any) => {
        const selectedRow = this.vazhipadinfo.at(index) as FormGroup;

        if (res[0].VM_Amt != 0) {
          selectedRow.get('Rate')?.setValue(res[0].VM_Amt);
        } else {
          selectedRow.get('Rate')?.setValue('');
        }
        // selectedRow.get('Rate')?.setValue(res[0].VM_Amt);
        selectedRow.get('multiname')?.setValue(res[0].VM_MultiName);
        selectedRow.get('booking')?.setValue(res[0].VM_Booking);
        selectedRow.get('VM_Receipt')?.setValue(res[0].VM_Receipt);
        selectedRow.get('ratechange')?.setValue(res[0].VM_Rate_Change);
        selectedRow.get('VTime')?.setValue(res[0].VM_Time);
        selectedRow.get('maxLimit')?.setValue(res[0].VM_MaxNo);
        selectedRow.get('Mattinagal')?.setValue(res[0].VM_Mattinam);
        selectedRow.get('VM_TimeSlot')?.setValue(res[0].VM_TimeSlot);
        selectedRow.get('VM_Token')?.setValue(res[0].VM_Token);
        this.selectedVazhipadPrathistaDetails(vazhipadcode, index, vazhid);
        this.setVazhipadDate(index);
      });
  }

  setVazhipadDate(index: number) {
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    const booking = selectedRow.get('booking')?.value;
    const receipt = selectedRow.get('VM_Receipt')?.value;
    const vazhipadId = selectedRow.get('Vazhid')?.value;
    const allowedDays =
      (selectedRow.get('allowedDays')?.value as number[]) || [];
    const seasonaldays = selectedRow.get('seasonalDates')?.value;

    this.tomorrowDate = new Date(this.currentDate);
    this.tomorrowDate.setDate(this.currentDate.getDate() + 1);
    const fromDate = seasonaldays ? seasonaldays.fromDate : null;
    if (receipt === 'Y' && booking === 'N') {
      selectedRow
        .get('VazhipadDate')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
      // }
    } else if (booking === 'Y' && receipt === 'N') {
      selectedRow
        .get('VazhipadDate')
        ?.setValue(this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd'));
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd'));
    } else if (booking === 'N' && receipt === 'N') {
      selectedRow
        .get('VazhipadDate')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
    } else if (fromDate) {
      selectedRow.get('VazhipadDate')?.setValue(fromDate);
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(fromDate, 'yyyy-MM-dd'));
    }
  }

  focusSelect(): void {
    if (this.vTimeSelect) {
      this.vTimeSelect.nativeElement.focus();
    }
  }

  // fetch prathista detasils
 selectedVazhipadPrathistaDetails(
    vazhipadcode: any,
    index: number,
    vazhid: number,
  ) {
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    this.masterservice.getVazhipadByCodeForDiety(vazhipadcode).subscribe({
      next: (res: any) => {
        this.prathishtaOptions[index] = res.map((item: any) => ({
          id: item.PM_ID,
          name: item.PM_Name,
          rname: item.PM_RegName,
          code: item.PM_Code,
        }));
        const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
        if (this.lang == 'en') {
          if (this.prathishtaOptions[index].length > 0) {
            const defaultPrathishta = this.prathishtaOptions[index][0].name;
            const defaultPrathishtaId = this.prathishtaOptions[index][0].id;

            this.vazhipadinfo
              .at(index)
              .get('Prethista')
              ?.setValue(defaultPrathishta);
            this.vazhipadinfo
              .at(index)
              .get('PMid')
              ?.setValue(defaultPrathishtaId);

            selectedRow
              .get('Prethista')
              ?.valueChanges.subscribe((selectedPrathishta) => {
                const selectedPrathishtaObj = this.prathishtaOptions[
                  index
                ].find((option: any) => option.name === selectedPrathishta);
                if (selectedPrathishtaObj) {
                  selectedRow.get('PMid')?.setValue(selectedPrathishtaObj.id); // Set PMid based on selected Prathishta
                }
              });
          }
        } else if (this.lang != 'en') {
          if (this.prathishtaOptions[index].length > 0) {
            const defaultPrathishta = this.prathishtaOptions[index][0].rname;
            const defaultPrathishtaId = this.prathishtaOptions[index][0].id;

            this.vazhipadinfo
              .at(index)
              .get('Prethista')
              ?.setValue(defaultPrathishta);
            this.vazhipadinfo
              .at(index)
              .get('PMid')
              ?.setValue(defaultPrathishtaId);

            selectedRow
              .get('Prethista')
              ?.valueChanges.subscribe((selectedPrathishta) => {
                const selectedPrathishtaObj = this.prathishtaOptions[
                  index
                ].find((option: any) => option.rname === selectedPrathishta);
                if (selectedPrathishtaObj) {
                  selectedRow.get('PMid')?.setValue(selectedPrathishtaObj.id); // Set PMid based on selected Prathishta
                }
              });
          }
        }
        const vmToken = selectedRow.get('VM_Token')?.value;
        const reciptstatus = selectedRow.get('VM_Receipt')?.value;
        const prathistaId = this.vazhipadinfo.at(index).get('PMid')?.value;
        if (vmToken === 'Y' && vazhid && reciptstatus == 'Y') {
          this.setTocken(index, vazhid, prathistaId);
        }
        const maxlimitqty = selectedRow.get('maxLimit')?.value;
        if (Number(maxlimitqty) > 0) {
          this.getAlreadybookedvazhipadQty(index);
        }
      },
      error: (err) => {
        console.log('error in getting prathishta');
      },
    });
  }

  setTocken(index: number, vazhid: number, pmId: number) {
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    const payLoad = {
      Type: 'TokenNo',
      FromDate: this.currentDate,
      ToDate: this.currentDate,
      PMId: selectedRow.get('PMid')?.value,
      VazhId: vazhid,
    };
    this.masterservice.getVazhipadWiseReport(payLoad).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          selectedRow.get('Slno')?.setValue(res[0].Token);
          // console.log(res[0].Token, 'tocken nuber  got');
        } else {
        }
      },
      error: (err: any) => {
        console.log('error in getting tocken');
      },
    });
  }

  getAlreadybookedvazhipadQty(index: number) {
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    let currentQty = selectedRow.get('Qty')?.value;
    const payLoad = {
      Type: 'VazhipadLimit',
      FromDate: selectedRow.get('VazhipadDate')?.value,
      ToDate: selectedRow.get('VazhipadDate')?.value,
      PMId: selectedRow.get('PMid')?.value,
      VazhId: selectedRow.get('Vazhid')?.value,
    };
    this.reportService.getVazhipadWiseReport(payLoad).subscribe({
      next: (data) => {
        const qty = data[0].qty;
        if (qty > 0) {
          selectedRow.get('alreadyBooked')?.setValue(qty);
          this.validateQtyAndSetError(index);
        }
      },
    });
  }

  validateQtyAndSetError(index: number) {
    const formArray = this.vazhipadinfo.controls;
    const currentGroup = formArray[index] as FormGroup;
    const currentVazhipad = currentGroup.get('Vazhid')?.value;
    const maxLimit = currentGroup.get('maxLimit')?.value;
    const alreadyBooked = currentGroup.get('alreadyBooked')?.value;
    const currentQty = +currentGroup.get('Qty')?.value || 0;

    // Sum qty of same vazhipad in all rows
    let totalQty = alreadyBooked;
    formArray.forEach((group, i) => {
      if (i !== index && group.get('Vazhid')?.value == currentVazhipad) {
        totalQty += +group.get('Qty')?.value || 0;
      }
    });

    totalQty += currentQty;

    if (totalQty > maxLimit && maxLimit != 0) {
      currentGroup.get('Qty')?.setErrors({ exceed: true });
      let availabilty = maxLimit - alreadyBooked;
      currentGroup
        .get('errorMessage')
        ?.setValue(
          `Qty exceeds available limit. Max: ${maxLimit},Already booked:${alreadyBooked} Available qty: ${availabilty}`,
        );
      const errorMsg = currentGroup.get('errorMessage')?.value;
      this.notification.error(errorMsg, 'Invalid Quantity');
      this.form.setErrors({ invalidQty: true });
    } else {
      currentGroup.get('Qty')?.setErrors(null);
      currentGroup.get('errorMessage')?.setValue('');
      if (
        !this.vazhipadinfo.controls.some((control: AbstractControl) =>
          (control as FormGroup).get('Qty')?.hasError('exceed'),
        )
      ) {
        this.form.setErrors(null); // Clear invalidQty error
      }
    }
  }

  onQtyChange(index: number) {
    const formArray = this.vazhipadinfo.controls;
    const currentGroup = formArray[index] as FormGroup;
    const maxLimit = currentGroup.get('maxLimit')?.value;
    if (maxLimit > 0) {
      this.validateQtyAndSetError(index);
    }
  }

  // opne multiday open dialog box
  openMultiDayDialog(rowIndex: number): void {
    const dialogRef = this.dialog.open(MultidayitemsComponent, {
      height: '80vh',
      width: '85vw',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.handleDialogData(result);
        // console.log(result,'multiday booking result in area reciept componet 11111');
        const { finalArray, VM_MaxNo, lifeTimeVazhipad } = result;
        this.handleMultiDayBookingResult(
          finalArray,
          rowIndex,
          result.lifeTimeVazhipad,
        );
      }
    });
  }

  // to show multi day booked details
  openMultiDayBookedDetails(rowIndex: number) {
    const dialogRef = this.dialog.open(MultidaybookeddetailsComponent, {
      height: '80vh',
      maxWidth: '50vw',
      data: this.multidayBooking[rowIndex], // Pass the array values
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { finalArray, VM_MaxNo } = result;
        // this.handleMultiDayBookingResult(finalArray, rowIndex,VM_MaxNo);
      }
    });
  }

  formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  private handleMultiDayBookingResult(
    result: any,
    rowIndex: number,

    lifeTimevazhipad: string,
  ): void {
    // console.log(result, 'multiday booking result in area reciept componet lifetime vazhipaf',lifeTimevazhipad);
    const row = this.vazhipadinfo.at(rowIndex) as FormGroup;
    let lastIndex = result.length - 1;
    const data = result[0];
    // console.log(data, 'multiday bookinf send details');
    const startDate = new Date(data.VazhipadDate);
    const endDate = new Date(result[lastIndex].VazhipadDate);
    const formattedDates = result.map((item: any) => {
      return {
        ...item,
        VazhipadDate: this.formatDateToDDMMYYYY(new Date(item.VazhipadDate)),
      };
    });
    this.multidayBooking[rowIndex] = formattedDates;
    row.patchValue({
      Vazhipad: data.Vazhipad,
      Vazhid: data.Vazhid,
      Prethista: data.Prethista,
      Qty: lifeTimevazhipad == 'Y' ? 1 : data.Qty * result.length,
      Rate: data.Rate,
      VazhipadDate: this.datePipe.transform(startDate, 'yyyy-MM-dd') || '',
      TotalAmt: this.totalAmount,
      toDate: this.datePipe.transform(endDate, 'yyyy-MM-dd') || '',
      PMid: data.PMid,
      Mday: data.Mday,
      NalBy: data.NalBy,
      Mmonth: data.Mmonth,
      Name: data.Name,
      Star: data.Star,
      Name2: data.Name2,
      Star2: data.Star2,
      VTime: data.VTime,
      starName: this.getStarbyId(data.Star),
      Remarks: data.Remarks,
    });
  }

  convertToDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Function to format the date
  formatDates(dateStr: string): string {
    const date = this.convertToDate(dateStr);
    return this.datePipe.transform(date, 'yyyy-mm-dd') || '';
  }

  // calculate amount
  updateAmount(row: FormGroup): void {
    const qty = row.get('Qty')?.value || 0;
    const rate = row.get('Rate')?.value || 0;
    const amount = qty * rate;
    row.get('Amount')?.setValue(amount);
    this.updateTotalAmount();
  }

  focusInput(i: number): void {
    const inputElement = document.getElementById(
      `Name-${i}`,
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  }

  // total amount calculation
  updateTotalAmount(): void {
    this.totalAmount = this.vazhipadinfo.controls.reduce((sum, row) => {
      const amount = row.get('Amount')?.value || 0;
      return sum + amount;
    }, 0);
    this.eventService.setTotalAmount(this.totalAmount);
    this.vazhipadinfo.controls.forEach((row) => {
      row.get('TotalAmt')?.setValue(this.totalAmount);
    });
  }

  private flattenMultiDayBooking(): any[] {
    return this.multidayBooking.flat();
  }

  private cleanVazhipadInfo(item: any) {
    return {
      Amount: item.Amount,
      Mday: item.Mday,
      Mmonth: item.Mmonth,
      NalBy: item.NalBy,
      Name: item.Name,
      Name2: item.Name2,
      PMid: item.PMid,
      Postal: item.Postal,
      Prethista: item.Prethista,
      Qty: item.Qty,
      Rate: item.Rate,
      Slno: item.Slno,
      Star: item.Star,
      Star2: item.Star2,
      TotalAmt: item.TotalAmt,
      Vazhid: item.Vazhid,
      Vazhipad: item.Vazhipad,
      VazhipadDate: item.VazhipadDate,
      VTime: item.VTime,
      FromDate: item.VazhipadDate,
      ToDate: item.VazhipadDate,
      SearchBy: item.SearchBy,
      Remarks: item.Remarks,
    };
  }

  formatDate(dateString: any): string {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${date.getFullYear()}`;
  }

  // api data send
  async sendDataToApi(data: any) {
    let isFormValid = true;
    let multidayRowIndices: number[] = [];
    const isQtyValid = await this.validateAllVazhipadQty();

    if (!isQtyValid) {
      this.notification.error(
        'Please fix the quantity errors before submitting',
      );
      return;
    }
    this.vazhipadinfo.controls.forEach((row, index) => {
      row.markAllAsTouched();
      if (row.invalid) {
        isFormValid = false;
        if (row.get('Vazhipad')?.errors?.['required']) {
          this.notification.success('Please select a vazhipad');
        } else if (row.get('Vazhipad')?.errors?.['invalidVazhipad']) {
          this.notification.success('Please select a Valid vazhipad');
        } else if (row.get('Name')?.errors?.['required']) {
          this.notification.success('Please enter the Name');
        } else if (row.get('Star')?.errors?.['required']) {
          this.notification.success('Please select a Star');
        } else if (row.get('Prethista')?.errors?.['required']) {
          this.notification.success('Please select a Prethista');
        } else if (row.get('Qty')?.errors?.['required']) {
          this.notification.success('Please enter a Qty');
        } else if (row.get('Rate')?.errors?.['required']) {
          this.notification.success('Please enter a Rate');
        } else if (row.get('Rate')?.errors?.['pattern']) {
          this.notification.success('Enter a valid rate');
        } else if (row.get('Rate')?.errors?.['zeroRate']) {
          this.notification.success('Rate cannot be zero');
        } else if (row.get('VazhipadDate')?.errors?.['required']) {
          this.notification.success('Please select a VazhipadDate');
        } else if (row.get('VazhipadDate')?.errors?.['minDate']) {
        } else if (row.get('Qty')?.errors?.['invalidQty']) {
          this.notification.success('Should add the valid number of qty');
        }
        return;
      } else {
        if (this.multidayBooking[index]) {
          multidayRowIndices.push(index);
        }
      }
    });

    if (!isFormValid) {
      return;
    }
    this.receiptPrintService.setSubmitting(true);

    const flattenedData = this.flattenMultiDayBooking();
    const vazhipadinfo = data.vazhipadinfo || [];
    for (let i = multidayRowIndices.length - 1; i >= 0; i--) {
      const indexToRemove = multidayRowIndices[i];
      vazhipadinfo.splice(indexToRemove, 1);
    }
    const cleanedVazhipadinfo = vazhipadinfo.map(this.cleanVazhipadInfo);
    const combinedVazhipadinfo = [...cleanedVazhipadinfo, ...flattenedData];

    this.printData = vazhipadinfo;
    const updatedData = {
      ...data,
      vazhipadinfo: combinedVazhipadinfo,
    };

    const formattedData = this.formatDateFields(updatedData);
    if (formattedData.Trnsmode !== 'CS') {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        data: { message: `Do you want to proceed with digital payment ?` },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.prnitConfirmDialog(formattedData);
        } else {
          this.receiptPrintService.setSubmitting(false);
        }
      });
    } else {
      this.prnitConfirmDialog(formattedData);
    }
  }

  validateAllVazhipadQty(): Promise<boolean> {
    const vazhipadArray = this.form.get('vazhipadinfo') as FormArray;
    const groupedEntries: {
      [key: string]: { indexes: number[]; totalQty: number; maxLimit: number };
    } = {};

    vazhipadArray.controls.forEach((row, index) => {
      if (this.multidayBooking[index]) return;

      const vazhid = row.get('Vazhid')?.value;
      const pmid = row.get('PMid')?.value;
      const date = row.get('VazhipadDate')?.value;
      const qty = +row.get('Qty')?.value || 0;
      const maxLimit = +row.get('maxLimit')?.value || 0;
      if (!vazhid || !pmid || !date) return;

      const key = `${vazhid}_${pmid}_${date}`;

      if (!groupedEntries[key]) {
        groupedEntries[key] = { indexes: [], totalQty: 0, maxLimit };
      }

      groupedEntries[key].indexes.push(index);
      groupedEntries[key].totalQty += qty;
    });

    const validations = Object.keys(groupedEntries).map((key) => {
      const [vazhid, pmid, date] = key.split('_');
      const group = groupedEntries[key];

      if (!group.maxLimit || group.maxLimit <= 0) {
        group.indexes.forEach((i) => {
          vazhipadArray.at(i).get('Qty')?.setErrors(null);
        });
        return of(true);
      }

      const payload = {
        Type: 'VazhipadLimit',
        FromDate: date,
        ToDate: date,
        PMId: pmid,
        VazhId: vazhid,
      };

      return this.reportService.getVazhipadWiseReport(payload).pipe(
        map((res: any) => {
          const alreadyBooked = res[0]?.qty ?? 0;
          const totalQty = group.totalQty;
          const exceeded = alreadyBooked + totalQty > group.maxLimit;

          if (exceeded) {
            group.indexes.forEach((i) => {
              vazhipadArray.at(i).get('Qty')?.setErrors({ exceedLimit: true });
            });

            this.notification.error(
              `Qty exceeds limit for ${this.getVazhipadByid(vazhid)}. Limit: ${group.maxLimit
              }, Already: ${alreadyBooked}, Entered: ${totalQty}`,
            );
          } else {
            group.indexes.forEach((i) => {
              vazhipadArray.at(i).get('Qty')?.setErrors(null);
            });
          }

          return !exceeded;
        }),
        catchError(() => of(true)),
      );
    });

    return forkJoin(validations.length ? validations : [of(true)])
      .toPromise()
      .then((results: any) => {
        const hasErrors = results.includes(false);
        if (hasErrors) {
          this.form.setErrors({ invalidQty: true });
          return false;
        } else {
          this.form.setErrors(null);
          return true;
        }
      });
  }

  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }

  // confirm printing
  prnitConfirmDialog(formattedData: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: { message: 'Do you want to proceed with printing ?' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.sendBillingDataApiCall(formattedData);
        this.cancelFlag = false;
      } else {
        this.sendBillingDataApiCall(formattedData);

        this.cancelFlag = true;
      }
    });
  }

  // api call send billing data to db
  sendBillingDataApiCall(formattedData: any) {
    const updatedData = {
      ...formattedData,
      vazhipadinfo: formattedData.vazhipadinfo.map((item: any) => ({
        ...item,
        TotalAmt: this.totalAmount.toString(),
      })),
    };
    this.onSubmitBookingDetailsApiCall(updatedData);
  }

  onSubmitBookingDetailsApiCall(formattedData: any) {
    this.masterservice.vazhipadBooking(formattedData).subscribe((res: any) => {
      if (res) {
        if (res.RespStatus === 'I') {
          this.receiptPrintService.setSubmitting(false);

          const BillNo = res.BillNo;
          formattedData.BillNo = BillNo;
          if (!this.cancelFlag) {
            this.receiptPrintService.setReceiptData(formattedData);
          }
          this.receiptPrintService.setBooleanValue(true);
          this.receiptPrintService.setSubmitting(false);
          this.notification.success(res.RespMsg);
          this.resetForm();

          this.eventService.notifytheupdateLastbillnumber();

          this.isDataSaved = true;
        } else {
          this.notification.error('Something went wrong. Please try again');
          this.receiptPrintService.notifyApiFailed();
          this.receiptPrintService.setSubmitting(false);
        }
      } else {
        this.notification.error('Please check your connection and try again');
        this.receiptPrintService.setSubmitting(false);
      }
    });
  }

  // form reset
  resetForm() {
    this.form.reset();
    this.vazhipadinfo.clear();
    this.devoteeNameFilteredOption = [];
    this.addRow(-1);
    this.updateTotalAmount();
    this.multidayBooking = [];
    this.cancelFlag = false;
  }

  // format the data based apiformat
  private formatDateFields(data: any): any {
    const formattedData = { ...data };
    if (
      formattedData.vazhipadinfo &&
      Array.isArray(formattedData.vazhipadinfo)
    ) {
      formattedData.vazhipadinfo = formattedData.vazhipadinfo.map(
        (item: any) => {
          return {
            ...item,
            Slno: String(item.Slno),
            Vazhipad: String(item.Vazhipad),
            Vazhid: String(item.Vazhid),
            Name: String(item.Name),
            Star: String(item.Star),
            Prethista: String(item.Prethista),
            Qty: String(item.Qty),
            Rate: String(item.Rate),
            Amount: String(item.Amount),
            VazhipadDate: this.dateFormat(new Date(item.VazhipadDate)),
            TotalAmt: String(item.TotalAmt),
            Name2: String(item.Name2),
            Star2: String(item.Star2),
            Postal: String(item.Postal),
            PMid: String(item.PMid),
            Mday: String(item.Mday),
            NalBy: String(item.NalBy),
            Mmonth: String(item.Mmonth),
            FromDate: item.FromDate,
            ToDate: item.ToDate,
            SearchBy: String(item.SearchBy),
            Remarks: String(item.Remarks),
          };
        },
      );
    }
    return formattedData;
  }

  // show validatin error
  showValidationErrors(row: FormGroup): void {
    Object.keys(row.controls).forEach((key) => {
      const controlErrors: ValidationErrors = row.get(key)?.errors || {};
      if (controlErrors) {
        Object.keys(controlErrors).forEach((errorKey) => {
          switch (errorKey) {
            case 'required':
              this.notification.success(`${key} is required.`);
              break;
            case 'pattern':
              this.notification.success(`Invalid pattern for ${key}.`);
              break;
            case 'zeroRate':
              this.notification.success(`Rate cant be Zero`);
              break;
          }
        });
      }
    });
  }

  // getseasonal vazhipad data
  getSeasnalalVazhipadData(vid: string, index: number) {
    this.masterservice.getSeasonalVazhipadDateCheck(vid).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const seasonalDates = {
            fromDate: data[0].VS_FromDate,
            toDate: data[0].VS_ToDate,
          };

          const row = this.vazhipadinfo.at(index) as FormGroup;
          const formattedFromDate = this.datePipe.transform(
            seasonalDates.fromDate,
            'yyyy-MM-dd',
          );
          const formattedToDate = this.datePipe.transform(
            seasonalDates.toDate,
            'yyyy-MM-dd',
          );
          row.get('seasonalDates')?.patchValue({
            fromDate: formattedFromDate,
            toDate: formattedToDate,
          });
          this.setVazhipadDate(index);
        } else {
          const row = this.vazhipadinfo.at(index) as FormGroup;
          row.get('seasonalDates')?.patchValue({ fromDate: '', toDate: '' });
          row.get('vazhipadDate')?.patchValue('');
        }
      },
      error: (err) => {
        const row = this.vazhipadinfo.at(index) as FormGroup;
        row.get('seasonalDates')?.patchValue({ fromDate: '', toDate: '' });
        row.get('vazhipadDate')?.patchValue('');
        this.notification.error(
          'Error fetching seasonal data. Please try again later.',
        );
      },
    });
  }
  // Define a day mapping object
  private dayMapping: { [key: number]: string } = {
    1: 'Sunday',
    2: 'Monday',
    3: 'Tuesday',
    4: 'Wednesday',
    5: 'Thursday',
    6: 'Friday',
    7: 'Saturday',
  };

  // Get the day master vazhipad data
  getDatamasterdateCheck(vid: string, index: number) {
    const row = this.vazhipadinfo.at(index) as FormGroup;
    this.masterservice.getDayMastervazhipaddateCheck(vid).subscribe({
      next: (data) => {
        const allowedDays = data.map((item: any) => item.Day);

        const allowedDayNames = allowedDays.map(
          (dayId) => this.dayMapping[dayId] || 'Unknown',
        );

        const allowDaysFormArray = row.get('allowedDays') as FormArray;

        while (allowDaysFormArray.length) {
          allowDaysFormArray.removeAt(0);
        }

        allowedDayNames.forEach((dayName: string) => {
          allowDaysFormArray.push(this.fb.control(dayName));
        });
      },
      error: (err) => {
        console.error('Error fetching day master data:', err);
      },
    });
  }

  clearAll() {
    this.resetForm();
  }

  handleTabKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'enter') {
      event.preventDefault();

      this.addRow(index);
    }
  }

  ngAfterViewInit(): void {
    // Focus on the first input field when the page loads
    this.firstInputElement.nativeElement.focus();
  }

  getStarbyId(id: string) {
    if (this.lang == 'en') {
      const star = this.nakshatham.find((item) => item.SM_Id == id);
      return star ? star.SM_Name : '';
    } else if (this.lang != 'en') {
      const star = this.nakshatham.find((item) => item.SM_Id == id);
      return star ? star.SM_RName : '';
    }
  }

  changeLanguage(lang: any) {
    const selectedlang = lang.target.value;
    localStorage.setItem('Language', selectedlang);
    this.ts.use(selectedlang);
  }

  handleKeyDowns(event: KeyboardEvent, index: number): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const inputs = document.querySelectorAll(
        'form [formControlName]',
      ) as NodeListOf<HTMLInputElement>;
      if (inputs[index - 1]) {
        (inputs[index - 1] as HTMLInputElement).focus();
      }
    }
  }

  navigateToNext(event: Event, rowIndex: number, nextField: string): void {
    const keyboardEvent = event as KeyboardEvent;
    const currentTime = new Date().getTime();

    if (keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault();

      const rowFormElements = Array.from(
        document.querySelectorAll(
          `#row-${rowIndex} input, #row-${rowIndex} mat-select, #row-${rowIndex} select, #row-${rowIndex} textarea`,
        ),
      ) as HTMLElement[];

      rowFormElements.forEach((el) => el.classList.remove('highlighted'));
      let currentIndex = rowFormElements.findIndex(
        (el) => el === document.activeElement,
      );

      if (currentIndex === -1) {
        // console.error('Current active element not found in form elements.');
        return;
      }

      const currentElement = rowFormElements[currentIndex];

      if (
        currentElement &&
        currentElement.getAttribute('formControlName') == 'VTime'
      ) {
        this.addRow(rowIndex);
        return;
      }

      if (
        currentElement instanceof HTMLInputElement ||
        currentElement instanceof HTMLTextAreaElement ||
        currentElement instanceof HTMLSelectElement
      ) {
        if (!currentElement.value.trim()) {
          currentElement.classList.add('invalid');
          return;
        } else {
          currentElement.classList.remove('invalid');
        }
      }

      const nextElement = rowFormElements.find(
        (el) => el.getAttribute('formControlName') === nextField,
      );

      if (nextElement) {
        nextElement.focus();
        nextElement.classList.add('highlighted');
        if (nextElement.tagName.toLowerCase() === 'mat-select') {
          const matSelect = nextElement as any;
          if (matSelect && matSelect.open) {
            matSelect.open();
          }
        } else if (nextElement.tagName.toLowerCase() === 'select') {
          const selectElement = nextElement as HTMLSelectElement;
          const clickEvent = new MouseEvent('click', { bubbles: true });
          selectElement.dispatchEvent(clickEvent);
        }
      } else {
        let nextElement = rowFormElements[currentIndex + 1];
        while (
          nextElement &&
          (nextElement.hasAttribute('hidden') ||
            nextElement.getAttribute('disabled') !== null)
        ) {
          nextElement = rowFormElements[++currentIndex + 1];
        }
        if (nextElement) {
          nextElement.focus();
          if (nextElement.tagName.toLowerCase() === 'mat-select') {
            const matSelect = nextElement as any;
            if (matSelect && matSelect.open) {
              matSelect.open();
            }
          } else if (nextElement.tagName.toLowerCase() === 'select') {
            const selectElement = nextElement as HTMLSelectElement;
            const clickEvent = new MouseEvent('click', { bubbles: true });
            selectElement.dispatchEvent(clickEvent);
          }
        } else {
          console.warn('Next element not found. End of row reached.');
        }
      }
    }

    if (keyboardEvent.key === 'ArrowLeft') {
      keyboardEvent.preventDefault();

      const rowFormElements = Array.from(
        document.querySelectorAll(
          `#row-${rowIndex} input, #row-${rowIndex} mat-select, #row-${rowIndex} select, #row-${rowIndex} textarea`,
        ),
      ) as HTMLElement[];

      let currentIndex = rowFormElements.findIndex(
        (el) => el === document.activeElement,
      );

      if (currentIndex === -1) {
        // console.error('Current active element not found in form elements.');
        return;
      }

      let prevElement = rowFormElements[currentIndex - 1];

      while (
        prevElement &&
        (prevElement.hasAttribute('hidden') ||
          prevElement.getAttribute('disabled') !== null)
      ) {
        prevElement = rowFormElements[--currentIndex - 1];
      }

      if (prevElement) {
        prevElement.focus();

        if (prevElement.tagName.toLowerCase() === 'mat-select') {
          const matSelect = prevElement as any;
          if (matSelect && matSelect.open) {
            matSelect.open();
          }
        } else if (prevElement.tagName.toLowerCase() === 'select') {
          const selectElement = prevElement as HTMLSelectElement;
          const clickEvent = new MouseEvent('click', { bubbles: true });
          selectElement.dispatchEvent(clickEvent);
        }
      } else {
        console.warn('Previous element not found. Beginning of row reached.');
      }
    }

    if (keyboardEvent.key === 'ArrowDown') {
      keyboardEvent.preventDefault();

      const nextRow = document.querySelector(`#row-${rowIndex + 1}`);
      if (nextRow) {
        const firstElementInNextRow = nextRow.querySelector(
          'input, mat-select, select, textarea',
        );
        if (firstElementInNextRow) {
          (firstElementInNextRow as HTMLElement).focus();
        }
      }
    }

    if (keyboardEvent.key === 'ArrowUp') {
      keyboardEvent.preventDefault();
      const prevRow = document.querySelector(`#row-${rowIndex - 1}`);
      if (prevRow) {
        const firstElementInPrevRow = prevRow.querySelector(
          'input, mat-select, select, textarea',
        );
        if (firstElementInPrevRow) {
          (firstElementInPrevRow as HTMLElement).focus();
        }
      }
    }
  }

  getBlockingvazipadDate(vmId: any, index: any) {
    const payLoad = { Type: 'BlockingALL', Code: vmId };
    this.masterservice.getMaster(payLoad).subscribe({
      next: (data) => {
        const row = this.vazhipadinfo.at(index) as FormGroup;

        if (data && data.length > 0) {
          const blockingDatesArray = data.map((d: any) =>
            this.datePipe.transform(d.VBDate, 'yyyy-MM-dd'),
          );

          // Get the FormArray and reset it
          const blockingDatesControl = row.get(
            'blockingDates.dates',
          ) as FormArray;
          blockingDatesControl.clear();

          // Populate the FormArray with blocking dates
          blockingDatesArray.forEach((date: any) => {
            blockingDatesControl.push(new FormControl(date));
          });
          // this.setVazhipadDate(index);
          this.setVazhipadDate(index);
        } else {
          row.get('blockingDates')?.patchValue({ dates: [] });
          row.get('vazhipadDate')?.patchValue('');
          // Optionally, show a notification or alert to inform the user
        }
      },
      error: (err) => {
        // Handle error case by resetting seasonal dates
        const row = this.vazhipadinfo.at(index) as FormGroup;
        row.get('blockingDates')?.patchValue({ dates: [] });
        row.get('vazhipadDate')?.patchValue('');
        // Optionally, show a notification or alert to inform the user
        this.notification.error(
          'Error fetching blocking data. Please try again later.',
        );
      },
    });
  }

  openBillingDialog(mobileNumber: any) {
    const dialogRef = this.dialog.open(BillingViaMobilenumberComponent, {
      width: '600px',
      data: mobileNumber,
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        // User pressed CANCEL → do nothing
        return;
      }

      this.nameStarArray = result.selectedData;
      this.singleorMultiDay = result.SmFlag;

      let index = this.vazhipadinfo.length - 1;

      if (this.singleorMultiDay) {
        if (index == 0) {
          this.openDevoteeMasterMultiDayDialog(index, this.nameStarArray);
        } else {
          this.openDevoteeMasterMultiDayDialog(index + 1, this.nameStarArray);
        }
      } else {
        // Add multiple rows based on the array of Name and Star pairs
        this.nameStarArray.forEach((item: { Name: string; Star: string }) => {
          this.addRowsFromNameStarArray(item.Name, item.Star, index);
          index++;
        });
      }
    });
  }

  // Method to dynamically add a row to the form
  addRowsFromNameStarArray(name: string, star: string, index: number): void {
    this.addRowForNameAndStar(index, name, star);
  }

  addRowForNameAndStar(index: number, name: string, star: string): void {
    if (index == 0) {
      const row = this.vazhipadinfo.at(index) as FormGroup;
      row.patchValue({
        Name: name,
        starName: star,
        Star: this.getStarbyIName(star),
      });
    } else {
      const newRow = this.createRow();
      newRow.patchValue({
        Name: name,
        Star: this.getStarbyIName(star),
        starName: star,
      });

      this.vazhipadinfo.insert(index, newRow);
      this.setupAutocomplete(index);
      this.setupStarAutocomplete(index);
      this.setupDevoteeNameAutocomplete(index);
      this.updateTotalAmount();
      setTimeout(() => {
        this.focusOnNewRow();
      }, 0);
    }
  }

  getStarbyIName(Name: string) {
    if (this.lang == 'en') {
      const star = this.nakshatham.find((item) => item.SM_Name == Name);
      return star ? star.SM_Id : '';
    } else if (this.lang != 'en') {
      const star = this.nakshatham.find((item) => item.SM_RName == Name);
      return star ? star.SM_Id : '';
    }
  }

  // opne multiday open dialog box
  openDevoteeMasterMultiDayDialog(rowIndex: number, data: any): void {
    const dialogRef = this.dialog.open(MultidayitemsComponent, {
      height: '80vh',
      width: '85vw',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      disableClose: true,
      data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.handleDialogData(result);
        const { finalArray, VM_MaxNo } = result;
        this.handleMultiDayBookingResult(finalArray, rowIndex, VM_MaxNo);
      }
    });
  }

  getVazhipadByid(id: any) {
    // this.VMList.find()
    const vazhipad = this.VMList.find((v) => v.VM_Id == id);
    return vazhipad ? vazhipad.VM_Name : id;
  }
  generateTimeSlots() {
    this.timeSlots = [];
    for (let i = 4; i < 20; i++) {
      const start = this.formatHour(i);
      const end = this.formatHour(i + 1);
      this.timeSlots.push(`${start} - ${end}`);
    }
  }

  formatHour(hour: number): string {
    const period = hour < 12 ? 'AM' : 'PM';
    let h = hour % 12;
    if (h === 0) h = 12;
    const hourStr = h < 10 ? `0${h}` : `${h}`;
    return `${hourStr}:00 ${period}`;
  }
  onPrathistaChange(event: Event, index: number) {
    const select = event.target as HTMLSelectElement;
    const selectedName = select.value;
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    const selectedvazhid = this.vazhipadinfo.at(index).get('Vazhid')?.value;
    const vmToken = selectedRow.get('VM_Token')?.value;
    const reciptstatus = selectedRow.get('VM_Receipt')?.value;
    const options = this.prathishtaOptions[index];
    const selectedObj =
      this.lang === 'en'
        ? options.find((opt: any) => opt.name === selectedName)
        : options.find((opt: any) => opt.rname === selectedName);

    if (selectedObj) {
      const pmid = selectedObj.id;
      if (vmToken == 'Y' && reciptstatus == 'Y') {
        this.setTocken(index, selectedvazhid, pmid);
      }
    }
  }

  openCalendarPopup(index: number) {
    const row = this.vazhipadinfo.at(index);
    const vazhipadName = row.get('Vazhipad')?.value;
    const vazhipadId = row.get('Vazhid')?.value;
    const vazhmax = row.get('maxLimit')?.value;
    if (!vazhipadName || !vazhipadId) {
      this.notification.error("Please select the vazhipad")
      return;
    }
    const dialogRef = this.dialog.open(CalendarComponent, {
      width: '850px',
      data: {
        index: index,
        vazhipadName: vazhipadName,
        vazhipadId: vazhipadId,
        currentDate: row.get('VazhipadDate')?.value,
        maxlimit: vazhmax
      }
    });
    dialogRef.afterClosed().subscribe((selectedDate: string) => {

      if (!selectedDate) return;

      row.patchValue({
        VazhipadDate: selectedDate
      });

      this.getAlreadybookedvazhipadQty(index);
    })
  }

  loadRebillData() {
      this.receiptPrintService.getBookingData().subscribe(data => {
    if (data && data.length) {
      // console.log('Received:', data);
      this.loadDataIntoForm(data);
    } else {
      console.warn('No data received');
    }
  });
  }


 loadDataIntoForm(data: any[]) {
  this.vazhipadinfo.clear();

  data.forEach((item: any, index: number) => {
    const row = this.createRow();
    this.vazhipadinfo.push(row);
    this.setupAutocomplete(index);
    this.setupStarAutocomplete(index);
    this.setupDevoteeNameAutocomplete(index);

    // ✅ Patch basic values FIRST
    row.patchValue({
      Vazhipad: item.Vazhipad,
      Name: item.Name,
      Name2: item.Name2,
      Star: item.Star,
      Star2: item.Star2,
      Qty: item.Qty,
      Rate: item.Rate,
      Amount: item.Amount,
      VazhipadDate: item.EvazDate,
      VTime: item.VTime,
      PMid: item.PMId,
      MDay: item.MDay,
      NalBy: item.NalBy,
      Mmonth: item.MMonth
    });

    // 🔥 IMPORTANT: manually trigger selection logic
    this.triggerVazhipadSelection(item.Vazhipad, index);
  });
}
triggerVazhipadSelection(vazhipadValue: string, index: number) {
  const row = this.vazhipadinfo.at(index) as FormGroup;

  let selected;

  if (this.lang === 'en') {
    selected = this.VMList.find(v => v.VM_Name === vazhipadValue);
  } else {
    selected = this.VMList.find(v => v.VM_RName === vazhipadValue);
  }

  if (!selected) {
    // console.warn('Vazhipad not found:', vazhipadValue);
    return;
  }

  //  Set Vazhid
  row.get('Vazhid')?.setValue(selected.VM_Id);

  //  Call same APIs as onSelect
  this.getSeasnalalVazhipadData(selected.VM_Id, index);
  this.getBlockingvazipadDate(selected.VM_Id, index);
  this.getDatamasterdateCheck(selected.VM_Id, index);

  this.fetchVazhipadDetails(selected.VM_Code, index, selected.VM_Id);
}
}
