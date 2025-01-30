import { Component, Input, inject, SimpleChanges } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { SeperatorComponent } from '../seperator/seperator.component';
import { Channel } from '../../models/channel.class';
import { Firestore, doc, collection, collectionData, CollectionReference, DocumentData, query, where } from '@angular/fire/firestore';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
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
  users$!: Observable<User[]>;
  firestore: Firestore = inject(Firestore);

  userProfileOpened=false;
  private unsubscribe$ = new Subject<void>();


  constructor(private authService: AuthService, private channelService: ChannelService){}



  ngOnInit(){
    this.getCurrentUser();
    this.subscribeToChannelService();
    this.loadAllUsers();
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

  loadAllUsers(){
    const usersCollection = collection(this.firestore, 'users');
    this.users$ = collectionData(usersCollection, { idField: 'id' }) as Observable<User[]>;
  }

  setMessagesLoaded(){
    setTimeout(() => {
      this.messagesLoaded = true;
    }, 25);
  }
  

  loadActiveMessageAnswers(collection: CollectionReference<DocumentData>) {
    (collectionData(collection, { idField: 'id' }) as Observable<Message[]>)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((answers) => {
        this.groupedMessageAnswers = this.sortMessagesIntoGroups(answers); 
      });
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


  loadMessages(collection: CollectionReference<DocumentData>) {
    (collectionData(collection, { idField: 'id' }) as Observable<Message[]>)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((messages) => {
        this.allMessages = messages;
        this.groupedMessages = this.sortMessagesIntoGroups(messages);
      });
  }


  loadDirectMessages(collection: CollectionReference<DocumentData>) {
    const senderQuery = query(collection, where('senderId', '==', this.currentUser!.id), where('receiverId', '==', this.userData!.id));
    const receiverQuery = query(collection, where('receiverId', '==', this.currentUser!.id), where('senderId', '==', this.userData!.id));
  
    const senderMessages$ = collectionData(senderQuery, { idField: 'id' }) as Observable<Message[]>;
    const receiverMessages$ = collectionData(receiverQuery, { idField: 'id' }) as Observable<Message[]>;
  
    this.messages$ = combineLatest([senderMessages$, receiverMessages$]).pipe(
      takeUntil(this.unsubscribe$), 
      map(([senderMessages, receiverMessages]) => [...senderMessages, ...receiverMessages]), 
      map((messages) => messages.sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())) 
     );

    this.messages$.subscribe((messages) => {
        this.allMessages = messages;
        this.groupedMessages = this.sortMessagesIntoGroups(messages); 
    });
  }

  
  sortMessagesIntoGroups(messagesArray: Message[]): { [key: string]: Message[] } {
    const groupedMessages: { [key: string]: Message[] } = {};

    messagesArray.forEach((message) => {
        const dateKey = new Date(message.timeStamp).toISOString().split('T')[0]; 
        if (!groupedMessages[dateKey]) {
            groupedMessages[dateKey] = [];
        }
        groupedMessages[dateKey].push(message);
    });

    Object.values(groupedMessages).forEach((messages) =>
        messages.sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())
    );

    return groupedMessages; 
  }

  sortedDateKeys(messagesObject: { [key: string]: Message[] }): string[] {
    return Object.keys(messagesObject).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }



  showUserProfile(){
    this.userProfileOpened = true;
  }

  hideUserProfile(){
    this.userProfileOpened = false;
  }



}
