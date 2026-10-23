import { Component } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { MenuitemsComponent } from '../menuitems/menuitems.component';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [ MatDialogModule, MatButtonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  role:string | null='';
 constructor(public dialog: MatDialog) {

 }

  openDialog() {
    const dialogRef = this.dialog.open(MenuitemsComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}

