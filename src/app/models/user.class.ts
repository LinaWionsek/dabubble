import { userData } from '../types/types';

export class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pendingEmail: string;
  avatar: string;
  isOnline: boolean;
  lastReactions: string[];

  

  constructor(data?: userData) {
    this.id = data?.id ?? '';
    this.firstName = data?.firstName ?? '';
    this.lastName = data?.lastName ?? '';
    this.email = data?.email ?? '';
    this.pendingEmail = data?.pendingEmail ?? '';
    this.avatar = data?.avatar ?? '';
    this.isOnline = data?.isOnline ?? false;
    this.lastReactions = data?.lastReactions ?? [];
  }

  toPlainObject() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      avatar: this.avatar,
      isOnline: this.isOnline,
      
    };
  }
}
