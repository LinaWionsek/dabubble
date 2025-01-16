import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegistrationDataService {
  private userData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatar: string;
  }> = {};

  setUserData(
    data: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }>
  ) {
    this.userData = { ...this.userData, ...data };
  }

  setAvatar(avatar: string) {
    this.userData.avatar = avatar;
  }

  getUserData(): Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatar: string;
  }> {
    return this.userData;
  }

  formatWord(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  formatUserName(firstName?: string, lastName?: string): string {
    let formattedFirstName = firstName ? this.formatWord(firstName) : '';
    let formattedLastName = lastName ? this.formatWord(lastName) : '';
    return `${formattedFirstName} ${formattedLastName}`
      .trim()
      .replace(/\s+/g, ' ');
  }

  getUserName(): string {
    return this.formatUserName(this.userData.firstName, this.userData.lastName);
  }

  clearUserData() {
    this.userData = {};
  }
}
