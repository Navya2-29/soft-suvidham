import { Component, OnInit, Type } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { MasterService } from '../../../services/master/master.service';

@Component({
  selector: 'app-thulabaram',
  standalone: true,
  imports: [
    MatIconModule,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

  ],
  templateUrl: './thulabaram.component.html',
  styleUrl: './thulabaram.component.css'
})
export class ThulabaramComponent {
  nakshatham: any[];
  templeName: string | null;
  templeAddress: string | null;
  logo: string | null;
  name: string | null;
  templeLogoUrl: string = '';
  starName: string;
  dupliacteBillData: any;
  itemName: string;
  lang: string | null;
  todayDate = new Date();
  duplicateBillFlag: boolean = false;
  userId: string | null;
  role: string | null;
  CounterId: string | null;
constructor(private service:MasterService,    private ts: TranslateService
){

  this.lang = localStorage.getItem('Language');
  const userLang = navigator.language || 'en';
  const languageCode = userLang.split('-')[0];
  this.ts.setDefaultLang(languageCode);
  this.ts.use(this.lang || 'en');
  this.userId = localStorage.getItem('LoginId');
  this.role = localStorage.getItem('Role');
  this.CounterId = localStorage.getItem('counterId');
  this.templeName = localStorage.getItem('TempleName');
  this.templeAddress = localStorage.getItem('Address');
  this.logo = localStorage.getItem('Logo');
  this.name = localStorage.getItem('name');

  if (this.logo) {
    this.templeLogoUrl = `assets/images/${this.logo}`;
    // console.log(this.templeLogoUrl);
  }
}

ngOninit(){
  this.getStar();
}
getStar() {
  const payLoad = { Type: 'ListStar', Code: '' };
  this.service.getStarData(payLoad).subscribe((res) => {
    this.nakshatham = res;
    // console.log(this.nakshatham);
  });
}



}
