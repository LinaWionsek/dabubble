import { Component, Input } from '@angular/core';
import { Message } from './../../models/message.class'
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.class';


@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  @Input() currentUser!: User | null;
  @Input() message!: Message;
  messageClockTimer = '';



  
  formatMessageTime(timeStamp:string){
    const time = timeStamp.split('T')[1].split('Z')[0]; 
    const [hours, minutes] = time.split(':'); 
    return `${hours}:${minutes}`;
  }
}
