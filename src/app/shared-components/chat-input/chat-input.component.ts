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
  @Input() activeMessage?: Message | null;
  @Input() channelData?: Channel | null;
  @Input() userData?: User | null;
  @Input() usedFor = '';

  sendMessagesTo: string  = '';
  currentUser?: User | null ;
  newMessage = new Message();
  

  firestore: Firestore = inject(Firestore);


  constructor(private authService: AuthService){}


  ngOnChanges(changes: SimpleChanges){
    this.checkInputUsecase();
    this.setCurrentUser();
  }


  async setCurrentUser(){
    this.currentUser = await this.authService.getFullUser();
    this.initializeNewMessage();
  }


  checkInputUsecase(){
    if(this.usedFor === 'channel'){
      this.sendMessagesTo = this.channelData?.name ?? '';
    } else if (this.usedFor === 'dm-chat') {
      this.sendMessagesTo = this.userData?.firstName + ' ' + this.userData?.lastName
    }
  }


  async sendMessage(){
    if(this.newMessage.messageText){
      this.newMessage.timeStamp = new Date().toISOString();
      
      if(this.usedFor === 'channel'){
        this.sendMessageToChannel();
      } else if(this.usedFor === 'dm-chat'){
        this.sendMessageToUser();
      } else if(this.usedFor === 'thread'){
        this.sendMessageToThread();
      }
      
      this.initializeNewMessage();
    }
  }


  async sendMessageToChannel(){
    const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);
    const channelMessagesSubcollection = collection(channelDocRef, 'messages');

    try {
      await addDoc(channelMessagesSubcollection, { ...this.newMessage });
    } catch (error) {
      console.error(error);
    }
  }


  async sendMessageToUser(){
    const dmSubcollectionCurrentUser = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.userData?.id}/messages`);
    const dmSubcollectionOtherUser = collection(this.firestore, `users/${this.userData?.id}/dm-chats/${this.currentUser?.id}/messages`);

    try {
      await addDoc(dmSubcollectionCurrentUser, { ...this.newMessage });
      await addDoc(dmSubcollectionOtherUser, { ...this.newMessage });
    } catch (error) {
      console.error(error);
    }
  }


  async sendMessageToThread(){
    const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);
    const answersSubcollection = collection (channelDocRef, `messages/${this.activeMessage?.id}/answers`);
    try {
      addDoc(answersSubcollection, {...this.newMessage});
    } catch (error) {
      console.error(error);
    }
  }



 


  initializeNewMessage(){
    this.newMessage = new Message();
    this.newMessage.senderId = this.currentUser?.id ?? '';
    this.newMessage.senderAvatar = this.currentUser?.avatar ?? '';
    this.newMessage.senderName = this.currentUser?.firstName + ' ' + this.currentUser?.lastName;
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
