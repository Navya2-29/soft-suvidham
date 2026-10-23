import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../../../services/master/master.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { VazhipadBlocking } from '../../../models/vazhipadBlockingMaster.model';
import { BlockParameter } from '@angular/compiler';
import { NotificationService } from '../../../services/notification/notification.service';
import { VMList } from '../../../models/day-master.model';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-vazhipad-blocking',
  standalone: true,
  imports: [HeaderComponent, SpinnerComponent,MatSelectModule, MatIconModule,MatSelectModule, FormsModule, MatButtonModule, MatAutocompleteModule, CommonModule, ReactiveFormsModule, MatFormFieldModule],
  templateUrl: './vazhipad-blocking.component.html',
  styleUrl: './vazhipad-blocking.component.css',
  providers: [DatePipe]
})
export class VazhipadBlockingComponent {

  searchQuery: string = '';
  BlockingMater: VazhipadBlocking[] = [];
  filteredBlockingMater: VazhipadBlocking[] = [];
  vazhipadBlockingForm: FormGroup;
  blockingCategory: boolean = false;
  VB_category: string = 'Weakly';
  nakshatham:any[];
  showNoRecordsMessage: boolean = false;
  filteredOptions: Observable<string[]>;
  blockingFlag: boolean = false;
  loading: boolean = false;
  today = new Date();
  updateFlag: boolean = false;
  Id: string;
  VM_Id: number;
  loginId:string| null;
  dateType: string;
  VMList:VMList[] = [];
  dateListType:string;
  private formBuilder = inject(FormBuilder);
  private masterService = inject(MasterService);
  private notification = inject(NotificationService);
  templeName:string | null;
  toppings = new FormControl('');
  bockDayList:any[];
  toppingList: any[] ;
  mMonthList:any[]=[]
  dateArray:any[];
  constructor(private datePipe: DatePipe , private router:Router) {
    // form model
    this.templeName=localStorage.getItem('TempleName') ;
    this.loginId=localStorage.getItem('LoginId') ;
    this.vazhipadBlockingForm = this.formBuilder.group({
      vazhId:"",
      VBID:"",
      VM_code: ['', [Validators.required]],
      VM_name: ['', ],
      VB_FromDate: [''],
      VB_ToDate: [''],
      VB_Reasion: ['', [Validators.required]],
      Nakshathra: [""],
      VB_radio: ['W', ],
      VB_DateType: ['E',],
      // VB_MalFDay: ['',[Validators.pattern('^[1-9][0-9]*$')]],
      VB_MalMonth: [''],
      // VB_MalFYear: ['',[Validators.pattern('^[1-9][0-9]*$')]],
      // VB_MalTDay: ['',[Validators.pattern('^[1-9][0-9]*$')]],
      VB_MalTMonth: [''],
      VB_Day:[''],
      // VB_MalTYear: ['',[Validators.pattern('^[1-9][0-9]*$')]],
      VazhiDateinfo: this.formBuilder.array([]),
      // toppings: this.toppings,
    })
  }


  // dayMapping: { [key: string]: number } = {
  //   'Sunday': 1,
  //   'Monday': 2,
  //   'Tuesday': 3,
  //   'Wednesday': 4,
  //   'Thursday': 5,
  //   'Friday': 6,
  //   'Saturday': 7
  // };
    ngOnInit() {

    this.getNakshthram();
    this.getDayList();
    this.getMonthList();
    // get the radio button blocking values
    this.vazhipadBlockingForm.get('VB_radio')!.valueChanges.subscribe(value => {
      this.getCategory(value);
      this.updateFromDateAndToDateValidators();
      this.bockDayList=[]
    });

    // for getting date type values
    this.vazhipadBlockingForm.get('VB_DateType')!.valueChanges.subscribe(value => {
      this.getDteTpe(value);
      this.updateFromDateAndToDateValidators();
      this.bockDayList=[]
    });

    // displaying vazhipad name with code
    this.vazhipadBlockingForm.get('VM_code')!.valueChanges.pipe(
      debounceTime(300),
      switchMap((code) =>
        this.masterService.getVazhipadeByCode(code)
      )
    ).subscribe((response: any) => {
      if (response.length > 0) {
        this.vazhipadBlockingForm.get('VM_name')?.setValue(response[0].VM_Name);
        this.VM_Id = response[0].VM_Id;
        console.log(response);
        console.log(this.VM_Id)
      }
      else if ( this.vazhipadBlockingForm.get('VM_code')?.value ==="") {
        this.vazhipadBlockingForm.get('VM_name')?.setValue('');
      }
      else {
        this.notification.showSuccess("Vazhipad is not exist for code");
        
        this.vazhipadBlockingForm.get('VM_name')?.setValue('');
      }
    });

    // this.toppings.valueChanges.subscribe((selectedDays:any) => {
    //   this.updateDayInfo(selectedDays);
    // });

    this.getVazhipadBlockingMaster();
  }



  // updateDayInfo(selectedDays: string[]): void {
  //   const dayInfoArray = this.vazhipadBlockingForm.get('dayInfo') as any;

  //   // Clear the previous selection
  //   dayInfoArray.clear();

  //   // Add the new selection of day IDs
  //   selectedDays.forEach(day => {
  //     const dayId = this.dayMapping[day]; // Get the corresponding day ID
  //     if (dayId) {
  //       dayInfoArray.push(this.formBuilder.group({ vazhId: String(this.VM_Id), Day: String(dayId) }));
  //     }
  //   });

  //   console.log(this.vazhipadBlockingForm.value.dayInfo);  // Log the updated dayInfo array
  // }

  // get nakshthram
  getNakshthram() {
    this.masterService.getNakshthra().subscribe((res) => {
      console.log(res);
      this.nakshatham = res;
    })
  }


getIdofNakshthra(star: string): number | undefined {
    const stars = this.nakshatham.find(m => m.name === star);
    return stars ? stars.id :Number("") ;
  }

getIdOfDay(day: string): number | undefined {
  const days = this.toppingList.find(m => m.DayEng === day);
  return days ? days.id : Number("");
}
getIdofMonth(mmonEng: string): number | undefined {
  const month = this.mMonthList.find(m => m.mmonEng === mmonEng);
  return month ? month.id : Number("");
}


  // get Categary
    getCategory(category: string) {
    console.log(category);
    const fromDateControl = this.vazhipadBlockingForm.get('VB_FromDate');
    const toDateControl = this.vazhipadBlockingForm.get('VB_ToDate');
    if (category == 'W') {
      this.VB_category = "Weakly";
      this.blockingFlag = false;
      fromDateControl!.setValidators([Validators.required]);
      toDateControl!.setValidators([Validators.required]);
    }
    else if (category == 'D') {
      this.VB_category = "Datewise";
      this.blockingFlag = false;

    }
    else {
      this.VB_category = "Nakshthra";
      this.blockingFlag = true;
      fromDateControl!.clearValidators();
      toDateControl!.clearValidators();
    }
  }



   getDteTpe(dateType: string) {
    if (dateType === "M" ) {
      this.dateType = "Malayalam";
        // this.vazhipadBlockingForm.patchValue({
        //   VB_FromDate:"",
        //   VB_ToDate:""
        // })
    }
    else {
      this.dateType = "English";
      // this.vazhipadBlockingForm.patchValue({
      // VB_MalFDay: "",
      // VB_MalFMonth: "",
      // VB_MalFYear: "",
      // VB_MalTDay: "",
      // VB_MalTMonth: "",
      // VB_MalTYear: "",
      // })
    }
  }

  // get vazhipadBlocking form controls
  get vazhipadBlockingControl() {
    return this.vazhipadBlockingForm.controls;
  }

  
  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd-MM-yyyy') || '';
  }

  formatDateddmmyy(date:string){
    const [day, month, year] = date.split("/"); // Split date by "/"
    return  `${day}-${month}-${year}`  // Reformat date
  }

  // search functionality by pname
  onSearch(searchQuery: string) {
    if (!this.searchQuery.trim()) {
      this.filteredBlockingMater = this.BlockingMater;
    }
    else {
      this.filteredBlockingMater = this.BlockingMater.filter((data) => {
        console.log(data)
        return data.VM_Name.toLowerCase().includes(this.searchQuery) || data.VM_Code.toLowerCase().includes(this.searchQuery.toLowerCase()) || data.VB_ID.toString().toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    }
    this.showNoRecordsMessage = this.filteredBlockingMater.length === 0
  }




  // view blocking vazhipad
  getVazhipadBlockingMaster() {
    this.loading = false;
    const payLoad = {
      "Type": "ListBlocking", "Code": "12"
    }
    this.masterService.getBlockingMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data,"blocking data")
        if (data && data.length > 0) {
          // console.log(data)
          this.BlockingMater = data;
          this.filteredBlockingMater = this.BlockingMater;
          this.loading = false;
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }



  // submit data
  onSubmit() {
    let dataArryList;
    if (this.bockDayList.length === 0) {
      this.notification.showSuccess("Plase click on search button and get the Blocking days");
      return;
    }
    
    console.log(this.vazhipadBlockingForm.value, "booking values");
    // console.log(data);
    const fromDateString = this.vazhipadBlockingForm.value.VB_FromDate;
    const toDateString = this.vazhipadBlockingForm.value.VB_ToDate;
    this.vazhipadBlockingForm.patchValue({
      VB_FromDate: this.formatDate(fromDateString),
      VB_ToDate: this.formatDate(toDateString)
    })
    this.loading = true;
    // console.log(data)
if(this.dateArray){
 dataArryList = this.dateArray.map(date => ({
    vazhId: `${this.VM_Id}`,
    vazhDate:this.formatDateddmmyy(date)
}));
}
    if (this.vazhipadBlockingForm.valid) {
      const payLoad = {
        "vazhId": `${this.VM_Id}`,
        "VBID": "",
        "VazhBlockType": this.vazhipadBlockingForm.value.VB_radio,
        "VazhDateType": this.vazhipadBlockingForm.value.VB_DateType,
        "Fromdate": this.formatDateddmmyy(this.dateArray[0]),
        "Todate":this.formatDateddmmyy( this.dateArray[this.dateArray.length-1]),
        "VazhNakshatram":this.getIdofNakshthra(this.vazhipadBlockingForm.value.Nakshathra),
        "VazhReason": this.vazhipadBlockingForm.value.VB_Reasion,
        "VazhMalFday": "",
        "VazhMalFMonth":this.getIdofMonth( this.vazhipadBlockingForm.value.VB_MalMonth),
        "VazhMalFYear": "",
        "VazhMalTDay":"",
        "VazhMalTMonth": "",
        "VazhMalTYear": "",
        "Cuser":this.loginId,
        "Type": "INSERT",
        "dayinfo":[{"vazhId":this.vazhipadBlockingForm.value.VB_Day!=""?`${this.VM_Id}`:"","Day": this.getIdOfDay(this.vazhipadBlockingForm.value.VB_Day)?.toString()}],
        "VazhDateinfo":dataArryList
      }
      console.log(payLoad ,"day")
      this.masterService.createBlockingMaster(payLoad).subscribe({
        next: (res) => {
          console.log(res);
          this.loading = false;
          this.notification.showSuccess("vazhipad blocking Details created successfully");
          this.onReset();
        },
        error: (error) => {
          // this.loading = true;
          console.log(error);
        }
      })
    }
    else {
      this.markFormGroupTouched(this.vazhipadBlockingForm);
      this.loading=false;
    }
  }



  // resetting form controls
  onReset() {
    this.loading = true;
    this.updateFlag = false;
    // this.vazhipadBlockingForm.reset()
    this.vazhipadBlockingForm.patchValue({
      VB_radio: "W",
      VB_DateType: "E",

      vazhId:"",
      VBID:"",
      VM_code: '', 
      VM_name: '',
      VB_FromDate: '',
      VB_ToDate: '',
      VB_Reasion: '',
      Nakshathra: "",
     
      VB_MalFDay: '',
      VB_MalFMonth: '',
      VB_MalFYear: '',
      VB_MalTDay: '',
      VB_MalTMonth: '',
      VB_MalTYear: '',
      dayInfo: [],

    }
    );
    // this.dayInfo.clear()
 
    this.bockDayList=[]
    this.ngOnInit();
    this.blockingFlag=false;
    this.VB_category = 'Weakly';
    this.loading = false;
  }


  //for editing the form fields
  // onEdit(data: VazhipadBlocking) {
  //   this.loading = true;
  //   this.updateFlag = true;
  //   this.Id = data.VB_ID;
  //   this.VM_Id=data.VM_ID

  //   const fromDate = new Date(data.VB_FromDate);
  //   const toDate = new Date(data.VB_ToDate);
  //   this.vazhipadBlockingForm.patchValue({
  //     VM_code:data.VM_Code,
  //     VM_name:data.VM_Name,
  //     VB_FromDate: this.datePipe.transform(fromDate, 'yyyy-MM-dd'),
  //     VB_ToDate: this.datePipe.transform(toDate, 'yyyy-MM-dd'),
  //     VB_Reasion: data.VB_Reasion,
  //     Nakshathra: data.VB_Nakshatram,
  //     VB_radio: data.VB_BlockType,
  //     VB_DateType: data.VB_DateType,
  //     VB_MalFDay: data.VB_MalFDay,
  //     VB_MalFMonth: data.VB_MalFMonth,
  //     VB_MalFYear: data.VB_MalFYear,
  //     VB_MalTDay: data.VB_MalTDay,
  //     VB_MalTMonth: data.VB_MalTMonth,
  //     VB_MalTYear: data.VB_MalTYear,
  //   });
  //   this.loading = false;
  // }

  //update data
  // onUpdate(updatedata: BlockParameter) {
  //   this.loading = true;
  //   const fromDateString = this.vazhipadBlockingForm.value.VB_FromDate;
  //   const toDateString = this.vazhipadBlockingForm.value.VB_ToDate;
  //   const payLoad={
  //       "vazhId": `${this.VM_Id}`,
  //       "VBID": `${this.Id}`,
  //       "VazhBlockType": this.vazhipadBlockingForm.value.VB_radio,
  //       "VazhDateType": this.vazhipadBlockingForm.value.VB_DateType,
  //       "Fromdate": this.formatDate(fromDateString),
  //       "Todate":  this.formatDate(toDateString),
  //       "VazhNakshatram": this.vazhipadBlockingForm.value.Nakshathra,
  //       "VazhReason": this.vazhipadBlockingForm.value.VB_Reasion,
  //       "VazhMalFday": this.vazhipadBlockingForm.value.VB_MalFDay.toString(),
  //       "VazhMalFMonth": this.vazhipadBlockingForm.value.VB_MalFMonth.toString(),
  //       "VazhMalFYear": this.vazhipadBlockingForm.value.VB_MalFYear.toString(),
  //       "VazhMalTDay": this.vazhipadBlockingForm.value.VB_MalTDay.toString(),
  //       "VazhMalTMonth": this.vazhipadBlockingForm.value.VB_MalTMonth.toString(),
  //       "VazhMalTYear": this.vazhipadBlockingForm.value.VB_MalFYear.toString(),
  //       "Cuser": "2",
  //       "Type": "UPDATE"
  //   }

  //   console.log(payLoad)
  //   this.masterService.updateBlockingMaster(payLoad).subscribe((res) => {
  //     this.loading = false;
  //     this.ngOnInit();
  //     this.notification.showSuccess("Updated successfully");
  //     console.log(res)
  //   })
  // }


  // deleteData
  onDelete(id: string) {
    this.loading = true;
    const payLoad = {
      "Type": "Blocking", "Id": id
    }
    this.masterService.deleteBlockingMaster(payLoad).subscribe((res) => {
      this.loading = false;
      this.getVazhipadBlockingMaster();
      this.notification.showSuccess("Blocking Details deleted successfully");
    })
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

 gotoDashBoard(){
  this.router.navigate(['/dashboard'])
 }



 updateFromDateAndToDateValidators() {
  const fromDateControl = this.vazhipadBlockingForm.get('VB_FromDate');
  const toDateControl = this.vazhipadBlockingForm.get('VB_ToDate');
  const category = this.vazhipadBlockingForm.get('VB_radio')?.value;
  const dateType = this.vazhipadBlockingForm.get('VB_DateType')?.value;

  if ((category === 'W' ) ||
      (category === 'D' ) ||
      (category === 'N')) {
    fromDateControl?.setValidators([Validators.required]);
    toDateControl?.setValidators([Validators.required]);
  } else {
    fromDateControl?.clearValidators();
    toDateControl?.clearValidators();
  }

  fromDateControl?.updateValueAndValidity();
  toDateControl?.updateValueAndValidity();
}


onSearchBlockList(){
const type=this.vazhipadBlockingForm.get('VB_radio')?.value;
const dateType= this.vazhipadBlockingForm.get('VB_DateType')?.value;
if(type=="W"){
  this.dateListType="Weakly"
}else if(type=="D"  && dateType=="E"){
  this.dateListType="DateEng"
}else if(type=="D"  && dateType=="M"){
  this.dateListType="DateMal"
}
else if(type=="N"  && dateType=="E"){
  this.dateListType="EngStar"
}
else if(type=="N"  && dateType=="M"){
  this.dateListType="MalStar"
}
 const payLoad={
 Type:this.dateListType,
 FromDate: this.formatDate( this.vazhipadBlockingForm.get('VB_FromDate')?.value),
 ToDate:this.formatDate(this.vazhipadBlockingForm.get('VB_ToDate')?.value),
 EngishDay: this.vazhipadBlockingForm.get('VB_Day')?.value,
 Star: this.vazhipadBlockingForm.get('Nakshathra')?.value,
 MalMonth:this.vazhipadBlockingForm.get('VB_MalMonth')?.value,
}
console.log(payLoad,"payoad");
this.masterService.getMultiBlockDayList(payLoad).subscribe({
  next:(data)=>{
    console.log(data,"list date");
    this.bockDayList=data;
   this.dateArray = data.map((item:any) => item.disdate);
  //  console.log( array ,"firstssssssssssss")
  //  this.dateArray = array.map((item:any) => {
//     const [day, month, year] = item.disdate.split("/");
//     return `${day}-${month}-${year}`;
// });
console.log( this.dateArray ,"datearrrrrrr")
  }
})

}

// formatDate(date:string){
//   const [year, month, day] = inputDate.split("-");
// const formattedDate = `${day}/${month}/${year}`;
// }

getDayList(){
const payLoad={
  Type:"Day",
  code:""
}
  this.masterService.getMaster(payLoad).subscribe((data)=>{
    console.log(data,"day list");
    this.toppingList=data
  })

  
}


getMonthList(){
  const payLoad={
    Type:"MalMonth",
    code:""
  }
    this.masterService.getMaster(payLoad).subscribe((data)=>{
      console.log(data,"day list");
      this.mMonthList=data
    })
  
}




}
