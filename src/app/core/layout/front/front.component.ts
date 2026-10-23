import { MasterService } from './../../../services/master/master.service';
import { ToastrService } from 'ngx-toastr';
import { AfterViewInit, Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CouterPopupComponent } from '../../couter-popup/couter-popup.component';
import { AuthService } from '../../auth/service/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../header/header.component';
@Component({
  selector: 'app-front',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
    TranslateModule,
    HeaderComponent,
  ],
  templateUrl: './front.component.html',
  styleUrl: './front.component.css',
})
export class FrontComponent {
  hide: boolean = true;
  loading: boolean = false;
  errorMessage = '';
  templeName: string | null;
  logo: string | null;
  todayDate: Date = new Date();
  Role: string | null;
  countercount: number;
  allowedContercount: number | null;
  @ViewChild('billingButton') billingButton: ElementRef | undefined;
  @ViewChild('reportButton') reportButton: ElementRef | undefined;
  @ViewChild('nadavaruButton') nadavaruButton: ElementRef | undefined;
  buttons: ElementRef[] = [];
  ipAddress: string = '';
  currentIndex: number = 0;
  deviceName: string | undefined;
  lang :string | null;
  constructor(

    private renderer: Renderer2,
    private router: Router,

    private ts: TranslateService
  ) {
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.templeName = localStorage.getItem('TempleName');
    this.logo = localStorage.getItem('Logo');
    this.Role = localStorage.getItem('Role');
  }
  ngOnInit(): void {


  }



getlogo(){
return `${window.location.origin}/apis/TempleLogo/${this.logo}`;
// console.log(`${window.location.origin}/apis/TempleLogo/${this.logo}`)
}


















  goBack(){
    this.router.navigate(['/Home']);

  }
}
