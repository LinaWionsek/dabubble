import { Component, inject} from '@angular/core';
import { ChannelService } from '../../../services/channel.service';
import { Observable } from 'rxjs';
import { Channel } from './../../../models/channel.class';
import { User } from './../../../models/user.class';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { EditChannelDialogComponent } from './edit-channel-dialog/edit-channel-dialog.component';
import { CommonModule } from '@angular/common';
import { ShowMembersDialogComponent } from './show-members-dialog/show-members-dialog.component';
import { AddMembersDialogComponent } from './add-members-dialog/add-members-dialog.component';
import { ComponentPortal } from '@angular/cdk/portal';
import { ChannelChatHeaderComponent } from "./channel-chat-header/channel-chat-header.component";
import { ChatInputComponent } from "../../../shared-components/chat-input/chat-input.component";
import { ChatHistoryComponent } from "../../../shared-components/chat-history/chat-history.component";

@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [CommonModule, ChannelChatHeaderComponent, ChatInputComponent, ChatHistoryComponent],
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss',
})
export class ChannelChatComponent {
  activeChannel: Channel | null = null;
  
  channels$!: Observable<Channel[]>;
  allUsers$!: Observable<User[]>;
  allUserChannels: Channel[] = [];
  users: User[] = [];
  activeChannelUsers: User[] = [];
  firestore: Firestore = inject(Firestore);
  
 
  constructor(private channelService: ChannelService) {}

  ngOnInit() {
    this.subscribeToActiveChannel();
    this.loadUsers();
  }


  subscribeToActiveChannel(){
    this.channelService.activeChannel$.subscribe((channel) => {
      this.activeChannel = channel;
      this.updateActiveChannelUsers();
    })
  }
  


  loadUsers(){
    const userCollection = collection(this.firestore, 'users');
    this.allUsers$ = collectionData(userCollection, { idField: 'id', }) as Observable<User[]>;

    this.allUsers$.subscribe((changes) => { 
      this.users = Array.from(new Map(changes.map((user) => [user.id, user])).values());
      this.updateActiveChannelUsers();
    });
  }

  updateActiveChannelUsers(){
    this.activeChannelUsers = this.users.filter(user => this.activeChannel?.userIds.includes(user.id));
  }


}
