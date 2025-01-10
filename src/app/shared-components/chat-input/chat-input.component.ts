import { Component, Input, SimpleChanges, inject, ViewChild, AfterViewInit } from '@angular/core';
import { Channel } from './../../models/channel.class'
import { User } from './../../models/user.class'
import { AuthService } from '../../services/authentication.service';
import { Firestore, doc, updateDoc, collection, addDoc, CollectionReference, DocumentData, collectionData } from '@angular/fire/firestore';
import { Message } from '../../models/message.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/dm-chat.service';
import { ReceiverService } from '../../services/receiver.service';
import { ClickOutsideModule } from 'ng-click-outside';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Observable } from 'rxjs';




@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideModule, PickerComponent],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @ViewChild('messageInput') messageInput: any;
  @Input() activeMessage?: Message | null;
  @Input() channelData?: Channel | null;
  @Input() userData?: User | null;
  @Input() usedFor = '';

  sendMessagesTo: string  = '';
  currentUser?: User | null ;
  newMessage = new Message();

  activeChannel?: Channel | null;
  activeReceiver?: Channel | User | null;
  isActiveReceiverChannel = false;
  isActiveReceiverUser = false;
  
  emoticonsDivOpened = false;
  userDivOpened = false;
  users$!: Observable<User[]>;
  allUsers: User[] = [];
  filteredUsers: User[] = [];

  firestore: Firestore = inject(Firestore);


  constructor(private authService: AuthService, private channelService: ChannelService, private receiverService: ReceiverService, private chatService: ChatService){}


  ngAfterViewInit() {
    this.messageInput.nativeElement.focus();
  }

  ngOnChanges(changes: SimpleChanges){
    this.checkInputUsecase();
    this.setCurrentUser();
    this.subscribeToChannelService();
    this.loadUsers();
    this.messageInput.nativeElement.focus();
  }

  async setCurrentUser(){
    this.currentUser = await this.authService.getFullUser();
    this.initializeNewMessage();
  }


  loadUsers(){
    const usersCollection = collection(this.firestore, 'users')
    this.users$ = collectionData(usersCollection, { idField: 'id'}) as Observable<User[]>;

    this.users$.subscribe((changes) => {
      this.allUsers = Array.from(new Map(changes.filter(user => user.id !== this.currentUser?.id)
        .map(user => [user.id, user])
      ).values());
      this.filterUsersForUsecase();
    })
  }


  filterUsersForUsecase(){
    if(this.usedFor === 'dm-chat' && this.userData){
      this.filteredUsers.push(this.userData);
    } else if(this.usedFor === 'channel') {
      this.filteredUsers = this.allUsers.filter((user) => this.activeChannel?.userIds.includes(user.id));
    } else if(this.usedFor === 'thread' && this.activeChannel){
      this.filteredUsers = this.allUsers.filter((user) => this.activeChannel?.userIds.includes(user.id));
    } else if(this.usedFor === 'thread' && !this.activeChannel && this.userData){
      this.filteredUsers.push(this.userData);
    } else if (this.usedFor === 'default'){
      this.filteredUsers = this.allUsers;
    }
  }

  addressUser(user: User){
    this.newMessage.messageText += `@${user.firstName} ${user.lastName} `;
    this.messageInput.nativeElement.focus();
  }
  

  toggleEmoticonsDiv(){
    this.emoticonsDivOpened = !this.emoticonsDivOpened;
  }

  toggleUserDiv(){
    this.userDivOpened = !this.userDivOpened;
  }


  hideUserDiv(){
    this.userDivOpened = false;
  }


  hideEmoticonsDiv(){
    this.emoticonsDivOpened = false;
  }


  onEmojiMartClick(event: MouseEvent){
    event.stopPropagation();
  }

 
  addEmoji(event: any) {
    const emoji = event.emoji.native;  
    this.newMessage.messageText += emoji;  
  }


  checkInputUsecase(){
    if(this.usedFor === 'channel'){
      this.sendMessagesTo = this.channelData?.name ?? '';
    } else if (this.usedFor === 'dm-chat') {
      this.sendMessagesTo = this.userData?.firstName + ' ' + this.userData?.lastName
    } else if(this.usedFor === 'default'){
      this.subscribeToReceiverService();
    }
  }


  subscribeToChannelService(){
    this.channelService.activeChannel$.subscribe((channel) => {
      this.activeChannel = channel;
    })
  }


  subscribeToReceiverService(){
    this.receiverService.activeReceiver$.subscribe((receiver) => {
      this.activeReceiver = receiver;
      if(this.receiverService.isChannel()){
        this.isActiveReceiverUser = false;
        this.isActiveReceiverChannel = true;
      } else if(this.receiverService.isUser()){
        this.isActiveReceiverUser = true;
        this.isActiveReceiverChannel = false;
      }
    })
  }


  async sendMessage(){
    if(this.newMessage.messageText){
      this.newMessage.timeStamp = new Date().toISOString();
      
      if(this.usedFor === 'channel'){
        const channelMessagesCollection = collection(this.firestore, `channels/${this.channelData?.id}/messages`);
        this.addMessageToCollection(channelMessagesCollection);
      } else if(this.usedFor === 'dm-chat'){
        this.sendDmMessage();
      } else if(this.usedFor === 'thread' && this.activeChannel){
        const answersSubcollection = collection (this.firestore, `channels/${this.channelData?.id}/messages/${this.activeMessage?.id}/answers`);
        this.addMessageToCollection(answersSubcollection);
      } else if(this.usedFor === 'thread' && !this.activeChannel){
        this.sendDmThreadMessage();
      } else if(this.usedFor === 'default'){
        this.sendMessageWithDefaultChat();
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


  sendMessageWithDefaultChat(){
    if(this.isActiveReceiverChannel){
      const channelMessagesCollection = collection(this.firestore, `channels/${this.activeReceiver?.id}/messages`);
      this.addMessageToCollection(channelMessagesCollection);
      this.channelService.setActiveChannel(this.activeReceiver as Channel);
      this.receiverService.resetReceiver();
    } else if(this.isActiveReceiverUser){
      this.userData = this.activeReceiver as User;
      this.sendDmMessage();
      this.chatService.setActiveChat(this.activeReceiver as User);
      this.receiverService.resetReceiver();
    } else {
      this.receiverService.setInvalidReceiver();
    }
  }


  sendDmMessage(){
    const dmSubcollectionCurrentUser = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.userData?.id}/messages`);
    const dmSubcollectionOtherUser = collection(this.firestore, `users/${this.userData?.id}/dm-chats/${this.currentUser?.id}/messages`);
    this.addMessageToCollection(dmSubcollectionCurrentUser);
    this.addMessageToCollection(dmSubcollectionOtherUser);
  }


  sendDmThreadMessage(){
    const collectionCurrentUser = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.userData?.id}/messages/${this.activeMessage?.id}/answers`);
    const collectionOtherUser = collection(this.firestore, `users/${this.userData?.id}/dm-chats/${this.currentUser?.id}/messages/${this.activeMessage?.id}/answers`);
    this.addMessageToCollection(collectionCurrentUser);
    this.addMessageToCollection(collectionOtherUser);
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
