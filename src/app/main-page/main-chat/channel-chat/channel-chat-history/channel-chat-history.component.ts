import { Component } from '@angular/core';
import { MessageComponent } from "../../../../shared-components/message/message.component";

@Component({
  selector: 'app-channel-chat-history',
  standalone: true,
  imports: [MessageComponent],
  templateUrl: './channel-chat-history.component.html',
  styleUrl: './channel-chat-history.component.scss'
})
export class ChannelChatHistoryComponent {

}
