import { Component, inject, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ChannelService } from '../../../../services/channel.service';
import { Observable } from 'rxjs';
import { Channel } from './../../../../models/channel.class';
import { User } from './../../../../models/user.class';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-channel-chat-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-chat-header.component.html',
  styleUrl: './channel-chat-header.component.scss'
})
export class ChannelChatHeaderComponent {
  @ViewChild('channelTitleDiv', { static: false }) channelTitleDiv!: ElementRef;
  @ViewChild('showMembersDiv', { static: false }) showMembersDiv!: ElementRef;
  @ViewChild('addMembersDiv', { static: false }) addMembersDiv!: ElementRef;

  @Output() dialogStateChange = new EventEmitter<{ 
    dialogType: string; 
    opened: boolean; 
    position: { top: string; left: string };
  }>();

  @Input() activeChannelData!: Channel | null;
  @Input() activeChannelUsers: User[] = [];

  editChannelDialogOpened = false;
  showMembersDialogOpened = false;
  addMembersDialogOpened = false;

  editChannelDialogPosition = { top: '0px', left: '0px' };
  showMembersDialogPosition = { top: '0px', left: '0px' };
  addMembersDialogPosition = { top: '0px', left: '0px' };





  openEditChannelDialog() {
    const rect = this.channelTitleDiv.nativeElement.getBoundingClientRect();
    this.editChannelDialogPosition = {
      top: `${rect.bottom + 10}px`,
      left: `${rect.left}px`,
    };
    this.editChannelDialogOpened = true;
    this.emitDialogStateChange('editChannel', this.editChannelDialogOpened, this.editChannelDialogPosition);
  }

  openAddMembersDialog() {
    const rect = this.addMembersDiv.nativeElement.getBoundingClientRect();
    this.addMembersDialogPosition = {
      top: `${rect.bottom + 10}px`,
      left: `${rect.left -470}px`,
    };
    this.addMembersDialogOpened = true;
    this.emitDialogStateChange('addMembers', this.addMembersDialogOpened, this.addMembersDialogPosition);
  }


  openShowMembersDialog() {
    const rect = this.showMembersDiv.nativeElement.getBoundingClientRect();
    this.showMembersDialogPosition = {
      top: `${rect.bottom + 10}px`,
      left: `${rect.left -280}px`,
    };
    this.showMembersDialogOpened = true;
    this.emitDialogStateChange('showMembers', this.showMembersDialogOpened, this.showMembersDialogPosition);
  }


  private emitDialogStateChange(dialogType: string, opened: boolean, position: { top: string; left: string }) {
    this.dialogStateChange.emit({ dialogType, opened, position });
  }

  
  closeEditDialog() {
    this.editChannelDialogOpened = false;
  }

  closeAddMembersDialog(){
    this.addMembersDialogOpened = false;
  }

  closeShowMembersDialog(){
    this.showMembersDialogOpened = false;
  }

}
