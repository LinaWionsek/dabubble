import { Component, HostListener, inject } from '@angular/core';
import { ChatHistoryComponent } from "../../shared-components/chat-history/chat-history.component";
import { ChatInputComponent } from "../../shared-components/chat-input/chat-input.component";
import { ThreadService } from '../../services/thread.service';
import { ChannelService } from '../../services/channel.service';
import { Firestore, doc, collection, collectionData } from '@angular/fire/firestore';

import { Channel } from '../../models/channel.class';
import { Message } from '../../models/message.class';
import { MessageComponent } from "../../shared-components/message/message.component";
import { Observable } from 'rxjs';
import { AuthService } from '../../services/authentication.service';
import { User } from '../../models/user.class';
import { ChatService } from '../../services/dm-chat.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ChatHistoryComponent, ChatInputComponent, CommonModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  activeChannel: Channel | null = null;
  activeMessage: Message | null = null;
  currentUser?: User | null;
  activeChatUser?: User | null;
  isSmallScreen = window.innerWidth <= 1100;
  

  firestore: Firestore = inject(Firestore);


  constructor(private threadService: ThreadService, private channelService: ChannelService, private authService: AuthService, private chatService: ChatService){}


  ngOnInit(){
    this.subscribeToChannelService();
    this.subscribeToThreadService();
    this.subscribeToActiveChatService();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateScreenSize();
  }

  updateScreenSize(){
    this.isSmallScreen = window.innerWidth <= 1100;
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

  subscribeToActiveChatService(){
    this.chatService.activeUserChat$.subscribe(user => {
      this.activeChatUser = user
    })
  }


  

  closeThread(){
    this.threadService.deactivateThread();
  }

}
