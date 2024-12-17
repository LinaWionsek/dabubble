import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { ChannelChatComponent } from './channel-chat/channel-chat.component';
import { AuthService } from '../../services/authentication.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { DmChatComponent } from './dm-chat/dm-chat.component';
import { DefaultChatComponent } from './default-chat/default-chat.component';
import { ChatService } from '../../services/dm-chat.service';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [ ChannelChatComponent, DmChatComponent, DefaultChatComponent],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {
  activeChannel: Channel | null = null;
  activeChat: User | null = null;

  constructor(private channelService: ChannelService, private authSercive: AuthService, private chatService: ChatService) {}


  ngOnInit() {
    this.channelService.activeChannel$.subscribe(channel => {
      this.activeChannel = channel;
    });

    this.chatService.activeUserChat$.subscribe(user => {
      this.activeChat = user;
    })
  }

  
    
}

