import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { StarMaster, UpdateStarRequest } from '../../../models/starmaster.model';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master/master.service';

@Component({
  selector: 'app-star-master',
  standalone: true,
  imports: [
    HeaderComponent,
    SpinnerComponent,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './star-master.component.html',
  styleUrl: './star-master.component.css'
})
export class StarMasterComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  starList: StarMaster[] = [];
  filteredList: StarMaster[] = [];

  selectedStar: StarMaster | null = null;
  form!: FormGroup;

  loading = false;

  constructor(
    private masterService: MasterService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadStarMaster();
  }

  // Form
  initForm() {
    this.form = this.fb.group({
      SM_Code: [{ value: '', disabled: true }],
      SM_NameEng: [{ value: '', disabled: true }],
      SM_Name: [''] // editable
    });
  }

  // Load List
  loadStarMaster() {
    this.loading = true;

    const payload = { "Type": 'ListStar', "Code": '' };

    this.masterService.getMaster(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
         this.starList = res || [];
         this.filteredList = [...this.starList];
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  // Row Click → Load into form
  onSelect(item: StarMaster) {
    this.selectedStar = item;

    this.form.patchValue({
      SM_Code: item.id,
      SM_NameEng: item.SM_NameEng,
      SM_Name: item.SM_Name
    });
  }

  // ✅ Update API
  onUpdate() {
    if (!this.selectedStar) return;

    const updatedName = this.form.value.SM_Name?.trim();
    if (!updatedName) return;

    const payload: UpdateStarRequest = {
      Code: this.selectedStar.SM_Code || '',
      Star: updatedName
    };

    this.loading = true;

    this.masterService.updateStarMaster(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {

          // 🔥 UI update without reload
          const index = this.starList.findIndex(x => x.id === this.selectedStar?.id);
          if (index !== -1) {
            this.starList[index].SM_Name = updatedName;
          }

          this.filteredList = [...this.starList];

          this.onCancel();
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  // ✅ Cancel
  onCancel() {
    this.selectedStar = null;
    this.form.reset();
  }

  // ✅ Search
  onSearch(event: Event) {
  const value = (event.target as HTMLInputElement).value;

  const v = value.toLowerCase();

  this.filteredList = this.starList.filter(x =>
    (x.SM_Name ?? '').toLowerCase().includes(v) ||
    (x.SM_NameEng ?? '').toLowerCase().includes(v)
  );
}
  // ✅ TrackBy
  trackById(index: number, item: StarMaster) {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
