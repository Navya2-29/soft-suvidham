import { AbstractControl, ValidatorFn } from '@angular/forms';

// Custom validator function
export function minDateValidator(minDate: Date): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) {
      return null; // No value, so return null
    }
    
    const selectedDate = new Date(control.value);
    if (selectedDate <= minDate) {
      return { invalidDate: true }; // Return invalid date error
    }
    
    return null; // Return null if valid
  };
}
