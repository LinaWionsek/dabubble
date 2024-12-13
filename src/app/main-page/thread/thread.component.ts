import { Component } from '@angular/core';
import { ChatHistoryComponent } from "../../shared-components/chat-history/chat-history.component";
import { ChatInputComponent } from "../../shared-components/chat-input/chat-input.component";
import { ThreadService } from '../../services/thread.service';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../models/channel.class';
import { Message } from '../../models/message.class';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ChatHistoryComponent, ChatInputComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  activeChannel: Channel | null = null;
  activeMessage: Message | null = null;

  constructor(private threadService: ThreadService, private channelService: ChannelService){}


  ngOnInit(){
    this.subscribeToChannelService();
    this.subscribeToThreadService();
    console.log(this.activeChannel);
    console.log(this.activeMessage);
  }


  subscribeToChannelService(){
    this.channelService.activeChannel$.subscribe((channel) => {
      this.activeChannel = channel;
    })
  }


  subscribeToThreadService(){
    this.threadService.activeMessage$.subscribe((message) => {
      this.activeMessage = message;
    })
  }

 

  closeThread(){
    this.threadService.deactivateThread();
  }

}
