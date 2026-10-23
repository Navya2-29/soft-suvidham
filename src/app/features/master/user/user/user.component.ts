import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { SpinnerComponent } from '../../../../shared/component/spinner/spinner.component';
import { HeaderComponent } from '../../../../core/layout/header/header.component';
import { DuplicatecheckService } from '../../../../services/duplicateCheckValidator/duplicatecheck.service';
import { MasterService } from '../../../../services/master/master.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    SpinnerComponent,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent {
  loading: boolean = false;
  userForm: FormGroup;
  loginId: string | null;
  staffList: any[] = [];
  searchQuery: string = '';
  updateFlag: boolean = false;
  templeName:string | null;
  filteredUmaster: any[] = [];
  id: string;
  code: number;
  userdata:any[];
  currentRole: string | null = null;
  private duplicateCheck = inject(DuplicatecheckService);
  constructor(
    private fb: FormBuilder,
    private service: MasterService,
    private notification: ToastrService,
    private router:Router
  ) {
    this.loginId = localStorage.getItem('LoginId');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this.currentRole = localStorage.getItem('Role'); // <-- Add this

    this.userForm = this.fb.group({
      LoginId: [''],
      username: ['', [ Validators.required,
        Validators.maxLength(100),
        this.duplicateNameValidator.bind(this),]],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{10}$/), // Ensures a 10-digit number
        ],
      ],
      Address1: [''],
      Role: ['', Validators.required],
      Type: ['INSERT'],
      Active: [true],
    });
  }

  ngOnInit() {
    this.getStaffList();
  }

  getStaffList() {
    const payLoad = { Type: 'ListStaff', Code: '' };
    this.service.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data);
        this.staffList = data;
        console.log(this.staffList)
        this.staffList.sort((a, b) => {
        const nameA = a.UName?.toLowerCase() || '';
        const nameB = b.UName?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
       this.applyRoleFilter();
      },
      error: (err) => {
        this.notification.error(
          'Failed to load staff list. Please try again later.'
        );
        console.error(err);
      },
    });
  }

  onSubmit() {
   if (this.userForm.invalid) {
    this.showValidationErrors();
    return;
  }

    const payLoad = {
      LoginId: '',
      username: this.userForm.value.username,
      password: this.userForm.value.password,
      email: this.userForm.value.email,
      mobile: this.userForm.value.mobile,
      Address1: this.userForm.value.Address1,
      Role: this.userForm.value.Role,
      Type: 'INSERT',
      Active: this.userForm.value.Active == true ? 'Y' : 'N',
    };
    console.log(payLoad, 'new onedata');
    this.service.createStaffmanagement(payLoad).subscribe({
      next: (data) => {
        if (data.RespStatus === 'I') {
          console.log(data);
          this.getStaffList();
          this.reset();
        } else {
          this.notification.error(
            'something went wrong please try after some time'
          );
        }
      },
    });
  }

  reset() {
    this.userForm.reset({
      LoginId: '',
      Type: 'INSERT',
      Active: true,
      username: '',
      password: '',
      email: '',
      mobile: '',
      Address1: '',
      Role: '',
    });
  }

  onEdit(item: any) {
    this.id = item.UId;
    this.updateFlag = true;
    console.log(item);
    this.userForm.patchValue({
      LoginId: item.UId,
      username: item.UName,
      password: item.UPwd,
      email: item.UEmailId,
      mobile: item.Umobile,
      Address1: item.Address1,
      Role: item.Role,
      Type: 'UPDATE',
      Active: item.Active === 'Y' ? true : false,
    });
  }

  onUpdate() {
    console.log(this.userForm.value, 'update');
    const payLoad = {
      LoginId: this.id,
      username: this.userForm.value.username,
      password: this.userForm.value.password,
      email: this.userForm.value.email,
      mobile: this.userForm.value.mobile,
      Address1: this.userForm.value.Address1,
      Role: this.userForm.value.Role,
      Type: 'UPDATE',
      Active: this.userForm.value.Active == true ? 'Y' : 'N',
    };
    console.log(payLoad, 'upload payoa');
    this.service.createStaffmanagement(payLoad).subscribe((data) => {
      console.log(data);

      if (data.RespStatus === 'U') {
        this.notification.success('User Data Updated successfully');
        this.getStaffList();
        this.updateFlag = false;
        this.reset();
      } else {
        this.notification.error(
          'something went wrong please try after some time'
        );
      }
    });
  }

  onDelete(id: string) {
     
    const payLoad={
      Type:"CheckUser",
      Code:id
    }
this.service.getMaster(payLoad).subscribe((data)=>{
  console.log(data,"delete");
 this.userdata=data;
})
if(this.userdata.length>0){
  this.notification.error("This user is not allowed to delete ")
}
else{
  
if (confirm('Are you sure you want to delete this user?')) {
      const payLoad = { Type: 'Staff', Id: id };
      this.service.deleteMaster(payLoad).subscribe((data) => {
        console.log(data);
        this.getStaffList();
      });
    }
}

    
  }


  gotoBack(){
    this.router.navigate(['/dashboard'])
  }

  
// duplicate code check validators
duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
  const name = control.value;
  const code = this.id;

  if (this.updateFlag) {
    if (
      this.duplicateCheck.checkDuplicateUpdatePname(name, this.staffList, code)
    ) {
      return null;
    } else if (this.duplicateCheck.checkDuplicateName(name, this.staffList)) {
      return { duplicateName: true };
    } else {
      return null;
    }
  } else {
    if (this.duplicateCheck.checkDuplicateName(name, this.staffList)) {
      return { duplicateName: true };
    }
    return null;
  }
}

get pmasterFormFormControl() {
  return this.userForm.controls;
}




onSearch() {
  const query = this.searchQuery.trim().toLowerCase();

  // Step 1: apply role-based filter first
  let filteredList = [];
  if (this.currentRole?.toLowerCase() === 'super') {
    filteredList = this.staffList; // super sees all
  } else if (this.currentRole?.toLowerCase() === 'admin') {
    filteredList = this.staffList.filter(user => user.Role?.toLowerCase() === 'staff'); // admin sees staff only
  }

  // Step 2: apply search filter on top of role-filtered list
  if (!query) {
    this.filteredUmaster = filteredList; // reset to role-filtered list if search is empty
  } else {
    this.filteredUmaster = filteredList.filter(
      (d) =>
        d.UName?.toLowerCase().includes(query) ||
        d.Umobile?.toLowerCase().includes(query) ||
        d.UEmailId?.toLowerCase().includes(query)
    );
  }
}



showValidationErrors() {
  const controls = this.userForm.controls;

  Object.keys(controls).forEach((fieldName) => {
    const control = controls[fieldName];
    if (control.invalid) {
      // show messages depending on field name and error type
      if (control.errors?.['required']) {
        this.notification.error(`${this.getFieldLabel(fieldName)} is required`, 'Validation Error');
      }
      if (control.errors?.['pattern']) {
        if (fieldName === 'mobile') {
          this.notification.error('Mobile number must be a 10-digit number', 'Validation Error');
        } else {
          this.notification.error(`Invalid ${this.getFieldLabel(fieldName)} format`, 'Validation Error');
        }
      }
      if (control.errors?.['email']) {
        this.notification.error('Invalid email format', 'Validation Error');
      }
      if (control.errors?.['maxlength']) {
        this.notification.error(`${this.getFieldLabel(fieldName)} is too long`, 'Validation Error');
      }
      if (control.errors?.['duplicateName']) {
        this.notification.error('Username already exists', 'Validation Error');
      }
    }
  });
}
getFieldLabel(fieldName: string): string {
  const labels: { [key: string]: string } = {
    username: 'Username',
    password: 'Password',
    email: 'Email',
    mobile: 'Mobile number',
    Address1: 'Address',
    Role: 'Role',
  };
  return labels[fieldName] || fieldName;
}

applyRoleFilter() {
  if (this.currentRole?.toLowerCase() === 'super') {
    this.filteredUmaster = this.staffList;
  } else {
    this.filteredUmaster = this.staffList.filter(
      (user) => user.Role?.toLowerCase() === 'staff'
    );
  }
}


}
