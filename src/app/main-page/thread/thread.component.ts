import { Component } from '@angular/core';
import { ChatHistoryComponent } from "../../shared-components/chat-history/chat-history.component";
import { ChatInputComponent } from "../../shared-components/chat-input/chat-input.component";

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ChatHistoryComponent, ChatInputComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  // usecase = 'thread'

}
