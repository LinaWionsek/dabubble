import { Component, Input, inject, SimpleChanges } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { SeperatorComponent } from '../seperator/seperator.component';
import { Channel } from '../../models/channel.class';
import { Firestore, doc, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../../models/message.class';


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

  channelMessages$!: Observable<Message[]>;
  allChannelMessages: Message[] = [];


  firestore: Firestore = inject(Firestore);


  ngOnChanges(changes: SimpleChanges){
    if (changes['channelData'] && changes['channelData'].currentValue && this.usedFor ==='channel') {
      this.getChannelMessages();
    }
  }


  async getChannelMessages(){
    const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);
    const channelMessagesSubcollection = collection(channelDocRef, 'messages');

    this.channelMessages$ = collectionData(channelMessagesSubcollection, { idField: 'id'}) as Observable<Message[]>;

    this.channelMessages$.subscribe((changes) => {
      this.allChannelMessages = changes;
      console.log(this.allChannelMessages);
    })
  }
}
