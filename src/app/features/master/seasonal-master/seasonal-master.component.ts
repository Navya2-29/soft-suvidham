import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { MasterService } from '../../../services/master/master.service';
import { SeasonalMaster } from '../../../models/season-master.model';
import { debounceTime, switchMap } from 'rxjs';
import { NotificationService } from '../../../services/notification/notification.service';
import { Vmaster } from '../../../models/vmaster.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seasonal-master',
  standalone: true,
  imports: [
    HeaderComponent,
    SpinnerComponent,
    MatInputModule,
    CommonModule,
   
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './seasonal-master.component.html',
  styleUrl: './seasonal-master.component.css',
  providers: [DatePipe],
})
export class SeasonalMasterComponent implements OnInit {
  
  seasonalBlockingForm: FormGroup;
  seasonalMaster: SeasonalMaster[] = [];
  filteredSeasonalMaster: SeasonalMaster[] = [];
  showNoRecordsMessage: boolean = false;
  seasonalCode: any;
  updateFlag: boolean = false;
  searchQuery: string = '';
  loading: boolean = false;
  Id: string;
  VM_Id: number;
  today: string |null;
  tomorrow:string | null;
  vazhipadDetails: any;
  allseasonalVazhipad:any[]=[];
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private notification = inject(NotificationService);
  templeName:string |null ;
  constructor(private datePipe: DatePipe,private router:Router) {
    this.templeName=localStorage.getItem('TempleName') 
    const currentDate = new Date();
   
    this.today = this.datePipe.transform(currentDate,'yyyy-MM-dd');

      // Calculate tomorrow's date
      const tomorrowDate = new Date(currentDate);
      tomorrowDate.setDate(currentDate.getDate() + 1); // Add one day to the current date
      this.tomorrow = this.datePipe.transform(tomorrowDate,'yyyy-MM-dd'); // Tomorrow's date in yyyy-mm-dd format
  
    this.seasonalBlockingForm = this.formBuilder.group({
      VS_code: ['', [Validators.required]],
      VM_name: ['', [Validators.required]],
      VS_FromDate: [this.today, [Validators.required]],
      VS_ToDate: [this.tomorrow, [Validators.required]],
      VS_Reasion: [''],
      VM_ID:[''],
    });
   
  }

  ngOnInit(): void {
    this.loading = true;
    this.getAllSeasonalisedVazhipad();
    console.log(this.seasonalBlockingForm.get('VS_code'));
    this.getSeasonalMaster();
    this.seasonalBlockingForm
      .get('VS_code')!
      .valueChanges.pipe(
        debounceTime(300),
        switchMap((code) => this.masterService.getSeasonalVazhipadeByCode(code))
      )
      .subscribe((response: any) => {
        if (response?.length > 0) {
          this.seasonalBlockingForm.patchValue({
            VM_name: response[0].VM_Name,
            // VM_ID: response[0].VM_Id,  // Update VM_Id in the form
          });
          this.VM_Id = response[0].VM_Id;
          console.log(response);
        } else {
          if (this.seasonalBlockingForm.value.VS_code === '' || null) {
            this.seasonalBlockingForm.get('VM_name')?.setValue('');
          } else {
            this.seasonalBlockingForm.get('VM_name')?.setValue('');
           
          }
        }
      });
  }

  // Method to check if data already exists
 // Function to parse date string in 'dd-MM-yyyy' format to Date object
 parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // Months are 0-indexed in JavaScript Date
}

isDataAlreadyEntered(formValues: any): boolean {
  const formFromDate = this.parseDate(formValues.VS_FromDate);
  const formToDate = this.parseDate(formValues.VS_ToDate);

  console.log('Form From Date:', formFromDate);
  console.log('Form To Date:', formToDate);

  return this.seasonalMaster.some((item) => {
    const itemFromDate = new Date(item.VS_FromDate);
    const itemToDate = new Date(item.VS_ToDate);

    console.log('Item From Date:', itemFromDate);
    console.log('Item To Date:', itemToDate);

    // Compare dates by day, month, and year only
    return item.VM_Code === formValues.VS_code &&
           this.compareDatesByDayMonthYear(itemFromDate, formFromDate) &&
           this.compareDatesByDayMonthYear(itemToDate, formToDate);
  });
}

// Helper method to compare only day, month, and year
compareDatesByDayMonthYear(date1: Date, date2: Date): boolean {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

  // get form controls
  get SeasonalFormControl() {
    return this.seasonalBlockingForm.controls;
  }

  // get seasonal master data
  getSeasonalMaster() {
    this.loading = true;
    this.masterService.getSeasonalMaster().subscribe({
      next: (data) => {
        console.log(data);
        if (data) {
          this.seasonalMaster = data;
          this.filteredSeasonalMaster = this.seasonalMaster;
          this.loading = false;
        }
      },
      error: (error) => {
        this.loading = false;
        this.notification.showSuccess(error);
      },
    });
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd-MM-yyyy') || '';
  }

  onSubmit() {
    
    if (this.seasonalBlockingForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.seasonalBlockingForm.markAllAsTouched();
      return; // Exit the function without submitting the form
    }
    
    const fromDateString = this.seasonalBlockingForm.value.VS_FromDate;
    const toDateString = this.seasonalBlockingForm.value.VS_ToDate;
    this.seasonalBlockingForm.patchValue({
      VS_FromDate: this.formatDate(fromDateString),
      VS_ToDate: this.formatDate(toDateString),
    });
    const formValues = this.seasonalBlockingForm.value;
    console.log(formValues )

     // Check if the data already exists in the seasonalMaster array
     const existingItem = this.isDataAlreadyEntered(formValues);
  console.log(existingItem)
     if (existingItem) {
      // Show a notification with the existing vazhipad details
      
      this.notification.showError(`Seasonal data already exists`);
      this.seasonalBlockingForm.patchValue({
        VS_FromDate:this.today,
        VS_ToDate:this.tomorrow
      })
      return;
    }


    this.loading = true;
    if (this.seasonalBlockingForm.valid) {
      this.masterService
        .createSeasonalMaster(this.VM_Id, this.seasonalBlockingForm.value)
        .subscribe({
          next: (res) => {
            if (res.RespStatus === 'I') {
              this.notification.showSuccess(
                'seasonal vazhipad added sussessfully'
              );
              this.onReset();
              this.loading = false;
              this.ngOnInit();
            }
          },
          error: (error) => {
            this.loading = true;
            this.notification.showSuccess(error);
          },
        });
    } else {
      this.markFormGroupTouched(this.seasonalBlockingForm);
      this.notification.showSuccess('Pleasefill the details');
    }
  }

  // resetting form controls
  onReset() {
    this.loading = true;
    this.seasonalBlockingForm.reset({
      VS_FromDate: this.today,
      VS_ToDate: this.tomorrow
    });
    this.updateFlag = false;
    this.loading = false;
  }

  //for editing the form fields
  onEdit(data: SeasonalMaster) {
    this.loading = true;
    console.log(data,"edit");
    this.updateFlag = true;
    this.Id = data.VS_ID;
    // this.seasonalBlockingForm.get('VS_code')?.disable();
    // this.seasonalBlockingForm.get('VM_name')?.disable();
    const fromDate = new Date(data.VS_FromDate);
    const toDate = new Date(data.VS_ToDate);
    console.log(this.vazhipadDetails);
    this.seasonalBlockingForm.patchValue({
      VS_code: data.VM_Code,
      VM_name: data.VM_Name,
      VS_FromDate: this.datePipe.transform(fromDate, 'yyyy-MM-dd'),
      VS_ToDate: this.datePipe.transform(toDate, 'yyyy-MM-dd'),
      VS_Reasion: data.VS_Reasion,
    });
    this.loading = false;
  }

  //update data
  onUpdate() {
    this.loading = true;
    const fromDateString = this.seasonalBlockingForm.value.VS_FromDate;
    const toDateString = this.seasonalBlockingForm.value.VS_ToDate;
    this.seasonalBlockingForm.patchValue({
      VS_FromDate: this.formatDate(fromDateString),
      VS_ToDate: this.formatDate(toDateString),
    });

    if (this.seasonalBlockingForm.valid) {
      console.log(this.seasonalBlockingForm.value);
      console.log(this.Id);
      this.masterService
        .updateSeasonalMaster(this.Id, this.seasonalBlockingForm.value)
        .subscribe((res) => {
          if (res.RespStatus == 'U') {
            this.notification.showSuccess(
              'Seasonal details updated successfully'
            );
            this.loading = false;
            this.getSeasonalMaster();
            this.onReset();
          } else {
            this.notification.showSuccess('please try again');
          }
        });
    } else {
      this.markFormGroupTouched(this.seasonalBlockingForm);
    }
  }

  // deleteData
  onDelete(id: string) {
    this.loading = true;
    this.masterService.deleteSeasonalMaster(id).subscribe((res) => {
      this.loading = false;
      this.notification.showSuccess('deleted successfully');
      this.getSeasonalMaster();
    });
  }

  // search functionality by name and code
  onSearch(searchQuery: string) {
    if (!this.searchQuery.trim()) {
      this.filteredSeasonalMaster = this.seasonalMaster;
    } else {
      this.filteredSeasonalMaster = this.seasonalMaster.filter((data) => {
        console.log(data);
        return (
          data.VM_Name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          data.VM_Code.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    }
    this.showNoRecordsMessage = this.filteredSeasonalMaster?.length === 0;
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

  getAllSeasonalisedVazhipad() {
    this.masterService.getSeasonalisedVazhipad().subscribe({
      next: (data: Vmaster[]) => {
        this.allseasonalVazhipad=data;
        console.log(this.allseasonalVazhipad,"all data aaaaa")
        this.seasonalCode = data.map((item) => item.VM_Code);
        console.log(data);
      },
    });
  }

  navigateToDAshboard(){
    this.router.navigate(['/dashboard']);
  }


  getVMId(code:any){
   
    console.log(code,"dattaaaaaaaaaaaaaaaaaaaa")
      // console.log(id, 'star id');
      
        const vazhipad = this.allseasonalVazhipad.find((item) => item.VM_Code == code);
        console.log(vazhipad,"dattattattatasssssssssssss")
        console.log(vazhipad.VM_Id,"fffffffff")
        return vazhipad ? vazhipad.VM_Id : '';
     
  
      // console.log(star,"sssssssssssssssss")
    
  }
}
