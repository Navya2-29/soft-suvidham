import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';



import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MorebuttonComponent } from '../morebutton/morebutton.component';

export interface vazhipad {
  name: string;
}

@Component({
  selector: 'app-othervazhipad',
  standalone: true,
  imports: [MatCheckboxModule, MatInputModule, MatAutocompleteModule, FormsModule, ReactiveFormsModule, AsyncPipe, MatIconModule, MorebuttonComponent],
  templateUrl: './othervazhipad.component.html',
  styleUrl: './othervazhipad.component.css'
})
export class OthervazhipadComponent {

  vazhipadCtrl = new FormControl('');
 filteredvazhipad: Observable<vazhipad[]>;
  vazhipad: vazhipad[] = [
    {name: 'Pushpanjali'},
    {name: 'Abhishekam Pooja'},
    {name: 'Florida'},
    {name: 'Texas'},
  ];

  constructor() {
    this.filteredvazhipad = this.vazhipadCtrl.valueChanges.pipe(
      map(vazhipad => (vazhipad ? this._filtervazhipad(vazhipad) : this.vazhipad.slice())),
    );
  }

  private _filtervazhipad(value: string): vazhipad[] {
    const filterValue = value.toLowerCase();

    return this.vazhipad.filter(vazhipad => vazhipad.name.toLowerCase().includes(filterValue));
  }

}
