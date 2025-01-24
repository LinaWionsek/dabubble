import { Component, Input, inject} from '@angular/core';
import { Message } from './../../models/message.class'
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import {  Firestore,  collection,  deleteDoc,  doc,  updateDoc, addDoc, collectionData, DocumentReference, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { Reaction } from '../../models/reaction.class';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

  constructor(private threadService: ThreadService, private channelService: ChannelService, private reactionService: ReactionService) {}


  ngOnInit(){
    this.subscribeToChannelService();
    this.subscribeToThreadService();
    this.loadMessageAnswers();
    this.loadMessageReactions();
    this.initializeNewReaction();
    this.subscribeToReactionService();
    this.setLastTwoReactions();
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
      const answersCollection = collection(this.firestore, `channels/${this.channelId}/messages/${this.message?.id}/answers`);
      this.subscribeToAnswersCollection(answersCollection);
    } else if(this.usedFor === 'dm-chat'){
      const answersCollection = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.message?.id}/answers`);
      this.subscribeToAnswersCollection(answersCollection);
    } 
  }


  subscribeToAnswersCollection(answersCollection: CollectionReference<DocumentData>){
    this.messageAnswers$ = collectionData(answersCollection, { idField: 'id'}) as Observable<Message[]>;

    this.messageAnswers$.subscribe((answers) => {
      this.messageAnswers = answers;
      this.getLastAnswerTime();
    })
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
    if(this.usedFor === 'channel' && this.channelId){
      const reactionsCollection = collection(this.firestore, `channels/${this.channelId}/messages/${this.message?.id}/reactions`);
      this.subscribeToMessageReactions(reactionsCollection);
    } else if(this.usedFor === 'dm-chat'){
      const reactionsCollection = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.message?.id}/reactions`);
      this.subscribeToMessageReactions(reactionsCollection);
    } else if(this.usedFor === 'thread' && this.activeChannel){
      const reactionsCollection = collection(this.firestore, `channels/${this.channelId}/messages/${this.activeMessage?.id}/answers/${this.message?.id}/reactions`);
      this.subscribeToMessageReactions(reactionsCollection);
    } else if(this.usedFor === 'thread' && !this.activeChannel){
      const reactionsCollection = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.message?.id}/reactions`);
      this.subscribeToMessageReactions(reactionsCollection);
    }
  }


  subscribeToMessageReactions(reactionsCollection: CollectionReference<DocumentData>){
    this.messageReactions$ = collectionData(reactionsCollection) as Observable<Reaction[]>;

    this.messageReactions$.pipe(takeUntil(this.unsubscribe$)).subscribe((reactions) => {
      this.messageReactions = reactions;
      this.sortReactionTypes();
    })
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
    if(this.usedFor === 'channel' && this.channelId){
      const messageDocRef = doc(this.firestore, `channels/${this.channelId}/messages/${this.message?.id}`);
      this.updateMessageDoc(messageDocRef);
    } else if(this.usedFor === 'dm-chat'){
      this.updateDmChatMessage();
    } else if(this.usedFor === 'thread' && this.activeChannel){
      const messageDocRef = doc(this.firestore, `channels/${this.activeChannel.id}/messages/${this.activeMessage?.id}/answers/${this.message?.id}`)
      this.updateMessageDoc(messageDocRef);
    } else if(this.usedFor === 'thread' && !this.activeChannel){
      this.updateDmThreadMesssage();
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


  updateDmChatMessage(){
    const messageDocRef = doc(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.message?.id}`);
    const messageDocRef2 = doc(this.firestore, `users/${this.otherUser?.id}/dm-chats/${this.currentUser?.id}/messages/${this.message?.id}`);
    this.updateMessageDoc(messageDocRef);
    this.updateMessageDoc(messageDocRef2);
  }


  updateDmThreadMesssage(){
    const messageDocRef = doc(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.activeMessage?.id}/${this.message?.id}`);
    const messageDocRef2 = doc(this.firestore, `users/${this.otherUser?.id}/dm-chats/${this.currentUser?.id}/messages/${this.activeMessage?.id}/${this.message?.id}`);
    this.updateMessageDoc(messageDocRef);
    this.updateMessageDoc(messageDocRef2);
  }


  deleteMessage(){
    if(this.usedFor === 'channel' && this.channelId){
      const messageDocRef = doc(this.firestore, `channels/${this.channelId}/messages/${this.message?.id}`);
      this.deleteMessageDoc(messageDocRef);
    } else if(this.usedFor === 'dm-chat'){
      this.deleteDmChatMessage();
    } else if(this.usedFor === 'thread' && this.activeChannel){
      const messageDocRef = doc(this.firestore, `channels/${this.activeChannel.id}/messages/${this.activeMessage?.id}/answers/${this.message?.id}`)
      this.deleteMessageDoc(messageDocRef);
    } else if(this.usedFor === 'thread' && !this.activeChannel){
      this.deleteDmThreadMessage();
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


deleteDmChatMessage(){
  const messageDocRef = doc(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.message?.id}`);
  const messageDocRef2 = doc(this.firestore, `users/${this.otherUser?.id}/dm-chats/${this.currentUser?.id}/messages/${this.message?.id}`);
  this.deleteMessageDoc(messageDocRef);
  this.deleteMessageDoc(messageDocRef2);
}


deleteDmThreadMessage(){
  const messageDocRef = doc(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.activeMessage?.id}/${this.message?.id}`);
  const messageDocRef2 = doc(this.firestore, `users/${this.otherUser?.id}/dm-chats/${this.currentUser?.id}/messages/${this.activeMessage?.id}/${this.message?.id}`);
  this.deleteMessageDoc(messageDocRef);
  this.deleteMessageDoc(messageDocRef2);
}


  formerReactionOfTheSameTypeExists(type:string){
    return this.groupedReactions[type]?.some((reaction) => reaction.originatorId === this.currentUser?.id) || false;
  }


  async addReaction(type:string){
    if(!this.formerReactionOfTheSameTypeExists(type) && !this.hasJustReacted){
      this.reaction.reactionType = type;
      this.hasJustReacted = true; 

      if(this.usedFor === 'channel'){
        const reactionsCollection = collection(this.firestore, `channels/${this.channelId}/messages/${this.message?.id}/reactions`);
        this.addReactionDoc(reactionsCollection);
      } else if(this.usedFor === 'dm-chat'){
        this.addReactionForDmMessage();
      } else if(this.usedFor === 'thread' && this.activeChannel){
        const reactionsCollection = collection(this.firestore, `channels/${this.channelId}/messages/${this.activeMessage?.id}/answers/${this.message?.id}/reactions`);
        this.addReactionDoc(reactionsCollection);
      } else if(this.usedFor === 'thread' && !this.activeChannel){
        this.addReactionForDmThreadMessage();
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

  async addReactionDocWithoutInitNewReaction(reactionsCollection: CollectionReference<DocumentData>){
    try {
      await addDoc(reactionsCollection, { ...this.reaction });

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


  async addReactionForDmMessage(){
    const reactionsCollection = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.message?.id}/reactions`);
    const reactionsCollection2 = collection(this.firestore, `users/${this.otherUser?.id}/dm-chats/${this.currentUser?.id}/messages/${this.message?.id}/reactions`);

    await this.addReactionDocWithoutInitNewReaction(reactionsCollection);
    await this.addReactionDoc(reactionsCollection2);
    this.resetHasJustReactedBoolean();
  }


  async addReactionForDmThreadMessage(){
    const reactionsCollection = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.message?.id}/reactions`);
    const reactionsCollection2 = collection(this.firestore, `users/${this.otherUser?.id}/dm-chats/${this.currentUser?.id}/messages/${this.message?.id}/reactions`);
    await this.addReactionDocWithoutInitNewReaction(reactionsCollection);
    await this.addReactionDoc(reactionsCollection2);
    this.resetHasJustReactedBoolean();
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
