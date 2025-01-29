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
  query,
  where,
  documentId,
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
  dms$!: Observable<Message[]>;
  allDirectMessages: Message[] = [];
  userDirectMessages: Message[] = [];
  searchedPrivateMessages: Message[] = [];
  receiverUser: User | null = null;
  threadMessages: Message[] = [];
  threadResults: Message[] = [];

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

  subscribeToWorkspaceService() {
    this.workspaceService.workspaceActivated$.subscribe((activated) => {
      this.isWorkspaceActivated = activated;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateScreenSize();
  }

  updateScreenSize() {
    this.isSmallerScreen = window.innerWidth <= 900;
  }

  activateWorkspace() {
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
    this.getAllPrivateMessages();
    this.getAllChannels();
  }

  resetSearch() {
    this.searchResults = [];
    this.searchedUsers = [];
    this.searchedPrivateMessages = [];
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

  getAllPrivateMessages() {
    const userId = this.user?.id;
    const messagesRef = collection(this.firestore, 'direct-messages');
    this.dms$ = collectionData(messagesRef, {
      idField: 'id',
    }) as Observable<Message[]>;
    this.dms$.subscribe((changes) => {
      this.allDirectMessages = Array.from(
        new Map(
          changes.map((directMessage) => [directMessage.id, directMessage])
        ).values()
      );
      this.userDirectMessages = this.allDirectMessages.filter(
        (message) =>
          message.senderId === userId || message.receiverId === userId
      );
      this.searchedPrivateMessages = this.userDirectMessages.filter((message) =>
        message.messageText
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    });
  }

  openDirectMessage(senderId: string, receiverId: string) {
    if (senderId === this.user?.id) {
      this.receiverUser =
        this.users.find((user) => user.id === receiverId) ?? null;
      this.setActiveChat(this.receiverUser as User);
      this.resetSearch();
    } else {
      this.receiverUser =
        this.users.find((user) => user.id === senderId) ?? null;
      this.setActiveChat(this.receiverUser as User);
      this.resetSearch();
    }
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
    await this.fetchMessagesForThreads();
    this.filterThreadResults();
  }

  getUserChannels() {
    if (this.user && this.user.id) {
      this.allUserChannels = this.allChannels.filter((channel) =>
        channel.userIds.includes(this.user!.id)
      );
    }
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

  async fetchMessagesForThreads() {
    const threadsMap = new Map<string, Message>();
    for (const message of this.allMessages) {
      const refference = collection(
        this.firestore,
        `channels/${message.channel.id}/messages/${message.id}/answers`
      );
     
      const snapshot = await getDocs(refference);
      const answers = snapshot.docs.map((doc) => ({
        ...(doc.data() as Message),
        id: doc.id,
        channel: message.channel,
        referenceMessageId: message.id,
      }));
      answers.forEach((answer) => threadsMap.set(answer.id, answer));
      this.threadMessages = Array.from(threadsMap.values());
    }
  }

  filterThreadResults() {
    this.threadResults = this.threadMessages.filter((message) =>
      message.messageText.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  async openThread(result: any) {
    const messagesRef = collection(
      this.firestore,
      `channels/${result.channel.id}/messages/`
    );

    const snapshot = await getDocs(messagesRef);
    const message = snapshot.docs.find((doc) => doc.id === result.referenceMessageId);

    if (message) {
      const messageData = {
        ...(message.data() as Message),
        id: message.id,
        channel: result.channel,
      };
      this.activateThread(messageData);
    }

  //channels -> channelid -> messages -> messageid
  }

  closeThread(){
    this.threadService.deactivateThread();
  }

  activateThread(message: Message) {
    this.threadService.activateThread(message);
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
