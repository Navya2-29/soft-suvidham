import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MasterService } from '../../services/master/master.service';

@Component({
  selector: 'app-update-panjankam',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './update-panjankam.component.html',
  styleUrl: './update-panjankam.component.css',
})
export class UpdatePanjankamComponent {
  data: any;
  stars: any[] = [];
  months: any[] = [];
  malayalamMonths: any[] = [];
  thithis: any[] = [];
  constructor(
    public dialogRef: MatDialogRef<UpdatePanjankamComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private masterService: MasterService,
  ) {}
  ngOnInit() {
    this.data = { ...this.dialogData.row };

    this.data.edate = this.formatDate(this.data.edate);

    this.stars = this.dialogData.stars || [];
    this.months = this.dialogData.months || [];

    this.malayalamMonths = Array.from(
      new Map(
        this.stars.filter((x) => x.mmonEng).map((x) => [x.mmonEng, x]),
      ).values(),
    );

    this.thithis = Array.from(
      new Map(
        this.stars.filter((x) => x.ThithiEng).map((x) => [x.ThithiEng, x]),
      ).values(),
    );
  }
  formatDate(date: string) {
  if (!date) return '';

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`; // yyyy-mm-dd
}

  onCancel() {
    this.dialogRef.close();
  }
  onUpdate() {
    const payload = this.buildPayload();

    console.log('Final Payload:', payload);

    this.masterService.updatePanchangam(payload).subscribe({
      next: (res: any) => {
        console.log('Updated successfully');

        this.dialogRef.close(this.data);
      },
      error: (err) => {
        console.error('Update failed', err);
      },
    });
  }

  buildPayload() {
    return {
      Code: this.data.slno,

      edate: this.formatDateToDDMMYYYY(this.data.edate),

      MalDay: this.data.mday,
      MalMonth: this.data.mmon,
      Malyear: this.data.myr,

      Star: this.data.nal,
      Star1: this.data.nal1,

      Thithi: this.data.Thithi,
    };
  }

  formatDateToDDMMYYYY(date: string) {
    if (!date) return '';

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }
}
