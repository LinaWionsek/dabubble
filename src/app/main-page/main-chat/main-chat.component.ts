import { Component, OnInit, HostListener } from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { ChannelChatComponent } from './channel-chat/channel-chat.component';
import { AuthService } from '../../services/authentication.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { DmChatComponent } from './dm-chat/dm-chat.component';
import { DefaultChatComponent } from './default-chat/default-chat.component';
import { ChatService } from '../../services/dm-chat.service';
import { ThreadService } from '../../services/thread.service';
import { ThreadComponent } from '../thread/thread.component';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [ ChannelChatComponent, DmChatComponent, DefaultChatComponent, ThreadComponent],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {
  activeChannel: Channel | null = null;
  activeChat: User | null = null;
  threadActivated = false;
  isSmallScreen = window.innerWidth <= 1100;


  constructor(private channelService: ChannelService, private authSercive: AuthService, private chatService: ChatService, private threadService: ThreadService) {}


  ngOnInit() {
    this.subscribeToServices();
    this.updateScreenSize();
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateScreenSize();
  }


  updateScreenSize(){
    this.isSmallScreen = window.innerWidth <= 1100;
  }


  subscribeToServices(){
    this.channelService.activeChannel$.subscribe(channel => {
      this.activeChannel = channel;
    });

    this.chatService.activeUserChat$.subscribe(user => {
      this.activeChat = user;
    })

    this.threadService.threadActivated$.subscribe((activated) => {
      this.threadActivated = activated;
    });
  }
    
}

