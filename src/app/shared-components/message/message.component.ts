import { ChangeDetectorRef, Component, Input, inject, SimpleChanges} from '@angular/core';
import { Message } from './../../models/message.class'
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import {  Firestore,  collection,  deleteDoc,  doc,  updateDoc, addDoc, collectionData, DocumentReference, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { Reaction } from '../../models/reaction.class';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ThreadService } from '../../services/thread.service';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../models/channel.class';
import { ReactionService } from '../../services/reaction.service';



@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  @Input() channelId?: string;
  @Input() chatId?: string;
  @Input() otherUser?: User | null;
  @Input() currentUser!: User | null;
  @Input() message!: Message | null;
  @Input() usedFor = '';
  @Input() messageAnswers$?: Observable<Message[]>;
  @Input() activeMessage?: Message | null;


  allUsers: User[]= [];
  users$!: Observable<User[]>;
  senderData: { name: string; avatar: string } = {
    name: "",
    avatar: ""
  };

  messageAnswers?: Message[];
  lastAnswerTime = '';
  messageClockTimer = '';

  editMessageBtnVisible = false;
  isHovered = false;
  editingMessage = false;

  activeChannel?: Channel | null;
  activatedMessage?: Message | null;
  
  reaction: Reaction = new Reaction();
  messageReactions?: Reaction[];
  messageReactions$?: Observable<Reaction[]>;
  groupedReactions: { [reactionType: string]: Reaction[] } = {};
  hasJustReacted = false;

  firestore: Firestore = inject(Firestore);

  mainEmojiOptionsMenu = false;
  secondaryEmojiOptionsMenu = false;
  lastTwoReactions: string[] = [];
  allReactions = ['tick', 'hands_up', 'nerd_face', 'rocket'];

  private unsubscribe$ = new Subject<void>();
  answersLoaded = false;
  reactionsLoaded = false;

  constructor(private threadService: ThreadService, private channelService: ChannelService, private reactionService: ReactionService) {}


  ngOnInit(){
    this.unsubscribe$.next(); 
    this.loadUsers();
    this.subscribeToChannelService();
    this.subscribeToThreadService();
    this.loadMessageAnswers();
    this.loadMessageReactions();
    this.initializeNewReaction();
    this.subscribeToReactionService();
    this.setLastTwoReactions();
  }


  ngOnChanges(changes: SimpleChanges){
    if (changes['message']) {
      this.unsubscribe$.next(); 
      this.messageAnswers = [];
      this.messageReactions = [];
      this.updateSenderData();
      this.loadMessageAnswers(); 
      this.loadMessageReactions();
    }

  }

  
  loadUsers() {
    const usersCollection = collection(this.firestore, 'users');
    this.users$ = collectionData(usersCollection, { idField: 'id' }) as Observable<User[]>;
  
    this.users$.subscribe(users => {
      this.allUsers = users;
      this.updateSenderData(); 
    });
  }
  
  updateSenderData() {
    const completeSenderObject = this.allUsers.find(user => user.id === this.message?.senderId);
    if (completeSenderObject) {
      this.senderData.name = `${completeSenderObject.firstName} ${completeSenderObject.lastName}`;
      this.senderData.avatar = completeSenderObject.avatar;
    } else {
      this.senderData.name = this.message!.senderName;
      this.senderData.avatar = this.message!.senderAvatar;
    }
  }

  setLastTwoReactions(){
    if(this.currentUser?.lastReactions.length === 2){
      this.lastTwoReactions = this.currentUser.lastReactions
    } else if (this.currentUser?.lastReactions.length === 1){
      const firstReaction = this.currentUser.lastReactions[0];
      const secondReaction = this.allReactions.filter(r => r !== firstReaction)[Math.floor(Math.random() * 3)];
      this.lastTwoReactions = [firstReaction, secondReaction];
    } else if (this.currentUser?.lastReactions.length === 0){
      this.lastTwoReactions = ['tick', 'hands_up']
    }

    this.reactionService.setLastTwoReactions(this.lastTwoReactions);
  }


  subscribeToReactionService(){
    this.reactionService.lastTwoReactions$.subscribe((reactions) => {
      this.lastTwoReactions = reactions;
    });
  }



  subscribeToChannelService(){
    this.channelService.activeChannel$.subscribe((channel) => {
      this.activeChannel = channel;
    })
  }

  
  subscribeToThreadService(){
    this.threadService.activeMessage$.subscribe((message) => {
      this.activatedMessage = message;
    })
  }


  loadMessageAnswers(){
    if(this.usedFor === 'channel'){
      const answersCollection = collection(this.firestore, `channels/${this.activeChannel?.id}/messages/${this.message?.id}/answers`);
      this.subscribeToAnswersCollection(answersCollection);
    } else if(this.usedFor === 'dm-chat'){
      const answersCollection = collection(this.firestore, `direct-messages/${this.message?.id}/answers`);
      this.subscribeToAnswersCollection(answersCollection);
    } 
    setTimeout(() => {
      this.answersLoaded = true;
    }, 200)
  }


  subscribeToAnswersCollection(answersCollection: CollectionReference<DocumentData>) {
    collectionData(answersCollection, { idField: 'id' })
      .pipe(
        takeUntil(this.unsubscribe$),
        map((documents) =>
          documents.map((doc) => ({
            ...(doc as Message), 
            id: doc['id'],       
          }))
        )
      )
      .subscribe((answers: Message[]) => {
        this.messageAnswers = answers;
        this.getLastAnswerTime();
      });
  }

 


  getLastAnswerTime(){
    if(this.messageAnswers){
      const latestAnswerTime = this.messageAnswers.reduce((latest, answer) => {
        const currentTimestamp = new Date(answer.timeStamp).getTime();
        const latestTimestamp = new Date(latest).getTime();
        return currentTimestamp > latestTimestamp ? answer.timeStamp : latest;
      }, "1970-01-01T00:00:00.000Z");

      this.lastAnswerTime = this.formatMessageTime(latestAnswerTime);
    }
  }


  async loadMessageReactions(){
    this.messageReactions = [];
    if(this.usedFor === 'channel' && this.activeChannel?.id){
      const reactionsCollection = collection(this.firestore, `channels/${this.activeChannel?.id}/messages/${this.message?.id}/reactions`);
      this.subscribeToMessageReactions(reactionsCollection);
    } else if(this.usedFor === 'dm-chat'){
      const reactionsCollection = collection(this.firestore, `direct-messages/${this.message?.id}/reactions`);
      this.subscribeToMessageReactions(reactionsCollection);
    } else if(this.usedFor === 'thread' && this.activeChannel){
      const reactionsCollection = collection(this.firestore, `channels/${this.activeChannel.id}/messages/${this.activatedMessage?.id}/answers/${this.message?.id}/reactions`);
      this.subscribeToMessageReactions(reactionsCollection);
    } else if(this.usedFor === 'thread' && !this.activeChannel){
      const reactionsCollection = collection(this.firestore, `direct-messages/${this.activatedMessage?.id}/answers/${this.message?.id}/reactions`);
      this.subscribeToMessageReactions(reactionsCollection);
    }

    setTimeout(() => {
      this.reactionsLoaded = true
    }, 200)
  }


  subscribeToMessageReactions(reactionsCollection: CollectionReference<DocumentData>) {
    collectionData(reactionsCollection, { idField: 'id' }) 
      .pipe(
        takeUntil(this.unsubscribe$), 
        map((documents) =>
          documents.map((doc) => ({
            ...(doc as Reaction), 
            id: doc['id'], 
          }))
        )
      )
      .subscribe((reactions: Reaction[]) => {
        this.messageReactions = reactions;
        this.sortReactionTypes(); 
      });
  }


  ngOnDestroy() {
    this.unsubscribe$.next(); 
    this.unsubscribe$.complete();
  }
  

  sortReactionTypes(){
    this.groupedReactions = {};

    this.messageReactions?.forEach((reaction) => {
      const { reactionType } = reaction;
      if (!this.groupedReactions[reactionType]){
        this.groupedReactions[reactionType] = []
      }
      this.groupedReactions[reactionType].push(reaction);
    })
  }

  
  initializeNewReaction(){
    this.reaction = new Reaction();
    this.reaction.originatorName = this.currentUser?.firstName + ' ' + this.currentUser?.lastName;
    this.reaction.originatorId = this.currentUser?.id ?? '';
  }


  formatMessageTime(timeStamp:string){
    const date = new Date(timeStamp);
    const localTime = date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    return localTime;
  }



  showEditMessageBtn(){
    this.editMessageBtnVisible = true;
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;

    if (!this.isHovered) {
      this.editMessageBtnVisible = false;
      this.secondaryEmojiOptionsMenu = false;
      this.mainEmojiOptionsMenu = false;
    }
  }

  editMessage(){
    this.editingMessage = true;
    this.editMessageBtnVisible = false;
  }

  cancelEditing(){
    if(!this.message?.messageText.trim()){
      this.deleteMessage();
    } else {
      this.editingMessage = false;
    }
  }


  updateMessage(){
    if(this.usedFor === 'channel' && this.activeChannel?.id){
      const messageDocRef = doc(this.firestore, `channels/${this.activeChannel?.id}/messages/${this.message?.id}`);
      this.updateMessageDoc(messageDocRef);
    } else if(this.usedFor === 'dm-chat'){
      const messageDocRef = doc(this.firestore, `direct-messages/${this.message?.id}`);
      this.updateMessageDoc(messageDocRef);
    } else if(this.usedFor === 'thread' && this.activeChannel){
      const messageDocRef = doc(this.firestore, `channels/${this.activeChannel.id}/messages/${this.activeMessage?.id}/answers/${this.message?.id}`)
      this.updateMessageDoc(messageDocRef);
    } else if(this.usedFor === 'thread' && !this.activeChannel){
      const messageDocRef = doc(this.firestore, `direct-messages/${this.activeMessage?.id}/answers/${this.message?.id}`);
      this.updateMessageDoc(messageDocRef);
    }
  }


  async updateMessageDoc(messageRef: DocumentReference<DocumentData>){
    try {
      await updateDoc (messageRef, { ... this.message });
      this.editingMessage = false;
    } catch (error) {
      console.error(error);
    }
  }


  deleteMessage(){
    if(this.usedFor === 'channel' && this.activeChannel?.id){
      const messageDocRef = doc(this.firestore, `channels/${this.activeChannel?.id}/messages/${this.message?.id}`);
      this.deleteMessageDoc(messageDocRef);
    } else if(this.usedFor === 'dm-chat'){
      const messageDocRef = doc(this.firestore, `direct-messages/${this.message?.id}`);
      this.deleteMessageDoc(messageDocRef);
    } else if(this.usedFor === 'thread' && this.activeChannel){
      const messageDocRef = doc(this.firestore, `channels/${this.activeChannel.id}/messages/${this.activeMessage?.id}/answers/${this.message?.id}`)
      this.deleteMessageDoc(messageDocRef);
    } else if(this.usedFor === 'thread' && !this.activeChannel){
      const messageDocRef = doc(this.firestore, `direct-messages/${this.activeMessage?.id}/answers/${this.message?.id}`);
      this.deleteMessageDoc(messageDocRef);
    }
  }


async deleteMessageDoc(messageRef: DocumentReference<DocumentData>){
  try {
    await deleteDoc (messageRef);
    this.editingMessage = false;
  } catch (error) {
    console.error(error);
  }
}


  formerReactionOfTheSameTypeExists(type:string){
    return this.groupedReactions[type]?.some((reaction) => reaction.originatorId === this.currentUser?.id) || false;
  }


  async addReaction(type:string){
    if(!this.formerReactionOfTheSameTypeExists(type) && !this.hasJustReacted){
      this.reaction.reactionType = type;
      this.hasJustReacted = true; 

      if(this.usedFor === 'channel'){
        const reactionsCollection = collection(this.firestore, `channels/${this.activeChannel?.id}/messages/${this.message?.id}/reactions`);
        this.addReactionDoc(reactionsCollection);
      } else if(this.usedFor === 'dm-chat'){
        const reactionsCollection = collection(this.firestore, `direct-messages/${this.message?.id}/reactions`);
        this.addReactionDoc(reactionsCollection);
      } else if(this.usedFor === 'thread' && this.activeChannel){
        const reactionsCollection = collection(this.firestore, `channels/${this.activeChannel?.id}/messages/${this.activatedMessage?.id}/answers/${this.message?.id}/reactions`);
        this.addReactionDoc(reactionsCollection);
      } else if(this.usedFor === 'thread' && !this.activeChannel){
        const reactionsCollection = collection(this.firestore, `direct-messages/${this.activatedMessage?.id}/answers/${this.message?.id}/reactions`);
        this.addReactionDoc(reactionsCollection);
      }
    }
    
    this.updateLastTwoReactions(type);
    this.updateCurrentUserReactions();
  }



  updateLastTwoReactions(type: string) {
    if (this.lastTwoReactions.length === 0) {
      this.lastTwoReactions.push(type);
    } else if (this.lastTwoReactions.length === 1) {
      if (this.lastTwoReactions[0] !== type) {
        this.lastTwoReactions.unshift(type);
      }
    } else if (this.lastTwoReactions.length >= 2) {
      if (this.lastTwoReactions[0] !== type) {
        this.lastTwoReactions = [type, this.lastTwoReactions[0]];
      }
    }
    
    this.reactionService.setLastTwoReactions(this.lastTwoReactions);
    this.updateCurrentUserReactions();
  }


  async updateCurrentUserReactions(){
    this.currentUser!.lastReactions = this.lastTwoReactions;
    const userRef = doc(this.firestore, `users/${this.currentUser?.id}`);
    try {
      await updateDoc(userRef, {lastReactions: this.lastTwoReactions})
    } catch (error) {
      console.error(error)
    }
  }


  async addReactionDoc(reactionsCollection: CollectionReference<DocumentData>){
    try {
      await addDoc(reactionsCollection, { ...this.reaction });
      this.initializeNewReaction();

    } catch (error) {
      console.error(error)
    } finally {
      if (this.activeChannel){
        this.resetHasJustReactedBoolean();
      }
    }
  }


  resetHasJustReactedBoolean(){
    setTimeout(() => {
      this.hasJustReacted = false;
    }, 2000);
  }
  

  showMainReactionOptions(){
    this.mainEmojiOptionsMenu = true;
  }

  hideMainEmojiOptions(){
    this.mainEmojiOptionsMenu = false;
  }

  showSecondaryReactionOptions(){
    this.secondaryEmojiOptionsMenu = true;
  }

  hideSecondaryEmojiOptions(){
    this.secondaryEmojiOptionsMenu = false;
  }


  activateThread(message: Message) {
    this.threadService.activateThread(message);
  }
  


}
