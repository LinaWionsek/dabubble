import { Component, Input, inject} from '@angular/core';
import { Message } from './../../models/message.class'
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import {  Firestore,  collection,  deleteDoc,  doc,  updateDoc, addDoc, collectionData, DocumentReference, CollectionReference, DocumentData} from '@angular/fire/firestore';
import { Reaction } from '../../models/reaction.class';
import { Observable } from 'rxjs';
import { ThreadService } from '../../services/thread.service';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../models/channel.class';



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
  

  reaction: Reaction = new Reaction();
  messageReactions?: Reaction[];
  messageReactions$?: Observable<Reaction[]>;
  groupedReactions: { [reactionType: string]: Reaction[] } = {};
  hasJustReacted = false;

  firestore: Firestore = inject(Firestore);

  mainEmojiOptionsMenu = false;
  secondaryEmojiOptionsMenu = false;


  constructor(private threadService: ThreadService, private channelService: ChannelService) {}


  ngOnInit(){
    this.subscribeToChannelService();
    this.loadMessageAnswers();
    this.loadMessageReactions();
    this.initializeNewReaction();
  }


  subscribeToChannelService(){
    this.channelService.activeChannel$.subscribe((channel) => {
      this.activeChannel = channel;
    })
  }


  loadMessageAnswers(){
    if(this.usedFor === 'channel'){
      const answersCollection = collection(this.firestore, `channels/${this.channelId}/messages/${this.message?.id}/answers`);
      this.subscribeToAnswersCollection(answersCollection);
    } else if(this.usedFor === 'chat'){
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

    this.messageReactions$.subscribe((reactions) => {
      this.messageReactions = reactions;
      this.sortReactionTypes();
    })
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
      const messageDocRef = doc(this.firestore, `channels/${this.channelId}/messages/${this.activeMessage?.id}/answers/${this.message?.id}`)
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
      const messageDocRef = doc(this.firestore, `channels/${this.channelId}/messages/${this.activeMessage?.id}/answers/${this.message?.id}`)
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
  }


  async addReactionDoc(reactionsCollection: CollectionReference<DocumentData>){
    try {
      await addDoc(reactionsCollection, { ...this.reaction });
      this.initializeNewReaction();
    } catch (error) {
      console.error(error)
    } finally {
      setTimeout(() => {
        this.hasJustReacted = false;
      }, 2000);
    }
  }



  addReactionForDmMessage(){
    const reactionsCollection = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.message?.id}/reactions`);
    const reactionsCollection2 = collection(this.firestore, `users/${this.otherUser?.id}/dm-chats/${this.currentUser?.id}/messages/${this.message?.id}/reactions`);
    this.addReactionDoc(reactionsCollection);
    this.addReactionDoc(reactionsCollection2);
  }

  addReactionForDmThreadMessage(){
    const reactionsCollection = collection(this.firestore, `users/${this.currentUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.message?.id}/reactions`);
    const reactionsCollection2 = collection(this.firestore, `users/${this.otherUser?.id}/dm-chats/${this.otherUser?.id}/messages/${this.message?.id}/reactions`);
    this.addReactionDoc(reactionsCollection);
    this.addReactionDoc(reactionsCollection2);
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
