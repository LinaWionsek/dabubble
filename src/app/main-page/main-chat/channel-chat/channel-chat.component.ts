import { Component, inject} from '@angular/core';
import { ChannelService } from '../../../services/channel.service';
import { Observable, Subscription } from 'rxjs';
import { Channel } from './../../../models/channel.class';
import { User } from './../../../models/user.class';
import { Firestore, collection, collectionData, doc, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
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

  // private activeChannelSubscription: Unsubscribe | null = null;

  
 
  constructor(private channelService: ChannelService) {}

  ngOnInit() {
    this.subscribeToActiveChannel();
    this.loadUsers();
    // this.listenToActiveChannelChanges();
  }


  subscribeToActiveChannel(){
    this.channelService.activeChannel$.subscribe((channel) => {
      this.activeChannel = channel;
      this.updateActiveChannelUsers();
    })
  }
  

  // listenToActiveChannelChanges(){
  //   const channelDoc = doc(this.firestore, `channels/${this.activeChannel!.id}`);
  //   this.activeChannelSubscription = onSnapshot(channelDoc, (snapshot) => {
  //     const updatedChannel = snapshot.data() as Channel;
  //     this.activeChannel = updatedChannel;
  //     this.updateActiveChannelUsers();
  //   });
  // }


  loadUsers(){
    const userCollection = collection(this.firestore, 'users');
    this.allUsers$ = collectionData(userCollection, { idField: 'id', }) as Observable<User[]>;

    this.allUsers$.subscribe((changes) => { 
      this.users = Array.from(new Map(
        changes
        .map((user) => [user.id, user])).values());
      this.updateActiveChannelUsers();
    });
  }
  


  updateActiveChannelUsers(){
    this.activeChannelUsers = this.users.filter(user => this.activeChannel?.userIds.includes(user.id));
  }

}
