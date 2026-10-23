import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
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
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NumberDirective } from '../../../shared/directives/number/number.directive';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
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
import { ReportService } from '../../Report/service/report.service';

@Component({
  selector: 'app-multidayitems',
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
  ],
  templateUrl: './multidayitems.component.html',
  styleUrl: './multidayitems.component.css',
  providers: [DatePipe],
})
export class MultidayitemsComponent implements OnInit {
  form: FormGroup;
  filteredOptions: Observable<any[]>;
  starData: Observable<any[]>;
  VMList: any[] = [];
  nakshatham: any[];
  nakshthraforfiltering: any[];
  mobileNumber: string = '';
  thithiList: any[] = [];
  prathishtaOptions: any[] = [];
  totalAmount: number = 0;
  tomorrowDate: Date;
  minDate: any;
  amountPerDevotee: number = 0;
  lang: string | null;
  daysList: any[] = [];
  selectedVazhipadItem: any;
  updatedDayList: any[] = [];
  selecteddayalist: any[] = [];
  devotees: FormArray;
  rateChange: string = 'N';
  seasonalDates: { fromDate: any; toDate: any } | null = null;
  allowedDays: any[] = [];
  currentDate = new Date();
  filteredStars: Observable<string[]>[] = [];
  starList: string[] = [];
  formattedDates: any[];
  blockingArray: any[];
  VM_MaxNo: number;
  lifeTimeVazhipad: string = 'N';
  nameStarArray: any[];
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
  allselecteddaylist: any[] = [];
  searchmultidaylist: any[];
  dayList: any[] = [];
  // requiredDaysCount: number = 0;
  @ViewChild('vazhipadInput') vazhipadInput!: ElementRef;
  @ViewChild('rateInput') rateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('prathistaInput') prathistaInput!: ElementRef<HTMLInputElement>;
  @ViewChildren('nameInput') nameInputs!: QueryList<ElementRef>;
  @ViewChildren('starInput') starInputs!: QueryList<ElementRef>;
  @ViewChild('timeInput') timeInput!: ElementRef; // Fix: Define timeInput

  private readonly masterservice = inject(MasterService);
  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private notification: NotificationService,
    public dialogRef: MatDialogRef<MultidayitemsComponent>,
    private datePipe: DatePipe,
    private ts: TranslateService,
    private reportService: ReportService,
    @Inject(MAT_DIALOG_DATA)
    public data: { Name: string; Star: string; MID: string }[],
    private cdr: ChangeDetectorRef,
  ) {
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const formattedDate = this.formatDate(today);
    const formattedTomorrow = this.formatDate(tomorrow);
    this.minDate = formattedDate;
    this.form = this.fb.group({
      Vazhipad: ['', [Validators.required, this.vazhipadValidator.bind(this)]],
      Rate: ['1', Validators.required],
      Qty: ['1', Validators.required],
      NoOfDays: ['1', Validators.required],
      EndDate: [formattedTomorrow, Validators.required],
      Prethista: [''],
      PMid: [''],
      multiName: [''],
      Slno: [''],
      Vazhid: [''],
      Amount: [''],
      VazhipadDate: [formattedDate, [Validators.required]],
      VTime: ['', [Validators.required]],
      Postal: ['10'],
      Mday: [''],
      NalBy: [''],
      Mmonth: [''],
      FromDate: [''],
      SearchBy: [''],
      multiname: [{ disabled: true, value: '' }],
      booking: [{ disabled: true, value: '' }],
      ratechange: [{ disabled: true, value: '' }],
      VM_Receipt: [{ disabled: true, value: '' }],
      lifeTimeVazhipad: [''],
      VM_MaxNo: [0],
      Remarks: [''],
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
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  onStartDateChange(): void {
    const startDateStr = this.form.get('VazhipadDate')?.value;
    const noOfDays = Number(this.form.get('NoOfDays')?.value) || 1;

    if (startDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(startDate);
      if (noOfDays > 1) {
        endDate.setDate(startDate.getDate() + (noOfDays - 1));
      }
      const formattedEnd = this.formatDate(endDate);
      this.form.patchValue({ EndDate: formattedEnd }, { emitEvent: false });
      this.serachmultidayFiltering();

      // this.getmultidayfilterData();
    }
  }

  /** When number of days changes */
  onNoOfDaysChange(): void {
    const startDateStr = this.form.get('VazhipadDate')?.value;
    let noOfDays = this.form.get('NoOfDays')?.value || 1;
    if (noOfDays < 1) noOfDays = 1;
    if (startDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (noOfDays - 1));
      const formattedEnd = this.formatDate(endDate);
      this.form.patchValue(
        { EndDate: formattedEnd, NoOfDays: noOfDays },
        { emitEvent: false },
      );
      // this.getmultidayfilterData();
      this.serachmultidayFiltering();
    }
  }

  /** When end date changes */
  onEndDateChange(): void {
    const startDateStr = this.form.get('VazhipadDate')?.value;
    const endDateStr = this.form.get('EndDate')?.value;
    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      let endDate = new Date(endDateStr);
      if (endDate < startDate) {
        endDate = new Date(startDate);
        this.form.patchValue(
          { EndDate: this.formatDate(endDate) },
          { emitEvent: false },
        );
      }
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      this.form.patchValue({ NoOfDays: diffDays }, { emitEvent: false });
      this.serachmultidayFiltering();
    }
  }

  createDevotee(): FormGroup {
    return this.fb.group({
      Name: ['', [Validators.required]],
      Star: ['', [Validators.required]],
      Name2: [''],
      Star2: [''],
    });
  }

  addDevotee() {
    if (this.lifeTimeVazhipad === 'Y' && this.devotees.length >= 1) {
      this.notification.showError(
        'Only one devotee is allowed for lifetime vazhipad.',
        'Lifetime Vazhipad',
      );
      return;
    }

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
        'Validation Error',
      );
    }
    if (this.form.get('NoOfDays')?.invalid) {
      const errors = this.form.get('NoOfDays')?.errors;
      if (errors?.['required']) {
        this.notification.showError(
          'Number of Days is required',
          'Validation Error',
        );
      }
      if (errors?.['min']) {
        this.notification.showError(
          'Number of Days must be at least 1',
          'Validation Error',
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
          'Validation Error',
        );
      }
    }
  }

  setUpstarAutocomplete() {
    const devoteesArray = this.form.get('devotees') as FormArray;
    devoteesArray.controls.forEach((control, index) => {
      this.filteredStars[index] = control.get('Star')!.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterStar(value || '')),
      );
    });
  }

  private _filterStar(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.nakshatham.filter((star) =>
      star.SM_NameEng.toLowerCase().includes(filterValue),
    );
  }

  removeDevotee(index: number) {
    if (this.devotees.length === 1) {
      this.notification.showError(
        'At least one devotee is required.',
        'Validation Error',
      );
      return;
    }
    this.devotees.removeAt(index);
  }

  ngOnInit() {
    this.setDefaultVazhipadDate();
    this.setInitialEndDate();
    this.getAllvazhipad();
    this.setupAutocomplete();
    this.getNakshthram();
    this.getThithiList();
    this.serachmultidayFiltering();
    this.getMalayalamMonthList();
    this.onDropdownChange();

    this.form
      .get('VazhipadDate')
      ?.valueChanges.subscribe(() => this.onStartDateChange());
    this.form
      .get('NoOfDays')
      ?.valueChanges.subscribe(() => this.onNoOfDaysChange());
    this.form
      .get('EndDate')
      ?.valueChanges.subscribe(() => this.onEndDateChange());
  }

  populateDevotees(data: { Name: string; Star: string; MID: string }[]) {
    this.devotees.clear();
    data.forEach((devotee) => {
      this.devotees.push(
        this.fb.group({
          Name: [devotee.Name || '', [Validators.required]],
          Star: [
            this.getStarIdByName(devotee.Star) || '',
            [Validators.required],
          ],
          Name2: [''],
          Star2: [''],
        }),
      );
    });
  }

  async getStarIdByName(starName: string): Promise<any> {
    const payLoad = { Type: 'ListStar', Code: '' };

    try {
      this.nakshatham = await lastValueFrom(
        this.masterservice.getStarData(payLoad),
      );

      if (!this.nakshatham || !Array.isArray(this.nakshatham)) {
        console.error('Nakshatham data is undefined or not an array');
        return null;
      }

      const foundStar = this.nakshatham.find(
        (star) => star.SM_NameEng === starName,
      );
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

    if (isNumber) {
      filteredList = filteredList.sort((a, b) => {
        const aCode = Number(a.VM_Code);
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
  setInitialEndDate() {
    const startDateStr = this.form.get('VazhipadDate')?.value;
    if (startDateStr) {
      const startDate = new Date(startDateStr);
      const noOfDays = this.form.get('NoOfDays')?.value || 1;
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (noOfDays - 1));
      this.form.patchValue({ EndDate: this.formatDate(endDate) });
    }
  }

  getNakshthram() {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterservice.getStarData(payLoad).subscribe((res) => {
      this.nakshatham = res;
     
      this.nakshthraforfiltering = this.nakshatham.filter(
        (item) => item.id >= 1 && item.id < 29,
      );
      
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
      map((value) => this._filter(value || '')),
    );
  }

  onSelect(event: MatAutocompleteSelectedEvent): void {
    const selectedVazhipad = event.option.value;
    this.form.get('Vazhipad')?.setValue(selectedVazhipad);

    if (this.lang == 'en') {
      this.selectedVazhipadItem = this.VMList.find(
        (item) => item.VM_Name === selectedVazhipad,
      );
    } else if (this.lang != 'en') {
      this.selectedVazhipadItem = this.VMList.find(
        (item) => item.VM_RName === selectedVazhipad,
      );
    }

    if (this.selectedVazhipadItem) {
      this.form.get('Vazhid')?.setValue(this.selectedVazhipadItem.VM_Id);
      const vazhipadCode = this.selectedVazhipadItem.VM_Code;
      this.fetchVazhipadDetails(vazhipadCode);
      this.getBlockingvazipadDate(this.selectedVazhipadItem.VM_Id);
      this.getDatamasterdateCheck(this.selectedVazhipadItem.VM_Id);
    } else {
      console.error('Selected vazhipad item not found in VMList');
    }
  }

  fetchVazhipadDetails(vazhipadcode: string): void {
    this.masterservice
      .getVazhipadeByCode(vazhipadcode)
      .subscribe((res: any) => {
        

        if (res[0].VM_Amt != 0) {
          this.form.get('Rate')?.setValue(res[0].VM_Amt);
        } else {
          this.form.get('Rate')?.setValue('');
        }
        this.form.get('multiName')?.setValue(res[0].VM_MultiName);
        this.form.get('VTime')?.setValue(res[0].VM_Time);
        this.rateChange = res[0].VM_Rate_Change;
        const booking = res[0].VM_Booking;
        const receipt = res[0].VM_Receipt;
        this.VM_MaxNo = res[0].VM_MaxNo;
        this.lifeTimeVazhipad = res[0].LifeTime;
        // if(this.lifeTimeVazhipad == 'Y'){
        //   this.form.get('NoOfDays')?.setValue('5475');
        // }else{
        //   this.form.get('NoOfDays')?.setValue('1');
        // }
        this.form.get('VM_MaxNo')?.setValue(this.VM_MaxNo);
        this.form.get('lifeTimeVazhipad')?.setValue(this.lifeTimeVazhipad);
        this.calculateTotalAmount();
        this.masterservice
          .getVazhipadByCodeForDiety(vazhipadcode)
          .subscribe((data: any) => {
            this.prathishtaOptions = data;
            if (this.prathishtaOptions.length > 0) {
              if (this.lang === 'en') {
                const defaultPrathishta = this.prathishtaOptions[0].PM_Name;
                const defaultPrathishtaId = this.prathishtaOptions[0].PM_ID;
                this.form.get('Prethista')?.setValue(defaultPrathishta);
                this.form.get('PMid')?.setValue(defaultPrathishtaId);
              } else if (this.lang == 'ml') {
                const defaultPrathishta = this.prathishtaOptions[0].PM_RegName;
                const defaultPrathishtaId = this.prathishtaOptions[0].PM_ID;
                this.form.get('Prethista')?.setValue(defaultPrathishta);
                this.form.get('PMid')?.setValue(defaultPrathishtaId);
              }
            }
            this.validateVazhipadDate();
            this.qtyChange();
          });
      });
  }

  calculateTotalAmount() {
    const qty = parseInt(this.form.get('Qty')!.value, 10);
    const rate = parseInt(this.form.get('Rate')!.value, 10);
    const noOfDays = parseInt(this.form.get('NoOfDays')!.value, 10);
    const calculatedQty = qty * noOfDays;
    this.totalAmount = calculatedQty * rate;

    // this.updateTotalAmount();
  }

  updateTotalAmount() {
    const rate = this.form.get('Rate')?.value || 0;
    const qty = this.form.get('Qty')?.value || 0;
    const noOfDays = this.form.get('NoOfDays')?.value || 0;
    const calculatedQty = qty * noOfDays;
    const initialAmount = rate * calculatedQty;
  }

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
          'Error',
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

    // Seasonal date validation
    if (this.seasonalDates) {
      const seasonaldateValidate = this.isDateWithinRange(
        enteredFromDate,
        enteredToDate,
        this.seasonalDates.fromDate,
        this.seasonalDates.toDate,
      );
      if (seasonaldateValidate === false) {
        this.notification.showError(
          `The selected dates are not within the allowed range `,
          'Invalid Dates',
        );
        return; // Stop submission
      }
    }
    // Proceed with form submission if validation passes
    if (this.form.valid && this.devotees.valid) {
      const lifetimeVazhipad = this.form.get('lifeTimeVazhipad')?.value;
      const formValues = this.form.value;
   
      const devoteeArray = formValues.devotees.map((devotee: any) => ({
        Slno: '',
        PMid: formValues.PMid,
        Vazhid: formValues.Vazhid,
        Prethista: formValues.Prethista,
        Vazhipad: formValues.Vazhipad,
        Name: devotee.Name,
        Star: devotee.Star,
        Name2: devotee.Name2,
        Star2: devotee.Star2,
        Qty: formValues.Qty,
        Rate: formValues.Rate,
        Amount: (formValues.Qty * formValues.Rate).toString(),
        TotalAmt: (
          formValues.Qty *
          formValues.Rate *
          formValues.NoOfDays
        ).toString(),
        Postal: '0',
        SearchBy: formValues.SearchBy,
        VazhipadDate: formValues.VazhipadDate,
        Mday: formValues.Mday,
        NalBy: formValues.NalBy,
        Mmonth: formValues.Mmonth,
        VTime: formValues.VTime,
        FromDate: this.multiDayList.length ? this.multiDayList[0].edate1 : null,
        ToDate: this.multiDayList.length
          ? this.multiDayList[this.multiDayList.length - 1].edate1
          : null,
        Remarks: formValues.Remarks,
      }));
      // console.log(devoteeArray, 'devotee array for checking');
      // console.log(this.multiDayList, 'multidaylist ');
      const finalArray: any[] = [];
     
      this.multiDayList.forEach((item: any, dateIndex: number) => {
        const disdate = item.disdate;
        const dateParts = disdate.split('/');
        const formattedDisdate = new Date(
          +dateParts[2],
          +dateParts[1] - 1,
          +dateParts[0],
        );

        devoteeArray.forEach((devotee: any) => {
          if (lifetimeVazhipad === 'Y' && this.multiDayList.length >= 1) {
            if (dateIndex > 0) {
              devotee.Qty = '0';
              devotee.Rate = '0';
              devotee.Amount = '0';
            }
          }

          finalArray.push({ ...devotee, VazhipadDate: formattedDisdate });
        });
      });
      
      const VM_MaxNo = this.VM_MaxNo;
      this.dialogRef.close({
        finalArray,
        VM_MaxNo,
        lifeTimeVazhipad: lifetimeVazhipad,
      });
    } else {
      this.showValidationErrors();
      this.form.markAllAsTouched();
      this.validateDevoteeName();
    }
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
    seasonalToDate: any,
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
    this.dialogRef.close();
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
      },
    });
  }

  getmultidayfilterData() {
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
      const endDate = lastItem.edate1;
      this.form.patchValue({
        FromDate: this.datePipe.transform(firstitem.edate1, 'dd-MM-YYYY'),
      });
    }
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
        (!star || item.nal === star|| item.nal1 === star) && 
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
    this.serachmultidayFiltering();
  }

  validateDevoteeName() {
    const devoteesArray = this.devotees.controls;
    devoteesArray.forEach((devotee, index) => {
      const nameControl = devotee.get('Name');
      if (nameControl?.invalid && nameControl.touched) {
        this.notification.showError(
          `Devotee ${index + 1}- Please enter the Name!`,
          'Name is invalid',
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
    this.updatedDayList[index].selected = this.updatedDayList[index].selected;
    this.multiDayList = this.updatedDayList.filter((item) => item.selected);
    if (this.multiDayList.length > 0) {
      let lastItem = this.multiDayList[this.multiDayList.length - 1];
      let lastDate = lastItem ? lastItem.date : null;
      let firstItem = this.multiDayList[0];
      const endDate = lastItem.edate1;
      this.form.patchValue({
        FromDate: this.datePipe.transform(firstItem.edate1, 'dd-MM-YYYY'),
      });
    }
  }

  validateVazhipadDate() {
    const vazhipadDateControl = this.form.get('VazhipadDate');

    if (!this.updatedDayList || this.updatedDayList.length === 0) {
      vazhipadDateControl?.setErrors(null);
      return;
    }

    this.formattedDates = this.updatedDayList.map((item) => {
      const [day, month, year] = item.disdate.split('/');
      return `${day}-${month}-${year}`;
    });

    let errorMessages: string[] = [];

    if (this.allowedDays && this.allowedDays.length > 0) {
      const invalidDates: { date: string; day: string }[] = [];

      this.formattedDates.forEach((dateStr) => {
        const dayName = this.getDayName(dateStr);

        if (!this.allowedDays.includes(dayName)) {
          invalidDates.push({ date: dateStr, day: dayName });
        }
      });

      if (invalidDates.length > 0) {
        const allowedErrorMessage = `Invalid selection! Only these days are allowed: ${this.allowedDays.join(
          ', ',
        )}`;
        errorMessages.push(allowedErrorMessage);
      }
    }

    if (this.blockingArray && this.blockingArray.length > 0) {
      const blockedDates = this.blockingArray.map((item) => {
        const date = new Date(item.VBDate);
        return date.toLocaleDateString('en-GB').split('/').join('-');
      });

      const blockedConflicts = this.formattedDates.filter((date) =>
        blockedDates.includes(date),
      );

      if (blockedConflicts.length > 0) {
        const blockErrorMessage = `Invalid selection! These dates are blocked: ${blockedConflicts.join(
          ', ',
        )}`;
        errorMessages.push(blockErrorMessage);
      }
    }

    if (errorMessages.length > 0) {
      const finalErrorMessage = errorMessages.join('\n');
      vazhipadDateControl?.setErrors({
        invalidVazhipadDate: finalErrorMessage,
      });

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
        const allowedDays = data.map((item: any) => item.Day);
        this.allowedDays = allowedDays.map(
          (dayId) => this.dayMapping[dayId] || 'Unknown',
        );
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getNameAndStarByMobilenumber() {
    if (this.mobileNumber) {
      const data = {
        mobile: this.mobileNumber,
        member: this.memberDevoteeCheck,
      };
      this.openBillingDialog(this.mobileNumber);
    } else {
      this.notification.showError(
        'Please enter the valid mobile number and try again',
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
      this.nameStarArray = result.selectedData;
      if (result) {
        this.devotees.clear();
        this.nameStarArray.forEach((devotee: any) => {
          this.devotees.push(
            this.fb.group({
              Name: [devotee.Name || '', [Validators.required]],
              Star: [
                this.getStarIdByNames(devotee.Star) || '',
                [Validators.required],
              ],
              Name2: [''],
              Star2: [''],
            }),
          );
        });
      }
    });
  }

  getStarIdByNames(starName: string): number | null {
    const searchField = this.lang == 'en' ? 'SM_NameEng' : 'SM_Name';
    const star = this.nakshatham.find((n) => n[searchField] === starName);
    return star ? star.id : null;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.vazhipadInput.nativeElement.focus();
    }, 300);
  }

  selectText(event: FocusEvent): void {
    const inputField = event.target as HTMLInputElement;
    if (inputField.value.trim().length > 0) {
      setTimeout(() => {
        inputField.select();
      }, 0);
    }
  }

  moveFocus(
    currentInput: HTMLInputElement | HTMLSelectElement,
    nextInput: HTMLInputElement | HTMLSelectElement,
  ): void {
    if (!currentInput.value.trim()) {
      this.notification.showError(`Please enter the value`);
      return;
    }
    if (nextInput) {
      nextInput.focus();
    }
  }

  moveleftarrowFocus(nextInput: HTMLInputElement | HTMLSelectElement): void {
    if (nextInput) {
      nextInput.focus();
    }
  }

  moveFocusToName(index: number): void {
    setTimeout(() => {
      const firstNameInput = this.nameInputs.first;
      if (firstNameInput) {
        firstNameInput.nativeElement.focus();
      }
    }, 0);
  }

  moveFocusToStar(index: number): void {
    setTimeout(() => {
      const starInput = this.starInputs.toArray()[index];
      if (starInput) {
        starInput.nativeElement.focus();
      }
    }, 0);
  }

  handleEnterOnStar(event: Event, index: number): void {
    event.preventDefault();
    if (index === this.devotees.length - 1) {
      this.addDevotee();
      setTimeout(() => {
        this.cdr.detectChanges();

        setTimeout(() => {
          const nameInputsArray = this.nameInputs.toArray();
          const newIndex = nameInputsArray.length - 1;

          if (newIndex >= 0) {
            nameInputsArray[newIndex].nativeElement.focus();
          }
        }, 100); // Extra delay to allow rendering
      }, 0);
    } else {
      this.moveFocusToName(index + 1);
    }
  }

  handleArrowKeys(event: any, index: number, field: string): void {
    event.preventDefault();
    if (event.key === 'ArrowLeft') {
      if (field === 'Name' && index === 0) {
        // Move focus to Time input if the first Name input is focused
        this.moveFocusToTime();
      } else if (field === 'Star') {
        this.moveFocusToName(index);
      } else if (field === 'Name' && index > 0) {
        this.moveFocusToStar(index - 1);
      }
    }

    if (event.key === 'ArrowRight') {
      if (field === 'Name') {
        this.moveFocusToStar(index);
      } else if (field === 'Star' && index < this.devotees.length - 1) {
        this.moveFocusToName(index + 1);
      }
    }

    if (event.key === 'ArrowUp') {
      if (field === 'Name' && index > 0) {
        setTimeout(() => {
          this.nameInputs.toArray()[index - 1].nativeElement.focus();
        }, 0);
      }
    }

    if (event.key === 'ArrowDown' && index < this.nameInputs.length - 1) {
      if (field === 'Name' && index < this.devotees.length - 1) {
        setTimeout(() => {
          this.nameInputs.toArray()[index + 1].nativeElement.focus();
        }, 0);
      }
    }
  }

  moveFocusToTime(): void {
    setTimeout(() => {
      if (this.timeInput) {
        this.timeInput.nativeElement.focus();
      }
    }, 0);
  }

  qtyChange() {
    const maxqty = this.form.get('VM_MaxNo')?.value;
    const pmid = this.form.get('PMid')?.value;
    const vazhId = this.form.get('Vazhid')?.value;
    if (maxqty > 0 && pmid && vazhId) {
      this.validateallvazhipaddatewithqty(this.updatedDayList);
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
              `On ${item.disdate}, only ${available} available. You requested ${userQty}.`,
            );
            return false; // Invalid
          } else {
            item.selected = true;
            item.disabled = false;
            return true; // Valid
          }
        }),
      );
    });

    forkJoin(requests).subscribe((validityResults: boolean[]) => {
      const atLeastOneValid = validityResults.includes(true);

      if (!atLeastOneValid) {
        this.form.get('Qty')?.setErrors({ noValidDates: true });
      } else {
        this.form.get('Qty')?.setErrors(null);
      }
    });
  }

  serachmultidayFiltering() {
    const formattedDate = this.datePipe.transform(
      this.form.get('VazhipadDate')?.value,
      'dd-MM-yyyy',
    );
    const payLoad = {
      ...this.multidayFilterForm.value,
      Type: 'NULL',
      NoofDays: this.form.get('NoOfDays')?.value,
      VazhipadDate: formattedDate,
    };

    this.masterservice.getMultidyaFilterinddata(payLoad).subscribe({
      next: (data: multiDayFilter) => {
        this.dayList = Array.isArray(data) ? data : [data];
        this.searchmultidaylist = Array.isArray(data) ? data : [data];

        this.searchmultidaylist = this.dayList.map((item: any) => ({
          ...item,
          selected: true,
          disabled: false,
        }));
        this.updatedDayList = [...this.searchmultidaylist];
        this.getmultidayfilterData();
      },
    });
  }
  getSelectedDaysCount() {
    return this.updatedDayList.filter((item) => item.selected).length;
  }
  getMalayalamDate(edate1: string): string {
    const match = this.updatedDayList.find((day) => day.edate1 === edate1);
    if (match) {
      return `${match.mday}-${match.mmon}-${match.myr}`;
    }
    return '';
  }
}
