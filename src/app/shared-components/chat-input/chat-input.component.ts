import { Component, Input, SimpleChanges } from '@angular/core';
import { Channel } from './../../models/channel.class'

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @Input() channelData!: Channel | undefined;
  @Input() usedFor = '';

  sendMessagesTo: string  = '';


  ngOnChanges(changes: SimpleChanges){
    if (changes['channelData'] && changes['channelData'].currentValue) {
      this.checkInputUsecase();
    }
  }


  checkInputUsecase(){
    if(this.usedFor === 'channel'){
      this.sendMessagesTo = this.channelData?.name ?? '';
    } else if (this.usedFor === 'directMessage') {
      // send messages to contact
    }
  }

}
