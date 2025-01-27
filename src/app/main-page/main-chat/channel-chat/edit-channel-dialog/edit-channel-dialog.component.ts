import { Component,  OnInit,  inject,  Input,  Output,  EventEmitter,} from '@angular/core';
import { ChannelService } from '../../../../services/channel.service';
import { Observable } from 'rxjs';
import { Channel } from './../../../../models/channel.class';
import {  Firestore,  collection,  collectionData,  doc,  updateDoc,} from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { AuthService } from '../../../../services/authentication.service';
import { User } from '../../../../models/user.class';

@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss',
})
export class EditChannelDialogComponent {
  @Output() dialogClosed = new EventEmitter<void>();

  firestore: Firestore = inject(Firestore);
  currentUser?: User | null ;
  channelData: Channel | null = null;
  channelCopy: Channel | null = null;

  editingChannelName = false;
  editingChannelDescription = false;

  constructor(private authService: AuthService, private channelService: ChannelService) {}


  ngOnInit(){
    this.getCurrentUser();
    this.getChannelData();
  }


  getChannelData(){
    this.channelData = this.channelService.getActiveChannel();
    if(this.channelData){
      this.createChannelCopy();
    }
  }


  createChannelCopy(){
    if(this.channelData){
      this.channelCopy = {...this.channelData}
    }
  }


  async getCurrentUser(){
    this.currentUser = await this.authService.getFullUser();
  }


  closeDialog() {
    if (this.channelData?.name && this.channelData.name.length >= 4) {
      this.dialogClosed.emit();
    }
  }


  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }


  editChannel(form: NgForm) {
    if (form.valid) {
      this.channelData = this.channelCopy;
      this.channelService.setActiveChannel(this.channelData!);
      this.updateChannel()
    }
  }


  async updateChannel(){ 
    const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);
      try {
        await updateDoc(channelDocRef, { ...this.channelCopy });
      } catch (error) {
        console.error(error);
      }
    }
  

  saveChanges(form: NgForm) {
    if (form.valid) {
      this.editChannel(form);
      this.editingChannelName = false;
      this.editingChannelDescription = false;
    } else {
      this.resetInvalidFields(form);
    }
  }
  

  getErrorMessage(errors: any): string {
    if (errors.required) {
      return 'Bitte einen Namen mit mindestens 4 Zeichen eingeben.';
    }
    if (errors.minlength) {
      return `Der Name muss mindestens ${errors.minlength.requiredLength} Buchstaben lang sein.`;
    }
    return '';
  }

  resetInvalidFields(form: NgForm): void {
    const controls = form.controls;

    if (controls['channelName']?.invalid) {
      this.channelData!.name = '';
    }
  }

  onEditButtonClick(event: Event, field: 'name' | 'description'): void {
    if (field === 'name' && !this.editingChannelName) {
      this.toggleEditing('name');
      event.preventDefault();
    } else if (field === 'description' && !this.editingChannelDescription) {
      this.toggleEditing('description');
      event.preventDefault();
    }
  }

  toggleEditing(field: 'name' | 'description') {
    if (field === 'name') {
      this.editingChannelName = !this.editingChannelName;
    } else if (field === 'description') {
      this.editingChannelDescription = !this.editingChannelDescription;
    }
  }


  leaveChannel() {
    if (this.channelData && this.channelData.userIds) {
      const updatedUserArray = this.channelData.userIds.filter(userId => userId !== this.currentUser?.id);
      this.channelData.userIds = updatedUserArray;
      this.updateChannel();
      this.closeDialog();
      this.channelService.clearActiveChannel();
    }
  }

  
}
