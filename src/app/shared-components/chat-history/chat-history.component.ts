import { Component, Input, inject, SimpleChanges } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { SeperatorComponent } from '../seperator/seperator.component';
import { Channel } from '../../models/channel.class';
import { Firestore, doc, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../../models/message.class';
import { User } from '../../models/user.class';
import { AuthService } from '../../services/authentication.service';


@Component({
  selector: 'app-chat-history',
  standalone: true,
  imports: [MessageComponent, SeperatorComponent],
  templateUrl: './chat-history.component.html',
  styleUrl: './chat-history.component.scss'
})
export class ChatHistoryComponent {
  @Input() channelData?: Channel | null;
  @Input() userData?: User | null;
  @Input() activeMessage!: Message | null;
  @Input() usedFor = '';

  channelId?: string;
  chatId?: string;

  activeMessageAnswers$!: Observable<Message[]>;
  allMessageAnswers?: Message[];

  channelMessages$!: Observable<Message[]>;
  allChannelMessages: Message[] = [];
  groupedChannelMessages: { [date: string]: Message[] } = {};

  chatMessages$!: Observable<Message[]>;
  allChatMessages: Message[] = [];
  groupedChatMessages: { [date: string]: Message[] } = {};


  currentUser!: User | null ;
  firestore: Firestore = inject(Firestore);


  constructor(private authService: AuthService){}


  async ngOnChanges(changes: SimpleChanges){
    await this.getCurrentUser();
    if (this.usedFor ==='channel') {
      this.loadChannelMessages();
      this.loadActiveMessageAnswers();
      this.setChannelId();
    } else if (this.usedFor ==='dm-chat'){
      this.loadChatMessages();
    } else if(this.usedFor ==='thread'){
      this.loadActiveMessageAnswers();
    }
  }
  

  loadActiveMessageAnswers(){
    const activeMessageAnswersCol = collection(this.firestore, `channels/${this.channelData?.id}/messages/${this.activeMessage?.id}/answers`);
    this.activeMessageAnswers$ = collectionData(activeMessageAnswersCol, { idField: 'id'}) as Observable<Message[]>;

    this.activeMessageAnswers$.subscribe((answers) => {
      this.allMessageAnswers = answers;
    })
  }




  setChannelId(){
    this.channelId = this.channelData?.id;
  }


  async getCurrentUser(){
    this.currentUser = await this.authService.getFullUser();
  }


  async loadChatMessages(){
    const messageCollection = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.userData?.id}/messages`);
    this.chatMessages$ = collectionData(messageCollection, { idField: 'id'}) as Observable<Message[]>;
    
    this.chatMessages$.subscribe((messages) => {
      this.allChatMessages = messages;
      this.sortMessagesIntoGroups(this.allChatMessages, this.groupedChatMessages);
    })
  }


  async loadChannelMessages(){
    const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);
    const channelMessagesSubcollection = collection(channelDocRef, 'messages');
    this.channelMessages$ = collectionData(channelMessagesSubcollection, { idField: 'id'}) as Observable<Message[]>;
    
    this.channelMessages$.subscribe((messages) => {
      this.allChannelMessages = messages;
      this.sortMessagesIntoGroups(this.allChannelMessages, this.groupedChannelMessages);
    })
  }


  sortMessagesIntoGroups(messagesArray: Message[], messagesObject: { [key: string]: Message[] }){
    Object.keys(messagesObject).forEach((key) => delete messagesObject[key]);

    messagesArray.forEach((message) => {
      const date = new Date(message.timeStamp);
      const dateKey = this.formatDate(date);

      if (!messagesObject[dateKey]) {
        messagesObject[dateKey] = [];
      }
      messagesObject[dateKey].push(message);
    });

    this.sortGroupedMessages(messagesObject);
  }
  

  sortGroupedMessages(messagesObject: { [key: string]: Message[] }){
    Object.keys(messagesObject).forEach((dateKey) => {
      messagesObject[dateKey].sort((a, b) => {
        const timeA = new Date(a.timeStamp).getTime();
        const timeB = new Date(b.timeStamp).getTime();
        return timeB - timeA; 
      });
    });
  }



  formatDate(date: Date){
    const formatter = new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',  
      day: '2-digit',  
      month: 'long',  
    });

    return formatter.format(date);
  }


  sortedDateKeys(messagesObject: { [key: string]: Message[] }): string[] {
    return Object.keys(messagesObject).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
  }


}
