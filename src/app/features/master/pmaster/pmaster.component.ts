import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Pmaster } from '../../../models/pmaster.model';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
import { MatTableModule } from '@angular/material/table';
import { DuplicatecheckService } from '../../../services/duplicateCheckValidator/duplicatecheck.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../services/notification/notification.service';
@Component({
  selector: 'app-pmaster',
  standalone: true,
  imports: [
    HeaderComponent,
    MatIconModule,
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    UpperCaseDirective,
    MatTableModule,
    SpinnerComponent,
    MatCheckboxModule,
  ],
  templateUrl: './pmaster.component.html',
  styleUrl: './pmaster.component.css',
})
export class PmasterComponent implements OnInit {
  pmaster: Pmaster[] = [];
  filteredPmaster: Pmaster[] = [];
  showNoRecordsMessage: boolean = false;
  pmasterForm: FormGroup;
  updateFlag: boolean = false;
  searchQuery: string = '';
  selectedFile: File;
  fileError: string | null = null;
  @ViewChild('fileInput') fileInput: any;
  imagePreview: string | ArrayBuffer | null = null;
  fileInputMessageFlag: boolean = true;
  loading: boolean = false;
  errorMessage: string = '';
  Id: string = '';
  code: string;
  checkVazhipadData:number=0;
  sortAscending: boolean = true;
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private notification = inject(NotificationService);
  private duplicateCheck = inject(DuplicatecheckService);
  templeName:string |null;
  constructor(private toastr: ToastrService) {
    this.templeName=localStorage.getItem('TempleName') 
    // this.loading = true;
    // form model
    this.pmasterForm = this.formBuilder.group({
      PM_Code: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern('^[a-zA-Z0-9]+$'),
          this.duplicateCodeValidator.bind(this),
        ],
      ],
      PM_Name: [
        '',
        [
          Validators.required,
          
          Validators.maxLength(100),
          this.duplicateNameValidator.bind(this),
        ],
      ],
      PM_RegName: [
        '',
        [Validators.required, this.duplicateRegionalNameValidator.bind(this)],
      ],
      PM_Image: [''],
      PM_Active: [true],
    });
  }

  ngOnInit(): void {
    // this.loading = true;
    this.getPmaster();
  }

  // view prathishta
  getPmaster() {
    this.loading = true;
    this.masterService.getPmaster().subscribe({
      next: (data) => {
        this.loading = false;

        if (data && data.length > 0) {
          this.pmaster = data;
          this.filteredPmaster = this.pmaster;
          this.sortByCMCode();
          console.log(this.pmaster);
        }
      },
      error: (error) => {
        console.log(error);
        // this.loading = true;
      },
    });
  }

  sortByCMCode() {
    this.pmaster.sort((a, b) => {
      const codeA = parseInt(a.PM_Code, 10);
      const codeB = parseInt(b.PM_Code, 10);

      if (isNaN(codeA)) return 1; // Consider NaN as the highest value if sorting
      if (isNaN(codeB)) return -1;

      return this.sortAscending ? codeA - codeB : codeB - codeA;
    });
  }

  // get pmaster form controls
  get pmasterFormFormControl() {
    return this.pmasterForm.controls;
  }

  // submit pmasterform
  onSubmit() {
    this.loading = true;
    console.log(this.pmasterForm.value,"imahe value checking");
    if (this.pmasterForm.valid) {
      this.masterService.createPmaster(this.pmasterForm.value).subscribe({
        next: (res) => {
          if (res.RespStatus=='I') {
            this.notification.showSuccess(
              ' Prathishta Details created successfully'
            );
            this.onReset();
            this.ngOnInit();
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = true;
          // console.log(error);
        },
      });
    } else {
      this.loading = false;
      this.markFormGroupTouched(this.pmasterForm);
      this.notification.showSuccess(' Please fill the  details');
    }
  }

  // resetting form controls
  onReset() {
    this.loading = true;
    this.pmasterForm.reset({
      PM_Active: true,
      PM_Image: '',
    });
    this.updateFlag = false;
    this.fileInput.nativeElement.value = '';
    this.fileInputMessageFlag = true;
    this.imagePreview = '';
    this.loading = false;
  }

  //for editing the form fields
  onEdit(data: Pmaster) {
    this.loading = true;
    this.updateFlag = true;
    this.Id = data.PM_ID;
    this.code = data.PM_Code;
    this.pmasterForm.patchValue({
      PM_Code: data.PM_Code,
      PM_Name: data.PM_Name,
      PM_RegName: data.PM_RegName,
      PM_Image: data.PM_Image,
      PM_Active: data.PM_Active == 'Y' ? true : false,
    });
    console.log(this.pmasterForm);
    if (data.PM_Image) {
      this.imagePreview = data.PM_Image;
    }
    this.loading = false;
  }

  //update data
  onUpdate(updatedata: Pmaster) {
    console.log(updatedata);
    this.loading = true;
    if (this.pmasterForm.valid) {
      this.masterService.updatePmaster(updatedata, this.Id).subscribe((res) => {
        if(res.RespStatus=='U'){
          this.loading = false;
          this.notification.showSuccess(
            ' Prathishta Details updated success fully'
          );
          this.ngOnInit();
          this.onReset();
        }
       
      });
    } else {
      this.markFormGroupTouched(this.pmasterForm);
      this.loading = false;
      this.notification.showSuccess(' Please Fill the  details');
    }
  }

  // delete Data
  onDelete(Id: string) {
    this.loading = true;
    this.masterService.deletePmaster(Id).subscribe((res) => {
      this.loading = false;
      this.notification.showSuccess(' Prathishta Details deleted successfully');
      this.ngOnInit();
    });
  }

  // search functionality by name and code
  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filteredPmaster = this.pmaster;
    } else {
      this.filteredPmaster = this.pmaster.filter((data) => {
        console.log(data);
        return (
          data.PM_Name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          data.PM_Code.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    }
    this.showNoRecordsMessage = this.filteredPmaster.length === 0;
  }



  //  preview  the image
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
        const maxHeight = 1080;
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
            this.pmasterForm.patchValue({ PM_Image: base64Image });
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
    this.pmasterForm.patchValue({ PM_Image: '' });
  }


  // validation
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // duplicate code check validators
  duplicateCodeValidator(control: AbstractControl): ValidationErrors | null {
    const code = control.value;
    if (this.updateFlag) {
      return null;
    } else {
      if (this.duplicateCheck.checkDuplicateCode(code, this.pmaster)) {
        return { duplicateCode: true };
      }
      return null;
    }
  }


  // duplicate name check validators

  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    const code = this.code;

    if (this.updateFlag) {
      if (
        this.duplicateCheck.checkDuplicateUpdatePname(name, this.pmaster, code)
      ) {
        return null;
      } else if (this.duplicateCheck.checkDuplicateName(name, this.pmaster)) {
        return { duplicateName: true };
      } else {
        return null;
      }
    } else {
      if (this.duplicateCheck.checkDuplicateName(name, this.pmaster)) {
        return { duplicateName: true };
      }
      return null;
    }
  }


  // duplicate regional check validators
  duplicateRegionalNameValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const name = control.value;
    const code = this.code;

    if (this.updateFlag) {
      if (
        this.duplicateCheck.checkDuplicateUpdateRegionalName(
          name,
          this.pmaster,
          code
        )
      ) {
        return null;
      } else if (
        this.duplicateCheck.checkDuplicateRegionalName(name, this.pmaster)
      ) {
        return { duplicateRName: true };
      } else {
        return null;
      }
    } else {
      if (this.duplicateCheck.checkDuplicateRegionalName(name, this.pmaster)) {
        return { duplicateRName: true };
      }
      return null;
    }
  }
  onDeleteCheck(id: any){
    this.checkVazhipadDelete(id);
    
    
  }


  checkVazhipadDelete(id:any){

    const payLoad={
      Type:"CheckPMID",
      Code:id
    }
    this.masterService.getMaster(payLoad).subscribe({
      next:(data)=>{
        console.log(data,"check vazhipad")
        this.checkVazhipadData=data.length;
        if(this.checkVazhipadData!=0){
          // this.checkBillingVazjipad=true;
          this.notification.showError("This item has already been billed.","Deletion not allowed")
        }else{
          this.onDelete(id)
        }
      },error:(err)=>{
        console.log(err,"check vazhipad") 
      }
    })

  }


  
}
