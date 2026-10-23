import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../services/master/master.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-couter-popup',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './couter-popup.component.html',
  styleUrl: './couter-popup.component.css',
})
export class CouterPopupComponent {
  counterForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CouterPopupComponent>,
    private masterservice: MasterService,
    private router:Router
  ) {
    // Initialize the form group with validation
    this.counterForm = this.fb.group({
      counterId: ['', [Validators.required, Validators.pattern('^[1-9][0-9]*$')]], // Numeric validation
    });
  }

  get counterId() {
    return this.counterForm.get('counterId');
  }

  save(): void {
    if (this.counterForm.valid) {
     

      this.dialogRef.close(this.counterId?.value);
    } else {
      if (this.counterId?.hasError('pattern')) {
        this.errorMessage = 'Only numeric characters are allowed';
      } else if (this.counterId?.hasError('required')) {
        this.errorMessage = 'Counter ID is required';
      }
    }
  }


  Back(){
   
      localStorage.setItem('loggedIn', 'false');
      localStorage.removeItem('name');
      localStorage.removeItem('Role');
      localStorage.removeItem('alertmsg');
      localStorage.removeItem('LoginId');
      localStorage.removeItem('username');
      localStorage.removeItem('password');
      // if(this.role==='admin'){
        localStorage.removeItem('counterId');
      // }
      this.router.navigate(['/login']);
    this.dialogRef.close()
  }
}
