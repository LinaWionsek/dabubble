import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel } from './../../../../models/channel.class';
import { AddMembersDialogComponent } from '../add-members-dialog/add-members-dialog.component';
import { User } from '../../../../models/user.class';
import { UserProfileComponent } from "../../../../shared-components/user-profile/user-profile.component";

@Component({
  selector: 'app-show-members-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, UserProfileComponent],
  templateUrl: './show-members-dialog.component.html',
  styleUrl: './show-members-dialog.component.scss'
})
export class ShowMembersDialogComponent {
  @Input() channelData?: Channel | null;
  @Input() channelUsers:User[] = [];
  @Output() dialogClosed = new EventEmitter<void>();
  @Output() addMembersDialogOpened = new EventEmitter<void>();

  
  memberProfileOpened = false;
  clickedUser?: User;


  closeDialog(){
    this.dialogClosed.emit();
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }


  openAddMembersDialog(){
    this.closeDialog();
    setTimeout(()=>{
      this.addMembersDialogOpened.emit();
    }, 15)
  }


  showMemberProfile(user: User){
    this.clickedUser = user;
    this.memberProfileOpened = true;
  }

  hideMemberProfile(){
    this.memberProfileOpened = false;
  }


}


