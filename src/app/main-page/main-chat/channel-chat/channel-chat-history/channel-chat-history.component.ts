import { Component } from '@angular/core';
import { MessageComponent } from "../../../../shared-components/message/message.component";
import { SeperatorComponent } from '../../../../shared-components/seperator/seperator.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channel-chat-history',
  standalone: true,
  imports: [MessageComponent, SeperatorComponent, FormsModule, CommonModule],
  templateUrl: './channel-chat-history.component.html',
  styleUrl: './channel-chat-history.component.scss'
})
export class ChannelChatHistoryComponent {


  message1 = {
    "id": '1',
    "chatId": '123',
    "reactions": [],
    "timeStamp": new Date(),
    "messageText": "Hallo",
    "senderId": "vp5SdrqdKfMteNnXuw5V2TAcWco1"
  }

  
  message2 = {
    "id": '1',
    "chatId": '123',
    "reactions": [],
    "timeStamp": new Date(),
    "messageText": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam",
    "senderId": "vp5SdrqdKfMteNnXuw5V2TAcWco2"
  }

}
