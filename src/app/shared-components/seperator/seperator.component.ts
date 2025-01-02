import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-seperator',
  standalone: true,
  imports: [],
  templateUrl: './seperator.component.html',
  styleUrl: './seperator.component.scss'
})
export class SeperatorComponent {
  @Input() date: string = '';
  formattedDate: string = '';


  ngOnInit(){
    this.setDateInput();
  }


  setDateInput() {
    const currentDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(currentDate.getDate() - 1);

    const inputDate = this.parseDate(this.date);

    if (this.isSameDate(inputDate, currentDate)) {
      this.formattedDate = 'Heute'; 
    } else if (this.isSameDate(inputDate, yesterdayDate)) {
      this.formattedDate = 'Gestern'; 
    } else {
      this.formattedDate = this.formatDate(inputDate); 
    }
  }


  parseDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day); 
  }


  isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }


  formatDate(date: Date): string {
    const formatter = new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
    return formatter.format(date);
  }
}
