import { Injectable } from '@angular/core';
import { Channel } from '../models/channel.class';
import { User } from '../models/user.class';
import { BehaviorSubject, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ReceiverService {
  private receiverSubject = new BehaviorSubject<Channel | User | null>(null);
  activeReceiver$ = this.receiverSubject.asObservable();

  private invalidReceiverSource = new Subject<boolean>();
  invalidReceiver$ = this.invalidReceiverSource.asObservable();



  constructor() {}


  setReceiver(receiver: Channel | User) {
    this.receiverSubject.next(receiver);
    this.setValidReceiver();
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
    this.setInvalidReceiver();
  }


  setInvalidReceiver(){
    this.invalidReceiverSource.next(true);
  }


  setValidReceiver() {
    this.invalidReceiverSource.next(false);
  }

}
