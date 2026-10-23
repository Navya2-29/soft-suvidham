import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { MasterService } from '../../../services/master/master.service';
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})

export class CalendarComponent {

  // Required Properties
  vazhipadName: string = '';
  vazhipadId: number = 0;
  maxLimit: number = 0;
  private availabilityMap = new Map<string, number>();
  malMonth: string = '';
  malYear: string = '';
  private destroy$ = new Subject<void>();
  currentDate: Date = new Date();

  weeks: any[][] = [];
  calendarData: any[] = [];
  availabilityData: any[] = [];
  hoveredDay: any = null;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CalendarComponent>,
    private service: MasterService
  ) {

    this.vazhipadName = data?.vazhipadName || '';
    this.vazhipadId = data?.vazhipadId || 0;
    this.maxLimit = data?.maxlimit || 0;

  }

  ngOnInit(): void {
    this.loadCalendarData();
    this.getVazhipadDetails();
  }

  // ==========================
  // Load API
  // ==========================
  loadCalendarData() {

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;

    const firstDate = this.formatDate(new Date(year, month - 1, 1));
    const lastDate = this.formatDate(new Date(year, month, 0));

    const payload1 = {
      Type: 'Util',
      FromDate: firstDate,
      ToDate: lastDate,
      PMId: month,
      VazhId: year
    };

    const payload2 = {
      Type: 'VazhQty',
      FromDate: firstDate,
      ToDate: lastDate,
      PMId: "0",
      VazhId: this.vazhipadId
    };

    forkJoin({
      cal: this.service.getVazhipadWiseReport(payload1),
      qty: this.service.getVazhipadWiseReport(payload2)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ cal, qty }: any) => {

          this.calendarData = cal || [];
          this.availabilityData = qty || [];

          if (this.calendarData.length > 0) {
            this.malMonth = this.calendarData[0].mmon || '';
            this.malYear = this.calendarData[0].myr || '';
          }

          this.availabilityMap.clear();
          this.availabilityData.forEach((x: any) => {
            const key = x?.VazhiDate?.slice(0, 10);
            if (key) {
              this.availabilityMap.set(key, x.Qty);
            }
          });

          this.generateCalendar();
        },
        error: (err) => console.error(err)
      });
  }

  // ==========================
  // Calendar Generate
  // ==========================
  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    const totalDays = lastDay.getDate();
    this.weeks = [];
    let date = 1;
    let week: any[] = [];
    for (let i = 0; i < startDay; i++) {
      week.push(null);
    }
    while (week.length < 7 && date <= totalDays) {
      week.push(this.createDayObject(date++, month, year));
    }
    this.weeks.push(week);
    while (date <= totalDays) {
      week = [];
      for (let i = 0; i < 7; i++) {
        if (date <= totalDays) {
          week.push(this.createDayObject(date++, month, year));
        } else {
          week.push(null);
        }
      }
      this.weeks.push(week);
    }
  }


  // ==========================
  // Create Day Object
  // ==========================
  createDayObject(date: number, month: number, year: number) {

    const localDate = new Date(year, month, date);

    const yyyy = localDate.getFullYear();
    const mm = String(localDate.getMonth() + 1).padStart(2, '0');
    const dd = String(localDate.getDate()).padStart(2, '0');

    const fullDate = `${yyyy}-${mm}-${dd}`;

    const row = this.calendarData.find(
      (x: any) => x?.edate?.slice(0, 10) === fullDate
    );

    const bookedQty = this.availabilityMap.get(fullDate) ?? 0;

    let availableQty = 0;
    let status = 'gray';

    // Unlimited case
    if (this.maxLimit === 0) {
      status = 'green';
      availableQty = -1;
    }
    else {
      availableQty = this.maxLimit - bookedQty;

      if (availableQty > 0) {
        status = 'green';
      } else {
        status = 'red';
      }
    }

    return {
      date: date,
      naal: row?.nal || '',
      malDate: row?.mday || '',
      thidhi: row?.Thithi || '',
      availableQty: availableQty,
      status: status
    };
  }


  // ==========================
  // Navigation
  // ==========================

  prevMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.loadCalendarData();
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );

    this.loadCalendarData();
  }

  get monthLabel(): string {
    return this.currentDate.toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });
  }

  // ==========================
  // UI Actions
  // ==========================
  close() {
    this.dialogRef.close();
  }

  onHover(day: any) {
    if (day) this.hoveredDay = day;
  }

  onLeave() {
    this.hoveredDay = null;
  }



  // ==========================
  // Utils
  // ==========================
  formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================
  // Select Date
  // ==========================
  selectDate(day: any) {

    if (!day) return;

    //  Allow unlimited selection
    if (this.maxLimit !== 0 && day.availableQty <= 0) return;

    const year = this.currentDate.getFullYear();
    const month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
    const date = String(day.date).padStart(2, '0');

    const selectedDate = `${year}-${month}-${date}`;

    this.dialogRef.close(selectedDate);
  }

  getVazhipadDetails() {
    const payLoad = {
      "Type": "vazhipad",
      "Code": this.vazhipadId
    }
    this.service.getMaster(payLoad).subscribe((data) => {
    })
  }


}
