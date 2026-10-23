import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUpperCase]',
  standalone: true
})
export class UpperCaseDirective {

  constructor(private control: NgControl) { }

  @HostListener('input', ['$event']) onInput(event: any) {
    const inputElement = event.target;
    const inputValue = inputElement.value.toUpperCase();
    this.control.control?.setValue(inputValue);
  }

}
