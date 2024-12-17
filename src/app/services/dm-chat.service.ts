import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private activeUserSubject = new BehaviorSubject<User | null>(null);
  activeUserChat$ = this.activeUserSubject.asObservable();

  setActiveChat(user: User) {
    this.activeUserSubject.next(user);
  }

  clearActiveChat() {
    this.activeUserSubject.next(null);
  }

  getActiveChat(){
    return this.activeUserSubject.value;
  }
}
