import { Component, Inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification/notification.service';
@Component({
  selector: 'app-report-online-transaction-popup',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatTableModule,
    MatDialogModule,
    MatSelectModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './report-online-transaction-popup.component.html',
  styleUrl: './report-online-transaction-popup.component.css',
})
export class ReportOnlineTransactionPopupComponent {
  orderId: string;
  headerData: any[] = []; // For top summary table
  vazhipadDetails: any[] = []; // For bottom detail table
  selectedOption: string | null = null;
  orderDetails: any = null;
  status: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ReportOnlineTransactionPopupComponent>,
    private service: MasterService,
    private notification: NotificationService
  ) {
    this.orderId = data.title;
    this.status = data.status;
  }

  ngOnInit(): void {
    this.fetchReportData();
  }

  fetchReportData(): void {
    // this.loading=true;
    const payLoad = {
      Type: 'OnlineOrderDetails',
      Code: this.orderId,
    };
    this.service.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:popup', data);
        this.data = data;

        this.orderDetails = data;
        console.log(this.data);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  dropdownOptions = [
    { value: 'S', label: 'Success' },
    { value: 'F', label: 'Failed' },
    { value: 'N', label: 'Pending' },
  ];

  submitStatus() {
    const payLoad = {
      BillNo: this.orderId,
      PaidStatus: this.status,
    };
    console.log(payLoad, 'payload');
    this.service.updateonlinetrnsactionstatuspaymentmode(payLoad).subscribe({
      next: (data: any) => {
        console.log(data, 'done');
        if (data.RespStatus == 'U') {
          this.notification.showSuccess(
            'Payment status updated successfully',
            'Online Payment status'
          );
          this.fetchReportData();
        } else {
          this.notification.showError(
            'Error in updating payment status please try again',
            'Online Payment status'
          );
        }
      },
      error: (err: any) => {
        this.notification.showError(
          'Error in updating payment status please try again',
          'Online Payment status'
        );

        console.log(err, 'done');
      },
    });
  }

formatDateToDDMMYYYY(dateString: string): string {
  const date = new Date(dateString);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

}
