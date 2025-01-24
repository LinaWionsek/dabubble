import { Component, Input, inject, SimpleChanges } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { SeperatorComponent } from '../seperator/seperator.component';
import { Channel } from '../../models/channel.class';
import { Firestore, doc, collection, collectionData, CollectionReference, DocumentData, query, where } from '@angular/fire/firestore';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Message } from '../../models/message.class';
import { User } from '../../models/user.class';
import { AuthService } from '../../services/authentication.service';
import { ChannelService } from '../../services/channel.service';
import { UserProfileComponent } from '../user-profile/user-profile.component';


@Component({
  selector: 'app-chat-history',
  standalone: true,
  imports: [MessageComponent, SeperatorComponent, UserProfileComponent],
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
  activeChannel?: Channel | null;

  activeMessageAnswers$!: Observable<Message[]>;
  allMessageAnswers?: Message[];
  groupedMessageAnswers: { [date: string]: Message[] } = {};

  messages$!: Observable<Message[]>;
  allMessages: Message[] = [];
  groupedMessages: { [date: string]: Message[] } = {};

  messagesLoaded = false;
  currentUser!: User | null ;
  firestore: Firestore = inject(Firestore);

  userProfileOpened=false;


  constructor(private authService: AuthService, private channelService: ChannelService){}



  ngOnInit(){
    this.getCurrentUser();
    this.subscribeToChannelService();
  }


  async ngOnChanges(changes: SimpleChanges){
    await this.getCurrentUser();
    if (this.usedFor ==='channel') {
      const channelMessagesSubcollection = collection(this.firestore, `channels/${this.channelData?.id}/messages`);
      this.loadMessages(channelMessagesSubcollection);
      this.setMessagesLoaded();
      this.setChannelId();
    } else if (this.usedFor ==='dm-chat'){
      const messagesCollection = collection(this.firestore, `direct-messages/`);
      this.loadDirectMessages(messagesCollection);
      this.setMessagesLoaded();
    } else if(this.usedFor ==='thread' && this.activeChannel){
      const answersCollection = collection(this.firestore, `channels/${this.channelData?.id}/messages/${this.activeMessage?.id}/answers`);
      this.loadActiveMessageAnswers(answersCollection);
    } else if(this.usedFor === 'thread' && !this.activeChannel){
      const answersCollection = collection(this.firestore, `direct-messages/${this.activeMessage?.id}/answers`);
      this.loadActiveMessageAnswers(answersCollection);
    }
  }


  setMessagesLoaded(){
    setTimeout(() => {
      this.messagesLoaded = true;
    }, 25);
  }
  

  loadActiveMessageAnswers(collection: CollectionReference<DocumentData>){
    this.activeMessageAnswers$ = collectionData(collection, { idField: 'id'}) as Observable<Message[]>;

    this.activeMessageAnswers$.subscribe((answers) => {
      this.allMessageAnswers = answers;
      this.sortMessagesIntoGroups(this.allMessageAnswers, this.groupedMessageAnswers);
    })
  }


  setChannelId(){
    this.channelId = this.channelData?.id;
  }


  async getCurrentUser(){
    this.currentUser = await this.authService.getFullUser();
  }


  subscribeToChannelService(){
    this.channelService.activeChannel$.subscribe((channel) => {
      this.activeChannel = channel;
    })
  }


  loadMessages(collection: CollectionReference<DocumentData>){
    this.messages$ = collectionData(collection, { idField: 'id'}) as Observable<Message[]>;
    this.messages$.subscribe((messages) => {
      this.allMessages = messages;
      this.sortMessagesIntoGroups(this.allMessages, this.groupedMessages)
    })
  }


  loadDirectMessages(collection: CollectionReference<DocumentData>) {
    const senderQuery = query(collection, where('senderId', '==', this.currentUser!.id), where('receiverId', '==', this.userData!.id));
    const receiverQuery = query(collection, where('receiverId', '==', this.currentUser!.id), where('senderId', '==', this.userData!.id));
  
    const senderMessages$ = collectionData(senderQuery, { idField: 'id' }) as Observable<Message[]>;
    const receiverMessages$ = collectionData(receiverQuery, { idField: 'id' }) as Observable<Message[]>;
  
    this.messages$ = combineLatest([senderMessages$, receiverMessages$]).pipe(
      map(([senderMessages, receiverMessages]) => [...senderMessages, ...receiverMessages])
    );
  
    this.messages$.subscribe((messages) => {
      this.allMessages = messages;
      this.sortMessagesIntoGroups(this.allMessages, this.groupedMessages);
    });
  }

  // loadDirectMessages(collection: CollectionReference<DocumentData>){

  //   const collectionQuery = query(
  //     collection,
  //     where('receiverId', 'in', [this.currentUser!.id, this.userData!.id]),
  //     where('senderId', 'in', [this.currentUser!.id, this.userData!.id])
  //   );

  //   this.messages$ = collectionData(collectionQuery, { idField: 'id'}) as Observable<Message[]>;
  //   this.messages$.subscribe((messages) => {
  //     // this.allMessages = messages.filter((message) => (message.receiverId === this.currentUser!.id) && (message.senderId === this.currentUser!.id));
  //     this.sortMessagesIntoGroups(this.allMessages, this.groupedMessages)
  //   })
  // }


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
  

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based, pad to 2 digits
    const day = String(date.getDate()).padStart(2, '0'); // Pad to 2 digits
  
    return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
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


  sortedDateKeys(messagesObject: { [key: string]: Message[] }): string[] {
    const keys = Object.keys(messagesObject);
    const sortedKeys = keys.sort((a, b) => {
      const dateA = new Date(a).getTime();
      const dateB = new Date(b).getTime();
      return dateB - dateA; // Descending order
    });

    return sortedKeys;
  }


  showUserProfile(){
    this.userProfileOpened = true;
  }

  hideUserProfile(){
    this.userProfileOpened = false;
  }



}
