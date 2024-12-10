import { Component, Input, SimpleChanges, inject } from '@angular/core';
import { Channel } from './../../models/channel.class'
import { User } from './../../models/user.class'
import { AuthService } from '../../services/authentication.service';
import { Firestore, doc, updateDoc, collection, addDoc } from '@angular/fire/firestore';
import { Message } from '../../models/message.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @Input() channelData?: Channel | undefined;
  @Input() usedFor = '';

  sendMessagesTo: string  = '';
  currentUser?: User | null ;
  newMessage = new Message();
  

  firestore: Firestore = inject(Firestore);


  constructor(private authService: AuthService){}


  ngOnChanges(changes: SimpleChanges){
    if (changes['channelData'] && changes['channelData'].currentValue) {
      this.checkInputUsecase();
      this.setCurrentUser();
    }
  }

  async setCurrentUser(){
    this.currentUser = await this.authService.getFullUser();
    this.initializeNewMessage();
  }


  checkInputUsecase(){
    if(this.usedFor === 'channel'){
      this.sendMessagesTo = this.channelData?.name ?? '';
    } else if (this.usedFor === 'directMessage') {
      // send messages to contact
    }
  }


  async sendMessage(){
    if(this.usedFor === 'channel'){
      const messageCollection = collection(this.firestore, 'messages');
      try {
        const docRef = await addDoc(messageCollection, {...this.newMessage});
        this.updateChannelDataWithNewMessageId(docRef.id);
      } catch (error) {
        console.error(error)
      }
    } else if(this.usedFor === 'directMessaging'){
      // send new message to user
    }
    this.initializeNewMessage();
  }



  async updateChannelDataWithNewMessageId(newMessageId: string){
    this.channelData?.messageIds.push(newMessageId);
    const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);

    try {
      await updateDoc(channelDocRef, {...this.channelData});
    } catch (error) {
      console.error(error);
    }
  }


  initializeNewMessage(){
    this.newMessage = new Message();
    this.newMessage.senderId = this.currentUser?.id ?? '';
  }


  onEnter(event: Event){
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.shiftKey) {
      return;
    }
    event.preventDefault();
    this.sendMessage();
  }

}
