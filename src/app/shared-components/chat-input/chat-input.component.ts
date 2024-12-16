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
    if(this.newMessage.messageText){
      this.newMessage.timeStamp = new Date().toISOString();
      
      if(this.usedFor === 'channel'){
        const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);
        const channelMessagesSubcollection = collection(channelDocRef, 'messages');
        try {
          await addDoc(channelMessagesSubcollection, {...this.newMessage});
        } catch (error) {
          console.error(error)
        }
      } else if(this.usedFor === 'directMessaging'){

        // send new message to user

      } else if(this.usedFor === 'thread'){
        const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);
        const answersSubcollection = collection (channelDocRef, `messages/${this.activeMessage?.id}/answers`);
        try {
          addDoc(answersSubcollection, {...this.newMessage});
        } catch (error) {
          console.error(error);
        }
      }

      this.initializeNewMessage();

    }
  }



  // async updateChannelDataWithNewMessageId(newMessageId: string){
  //   this.channelData?.messageIds.push(newMessageId);
  //   const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);

  //   try {
  //     await updateDoc(channelDocRef, {...this.channelData});
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }


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
