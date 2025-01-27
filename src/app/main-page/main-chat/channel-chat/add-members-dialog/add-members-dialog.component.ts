import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel } from './../../../../models/channel.class';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { User } from './../../../../models/user.class';
import { ChannelService } from '../../../../services/channel.service';

@Component({
  selector: 'app-add-members-dialog',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './add-members-dialog.component.html',
  styleUrl: './add-members-dialog.component.scss'
})
export class AddMembersDialogComponent {
  @Input() channelData?: Channel | null = null;
  @Input() allUsers!: User[];
  @Output() dialogClosed = new EventEmitter<void>();


  firestore: Firestore = inject(Firestore);

  channelMembers?: string[] = this.channelData?.userIds;;
 
  userSearchQuery: string = '';
  foundUsers?: User[] = [];
  displaySearchResultContainer = false;
  selectedUsers?: User[] = [];


  constructor(private channelService: ChannelService) {}


  ngOnInit(){
    this.subscribeToActiveChannel();
    this.foundUsers = this.allUsers.filter((user) => user.firstName !== 'Guest');
  }


  subscribeToActiveChannel(){
    this.channelService.activeChannel$.subscribe((channel) => {
      this.channelData = channel;
    })
  }
  

  closeDialog(){
    this.dialogClosed.emit();
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }


  async addMember(){
    const newUserIds = this.selectedUsers?.map(user => user.id) || [];
    this.channelData?.userIds.push(...newUserIds);
    await this.updateChannel(); 
    this.selectedUsers = [];
    this.closeDialog();
  }


  async updateChannel(){
    const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);
    try {
      await updateDoc(channelDocRef, { ...this.channelData });
    } catch (error) {
      console.error(error);
    }
  }


  searchUsers(event: Event){
    const inputElement = event.target as HTMLInputElement;
    this.userSearchQuery = inputElement.value.toLowerCase().trim();

    if(this.userSearchQuery.length >= 1){
      this.foundUsers = this.allUsers.filter(user => 
        (user.firstName.toLowerCase().startsWith(this.userSearchQuery) || 
        user.lastName.toLowerCase().startsWith(this.userSearchQuery)) &&
        !this.selectedUsers?.some(selectedUser => selectedUser.id === user.id)
      );
    } else {
      this.foundUsers = [];
    }

    this.displaySearchResultContainer = this.foundUsers.length > 0;
  }


  addFoundUserToChannel(id: string){
    const selectedUser = this.allUsers.find(user => user.id === id);
  
    if (selectedUser && !this.channelData?.userIds.includes(selectedUser.id)) {
      this.channelData?.userIds.push(selectedUser.id);
      if (!this.selectedUsers?.some(user => user.id === id)) {
        this.selectedUsers?.push(selectedUser);
      }
    }

    this.userSearchQuery = '';
    this.displaySearchResultContainer = false;
    this.foundUsers = [];
  }    



  cancelUserAdding(id:string){
    this.channelData!.userIds = this.channelData!.userIds.filter(userId => userId !== id);
    this.selectedUsers = this.selectedUsers?.filter(user => user.id !== id);
  }


  
}
