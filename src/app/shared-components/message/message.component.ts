import { Component, Input, inject} from '@angular/core';
import { Message } from './../../models/message.class'
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import {  Firestore,  collection,  deleteDoc,  doc,  updateDoc, addDoc, collectionData} from '@angular/fire/firestore';
import { Reaction } from '../../models/reaction.class';
import { Observable } from 'rxjs';



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
  @Input() message!: Message;
  messageClockTimer = '';

  editMessageBtnVisible = false;
  isHovered = false;
  editingMessage = false;

  reaction: Reaction = new Reaction();
  messageReactions?: Reaction[];
  messageReactions$?: Observable<Reaction[]>;
  groupedReactions: { [reactionType: string]: Reaction[] } = {};



  firestore: Firestore = inject(Firestore);


  ngOnInit(){
    this.getMessageReactions();
    this.initializeNewReaction();
  }


  async getMessageReactions(){
    if(this.channelId){
      const reactionsSubcollection = collection(this.firestore, `channels/${this.channelId}/messages/${this.message.id}/reactions`);

      this.messageReactions$ = collectionData(reactionsSubcollection) as Observable<Reaction[]>;

      this.messageReactions$.subscribe((reactions) => {
        this.messageReactions = reactions;
        this.sortReactionTypes();
        console.log(this.groupedReactions);
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
  }


  formatMessageTime(timeStamp:string){
    const time = timeStamp.split('T')[1].split('Z')[0]; 
    const [hours, minutes] = time.split(':'); 
    return `${hours}:${minutes}`;
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
    this.editingMessage = false;
  }


  async updateMessage(){
    if(this.channelId){
      const messageDocRef = doc(this.firestore, `channels/${this.channelId}/messages/${this.message.id}`);

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
      const messageDocRef = doc(this.firestore, `channels/${this.channelId}/messages/${this.message.id}`);

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

  async addReaction(type:string){
    this.reaction.reactionType = type;

    if(this.channelId){
      const messageDocRef = doc(this.firestore, `channels/${this.channelId}/messages/${this.message.id}`);
      const reactionsSubcollection = collection(this.firestore, `${messageDocRef.path}/reactions`);

      try {
        await addDoc(reactionsSubcollection, { ...this.reaction });
        console.log('reaction created:', this.reaction);
        this.initializeNewReaction();
      } catch (error) {
        console.error(error)
      }
    } else if(this.chatId){
      //copy above for chat
    }
    

  }

}
