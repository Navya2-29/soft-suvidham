import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-cancel-bill-remark',
  standalone: true,
  imports: [CommonModule,MatInputModule,MatDialogModule,FormsModule,MatIconModule,MatButtonModule],
  templateUrl: './cancel-bill-remark.component.html',
  styleUrl: './cancel-bill-remark.component.css'
})
export class CancelBillRemarkComponent {
  cancellationReason:string='';


  constructor(
    public dialogRef: MatDialogRef<CancelBillRemarkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any){}
  onCancel(){
    this.dialogRef.close();
  }


  OnCancelSubmit(){
    if (!this.cancellationReason.trim()) {
      // If the remark is empty, alert the user that it's mandatory
      alert("Please enter a reason for cancellation.");
    } else {
      this.dialogRef.close(this.cancellationReason);  // Passing the reason back to the parent
    }
  }
}
