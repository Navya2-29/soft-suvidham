import { Component, Inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MasterService } from '../../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../services/notification/notification.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-online-notification-popup',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatTableModule,
    MatDialogModule,
    MatSelectModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    MatCheckboxModule,
  ],
  templateUrl: './online-notification-popup.component.html',
  styleUrl: './online-notification-popup.component.css',
})
export class OnlineNotificationPopupComponent {
  orderId: string;
  headerData: any[] = []; // For top summary table
  vazhipadDetails: any[] = []; // For bottom detail table
  selectedOption: string | null = null;
  orderDetails: any = null;
  status: string;
  selectedRows: any[] = [];
  differentDateArray: any[];
  templeName: string | null = '';
  templeAddress: string | null = '';
  logo: string | null;
  // counterId: string | null = '';
  // name: string | null;
  today = new Date();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<OnlineNotificationPopupComponent>,
    private service: MasterService,
    private notification: NotificationService
  ) {
    this.orderId = data.title;
    this.status = data.status;
    this.templeName = localStorage.getItem('TempleName');
    this.templeAddress = localStorage.getItem('Address');
    this.logo = localStorage.getItem('Logo');
  }

  ngOnInit(): void {
    this.fetchReportData();
  }

  fetchReportData(): void {
    // this.loading=true;
    const payLoad = {
      Type: 'OnlineCurrentCount',
      Code: this.orderId,
    };
    this.service.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:popup', data);
        this.data = data;

        this.orderDetails = data;
        console.log(this.data);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  submitStatus() {
    const payLoad = {
      BillNo: this.orderId,
      PaidStatus: this.status,
    };
    console.log(payLoad, 'payload');
    this.service.updateonlinetrnsactionstatuspaymentmode(payLoad).subscribe({
      next: (data: any) => {
        console.log(data, 'done');
        if (data.RespStatus == 'U') {
          this.notification.showSuccess(
            'Payment status updated successfully',
            'Online Payment status'
          );
          this.fetchReportData();
        } else {
          this.notification.showError(
            'Error in updating payment status please try again',
            'Online Payment status'
          );
        }
      },
      error: (err: any) => {
        this.notification.showError(
          'Error in updating payment status please try again',
          'Online Payment status'
        );

        console.log(err, 'done');
      },
    });
  }

  formatDateToDDMMYYYY(dateString: string): string {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  toggleRow(row: any) {
    const index = this.selectedRows.indexOf(row);
    if (index === -1) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows.splice(index, 1);
    }
  }

  isSelected(row: any) {
    return this.selectedRows.includes(row);
  }

  toggleAllRows(event: any) {
    if (event.checked) {
      this.selectedRows = [...this.orderDetails];
    } else {
      this.selectedRows = [];
    }
  }

  isAllSelected() {
    return this.selectedRows.length === this.orderDetails.length;
  }

  getNotificationCount() {
    const payLoad = {
      Type: 'OnlineCurrentCount',
      Code: '',
    };
    this.service.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data, 'noti');
      },
    });
  }

  printSelectedRows() {
    console.log('Selected rows:', this.selectedRows);

    if (this.selectedRows.length === 0) {
      this.notification.showError(
        'No rows selected for printing',
        'Print Error'
      );
      return;
    }

    this.selectedRows.forEach((row) => {
      const payload = {
        Type: 'UpdatePrintStatus',
        Code: row.BillNo,
      };

      this.service.getMaster(payload).subscribe({
        next: (res: any) => {
          console.log(`Updated print status for BillNo: ${row.BillNo}`, res);
        },
        error: (err: any) => {
          console.error(
            `Error updating print status for BillNo: ${row.BillNo}`,
            err
          );
        },
      });
    });

    this.printReceiptsThermal();

    this.printReceiptsThermal();
    // ... rest of your print code
  }

  printReceiptsThermal() {
    // console.log(data, 'multiday remark check');
    const imageUrl = window.location.origin + '/assets/images/temple-logo.png';
    // const { BillNo, Billdate, vazhipadinfo, Trnsmode, Address3, Mobile } = data;
    this.differentDateArray = [];
    this.selectedRows.forEach((item: any) => {
      this.differentDateArray.push(item);
    });

    // console.log('Same Date Array:', this.sameDateArray);
    console.log('Different Date Array:', this.differentDateArray);

    if (this.differentDateArray.length > 0) {
      // Group data by Prathista, Vazhipad, and From Date
      const groupedData = this.differentDateArray.reduce(
        (acc: any, item: any) => {
          const key = `${item.Prathista}/${item.Vazhipad}`;
          if (!acc[key]) {
            acc[key] = {
              items: [],
              // totalQty: 0,
              // uniqueNames: new Set(),
              // nalBy: '',
              // mday: '',
              // thithi: '',
              // mmonth: '',
              // Rate: '',
              // VTime: '',
              // TotalAmt: '',
            };
          }
          acc[key].items.push(item);
          // acc[key].totalQty += parseInt(item.Qty, 10);
          // acc[key].uniqueNames.add(item.Name);

          // Store additional details if available
          // if (item.NalBy) acc[key].nalBy = item.NalBy;
          // if (item.Mday) acc[key].mday = item.Mday;
          // if (item.SearchBy) acc[key].thithi = item.SearchBy;
          // if (item.Mmonth) acc[key].mmonth = item.Mmonth;
          // if (item.Rate) acc[key].rate = item.Rate;
          // if (item.VTime) acc[key].VTime = item.VTime;
          // if (item.TotalAmt) acc[key].TotalAmt = item.TotalAmt;

          return acc;
        },
        {}
      );

      const maxRowsPerPage = 4; // Maximum rows per page
      let allReceiptsContent = '';

      Object.keys(groupedData).forEach((key) => {
        const group = groupedData[key];
        const [prathista, vazhipad] = key.split('/');
        const items = group.items;
        let grandTotalAmount = 0;

        // Group items by Name to sum Qty and avoid repetition
        const nameGroupedItems = items.reduce((nameAcc: any, item: any) => {
          if (!nameAcc[item.Name]) {
            nameAcc[item.Name] = {
              ...item,
              Qty: 0,
            };
          }
          nameAcc[item.Name].Qty += parseInt(item.Qty, 10);
          return nameAcc;
        }, {});

        // Convert grouped by Name items into an array
        const uniqueNamesItems = Object.values(nameGroupedItems);

        // Split items into pages
        const pages = [];
        for (let i = 0; i < uniqueNamesItems.length; i += maxRowsPerPage) {
          pages.push(uniqueNamesItems.slice(i, i + maxRowsPerPage));
        }

        // Render each page
        pages.forEach((page, pageIndex) => {
          let receiptContent = `
          <div class="receipt-page">
            <div class="receipt-header" style="margin-top:0px;">${this.templeName}</div>
            <div class="receipt-sub-header">${this.templeAddress}</div>
           
            <div style="margin-top:10px;margin-bottom:15px;">
                <table style="width:100%;">



                  <tr>
                    <td style="text-align:center;font-weight:800;width:30%;border:1px solid black;border-radius:0px 5px 5px 0px;padding:5px;">Pooja</td>
                    <td style="text-align:center;font-weight:800;width:70%;border:1px solid black;border-radius:5px 0px 0px 5px;padding:5px;">${vazhipad}
                    
                    </td>
                  </tr>
                </table>
                  
            </div>
            <table style="width:100%;">
                  <tr>
                      <th style="text-align:left;padding-left:5px;border-bottom:1px solid black;">Name</th>
                      <th style="text-align:right;padding-left:5px;border-bottom:1px solid black;">Star<th>
                  </tr>
                  </table>
          `;

          // Render rows in the current page

          page.forEach((item: any) => {
            const amount = item.Qty * item.Rate;
            grandTotalAmount += amount; // Add the amount to the grand total
            receiptContent += `
            <div style="margin-top:5px;">
              <table style="width:100%;">
                  
                  <tr>
                      <td style="padding-left:5px;text-align:left;">${item.Name}
                      </td>
                      <td style="padding-left:5px;text-align:right;">${item.Star}</td>
                  </tr>
                 
                 
              </table>
            </div>
           
           
           
            
          `;
          });

          // Add grand total and other details
          receiptContent += `
        
           

            
          <p style="text-align:center;width:100%;border-top:1px solid black;padding-top:5px;margin-top:0px;margin-bottom:20px;">www.kshethrasuvidham.com</p>
          </div> <!-- Close receipt-page -->
        `;
          allReceiptsContent += receiptContent;
        });
      });

      // Final print content with styling
      const printContent = `
      <html>
        <head>
          <style>
            body {
              margin: 10px;
              padding: 0;
              font-family:arial;
              text-align: left;
            }

            .receipt-page {
              position: relative;
              width: 80mm;;
              height: auto;
              
              margin: 0 auto;
              padding: 10px;
              overflow: hidden;
              page-break-after: auto;
              font-family:arial;
              // border: 1px dashed #000;
              
            }
             .receipt-header {
              font-size: 13pt;
              font-weight: bold;
              text-align: center;
              margin-bottom: 2px;
              margin-top:0px;
              font-family:arial;
              white-space: normal;
              word-break: break-word;
            }

            .receipt-sub-header {
              font-size: 9pt;
              text-align: center;
              margin-bottom: 5px;
              font-family:arial;
              font-weight: bold;
            }

            hr {
              border: 0;
              border-top: 1px dashed black;
              margin: 8px 0px;
            }
              .receipt-contentbill{
              margin-top:10px;
              font-family:arial;
              }

            .receipt-content {
              text-align: left;
              font-size: 12pt;
              margin-bottom: 5px;
              margin-top:10px;
              margin-top:5px;
              font-family:arial;
              font-weight: bold;

            }
              .receipt-content-vd{
              text-align: left;
              font-size: 12pt;
              margin-bottom: 10px;
              margin-top:10px;
              
              font-family:arial;
              font-weight: bold;
              }
               .receipt-contents {
              text-align: left;
              font-size: 10pt;
              
              margin-top:10px;
              font-family:arial;
            }

            .receipt-total {
              margin-top: 10px 0px;
               margin-bottom: 10px 0px;
              font-weight: bold;
              font-size: 12pt;
              border-top: 1px solid #000;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              padding-top: 10px;
              text-align: left;
              font-family:arial;
            }
           .receipt-rq{
              margin-top: 10px;
              font-weight: bold;
              font-size: 11pt;
              
              // padding-top: 5px;
              text-align: left;
            }
              .receipt-footer-ut{
              font-size: 9pt;
              margin-top: 2px;
              font-style: italic;
              text-align: left;
              font-family:arial;
              font-weight:bold;
              }
            .receipt-footer {
              font-size: 9pt;
              margin-top: 3px;
              font-style: italic;
              text-align: left;
              font-family:arial;
            }
          </style>
        </head>
        <body>
          ${allReceiptsContent}
        </body>
      </html>
    `;

      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
            // this.resetForm();
          }, 500); // small delay to ensure image is loaded
        };
      }
    }
  }
}
