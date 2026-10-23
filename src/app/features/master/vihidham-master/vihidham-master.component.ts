import { vazhipad } from './../../../othervazhipad/othervazhipad.component';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { VihidhamMaster } from '../../../models/vihidham-master.model';
import { MasterService } from '../../../services/master/master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DuplicatecheckService } from '../../../services/duplicateCheckValidator/duplicatecheck.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification/notification.service';
import { debounceTime, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vihidham-master',
  standalone: true,
  imports: [
    HeaderComponent,
    SpinnerComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './vihidham-master.component.html',
  styleUrl: './vihidham-master.component.css',
})
export class VihidhamMasterComponent {
  vihidhamMasterForm: FormGroup;
  vihidhamMaster: VihidhamMaster[] = [];
  filteredVihidhamMaster: VihidhamMaster[] = [];
  showNoRecordsMessage: boolean = false;
  updateFlag: boolean = false;
  searchQuery: string = '';
  loading: boolean = false;
  Id: string;
  VM_Id: string;
  userId: string | null;
  cmaster: any[] = [];
  filteredCmaster: any[] = [];
  today: string;
  sortAscending: boolean = true;
  checkVazhipadData:number=0;
  checkBillingVazjipad:boolean=false;
  Vmaster:any[]=[];
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);
  private duplicateCheck = inject(DuplicatecheckService);

  templeName: string | null;
  constructor(private notification: NotificationService , private router:Router) {
    this.templeName = localStorage.getItem('TempleName');
    this.userId = localStorage.getItem('LoginId');
    this.today = new Date().toISOString().substring(0, 10);
    this.vihidhamMasterForm = this.formBuilder.group({
      vazhipad_code: ['',],
      vazhipad_name: ['', Validators.required],
      vazhipad_rate: ['',],
      vihidham_type: ['', Validators.required],
      vihidham_rate: ['', Validators.required],
      FromDate: [this.today, Validators.required],
      ToDate: [this.today, Validators.required],
    });
  }

  ngOnInit(): void {
   
    this.getVihidhamMaster();
    this.getcmaster();
    this.getVazhipadmaster();
    // this.vihidhamMasterForm
    //   .get('vazhipad_code')!
    //   .valueChanges.pipe(
    //     debounceTime(300),
    //     switchMap((code) => this.masterService.getVazhipadeByCode(code))
    //   )
    //   .subscribe((response: any) => {
    //     if (response.length > 0) {
    //       this.vihidhamMasterForm
    //         .get('vazhipad_name')
    //         ?.setValue(response[0].VM_Name);
    //       this.vihidhamMasterForm
    //         .get('vazhipad_rate')
    //         ?.setValue(response[0].VM_Amt);
    //       this.VM_Id = response[0].VM_Id;
    //       console.log(response);
    //       console.log(this.VM_Id);
    //     } else if (this.vihidhamMasterForm.get('vazhipad_code')?.value === '') {
    //       this.vihidhamMasterForm.get('vazhipad_name')?.setValue('');
    //       this.vihidhamMasterForm.get('vazhipad_rate')?.setValue('');
    //     } else {
    //       this.notification.showError('Vazhipad is not exist for code');
    //       this.vihidhamMasterForm.get('vazhipad_name')?.setValue('');
    //     }
      // });

    // this.toppings.valueChanges.subscribe((selectedDays:any) => {
    //   this.updateDayInfo(selectedDays);
    // });

    // this.getVazhipadBlockingMaster();
  }

  getcmaster() {
    this.loading = true;
    const payLoad = {
      Type: 'ActiveVihidhamCategory',
      Code: '',
    };
    this.masterService.getVihidhamMaster(payLoad).subscribe({
      next: (data: any) => {
        
        if (data && data.length > 0) {
          this.cmaster = data;
          this.loading = false;
          this.sortByCMCode();
          this.filteredCmaster = this.cmaster;
        }
      },
      error: (error) => {
        this.notification.showError(error);
        // this.loading = true;
      },
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

  // view prathishta
  getVihidhamMaster() {
    this.loading = true;
    const payload = {
      Type: 'VihidhamRate',
      Code: '',
    };
    this.masterService.getMaster(payload).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          console.log(data, 'vihidham rate');
          this.vihidhamMaster = data;
          this.filteredVihidhamMaster = this.vihidhamMaster;
          this.loading = false;
        }
        this.loading = false;

      },
      error: (error) => {
        console.log(error);
        // this.loading = true;
      },
    });
  }

  // get pmaster form controls
  get vihidhamMasterControl() {
    return this.vihidhamMasterForm.controls;
  }

  // submitt pmasterform
  onSubmit(data: VihidhamMaster) {
    console.log(data);
    this.loading = true;
    if (this.vihidhamMasterForm.valid) {
      const payLoad = {
        Type: 'INSERT',
        VRId: '',
        VCId: data.vihidham_type,
        VazhId: data.vazhipad_name.toString(),
        Rate: data.vihidham_rate,
        FromDate: this.formatDateToDDMMYYYY(data.FromDate),
        ToDate: this.formatDateToDDMMYYYY(data.ToDate),
        Cuser: this.userId,
      };
      console.log(payLoad, 'submit adta');
      this.masterService.createrateVihidhamMaster(payLoad).subscribe({
        next: (res) => {
          console.log(res);
          this.loading = false;
          this.getVihidhamMaster();
          this.notification.showSuccess(
            'Vihidham Details created sussessfully',
          );

          this.onReset();
          this.loading = false;
        },
        error: (error) => {
          // this.loading = true;
          console.log(error);
        },
      });
    } else {
      this.markFormGroupTouched(this.vihidhamMasterForm);
    }
  }

  // resetting form controls
  onReset() {
    this.loading = true;
    this.vihidhamMasterForm.reset({
       vazhipad_name: "",
      
      vihidham_type: '',
      vihidham_rate: '',
      FromDate: this.today,
      ToDate: this.today,
    });
    this.updateFlag = false;
    this.loading = false;
  }

  //for editing the form fields
  onEdit(data: any) {
    this.loading = true;
    console.log(data,);
    this.updateFlag = true;
    this.Id = data.VR_ID;
    this.vihidhamMasterForm.patchValue({
      vazhipad_name: data.VazhId,
      vihidham_type: data.VC_ID,
      vihidham_rate: data.Rate,
      FromDate:this.formatDate(data.FDate) ,
      ToDate:this.formatDate(data.ToDate)
    });
    this.loading = false;
  }

  formatDate(dateString: string): string {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //update data
  onUpdate(updatedata: VihidhamMaster) {
    this.loading = true;
    if (this.vihidhamMasterForm.valid) {
      const payLoad = {
        Type: 'UPDATE',
        VRId: this.Id.toString(),
        VCId: updatedata.vihidham_type,
        VazhId: updatedata.vazhipad_name,
        Rate: updatedata.vihidham_rate,
        FromDate: this.formatDateToDDMMYYYY(updatedata.FromDate),
        ToDate: this.formatDateToDDMMYYYY(updatedata.ToDate),
        Cuser: this.userId,
      };
      console.log(updatedata, this.Id);
      this.masterService
        .createrateVihidhamMaster(payLoad)
        .subscribe((res: any) => {
          this.loading = false;
          if(res){
            this.notification.showSuccess(
              'Vihidham Details updated sussessfully',
              
            );
            this.getVihidhamMaster();
            this.onReset();
            console.log(res);
          }
          
        });
    } else {
      this.markFormGroupTouched(this.vihidhamMasterForm);
    }
  }

  // deleteData
  onDelete(id: number) {
    this.loading = true;

    const payLoad = {
      Type: 'VihidhamRate',
      Id: id.toString(),
    };
    this.masterService.deleteMaster(payLoad).subscribe((res) => {
      console.log(res);
      this.loading = false;
      this.notification.showSuccess(
        ' vihidham Details deleted successfully',
        
        
      );
      this.getVihidhamMaster();
    });
  }

  // search functionality by name and code
  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filteredVihidhamMaster = this.vihidhamMaster;
    } else {
      this.filteredVihidhamMaster = this.vihidhamMaster.filter((data) => {
        return (
          data.VC_Name
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())
          
        );
      });
    }
    this.showNoRecordsMessage = this.filteredVihidhamMaster.length === 0;
  }

  // snack  message
  openSnackBar(message: string, action: string, classname: string) {
    this._snackBar.open(message, action, {
      panelClass: classname,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
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
    if (
      this.duplicateCheck.vihidhamMastercheckDuplicateCode(
        code,
        this.vihidhamMaster
      )
    ) {
      return { duplicateCode: true };
    }
    return null;
  }

  // duplicate name check validators
  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (
      this.duplicateCheck.vihidhamMastercheckDuplicateName(
        name,
        this.vihidhamMaster
      )
    ) {
      return { duplicateName: true };
    }
    return null;
  }

  formatDateToDDMMYYYY(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  }


  checkVazhipadDelete(vazhid:any,vihiId:any){

    const payLoad={
      Type:"CheckName",
      Code:vazhid
    }
    this.masterService.getMaster(payLoad).subscribe({
      next:(data)=>{
        console.log(data,"check vazhipad")
        this.checkVazhipadData=data.length;
        if(this.checkVazhipadData!=0){
          this.checkBillingVazjipad=true;
          this.notification.showError("This item has already been billed.","Deletion not allowed")
        }else{
          this.onDelete(vihiId)
        }
      },error:(err)=>{
        console.log(err,"check vazhipad") 
      }
    })

  }

  checkVazhipadName(id:any){

    const payLoad={
      Type:"CheckName",
      Code:id
    }
    this.masterService.getMaster(payLoad).subscribe({
      next:(data)=>{
        console.log(data,"check vazhipad")
        this.checkVazhipadData=data.length;
        if(this.checkVazhipadData!=0){
          this.checkBillingVazjipad=true;
        }
      },error:(err)=>{
        console.log(err,"check vazhipad") 
      }
    })

  }


  onDeleteCheck(data:any){
    this.checkVazhipadDelete(data.VazhId,data.VR_ID);
    
    
  }
  gotoDashBoard() {
    this.router.navigate(['/dashboard']);
  } 

  getVazhipadmaster(){
  
    this.masterService.getVmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          console.log(data);
          this.Vmaster = data;
          // console.log(this.Vmaster);
          // this.filteredVmaster = this.Vmaster;
          // this.sortByVMCode();
          // this.loading = false;
        }
      },
      error: (error) => {
        this.notification.showSuccess('Try after some Time');
      },
    });
  }
  // onDelete(id: number) {
  //   this.loading = true;
  //   const Id = id + '';
  //   this.masterService.deleteVmaster(Id).subscribe((res) => {
  //     this.loading = false;
  //     this.getVmaster();
  //     this.notification.showSuccess(' Vazhipad Details deleted successfully');
  //   });
  // }
  gotoVihidhamPrintPage(){
    this.router.navigate(['vihiham-list'])

  }


  getVazhipadNameById(id:any){
    const match = this.Vmaster.find((v: any) => v.VM_Id === id);
    return match ? match.VM_Name : 'N/A';
  }
  getVazhipadBycode(id:any){
    const match = this.Vmaster.find((v: any) => v.VM_Id === id);
    return match ? match.VM_Code : 'N/A';
  }
}
