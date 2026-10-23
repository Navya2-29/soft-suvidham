import { Component, inject, Inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NumberDirective } from '../../../shared/directives/number/number.directive';
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { AsyncPipe, CommonModule, DatePipe, formatDate } from '@angular/common';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { forkJoin, lastValueFrom, map, Observable, of, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../../services/master/master.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { multiDayFilter } from '../../../models/multidayFilter.model';
import { TranslateService } from '@ngx-translate/core';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
import { BillingViaMobilenumberComponent } from '../billing-via-mobilenumber/billing-via-mobilenumber.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { ReportService } from '../../Report/service/report.service';

@Component({
  selector: 'app-endowment-billing',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    MatAutocompleteModule,
    AsyncPipe,
    UpperCaseDirective,
    FormsModule,
    MatInputModule,
    NumberDirective,
    TranslateModule,
    HeaderComponent,
  ],
  templateUrl: './endowment-billing.component.html',
  styleUrl: './endowment-billing.component.css',
  providers: [DatePipe],
})
export class EndowmentBillingComponent {
  form: FormGroup;
  userForm: FormGroup;
  filteredOptions: Observable<any[]>;
  starData: Observable<any[]>;
  VMList: any[] = [];
  nakshatham: any[];
  mobileNumber: string = '';
  thithiList: any[] = [];
  prathishtaOptions: any[] = [];
  totalAmount: number = 0;
  tomorrowDate: Date;
  role: string | null;

  minDate: any;
  amountPerDevotee: number = 0;
  lang: string | null;
  daysList: any[] = [];
  selectedVazhipadItem: any;
  updatedDayList: any[] = [];
  devotees: FormArray;
  printerLayOut: string | null = '';
  rateChange: string = 'N';
  seasonalDates: { fromDate: any; toDate: any } | null = null;
  allowedDays: any[] = [];
  currentDate = new Date();
  filteredStars: Observable<string[]>[] = [];
  starList: string[] = [];
  formattedDates: any[];
  blockingArray: any[];
  VM_MaxNo: number;
  nameStarArray: any[];
  memeberId: number;
  maxbillnumber: number;
  vazhipadId: number;
  memberList: any[] = [];
  sameDateArray: any[];
  differentDateArray: any[];
  MlayalamDays = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
  ];
  EnglishDays = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    ' 17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    ' 24',
    '25',
    '26',
    '27',
    ' 28',
    ' 29',
    '30',
    '31',
  ];
  malayalamMonthList: any[];
  multidayFilterForm: FormGroup;
  multiDayList: multiDayFilter[] = [];
  updatedmultiDayList: multiDayFilter[] = [];
  memberDevoteeCheck: boolean = false;
  templeName: string | null = '';
  templeAddress: string | null = '';
  searchmultidaylist: any[];
  dayList: any[] = [];
  totalqty: any;
  logo: string | null;
  templeLogoUrl: string = '';
  loginId: string | null = '';
  name: string | null;
  counterId: string | null = '';
  isLockedShow:boolean=false;
  private receiptPrintService = inject(ReceiptPrintService);
  private readonly masterservice = inject(MasterService);
  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private notification: NotificationService,
    private datePipe: DatePipe,
    private ts: TranslateService,
    private reportService: ReportService 
  ) {
    this.lang = localStorage.getItem('Language');
    this.printerLayOut = localStorage.getItem('Printer');
    this.templeName = localStorage.getItem('TempleName');
    this.templeAddress = localStorage.getItem('Address');
    this.logo = localStorage.getItem('Logo');
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('Role');

    if (this.logo) {
      this.templeLogoUrl =
        window.location.origin + `/assets/images/${this.logo}`;
    }
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.loginId = localStorage.getItem('LoginId');
    this.counterId = localStorage.getItem('counterId');
    this.tomorrowDate = new Date();
    this.tomorrowDate.setDate(this.tomorrowDate.getDate() + 1); 
    const formattedDate = this.datePipe.transform(
      this.tomorrowDate,
      'yyyy-MM-dd'
    ); 
    this.minDate = formattedDate;
    this.form = this.fb.group({
      Vazhipad: ['', [Validators.required, this.vazhipadValidator.bind(this)]],
      Rate: ['1', Validators.required],
      Qty: ['1', Validators.required],
      NoOfDays: ['1', Validators.required],
      EndDate: ['', Validators.required],
      Prethista: [''],
      PMid: [''],
      multiName: [''],
      Slno: [''],
      Vazhid: [''],
      Amount: ['0'],
      VazhipadDate: [formattedDate, [Validators.required]],
      VTime: ['0', [Validators.required]],
      Postal: ['10'],
      Mday: [''],
      NalBy: [''],
      Mmonth: [''],
      FromDate: [''],
      SearchBy: [''],
      Remarks: [''],
      multiname: [{ disabled: true, value: '' }],
      booking: [{ disabled: true, value: '' }],
      ratechange: [{ disabled: true, value: '' }],
      VM_Receipt: [{ disabled: true, value: '' }],
      devotees: this.fb.array([this.createDevotee()]),
    });
    this.devotees = this.form.get('devotees') as FormArray;
    this.multidayFilterForm = this.fb.group({
      Star: [''],
      EngMonth: [''],
      MalMonth: [''],
      EngishDay: [''],
      MalDay: [''],
      Thithi: [''],
    });
    this.getmultidayfilterData();
    const today = this.getFormattedDate(new Date());
    this.userForm = this.fb.group({
      BillNo: [''],
      Billdate: [this.convertYyyyDdMmToDdMmYyyy(today), [Validators.required]],
      Mobile: [
        this.mobileNumber,
        [Validators.pattern('^[0-9]{10}$'), Validators.minLength(10)],
      ],
      Address1: [''],
      Address2: [''],
      Address3: [''],
      Email: ['', [Validators.email]],
      Pincode: ['', [Validators.pattern('^[0-9]{6}$')]],
      Userid: [this.loginId],
      CounterId: [this.counterId],
      Trnsmode: ['EN'],
      Instno: [''],
      Instdate: [this.convertYyyyDdMmToDdMmYyyy(today)],
      InstBank: [''],
      Memberid: [''],
      PaidStatus: ['Y'],
    });
  }

  createDevotee(): FormGroup {
    return this.fb.group({
      Name: ['', [Validators.required]],
      Star: ['', [Validators.required]],
      Name2: [''],
      Star2: [''],
    });
  }

  private getFormattedDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en');
  }

  addDevotee() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.validateDevoteeName();
      this.showValidationErrors();
      return;
    }

    const lastDevotee = this.devotees.at(this.devotees.length - 1) as FormGroup;
    if (lastDevotee.invalid) {
      this.showDevoteeValidationErrors(lastDevotee);
      return;
    }
    this.devotees.push(this.createDevotee());
  }

  private showValidationErrors() {
    if (this.form.get('VazhipadDate')?.invalid) {
      this.notification.showError('Enter a valid date', 'Validation Error');
    }
    if (this.form.get('Rate')?.invalid) {
      this.notification.showError('Enter a valid Rate', 'Validation Error');
    }

    if (this.form.get('Vazhipad')?.invalid) {
      this.notification.showError(
        'Please enter the Vazhipad',
        'Validation Error'
      );
    }
    if (this.form.get('NoOfDays')?.invalid) {
      const errors = this.form.get('NoOfDays')?.errors;
      if (errors?.['required']) {
        this.notification.showError(
          'Number of Days is required',
          'Validation Error'
        );
      }
      if (errors?.['min']) {
        this.notification.showError(
          'Number of Days must be at least 1',
          'Validation Error'
        );
      }
    }
  }

  private showDevoteeValidationErrors(devotee: FormGroup): void {
    const controls = devotee.controls;
    for (const key in controls) {
      if (
        controls[key].invalid &&
        (controls[key].touched || controls[key].dirty)
      ) {
        this.notification.showError(
          `Validation error in ${key}: `,
          'Validation Error'
        );
      }
    }
  }


  setUpstarAutocomplete() {
    const devoteesArray = this.form.get('devotees') as FormArray;
    devoteesArray.controls.forEach((control, index) => {
      this.filteredStars[index] = control.get('Star')!.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterStar(value || ''))
      );
    });
  }

  private _filterStar(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.nakshatham.filter((star) =>
      star.SM_NameEng.toLowerCase().includes(filterValue)
    );
  }

  removeDevotee(index: number) {
    if (this.devotees.length === 1) {
      this.notification.showError(
        'At least one devotee is required.',
        'Validation Error'
      );
      return;
    }
    this.devotees.removeAt(index);
  }

  ngOnInit() {
    this.getEndowmentBillNumber();
    this.setDefaultVazhipadDate();
    this.getAllvazhipad();
    this.getDevoteeMaster();
    this.setupAutocomplete();
    this.getNakshthram();
    this.getThithiList();
    this.serachmultidayFiltering();
    // this.getmultidayfilterData();
    this.getMalayalamMonthList();
    this.onDropdownChange();
    this.form.get('VazhipadDate')?.valueChanges.subscribe((value) => {
      // this.getmultidayfilterData();
      this.serachmultidayFiltering();
    });
    this.form.get('NoOfDays')?.valueChanges.subscribe((value) => {
      // this.getmultidayfilterData();
      this.serachmultidayFiltering();
    });
  }

  serachmultidayFiltering() {
    const formattedDate = this.datePipe.transform(
      this.form.get('VazhipadDate')?.value,
      'dd-MM-yyyy'
    );
    const payLoad = {
      ...this.multidayFilterForm.value,
      Type: 'NULL',
      NoofDays: this.form.get('NoOfDays')?.value,
      VazhipadDate: formattedDate,
    };

    console.log(payLoad, 'multiday filter console');

    this.masterservice.getMultidyaFilterinddata(payLoad).subscribe({
      next: (data: multiDayFilter) => {
        // console.log(data, 'multiday filtering check first');
        this.dayList = Array.isArray(data) ? data : [data];
        this.searchmultidaylist = Array.isArray(data) ? data : [data];
        // console.log(this.updatedDayList);
        // this.multiDayList = Array.isArray(data) ? data : [data];

        this.searchmultidaylist = this.dayList.map((item: any) => ({
          ...item,
          selected: true, // Set the initial value to true for all dates
          disabled: false,
        }));
        this.updatedDayList = [...this.searchmultidaylist];
        this.getmultidayfilterData();
        // console.log(this.updatedDayList,"updated list to validate qty");
        // if(this.form.get('Vazhid')?.value && this.form.get('PMid')?.value && +this.form.get('VM_MaxNo')?.value>0 ){
        // this.validateallvazhipaddatewithqty(this.updatedDayList);
        // }
        // this.getmultidayfilterData()
      },
    });
  }

  populateDevotees(data: { Name: string; Star: string; MID: string,Name2?:string,Star2?:string }[]) {
    this.devotees.clear(); 
    data.forEach((devotee) => {
      this.devotees.push(
        this.fb.group({
          Name: [devotee.Name || '', [Validators.required]],
          Star: [
            this.getStarIdByName(devotee.Star) || '',
            [Validators.required],
          ],
          Name2: [devotee.Name2 || ''], // Optional fields
          Star2: [this.getStarIdByName(devotee.Star2?devotee.Star2:"") || '',],
        })
      );
    });

    // If MID needs to be stored separately, assuming all have same MID:
    // if (data.length > 0) {
    //   this.form.patchValue({ PMid: data[0].MID });
    // }
  }

  async getStarIdByName(starName: string): Promise<any> {
    // console.log(starName, 'star nameeeee');

    const payLoad = { Type: 'ListStar', Code: '' };

    try {
      this.nakshatham = await lastValueFrom(
        this.masterservice.getStarData(payLoad)
      );
      // console.log(this.nakshatham, 'Nakshathram data loaded');

      if (!this.nakshatham || !Array.isArray(this.nakshatham)) {
        // console.error('Nakshatham data is undefined or not an array');
        return null;
      }

      const foundStar = this.nakshatham.find(
        (star) => star.SM_NameEng === starName
      );
      // console.log(foundStar, 'data checking star');
      // console.log(foundStar.id, 'ccccccccccccccccccc');
      return foundStar ? foundStar.Id : null;
    } catch (error) {
      console.error('Error fetching Nakshathram data:', error);
      return null;
    }
  }
  getThithiList() {
    const payLoad = { Type: 'Thithi', code: '' };
    this.masterservice.getThithilist(payLoad).subscribe((res: any) => {
      this.thithiList = res;
      console.log(this.thithiList);
    });
  }

  onDropdownChange() {
    this.multidayFilterForm
      .get('EngishDay')
      ?.valueChanges.subscribe((value) => {
        if (value !== '') {
          this.multidayFilterForm.patchValue({
            MalDay: '',
            Thithi: '',
            MalMonth: '',
          });
        }
      });
    this.multidayFilterForm.get('MalDay')?.valueChanges.subscribe((value) => {
      if (value !== '') {
        this.multidayFilterForm.patchValue({ EngishDay: '', Thithi: '' });
      }
    });
    this.multidayFilterForm.get('Star')?.valueChanges.subscribe((value) => {
      if (value !== '') {
        this.multidayFilterForm.patchValue({ Thithi: '' });
      }
    });
    this.multidayFilterForm.get('EngMonth')?.valueChanges.subscribe((value) => {
      if (value !== '') {
        this.multidayFilterForm.patchValue({ Thithi: '' });
      }
    });
    this.multidayFilterForm.get('MalMonth')?.valueChanges.subscribe((value) => {
      if (value !== '') {
        this.multidayFilterForm.patchValue({ EngishDay: '' });
      }
    });

    this.multidayFilterForm.get('Thithi')?.valueChanges.subscribe((value) => {
      if (value !== '') {
        this.multidayFilterForm.patchValue({
          Star: '',
          EngMonth: '',

          EngishDay: '',
          MalDay: '',
        });
      }
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

  setDefaultVazhipadDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = this.datePipe.transform(tomorrow, 'yyyy-MM-dd');
    this.form.get('VazhipadDate')?.setValue(formattedDate);
  }

  getNakshthram() {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterservice.getStarData(payLoad).subscribe((res) => {
      this.nakshatham = res;
      console.log(this.nakshatham);
    });
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
  }

  setupAutocomplete() {
    this.filteredOptions = this.form.get('Vazhipad')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  // onSelectStar(index: number, event: MatAutocompleteSelectedEvent): void {
  //   const selectedStar = event.option.value;
  //   const devoteesArray = this.form.get('devotees') as FormArray;
  //   devoteesArray.at(index).get('Star')?.setValue(selectedStar);
  // }

  onSelect(event: MatAutocompleteSelectedEvent): void {
    const selectedVazhipad = event.option.value;
    this.form.get('Vazhipad')?.setValue(selectedVazhipad);

    if (this.lang == 'en') {
      this.selectedVazhipadItem = this.VMList.find(
        (item) => item.VM_Name === selectedVazhipad
      );
    } else if (this.lang == 'ml') {
      this.selectedVazhipadItem = this.VMList.find(
        (item) => item.VM_RName === selectedVazhipad
      );
    }

    // console.log(this.selectedVazhipadItem);
    this.getVazhipadDetails(this.selectedVazhipadItem);
    // if (this.selectedVazhipadItem) {
    //   console.log(this.selectedVazhipadItem);
    //   this.form.get('Vazhid')?.setValue(this.selectedVazhipadItem.VM_Id);
    //   const vazhipadCode = this.selectedVazhipadItem.VM_Code;
    //   console.log(vazhipadCode);
    //   this.fetchVazhipadDetails(vazhipadCode);
    //   this.getBlockingvazipadDate(this.selectedVazhipadItem.VM_Id);
    //   this.getDatamasterdateCheck(this.selectedVazhipadItem.VM_Id)
    // } else {
    //   console.error('Selected vazhipad item not found in VMList');
    // }
  }

  getVazhipadDetails(selectedVazhipadItem: any) {
    if (selectedVazhipadItem) {
      console.log(selectedVazhipadItem);
      this.form.get('Vazhid')?.setValue(selectedVazhipadItem.VM_Id);
      const vazhipadCode = selectedVazhipadItem.VM_Code;
      console.log(vazhipadCode);
      this.fetchVazhipadDetails(vazhipadCode);
      this.getBlockingvazipadDate(selectedVazhipadItem.VM_Id);
      this.getDatamasterdateCheck(selectedVazhipadItem.VM_Id);
    } else {
      console.error('Selected vazhipad item not found in VMList');
    }
  }

  fetchVazhipadDetails(vazhipadcode: string): void {
    this.masterservice
      .getVazhipadeByCode(vazhipadcode)
      .subscribe((res: any) => {
        console.log(res, 'vazhipad details');
        if (res[0].VM_Amt != 0) {
          this.form.get('Rate')?.setValue(res[0].VM_Amt);
        } else {
          this.form.get('Rate')?.setValue('');
        }
        this.form.get('multiName')?.setValue(res[0].VM_MultiName);
        this.form.get('VTime')?.setValue(res[0].VM_Time);
        // this.form.get('VM_MaxNo')?.setValue(res[0].VM_MaxNo);
        this.rateChange = res[0].VM_Rate_Change;
        const booking = res[0].VM_Booking;
        const receipt = res[0].VM_Receipt;
        this.VM_MaxNo = res[0].VM_MaxNo;
        console.log(this.VM_MaxNo, 'vVM_MaxNo value');
        // if(this.VM_MaxNo>0){
        //   this.form.get("NoOfDays")?.setValue(this.VM_MaxNo);
        // }else{
        //   this.calculateTotalAmount();
        // }

        this.masterservice
          .getVazhipadByCodeForDiety(vazhipadcode)
          .subscribe((data: any) => {
            this.prathishtaOptions = data;
            console.log(this.prathishtaOptions);
            if (this.prathishtaOptions.length > 0) {
              if (this.lang === 'en') {
                const defaultPrathishta = this.prathishtaOptions[0].PM_Name;
                const defaultPrathishtaId = this.prathishtaOptions[0].PM_ID;
                console.log(this.prathishtaOptions[0].PM_Name);
                this.form.get('Prethista')?.setValue(defaultPrathishta);
                this.form.get('PMid')?.setValue(defaultPrathishtaId);
              } else if (this.lang == 'ml') {
                const defaultPrathishta = this.prathishtaOptions[0].PM_RegName;
                const defaultPrathishtaId = this.prathishtaOptions[0].PM_ID;
                console.log(this.prathishtaOptions[0].PM_RegName);
                this.form.get('Prethista')?.setValue(defaultPrathishta);
                this.form.get('PMid')?.setValue(defaultPrathishtaId);
              }
            }
            this.validateVazhipadDate();
            this.qtyChange();
          });
      });
  }

  qtyChange() {
    const maxqty = this.form.get('VM_MaxNo')?.value;
    const pmid = this.form.get('PMid')?.value;
    const vazhId = this.form.get('Vazhid')?.value;
    if (maxqty > 0 && pmid && vazhId) {
      this.validateallvazhipaddatewithqty(this.updatedDayList);
    }
  }
  // calculateTotalAmount() {
  //   const qty = parseInt(this.form.get('Qty')!.value, 10);
  //   const rate = parseInt(this.form.get('Rate')!.value, 10);
  //   const noOfDays = parseInt(this.form.get('NoOfDays')!.value, 10);
  //   const calculatedQty = qty * noOfDays;
  //   this.totalAmount = calculatedQty * rate;
  //   this.updateTotalAmount();
  // }

  // updateTotalAmount() {
  //   const rate = this.form.get('Rate')?.value || 0;
  //   const qty = this.form.get('Qty')?.value || 0;
  //   const noOfDays = this.form.get('NoOfDays')?.value || 0;
  //   const calculatedQty = qty * noOfDays;
  //   const initialAmount = rate * calculatedQty;
  // }

  onSubmit() {
    const vid = this.form.get('Vazhid')?.value;

    this.masterservice.getSeasonalVazhipadDateCheck(vid).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.seasonalDates = {
            fromDate: data[0].VS_FromDate,
            toDate: data[0].VS_ToDate,
          };
        } else {
          this.seasonalDates = null;
        }

        this.validateAndSubmit();
      },
      error: (err) => {
        console.error('Error fetching seasonal dates:', err);
        this.notification.showError(
          'Failed to validate seasonal dates. Please try again later.',
          'Error'
        );
      },
    });
  }

  convertWithDatePipe(dateString: string): string {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); 
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  validateAndSubmit() {
    const enteredFromDate = this.form.get('VazhipadDate')?.value;
    const enteredToDate = this.form.get('EndDate')?.value;
    if (this.seasonalDates) {
      const seasonaldateValidate = this.isDateWithinRange(
        enteredFromDate,
        enteredToDate,
        this.seasonalDates.fromDate,
        this.seasonalDates.toDate
      );
      if (seasonaldateValidate === false) {
        this.notification.showError(
          `The selected dates are not within the allowed range `,
          'Invalid Dates'
        );
        return; 
      }
    }
   
    if (this.form.valid && this.devotees.valid) {
      const formValues = this.form.value;
      this.totalqty =
        formValues.Qty * this.multiDayList.length * formValues.devotees.length;
      const devoteeArray = formValues.devotees.map((devotee: any) => ({
        Slno: '',
        PMid: formValues.PMid,
        Vazhid: formValues.Vazhid.toString(),
        Prethista: formValues.Prethista,
        Vazhipad: formValues.Vazhipad,
        Name: devotee.Name,
        Star: devotee.Star.toString(),
        Name2: devotee.Name2,
        Star2: devotee.Star2,
        Qty: formValues.Qty,
        Rate: formValues.Rate.toString(),
        Amount: (formValues.Qty * formValues.Rate).toString(),
        TotalAmt: (
          formValues.Qty *
          formValues.Rate *
          formValues.NoOfDays
        ).toString(),
        Postal: '0',
        VazhipadDate: this.formatToDDMMYYYY(formValues.VazhipadDate),
        Mday: formValues.Mday,
        NalBy: formValues.NalBy,
        Mmonth: formValues.Mmonth,
        VTime: formValues.VTime,
        FromDate: this.convertWithDatePipe(formValues.FromDate),
        ToDate: this.convertWithDatePipe(formValues.EndDate),
        SearchBy: formValues.SearchBy,
        Remarks: '',
      }));

      const finalArray: any[] = [];
      this.multiDayList.forEach((item: any) => {
        const disdate = item.disdate;
        const dateParts = disdate.split('/');
        const formattedDisdate = new Date(
          +dateParts[2],
          +dateParts[1] - 1,
          +dateParts[0]
        );

        devoteeArray.forEach((devotee: any) => {
          finalArray.push({ ...devotee, VazhipadDate: formattedDisdate });
        });
      });
      const formattedData = finalArray.map((item) => ({
        ...item,
        VazhipadDate: this.formatToDDMMYYYY(item.VazhipadDate),
        Amount: '0',
        TotalAmt: '0',
      }));

      this.sendToapi(formattedData, this.userForm.value);
      const VM_MaxNo = this.VM_MaxNo;
    } else {
      this.showValidationErrors();
      this.form.markAllAsTouched();
      this.validateDevoteeName();
    }
  }

  convertYyyyDdMmToDdMmYyyy(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  }
  sendToapi(vazhipadinfo: any, userDetails: any) {
    const payLoad = {
      ...userDetails,
      vazhipadinfo: vazhipadinfo,
    };
    this.onSubmitBookingDetailsApiCall(payLoad);
  }

  formatToDDMMYYYY(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  formatToDDMMYYYYDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  isDateWithinRange(
    enteredFromDate: any,
    enteredToDate: any,
    seasonalFromDate: any,
    seasonalToDate: any
  ): boolean {
    const seasonalFromDates = this.formatToDDMMYYYY(seasonalFromDate);
    const seasonalToDates = this.formatToDDMMYYYY(seasonalToDate);
    const enteredFromDates = this.formatToDDMMYYYY(enteredFromDate);

    const [day, month, year] = enteredToDate.split('-').map(Number);
    const endDate = new Date(year, month - 1, day);
    const enteredToDates = this.formatToDDMMYYYYDate(endDate);

    return (
      enteredFromDates >= seasonalFromDates &&
      enteredToDates <= seasonalToDates &&
      enteredFromDates <= enteredToDates
    );
  }

  cancel() {
    // this.dialogRef.close();
  }

  vazhipadtime = [
    { id: '0', key: 'TIME1' },
    { id: '1', key: 'TIME2' },
    { id: '2', key: 'TIME3' },
    { id: '3', key: 'TIME4' },
  ];

  getMalayalamMonthList() {
    const payLoad = { Type: 'MalMonth', code: '' };
    this.masterservice.getMalayalamMonthList(payLoad).subscribe({
      next: (data) => {
        this.malayalamMonthList = data;
        console.log(this.malayalamMonthList);
      },
    });
  }

  getmultidayfilterData() {
    // const engMonth = this.multidayFilterForm.get('EngMonth')?.value;
    // const malMonth = this.multidayFilterForm.get('MalMonth')?.value;
    // const star = this.multidayFilterForm.get('Star')?.value;
    // const englishday = this.multidayFilterForm.get('EngishDay')?.value;
    // const malday = this.multidayFilterForm.get('MalDay')?.value;
    // const thithi = this.multidayFilterForm.get('Thithi')?.value;
    // this.form.patchValue({
    //   Mday: engMonth,
    //   NalBy: star,
    //   Mmonth: malMonth,
    //   SearchBy: thithi
    // });
    // console.log(englishday);
    // let type: string | null = null;

    // if (star && englishday && !engMonth && !malMonth && !malday && !thithi) {
    //   type = 'EDayStar';
    // } else if (
    //   star &&
    //   malday &&
    //   malMonth &&
    //   !engMonth &&
    //   !englishday &&
    //   !thithi
    // ) {
    //   type = 'StarMDayMDate';
    // } else if (
    //   star &&
    //   engMonth &&
    //   !malMonth &&
    //   !englishday &&
    //   !malday &&
    //   !thithi
    // ) {
    //   type = 'StarDay';
    // } else if (
    //   star &&
    //   !engMonth &&
    //   !malMonth &&
    //   !englishday &&
    //   !malday &&
    //   !thithi
    // ) {
    //   type = 'Star';
    // } else if (
    //   malMonth &&
    //   star &&
    //   !engMonth &&
    //   !englishday &&
    //   !malday &&
    //   !thithi
    // ) {
    //   type = 'MalStar';
    // } else if (
    //   malMonth &&
    //   star &&
    //   engMonth &&
    //   !englishday &&
    //   !malday &&
    //   !thithi
    // ) {
    //   type = 'Both';
    // } else if (
    //   star &&
    //   malday &&
    //   !engMonth &&
    //   !malMonth &&
    //   !englishday &&
    //   !thithi
    // ) {
    //   type = 'MDaystar';
    // } else if (
    //   star &&
    //   engMonth &&
    //   englishday &&
    //   !malMonth &&
    //   !malday &&
    //   !thithi
    // ) {
    //   type = 'StarDayEngDate';
    // } else if (
    //   malMonth &&
    //   !star &&
    //   !engMonth &&
    //   !englishday &&
    //   !malday &&
    //   !thithi
    // ) {
    //   type = 'MalMonth';
    // } else if (
    //   malMonth &&
    //   engMonth &&
    //   !star &&
    //   !englishday &&
    //   !malday &&
    //   !thithi
    // ) {
    //   type = 'MalEng';
    // } else if (
    //   malday &&
    //   malMonth &&
    //   !star &&
    //   !engMonth &&
    //   !englishday &&
    //   !thithi
    // ) {
    //   type = 'MDayMDate';
    // } else if (
    //   malday &&
    //   malMonth &&
    //   engMonth &&
    //   !star &&
    //   !englishday &&
    //   !thithi
    // ) {
    //   type = 'MDayMDateEDay';
    // } else if (
    //   engMonth &&
    //   !star &&
    //   !malMonth &&
    //   !englishday &&
    //   !malday &&
    //   !thithi
    // ) {
    //   type = 'EngDay';
    // } else if (engMonth && englishday) {
    //   type = 'DayEngDate';
    // } else if (
    //   englishday &&
    //   !star &&
    //   !engMonth &&
    //   !malMonth &&
    //   !malday &&
    //   !thithi
    // ) {
    //   type = 'EngDate';
    // }else if (
    //   thithi &&
    //   malMonth &&
    //   !star &&
    //   !engMonth &&
    //   !englishday &&
    //   !malday
    // ) {
    //   type = 'MalThithi';
    // }
    // else if (
    //   thithi &&
    //   !star &&
    //   !engMonth &&
    //   !malMonth &&
    //   !englishday &&
    //   !malday
    // ) {
    //   type = 'Thithi';
    // } else if (
    //   !thithi &&
    //   star &&
    //   engMonth &&
    //   !malMonth &&
    //   !englishday &&
    //   malday
    // ) {
    //   type = 'StarDayMDate';
    // } else if (
    //   !thithi &&
    //   !star &&
    //   engMonth &&
    //   !malMonth &&
    //   !englishday &&
    //   malday
    // ) {
    //   type = 'DayMDate';
    // } else if (
    //   !thithi &&
    //   !star &&
    //   !engMonth &&
    //   !malMonth &&
    //   !englishday &&
    //   malday
    // ) {
    //   type = 'MDate';
    // } else {
    //   type = 'NULL';
    // }

    // const formattedDate = this.datePipe.transform(
    //   this.form.get('VazhipadDate')?.value,
    //   'dd-MM-yyyy'
    // );
    // const payLoad = {
    //   ...this.multidayFilterForm.value,
    //   Type: "NULL",
    //   NoofDays: this.form.get('NoOfDays')?.value,
    //   VazhipadDate: formattedDate,
    // };

    // console.log(payLoad, "multiday filter console");

    // this.masterservice.getMultidyaFilterinddata(payLoad).subscribe({
    //   next: (data: multiDayFilter) => {
    //     console.log(data,"multiday filtering check first");
    //     this.dayList = Array.isArray(data) ? data : [data];
    //     this.updatedDayList = Array.isArray(data) ? data : [data];
    //     console.log(this.updatedDayList);
    //     // this.multiDayList = Array.isArray(data) ? data : [data];

    // this.updatedDayList = this.dayList.map((item: any) => ({
    //   ...item,
    //   selected: true, // Set the initial value to true for all dates
    //   disabled:false
    // }));
    // console.log(this.updatedDayList,"updated list to validate qty");
    if (
      this.form.get('Vazhid')?.value &&
      this.form.get('PMid')?.value &&
      +this.form.get('VM_MaxNo')?.value > 0
    ) {
      this.validateallvazhipaddatewithqty(this.updatedDayList);
    }

    this.multiDayList = [...this.updatedDayList];
    
    this.validateVazhipadDate();
    //finding end date
    if (this.multiDayList.length > 0) {
      let lastItem = this.multiDayList[this.multiDayList.length - 1];
      let firstitem = this.multiDayList[0];
      // let lastDate = lastItem ? lastItem.date : null;
      const endDate = lastItem.edate1;
      this.form.patchValue({
        EndDate: this.datePipe.transform(endDate, 'dd-MM-YYYY'),
        FromDate: this.datePipe.transform(firstitem.edate1, 'dd-MM-YYYY'),
      });

      // const firstValidItem = this.multiDayList.find(
      //   item => item.selected
      // );

      // if (firstValidItem) {
      //   this.form.patchValue({
      //     FromDate: this.datePipe.transform(firstValidItem.edate1, 'dd-MM-yyyy')
      //   });
      // }

      // console.log('Last Date:', endDate);
      // console.log(this.form.get('VazhipadDate'))
    }
    //   },
    // });
  }

  onSearchClick() {
    const engMonth = this.multidayFilterForm.get('EngMonth')?.value;
    const malMonth = this.multidayFilterForm.get('MalMonth')?.value;
    const star = this.multidayFilterForm.get('Star')?.value;
    const englishday = this.multidayFilterForm.get('EngishDay')?.value;
    const malday = this.multidayFilterForm.get('MalDay')?.value;
    const thithi = this.multidayFilterForm.get('Thithi')?.value;
    this.form.patchValue({
      Mday: engMonth,
      NalBy: star,
      Mmonth: malMonth,
      SearchBy: thithi,
    });

    this.updatedDayList = this.searchmultidaylist.filter((item) => {
      return (
        (!star || item.nal === star) &&
        (!malMonth || item.mmon === malMonth) &&
        (!engMonth || item.day === engMonth) &&
        (!malday || item.mday === malday) &&
        (!englishday || item.Eday == englishday) &&
        (!thithi || item.Thithi === thithi)
      );
    });
    this.getmultidayfilterData();
  }

  onCancelClick() {
    this.multidayFilterForm.patchValue({
      Star: '',
      EngMonth: '',
      MalMonth: '',
      EngishDay: '',
      MalDay: '',
      Thithi: '',
    });
    // this.getmultidayfilterData();
    // console.log('Filters have been cleared and the form reset.');
  }

  validateDevoteeName() {
    const devoteesArray = this.devotees.controls;
    devoteesArray.forEach((devotee, index) => {
      const nameControl = devotee.get('Name');
      if (nameControl?.invalid && nameControl.touched) {
        this.notification.showError(
          `Devotee ${index + 1}- Please enter the Name!`,
          'Name is invalid'
        );
      }
    });
  }

  vazhipadValidator(control: AbstractControl): ValidationErrors | null {
    const vazhipad = control.value;
    var vmExists;
    if (this.lang === 'en') {
      vmExists = this.VMList.some((vm) => vm.VM_Name === vazhipad);
    } else if (this.lang == 'ml') {
      vmExists = this.VMList.some((vm) => vm.VM_RName === vazhipad);
    }

    if (!vmExists) {
      return { invalidVazhipad: true };
    }
    return null;
  }

  onCheckboxChange(index: number): void {
    // console.log(index,"index");
    // console.log(this.updatedDayList,"updated list");
    // console.log( this.updatedDayList[index].selected ,"selected")
    // console.log(!this.updatedDayList[index].selected,"not selected");
    this.updatedDayList[index].selected = this.updatedDayList[index].selected;
    // this.allselecteddaylist=[...this.updatedDayList];
    // console.log(this.allselecteddaylist, "All selected day list to show in array");
    // this.updatedDayList = [...this.updatedDayList];
    this.multiDayList = this.updatedDayList.filter((item) => item.selected);
    // this.updatedDayList = [...this.updatedDayList];
    if (this.multiDayList.length > 0) {
      let lastItem = this.multiDayList[this.multiDayList.length - 1];
      let lastDate = lastItem ? lastItem.date : null;
      let firstItem = this.multiDayList[0];
      const endDate = lastItem.edate1;
      this.form.patchValue({
        EndDate: this.datePipe.transform(endDate, 'dd-MM-YYYY'),
        FromDate: this.datePipe.transform(firstItem.edate1, 'dd-MM-YYYY'),

        // VazhipadDate: firstItem.edate1
      });
      // console.log('Last Date:', endDate);
    }
  }

  validateVazhipadDate() {
    const vazhipadDateControl = this.form.get('VazhipadDate');

    if (!this.updatedDayList || this.updatedDayList.length === 0) {
      // console.log('No dates found to validate.');
      vazhipadDateControl?.setErrors(null);
      return;
    }

    // Convert selected dates to dd-mm-yyyy format
    this.formattedDates = this.updatedDayList.map((item) => {
      const [day, month, year] = item.disdate.split('/');
      return `${day}-${month}-${year}`;
    });

    // console.log('Formatted Selected Dates:', this.formattedDates);

    let errorMessages: string[] = [];

    // / Step 1: Validate Against Allowed Days ***/
    if (this.allowedDays && this.allowedDays.length > 0) {
      const invalidDates: { date: string; day: string }[] = [];

      this.formattedDates.forEach((dateStr) => {
        const dayName = this.getDayName(dateStr);
        // console.log(`Date: ${dateStr} - Day: ${dayName}`);

        if (!this.allowedDays.includes(dayName)) {
          invalidDates.push({ date: dateStr, day: dayName });
        }
      });

      if (invalidDates.length > 0) {
        const allowedErrorMessage = `Invalid selection! Only these days are allowed: ${this.allowedDays.join(
          ', '
        )}`;
        errorMessages.push(allowedErrorMessage);
      }
    }

    /***  Step 2: Validate Against Blocked Dates ***/
    if (this.blockingArray && this.blockingArray.length > 0) {
      const blockedDates = this.blockingArray.map((item) => {
        const date = new Date(item.VBDate);
        return date.toLocaleDateString('en-GB').split('/').join('-'); // Converts to dd-mm-yyyy
      });

      // console.log('Blocked Dates:', blockedDates);

      const blockedConflicts = this.formattedDates.filter((date) =>
        blockedDates.includes(date)
      );

      if (blockedConflicts.length > 0) {
        const blockErrorMessage = `Invalid selection! These dates are blocked: ${blockedConflicts.join(
          ', '
        )}`;
        errorMessages.push(blockErrorMessage);
      }
    }

    /***  Step 3: Show Errors or Clear Validation ***/
    if (errorMessages.length > 0) {
      const finalErrorMessage = errorMessages.join('\n');
      vazhipadDateControl?.setErrors({
        invalidVazhipadDate: finalErrorMessage,
      });

      // Show Toastr error message
      this.notification.showError(finalErrorMessage, 'Validation Error');
    } else {
      vazhipadDateControl?.setErrors(null);
    }
  }

  getDayName(dateStr: string): string {
    const [day, month, year] = dateStr.split('-');
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { weekday: 'long' }); 
  }

  private dayMapping: { [key: number]: string } = {
    1: 'Sunday',
    2: 'Monday',
    3: 'Tuesday',
    4: 'Wednesday',
    5: 'Thursday',
    6: 'Friday',
    7: 'Saturday',
  };

  getBlockingvazipadDate(vmId: any) {
    const payLoad = { Type: 'BlockingALL', Code: vmId };
    this.masterservice.getMaster(payLoad).subscribe({
      next: (data) => {
        this.blockingArray = data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getDatamasterdateCheck(vid: string) {
    this.masterservice.getDayMastervazhipaddateCheck(vid).subscribe({
      next: (data) => {
        // console.log(data, 'day master');
        // this.dayArray
        // console.log(data, 'day master');
        const allowedDays = data.map((item: any) => item.Day);
        this.allowedDays = allowedDays.map(
          (dayId) => this.dayMapping[dayId] || 'Unknown'
        );
        // console.log('Allowed Days (IDs):', allowedDays);
        // console.log('Allowed Days (Names):', this.allowedDays);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getNameAndStarByMobilenumber() {
    // console.log(this.mobileNumber, 'mobile number data');

    // console.log(this.memberDevoteeCheck, 'dsssssssssssssss');
    if (this.mobileNumber) {
      // this.masterService.getMaster
      //  this.customerdetailsForBillingForm.patchValue({
      //    Mobile:this.mobileNumber
      //  })
      const data = {
        mobile: this.mobileNumber,
        member: this.memberDevoteeCheck,
      };
      //  this.receiptPrinrservice.setMobileNumber(data);
      // console.log('Mobile number sent:', this.mobileNumber);
      this.openBillingDialog(this.mobileNumber);
    } else {
      this.notification.showError(
        'Please enter the valid mobile number and try again'
      );
    }
  }

  openBillingDialog(mobileNumber: any) {
    const data = {
      mobile: mobileNumber,
      member: this.memberDevoteeCheck,
    };
    const dialogRef = this.dialog.open(BillingViaMobilenumberComponent, {
      width: '600px',
      data: data,
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe((result) => {
      // console.log('Selected Rows:', result);
      this.nameStarArray = result.selectedData;
      if (result) {
        // console.log(this.nameStarArray, 'checking name star data');
        this.memeberId = this.nameStarArray[0].MID;
        this.vazhipadId = this.nameStarArray[0].VazhId;
        this.userForm.patchValue({
          Memberid: this.memeberId.toString(),
        });
        this.devotees.clear();
        this.nameStarArray.forEach((devotee: any) => {
          this.devotees.push(
            this.fb.group({
              Name: [devotee.Name || '', [Validators.required]],
              Star: [
                this.getStarIdByNames(devotee.Star) || '',
                [Validators.required],
              ],
              Name2: [''], // Optional fields
              Star2: [''],
            })
          );
        });

        if (this.lang == 'en') {
          let matchedVm = this.VMList.find(
            (item) => item.VM_Id == this.vazhipadId
          );
          this.form.patchValue({
            Vazhipad: matchedVm ? matchedVm.VM_Name : '',
          });
          this.getVazhipadDetails(matchedVm);
        } else if (this.lang == 'ml') {
          let matchedVm = this.VMList.find(
            (item) => item.VM_Id == this.vazhipadId
          );
          this.form.patchValue({
            Vazhipad: matchedVm ? matchedVm.VM_RName : '',
          });

          this.getVazhipadDetails(matchedVm);
        }
        this.userForm.patchValue({
          Mobile: this.mobileNumber.toString(),
        });

        this.setAddressField();
        // console.log(this.mobileNumber, 'data mobile');
      }
    });
  }

  getStarIdByNames(starName: string): number | null {
    const searchField = this.lang == 'en' ? 'SM_NameEng' : 'SM_Name';

    const star = this.nakshatham.find((n) => n[searchField] === starName);
    return star ? star.id : null; // Return ID if found, otherwise return null
  }

  getEndowmentBillNumber() {
    const payLoad = {
      Type: 'MaxBillnoEndowment',
      Code: '',
    };
    this.masterservice.getMaster(payLoad).subscribe({
      next: (data) => {
        // console.log(data, 'bill number for the endowment');

        this.maxbillnumber = data[0].billno;
        if(this.maxbillnumber!=null){
          this.isLockedShow=false;
        this.userForm.patchValue({
          BillNo:
            'EN' +
            this.maxbillnumber.toString() +
            '/' +
            this.getCurrentDateMMYY(),
        });
      }else{
        this.isLockedShow=true;
      }

      },
      error: (err) => {
        this.notification.showError('Failed to getting billnumber');
      },
    });
  }
  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }

  submitEndowmentBillData(updatedData: any) {
    // console.log("updated data ",updatedData)
    // const billPayLoad={
    //    Type:"MaxBillnoEndowment",
    //     Code:""
    // }
    //  this.masterservice.getMaster(billPayLoad).subscribe((data) => {
    //       console.log(data, 'ffrfrere');
    //       if (data[0].billno) {
    //         this.maxbillnumber=data[0].billno
    //       const maxbillNumber = 'EN'+data[0].billno.toString()+'/'+this.getCurrentDateMMYY()
    //         updatedData.BillNo = maxbillNumber
    //         console.log(updatedData, 'after add bill number');
    //         const payLoad = {
    //           Type: 'EndowmentBillLock',
    //           Code: this.counterId + 'Lock',
    //         };
    //         console.log(payLoad);
    //         this.masterservice.getMaster(payLoad).subscribe((data) => {
    //           console.log(data, 'locked billapi reposnse');
    //           this.onSubmitBookingDetailsApiCall(updatedData);
    //         });
    //       } else {
    //         this.retryFetchBillNumber(updatedData);
    //       }
    //     });
  }

  // retryFetchBillNumber(updatedData: any, retryCount = 0) {
  //   if (retryCount >= 3) {
  //     this.notification.showError(
  //       'Unable to fetch a unique bill number. Please contact support.'
  //     );
  //     return;
  //   }

  //   setTimeout(() => {
  //     this.submitEndowmentBillData(updatedData);
  //   }, 2000); // Retry after 2 seconds
  // }

  onSubmitBookingDetailsApiCall(formattedData: any) {
    // console.log(formattedData,"test vazhipad");
      this.masterservice
        .vazhipadBooking(formattedData)
        .subscribe((res: any) => {
          if (res) {
            // console.log(res, 'endowment billing');
            if (res.RespStatus === 'I') {
              // this.masterservice
              //   .updateLastEndowmentBillNumber(this.maxbillnumber + 1)
              //   .subscribe({
              //     next: (data) => {
              //       if (data) {
              //         this.userForm.patchValue({
              //           BillNo:
              //             'EN' +
              //             (this.maxbillnumber + 1).toString() +
              //             '/' +
              //             this.getCurrentDateMMYY(),
              //         });
              //       }
              //     },
              //     error: (err) => {},
              //   });
              const billDetails = res.BillNo;
              formattedData.BillNo = billDetails;
              this.isLockedShow=false;
              // this.receiptPrintService.setReceiptData(formattedData);
              this.printendowmentReciept(formattedData);
              this.getEndowmentBillNumber();
              // this.receiptPrintService.setBooleanValue(true);
              this.notification.showSuccess(res.RespMsg);
              this.resetForm();
              // this.masterservice.getLastBillNumber().subscribe({
              //   next: (lastbillno) => {
              // const lastBillNumber = lastbillno[0].billno;
              // const currentBillnumber = lastBillNumber + 1;
              // console.log(currentBillnumber)
              // this.masterservice
              //   .updateLastBillNumber(this.lockTableLastbillNumber+1)
              //   .subscribe({
              //     next: (data) => {
                    // this.eventService.notifytheupdateLastbillnumber();
              //     },
              //     error: (err) => {},
              //   });

              // this.isDataSaved = true;
            }
          } else {
            this.notification.showError(
              'Please check your connection and try agin'
            );
          }
        });
  }

  resetForm() {
    const formattedDate = this.datePipe.transform(
      this.tomorrowDate,
      'yyyy-MM-dd'
    );
    this.form.reset({
      Vazhipad: '',
      Rate: '1',
      Qty: '1',
      NoOfDays: '1',
      EndDate: '',
      Prethista: '',
      PMid: '',
      multiName: '',
      // devotees: this.fb.array([]),
      Slno: '',
      Vazhid: '',
      Amount: '0',
      VazhipadDate: formattedDate,
      VTime: '0',
      Postal: '10',
      Mday: '',
      NalBy: '',
      Mmonth: '',
      FromDate: '',
      SearchBy: '',
      multiname: [{ disabled: true, value: '' }],
      booking: [{ disabled: true, value: '' }],
      ratechange: [{ disabled: true, value: '' }],
      VM_Receipt: [{ disabled: true, value: '' }],
      // VM_MaxNo:[],
      devotees: this.fb.array([this.createDevotee()]),
    });
    this.devotees.clear();
this.devotees.push(this.createDevotee());
    this.devotees = this.form.get('devotees') as FormArray;
    this.multidayFilterForm = this.fb.group({
      Star: [''],
      EngMonth: [''],
      MalMonth: [''],
      EngishDay: [''],
      MalDay: [''],
      Thithi: [''],
    });
    this.serachmultidayFiltering();
    const today = this.getFormattedDate(new Date());
    this.userForm = this.fb.group({
      BillNo: '',
      Billdate: this.convertYyyyDdMmToDdMmYyyy(today),
      Mobile: this.mobileNumber,
      Address1: '',
      Address2: '',
      Address3: '',
      Email: '',
      Pincode: '',
      Userid: this.loginId,
      CounterId: this.counterId,
      Trnsmode: 'EN',
      Instno: '',
      Instdate: this.convertYyyyDdMmToDdMmYyyy(today),
      InstBank: '',
      Memberid: '',
      PaidStatus: 'Y',
    });
    this.mobileNumber = '';
  }
  getDevoteeMaster() {
    const payLoad = {
      Type: 'DevoteeMaster',
      Code: '',
    };
    this.masterservice.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data, 'get member details');
        this.memberList = data;
        // this.filteredPmaster=data;
      },
    });
  }
  setAddressField() {
    const matchItem = this.memberList.find(
      (item) => item.MID == this.memeberId
    );
    this.userForm.patchValue({
      Address1: matchItem ? matchItem.Address : '',
    });
  }

  printendowmentReciept(data: any) {
    if (this.printerLayOut == 'laser') {
      this.printReceipts(data);
    } else if (this.printerLayOut == 'inkJet') {
      this.printReceiptsinkJet(data);
    } else if (this.printerLayOut == 'thermal') {
      this.printReceiptsThermal(data);
    } else if (this.printerLayOut == 'dotMetrix') {
      this.printReceiptsDotmetrix(data);
    } else if (this.printerLayOut == 'lasera5') {
      this.laserReciptPrinter(data);
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
      {}
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
        0
      );

      // Prepare the rows for each item in the group
      const vazhipadRows = items
        .map(
          (item: any) => `
        <tr>
          <td>${item.Name || 'N/A'}<br /><span>${item.Name2 || ' '}</span></td>
          <td>${this.getStarbyId(item.Star)}<br/><span>${this.getStarbyId(
            item.Star2
          )}</span></td>
          <td>${item.VazhipadDate || 'N/A'}</td>
          <td>${item.Qty || '0'}</td>
          <td>${item.Rate || '0'}</td>
          <td>${item.Amount || '0'}</td>
        </tr>`
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
                  2
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
                  Trnsmode
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
      {}
    );

    let allReceiptsContent = '';
    const prathistaVazhipadDateKeys = Object.keys(
      groupedByPrathistaVazhipadDate
    );

    // Loop through grouped data
    for (let i = 0; i < prathistaVazhipadDateKeys.length; i++) {
      const key = prathistaVazhipadDateKeys[i];
      const items = groupedByPrathistaVazhipadDate[key];
      const [prathista, vazhipad, vazhipadDate] = key.split('-');

      // Calculate the total amount for the group
      const totalAmount = items.reduce(
        (total: number, item: any) => total + parseFloat(item.Amount || '0'),
        0
      );

      // Prepare the rows for each item in the group
      const vazhipadRows = items
        .map(
          (item: any) => `
        <tr>
          <td>${item.Name || 'N/A'}<br /><span>${item.Name2 || ' '}</span></td>
          <td>${this.getStarbyId(item.Star)}<br/><span>${this.getStarbyId(
            item.Star2
          )}</span></td>
          <td>${item.Qty || '0'}</td>
          <td>${item.Rate || '0'}</td>
          <td>${item.Amount || '0'}</td>
        </tr>`
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
              2
            )}</strong></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 20px;">
        <strong>വഴിപാട് തീയതികൾ:  ${Array.from(
          new Set(items.map((item: any) => item.VazhipadDate || 'N/A'))
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

  printReceiptsThermal(data: any) {
    const imageUrl = window.location.origin + '/assets/images/temple-logo.png';
    const { BillNo, Billdate, vazhipadinfo, Trnsmode } = data;
    this.differentDateArray = [];
    vazhipadinfo.forEach((item: any) => {
      this.differentDateArray.push(item);
    });

    console.log('Same Date Array:', this.sameDateArray);
    console.log('Different Date Array:', this.differentDateArray);

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
              Rate: '',
              VTime: '',
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
          return acc;
        },
        {}
      );

      const maxRowsPerPage = 4; // Maximum rows per page
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
          <div style="text-align: center;"><img src="${imageUrl}" alt="logo" style="width: 60px; height: 60px;align-item:center;"/></div>
            <div class="receipt-header">${this.templeName}</div>
            <div class="receipt-sub-header">${this.templeAddress}</div>
            <hr>
            <div class="receipt-content receipt-contentbill">Bill Date: ${Billdate}</div>
            <div class="receipt-content">Bill No: ${BillNo}</div>
            <div class="receipt-content">Prathista: ${prathista}</div>
            <div class="receipt-content">Vazhipad: ${vazhipad}</div>
        `;

          page.forEach((item: any) => {
            const amount = item.Qty * item.Rate;
            grandTotalAmount += amount;
            receiptContent += `
            <div class="receipt-content">Name: ${item.Name}</div>
            ${
              item.Name2
                ? `<div class="receipt-content">Name2: ${item.Name2}</div>`
                : ''
            }
            <div class="receipt-content">Star: ${this.getStarbyId(
              item.Star
            )}</div>
            ${
              item.Star2
                ? `<div class="receipt-content">Star2: ${this.getStarbyId(
                    item.Star2
                  )}</div>`
                : ''
            }
          `;
          });

          // Add grand total and other details
          receiptContent += `
            <div class="receipt-rq">Rate: ${group.rate}</div>
            <div class="receipt-rq">Total Qty: ${this.totalqty}</div>
            <div class="receipt-total">Total Amount: 0.00(Endowment)</div>
            
            <div class="receipt-content-vd">Vazhipad Date: 
              ${
                fromDate !== toDate
                  ? `${this.convertYyyyDdMmToDdMmYyyy(
                      fromDate
                    )} to ${this.convertYyyyDdMmToDdMmYyyy(toDate)}`
                  : `${this.convertYyyyDdMmToDdMmYyyy(fromDate)}`
              }
            </div>
             ${
               group?.VTime
                 ? `
    <div class="receipt-content-vd">Vazhipad Time: 
      ${this.getTimeForBill(group.VTime)}
    </div>
  `
                 : ''
             }
           
            <div>
             ${
               group.thithi
                 ? `<div class="receipt-footer">Thithi : ${group.thithi}</div>`
                 : ''
             }

            ${
              group.nalBy
                ? `<div class="receipt-footer">- ${group.nalBy}</div>`
                : ''
            }
            ${
              group.mday
                ? `<div class="receipt-footer">- ${group.mday}</div>`
                : ''
            }
            ${
              group.mmonth
                ? `<div class="receipt-footer">- ${group.mmonth}</div>`
                : ''
            }</div>
            <div class="receipt-footer-ut">
              User: ${this.name} 
            </div>
             <div class="receipt-footer-ut">
              Payment Mode:  ${this.getTransactionType(Trnsmode)}, ${
            Trnsmode == 'CR' ? 'Not Paid' : ''
          }
            </div>
            <div class="receipt-footer-ut">
              Counter:${this.counterId}
            </div>
           <div><p>www.cubixsystems.com</p></div>
          </div> <!-- Close receipt-page -->
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
              font-size: 8pt;
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
              font-family:arial;
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
            this.resetForm();
          }, 500); // small delay to ensure image is loaded
        };
      }
    }
  }

  printReceiptsDotmetrix(data: any) {
    // console.log(data, 'dot metrix checkingkkkkkk');
    const { BillNo, Billdate, vazhipadinfo, Trnsmode } = data;
    this.differentDateArray = [];
    vazhipadinfo.forEach((item: any) => {
      this.differentDateArray.push(item);
    });

    // console.log('Same Date Array:', this.sameDateArray);
    // console.log('Different Date Array:', this.differentDateArray);

    if (this.differentDateArray.length > 0) {
      // Group data by Prathista, Vazhipad, and From Date
      const groupedData = this.differentDateArray.reduce(
        (acc: any, item: any) => {
          const key = `${item.Prethista}@${item.Name}@${item.Star}@${item.FromDate}@${item.ToDate}`;
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
          acc[key].uniqueNames.add(item.Vazhipad);

          // Check if NalBy, Mday, or Thithi has data and store it
          if (item.NalBy) acc[key].nalBy = item.NalBy;
          if (item.Mday) acc[key].mday = item.Mday;
          if (item.SearchBy) acc[key].thithi = item.SearchBy;
          if (item.Mmonth) acc[key].mmonth = item.Mmonth;

          return acc;
        },
        {}
      );

      const maxRowsPerPage = 5;
      let allReceiptsContent = '';

      Object.keys(groupedData).forEach((key) => {
        const group = groupedData[key];
        const [prathista, name, star, fromDate, toDate] = key.split('@');
        const items = group.items;
        let grandTotalAmount = 0;
        const nameGroupedItems = items.reduce((nameAcc: any, item: any) => {
          if (!nameAcc[item.Vazhipad]) {
            nameAcc[item.Vazhipad] = {
              ...item,
              Qty: 0,
            };
          }
          nameAcc[item.Vazhipad].Qty += parseInt(item.Qty, 10);
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
          <!-- Prathista -->
          <div style="position: absolute; left: 1.5cm; top: 3.5cm; max-width: 8cm; font-size:9pt; white-space: pre-wrap; word-wrap: break-word;">${BillNo}</div>
          <!-- Vazhipad -->
          <div style="position: absolute; left: 1.5cm; top: 4cm; max-width: 5cm;font-size:9pt; white-space: pre-wrap;">${name}</div>
          <!-- Bill date Date -->
          <div style="position: absolute; left: 6.7cm; top: 4cm; max-width: 5cm;font-size:9pt; white-space: pre-wrap;">${this.getStarbyId(
             star
           )}</div>
          <div style="position: absolute;  left: 10.4cm; top: 3.5cm;font-size:9pt;">${Billdate}</div>
          <!-- bill Number -->
          <div style="position: absolute; left: 10.4cm; top: 4cm;font-size:9pt;max-width: 4.5cm; font-size:9pt; white-space: pre-wrap; word-wrap: break-word;"> ${prathista}</div>
           <!-- vazhipad date -->
         <div style="position: absolute; left: 2.8cm; top: 9.3cm;font-size:9pt;">
  ${
    fromDate != toDate
      ? `${this.convertYyyyDdMmToDdMmYyyy(
          fromDate
        )} to ${this.convertYyyyDdMmToDdMmYyyy(toDate)}`
      : `${this.convertYyyyDdMmToDdMmYyyy(fromDate)}`
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
 <div style="position: absolute; left: 2cm; top: 8.2cm;font-size:8pt">User:${
   this.name
 }(Endowment)</div>
          `;
          page.forEach((item: any, rowIndex: number) => {
            let rowTop = 5.2 + rowIndex * 0.5;
            const amount = item.Qty * item.Rate;
            grandTotalAmount += amount;
            receiptContent += `
            <div style="position: absolute; left: 1cm; font-size:9pt;font-weight:bold; top: ${rowTop}cm; max-width: 5.5cm; white-space: pre-wrap; word-wrap: break-word;"><div style="margin-top:0px;padding-top:0px;margin-bottom:0px;padding-bottom:0px;" >${
              item.Vazhipad
            }</div>${
              item.Name2
                ? `<div style="margin-top:0px;padding-top:0px;margin-bottom:0px;padding-bottom:5px;">Name2:(${item.Name2})</div>`
                : ''
            }
            ${
              item.Star2
                ? `<div style="margin-top: 0.1mm;">Star2:${this.getStarbyId(
                    item.Star2
                  )}</div>`
                : ''
            }
         ${
           item.Remarks && item.Remarks.toString().trim() !== ''
             ? `<div style="margin-top:0px;padding-top:0px;margin-bottom:0px;padding-bottom:5px;">Remark:${item.Remarks}</div>`
             : ''
         }
          </div>
          <div style="position: absolute; left: 9.3cm; font-size:9pt; top: ${rowTop}cm;">${
              item.Qty
            }</div>
          <div style="position: absolute; left: 10.5cm;font-size:9pt; top: ${rowTop}cm;">${
              item.Rate
            }</div>
          <div style="position: absolute; left: 11.8cm; font-size:9pt;top: ${rowTop}cm;">${amount}</div>
         
        `;
          });
          // receiptContent += `</div>`; // Close receipt page
          // allReceiptsContent += receiptContent;

          // Add grand total at the end of the page VTime
          // const grandTotalTop = 5 + page.length * 0.7 + 1; // Position it below the last row
          // <div style="position: absolute; left: 2cm; top: 8.7cm; font-weight: bold; font-size: 8pt;">
          //  ${this.numbertowordpipe.transform(grandTotalAmount)} <span> Rupees</span>
          // </div>
          receiptContent += `
      <div style="position: absolute; left: 11cm; top: 8.3cm; font-weight: bold; font-size: 12pt;">
         0.00
      </div>
      
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

  laserReciptPrinter(data: any) {
    console.log(data, 'laser print checking');
    const { BillNo, Billdate, vazhipadinfo, Trnsmode } = data;
    this.differentDateArray = [];
    vazhipadinfo.forEach((item: any) => {
      this.differentDateArray.push(item);
    });

    console.log('Same Date Array:', this.sameDateArray);
    console.log('Different Date Array:', this.differentDateArray);

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
        {}
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
                    ? `${this.convertYyyyDdMmToDdMmYyyy(
                        fromDate
                      )} to ${this.convertYyyyDdMmToDdMmYyyy(toDate)}`
                    : `${this.convertYyyyDdMmToDdMmYyyy(fromDate)}`
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
                  2
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

  getTransactionType(transmode: string): string {
    console.log(transmode);
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

  getTimeForBill(time: string) {
    switch (time) {
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

  validateallvazhipaddatewithqty(updatedDayList: any[]) {
    const userQty = +this.form.get('Qty')?.value;
    const maxqty = +this.form.get('VM_MaxNo')?.value;
    const pmid = this.form.get('PMid')?.value;
    const vazhId = this.form.get('Vazhid')?.value;

    // If maxqty is 0, consider all dates valid, skip validation
    if (maxqty === 0) {
      updatedDayList.forEach((item) => {
        item.selected = true;
        item.disabled = false;
      });
      this.form.get('Qty')?.setErrors(null);
      this.form.get('OTM')?.setErrors(null);
      return;
    }

    const requests = updatedDayList.map((item) => {
      const edate1 = item.edate1;
      const payLoad = {
        Type: 'VazhipadLimit',
        FromDate: edate1,
        ToDate: edate1,
        PMId: pmid,
        VazhId: vazhId,
      };

      return this.reportService.getVazhipadWiseReport(payLoad).pipe(
        map((res: any) => {
          const alreadyBookedQty = res[0]?.qty ?? 0;
          const totalRequested = userQty + alreadyBookedQty;

          if (totalRequested > maxqty) {
            item.selected = false;
            item.disabled = true;

            const available = maxqty - alreadyBookedQty;
            this.notification.showError(
              `On ${item.disdate}, only ${available} available. You requested ${userQty}.`
            );
            return false; // Invalid
          } else {
            item.selected = true;
            item.disabled = false;
            return true; // Valid
          }
        })
      );
    });

    forkJoin(requests).subscribe((validityResults: boolean[]) => {
      const atLeastOneValid = validityResults.includes(true);

      if (!atLeastOneValid) {
        this.form.get('Qty')?.setErrors({ noValidDates: true });
        // this.form.get('OTM')?.setErrors({ noValidDates: true });
      } else {
        this.form.get('Qty')?.setErrors(null);
        // this.form.get('OTM')?.setErrors(null);
      }
    });
  }

   vazhipadUnblocking() {
    console.log('aaa');

    const payLoad = {
      Type: 'UnLockEndowment',
      code: '',
    };
    this.masterservice.getMaster(payLoad).subscribe({
      next: (data) => {
        if (data) {
          this.notification.showSuccess('Bill number unlocked successfully');
          this.getEndowmentBillNumber();
        }
      },
      error: (err) => {
        this.notification.showError(
          'Check your Network connection and try again'
        );
      },
    });
  }
}
