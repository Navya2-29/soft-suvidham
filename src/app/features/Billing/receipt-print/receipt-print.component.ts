import { Component, OnInit } from '@angular/core';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receipt-print',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './receipt-print.component.html',
  styleUrl: './receipt-print.component.css',
})
export class ReceiptPrintComponent implements OnInit {
  printData: any;
  constructor(private receiptPrintService: ReceiptPrintService) {}
  ngOnInit(): void {
    this.getPrintData();
  }
  getPrintData() {
    this.receiptPrintService.data$.subscribe((data) => {
      this.printData = data;
      console.log('Received Data:', this.printData);
    });
  }
}
