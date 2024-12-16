import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { ChannelChatComponent } from './channel-chat/channel-chat.component';
import { AuthService } from '../../services/authentication.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [ ChannelChatComponent],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {
  activeChannel: Channel | null = null;

  constructor(private channelService: ChannelService, private authSercive: AuthService) {}


  async ngOnInit() {
    this.channelService.activeChannel$.subscribe(channel => {
      this.activeChannel = channel;
    });
  }

  
    
}

