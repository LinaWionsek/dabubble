import { Component } from '@angular/core';
import { ChatService } from '../../../services/dm-chat.service';
import { User } from '../../../models/user.class';
import { ChatHistoryComponent } from "../../../shared-components/chat-history/chat-history.component";
import { ChatInputComponent } from "../../../shared-components/chat-input/chat-input.component";
import { UserProfileComponent } from '../../../shared-components/user-profile/user-profile.component';

@Component({
  selector: 'app-dm-chat',
  standalone: true,
  imports: [ChatHistoryComponent, ChatInputComponent, UserProfileComponent],
  templateUrl: './dm-chat.component.html',
  styleUrl: './dm-chat.component.scss'
})
export class DmChatComponent {

  activeChatUser: User | null = null;
  userProfileOpened = false;

  constructor(private chatService: ChatService){}

  ngOnInit(){
    this.subscribeToActiveChat();
  }

  subscribeToActiveChat(){
    this.chatService.activeUserChat$.subscribe(user => {
      this.activeChatUser = user
    })

  }


  showUserProfile(){
    this.userProfileOpened = true;
  }

  hideUserProfile(){
    this.userProfileOpened = false;
  }

}
