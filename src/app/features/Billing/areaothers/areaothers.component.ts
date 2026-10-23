import { Component, ViewChild } from '@angular/core';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NadavaravuComponent } from '../nadavaravu/nadavaravu.component';
import { CreditcollectionComponent } from '../creditcollection/creditcollection.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { DevoteeFeeCollectionComponent } from '../devotee-fee-collection/devotee-fee-collection.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThulabaramComponent } from '../thulabaram/thulabaram.component';

@Component({
  selector: 'app-areaothers',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatButtonModule,
    MatExpansionModule,
    DevoteeFeeCollectionComponent,
    TranslateModule,
    MatIconModule,
    MatInputModule,
    NadavaravuComponent,
    MatTabsModule,
    CreditcollectionComponent,
    CommonModule,
    ThulabaramComponent,
  ],
  templateUrl: './areaothers.component.html',
  styleUrl: './areaothers.component.css',
})
export class AreaothersComponent {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('feeCollection') feeCollection!: DevoteeFeeCollectionComponent;

  lang: string | null;
  selectedTab = 0;
  constructor(
    private ts: TranslateService,
    private router: Router,
  ) {
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
  }

  goBack() {
    this.router.navigate(['dashboard']);
  }
  onTabChange(event: any) {
    if (event.tab.textLabel === 'Fee Collection' && this.feeCollection) {
      this.feeCollection.resetSearch();
    }
  }
}
