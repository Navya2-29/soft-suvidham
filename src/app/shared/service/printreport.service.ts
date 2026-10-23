import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrintreportService {
  constructor() {}

  generatePDF() {
    const printContent = document.getElementById('print-section');
    if (!printContent) {
      console.error('No content found to print');
      return;
    }

    const WindowPrt = window.open('', '', 'width=800,height=600');

    // Check if the print window was successfully opened
    if (!WindowPrt) {
      console.error(
        'Unable to open print window. Please check pop-up blockers.'
      );
      return;
    }

    WindowPrt.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          @media print {
            body {
              margin: 20px 20px 20px 10px; /* top, right, bottom, left */
            }

            .page-break {
              page-break-before: always;
              margin-top: 10px;
              padding-top:10px;

            }
              #print-section{
              margin: 20px 20px 20px 10px;
              padding:10px;
              }
          }

          body {
            font-family: Manjari, sans-serif;
            margin: 20px 20px 20px 10px;
          }
     .templename{
          line-height:1;
          margin-top:10;
          text-align:center;
          font-family:Manjari;
          font-size:14px;
          font-weight:normal;
          margin-bottom:0;
          text-align:center;
          }
          h4{
          
          margin-top:3px;
          text-align:center;
           font-family:Manjari;
          font-size:10px;
           margin-bottom:0;
           font-weight:bold;
          }
          h2{
          margin-top:5px;
          text-align:center;
          font-family:Manjari;
          font-size:14px;
          margin-bottom:0;
          font-weight:bold;
          }
          h2.category{
     
    font-family: Manjari;

    font-size: 12px;
    margin:0;
    left:5px;
    font-weight: 800;
    text-transform: uppercase;
     text-align:left;
}
     h3.subcategory{
      font-family: Manjari;

    font-size: 12px;
    margin:0;
    font-weight: 800;
    text-transform: uppercase;
     text-align:left;
     }
     h2.transactions{
      font-family: Manjari;

    font-size: 12px;
    margin:0;
    font-weight: 800;
    text-transform: uppercase;
     text-align:left;
     }
          p.date{
           margin-top:5px;
          text-align:center;
          font-family:Manjari;
          font-size:10px;
          margin-bottom:0;
          font-weight:normal;
          }
         
          hr{
          height:2px;
          background-color:gray;
          }
          .tabble-heading h3{
  font-family: Manjari;
  font-weight: bold;
  font-size: 10px;
  margin: 10px 0 10px 10px;
}
.tabble-heading {
  page-break-inside: avoid;
  break-inside: avoid;
  margin-top: 10px;
  text-align:left;
  margin-left:10px;
}
  .tabble-headings {

  margin-top: 10px;
  text-align:left;
  margin-left:10px;
}
  .tabble-headings {
  // page-break-inside: avoid;
  // break-inside: avoid;
  margin-top: 10px;
  text-align:left;
  margin-left:10px;
}
          table {
           min-width: 100%;
            border-collapse: collapse;
            margin:5px 10px 10px 10px;
            
          }
          table, th{
            border: 1px solid black;
            text-transform: uppercase;
            font-size:10px;
            font-weight:bold;
            padding:3px;
            font-family:Manjari;
          }

          table, td {
            border: 1px solid black;
            text-transform: uppercase;
            font-size:10px;
            font-weight:normal;
            padding:5px;
            font-family:Manjari;
            
   vertical-align: top;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
          }
           
          th, td {
            text-align: left;
          }
            .sino{
            width:10%
            }
            .name{
            width:40%
            }
            .star{
            width:35%;

            }
            .qty{
            width:15%
            }

            #print-section{
padding-bottom: 100px;
margin:20px 10px;
  }
p.transaction{
    margin-left:10px;
    
      font-family:Manjari;

    font-size: 11px;
    text-decoration: underline;
    font-weight: bold;
    margin-bottom:0px;
    
    
 page-break-inside: avoid;
  break-inside: avoid;
}
  p.transactions{
    margin-left:10px;
    
      font-family:Manjari;

    font-size: 11px;
    text-decoration: underline;
    font-weight: bold;
    margin-bottom:0px;
    
    
//  page-break-inside: avoid;
//   break-inside: avoid;
}
p.member{
text-align:left;
margin-bottom:0px;
margin-top:0px;
}
h4.member{
text-align:left;
margin-bottom:0px;
margin-top:0px;
}
p.transactiontype{
 margin-left:10px;
 page-break-inside: avoid;
  break-inside: avoid;
    
      
    margin-bottom:0px;
    
    
 page-break-inside: avoid;
  break-inside: avoid;
  margin-top:0px;
}
p.category{
    font-family: Manjari;
    font-size: 10px;
    
    font-weight: 800;
    text-transform: uppercase;
  margin-left:10px;
  margin-top:0px;
  page-break-inside: avoid;
  break-inside: avoid;

}
.transactionTable{
    margin-bottom: 10px;
   
}
.number{
    text-align: right;
    padding:5px;
    vertical-align: middle;
    /* font-weight: bold; */
}
.total{

    text-align: right;
    font-weight: bold;
    font-size: 12px;
}
   h5#totalamount {
  /* font-family: "Times New Roman", Times, serif; */
  font-family: Manjari;
  font-weight: bolder;
  font-size: 12px;
  color: maroon;
  margin-bottom: 0px;
  margin-top:0px;
}
  td.bold{
  font-weight:bold;
  font-size:12px;
  }
 
h5.totalcounter {
  /* font-family: "Times New Roman", Times, serif; */
  font-family: Manjari;
  font-weight: bolder;
  font-size: 12px;
  color: rgb(18, 18, 117);
  margin-bottom: 0px;
  margin-top:0px;

}
.transactionTotal{
  // font-family: 'Times New Roman', Times, serif; 
  font-family:Manjari;
  font-weight: bold;
  margin-top: 10px;
  text-align: right;
  margin-bottom: 5px;
  font-size: 12px;

}
.grandtotal{
    text-align: right;
    // font-family: 'Times New Roman', Times, serif;
    font-family:Manjari;
    font-weight:bolder;
    color: red;
    font-size: 14px;
    margin: 10px 0;


}

.grandtotal h1{
text-align: right;
    // font-family: 'Times New Roman', Times, serif;
    font-family:Manjari;
    font-weight:bolder;
    color: red;
    font-size: 14px;
    margin: 0px 0;
}

.table{
            border-collapse: collapse;
border:1px solid black;
}

.feetable{
 margin-top:3px;

}
 .vihidhamcategory{
  page-break-before: always;
              margin-top: 10px;
              padding-top:10px;
 }
 .fee{
 margin-bottom:0px;
 font-family:Manjari;
 font-size:12px;
 }

p.counter {
  text-align: left !important;
  font-family: Manjari;
  margin-left: 10px;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom:0px;
   margin-top:0px;
  page-break-inside: avoid;
  break-inside: avoid;
  page-break-inside: avoid;
  break-inside: avoid;
}
p.user {
  text-align: left !important;
  margin-left: 10px;
    font-family: Manjari;
  font-size: 11px;
  color: maroon;
  text-transform: uppercase;
  margin-bottom:0px;
   margin-top:0px;
  page-break-inside: avoid;
  break-inside: avoid;
  page-break-inside: avoid;
  break-inside: avoid;
}
  .devoteecreditdata{
  }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
    </html>
  `);

    WindowPrt.document.close();
    WindowPrt.focus();

    // Make sure that the window is still valid before calling print and close
    if (WindowPrt) {
      WindowPrt.print();
      WindowPrt.close();
    }
  }
}
