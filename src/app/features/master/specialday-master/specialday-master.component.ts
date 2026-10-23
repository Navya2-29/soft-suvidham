import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../../../services/master/master.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { SpecialDayMaster } from '../../../models/special-day-master.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-specialday-master',
  standalone: true,
  imports: [MatIconModule,CommonModule,MatButtonModule,HeaderComponent,ReactiveFormsModule,SpinnerComponent,MatAutocompleteModule,AsyncPipe],
  templateUrl: './specialday-master.component.html',
  styleUrl: './specialday-master.component.css'
})
export class SpecialdayMasterComponent implements OnInit{
specialDayMasterForm:FormGroup;
vnameList: string[] = [];
staList:string[]=[];
filteredvnmaList: Observable<string[]>;
filteredstarList: Observable<string[]>;


specialDayMaster: SpecialDayMaster[] = [];
  filteredSpecialdayMaster: SpecialDayMaster[] = [];
  showNoRecordsMessage: boolean = false;
  updateFlag: boolean = false;
  searchQuery: string = '';
  Id: number;
  loading:boolean=false;
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);

templeName:string |null;
constructor(){
  this.templeName=localStorage.getItem('TempleName') 
this.specialDayMasterForm=this.formBuilder.group({
  vazhipadName :['',[Validators.required]],
	star :['',[Validators.required]],
	SD_MDate :[0,[Validators.required]],
	SD_EDate :[0,[Validators.required]],
	SD_Day:[new Date(),[Validators.required]]
  
})
}
ngOnInit(): void {

  //auto compleate for vazhipad name
  this.filteredvnmaList= this.specialDayMasterForm.get('vazhipadName')!.valueChanges.pipe(
    startWith(''),
    map(value => this._filterSpecialDayVazhipad(value || '')),
  );
  // auto compleate for star
  this.filteredstarList= this.specialDayMasterForm.get('star')!.valueChanges.pipe(
    startWith(''),
    map(value => this._filterStar(value || '')),
  );

  this.getSpecialDayVazipadList();
  this.getStarList();

  this.loading=true;
  this.getSpecialDayAmster();
}


// filter for vazhipad name
private _filterSpecialDayVazhipad(value: string): string[] {
  const filterValue = value.toLowerCase();

  return this.vnameList.filter(option => option.toLowerCase().includes(filterValue));
}

// filter for star
private _filterStar(value: string): string[] {
  const filterstar = value.toLowerCase();

  return this.staList.filter(star => star.toLowerCase().includes(filterstar));
}

// get special day vazipad list
getSpecialDayVazipadList(){
  this.masterService.getAllSpecialVazhipadList().subscribe({
    next:(data)=>{
      console.log(data);
      this.vnameList = data.map(item => item.VM_Name);
      
    },
    error:(err:Error)=>{
      console.log(err)
    }
  })
}
  // get star list
  getStarList(){
    this.masterService.getNakshthra().subscribe({
      next:(data)=>{
        this.staList=data;
        console.log(this.staList)
      }
    })
  }

   // view prathishta
   getSpecialDayAmster() {
    this.loading=false;
    this.masterService.getSpecialDayMaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // console.log(data)
          this.specialDayMaster = data;
          this.filteredSpecialdayMaster = this.specialDayMaster;
          this.loading=false;
        }
      },
      error: (error) => {
        console.log(error);
        this.loading=true;
      }
    });
  }

  // get pmaster form controls
  get specialdayMasterControls() {
    return this.specialDayMasterForm.controls;
  }

  // submitt pmasterform
  onSubmit(data: SpecialDayMaster) {
   
    this.loading=true;
    if (this.specialDayMasterForm.valid) {
      this.masterService.createSpecialDayMaster(data).subscribe({
        next: (res) => {
          console.log(res);
          this.loading=false;
          this.openSnackBar(" special day master Details created sussess fully", "close", "success-snackbar");

          this.onReset();
        },
        error: (error) => {
          this.loading=true;
          console.log(error);
        }
      })
    }
    else {
      this.markFormGroupTouched(this.specialDayMasterForm);
    }
  }

  // resetting form controls
  onReset() {
    this.loading=true;
    this.specialDayMasterForm.reset();
    this.updateFlag = false;
    this.loading=false;

  }

  //for editing the form fields
  onEdit(data: SpecialDayMaster) {
    this.loading=true;
    console.log(data);
    this.updateFlag = true;
    this.Id = data.SM_ID;
    this.specialDayMasterForm.patchValue({
      vazhipadName :data.VM_Name,
	star :data.star,
	SD_MDate :data.SD_MDate,
	SD_EDate :data.SD_EDate,
	SD_Day:data.SD_Day
    });
    this.loading=false;
  }


  //update data
  onUpdate(updatedata: SpecialDayMaster) {
    this.loading=true;
    if(this.specialDayMasterForm.valid){
      console.log(updatedata, this.Id);
      this.masterService.updateSpecialDay(this.Id, updatedata).subscribe((res) => {
        this.loading=false;
        this.openSnackBar(" Prathishta Details updated sussess fully", "close", "success-snackbar");
        console.log(res)
      })
    }
    else{
      this.markFormGroupTouched(this.specialDayMasterForm)
    }
   
   
  }


  // deleteData
  onDelete(id: string) {
    this.loading=true;
    this.masterService.deleteSpecialDay(id).subscribe((res) => {
      console.log(res);
      this.loading=false;
      this.openSnackBar(" Prathishta Details deleted sussess fully", "close", "success-snackbar");
    })
  }


  // search functionality by name and code
  onSearch(searchQuery: string) {
    
    if (!this.searchQuery.trim()) {
      this.filteredSpecialdayMaster = this.specialDayMaster;
    }

    else {
      this.filteredSpecialdayMaster = this.specialDayMaster.filter((data) => {
        console.log(data)
        return data.VM_Name.toLowerCase().includes(this.searchQuery.toLowerCase()) ;
      });
      
    }
    this.showNoRecordsMessage=this.filteredSpecialdayMaster.length===0
  }

  // snack  message
  openSnackBar(message: string, action: string, classname: string) {
    this._snackBar.open(message, action, {
      panelClass: classname,
      horizontalPosition: "end",
      verticalPosition: "top",
    });

    
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

}





