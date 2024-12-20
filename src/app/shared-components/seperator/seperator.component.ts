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
    console.log(this.date);
    this.setDateInput();
  }


  setDateInput(){
    const currentDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(currentDate.getDate() - 1);

    const currentDateString = this.formatDate(currentDate); 
    const yesterdayDateString = this.formatDate(yesterdayDate); 

    const inputDate = this.parseDate(this.date);
    const inputDateString = this.formatDate(inputDate);

    if (inputDateString === currentDateString) {
      this.formattedDate = 'Heute'; 
    } else if (inputDateString === yesterdayDateString) {
      this.formattedDate = 'Gestern'; 
    } else {
      this.formattedDate = inputDateString; 
    }

  }


  parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('.').map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }


  formatDate(date: Date){
    const formatter = new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',  
      day: '2-digit',  
      month: 'long',  
    });

    return formatter.format(date);
  }
}
