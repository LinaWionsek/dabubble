import { Component } from '@angular/core';
import { MessageComponent } from "../../../../shared-components/message/message.component";
import { SeperatorComponent } from '../../../../shared-components/seperator/seperator.component';

@Component({
  selector: 'app-channel-chat-history',
  standalone: true,
  imports: [MessageComponent, SeperatorComponent],
  templateUrl: './channel-chat-history.component.html',
  styleUrl: './channel-chat-history.component.scss'
})
export class ChannelChatHistoryComponent {

}
