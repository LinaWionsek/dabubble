import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<{ message: string; }>();
  toast$ = this.toastSubject.asObservable(); // Observable stream that toast components can subscribe to

  /**
   * Triggers a new toast message.
   * @param message - The message to display in the toast
   */
  showToast(message: string) {
    this.toastSubject.next({ message });
  }
}
