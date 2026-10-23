import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MasterService } from '../../../services/master/master.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-member-master',
  standalone: true,
  imports: [
    HeaderComponent,
    TranslateModule,
    SpinnerComponent,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './member-master.component.html',
  styleUrl: './member-master.component.css',
})
export class MemberMasterComponent implements OnInit {
  rows: any[] = [];
  memeberForm: FormGroup;
  loading: boolean = false;
  nakshatham: any[];
  searchQuery: string = '';
  userId: string | null;
  memberList: any[];
  editFlag: boolean = false;
  memberId: string;
  memberDetails: any[];
  templeName: string | null;
  vmActivelist: any[] = [];
  filteredPmaster: any[] = [];
  lang: string | null;
  previousRelativeDetails: any[] = [];
  private formBuilder = inject(FormBuilder);
  private masterservice = inject(MasterService);
  // constructor
  constructor(
    private notification: NotificationService,
    private ts: TranslateService,

    private router: Router,
  ) {
    this.addRow();
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.userId = localStorage.getItem('LoginId');
    this.templeName = localStorage.getItem('TempleName');
  }

  ngOnInit(): void {
    this.getNakshthram();
    this.editFlag = false;
    this.getDevoteeMaster();
    this.getAllActivevazhipad();
    this.memeberForm = this.formBuilder.group({
      devoteeType: ['', Validators.required],
      name: ['', Validators.required],
      Gothram: ['', Validators.required],
      address1: ['', Validators.required],
      address2: [''],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: [''],
      Amount: [''],
      VazhId: [''],
      endowment: [false],
      relativesDetails: this.formBuilder.array([]),
    });
    this.addRelativeDetails();
    this.memeberForm.get('endowment')?.valueChanges.subscribe((checked) => {
      this.toggleEndowmentValidators(checked);
    });
  }

  private toggleEndowmentValidators(isChecked: boolean) {
    if (isChecked) {
      this.memeberForm.get('Amount')?.setValidators([Validators.required]);
      this.memeberForm.get('VazhId')?.setValidators([Validators.required]);
    } else {
      this.memeberForm.get('Amount')?.clearValidators();
      this.memeberForm.get('VazhId')?.clearValidators();
    }

    // Update validity state
    this.memeberForm.get('Amount')?.updateValueAndValidity();
    this.memeberForm.get('VazhId')?.updateValueAndValidity();
  }

  removeDevotee(index: number) {
    if (this.relativesDetails.length === 1) {
      this.notification.showError(
        'At least one devotee is required.',
        'Validation Error',
      );
      return;
    }
    this.relativesDetails.removeAt(index);
  }

  get relativesDetails() {
    return this.memeberForm.controls['relativesDetails'] as FormArray;
  }
  addRow() {
    this.rows.unshift({});
  }
  deleteRow(index: number): void {
    this.rows.splice(index, 1);
  }
  getNakshthram() {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterservice.getStarData(payLoad).subscribe((res) => {
      this.nakshatham = res;
    });
  }

  addRelativeDetails() {
    const lastIndex = this.relativesDetails.length - 1;
    const lastGroup = this.relativesDetails.at(lastIndex) as FormGroup;
    if (lastGroup && lastGroup.invalid) {
      lastGroup.markAllAsTouched();
      this.notification.showError(
        'Please fill in Name and Star before adding another devotee.',
      );
      return;
    }
    const relativeForm = this.formBuilder.group({
      Name: ['', Validators.required],
      Star: ['', Validators.required],
    });
    this.relativesDetails.push(relativeForm);
  }

  deleteRelativeDetails(lessonIndex: number) {
    this.relativesDetails.removeAt(lessonIndex);
  }
  onSubmit(data: any) {
    this.editFlag = false;
    if (this.memeberForm.invalid) {
      this.notification.showError('Please fil the form');
      return;
    }

    const payLoad = {
      DevoteeName: data.name,
      DevoteeType: data.devoteeType,
      Gothram: data.Gothram,
      Email: data.email,
      Mobile: data.mobile,
      MID: '',
      Cuser: this.userId,
      Address: data.address1,
      Type: 'INSERT',
      Amount: data.Amount ? data.Amount : '0',
      VazhId: data.VazhId ? data.VazhId : '0',
      DevoteeDetails: data.relativesDetails.map((relative: any) => ({
        ...relative,
        MID: '',
      })),
    };

    this.masterservice.AddDevoteeMaster(payLoad).subscribe({
      next: (data) => {
        if (data.RespStatus === 'I') {
          this.notification.showSuccess('Devotee details added successfully');
          this.resetForm();
          this.getDevoteeMaster();
        } else {
          this.notification.showError('Please try after some time');
        }
      },
      error: (err) => {
        this.notification.showError(err);
      },
    });
  }

  getDevoteeMaster() {
    const payLoad = {
      Type: 'DevoteeMaster',
      Code: '',
    };
    this.masterservice.getMaster(payLoad).subscribe({
      next: (data) => {
        this.memberList = data;
        this.filteredPmaster = data;
      },
    });
  }

  onDeleteAll(id: string) {
    const payLoad = {
      Type: 'DevoteeMaster',
      Id: id.toString(),
    };

    this.masterservice.deleteMaster(payLoad).subscribe({
      next: (data) => {
        this.getDevoteeMaster();
        this.resetForm();
      },
    });
  }

  onEdit(member: any) {
    this.editFlag = true;
    this.memberId = member.MID;
    const payLoad = {
      Type: 'EditDevoteeMaster',
      Code: this.memberId,
    };
    this.memeberForm.patchValue({
      name: member.Name,
      address1: member.Address,
      Gothram: member.Gothram,
      mobile: member.mobile,
      email: member.email,
      devoteeType: member.Mtype,
    });
    if (member.VazhId != 0 && member.Amount > 0) {
      this.memeberForm.patchValue({
        endowment: true,
        VazhId: member.VazhId ? member.VazhId : 0,
        Amount: member.Amount ? member.Amount : 0,
      });
    } else {
      this.memeberForm.patchValue({
        endowment: false,
        VazhId: member.VazhId ? member.VazhId : '',
        Amount: member.Amount ? member.Amount : 0,
      });
    }
    this.masterservice.getMaster(payLoad).subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.memberDetails = data;
          this.relativesDetails.clear();
          this.memberDetails.forEach((relative: any) => {
            this.relativesDetails.push(
              this.formBuilder.group({
                Name: [relative.Name, Validators.required],
                Star: [relative.Star, Validators.required],
              }),
            );
          });
        } else {
          console.error('Invalid data format received:', data);
        }
      },
      error: (err) => {
        this.notification.showError('Error fetching member details:', err);
      },
    });
  }


  onUpdate(data: any) {
    this.editFlag = false;
    this.previousRelativeDetails = [...this.relativesDetails.value];

    if (data) {
      const deletePayload = {
        Type: 'DevoteeDetails',
        Id: this.memberId,
      };

      const updatePayload = {
        DevoteeType: data.devoteeType,
        DevoteeName: data.name,
        Email: data.email,
        Mobile: data.mobile,
        MID: this.memberId,
        Gothram: data.Gothram,
        Cuser: this.userId,
        Address: data.address1,
        Amount: data.Amount ? data.Amount : '0',
        VazhId: data.VazhId ? data.VazhId : '0',
        Type: 'UPDATE',
        DevoteeDetails: this.previousRelativeDetails.map((relative: any) => ({
          ...relative,
          MID: this.memberId,
        })),
      };

      this.masterservice
        .deleteMaster(deletePayload)
        .pipe(
          switchMap(() => {
            return this.masterservice.AddDevoteeMaster(updatePayload);
          }),
        )
        .subscribe({
          next: (res: any) => {
            if (res.RespStatus === 'U') {
              this.notification.showSuccess(
                'Devotee details updated successfully',
              );
              this.resetForm();
              this.getDevoteeMaster();
            }
          },
          error: (err) => {
            console.error('Error during delete or update:', err);
          },
        });
    }
  }

  resetForm() {
    this.memeberForm.reset();
    this.relativesDetails.clear(); // Clears the FormArray
    this.addRelativeDetails(); // Ensures at least one relative entry remains
    this.editFlag = false;
    this.getDevoteeMaster();
  }

  gotoDashBoard() {
    this.router.navigate(['/dashboard']);
  }

  printMemberslist() {
    this.router.navigate(['members-list']);
  }
  printEndowmentlist() {
    this.router.navigate(['endowment-register']);
  }

  getAllActivevazhipad() {
    this.masterservice.getAllActiveVazhipad().subscribe((data) => {
      this.vmActivelist = data.map((item) => ({
        VM_Id: item.VM_Id,
        VM_Name: item.VM_Name,
        VM_Code: item.VM_Code,
        VM_RName: item.VM_RName,
      }));
    });
  }

  onEndowmentChange() {
    this.toggleEndowmentFields();
  }

  private toggleEndowmentFields() {
    const endowmentChecked = this.memeberForm.get('endowment')?.value;
    if (!endowmentChecked) {
      this.memeberForm.get('Amount')?.reset();
      this.memeberForm.get('VazhId')?.reset();
    }
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filteredPmaster = this.memberList;
    } else {
      this.filteredPmaster = this.memberList.filter((data) => {
        return (
          data.Name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          data.mobile.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    }
  }
}
