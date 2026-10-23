import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteActivatedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable, map, startWith } from 'rxjs';
import { MasterService } from '../../../services/master/master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComboVazhipadMaster } from '../../../models/combo-vazhipad-master.model';
interface ComboItem {
  id: string;
  VM_Name: string;
}
@Component({
  selector: 'app-combo-master',
  standalone: true,
  imports: [HeaderComponent, SpinnerComponent, MatIconModule,
    MatAutocompleteModule, AsyncPipe, CommonModule,
    MatInputModule, FormsModule, ReactiveFormsModule],
  templateUrl: './combo-master.component.html',
  styleUrl: './combo-master.component.css'
})
export class ComboMasterComponent implements OnInit {
  comboMasterForm: FormGroup;
  comboList: ComboItem[] = [];
  comboMaster: ComboVazhipadMaster[] = [];
  searchQuery: string = '';
  filteredComboMaster: ComboVazhipadMaster[] = [];
  filteredComboList: Observable<ComboItem[]>;
  optionSelelected: boolean = false;
  loading: boolean = false;
  updateFlag = false;
  id: string;
  showNoRecordsMessage: boolean = false;
  chechboxe12:boolean;
  comboVazhipads: any[] = [];
  private formBuilder = inject(FormBuilder);
  private masterService = inject(MasterService);
  private _snackBar = inject(MatSnackBar);
  templeName:string |null;
  constructor() {
    this.templeName=localStorage.getItem('TempleName') 
    this.comboMasterForm = this.formBuilder.group({
      VM_Name: ['', [Validators.required]],
      combo_vname: this.formBuilder.array([],[Validators.required]),
      CM_Flag: ['',[Validators.required]]

    })
  }

  
// for select the check box
onChange(e:any){
  const checkedValue=e.target.value;
  const checked=e.target.checked;
  const checkedArray=this.comboMasterForm.get('combo_vname') as FormArray
  console.log(e.target.value,e.target.checked);
if(checked){
checkedArray.push(new FormControl(checkedValue))
}
else{
  let i:number=0;
  checkedArray.controls.forEach((item)=>{
    if(item.value==checkedValue){
checkedArray.removeAt(i);
    }
    i++;
  })

}
}
  ngOnInit(): void {
    this.filteredComboList = this.comboMasterForm.get('VM_Name')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCombovazhpadList(value || '')),
    );
    this.getComoList();

  }
  private _filterCombovazhpadList(value: string): ComboItem[] {
    const comboLists = value.toLowerCase();

    return this.comboList.filter(comboList => comboList.VM_Name.toLowerCase().includes(comboLists));
  }

  getComoList() {
    this.masterService.getAllComoVazhipadList().subscribe((data: ComboItem[]) => {
      console.log(data);
      this.comboList = data;
      console.log(this.comboList);
    })
  }

  // call the api corresponding to selected item in autocomplete list
  onOptionSelected(event: MatAutocompleteActivatedEvent) {
    this.optionSelelected = true;
    const selectedVM_Name = event.option?.value;
    const selectedComboItem = this.comboList.find(item => item.VM_Name === selectedVM_Name);
    console.log(selectedVM_Name)
    console.log(selectedComboItem?.id)
    if (selectedComboItem) {
      const selectedId = selectedComboItem.id;
      this.masterService.getComboVazhipad(selectedId).subscribe({
next:(data)=>{
  this.comboVazhipads=data;
}
      })
    }
  }
  // get all the combomaster list
  getComboMaster() {
    this.masterService.getComboMaster().subscribe({
      next: (data) => {
        this.comboMaster = data;
        this.filteredComboMaster = this.comboMaster;
      }
    })
  }
// submitt pmasterform
onSubmit(data: ComboVazhipadMaster) {
 
  this.loading=true;
  if (this.comboMasterForm.valid) {
    this.masterService.createComboMaster(data).subscribe({
      next: (res) => {
        console.log(res);
        this.loading=false;
        this.openSnackBar(" Prathishta Details created sussess fully", "close", "success-snackbar");

        this.onReset();
      },
      error: (error) => {
        this.loading=true;
        console.log(error);
      }
    })
  }
  else {
    this.markFormGroupTouched(this.comboMasterForm);
  }
}

  // resetting form controls
  onReset() {
    this.loading = true;
    this.comboMasterForm.reset();
    this.updateFlag = false;
    this.loading = false;
    this.chechboxe12=false;

  }
  
  //for editing the form fields
  onEdit(data: ComboVazhipadMaster) {
    this.loading = true;
    console.log(data);
    this.updateFlag = true;
    // this.Id = data.id;
    // this.pmasterForm.patchValue({
    //   PM_Code: data.PM_Code,
    //   PM_NameEng: data.PM_NameEng,
    //   PM_Name: data.PM_Name,
    //   imgurl: data.imgurl
    // });
    this.loading = false;
  }


  //update data
  onUpdate(updatedata: ComboVazhipadMaster) {
    this.loading = true;
    // console.log(updatedata, this.Id);
    // this.masterService.updatePmaster(this.Id, updatedata).subscribe((res) => {
    //   this.loading=false;
    //   this.openSnackBar(" ComboVazhipadMaster Details updated sussess fully", "close", "success-snackbar");
    //   console.log(res)
    // })
  }


  // deleteData
  onDelete(id: string) {
    this.loading = true;
    // this.masterService.delete(id).subscribe((res) => {
    //   console.log(res);
    //   this.loading=false;
    //   this.openSnackBar(" ComboVazhipadMaster Details deleted sussess fully", "close", "success-snackbar");
    // })
  }


  // search functionality by name and code
  onSearch(searchQuery: string) {

    if (!this.searchQuery.trim()) {
      this.filteredComboMaster = this.comboMaster;
    }

    else {
      this.filteredComboMaster = this.comboMaster.filter((data) => {
        console.log(data)
        return data.VM_Name.toLowerCase().includes(this.searchQuery.toLowerCase());
      });

    }
    this.showNoRecordsMessage = this.filteredComboMaster.length === 0
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
 // get pmaster form controls
 get comoMasterFormControl() {
  return this.comboMasterForm.controls;
}

}
