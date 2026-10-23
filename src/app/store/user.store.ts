import { Injectable, signal, computed } from '@angular/core';

export interface UserData {
  name: string;
  username: string;
  password?: string;
  role: string;
  loginId: string;
  createdDt: string;
  days: string;
  templeName: string;
  address: string;
  logo: string;
  counter: string;
  language: string;
  printer: string;
  counterId?: string;
  InstallationDate?: string;
  ExpiryDate?: string;
}

@Injectable({ providedIn: 'root' })
export class UserStore {
  private _user = signal<UserData | null>(null);
  readonly user = computed(() => this._user());

  setUser(data: UserData) {
    this._user.set(data);
    localStorage.setItem('userData', JSON.stringify(data));
  }

  updatePartial(update: Partial<UserData>) {
    const current = this._user();
    if (current) {
      const merged = { ...current, ...update };
      this.setUser(merged);
    }
  }

  clearUser() {
    this._user.set(null);
    localStorage.removeItem('userData');
  }

  loadFromStorage() {
    const data = localStorage.getItem('userData');
    if (data) this._user.set(JSON.parse(data));
  }
}
