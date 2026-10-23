import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-expiry-notificationpopup',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,

  ],
  templateUrl: './expiry-notificationpopup.component.html',
  styleUrl: './expiry-notificationpopup.component.css'
})
export class ExpiryNotificationpopupComponent {
  expiryDate: string = '';
  constructor(
    private dialogRef: MatDialogRef<ExpiryNotificationpopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expiryDate: string }
  ){
    this.expiryDate = this.formatDate(data.expiryDate);
  }
  
  formatDate(dateStr: string): string {
    const parts = dateStr.split('-'); // ["2025","10","04"]
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // "04-10-2025"
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
