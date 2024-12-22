import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegistrationDataService {
  private userData: Partial<{ firstName: string; lastName: string; email: string; password: string; avatar: string }> = {};

  setUserData(data: Partial<{ firstName: string; lastName: string; email: string; password: string }>) {
    this.userData = { ...this.userData, ...data };
  }

  setAvatar(avatar: string) {
    this.userData.avatar = avatar;
  }

  getUserData(): Partial<{ firstName: string; lastName: string; email: string; password: string; avatar: string }> {
    return this.userData;
  }

  getUserName() {
    return this.userData.firstName + "" + this.userData.lastName;
  }

  clearUserData() {
    this.userData = {};
  }
}
