import { Component, inject, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ChannelService } from '../../../../services/channel.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Channel } from './../../../../models/channel.class';
import { User } from './../../../../models/user.class';
import { Firestore, Unsubscribe, collection, collectionData, doc, onSnapshot } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { EditChannelDialogComponent } from "../edit-channel-dialog/edit-channel-dialog.component";
import { ShowMembersDialogComponent } from "../show-members-dialog/show-members-dialog.component";
import { AddMembersDialogComponent } from "../add-members-dialog/add-members-dialog.component";


@Component({
  selector: 'app-channel-chat-header',
  standalone: true,
  imports: [CommonModule, EditChannelDialogComponent, ShowMembersDialogComponent, AddMembersDialogComponent],
  templateUrl: './channel-chat-header.component.html',
  styleUrl: './channel-chat-header.component.scss'
})
export class ChannelChatHeaderComponent {
  @Input() allUsers!: User[];
  @Input() activeChannelData?: Channel | null;
  @Input() activeChannelUsers: User[] = [];

  editChannelDialogOpened = false;
  showMembersDialogOpened = false;
  addMembersDialogOpened = false;

  firestore: Firestore = inject(Firestore);
  activeChannelSubscription: Unsubscribe | null = null;




  ngOnInit(){
    this.listenToActiveChannelChanges();
    // this.updateChannelUsers();
  }

  ngOnDestroy(){
    if (this.activeChannelSubscription) {
      this.activeChannelSubscription(); 
    }
  }
  

  listenToActiveChannelChanges(){
    const channelDoc = doc(this.firestore, `channels/${this.activeChannelData!.id}`);
    this.activeChannelSubscription = onSnapshot(channelDoc, (snapshot) => {
      const updatedChannel = snapshot.data() as Channel;
      this.activeChannelData = updatedChannel;
      this.updateChannelUsers();
    });
  }


  updateChannelUsers(){
    this.activeChannelUsers = this.allUsers.filter(user => this.activeChannelData?.userIds.includes(user.id));
  }

  

  openEditChannelDialog(){
    this.editChannelDialogOpened = true;
  }

  closeEditChannelDialog(){
    setTimeout(()=>{
      this.editChannelDialogOpened = false;
    }, 20)
    
  }

  openAddMembersDialog(){
    this.addMembersDialogOpened = true;
  }

  
  openShowMembersDialog(){
    this.showMembersDialogOpened = true;
  }


  closeAddMembersDialog(){
    setTimeout(()=>{
      this.addMembersDialogOpened = false;
    }, 20)
  }

  closeShowMembersDialog(){
    setTimeout(()=>{
      this.showMembersDialogOpened = false;
    }, 20)
  }
  

}


  

