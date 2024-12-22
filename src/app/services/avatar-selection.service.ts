import { Injectable } from '@angular/core';

export interface Avatar {
  name: string;
  thumb: string;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class AvatarSelectionService {
  private selectedAvatar: string = 'assets/img/avatar_empty.png';

  private avatars = [
    {
      name: 'avatar_1',
      thumb: 'assets/img/avatar_1.png',
      image: 'assets/img/avatar_1_large.png',
    },
    {
      name: 'avatar_2',
      thumb: 'assets/img/avatar_2.png',
      image: 'assets/img/avatar_2_large.png',
    },
    {
      name: 'avatar_3',
      thumb: 'assets/img/avatar_3.png',
      image: 'assets/img/avatar_3_large.png',
    },
    {
      name: 'avatar_4',
      thumb: 'assets/img/avatar_4.png',
      image: 'assets/img/avatar_4_large.png',
    },
    {
      name: 'avatar_5',
      thumb: 'assets/img/avatar_5.png',
      image: 'assets/img/avatar_5_large.png',
    },
    {
      name: 'avatar_6',
      thumb: 'assets/img/avatar_6.png',
      image: 'assets/img/avatar_6_large.png',
    },
  ];

  constructor() {}

  getAvatars() {
    return this.avatars;
  }

  getSelectedAvatar() {
    return this.selectedAvatar;
  }

  setSelectedAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }

  isAvatarSelected(): boolean {
    return this.selectedAvatar !== 'assets/img/avatar_empty.png';
  }
}
