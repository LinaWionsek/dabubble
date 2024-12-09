import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private activeChannelSource = new BehaviorSubject<string | null>(null);
  activeChannel$ = this.activeChannelSource.asObservable();

  setActiveChannel(channelId: string) {
    console.log('setActiveChannel called with:', channelId);
    this.activeChannelSource.next(channelId);
  }
}
