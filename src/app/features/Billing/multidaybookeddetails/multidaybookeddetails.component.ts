import { vazhipad } from './../../../othervazhipad/othervazhipad.component';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon'
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { CommonModule } from '@angular/common';
import { MasterService } from '../../../services/master/master.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-multidaybookeddetails',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatTableModule, MatCheckboxModule,MatIconModule,CommonModule,
    TranslateModule,
   ],
  templateUrl: './multidaybookeddetails.component.html',
  styleUrl: './multidaybookeddetails.component.css'
})
export class MultidaybookeddetailsComponent implements OnInit {
  devoteeDetails:any[]=[];
  starDate:Date;
  lastDAte:Date;
 vazhipad:string;
 nakshthram:any[]=[];
 starData: { [id: string]: string } = {};
 lang:string | null;
 hasName2 = false;
hasStar2 = false;

  constructor(
    private dialogRef: MatDialogRef<MultidaybookeddetailsComponent>,
    private multidayService: TotalAmountService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private masterService:MasterService,
       private ts: TranslateService,
   
  ) {
    // Access the passed data here
    console.log(data)
    console.log("hai");

    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');

  }
ngOnInit() {
  let lastIndex = this.data.length - 1;
this.devoteeDetails=this.data.devoteedetails;
this.starDate=this.data[0].VazhipadDate;
this.lastDAte=this.data[lastIndex].VazhipadDate
this.vazhipad=this.data[0].Vazhipad;
this.loadStarData()
this.hasName2 = this.data.some((item: any) => item.Name2 && item.Name2.trim() !== '');
  this.hasStar2 = this.data.some((item: any) => item.Star2 && item.Star2.trim() !== '');

}
onSubmit(){
this.dialogRef.close()
}
cancel(){
  this.dialogRef.close()

}
getNakshthram(id: string): string {
  return this.starData[id] || 'Unknown'; // Return 'Unknown' if ID not found
}
  loadStarData(): void {
    const payLoad={"Type":"ListStar","Code":""}
    this.masterService.getStarData(payLoad).subscribe({
      next: (data: any[]) => { 
        console.log(data)// Specify that data is an array of Star
        this.nakshthram=data;
        this.starData = data.reduce((acc: { [id: string]: string }, star:any) => {
          if(this.lang=='en'){
            acc[star.id] = star.SM_NameEng;
          }else{
            acc[star.id] = star.SM_Name;
          }
          
          return acc;
        }, {});

        console.log('Star Data Loaded:', this.starData); // Debug log
      },
      error: (err) => {
        console.error('Error loading star data:', err);
      },
    });
  }
 

  getStarbyId(id: string) {
    console.log(id, 'star id');
    if (this.lang == 'en') {
      const star = this.nakshthram.find((item) => item.id == id);
      return star ? star.SM_NameEng : '';
    } else if (this.lang == 'ml') {
      const star = this.nakshthram.find((item) => item.id == id);
      return star ? star.SM_Name : '';
    }

    // console.log(star,"sssssssssssssssss")
  }


  print() {
  const printContent = document.getElementById('print-section');
  const WindowPrt = window.open('', '', 'width=900,height=650');
  WindowPrt?.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: Manjari, Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h2 { text-align: center; color: #223d61; }
        </style>
      </head>
      <body>
        ${printContent?.innerHTML}
      </body>
    </html>
  `);
  WindowPrt?.document.close();
  WindowPrt?.print();
}


}
