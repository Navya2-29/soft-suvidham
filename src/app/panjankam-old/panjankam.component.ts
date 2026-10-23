import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../core/layout/header/header.component';
import { MasterService } from '../services/master/master.service';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatDialog } from '@angular/material/dialog';
import { UpdatePanjankamComponent } from '../features/update-panjankam/update-panjankam.component';
@Component({
  selector: 'app-panjankam',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SpinnerComponent],
  templateUrl: './panjankam.component.html',
  styleUrl: './panjankam.component.css',
})
export class PanjankamComponent {
  selectedType: string = 'all';
  displayedColumns: string[] = [];
  data: any[] = [];
  originalData: any[] = [];
  stars: any[] = [];
  selectedStar: string = '';
  language: string = 'en';
  year: string = new Date().getFullYear().toString();
  loading = false;
  selectedMonth: string = '';
  months: any[] = [];
columnLabels: any = {
  day: 'Day',
  edate: 'Date',
  emon: 'Month',
  mday: 'Malayalam Day',
  mmon: 'Malayalam Month',
  myr: 'Malayalam Year',
  Thithi: 'Thithi',
  nal: 'Star',
  nal1: 'Star 2',
  Time: 'Time',
  nazhika: 'Nazhika',
  slno: 'Sl No'
};
showPopup: boolean = false;
selectedRow: any = {};
  constructor(private masterService: MasterService,private dialog: MatDialog) {}

  ngOnInit() {
    this.onTypeChange();
    this.loadStars();
  }

  onTypeChange() {
    let type = '';

    if (this.selectedType === 'all') {
      type = 'MalayalamMonth';
    } else if (this.selectedType === 'rahukalam') {
      type = 'Rahu';
    } else if (this.selectedType === 'gulika') {
      type = 'Gulikan';
    }

    this.loadData(type);
  }

  loadStars() {
    const payload = { Type: 'ListStar', Code: '' };

    this.masterService.getMaster(payload).subscribe((res: any) => {
      this.stars = res || [];
      this.months = Array.from(
        new Map(
          res.filter((x: any) => x.emonthEng).map((x: any) => [x.emonthEng, x]),
        ).values(),
      );
    });
  }

  getStarName(star: any) {
    return this.language === 'ml' ? star.SM_Name : star.SM_NameEng;
  }

  geMonthName(month: any) {
    return this.language === 'ml' ? month.emonth : month.emonthEng;
  }

  loadData(type: string) {
    if (this.originalData.length > 0 && this.selectedType === 'all') {
      this.data = [...this.originalData];
      return;
    }

    const payload = {
      Type: type,
      Code: '',
    };

    this.loading = true;

    this.masterService.getMaster(payload).subscribe({
      next: (res: any) => {
        this.originalData = res || [];
        this.data = [...this.originalData];

        if (type === 'MalayalamMonth') {
          this.displayedColumns = [
            'day',
            'edate',
            'emon',
            'mday',
            'mmon',
            'myr',
            'Thithi',
            'nal',
            'nal1',
            'Time',
            'nazhika',

          ];
        } else {
          this.displayedColumns = ['day', 'Time'];
        }
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  //  LOCAL FILTER (NO API CALL)
  filterData() {
  let filtered = [...this.originalData];

  filtered = filtered.filter((item: any) => {
    const itemDate = new Date(item.edate);

    const yearMatch = this.year
      ? itemDate.getFullYear().toString() === this.year
      : true;

    const monthMatch = this.selectedMonth
      ? (item.emon || '').toUpperCase() === this.selectedMonth.toUpperCase()
      : true;

    const starName = this.getSelectedStarName();

const starMatch = this.selectedStar
  ? [item.nal, item.nal1]
      .filter(Boolean)
      .some(val => val.toUpperCase() === starName.toUpperCase())
  : true;

    return yearMatch && monthMatch && starMatch;
  });

  this.data = filtered;
}

openEdit(item: any) {
  const dialogRef = this.dialog.open(UpdatePanjankamComponent, {
    width: '650px',
    data: {
      row: { ...item },
      stars: this.stars,
      months: this.months
    }
  });

 dialogRef.afterClosed().subscribe(result => {
  if (result) {
    const index = this.data.findIndex(x => x.slno === result.slno);
    if (index !== -1) {
      this.data[index] = result;
    }

    const originalIndex = this.originalData.findIndex(x => x.slno === result.slno);
    if (originalIndex !== -1) {
      this.originalData[originalIndex] = result;
    }
  }
});
}
  getSelectedStarName() {
    const star = this.stars.find((s) => s.id == this.selectedStar);
    return star ? star.SM_NameEng : '';
  }

  reset() {
    this.selectedType = 'all';
    this.year = new Date().getFullYear().toString();
    this.selectedStar = '';

    this.data = [...this.originalData];
  }

}
