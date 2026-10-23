import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [MatDialogActions,  MatDialogTitle, MatDialogContent],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent {
  @ViewChild('okButton') okButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('cancelButton') cancelButton!: ElementRef<HTMLButtonElement>;
constructor(private dialogRef: MatDialogRef<ConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { message: string }){

}



ngAfterViewInit(): void {
  // Set the initial focus on the "OK" button after the view has been initialized
  this.okButton.nativeElement.focus();
}

  onConfirm(): void {
    this.dialogRef.close(true); // Return true if confirmed
  }

  onCancel(): void {
    this.dialogRef.close(false); // Return false if canceled
  }

  handleKeydown(event: KeyboardEvent, button: string): void {
    const okButton = this.okButton.nativeElement;
    const cancelButton = this.cancelButton.nativeElement;

    // Prevent the default browser behavior and stop event propagation
    event.preventDefault();
    event.stopPropagation();

    switch (event.key) {
      case 'ArrowRight': // Move to the next button
        if (button === 'ok') {
          cancelButton.focus();
        }
        break;
      case 'ArrowLeft': // Move to the previous button
        if (button === 'cancel') {
          okButton.focus();
        }
        break;
      case 'Enter': // Activate the focused button and close the dialog
        if (button === 'ok') {
          this.onConfirm();  // Close the dialog with true
        } else if (button === 'cancel') {
          this.onCancel();   // Close the dialog with false
        }
        break;
      default:
        break;
    }
  }

}
