import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hallbooking',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './hallbooking.component.html',
  styleUrl: './hallbooking.component.css'
})
export class HallbookingComponent {
form: any = {};
  balance: number = 0;

  searchText = '';
  selectedBooking: any = null;
  payAmount: number = 0;

  bookings: any[] = [
    {
      id: 1,
      name: 'Ravi Kumar',
      mobile: '9876543210',
      hall: 'Main Hall',
      date: '2026-05-10',
      total: 10000,
      advance: 3000,
      balance: 7000,
      status: 'Partial'
    }
  ];

  halls = [
    { name: 'Main Hall' },
    { name: 'Dining Hall' },
    { name: 'Small Hall' }
  ];

  // 🔹 Calculate balance
  calc() {
    this.balance = (this.form.total || 0) - (this.form.advance || 0);
  }

  // 🔹 Save booking
  saveBooking() {

    const newBooking = {
      id: this.bookings.length + 1,
      name: this.form.name,
      mobile: this.form.mobile,
      hall: this.form.hall,
      date: this.form.date,
      total: this.form.total,
      advance: this.form.advance,
      balance: this.balance,
      status: this.balance === 0 ? 'Paid' : 'Partial'
    };

    this.bookings.push(newBooking);

    alert('Booking Saved');

    this.form = {};
    this.balance = 0;
  }

  // 🔹 Search booking
  search() {
    this.selectedBooking = this.bookings.find(b =>
      b.mobile === this.searchText || b.id == this.searchText
    );

    if (!this.selectedBooking) {
      alert('Booking not found');
    }
  }

  // 🔹 Collect payment
  collect() {

    if (!this.selectedBooking || !this.payAmount) return;

    this.selectedBooking.balance -= this.payAmount;

    if (this.selectedBooking.balance < 0) {
      this.selectedBooking.balance = 0;
    }

    this.selectedBooking.status =
      this.selectedBooking.balance === 0 ? 'Paid' : 'Partial';

    alert('Payment Updated');

    this.payAmount = 0;
  }
}
