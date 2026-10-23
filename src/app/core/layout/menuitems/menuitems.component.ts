import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
type UserRole = 'admin' | 'super' | 'staff' | 'audit';
interface MenuLink {
  label: string;
  path: string;
  roles?: UserRole[];
}
@Component({
  selector: 'app-menuitems',
  standalone: true,
  imports:[CommonModule,MatDialogModule,MatButtonModule],
  templateUrl: './menuitems.component.html',
  styleUrls: ['./menuitems.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuitemsComponent {

  /*  Inject services  */
  private router = inject(Router);
  private translate = inject(TranslateService);
private dialogRef = inject(MatDialogRef<MenuitemsComponent>);
  /*  State */
  templeName: string = this.getStorageValue('TempleName');
  role: UserRole = (this.getStorageValue('Role') as UserRole) || 'user';
  lang: string = this.getStorageValue('Language') || 'en';

  constructor() {
    this.translate.use(this.lang);
  }

  /* Masters Menu */
  masterLinks: MenuLink[] = [
    { label: 'Category Master', path: '/cmaster' },
    { label: 'Prathishta Master', path: '/pmaster' },
    { label: 'Vazhipad Master', path: '/vmaster' },
    { label: 'Vazhipad Blocking', path: '/vazhipad-blocking' },
    { label: 'Vazhipad Seasonal', path: '/seasonal' },
    { label: 'Day Master', path: '/day-master' },
    { label: 'Item Master', path: '/item-master' },
    { label: 'Vihidam Category Master', path: '/vihidham-category-master' },
    { label: 'Vihidam Rate Master', path: '/vihidham-master' },
    { label: 'Gothram Master', path: '/gothram-master' },
    {label:'Star Master',path:'/star-master'}

  ];


  /* Utilities Menu (Role-Based) */
  utilityLinks: MenuLink[] = [
    { label: 'Billing', path: '/dashboard' },
    { label: 'Miscellaneous Billing', path: '/mattinagal' },
    { label: 'Signup', path: '/userSignup', roles: ['admin', 'super'] },
    { label: 'Settings', path: '/settings', roles: ['super'] },
    { label: 'Endowment', path: '/endowment' },
    // {label:'Hall Booking',path:'/hallbooking'},
    // {label:"Dayend",path:'/dayend'}
  ];

  /*  Navigation Handler */
   navigate(path: string | undefined): void {
  if (!path || this.role === 'audit') return;

  this.router.navigate([path]).then(() => {
    this.dialogRef.close(true);
  });
}

  /*  Role Access Check */
  hasAccess(link: MenuLink): boolean {
    return !link.roles || link.roles.includes(this.role);
  }

  /*  TrackBy (performance) */
  trackByLabel(index: number, item: MenuLink): string {
    return item.label;
  }

  /*  Safe LocalStorage Access */
  private getStorageValue(key: string): string {
    return localStorage.getItem(key) ?? '';
  }

}
