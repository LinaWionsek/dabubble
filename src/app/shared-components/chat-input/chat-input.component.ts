import { Component, Input, SimpleChanges, inject } from '@angular/core';
import { Channel } from './../../models/channel.class'
import { User } from './../../models/user.class'
import { AuthService } from '../../services/authentication.service';
import { Firestore, doc, updateDoc, collection, addDoc, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { Message } from '../../models/message.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../services/channel.service';

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

  activeChannel?: Channel | null;

  

  firestore: Firestore = inject(Firestore);


  constructor(private authService: AuthService, private channelService: ChannelService){}


  ngOnChanges(changes: SimpleChanges){
    this.checkInputUsecase();
    this.setCurrentUser();
    this.subscribeToChannelService();
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

  subscribeToChannelService(){
    this.channelService.activeChannel$.subscribe((channel) => {
      this.activeChannel = channel;
    })
  }


  async sendMessage(){
    if(this.newMessage.messageText){
      this.newMessage.timeStamp = new Date().toISOString();
      
      if(this.usedFor === 'channel'){
        const channelMessagesCollection = collection(this.firestore, `channels/${this.channelData?.id}/messages`);
        this.addMessageToCollection(channelMessagesCollection);
      } else if(this.usedFor === 'dm-chat'){
        const dmSubcollectionCurrentUser = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.userData?.id}/messages`);
        const dmSubcollectionOtherUser = collection(this.firestore, `users/${this.userData?.id}/dm-chats/${this.currentUser?.id}/messages`);
        this.addMessageToCollection(dmSubcollectionCurrentUser);
        this.addMessageToCollection(dmSubcollectionOtherUser);
      } else if(this.usedFor === 'thread' && this.activeChannel){
        const answersSubcollection = collection (this.firestore, `channels/${this.channelData?.id}/messages/${this.activeMessage?.id}/answers`);
        this.addMessageToCollection(answersSubcollection);
      } else if(this.usedFor === 'thread' && !this.activeChannel){
        const collectionCurrentUser = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.userData?.id}/messages/${this.activeMessage?.id}/answers`);
        const collectionOtherUser = collection(this.firestore, `users/${this.userData?.id}/dm-chats/${this.currentUser?.id}/messages${this.activeMessage?.id}/answers`);
        this.addMessageToCollection(collectionCurrentUser);
        this.addMessageToCollection(collectionOtherUser);
      }
      
      this.initializeNewMessage();
    }
  }


  async addMessageToCollection(collection: CollectionReference<DocumentData>){
    try {
      await addDoc(collection, { ...this.newMessage });
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
