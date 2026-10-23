import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface Data {
  vazhipad: string;
  name: string;
  rate: number;
  qty: number;
  amount: number;
  star: string;
  diety: string;
  time: string;
  position: number;
}

@Component({
  selector: 'app-mobserachcontents',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatCheckboxModule,
    CommonModule,
        TranslateModule,
    
  ],
  templateUrl: './mobserachcontents.component.html',
  styleUrl: './mobserachcontents.component.css',
})
export class MobserachcontentsComponent implements OnInit {
  displayedColumns: string[] = [
    'Diety',
    'Vazhipad',
    'Name',
    'Star',
    
    'Date',
    'Qty',
    'Rate',
    'Amount',
    
  ];
  dataSource: MatTableDataSource<Data>;
  mobilenumber: string = '';
  TrnStatus:string;
  lang:string | null;
  starData: { [id: string]: string } = {};
  nakshatham:any[]=[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialogRef: MatDialogRef<MobserachcontentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private masterService: MasterService,
       private ts: TranslateService,
    
  ) {
    this.mobilenumber = data[0].MobileNo;
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.TrnStatus=data[0].TrnStatus;
    this.dataSource = new MatTableDataSource(data);
    console.log(data,"search mobile number")
  }

  ngOnInit() {
    this.loadStarData();
  }

  getNakshthram(id: string): string {
    return this.starData[id] || 'Unknown'; 
  }
  loadStarData(): void {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterService.getStarData(payLoad).subscribe({
      next: (data: any[]) => {
        console.log(data);
        this.nakshatham=data;
        this.starData = data.reduce(
          (acc: { [id: string]: string }, star: any) => {
            acc[star.id] = star.SM_NameEng;
            return acc;
          },
          {}
        );

        console.log('Star Data Loaded:', this.starData); // Debug log
      },
      error: (err) => {
        console.error('Error loading star data:', err);
      },
    });
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  cancellTheBill(){
    
this.masterService.cancellBill
  }


  getStarbyId(id: string) {
    console.log(id, 'star id');
    if (this.lang == 'en') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_NameEng : '';
    } else if (this.lang == 'ml') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_Name : '';
    }

    // console.log(star,"sssssssssssssssss")
  }
  


}
