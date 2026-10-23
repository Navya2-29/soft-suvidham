import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
import { MatTableModule } from '@angular/material/table';
import { ItemMaster } from '../../../models/item-master.model';
import { DuplicatecheckService } from '../../../services/duplicateCheckValidator/duplicatecheck.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-item-mater',
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
    MatSlideToggleModule,
  ],
  templateUrl: './item-mater.component.html',
  styleUrl: './item-mater.component.css',
})
export class ItemMAterComponent implements OnInit{
  itemMaster: ItemMaster[] = [];
  filtereditemMaster: ItemMaster[] = [];
  showNoRecordsMessage: boolean = false;
  itemMasterForm: FormGroup;
  loading: boolean = false;
  updateFlag: boolean = false;
  searchQuery: string = '';
  Id: string = '';
  code: string;
  showMaxLengthError: boolean = false;
  sortAscending: boolean = true;
  userId: string | null;
  itemType: string = 'NadavaravuItem';
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private notification = inject(ToastrService);
  private duplicateCheck = inject(DuplicatecheckService);
  templeName: string | null;
  constructor() {
    this.templeName = localStorage.getItem('TempleName');
    this.userId = localStorage.getItem('LoginId');
    this.itemMasterForm = this.formBuilder.group({
      ItemType: ['', [Validators.required]],
      NM_Code: [
        '',
        [
          Validators.required,
          Validators.maxLength(3),
          Validators.pattern('^[a-zA-Z0-9]+$'),
        ],
      ],
      NM_Name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      NM_RName: ['', Validators.required],
      NM_Category: [''],
      category: [''],
      Amount:  Validators.min(1),
      ACHeadCode: [''],
      ACSubCode: [''],
      NM_Description: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.loading = true;
    this.getItemMaster();
    this.itemMasterForm.get('ItemType')?.valueChanges.subscribe((value) => {
      const categoryCtrl = this.itemMasterForm.get('category'); // Nadavaravu
      const subTypeCtrl = this.itemMasterForm.get('NM_Category'); // Subscription
      const amountCtrl = this.itemMasterForm.get('Amount');

      if (value === 'Nadavaravu') {
        this.itemType = 'NadavaravuItem';
        categoryCtrl?.setValidators([Validators.required]);
        subTypeCtrl?.clearValidators();
        subTypeCtrl?.setValue('');
        amountCtrl?.clearValidators();
      } else if (value === 'Subscription') {
        this.itemType = 'SubscriptionItem';
        subTypeCtrl?.setValidators([Validators.required]);
        categoryCtrl?.clearValidators();
        categoryCtrl?.setValue('');
        amountCtrl?.setValidators([Validators.required]);
      } else {
        categoryCtrl?.clearValidators();
        subTypeCtrl?.clearValidators();
        categoryCtrl?.setValue('');
        subTypeCtrl?.setValue('');
        amountCtrl?.setValidators([Validators.required]);
      }
      categoryCtrl?.updateValueAndValidity();
      subTypeCtrl?.updateValueAndValidity();
      amountCtrl?.updateValueAndValidity();
    });
  }

//viewitemmaster
  getItemMaster() {
    this.loading = true;
    const payLoad = {
      Type: 'NadavaravuALL',
      Code: '',
    };
    this.masterService.getItemMaster(payLoad).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.itemMaster = data;
          this.filtereditemMaster = this.itemMaster;
          this.sortByCMCode();
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // get pmaster form controls
  get itemMasterFormControl() {
    return this.itemMasterForm.controls;
  }

  // submitt pmasterform
  onSubmit(data: ItemMaster) {
    const obj = this.itemMasterForm.value;
    if (this.itemMasterForm.valid) {
      const payload = {
        Itemtype: data.ItemType,
        Amount: data.Amount ? data.Amount?.toString() : '0',
        NMId: '',
        NMCode: data.NM_Code,
        NMName: data.NM_Name,
        NMRName: data.NM_RName,
        NMDescription: data.NM_Description,
        NMCategory: data.NM_Category,
        Category: data.category,
        Cuser: this.userId,
        ACHeadCode: data.ACHeadCode,
        ACSubCode: data.ACSubCode,
        Type: 'INSERT',
      };

      this.masterService.createItemMaster(payload).subscribe({
        next: (res) => {
          if (res.RespStatus === 'I') {
            this.notification.success(
              'Item Details created successfully',
              'success',
            );
          }

          this.getItemMaster();

          this.onReset();
          this.loading = false;
        },
        error: (error) => {
          console.log(error);
        },
      });
    } else {
      this.markFormGroupTouched(this.itemMasterForm);
      this.notification.success(' Please fill the  details of item');
    }
  }

  // resetting form controls
  onReset() {
    this.itemMasterForm.reset({
      Itemtype: 'Nadavaravu',
      Amount: '0',

      NMCode: '',
      NMName: '',
      NMRName: '',
      NMDescription: '',
      Category: '',
      NM_Category: '',
      ACHeadCode: '',
      ACSubCode: '',
    });
    this.updateFlag = false;
    this.loading = false;
  }

  //for editing the form fields
  onEdit(data: ItemMaster) {
    this.loading = true;

    this.Id = data.NM_Id;
    this.updateFlag = true;
    this.itemMasterForm.patchValue({
      NM_Code: data.NM_Code,
      NM_Name: data.NM_Name,
      NM_RName: data.NM_RName,
      NM_Description: data.NM_Description,
      NM_Category: data.NM_Category || '',
      category: data.category,
      Amount: data.Amount,
      ItemType: data.Type,
    });
    this.loading = false;
  }

  //update data
  onUpdate(updatedata: ItemMaster) {
    this.loading = true;
    const payload = {
      ItemType: updatedata.ItemType,
      NMId: this.Id,
      NMCode: updatedata.NM_Code,
      NMName: updatedata.NM_Name,
      NMRName: updatedata.NM_RName,
      NMDescription: updatedata.NM_Description,
      Category: updatedata.category,
      NMCategory: updatedata.NM_Category,
      Cuser: this.userId,
      Amount: updatedata.Amount ? updatedata.Amount?.toString() : '0',
      Type: 'UPDATE',
      ACHeadCode: updatedata.ACHeadCode,
      ACSubCode: updatedata.ACSubCode,
    };
    if (this.itemMasterForm.valid) {
      this.masterService.updateItemMaster(payload).subscribe((res) => {
        if (res.RespStatus === 'U') {
          this.loading = false;
          this.notification.success(
            ' Item Details updated successfully',
            'success',
          );
        }

        this.getItemMaster();
this.onReset()
      });
    } else {
      this.markFormGroupTouched(this.itemMasterForm);
      this.loading = false;
      this.notification.success(' Please Fill the  details');
    }
  }

  // deleteData
  onDelete(id: string) {
    const payLoad = { Type: 'Nadavaravu', Id: id };
    this.masterService.deleteItemMaster(payLoad).subscribe((res) => {
      this.notification.success(
        ' Item Details deleted successfully',

        'success',
      );
      this.getItemMaster();
    });
  }

  // search functionality by pname
  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filtereditemMaster = this.itemMaster;
    } else {
      this.filtereditemMaster = this.itemMaster.filter((data) => {
        return (
          data.NM_Name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          data.NM_Code.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    }
    this.showNoRecordsMessage = this.filtereditemMaster.length === 0;
  }

  onInputChange(event: any) {
    const inputValue: string = event.target.value;
    if (inputValue.length > 3) {
      this.showMaxLengthError = true;
    } else {
      this.showMaxLengthError = false;
    }
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
      if (
        this.duplicateCheck.itemMastercheckDuplicateCode(code, this.itemMaster)
      ) {
        return { duplicateCode: true };
      }
      return null;
    }
  }

  // duplicate name check validators

  sortByCMCode() {
    this.filtereditemMaster.sort((a, b) => {
      const codeA = parseInt(a.NM_Code, 10);
      const codeB = parseInt(b.NM_Code, 10);

      if (isNaN(codeA)) return 1; // Consider NaN as the highest value if sorting
      if (isNaN(codeB)) return -1;

      return this.sortAscending ? codeA - codeB : codeB - codeA;
    });
  }
}
