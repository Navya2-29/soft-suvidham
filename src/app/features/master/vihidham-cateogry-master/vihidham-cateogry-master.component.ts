import { Cmaster } from './../../../models/cmaster.model';
import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, NgForm, ReactiveFormsModule, FormBuilder, Validators, FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
// import {  VCMRequestBody } from '../../../models/cmaster.model';
import { DuplicatecheckService } from '../../../services/duplicateCheckValidator/duplicatecheck.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { NotificationService } from '../../../services/notification/notification.service';
@Component({
  selector: 'app-vihidham-cateogry-master',
  standalone: true,
  imports: [
    HeaderComponent, MatIconModule, RouterModule, FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    UpperCaseDirective,
    MatTableModule, MatSlideToggleModule, MatCheckboxModule, SpinnerComponent

  ],
  templateUrl: './vihidham-cateogry-master.component.html',
  styleUrl: './vihidham-cateogry-master.component.css'
})
export class VihidhamCateogryMasterComponent {
  cmaster: Cmaster[] = [];
  filteredCmaster: Cmaster[] = [];
  showNoRecordsMessage: boolean = false;
  cmasterForm: FormGroup;
  updateFlag: boolean = false;
  searchQuery: string = '';
  Id: string = '';
  checkVazhipadData:number=0;
code:string;
  loading: boolean = false;
  showMaxLengthError: boolean = false;
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private notifiacation = inject(NotificationService);
  private duplicateCheck = inject(DuplicatecheckService);
  sortAscending:boolean=true;
  templeName:string |null;
  userId:string |null;
  constructor() {
    this.templeName=localStorage.getItem('TempleName') 
    // this.loading = true;
    this.userId=localStorage.getItem('LoginId');
    this.cmasterForm = this.formBuilder.group({
      VC_Code: ['', [
        Validators.required,
        Validators.maxLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$'),
        this.duplicateCodeValidator.bind(this),
      ]],
      VC_Name: ['', [Validators.required,Validators.pattern('^[a-zA-Z0-9/][a-zA-Z0-9./ ]*$'),
        this.duplicateNameValidator.bind(this),
      ]],
      VC_RegName: ['', [Validators.required,this.duplicateRegionalNameValidator.bind(this),]],
      VC_Active: [true]
    });
  }


  ngOnInit(): void {
    // this.loading = true;
    this.getcmaster();
  }
  // view prathishta
  getcmaster() {
    this.loading = true;
    const payLoad={
      Type:"VihidhamCategory",
      Code:""
    }
    this.masterService.getVihidhamMaster(payLoad).subscribe({
      next: (data:any) => {
        this.loading = false;
        if (data && data.length > 0) {
          this.cmaster = data;
          this.filteredCmaster = this.cmaster;
          
          this.sortByCMCode()
        }
      },
      error: (error) => {
        this.notifiacation.showSuccess(error);
        // this.loading = true;

      }
    });
  }

  sortByCMCode() {
    this.cmaster.sort((a, b) => {
      const codeA = parseInt(a.VC_Code, 10);
      const codeB = parseInt(b.VC_Code, 10);
      
      if (isNaN(codeA)) return 1; // Consider NaN as the highest value if sorting
      if (isNaN(codeB)) return -1;
      
      return this.sortAscending ? codeA - codeB : codeB - codeA;
    });
  }
  // get pmaster form controls
  get cmasterFormControl() {
    return this.cmasterForm.controls;
  }

  // submitt pmasterform
  onSubmit(data: Cmaster) {
    this.loading = true;
    if (this.cmasterForm.valid) {
     
        const payLoad = {
          VCId: '1',
          VCCode: data.VC_Code,
          VCName: data.VC_Name,
          VCRName: data.VC_RegName,
          Active: data.VC_Active ? 'Y' : 'N',
          Type: 'INSERT',
          Cuser:this.userId,
        };
      console.log(payLoad);

      this.masterService.createVihidhamMaster(payLoad).subscribe({
        next: (res:any) => {
            this.notifiacation.showSuccess("Category details added successfully");
            this.onReset();
            this.ngOnInit();
            this.loading = false;
        },
        error: (error) => {
          console.log(error);
        }
      })
    } else {
      this.markFormGroupTouched(this.cmasterForm);
      this.notifiacation.showSuccess("Please Fill the details");
      this.loading = false;
    }

  }

  // resetting form controls
  onReset() {
    this.loading = true;
    this.cmasterForm.reset({
      VC_Active: true,

    });
    this.updateFlag = false;
    this.loading = false;
  }

  //for editing the form fields
  onEdit(data: Cmaster) {
    this.loading = true;
    this.Id = data.VC_ID;
this.code=data.VC_Code;
    this.updateFlag = true;
    this.cmasterForm.patchValue({
      VC_Code: data.VC_Code,
      VC_Name: data.VC_Name,
      VC_RegName: data.VC_RegName,
      VC_Active: data.VC_Active == "Y" ? true : false

    });
    this.loading = false;
  }

  //update data
  onUpdate(updatedata: Cmaster) {
    this.loading = true;
    if (this.cmasterForm.valid) {
      const payLoad = {
        VCId: this.Id.toString(),
        VCCode: updatedata.VC_Code,
        VCName: updatedata.VC_Name,
        VCRName: updatedata.VC_RegName,
        Active: updatedata.VC_Active ? 'Y' : 'N',
        Type: 'UPDATE',
        Cuser: this.userId,
      };
    console.log(payLoad);


      this.masterService.createVihidhamMaster(payLoad).subscribe((res) => {
        this.notifiacation.showSuccess("Category Details updated successfully")
        this.onReset();
        this.ngOnInit();
        this.loading = false;
      })
    }
    else {
      this.markFormGroupTouched(this.cmasterForm);
      this.notifiacation.showSuccess(" Please Fill the  details")
      this.loading = false;
    }
  }
  // deleteData
  onDelete(id: string) {
    this.loading = true;
    const payLoad={
      Type:"VihidhamCategory",
      Id:id
    }
    this.masterService.deleteItemMaster(payLoad).subscribe((res) => {
      this.notifiacation.showSuccess(" Category Details deleted success fully");
      this.getcmaster();
      this.ngOnInit();
      
      this.loading = false;
    })
  }

  // search functionality by pname
  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filteredCmaster = this.cmaster;
    }
    else {
      this.filteredCmaster = this.cmaster.filter((data) => {
        console.log(data)
        return data.VC_Name.toLowerCase().includes(this.searchQuery) || data.VC_Code.toLowerCase().includes(this.searchQuery.toLowerCase())
      });
    }
  }




  // validation
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
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
      return null
    } else {
      if (this.duplicateCheck.cmastercheckDuplicateCode(code, this.cmaster)) {
        return { duplicateCode: true };
      }
      return null;

    }

  }



// duplicate name check validators
duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
  const name = control.value;
  const code = this.code;
console.log({name,code,a:this.updateFlag})
  if (this.updateFlag) {
    if (
      this.duplicateCheck.checkDuplicateCmsterUpdatePname(name, this.cmaster, code)
    ) {
      return null;
    } else if (this.duplicateCheck.cmastercheckDuplicateName(name, this.cmaster)) {
      return { duplicateName: true };
    } else {
      return null;
    }
  } else {
    if (this.duplicateCheck.cmastercheckDuplicateName(name, this.cmaster)) {
      return { duplicateName: true };
    }
    return null;
  }
}

// duplicate regional check validators
duplicateRegionalNameValidator(control: AbstractControl): ValidationErrors | null {
  const name = control.value;
  const code = this.code;

  if (this.updateFlag) {
    if (
      this.duplicateCheck.checkDuplicateCmasterUpdateRegionalName(name, this.cmaster, code)
    ) {
      return null;
    } else if (this.duplicateCheck.checkDuplicateCmasterRegionalName(name, this.cmaster)) {
      return { duplicateRName: true };
    } else {
      return null;
    }
  } else {
    if (this.duplicateCheck.checkDuplicateCmasterRegionalName(name, this.cmaster)) {
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
    Type:"CheckVCID",
    Code:id
  }
  this.masterService.getMaster(payLoad).subscribe({
    next:(data)=>{
      console.log(data,"check vazhipad")
      this.checkVazhipadData=data.length;
      if(this.checkVazhipadData!=0){
        // this.checkBillingVazjipad=true;
        this.notifiacation.showError("This item has already been billed.","Deletion not allowed")
      }else{
        this.onDelete(id)
      }
    },error:(err)=>{
      console.log(err,"check vazhipad") 
    }
  })

}





}
