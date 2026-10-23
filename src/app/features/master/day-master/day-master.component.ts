import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DayMaster, VMList } from '../../../models/day-master.model';
import { MasterService } from '../../../services/master/master.service';
import { Observable, map, of, startWith } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NotificationService } from '../../../services/notification/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-day-master',
  standalone: true,
  imports: [
    HeaderComponent,
    SpinnerComponent,
    MatAutocompleteModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
  ],
  templateUrl: './day-master.component.html',
  styleUrl: './day-master.component.css',
})
export class DayMasterComponent implements OnInit {
  dayMasterForm: FormGroup;
  dayMasterList: DayMaster[] = [];
  showNoRecordsMessage: boolean = false;
  filteredDayMaster: DayMaster[] = [];
  Id: number;
  loading: boolean = false;
  updateFlag: boolean = false;
  searchQuery: string = '';
  allSelected: boolean = false;
  dayMasterGrouped: any[] = [];
  vazhid:any;
  dayId:any;
  filteredDayMaster$: Observable<any[]> = of([]);
  showNoDaysError:boolean = false;
  days = [
    {
      id: 1,
      name: 'Sunday',
    },

    {
      id: 2,
      name: 'Monday',
    },
    {
      id: 3,
      name: 'Tuesday',
    },
    {
      id: 4,
      name: 'Wednesday',
    },
    {
      id: 5,
      name: 'Thursday',
    },
    {
      id: 6,
      name: 'Friday',
    },
    {
      id: 7,
      name: 'Saturday',
    },
  ];
  // myControl = new FormControl('');
  VMList: VMList[] = [];
  filteredVMList: Observable<VMList[]>;
  vazhipadMap: { [key: number]: string } = {};
  dayMap: { [key: number]: string } = {};
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private notification = inject(NotificationService);
  templeName:string | null;
  constructor(private router:Router) {
    this.templeName=localStorage.getItem('TempleName') 
    this.dayMasterForm = this.formBuilder.group({
      VM_Name: ['', [Validators.required]],
      selectedDays: this.formBuilder.array([],this.atLeastOneSelected()),
    });
    this.addCheckboxes();
  }

  private addCheckboxes() {
    this.days.forEach(() => {
      const control = new FormControl(false); // Add a control for each day, initialized to false
      (this.dayMasterForm.get('selectedDays') as FormArray).push(control);
    });
  }

  atLeastOneSelected(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const formArray = control as FormArray;
      const isAnyChecked = formArray.controls.some(ctrl => ctrl.value);
      return isAnyChecked ? null : { noSelection: true };
    };
  }

  ngOnInit() {
    this.loading = true;
    this.getDayMster();
    this.getAllVazhipadName();
    this.getDayMap();
    this.filteredVMList = this.dayMasterForm.get('VM_Name')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterVazhipad(value || ''))
    );
  }

  // auto complete vazhipad name filtering
  private _filterVazhipad(value: string) {
    const vazhipad = value.toLowerCase();
    return this.VMList.filter((option) =>
      option.VM_Name.toLowerCase().includes(vazhipad)
    );
  }

  //  get day master
  getDayMster() {
    this.loading = true;
    this.masterService.getDayMaster().subscribe({
      next: (res) => {
        console.log(res);
        this.dayMasterList = res;
        this.loading = false;
      },
    });
  }

  // get day map
  getDayMap() {
    this.days.forEach((day) => {
      this.dayMap[day.id] = day.name;
    });
  }

  // get all vazhipad list
  getAllVazhipadName() {
    this.loading = true;
    this.masterService.getVmaster().subscribe({
      next: (data) => {
        console.log(data);
        this.VMList = data.map((item) => ({
          VM_Id: item.VM_Id,
          VM_Name: item.VM_Name,
          VM_Code: item.VM_Code,
        }));
        this.VMList.forEach((item) => {
          this.vazhipadMap[item.VM_Id] = item.VM_Name;
          this.loading = false;
          console.log(this.VMList);
        });
      },
    });
  }

  onDelete(id: number) {
    this.loading = true;
    this.masterService.deleteDay(id).subscribe({
      next: (res) => {
        if (res) {
          this.notification.showSuccess('Day master deleted successfully');
          this.loading = false;
          this.getDayMster();
        } else {
          this.notification.showSuccess('An error occured try gain');
          this.loading = false;
        }
      },
      error: (err) => {
        this.notification.showSuccess('server down please try after some time');
        this.loading = false;
      },
    });
  }
  get daymasterControl() {
    return this.dayMasterForm.controls;
  }

  // onSearch(query: string) {
  //   this.searchQuery = query;
  //   this.filteredDayMaster$ = this.filterDayMaster();
  // }

  // private filterDayMaster(): Observable<any[]> {
  //   return of(this.dayMasterList).pipe(
  //     map(dayMasterList => dayMasterList.filter(dayMaster =>
  //       dayMaster.VM_Name.toLowerCase().includes(this.searchQuery.toLowerCase())
  //     ))
  //   );
  // }
  
  onSubmit() {

    if (this.dayMasterForm.invalid) {
      // Mark all controls as touched to display validation errors
      Object.keys(this.dayMasterForm.controls).forEach(key => {
        this.dayMasterForm.get(key)?.markAsTouched();
      });
     

      return;
    }

    
    const selectedDays = this.dayMasterForm.value.selectedDays
      .map((checked: boolean, i: number) =>
        checked ? { day: this.days[i].id } : null
      )
      .filter((v: { day: number } | null): v is { day: number } => v !== null);

      
  this.showNoDaysError=false;
    const formValue = {
      VM_Name: this.dayMasterForm.get('VM_Name')?.value,
      dayinfo: selectedDays,
    };
    console.log(formValue);
    const selectedVc = this.VMList.find(
      (vc) => vc.VM_Name === formValue.VM_Name
    );
    console.log(selectedVc);
    if (selectedVc) {
      const VMId = selectedVc.VM_Id;
      console.log(VMId);
      const payLoad = {
        VazhId: VMId.toString(),
        dayinfo: selectedDays,
        Cuser: '2',
        Type: 'INSERT',
      };
      console.log(payLoad);
      this.masterService.createDayMaster(payLoad).subscribe({
        next: (res) => {
          console.log(res);
          this.getDayMster();
          this.resetForm();
          this.notification.showSuccess('Data saved successfully');
        },
      });
    }
  }

  onEdit(item: any) {
    console.log(item);
    this.dayId=item.Day_id;
    this.vazhid=item.VazhId
    this.updateFlag = true;
    this.dayMasterGrouped = this.groupByVazhId(this.dayMasterList);
    console.log(this.dayMasterGrouped); // This will log the grouped array
    const correspondingGroup = this.findGroupByVazhId(item.VazhId);

  // Check if correspondingGroup is defined
  if (correspondingGroup) {
    const vmName = this.findVazhipadName(item.VazhId);
    this.populateForm(correspondingGroup, vmName);
  } else {
    console.log('No matching group found for VazhId:', item.VazhId);
  }
  }



  populateForm(data: any,vmName:any) {
    // Set VM_Name
    this.dayMasterForm.get('VM_Name')?.setValue(vmName);
    // Set checkboxes based on dayIds
    this.setCheckboxes(data.Day || []);
  }


  setCheckboxes(dayIds: number[]) {
    const selectedDays = this.dayMasterForm.get('selectedDays') as FormArray;
    this.days.forEach((day, index) => {
      selectedDays.at(index).setValue(dayIds.includes(day.id));
    });
  }


  findGroupByVazhId(
    vazhId: number
  ): { VazhId: number; Day: number[] } | undefined {
    return this.dayMasterGrouped.find((group) => group.VazhId === vazhId);
  }

  groupByVazhId(dayMasterList: any[]): { VazhId: number; Day: number[] }[] {
    return dayMasterList.reduce(
      (acc: { VazhId: number; Day: number[] }[], curr: any) => {
        const existingGroup = acc.find(
          (group: { VazhId: number }) => group.VazhId === curr.VazhId
        );

        if (existingGroup) {
          existingGroup.Day.push(curr.Day);
        } else {
          acc.push({ VazhId: curr.VazhId, Day: [curr.Day] });
        }

        return acc;
      },
      []
    );
  }

  findVazhipadName(vazhId: number): string | undefined {
    const vm = this.VMList.find((v) => v.VM_Id === vazhId);
    return vm ? vm.VM_Name : undefined;
  }
  resetForm() {
    this.dayMasterForm.reset();

    this.dayMasterForm.setControl(
      'selectedDays',
      this.formBuilder.array(this.days.map(() => false))
    );
    this.updateFlag=false;
  }

  update(){
this.onDeleteforUpdate(this.vazhid);
// this.onSubmit();
  }

  onDeleteforUpdate(id: number) {
    this.loading = true;
    this.masterService.deleteDayByVazhipadId(id).subscribe({
      next: (res) => {
        if (res) {
          this.loading = false;
          this.getDayMster();
          this.onSubmit();
          this.updateFlag=false;
        } else {
          this.notification.showSuccess('An error occured try gain');
          this.loading = false;
        }
      },
      error: (err) => {
        this.notification.showSuccess('server down please try after some time');
        this.loading = false;
      },
    });
  }

  navigateToDAshboard(){
    this.router.navigate(['/dashboard']);
  }
}
