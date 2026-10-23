import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { MasterService } from '../../../services/master/master.service';
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [MatFormFieldModule,
    MatInputModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  changepasswordForm: FormGroup;
  loginId: string | null;
  storedPassword:string | null;

  constructor(private fb: FormBuilder, private service: MasterService,
    public dialogRef: MatDialogRef<ChangePasswordComponent>,

  ) {
    this.loginId = localStorage.getItem("LoginId")
    this.storedPassword=localStorage.getItem("password");

    this.changepasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required,this.oldPasswordValidator.bind(this)]],
      newPassword: ['', [Validators.required,Validators.minLength(5)]],
      confirmPassword:['',[Validators.required]]
    }, { validator: this.passwordsMatchValidator 
    })
  }

  passwordsMatchValidator(control: AbstractControl) {
    const oldPassword = control.get('oldPassword')?.value;
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (newPassword === oldPassword) {
      return { newPasswordSameAsOld: true };
    }
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {

    if (this.changepasswordForm.invalid) {
      return; 
    }
    const payLoad = {
      "LoginId": this.loginId,
      "password": this.changepasswordForm.get("newPassword")?.value

    }
    this.service.changePassword(payLoad).subscribe({
      next: () => {
        console.log("Password changed successfully");
        this.dialogRef.close(); 
      },
      error: (err) => {
        console.error("Error changing password:", err);
      }
    });
  }


  onReset() {
    // this.changepasswordForm.reset();
    this.dialogRef.close()
  }

  oldPasswordValidator(control: AbstractControl) {
    if (this.storedPassword && control.value !== this.storedPassword) {
      return { incorrectOldPassword: true };
    }
    return null;
  }




}
