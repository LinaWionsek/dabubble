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
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceComponent } from '../workspace/workspace.component';
import { AddChannelDialogComponent } from '../add-channel-dialog/add-channel-dialog.component';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [ ChannelChatComponent, DmChatComponent, DefaultChatComponent, ThreadComponent, WorkspaceComponent, AddChannelDialogComponent],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {
  activeChannel: Channel | null = null;
  activeChat: User | null = null;
  threadActivated = false;
  isSmallScreen = window.innerWidth <= 1100;
  isSmallerScreen = window.innerWidth <= 900;
  workspaceActivated = false;
  addChannelDialogOpened = false;


  constructor(
    private channelService: ChannelService, 
    private authSercive: AuthService, 
    private chatService: ChatService, 
    private threadService: ThreadService,
    private workspaceService: WorkspaceService
  ) {}


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
    this.isSmallerScreen = window.innerWidth <= 900;
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

    this.workspaceService.workspaceActivated$.subscribe((activated) => {
      this.workspaceActivated = activated;
    })
  }

  handleDialogStateChange(dialogState: boolean) {
    this.addChannelDialogOpened = dialogState;
  }
    
}

