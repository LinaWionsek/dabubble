import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Channel } from '../models/channel.class';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private activeChannelSubject = new BehaviorSubject<Channel | null>(null);
  activeChannel$ = this.activeChannelSubject.asObservable();

  setActiveChannel(channel: Channel) {
    this.activeChannelSubject.next(channel);
  }

  clearActiveChannel() {
    this.activeChannelSubject.next(null);
  }

  getActiveChannel(){
    return this.activeChannelSubject.value;
  }
}
