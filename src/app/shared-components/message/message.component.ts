import { Component, Input } from '@angular/core';
import { Message } from './../../models/message.class'

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() message: Message = new Message();

  currentUserId = "vp5SdrqdKfMteNnXuw5V2TAcWco2";

}
