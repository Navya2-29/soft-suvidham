import { Component, inject, ViewChild } from '@angular/core';
import { HeaderComponent } from '../layout/header/header.component';
import { SpinnerComponent } from '../../shared/component/spinner/spinner.component';
import { Router, TitleStrategy } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../services/master/master.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Settings } from '../../models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    HeaderComponent,
    SpinnerComponent,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  settingsForm: FormGroup;
  loading: boolean = false;
  templeName: string | null;
  templeDetails: Settings | null = null;
  billType: string = '';
  @ViewChild('fileInput') fileInput: any;
  imagePreview: string | ArrayBuffer | null = null;
  errorMessage: string = '';
  fileInputMessageFlag: boolean = true;

  private formBuilder = inject(FormBuilder);
  private masterService = inject(MasterService);
  private notification = inject(ToastrService);
  constructor(private router: Router) {
    this.templeName = localStorage.getItem('TempleName');
    this.settingsForm = this.formBuilder.group({
      templeName: ['', Validators.required],
      templeAddress: ['', Validators.required],
      language: ['', Validators.required],
      printer: ['', Validators.required],
      logo: [''],
      Counter: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      StartTime: [''],
      EndTime: [''],
      InstallationDate: [''],
      ExpiryDate: [''],
      Notification: [''],
    });
  }

  gotoDashBoard() {
    this.router.navigate(['/dashboard']);
  }

  updateSettings() {
    this.loading = true;
    if (this.settingsForm.valid) {
      console.log(this.settingsForm.value);
      const payLoad = {
        Name: this.settingsForm.value.templeName,
        Address: this.settingsForm.value.templeAddress,
        Phone: this.settingsForm.value.phone,
        Email: this.settingsForm.value.email,
        logo: this.settingsForm.value.logo,
        Language: this.settingsForm.value.language,
        Counter: String(this.settingsForm.value.Counter),
        Printer: this.settingsForm.value.printer,
        StartTime: this.settingsForm.value.StartTime,
        EndTime: this.settingsForm.value.EndTime,
        InstallationDate: this.settingsForm.value.InstallationDate,
        ExpiryDate: this.settingsForm.value.ExpiryDate,
        Notification: this.settingsForm.value.Notification,
      };
      this.masterService.upDateSettings(payLoad).subscribe({
        next: (data) => {
          if (data.RespStatus === 'U') {
            this.notification.success('Temple details updated successfully!');
            this.changeSettings();
            this.loading = false;
          }
        },
        error: (err) => {
          this.notification.error('Check your Connection and Try again');
        },
      });
    } else {
      this.notification.error('Please fill out all required fields correctly.');
    }
  }

  ngOnInit() {
    this.getTempleDetails();
  }

  getTempleDetails() {
    this.loading = true;
    this.masterService.settingsData().subscribe((data) => {
      this.templeDetails = data[0];
      if (this.templeDetails) {
        this.settingsForm.patchValue({
          templeName: this.templeDetails.Name,
          templeAddress: this.templeDetails.Address,
          language: this.templeDetails.Language,
          printer: this.templeDetails.Printer,
          logo: this.templeDetails.logo,
          Counter: this.templeDetails.Counter,
          phone: this.templeDetails.phone,
          email: this.templeDetails.email,
          InstallationDate: this.templeDetails.InstallationDate
            ? new Date(this.templeDetails.InstallationDate)
                .toISOString()
                .split('T')[0]
            : '',
          ExpiryDate: this.templeDetails.ExpiryDate
            ? new Date(this.templeDetails.ExpiryDate)
                .toISOString()
                .split('T')[0]
            : '',
StartTime: this.templeDetails.StartTime
    ? this.templeDetails.StartTime.substring(0, 5)
    : '',

  EndTime: this.templeDetails.EndTime
    ? this.templeDetails.EndTime.substring(0, 5)
    : '',

  Notification: this.templeDetails.Notification || '',

        });
        this.imagePreview = `${window.location.origin}/apis/TempleLogo/${this.templeDetails.logo}`;
      }
      this.loading = false;
    });
  }
  changeSettings() {
    this.getTempleDetails();
    localStorage.setItem('Language', this.templeDetails?.Language || '');
    // localStorage.setItem('Language', this.templeDetails?.Language || '');
  }

  unLockBillNumber() {
    console.log(this.billType);
    if (this.billType) {
      const payLoad = {
        Type: this.billType,
        code: '',
      };
      this.masterService.getMaster(payLoad).subscribe({
        next: (data) => {
          console.log(data);
          if (data) {
            this.notification.success('Bill number unlocked successfully');
          }
        },
        error: (err) => {
          this.notification.error(err);
        },
      });
    } else {
      this.notification.error('Please select Bill type to unLock ');
    }
  }
  previewImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileInputMessageFlag = false;

      // Check if the file type is PNG
      if (file.type !== 'image/png') {
        this.errorMessage = 'Only PNG images are allowed.';
        this.imagePreview = null;
        this.fileInput.nativeElement.value = '';
        this.fileInputMessageFlag = true;
        return;
      }
      // diamension check
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSizeInBytes) {
        this.errorMessage = 'File size should not exceed 2MB.';
        this.imagePreview = null;
        this.fileInput.nativeElement.value = '';
        this.fileInputMessageFlag = true;
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1920;
        if (img.width > maxWidth || img.height > maxHeight) {
          this.errorMessage = `Image dimensions should not exceed ${maxWidth}x${maxHeight} pixels.`;
          this.imagePreview = null;
          this.fileInput.nativeElement.value = '';
          this.fileInputMessageFlag = true;
        } else {
          this.errorMessage = '';
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64Image = e.target?.result as string;
            console.log(base64Image);
            this.imagePreview = base64Image;
            this.settingsForm.patchValue({ logo: base64Image });
          };
          reader.readAsDataURL(file);
        }
        URL.revokeObjectURL(img.src); // Clean up the object URL
      };

      img.src = URL.createObjectURL(file);
    } else {
      this.errorMessage = 'No file selected.';
      this.imagePreview = null;
      this.fileInputMessageFlag = true;
    }
  }

  // cancel uploded image only
  removeImagePreview() {
    this.fileInput.nativeElement.value = '';
    this.fileInputMessageFlag = true;
    this.imagePreview = '';
    this.errorMessage = '';
    this.settingsForm.patchValue({ logo: '' });
  }

  clearAllBrowserData() {
    localStorage.setItem('loggedIn', 'false');
    localStorage.removeItem('name');
    localStorage.removeItem('Role');
    localStorage.removeItem('alertmsg');
    localStorage.removeItem('LoginId');
    localStorage.removeItem('username');
    localStorage.removeItem('password');

    localStorage.removeItem('counterId');
    localStorage.removeItem('Address');
    localStorage.removeItem('Counter');
    localStorage.removeItem('Days');
    localStorage.removeItem('Language');
    localStorage.removeItem('Logo');
    localStorage.removeItem('Printer');
    localStorage.removeItem('TempleName');
    localStorage.removeItem('TempleName');
  }
}
