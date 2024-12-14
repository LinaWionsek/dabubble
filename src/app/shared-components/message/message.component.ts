import { Component, Input, inject} from '@angular/core';
import { Message } from './../../models/message.class'
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import {  Firestore,  collection,  deleteDoc,  doc,  updateDoc, addDoc, collectionData} from '@angular/fire/firestore';
import { Reaction } from '../../models/reaction.class';
import { Observable } from 'rxjs';
import { ThreadService } from '../../services/thread.service';



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
  @Input() currentUser!: User | null;
  @Input() message!: Message | null;
  messageClockTimer = '';

  editMessageBtnVisible = false;
  isHovered = false;
  editingMessage = false;

  reaction: Reaction = new Reaction();
  messageReactions?: Reaction[];
  messageReactions$?: Observable<Reaction[]>;
  groupedReactions: { [reactionType: string]: Reaction[] } = {};
  hasJustReacted = false;

  firestore: Firestore = inject(Firestore);

  mainEmojiOptionsMenu = false;
  secondaryEmojiOptionsMenu = false;


  constructor(private threadService: ThreadService) {}


  ngOnInit(){
    this.getMessageReactions();
    this.initializeNewReaction();
  }


  async getMessageReactions(){
    if(this.channelId){
      const reactionsSubcollection = collection(this.firestore, `channels/${this.channelId}/messages/${this.message?.id}/reactions`);

      this.messageReactions$ = collectionData(reactionsSubcollection) as Observable<Reaction[]>;

      this.messageReactions$.subscribe((reactions) => {
        this.messageReactions = reactions;
        this.sortReactionTypes();
      })
    } else if(this.chatId){
      //copy above for chat
    }

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

    // const time = timeStamp.split('T')[1].split('Z')[0]; 
    // const [hours, minutes] = time.split(':'); 
    // return `${hours}:${minutes}`;
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


  async updateMessage(){
    if(this.channelId){
      const messageDocRef = doc(this.firestore, `channels/${this.channelId}/messages/${this.message?.id}`);

      try {
        await updateDoc (messageDocRef, { ... this.message });
        this.editingMessage = false;
      } catch (error) {
        console.error(error);
      }
    } else if(this.chatId){
      //copy above for chat
    }
  }


  async deleteMessage(){
    if(this.channelId){
      const messageDocRef = doc(this.firestore, `channels/${this.channelId}/messages/${this.message?.id}`);

      try {
        await deleteDoc (messageDocRef);
        this.editingMessage = false;
      } catch (error) {
        console.error(error);
      }
    } else if(this.chatId){
      //copy above for chat
    }
  }


  formerReactionOfTheSameTypeExists(type:string){
    return this.groupedReactions[type]?.some((reaction) => reaction.originatorId === this.currentUser?.id) || false;
  }


  async addReaction(type:string){
    if(!this.formerReactionOfTheSameTypeExists(type) && !this.hasJustReacted){
      this.reaction.reactionType = type;
      this.hasJustReacted = true; 

      if(this.channelId){
        const messageDocRef = doc(this.firestore, `channels/${this.channelId}/messages/${this.message?.id}`);
        const reactionsSubcollection = collection(this.firestore, `${messageDocRef.path}/reactions`);
  
        try {
          await addDoc(reactionsSubcollection, { ...this.reaction });
          this.initializeNewReaction();
        } catch (error) {
          console.error(error)
        } finally {
          setTimeout(() => {
            this.hasJustReacted = false;
          }, 2000);
        }
      } else if(this.chatId){
        //copy above for chat
      }

    }

    
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
