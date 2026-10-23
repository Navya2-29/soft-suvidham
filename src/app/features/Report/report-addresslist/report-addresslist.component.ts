import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { jsPDF } from 'jspdf'; 
import {ReportData} from '../../../models/poornam-report'
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Location } from '@angular/common';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-report-addresslist',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule],
  templateUrl: './report-addresslist.component.html',
  styleUrl: './report-addresslist.component.css'
})
export class ReportAddresslistComponent {

  displayedColumns: string[] = ['BillNo','BillDate','Prathista','Vazhipad', 'Name', 'Star', 'Qty', 'Rate', 'Amount',  'VazhiDate', ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  constructor(private route: ActivatedRoute, private service: ReportService,private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      const fromDate = params['fromDate'];
      const toDate = params['toDate'];
      this.fetchReportData(type, fromDate, toDate);
    });
  }



 // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    const payLoad = {
      Type: type,
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
        this.data = data.sort((a:any, b:any) => {
          const [numA, denomA] = a.BillNo.split('/').map(Number);
          const [numB, denomB] = b.BillNo.split('/').map(Number);
          
          // Compare the two parts: first compare the numerator, then the denominator
          return numA - numB || denomA - denomB;
      });
        this.dataSource.data = this.data
        this.length = data.length; 
        this.dataSource.paginator = this.paginator;
        
        this.groupedData = this.groupByVazhipad(data);
        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }


  groupByVazhipad(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce((acc, current) => {
        const key = `${current.Vazhipad}-${current.Prathista}`; 
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(current);
        return acc;
    }, {} as { [key: string]: ReportData[] });
  }


  generatePDF() {
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.width;
    const title = 'Vazhipad Report';
    doc.setFontSize(18);
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);
    
    const currentDate = new Date().toLocaleDateString('en-IN'); 
    doc.setFontSize(12);
    const dateWidth = doc.getTextWidth(currentDate);
    doc.text(currentDate, (pageWidth - dateWidth) / 2, 28);
    
    let y = 35; // Starting Y position for the first page
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 6; // Reduced line height for closer spacing
    const smallSpacing = 3; // Reduced spacing value between entries
    const headerSpacing = 5; // Space between header and content
    const groupTitleSpacing = 2; // Reduced space after the group title
    const contentSpacing = 5; // Increased space between underline and first content
  
    // Function to draw the header
    const drawHeader = (yPos: number) => {
        doc.setFillColor(230, 230, 250);
        doc.rect(10, yPos, pageWidth - 20, lineHeight, 'F');

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text('Sl No', 14, yPos + 5);
        doc.text('Name', 40, yPos + 5);
        doc.text('Star', 80, yPos + 5);
        doc.text('Qty', 120, yPos + 5);
        doc.text('BillNo', 160, yPos + 5);
    };

    drawHeader(y); // Draw header for the first page
    y += lineHeight + headerSpacing; // Move down to start the table content
  
    let serialNumber = 1;

    for (const [vazhipad, entries] of Object.entries(this.groupedData)) {
        y += smallSpacing; // Smaller spacing before group title
  
        // Check if we need to add a new page
        if (y + lineHeight > pageHeight) {
            doc.addPage();
            y = 20; // Reset y position for the new page
            drawHeader(y); // Redraw the header
            y += lineHeight + headerSpacing; // Move down to start the table content after the header
        }
  
        // Group title
        doc.setFontSize(12);
        doc.text(vazhipad, 14, y);
        y += groupTitleSpacing; // Move down slightly for the underline
  
        // Draw bottom border for the group title directly below the group name
        doc.setDrawColor(0); // Set color for the border (black)
        doc.line(10, y, pageWidth - 10, y); // Draw a line across the page width
        y += contentSpacing; // Increase space between the underline and the first content
  
        // Set font size for table content once here to maintain consistency
        doc.setFontSize(12);
  
        for (const entry of entries) {
            // Check if we need to add a new page
            if (y + lineHeight > pageHeight) {
                doc.addPage();
                y = 20; // Reset y position for the new page
                drawHeader(y); // Redraw the header
                y += lineHeight + headerSpacing; // Move down to start the table content after the header
            }
  
            // Table content
            doc.setFont("Helvetica", "normal");
            doc.text(String(serialNumber), 14, y);
  
            // Wrapping Name text
            doc.setFont('NotoSansMalayalam', 'normal');
            const nameWidth = 140; // Set the max width for the name column
            const nameLines = doc.splitTextToSize(entry.Name, nameWidth);
            doc.text(nameLines, 40, y);
  
            doc.setFont("Helvetica", "normal");
            doc.text(entry.Star, 80, y);
            doc.text(String(entry.Qty), 120, y);
            doc.text(String(entry.BillNo), 160, y);
  
            // Adjust y based on number of lines in Name
            y += lineHeight * Math.max(1, nameLines.length); 
            serialNumber++;
        }
  
        y += smallSpacing; // Apply smaller space between groups
    }
  
    doc.save('poornam_report.pdf');
}

// pagechange for paginator
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
  
  goBack(): void {
    console.log('Going back...'); // Log to verify method execution
    this.router.navigate(['/getReport']);
  }

}
