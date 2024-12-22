import { Component, inject, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ChannelService } from '../../../../services/channel.service';
import { Observable } from 'rxjs';
import { Channel } from './../../../../models/channel.class';
import { User } from './../../../../models/user.class';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
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


  

