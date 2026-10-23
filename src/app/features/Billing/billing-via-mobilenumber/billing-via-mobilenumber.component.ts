import { Component, Inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MasterService } from '../../../services/master/master.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { CommonModule } from '@angular/common';
export interface DataRow {
  Name: string;
  Star: string;
  MID: string;
}

@Component({
  selector: 'app-billing-via-mobilenumber',
  standalone: true,
  imports: [
    MatTableModule, MatCheckboxModule, TranslateModule, 
    CommonModule
   ],
  templateUrl: './billing-via-mobilenumber.component.html',
  styleUrl: './billing-via-mobilenumber.component.css',
})
export class BillingViaMobilenumberComponent implements OnInit {
  displayedColumns: string[] = ['select', 'name', 'star'];
  dataSource: DataRow[] = [];
  noDataFound = false;
  selectedRows = new Set<DataRow>();
  mobileNumber: string;
  lang: string | null;
  devoteeType: string;
  constructor(
    public dialogRef: MatDialogRef<BillingViaMobilenumberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mobile: string; member: boolean },
    private service: MasterService,
    private ts: TranslateService,
    private sharedService: ReceiptPrintService
  ) {
    this.mobileNumber = data.mobile; // Pass mobile number from parent

    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
  }

  ngOnInit(): void {
    this.getDevoteeData(this.mobileNumber);
  }

  getDevoteeData(mobile: string) {
    if (this.data) {
      if (this.data.member == true) {
        this.devoteeType = 'DevoteeNameStar';
      } else {
        this.devoteeType = 'NameStar';
      }
    }
    const PayLoad = {
      Type: this.devoteeType,
      Code: this.mobileNumber,
    };
    this.service.getMaster(PayLoad).subscribe({
      next: (data) => {
        this.dataSource = data;


        if (this.dataSource.length === 0) {
          this.noDataFound = true; // No data found, show message
        } else {
          this.noDataFound = false; // Data is present
          if (this.dataSource[0].MID) {
            this.sharedService.setMemberId(this.dataSource[0].MID);
          }
        }



        // if (this.dataSource && this.dataSource[0].MID) {
        //   this.sharedService.setMemberId(this.dataSource[0].MID); // Pass memberId to service
        // }
        // console.log(this.dataSource, 'data mobile');
      },
      error: (err) => {
        this.noDataFound = true;
      },
    });
  }

  isAllSelected() {
    return this.selectedRows.size === this.dataSource.length;
  }

  isIndeterminate() {
    return this.selectedRows.size > 0 && !this.isAllSelected();
  }

  toggleSelection(row: DataRow) {
    if (this.selectedRows.has(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selectedRows.clear();
    } else {
      this.dataSource.forEach((row) => this.selectedRows.add(row));
    }
  }

  isSelected(row: DataRow) {
    return this.selectedRows.has(row);
  }

  onCancel() {
    // if(this.selectedRows.size>0){
    // }else{
      this.sharedService.triggerRefresh()
      this.dialogRef.close(null); 
    // }
  }

  onSubmit(SmFlag: boolean) {
    const selectedData = Array.from(this.selectedRows); 
    this.dialogRef.close({ selectedData, SmFlag });
  }



  
}
