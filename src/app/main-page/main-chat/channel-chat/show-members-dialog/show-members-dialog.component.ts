import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel } from './../../../../models/channel.class';
import { AddMembersDialogComponent } from '../add-members-dialog/add-members-dialog.component';
import { User } from '../../../../models/user.class';

@Component({
  selector: 'app-show-members-dialog',
  standalone: true,
  imports: [ CommonModule, FormsModule],
  templateUrl: './show-members-dialog.component.html',
  styleUrl: './show-members-dialog.component.scss'
})
export class ShowMembersDialogComponent {
  @Input() channelData!: Channel;
  @Input() showMembersDialogPosition!: { top: string; left: string };
  @Input() secondPosition!: { top: string; left: string };
  @Input() allUsers!: User[];
  @Output() dialogClosed = new EventEmitter<void>();
  @Output() openAddMembersDialog= new EventEmitter<void>();

  channelUsers:User[] = [];


  ngOnInit(){
    this.populateChannelUsersArray();
  }

  populateChannelUsersArray(){
    this.channelUsers = this.allUsers.filter(user => this.channelData.userIds.includes(user.id));
  }
  

  closeDialog(){
    this.dialogClosed.emit();
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }


  openAddMemberDialog(){
    this.closeDialog();
    this.openAddMembersDialog.emit();

  }
}


