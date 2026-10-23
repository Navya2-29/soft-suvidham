import { ReportService } from './../service/report.service';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master/master.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    SpinnerComponent,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    MatRadioModule,
  ],
  templateUrl: './report-dashboard.component.html',
  styleUrl: './report-dashboard.component.css',
  providers: [DatePipe],
})
export class ReportDashboardComponent {
  searchForm: FormGroup;
  isloading: boolean = false;
  isSearchPerformed: boolean = false;
  newTab: any;
  today: Date = new Date();
  isChecked: boolean;
  pmaster: any[] = [];
  Vmaster: any[] = [];
  lang: string | null;
  searchQuery: string = '';
  activeSection: string | null = null;

  toggleSection(sectionKey: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    // Accordion: if clicked section is already open, collapse it; otherwise open only this section
    this.activeSection = this.activeSection === sectionKey ? null : sectionKey;
  }

  isSectionOpen(sectionKey: string): boolean {
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      return true; // Auto-expand when searching so user sees matching reports
    }
    return this.activeSection === sectionKey;
  }

  selectReport(option: string): void {
    this.searchForm.get('vazhipadOption')?.setValue(option);
  }

  matchesSearch(text: string): boolean {
    if (!this.searchQuery || !this.searchQuery.trim()) {
      return true;
    }
    const query = this.searchQuery.toLowerCase().trim();
    const translated = this.ts.instant(text) || '';
    return text.toLowerCase().includes(query) || translated.toLowerCase().includes(query);
  }
  constructor(
    private fb: FormBuilder,
    private service: ReportService,
    private router: Router,
    private masterService: MasterService,
    private ts: TranslateService
  ) {
    // console.log(this.today)
    this.searchForm = this.fb.group({
      vazhipadOption: ['Poornam'],
      fromDate: [this.formatDate(this.today)],
      toDate: [this.formatDate(this.today)],
      countercheckbox: [false],
      prathista: [''],
      vazhipad: [''],
    });
    // console.log( this.searchForm.value.countercheckbox," ");
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');

    if (this.lang === 'ml') {
      document.body.classList.add('lang-ml');
    } else {
      document.body.classList.remove('lang-ml');
    }
  }

  radioOptions = [
    { value: 'Poornam', label: 'Report.All Vazhipad List' },
    { value: 'debit', label: 'Report.Debit/Credit Card' },
    { value: 'DailyStmt', label: 'Report.Daily Statement(Transaction)' },
    { value: 'moneyorder', label: 'Report.Money Order' },
    { value: 'DailyStmtDetaild', label: 'Report.Daily Statement (Detailed)' },
    { value: 'cheque', label: 'Report.Cheque Statement' },
    { value: 'AdvanceBook', label: 'Report.Advance Booking' },
    { value: 'credit', label: 'Report.Due/Credit' },
    { value: 'upi', label: 'Report.UPI' },
    { value: 'online', label: 'Report.Online Report' },
    { value: 'offering', label: 'Report.Offering Only' },
    { value: 'cancel', label: 'Report.Vazhipad Cancel' },
    { value: 'nadavaravu', label: 'Report.Nadavaravu Booking' },
    { value: 'nadavaravu-cancel', label: 'Report.Nadavaravu Cancel' },
  ];

  // searchcall
  onSearch() {
    this.isloading = true;
    const searchParams = this.searchForm.value;
    const reportType = searchParams.vazhipadOption;
    const vazhipad = searchParams.vazhipad;
    const prathista = searchParams.prathista;
    const fromDateFormatted = this.formatDate(searchParams.fromDate);
    const toDateFormatted = this.formatDate(searchParams.toDate);
    this.isChecked = searchParams.countercheckbox;
    const payLoad = {
      Type: searchParams.vazhipadOption,
      FromDate: fromDateFormatted,
      ToDate: toDateFormatted,
    };

    // const queryString = `?type=${encodeURIComponent(
    //   payLoad.Type
    // )}&fromDate=${encodeURIComponent(
    //   payLoad.FromDate
    // )}&toDate=${encodeURIComponent(payLoad.ToDate)}`;
    if (prathista && vazhipad) {
      const queryString = `?Prathishta=${encodeURIComponent(
        prathista
      )}&Vazhipad=${encodeURIComponent(vazhipad)}
  &fromDate=${encodeURIComponent(payLoad.FromDate)}&toDate=${encodeURIComponent(
        payLoad.ToDate
      )}`;
      this.getVazhipadwisereprt(queryString);
    } else if (vazhipad) {
      const queryString = `?Vazhipad=${encodeURIComponent(vazhipad)}
  &fromDate=${encodeURIComponent(payLoad.FromDate)}&toDate=${encodeURIComponent(
        payLoad.ToDate
      )}`;
      this.getVazhipadonly(queryString);
    } else if (prathista) {
      const queryString = `?prathista=${encodeURIComponent(prathista)}
  &fromDate=${encodeURIComponent(payLoad.FromDate)}&toDate=${encodeURIComponent(
        payLoad.ToDate
      )}`;
      this.getPrathistaonly(queryString);
    } else {
      const queryString = `?type=${encodeURIComponent(
        payLoad.Type
      )}&fromDate=${encodeURIComponent(
        payLoad.FromDate
      )}&toDate=${encodeURIComponent(payLoad.ToDate)}`;

      if (reportType === 'Poornam') {
        this.newTab = window.open(`#/report-viewer${queryString}`, '_blank');
      } else if (reportType === 'DailyStmtDetaild') {
        this.newTab = window.open(
          `#/report-dailystmnt${queryString}`,
          '_blank'
        );
      } else if (reportType === 'cheque') {
        this.newTab = window.open(`#/report-cheque${queryString}`, '_blank');
      } else if (reportType === 'DailyStmt') {
        this.newTab = window.open(
          `#/report-transaction${queryString}`,
          '_blank'
        );
      } else if (reportType === 'report-counter-trnsaction') {
        this.newTab = window.open(
          `#/report-counter-trnsaction${queryString}`,
          '_blank'
        );
      } else if (reportType === 'searching') {
        this.newTab = window.open(
          `#/report-transaction${queryString}`,
          '_blank'
        );
      } else if (reportType === 'AdvanceBook') {
        this.newTab = window.open(
          `#/report-AdvanceBook${queryString}`,
          '_blank'
        );
      } else if (reportType === 'upi') {
        this.newTab = window.open(`#/report-upi${queryString}`, '_blank');
      } else if (reportType === 'offering') {
        this.newTab = window.open(`#/report-offering${queryString}`, '_blank');
      } else if (reportType === 'credit') {
        this.newTab = window.open(`#/report-credit${queryString}`, '_blank');
      } else if (reportType === 'counter' && this.isChecked === true) {
        this.newTab = window.open(`#/report-counter${queryString}`, '_blank');
      } else if (reportType === 'counter') {
        this.newTab = window.open(
          `#/report-counter-self${queryString}`,
          '_blank'
        );
      } else if (reportType === 'cancel') {
        this.newTab = window.open(`#/report-cancel${queryString}`, '_blank');
      } else if (reportType === 'nadavaravu') {
        this.newTab = window.open(
          `#/report-nadavaravu${queryString}`,
          '_blank'
        );
      } else if (reportType === 'debit') {
        this.newTab = window.open(`#/report-debit${queryString}`, '_blank');
      } else if (reportType === 'nadavaravu-cancel') {
        this.newTab = window.open(
          `#/report-nadavaravu-cancel${queryString}`,
          '_blank'
        );
      } else if (reportType === 'moneyorder') {
        this.newTab = window.open(
          `#/report-moneyorder${queryString}`,
          '_blank'
        );
      } else if (reportType === 'online') {
        this.newTab = window.open(`#/report-online${queryString}`, '_blank');
      } else if (reportType === 'Credit-Collection') {
        this.newTab = window.open(
          `#/report-credit-Collection${queryString}`,
          '_blank'
        );
      } else if (reportType === 'duplicate') {
        this.newTab = window.open(`#/report-duplicate${queryString}`, '_blank');
      } else if (reportType === 'mattinamgal') {
        this.newTab = window.open(
          `#/report-mattinamgal${queryString}`,
          '_blank'
        );
      } else if (reportType === 'feecollection') {
        this.newTab = window.open(
          `#/report-feecollection${queryString}`,
          '_blank'
        );
      } else if (reportType === 'salesitem') {
        this.newTab = window.open(`#/report-salesitem${queryString}`, '_blank');
      } else if (reportType === 'donation') {
        this.newTab = window.open(`#/report-donation${queryString}`, '_blank');
      } else if (reportType === 'devotee-creditcollection') {
        this.newTab = window.open(
          `#/report-devotee-creditcollection${queryString}`,
          '_blank'
        );
      } else if (reportType === 'members-pending-report') {
        this.newTab = window.open(
          `#/members-pending-report${queryString}`,
          '_blank'
        );
      } else if (reportType === 'non-members-pending-report') {
        this.newTab = window.open(
          `#/non-members-pending-report${queryString}`,
          '_blank'
        );
      } else if (reportType === 'vihidham') {
        this.newTab = window.open(`#/report-vihidham${queryString}`, '_blank');
      } else if (reportType === 'billregister') {
        this.newTab = window.open(
          `#/report-billregister${queryString}`,
          '_blank'
        );
      } else if (reportType === 'Dayend') {
        this.newTab = window.open(`#/report-Dayend${queryString}`, '_blank');
      } else if (reportType === 'report-endowment') {
        this.newTab = window.open(`#/report-endowment${queryString}`, '_blank');
      } else if (reportType === 'online-transaction') {
        this.newTab = window.open(
          `#/online-transaction${queryString}`,
          '_blank'
        );
      } else if (reportType === 'datewise') {
        this.newTab = window.open(`#/datewise${queryString}`, '_blank');
      } else if (reportType === 'timeslot') {
        this.newTab = window.open(`#/report-timeslot${queryString}`, '_blank');
      } else if (reportType === 'devoteeledger') {
        this.newTab = window.open(`#/devotee-ledger${queryString}`, '_blank');
      }
      else if (reportType === 'prathistaall') {
        this.newTab = window.open(`#/report-prathistaAll${queryString}`, '_blank');
      }
    }

    if (this.newTab) {
      this.newTab.focus();
      this.isloading = false;
      this.searchForm.patchValue({
        prathista: '',
        vazhipad: '',
      });
    }
  }

  getVazhipadwisereprt(queryString: any) {
    if (queryString) {
      this.newTab = window.open(`#/vazhipadwise${queryString}`, '_blank');
    }
  }
  getVazhipadonly(queryString: any) {
    if (queryString) {
      this.newTab = window.open(
        `#/report-vazhipadonly${queryString}`,
        '_blank'
      );
    }
  }
  getPrathistaonly(queryString:any){
     if(queryString){
      this.newTab = window.open(`#/report-prathistaOnly${queryString}`, '_blank');
    }
  }
  // format date as the dd/mm/yyyy
  formatDate(dateString: any): string {
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
  onBack() {
    this.router.navigate(['/dashboard']);
  }
  ngOnInit() {
    this.getPrathistaList();
    this.getVazhipadList();
  }
  getPrathistaList() {
    this.masterService.getPmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.pmaster = data;

          // console.log(this.pmaster,"prathista");
        }
      },
      error: (error) => {
        console.log(error);
        // this.loading = true;
      },
    });
  }

  onPrathistaChange(event: Event) {
    const selectedPrathista = (event.target as HTMLSelectElement).value;
    // console.log(selectedPrathista,"selected prathista change");

    const prathista = this.getPrathistaNameByCode(selectedPrathista);
    // console.log(prathista,"code prathista");

    this.vazhipadListBasedOnPrathista(prathista);
    // console.log(selectedPrathista);
  }

  getPrathistaNameByCode(id: string): string {
    const prathista = this.pmaster.find((item: any) => item.PM_ID == id);
    if (!prathista) {
      return '';
    }
    return prathista.PM_Code;
  }

  vazhipadListBasedOnPrathista(prathista: any) {
    if (prathista) {
      // console.log(typeof prathista);
      const payLoad = { Type: 'DietywiseVazhipad', Code: prathista };
      this.masterService
        .getVazhipadListBasedOnPrathistaList(payLoad)
        .subscribe((data) => {
          // console.log(data);
          this.Vmaster = data;
          // this.sortVazhipadDetails();
        });
    } else {
      this.getVazhipadList();
    }
  }

  getVazhipadList() {
    this.masterService.getVmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // console.log(data);
          this.Vmaster = data;
          // console.log(this.Vmaster,"data");
        }
      },
      error: (error) => {
        // this.notification.showSuccess('Try after some Time');
      },
    });
  }
}
