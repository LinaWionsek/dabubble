import { Component, HostListener, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.class';
import { Observable } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  getDocs,
} from '@angular/fire/firestore';
import { AuthService } from '../../services/authentication.service';
import { HeaderUserDialogComponent } from './header-user-dialog/header-user-dialog.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { Channel } from './../../models/channel.class';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/dm-chat.service';
import { Message } from '../../models/message.class';
import { ThreadService } from '../../services/thread.service';
import { WorkspaceService } from '../../services/workspace.service';
import { UserService } from '../../services/user.service';

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
  @Input() usedFor: string = '';

  showRegistrationLink: boolean = false;
  firestore: Firestore = inject(Firestore);
  allUsers$!: Observable<User[]>;
  users: User[] = [];
  showSearchBar: boolean = false;
  showUserProfile: boolean = false;
  user: User | null = null;
  isUserMenuOpen: boolean = false;
  isUserProfileOpen: boolean = false;
  searching: boolean = false;
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
  showDropDown: boolean = false;
  isSmallerScreen = window.innerWidth <= 900;
  isWorkspaceActivated = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private channelService: ChannelService,
    private chatService: ChatService,
    private threadService: ThreadService,
    private workspaceService: WorkspaceService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.subscribeToWorkspaceService();
    this.updateScreenSize();
    

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

    this.userService.user$.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });

  }


  subscribeToWorkspaceService(){
    this.workspaceService.workspaceActivated$.subscribe((activated) => {
        this.isWorkspaceActivated = activated;
      }
    );
  }

  @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
    this.updateScreenSize();
  }


  updateScreenSize(){
    this.isSmallerScreen = window.innerWidth <= 900;
  }

  activateWorkspace(){
    this.workspaceService.activateWorkspace();
  }


  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  setActiveChat(user: User) {
    this.channelService.clearActiveChannel();
    this.threadService.deactivateThread();
    this.chatService.setActiveChat(user);
    this.resetSearch();
  }

  setActiveChannel(channel: Channel) {
    this.channelService.setActiveChannel(channel);
    this.resetSearch();
  }

  searchDevspace() {
    if (!this.searchTerm || this.searchTerm.trim().length === 0) {
      this.resetSearch();
      return;
    }
    this.showDropDown = true;
    this.searching = true;
    this.searchUser();
    this.getAllChannels();
  }

  resetSearch() {
    this.searchResults = [];
    this.searchedUsers = [];
    this.showDropDown = false;
    this.searching = false;
    this.searchTerm = '';
  }

  searchUser() {
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

  async getAllChannelsForCurrentUser() {
    this.getUserChannels();
    await this.fetchMessagesForChannels();
    this.filterSearchResults();
  }

  getUserChannels() {
    this.allUserChannels = this.allChannels.filter((channel) =>
      channel.userIds.includes(this.user!.id)
    );
  }

  async fetchMessagesForChannels() {
    const messagesMap = new Map<string, Message>();
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
      messages.forEach((message) => messagesMap.set(message.id, message));
    }
    this.allMessages = Array.from(messagesMap.values());
  }

  filterSearchResults() {
    this.searchResults = this.allMessages.filter((message) =>
      message.messageText.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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
