import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})

export class ReactionService {
  private lastTwoReactionsSubject = new BehaviorSubject<string[]>([]); 
  lastTwoReactions$ = this.lastTwoReactionsSubject.asObservable();


//   updateLastTwoReactions(type: string) {
//     const currentReactions = this.lastTwoReactionsSubject.value;

//     if (currentReactions.length === 0) {
//       this.lastTwoReactionsSubject.next([type]);
//     } else if (currentReactions.length === 1) {
//       if (currentReactions[0] !== type) {
//         this.lastTwoReactionsSubject.next([type, currentReactions[0]]);
//       }
//     } else if (currentReactions.length >= 2) {
//       if (currentReactions[0] !== type) {
//         this.lastTwoReactionsSubject.next([type, currentReactions[0]]);
//       }
//     }
//   }

  setLastTwoReactions(reactions: string[]) {
    this.lastTwoReactionsSubject.next(reactions);
  }
}
