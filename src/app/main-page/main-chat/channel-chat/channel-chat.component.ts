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
import { AddChannelDialogComponent } from '../../add-channel-dialog/add-channel-dialog.component';


@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [
    CommonModule,
    ShowMembersDialogComponent,
    AddMembersDialogComponent,
    EditChannelDialogComponent
  ],
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss',
})
export class ChannelChatComponent {
  @ViewChild('channelTitleDiv', { static: false }) channelTitleDiv!: ElementRef;
  @ViewChild('showMembersDiv', { static: false }) showMembersDiv!: ElementRef;
  @ViewChild('addMembersDiv', { static: false }) addMembersDiv!: ElementRef;

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


  openEditChannelDialog() {
    const rect = this.channelTitleDiv.nativeElement.getBoundingClientRect();
    this.editChannelDialogPosition = {
      top: `${rect.bottom + 10}px`,
      left: `${rect.left}px`,
    };
    this.editChannelDialogOpened = true;
  }

  openAddMembersDialog() {
    const rect = this.addMembersDiv.nativeElement.getBoundingClientRect();
    this.addMembersDialogPosition = {
      top: `${rect.bottom + 10}px`,
      left: `${rect.left - 470}px`,
    };
    this.addMembersDialogOpened = true;
  }

  openShowMembersDialog() {
    const rect = this.showMembersDiv.nativeElement.getBoundingClientRect();
    this.showMembersDialogPosition = {
      top: `${rect.bottom + 10}px`,
      left: `${rect.left - 280}px`,
    };
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
