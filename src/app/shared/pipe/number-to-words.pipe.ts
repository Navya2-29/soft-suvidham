import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberToWords',
  standalone: true
})
export class NumberToWordsPipe implements PipeTransform {

  // transform(value: unknown, ...args: unknown[]): unknown {
  //   return null;
  // }



  private ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  private tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  transform(value: number): string {
    if (!value) return 'Zero';
    return this.convertToWords(value);
  }

  private convertToWords(num: number): string {
    if (num < 20) return this.ones[num];
    if (num < 100) return this.tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + this.ones[num % 10] : '');
    if (num < 1000) return this.ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + this.convertToWords(num % 100) : '');
    if (num < 1000000) return this.convertToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + this.convertToWords(num % 1000) : '');
    if (num < 1000000000) return this.convertToWords(Math.floor(num / 1000000)) + ' Million' + (num % 1000000 !== 0 ? ' ' + this.convertToWords(num % 1000000) : '');
    return this.convertToWords(Math.floor(num / 1000000000)) + ' Billion' + (num % 1000000000 !== 0 ? ' ' + this.convertToWords(num % 1000000000) : '');
  }

}
