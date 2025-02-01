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
import { ThreadService } from '../../services/thread.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';



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
  activatedMessage?: Message | null;

  activeChannel?: Channel | null;
  activeReceiver?: Channel | User | null;
  isActiveReceiverChannel = false;
  isActiveReceiverUser = false;
  
  emoticonsDivOpened = false;
  userDivOpened = false;
  users$!: Observable<User[]>;
  allUsers: User[] = [];
  filteredUsers: User[] = [];

  showChannelSelection = false;
  showUserSelection = false;
  filteredChannels: Channel[] = [];
  allUserChannels: Channel[] = [];
  allChannels: Channel[] = [];
  channels$!: Observable<Channel[]>;

  firestore: Firestore = inject(Firestore);
  private destroy$ = new Subject<void>();


  constructor(private authService: AuthService, private channelService: ChannelService, private receiverService: ReceiverService, private chatService: ChatService, private threadService:ThreadService){}


  ngAfterViewInit() {
    this.addFocusToChatInput();
    this.loadUserChannels();
  }


  async ngOnChanges(changes: SimpleChanges){
    this.checkInputUsecase();
    await this.setCurrentUser();
    this.subscribeToChannelService();
    this.loadUsers();
    this.loadUserChannels();
    this.addFocusToChatInput();
    this.subscribeToThreadService();
  }

  subscribeToThreadService(){
    this.threadService.activeMessage$.subscribe((message) => {
      this.activatedMessage = message;
    })
  }

  addFocusToChatInput(){
    setTimeout(() => {
      this.messageInput.nativeElement.focus();
    }, 100)
  }
  

  async setCurrentUser(){
    this.currentUser = await this.authService.getFullUser();
    this.initializeNewMessage();
  }


  loadUsers(){
    const excludedNames = ['Guest', 'Welcome-Bot', 'Question-Bot'];
    const usersCollection = collection(this.firestore, 'users')
    this.users$ = collectionData(usersCollection, { idField: 'id'}) as Observable<User[]>;

    this.users$.subscribe((changes) => {
      this.allUsers = Array.from(new Map(changes.filter(user => user.id !== this.currentUser?.id && !excludedNames.includes(user.firstName))
        .map(user => [user.id, user])
      ).values());
      this.filterUsersForUsecase();
    })
  }


  loadUserChannels(){
    const userChannelsCollection = collection(this.firestore, 'channels');
    this.channels$ = collectionData(userChannelsCollection, { idField: 'id'}) as Observable<Channel[]>;
    
  
    this.channels$
      .pipe(takeUntil(this.destroy$))
      .subscribe((changes) => {
        this.allChannels = Array.from(new Map(changes.map(channel => [channel.id, channel])).values());
        this.getAllChannelsForCurrentUser();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAllChannelsForCurrentUser(){
    if(this.currentUser && this.currentUser.id){
      this.allUserChannels = this.allChannels.filter((channel) => channel.userIds.includes(this.currentUser!.id));
    }
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

  checkInputValue(){
    if (this.newMessage.messageText.startsWith('#') && this.usedFor === 'default') {
      this.setFilteredChannels();
      this.showUserSelection = false;
      this.showChannelSelection = true;
    } else if (this.newMessage.messageText.startsWith('@') && this.usedFor === 'default') {
      this.setFilteredUsers();
      this.showChannelSelection = false;
      this.showUserSelection = true;
    } else {
      this.showChannelSelection = false;
      this.showUserSelection = false;
    }
  }


  setFilteredChannels() {
    if (this.newMessage.messageText.length > 1) {
      this.filterChannels();
    } else {
      this.filteredChannels = [...this.allUserChannels];
    }
  }

  setFilteredUsers() {
    if (this.newMessage.messageText.length > 1) {
      this.filterUsers();
    } else {
      this.filteredUsers = [...this.allUsers];
    }
  }

  filterChannels() {
    const trimmedInput = this.newMessage.messageText.slice(1).toLowerCase();
    this.filteredChannels = this.allUserChannels.filter((channel) =>
      channel.name.toLowerCase().startsWith(trimmedInput)
    );
    this.showChannelSelection = this.filteredChannels.length > 0;
  }

  filterUsers() {
    const trimmedInput = this.newMessage.messageText.slice(1).toLowerCase();
    this.filteredUsers = this.allUsers.filter(
      (user) =>
        user.firstName.toLowerCase().startsWith(trimmedInput) ||
        user.lastName.toLowerCase().startsWith(trimmedInput)
    );
    this.showUserSelection = this.filteredUsers.length > 0;
  }

  setReceiver(receiver: Channel | User) {
    if(this.usedFor === 'default'){
      this.receiverService.setReceiver(receiver);
    }

    if ('creator' in receiver) {
      this.newMessage.messageText = '#' + receiver.name;
      this.showChannelSelection = false;
    } else if ('email' in receiver) {
      this.newMessage.messageText += receiver.firstName + ' ' + receiver.lastName;
      this.showUserSelection = false;
    }
  }



  async sendMessage(){
    if(this.newMessage.messageText){
      this.newMessage.timeStamp = new Date().toISOString();
      
      if(this.usedFor === 'channel'){
        const channelMessagesCollection = collection(this.firestore, `channels/${this.activeChannel?.id}/messages`);
        this.addMessageToCollection(channelMessagesCollection);
      } else if(this.usedFor === 'dm-chat'){
        this.newMessage.receiverId = this.userData!.id;
        const messageCollection = collection(this.firestore, 'direct-messages/');
        this.addMessageToCollection(messageCollection);
      } else if(this.usedFor === 'thread' && this.activeChannel){
        const answersSubcollection = collection (this.firestore, `channels/${this.activeChannel?.id}/messages/${this.activatedMessage?.id}/answers`);
        this.addMessageToCollection(answersSubcollection);
      } else if(this.usedFor === 'thread' && !this.activeChannel){
        const messageCollection = collection(this.firestore, `direct-messages/${this.activatedMessage?.id}/answers/`);
        this.addMessageToCollection(messageCollection);
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
      this.newMessage.receiverId = this.userData!.id;
      const messageCollection = collection(this.firestore, 'direct-messages/');
      this.addMessageToCollection(messageCollection);

      this.chatService.setActiveChat(this.activeReceiver as User);
      this.receiverService.resetReceiver();
    } else {
      this.receiverService.setInvalidReceiver();
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