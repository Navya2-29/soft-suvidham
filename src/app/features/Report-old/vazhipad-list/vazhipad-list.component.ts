import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MasterService } from '../../../services/master/master.service';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-vazhipad-list',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SpinnerComponent, TranslateModule],
  templateUrl: './vazhipad-list.component.html',
  styleUrl: './vazhipad-list.component.css',
})
export class VazhipadListComponent {


  vazhipadDetails: any = [];
  currentDate: Date = new Date();
  loading: boolean = true;
  printWindow: Window | null = null;
  prathistalist: any = [];
  prathistaName: string = '';
  lang: string | null;
  constructor(
    private service: MasterService,
    private router: Router,
    private ts: TranslateService
  ) {
    this.lang = localStorage.getItem('Language');

    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
  }

  ngOnInit(): void {
    this.fetchVazhipadDetails();
    this.getAllPrathista();
  }

  fetchVazhipadDetails() {
    this.service.getAllActiveVazhipad().subscribe({
      next: (response) => {
        this.vazhipadDetails = response;
        console.log(this.vazhipadDetails)
        this.sortVazhipadDetails();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching vazhipad details:', error);
      },
    });
  }

  sortVazhipadDetails() {
    this.vazhipadDetails.sort((a: any, b: any) => {
      const aNumber = parseFloat(a.VM_Code);
      const bNumber = parseFloat(b.VM_Code);
      return aNumber - bNumber;
    });
  }

  saveToComputer(): void {
    const pdf = new jsPDF('p', 'pt', 'a4'); // Create a new PDF document

    // Adding title
    pdf.setFontSize(20);
    pdf.text('Vazhipad Report', 40, 50);

    // Adding date
    pdf.setFontSize(12);
    pdf.text(`Date: ${this.currentDate.toLocaleDateString('en-GB')}`, 40, 70);

    // Adding table
    autoTable(pdf, {
      head: [['SI', 'Code', 'Vazhipad', 'Amount', 'Time']],
      body: this.vazhipadDetails.map((item: any, index: number) => [
        index + 1,
        item.VM_Code,
        item.VM_Name,
        item.VM_Amt,
        item.VM_Time,
      ]),
      startY: 100,
      margin: { top: 20, bottom: 20 },
      theme: 'grid',
    });

    // Save the PDF
    pdf.save('vazhipad_report.pdf');
  }

  printView() {
    const printContent = document.getElementById('printableArea');
    this.printWindow = window.open('', '', 'height=600,width=800');

    if (this.printWindow && printContent) {
      this.printWindow.document.write('<html><head><title>Print</title>');
      this.printWindow.document.write(`
            <style>
                @page {
                    size: A4; /* A4 page size */
                    margin: 2cm; /* Page margins */
                }
                body {
                    margin: 0; /* Remove default body margin */
                    font-family: Arial, sans-serif; /* Font style */
                    color: #333; /* Default text color */
                    line-height: 1.6; /* Line height for readability */
                }
                .document-container {
                    padding: 20px; /* Add padding */
                    background: white; /* Ensure background is white */
                }
                .document-header {
                    text-align: center; /* Center header text */
                    margin-bottom: 1.5cm; /* Space below header */
                    background-color: #007BFF; /* Header background color */
                    color: white; /* Header text color */
                    padding: 10px; /* Padding inside header */
                }
                .document-content h2 {
                    margin-top: 0; /* Remove top margin */
                    margin-bottom: 1cm; /* Add space below */
                }
                .document-content table {
                    width: 100%; /* Full width */
                    border-collapse: collapse; /* Prevent double borders */
                    margin-bottom: 1cm; /* Space below table */
                }
                .document-content th,
                .document-content td {
                    padding: 10px; /* Padding for table cells */
                    border: 1px solid #333; /* Border for table cells */
                    text-align: left; /* Align text to the left */
                }
                .document-content th {
                    background-color: #0056b3; /* Darker header background color */
                    color: white; /* Header text color */
                }
                .document-footer {
                    text-align: center; /* Center footer text */
                    margin-top: 1cm; /* Space above footer */
                    border-top: 1px solid #ccc; /* Add top border */
                    padding-top: 10px; /* Padding for footer */
                }
                /* Prevent rows from breaking inside pages */
                tr {
                    page-break-inside: avoid; 
                }
                /* Hide columns with the class 'no-print' */
                .no-print-column {
                    display: none !important;
                }
            </style>
        `);
      this.printWindow.document.write(
        '</head><body class="document-container">'
      );
      this.printWindow.document.write('<div class="document-content">');
      this.printWindow.document.write(printContent.innerHTML);
      this.printWindow.document.write('</div>');
      this.printWindow.document.write('</body></html>');

      this.printWindow.document.close(); 
      this.printWindow.print(); 
    }
  }

  save() {

    // Close the print window if it's open
    if (this.printWindow) {
      this.printWindow.close();
      this.printWindow = null; // Clear the reference
    }
  }

  cancel() {

    if (this.printWindow) {
      this.printWindow.close();
      this.printWindow = null; // Clear the reference
    }
  }

  downloadExcel() {
    const csvData = this.convertToCSV(this.vazhipadDetails);
    const fileName = `vazhipad_report_${this.formatDate(this.currentDate)}.csv`;

    // Create a Blob from the CSV string
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // Create a link to download the Blob
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(data: any[]) {
    const header = Object.keys(data[0]).join(','); // Create CSV header
    const rows = data.map((item) => Object.values(item).join(',')); // Create CSV rows
    return [header, ...rows].join('\n'); // Combine header and rows with line breaks
  }

  private formatDate(date: Date) {
    return date.toLocaleDateString('en-GB').replace(/\//g, '-'); // Format date as dd-mm-yyyy
  }



  backButtonClick() {
    this.router.navigate(['/vmaster']);
  }



  getAllPrathista() {
    this.service.getPmaster().subscribe({
      next: (data) => {
        this.prathistalist = data;
        console.log(this.prathistalist);
      },
    });
  }


  onPrathistaChange(event: Event) {
    const selectedPrathista = (event.target as HTMLSelectElement).value;
    this.prathistaName = this.getPrathistaNameByCode(selectedPrathista);
    this.vazhipadListBasedOnPrathista(selectedPrathista);
    console.log(selectedPrathista);
  }



  getPrathistaNameByCode(code: string): string {
    const prathista = this.prathistalist.find(
      (item: any) => item.PM_Code === code
    );
    if (!prathista) {
      return ''; 
    }
    return this.lang === 'en' ? prathista.PM_Name : prathista.PM_RegName;  
  }


  vazhipadListBasedOnPrathista(prathista: any) {
    if (prathista) {
      console.log(typeof prathista);
      const payLoad = { Type: 'DietywiseVazhipad', Code: prathista };
      this.service
        .getVazhipadListBasedOnPrathistaList(payLoad)
        .subscribe((data) => {
          console.log(data);
          this.vazhipadDetails = data;
          this.sortVazhipadDetails();
        });
    } else {
      this.fetchVazhipadDetails();
    }
  }



  showAllVazhipadWithPrathist() {
    this.router.navigate(['/vazhipadlistwithprathista']);
  }




}
