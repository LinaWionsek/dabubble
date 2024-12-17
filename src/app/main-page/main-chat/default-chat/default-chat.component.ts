import { Component } from '@angular/core';
import { ChatHistoryComponent } from "../../../shared-components/chat-history/chat-history.component";
import { ChatInputComponent } from "../../../shared-components/chat-input/chat-input.component";

@Component({
  selector: 'app-default-chat',
  standalone: true,
  imports: [ChatHistoryComponent, ChatInputComponent],
  templateUrl: './default-chat.component.html',
  styleUrl: './default-chat.component.scss'
})
export class DefaultChatComponent {

}
