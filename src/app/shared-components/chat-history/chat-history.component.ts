import { Component, Input } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { SeperatorComponent } from '../seperator/seperator.component';
import { Channel } from '../../models/channel.class';

@Component({
  selector: 'app-chat-history',
  standalone: true,
  imports: [MessageComponent, SeperatorComponent],
  templateUrl: './chat-history.component.html',
  styleUrl: './chat-history.component.scss'
})
export class ChatHistoryComponent {
  @Input() channelData?: Channel | undefined;
  @Input() usedFor = '';

}
