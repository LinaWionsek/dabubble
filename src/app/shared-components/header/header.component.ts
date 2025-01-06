import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { User } from '../../models/user.class';
import { Observable } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  query,
  collectionGroup,
  getDocs,
  where,
} from '@angular/fire/firestore';
import { AuthService } from '../../services/authentication.service';
import { HeaderUserDialogComponent } from './header-user-dialog/header-user-dialog.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { Channel } from './../../models/channel.class';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/dm-chat.service';
import { Message } from '../../models/message.class';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    HeaderUserDialogComponent,
    UserProfileComponent,
    FormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  showRegistrationLink: boolean = false;
  firestore: Firestore = inject(Firestore);
  allUsers$!: Observable<User[]>;
  users: User[] = [];
  showSearchBar: boolean = false;
  showUserProfile: boolean = false;
  user: User | null = null;
  isUserMenuOpen: boolean = false;
  isUserProfileOpen: boolean = false;
  selectedUserId: string | null = null;
  private authSubscription: Subscription | null = null;
  searchTerm = '';
  searchedUsers: User[] = [];
  channels$!: Observable<Channel[]>;
  allChannels: Channel[] = [];
  allUserChannels: Channel[] = [];
  messages$!: Observable<Message[]>;
  allMessages: Message[] = [];
  searchResults: Message[] = [];
  showMessagesDropdown: boolean = true;
  showUsersDropdown: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private channelService: ChannelService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.showSearchBar = false;
    this.showUserProfile = false;
    this.showRegistrationLink = false;

    this.updateHeaderOnRoute(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateHeaderOnRoute(event.urlAfterRedirects);
      }
    });

    this.authSubscription = this.authService.getUserStatus().subscribe(
      (user) => {
        this.user = user;
      },
      (error) => console.error('Fehler beim Überwachen des Auth-Status:', error)
    );
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  searchDevspace() {
    this.searchUser();
    this.getAllChannels();
    this.searchChannels();
  }

  searchUser() {
    console.log(this.searchTerm);
    const userCollection = collection(this.firestore, 'users');
    this.allUsers$ = collectionData(userCollection, {
      idField: 'id',
    }) as Observable<User[]>;

    this.allUsers$.subscribe((changes) => {
      this.users = changes;
      this.searchedUsers = this.users.filter(
        (filterResult) =>
          filterResult.firstName
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          filterResult.lastName
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    });
  }

  setActiveChat(user: User) {
    this.chatService.setActiveChat(user);
    this.showUsersDropdown = false;
    //TODO: input feld clearen
  }

  getAllChannels() {
    const userChannelsCollection = collection(this.firestore, 'channels');
    this.channels$ = collectionData(userChannelsCollection, {
      idField: 'id',
    }) as Observable<Channel[]>;

    this.channels$.subscribe((changes) => {
      this.allChannels = Array.from(
        new Map(changes.map((channel) => [channel.id, channel])).values()
      );

      this.getAllChannelsForCurrentUser();
    });
  }

  //Holt alle Channel und Nachrichten
  async getAllChannelsForCurrentUser() {
    this.allUserChannels = this.allChannels.filter((channel) =>
      channel.userIds.includes(this.user!.id)
    );

    this.allMessages = [];

    for (const channel of this.allUserChannels) {
      const channelMessagesRef = collection(
        this.firestore,
        `channels/${channel.id}/messages`
      );
      const snapshot = await getDocs(channelMessagesRef);
      const messages = snapshot.docs.map((doc) => ({
        ...(doc.data() as Message),
        id: doc.id,
        channel: channel,
      }));
      this.allMessages.push(...messages);
    }
  }

  //Sucht dann nach Nachrichten die den Suchbegriff enthalten
  searchChannels() {
    let results = this.allMessages.filter((message) =>
      message.messageText.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.searchResults = results;
    console.log('results', this.searchResults);
    if (this.searchResults.length > 0 && this.searchResults[0].channel) {
      console.log(this.searchResults);
      // this.setActiveChannel(searchResults[0].channel);
    }
  }

showChannelName(channel: Channel) {
  // id vom channel abrufen welcher name
}

  setActiveChannel(channel: Channel) {
    console.log('Setze aktiven Channel:', channel);
    this.channelService.setActiveChannel(channel);
  }

  updateHeaderOnRoute(url: string) {
    if (url.includes('login')) {
      this.showRegistrationLink = true;
    }
    if (url.includes('registration')) {
      this.showRegistrationLink = false;
    }
    if (url.includes('main')) {
      this.showSearchBar = true;
      this.showUserProfile = true;
    }
    if (url.includes('imprint') || url.includes('privacy-policy')) {
      this.showSearchBar = false;
      this.showUserProfile = false;
      this.showRegistrationLink = false;
    }
  }

  getAvatarBaseName(avatarPath: string | undefined): string {
    if (!avatarPath) {
      return './../../../assets/img/avatar_empty.png';
    }
    return avatarPath.replace('_large', '');
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  openUserProfile(userId: string) {
    this.selectedUserId = userId;
    this.isUserProfileOpen = true;
  }

  closeUserProfile() {
    this.isUserProfileOpen = false;
    this.selectedUserId = null;
  }

  closeDialogs() {
    this.isUserMenuOpen = false;
    this.isUserProfileOpen = false;
  }
}
