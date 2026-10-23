import { PrathistaInfo } from './../../../models/vmaster.model';
import { Component, OnInit, inject } from '@angular/core';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Observable, map, startWith } from 'rxjs';
import { MasterService } from '../../../services/master/master.service';
import { VcList, Vmaster } from '../../../models/vmaster.model';
import { DuplicatecheckService } from '../../../services/duplicateCheckValidator/duplicatecheck.service';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
import { NotificationService } from '../../../services/notification/notification.service';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
interface Deity {
  PM_ID: string;
  PM_Name: string;
  PM_RegName: string;
}
@Component({
  selector: 'app-vmaster',
  standalone: true,
  imports: [
    HeaderComponent,
    SpinnerComponent,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    UpperCaseDirective,
    MatSelectModule,
  ],
  templateUrl: './vmaster.component.html',
  styleUrl: './vmaster.component.css',
  
})
export class VmasterComponent implements OnInit {
  toppings = new FormControl<string[]>([], [this.prathistaValidator()]);
  Vmaster: Vmaster[] = [];
  filteredVmaster: Vmaster[] = [];
  vazhipadMasterForm: FormGroup;
  category: VcList[] = [];
  accountHead: string[] = [];
  accountSubHead: string[] = [];
  filteredAccountHead: Observable<string[]>;
  filteredCategory: Observable<VcList[]>;
  filteredAccountSubHead: Observable<string[]>;
  loading: boolean = false;
  updateFlag: boolean = false;
  editDeity: Deity[] = [];
  Id: number;
  searchQuery: string = '';
  deities: any[];
  code: string;
  showNoRecordsMessage: boolean = false;
  checkVazhipadData: number = 0;
  checkBillingVazjipad: boolean = false;
  private formBuilder = inject(FormBuilder);
  private masterService = inject(MasterService);
  private duplicateCheck = inject(DuplicatecheckService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  sortAscending: boolean = true;
  templeName: string | null;
  constructor() {
    const domain = window.location.hostname;
    console.log(domain, 'domain name');
    this.templeName = localStorage.getItem('TempleName');
    this.vazhipadMasterForm = this.formBuilder.group({
      VM_Code: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern('^[a-zA-Z0-9]+$'),
          this.duplicateCodeValidator.bind(this),
        ],
      ],
      VM_Name: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9/()\\-\\s]+$'),
          this.duplicateNameValidator.bind(this),
        ],
      ],
      VM_RName: [
        '',
        [Validators.required, this.duplicateRegionalNameValidator.bind(this)],
      ],
      VM_Amt: [0, [Validators.required, Validators.pattern('^[0-9][0-9]*$')]],
      VM_MaxNo: [0, [Validators.pattern('^[0-9][0-9]*$')]],
      VM_Receipt: [false],
      VM_Booking: [false],
      VM_Blocking: [false],
      VM_Seasonal: [false],
      VM_MultiName: [false],
      VM_Device: [false],
      VM_Mobileapp: [false],
      VM_Special: [false],
      VM_Rate_Change: [false],
      VM_TimeLimit: [0, [Validators.pattern('^[0-9][0-9]*$')]],
      VM_Description: [''],
      VM_AlertMsg: [''],
      VM_Active: [true],
      DisplayMode: [false],
      ACHeadCode: [''],
      ACSubCode: [''],
      VC_Name: ['', [Validators.required]],
      VM_Time: ['1'],
      VM_SMS: [false],
      VM_Whatsapp: [false],
      VM_Mattinam: [false],
      VM_Sales: [false],
      VM_Donation: [false],
      VM_TimeSlot: [false],
      VM_CurrentDay: [false],
      VM_Token: [false],
      LifeTime:[ false],
      prathistainfo: this.formBuilder.array([]),
      //  deities: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.getVmaster();
    this.getCategory();
    this.fetchDeities();
    this.getAccounthead();
    // this.checkVazhipadName()
    // filter for autocompleate category
    this.filteredCategory = this.vazhipadMasterForm
      .get('VC_Name')!
      .valueChanges.pipe(
        startWith(''),
        map((value) => this._filterCategory(value || ''))
      );
  }

  // filtering for category to compleate auto complete
  private _filterCategory(value: string): VcList[] {
    const category = value.toLowerCase();
    return this.category.filter((option) =>
      option.VC_Name.toLowerCase().includes(category)
    );
  }

  // get All category
  getCategory() {
    this.loading = true;
    this.masterService.getCmaster().subscribe({
      next: (cmasters) => {
        this.category = cmasters.map((item) => ({
          VC_Id: item.VC_ID,
          VC_Name: item.VC_Name,
        }));
        this.loading = false;
      },
    });
  }

  // get vmaster
  getVmaster() {
    this.loading = true;
    this.masterService.getVmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          console.log(data);
          this.Vmaster = data;
          console.log(this.Vmaster);
          this.filteredVmaster = this.Vmaster;
          this.sortByVMCode();
          this.loading = false;
        }
      },
      error: (error) => {
        this.notification.showSuccess('Try after some Time');
      },
    });
  }
  sortByVMCode() {
    this.Vmaster.sort((a, b) => {
      const codeA = parseInt(a.VM_Code, 10);
      const codeB = parseInt(b.VM_Code, 10);

      if (isNaN(codeA)) return 1; // Consider NaN as the highest value if sorting
      if (isNaN(codeB)) return -1;

      return this.sortAscending ? codeA - codeB : codeB - codeA;
    });
  }
  // get vmaster form controls
  get vmasterFormControl() {
    return this.vazhipadMasterForm.controls;
  }

  // submit form
  onSubmit(data: Vmaster) {
    console.log(this.toppings);
    console.log(data);
    if (this.vazhipadMasterForm.valid && this.toppings.valid) {
      this.loading = true;
      const formValue = this.vazhipadMasterForm.value;
      const selectedPrathistaNames: string[] = Array.isArray(
        this.toppings.value
      )
        ? this.toppings.value
        : [];

      // Step 1: Create prathistainfo array from selected prathista names
      const prathistainfo = selectedPrathistaNames
        .map((name) => {
          const prathista = this.deities.find(
            (deity) => deity.PM_Name === name
          );

          // Check if prathista is found before accessing its properties
          if (prathista) {
            return {
              PMId: prathista.PM_ID.toString(),
              VMId: this.Id ? this.Id : '',
            };
          } else {
            console.warn(
              `Prathista with name "${name}" not found in deities array.`
            );
            return null; // Handle missing prathista case
          }
        })
        .filter((item) => item !== null) as { PMId: string }[];

      // Add prathistainfo to formValue
      formValue.prathistainfo = prathistainfo;
      console.log('Form value with prathistainfo:', formValue);
      const selectedVc = this.category.find(
        (vc) => vc.VC_Name === formValue.VC_Name
      );
      console.log(selectedVc);
      if (selectedVc) {
        const VCId = selectedVc.VC_Id;
        this.masterService.createVmaster(VCId, formValue).subscribe({
          next: (res) => {
            console.log(res);
            if (res.RespStatus === 'I') {
              this.loading = false;

              this.getVmaster();
              this.onReset();
              this.notification.showSuccess(
                'vazhipad details added successfully'
              );
            }
          },
          error: (error) => {
            this.loading = true;
            console.log(error);
          },
        });
      }
    } else {
      this.markFormGroupTouched(this.vazhipadMasterForm);
      this.toppings.markAsTouched();
      this.notification.showSuccess('Please Fill the Details');
    }
  }

  // resetting form controls
  onReset() {
    this.vazhipadMasterForm.reset({
      VM_Active: true,
      VM_Code: '',
      VM_Name: '',
      VM_RName: '',
      VM_Amt: 0,
      VM_MaxNo: 0,
      VM_Receipt: false,
      VM_Booking: false,
      VM_Blocking: false,
      VM_Seasonal: false,
      VM_MultiName: false,
      VM_Device: false,
      VM_Mobileapp: false,
      VM_Special: false,
      VM_Rate_Change: false,
      VM_SMS: false,
      VM_TimeLimit: 0,
      VM_Description: '',
      VM_AlertMsg: '',
      VM_Mattinam: false,
      VM_Donation: false,
      DisplayMode: false,
      ACHeadCode: '',
      ACSubCode: '',
      VC_Name: '',
      VM_Whatsapp: '',
      VM_Sales: false,
      VM_TimeSlot: false,
      VM_CurrentDay: false,
      VM_Token: false,
      VM_Time: '1',
      LifeTime: false,
      PrathistaInfo: '',
      // prathistainfo:this.toppings
    });
    this.toppings.reset();
    this.updateFlag = false;
    this.loading = false;
    this.prathistainfo.clear();
    this.checkBillingVazjipad = false;
  }

  // for editing the form fields
  onEdit(data: Vmaster) {
    this.Id = data.VM_Id;
    this.loading = true;
    this.updateFlag = true;
    this.code = data.VM_Code;
    const id = data.VC_ID.toString();
    const selectedVc = this.category.find((vc) => vc.VC_Id == id);
    const VCName = selectedVc?.VC_Name;
    this.masterService.getVazhipadByCodeForDiety(data.VM_Code).subscribe({
      next: (diety: Deity[]) => {
        // console.log(diety,"pratstaaaaaaaaaaaaaaaaaaaaaaa");
        this.editDeity = diety;
        const preSelectedNames = this.editDeity.map((deity) => deity.PM_Name);
        // console.log(preSelectedNames,"hjjjjjjjjjjjjjjjjjjjjjjjjjjjjjk");
        this.toppings.setValue(preSelectedNames);
      },
    });
    this.vazhipadMasterForm.patchValue({
      VM_Code: data.VM_Code,
      VM_Name: data.VM_Name,
      VM_RName: data.VM_RName,
      VM_Amt: data.VM_Amt,
      VM_MaxNo: data.VM_MaxNo,
      VM_Receipt: data.VM_Receipt == 'Y' ? true : false,
      VM_Booking: data.VM_Booking == 'Y' ? true : false,
      VM_Blocking: data.VM_Blocking == 'Y' ? true : false,
      VM_Seasonal: data.VM_Seasonal == 'Y' ? true : false,
      VM_MultiName: data.VM_MultiName == 'Y' ? true : false,
      VM_Device: data.VM_Device == 'Y' ? true : false,
      VM_Mobileapp: data.VM_Mobileapp == 'Y' ? true : false,
      VM_Special: data.VM_Special == 'Y' ? true : false,
      VM_Rate_Change: data.VM_Rate_Change == 'Y' ? true : false,
      VM_Sales: data.VM_Sales == 'Y' ? true : false,
      VM_Donation: data.VM_Donation == 'Y' ? true : false,
      VM_TimeLimit: data.VM_TimeLimit,
      VM_Description: data.VM_Description,
      VM_AlertMsg: data.VM_AlertMsg,
      DisplayMode: data.DisplayMode == 'Y' ? true : false,
      VM_Active: data.VM_Active == 'Y' ? true : false,
      VM_SMS: data.VM_SMS == 'Y' ? true : false,
      ACHeadCode: data.ACHeadCode,
      ACSubCode: data.ACSubCode,
      VM_Whatsapp: data.VM_Whatsapp == 'Y' ? true : false,
      VC_Name: VCName,
      VM_Time: data.VM_Time,
      VM_Mattinam: data.VM_Mattinam == 'Y' ? true : false,
      VM_TimeSlot: data.VM_TimeSlot == 'Y' ? true : false,
      VM_CurrentDay: data.VM_CurrentDay == 'Y' ? true : false,
      VM_Token: data.VM_Token == 'Y' ? true : false,
      LifeTime: data.LifeTime == 'Y' ? true : false,
    });
    this.checkVazhipadName(this.Id);

    this.loading = false;
    if (this.checkBillingVazjipad) {
      this.notification.showError(
        'You cant Rename the vazhipad name , its already make receipt so please create a new one'
      );
    }
  }

  prathistaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedPrathista = control.value;
      if (!selectedPrathista || selectedPrathista.length === 0) {
        return { prathistaRequired: true };
      }
      return null;
    };
  }

  //update data
  onUpdate(updatedata: Vmaster) {
    console.log(updatedata);
    this.loading = true;
    // this.deleteForUpdate(this.Id);
    // this.onSubmit(updatedata)

    console.log(updatedata, this.Id);
    if (this.vazhipadMasterForm.valid && this.toppings.valid) {
      const formValue = this.vazhipadMasterForm.value;

      const selectedPrathistaNames: string[] = Array.isArray(
        this.toppings.value
      )
        ? this.toppings.value
        : [];

      // Step 1: Create prathistainfo array from selected prathista names
      const prathistainfo = selectedPrathistaNames
        .map((name) => {
          const prathista = this.deities.find(
            (deity) => deity.PM_Name === name
          );

          // Check if prathista is found before accessing its properties
          if (prathista) {
            return {
              PMId: prathista.PM_ID.toString(),
              VMId: this.Id ? this.Id.toString() : '',
            };
          } else {
            console.warn(
              `Prathista with name "${name}" not found in deities array.`
            );
            return null; // Handle missing prathista case
          }
        })
        .filter((item) => item !== null) as { PMId: string }[];

      // Add prathistainfo to formValue
      formValue.prathistainfo = prathistainfo;

      // console.log('Form value with prathistainfo:', formValue);

      const selectedVc = this.category.find(
        (vc) => vc.VC_Name === formValue.VC_Name
      );

      if (selectedVc) {
        const VCId = selectedVc.VC_Id;

        // this.masterService
        //   .deleteAllPrethista(this.Id.toString())
        //   .subscribe((data) => {
            // console.log('delete suceessfully');

            this.masterService
              .updateVmaster(VCId, updatedata, this.Id)
              .subscribe({
                next: (res) => {
                  this.getVmaster();
                  this.loading = false;

                  this.onReset();
                  this.notification.showSuccess(
                    'Vazhipad details updated sucessfully'
                  );
                },
                error: (error) => {
                  this.loading = true;
                  this.notification.showSuccess(error);
                },
              });
          // });

        // this.masterService.updateVmaster(VCId, updatedata, this.Id).subscribe({
        //   next: (res) => {
        //     this.getVmaster();
        //     this.loading = false;

        //     this.onReset();
        //     this.notification.showSuccess(
        //       'Vazhipad details updated suceesfully'
        //     );
        //   },
        //   error: (error) => {
        //     this.loading = true;
        //     this.notification.showSuccess(error);
        //   },
        // });
      }
    } else {
      this.markFormGroupTouched(this.vazhipadMasterForm);
      this.notification.showSuccess('please fill the details');
    }
  }

  // deleteForUpdate(id: number) {
  //   this.loading = true;
  //   const Id = id + '';
  //   this.masterService.deleteVmaster(Id).subscribe((res) => {
  //     this.loading = false;
  //     this.getVmaster();
  //     // this.notification.showSuccess(' Vazhipad Details deleted successfully');
  //   });
  // }

  // deleteData

  onDeleteCheck(id: number) {
    this.checkVazhipadDelete(id);
  }

  onDelete(id: number) {
    this.loading = true;
    const Id = id + '';
    this.masterService.deleteVmaster(Id).subscribe((res) => {
      this.loading = false;
      this.getVmaster();
      this.notification.showSuccess(' Vazhipad Details deleted successfully');
    });
  }
  // search functionality by name and code
  onSearch(searchQuery: string) {
    if (!this.searchQuery.trim()) {
      this.filteredVmaster = this.Vmaster;
    } else {
      this.filteredVmaster = this.Vmaster.filter((data) => {
        console.log(data);
        return (
          data.VM_Name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          data.VM_Code.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    }
    this.showNoRecordsMessage = this.filteredVmaster.length === 0;
  }
  // validation
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
        this.loading = false;
      }
    });
  }

  // duplicate code check validators
  duplicateCodeValidator(control: AbstractControl): ValidationErrors | null {
    if (this.updateFlag) {
      return null;
    } else {
      const code = control.value;
      if (this.duplicateCheck.vmastercheckDuplicateCode(code, this.Vmaster)) {
        return { duplicateCode: true };
      }
      return null;
    }
  }
  gotoDashBoard() {
    this.router.navigate(['/dashboard']);
  }
  vazhipadTime = [
    // {
    //   id: '0',
    //   name: 'Any time',
    // },
    {
      id: '1',
      name: 'Morning',
    },
    {
      id: '2',
      name: 'Evening',
    },
    {
      id: '3',
      name: 'Night',
    },
  ];

  fetchDeities(): void {
    this.masterService.getPmaster().subscribe({
      next: (data: any[]) => {
        this.deities = data;
        console.log(this.deities);
        //  this.addDeitiesCheckboxes();
      },
      error: (error) => {
        console.error('Error fetching deities', error);
      },
    });
  }
  // addDeitiesCheckboxes(): void {
  //   const deitiesFormArray = this.vazhipadMasterForm.get(
  //     'prathistainfo'
  //   ) as FormArray;
  //   this.deities.forEach(() =>
  //     deitiesFormArray.push(this.formBuilder.control(false))
  //   );
  // }

  get prathistainfo() {
    return this.vazhipadMasterForm.get('prathistainfo') as FormArray;
  }

  // duplicate name check validators
  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    const code = this.code;
    console.log({ name, code, a: this.updateFlag });
    if (this.updateFlag) {
      if (
        this.duplicateCheck.vmastercheckDuplicateUpdateName(
          name,
          this.Vmaster,
          code
        )
      ) {
        return null;
      } else if (
        this.duplicateCheck.vmastercheckDuplicateName(name, this.Vmaster)
      ) {
        return { duplicateName: true };
      } else {
        return null;
      }
    } else {
      if (this.duplicateCheck.vmastercheckDuplicateName(name, this.Vmaster)) {
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
        this.duplicateCheck.vmastercheckDuplicateUpdateRegionalName(
          name,
          this.Vmaster,
          code
        )
      ) {
        return null;
      } else if (
        this.duplicateCheck.vmastercheckDuplicateRegionalName(
          name,
          this.Vmaster
        )
      ) {
        return { duplicateRName: true };
      } else {
        return null;
      }
    } else {
      if (
        this.duplicateCheck.vmastercheckDuplicateRegionalName(
          name,
          this.Vmaster
        )
      ) {
        return { duplicateRName: true };
      }
      return null;
    }
  }

  gotoPrintPage() {
    this.router.navigate(['/vazhipadReport']);
  }

  checkVazhipadName(id: any) {
    const payLoad = {
      Type: 'CheckName',
      Code: id,
    };
    this.masterService.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data, 'check vazhipad');
        this.checkVazhipadData = data.length;
        if (this.checkVazhipadData != 0) {
          this.checkBillingVazjipad = true;
        }
      },
      error: (err) => {
        console.log(err, 'check vazhipad');
      },
    });
  }
  checkVazhipadDelete(id: any) {
    const payLoad = {
      Type: 'CheckName',
      Code: id,
    };
    this.masterService.getMaster(payLoad).subscribe({
      next: (data) => {
        this.checkVazhipadData = data.length;
        if (this.checkVazhipadData != 0) {
          this.checkBillingVazjipad = true;
          this.notification.showError(
            'This item has already been billed.',
            'Deletion not allowed'
          );
        } else {
          this.onDelete(id);
        }
      },
      error: (err) => {
        console.log(err, 'check vazhipad');
      },
    });
  }

  getAccounthead() {
    const payLoad = {
      Type: 'Head',
      Code: '',
    };
    this.masterService.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data, 'account head');
      },
    });
  }
}
