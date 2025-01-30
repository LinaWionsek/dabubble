import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WelcomeService {
  private storageKey = 'welcomedUserIds';

  constructor() {}

  isUserWelcomed(userId: string): boolean {
    const welcomedUserIds = this.getWelcomedUserIds();
    return welcomedUserIds.includes(userId); 
  }

  addUserToWelcomed(userId: string): void {
    const welcomedUserIds = this.getWelcomedUserIds();
    if (!welcomedUserIds.includes(userId)) {
      welcomedUserIds.push(userId);
      this.saveWelcomedUserIds(welcomedUserIds);
    }
  }

  private getWelcomedUserIds(): string[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveWelcomedUserIds(welcomedUserIds: string[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(welcomedUserIds));
  }
}
