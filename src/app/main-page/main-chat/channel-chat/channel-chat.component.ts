import { Component, inject, ElementRef, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [EditChannelDialogComponent, CommonModule, ShowMembersDialogComponent, AddMembersDialogComponent, ChannelChatHeaderComponent],
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss',
})
export class ChannelChatComponent {
  editChannelDialogOpened = false;
  showMembersDialogOpened = false;
  addMembersDialogOpened = false;

  editChannelDialogPosition = { top: '0px', left: '0px' };
  showMembersDialogPosition = { top: '0px', left: '0px' };
  addMembersDialogPosition = { top: '0px', left: '0px' };

  activeChannel: string | null = null;
  activeChannelData!: Channel | undefined;
  channels$!: Observable<Channel[]>;
  allUsers$!: Observable<User[]>;
  allUserChannels: Channel[] = [];
  users: User[] = [];
  activeChannelUsers: User[] = [];
  firestore: Firestore = inject(Firestore);

 
  constructor(private channelService: ChannelService) {}

  ngOnInit() {
    this.channelService.activeChannel$.subscribe(channelId => {
      if(this.activeChannel !==channelId){
        this.activeChannel = channelId;
        this.updateActiveChannelData();
        this.getActiveChannelUsers();
      }
    });

    this.getUserChannels();
    this.getAllUsers();
  }

  getUserChannels() {
    const userChannelsCollection = collection(this.firestore, 'channels');
    this.channels$ = collectionData(userChannelsCollection, {
      idField: 'id',
    }) as Observable<Channel[]>;

    this.channels$.subscribe((changes) => {
      this.allUserChannels = Array.from(new Map(changes.map(channel => [channel.id, channel])).values());
      
      const updatedChannel = this.allUserChannels.find(channel => channel.id === this.activeChannel);
      if (updatedChannel) {
        this.activeChannelData = updatedChannel;
        this.getActiveChannelUsers();
      }
    })
  }

  
  updateActiveChannelData(){
    this.activeChannelData = this.allUserChannels.find(channel => channel.id === this.activeChannel);
  }


  getAllUsers(){
    const userCollection = collection(this.firestore, 'users');
    this.allUsers$ = collectionData(userCollection, {
      idField: 'id',
    }) as Observable<User[]>;

    this.allUsers$.subscribe((changes) => {
      this.users = Array.from(
        new Map(changes.map((user) => [user.id, user])).values()
      );
    });
  }


  getActiveChannelUsers(){
    this.activeChannelUsers = this.users.filter(user => this.activeChannelData?.userIds.includes(user.id));
  }


  handleDialogStateChange(event: { dialogType: string; opened: boolean; position: { top: string; left: string } }) {
    const { dialogType, opened, position } = event;

    if (dialogType === 'editChannel') {
      this.editChannelDialogOpened = opened;
      this.editChannelDialogPosition = position;
    } else if (dialogType === 'addMembers') {
      this.addMembersDialogOpened = opened;
      this.addMembersDialogPosition = position;
    } else if (dialogType === 'showMembers') {
      this.showMembersDialogOpened = opened;
      this.showMembersDialogPosition = position;
    }
  }

  openEditChannelDialog() {
    
    this.editChannelDialogOpened = true;
  }

  openAddMembersDialog() {
    
    this.addMembersDialogOpened = true;
  }

  openShowMembersDialog() {
    
    this.showMembersDialogOpened = true;
  }

  closeEditDialog() {
    this.editChannelDialogOpened = false;
  }

  closeAddMembersDialog() {
    this.addMembersDialogOpened = false;
  }

  closeShowMembersDialog() {
    this.showMembersDialogOpened = false;
  }


}
