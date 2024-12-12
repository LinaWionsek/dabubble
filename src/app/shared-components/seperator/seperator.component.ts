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
    this.setDateInput()

  }


  setDateInput(){
    const currentDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(currentDate.getDate() - 1);

    const currentDateString = this.formatDate(currentDate); 
    const yesterdayDateString = this.formatDate(yesterdayDate); 

    if (this.date === currentDateString) {
      this.formattedDate = 'Heute'; 
    } else if (this.date === yesterdayDateString) {
      this.formattedDate = 'Gestern'; 
    } else {
      this.formattedDate = this.date; 
    }

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
