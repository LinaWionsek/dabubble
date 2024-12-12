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
  @Input() channelData?: Channel | undefined;
  @Input() usedFor = '';

  channelId?: string;
  chatId?: string;

  channelMessages$!: Observable<Message[]>;
  allChannelMessages: Message[] = [];
  groupedMessages: { [date: string]: Message[] } = {};
  currentUser!: User | null ;


  firestore: Firestore = inject(Firestore);


  constructor(private authService: AuthService){}


  ngOnChanges(changes: SimpleChanges){
    if (changes['channelData'] && changes['channelData'].currentValue && this.usedFor ==='channel') {
      this.getChannelMessages();
      this.getCurrentUser();
      this.setChannelId();
    } else if (changes['channelData'] && changes['channelData'].currentValue && this.usedFor ==='chat'){
      // copy above for dm-chat
    }
  }
  

  setChannelId(){
    this.channelId = this.channelData?.id;
  }


  async getCurrentUser(){
    this.currentUser = await this.authService.getFullUser();
  }


  async getChannelMessages(){
    const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);
    const channelMessagesSubcollection = collection(channelDocRef, 'messages');

    this.channelMessages$ = collectionData(channelMessagesSubcollection, { idField: 'id'}) as Observable<Message[]>;

    this.channelMessages$.subscribe((messages) => {
      this.allChannelMessages = messages;
      this.sortChannelMessagesIntoGroups();
    })
  }


  sortChannelMessagesIntoGroups(){
    this.groupedMessages = {};

    this.allChannelMessages.forEach((message) => {
      const date = new Date(message.timeStamp);
      const dateKey = this.formatDate(date);

      if (!this.groupedMessages[dateKey]) {
        this.groupedMessages[dateKey] = [];
      }
      this.groupedMessages[dateKey].push(message);
    });

    this.sortGroupedMessages();
  }
  

  sortGroupedMessages(){
    Object.keys(this.groupedMessages).forEach((dateKey) => {
      this.groupedMessages[dateKey].sort((a, b) => {
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


  sortedDateKeys(): string[] {
    return Object.keys(this.groupedMessages).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
  }


}
