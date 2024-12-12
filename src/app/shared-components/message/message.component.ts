import { Component, Input, inject } from '@angular/core';
import { Message } from './../../models/message.class'
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import {  Firestore,  collection,  collectionData,  doc,  updateDoc,} from '@angular/fire/firestore';



@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  @Input() channelId?: string;
  @Input() chatId?: string;
  @Input() currentUser!: User | null;
  @Input() message!: Message;
  messageClockTimer = '';

  editMessageBtnVisible = false;
  isHovered = false;
  editingMessage = false;


  firestore: Firestore = inject(Firestore);
  
  formatMessageTime(timeStamp:string){
    const time = timeStamp.split('T')[1].split('Z')[0]; 
    const [hours, minutes] = time.split(':'); 
    return `${hours}:${minutes}`;
  }


  showEditMessageBtn(){
    this.editMessageBtnVisible = true;
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;

    if (!this.isHovered) {
      this.editMessageBtnVisible = false;
    }
  }

  editMessage(){
    this.editingMessage = true;
    this.editMessageBtnVisible = false;
  }

  cancelEditing(){
    this.editingMessage = false;
  }


  async updateMessage(){
    if(this.channelId){
      const channelDocRef = doc(this.firestore, `channels/${this.channelId}`);
      const messagesSubcollection = collection(channelDocRef, 'messages');
      const messageDocRef = doc(messagesSubcollection, this.message.id);
      try {
        await updateDoc (messageDocRef, { ... this.message });
        this.editingMessage = false;
      } catch (error) {
        console.error(error);
      }
    } else if(this.chatId){
      //copy above for chat
    }
  }

}
