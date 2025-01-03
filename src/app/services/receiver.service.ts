import { Injectable } from '@angular/core';
import { Channel } from '../models/channel.class';
import { User } from '../models/user.class';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ReceiverService {

  private receiverSubject = new BehaviorSubject<Channel | User | null>(null);
  activeReceiver$ = this.receiverSubject.asObservable();

  constructor() {}


  setReceiver(receiver: Channel | User) {
    this.receiverSubject.next(receiver);
  }


  getReceiver(): Channel | User | null {
    return this.receiverSubject.value;
  }


  isChannel(): boolean {
    const receiver = this.receiverSubject.value;
    return receiver ? 'creator' in receiver : false;
  }


  isUser(): boolean {
    const receiver = this.receiverSubject.value;
    return receiver ? 'email' in receiver : false;
  }

  resetReceiver() {
    this.receiverSubject.next(null);
  }

}
