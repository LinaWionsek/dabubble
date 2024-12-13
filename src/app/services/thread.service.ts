import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../models/message.class';

@Injectable({
  providedIn: 'root'
}) 
export class ThreadService{
    private threadActivatedSubject = new BehaviorSubject<boolean>(false);
    threadActivated$ = this.threadActivatedSubject.asObservable();

    private activeMessageSubject = new BehaviorSubject<Message | null>(null);
    activeMessage$ = this.activeMessageSubject.asObservable();


    activateThread(message:Message) {
        this.threadActivatedSubject.next(true);
        this.activeMessageSubject.next(message);
    }


    deactivateThread() {
        this.threadActivatedSubject.next(false);
        this.activeMessageSubject.next(null);
    }


}